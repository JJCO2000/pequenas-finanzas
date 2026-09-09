import type { SQLiteDatabase } from 'expo-sqlite';
import {
  calendarDayDiff,
  getDailyChallengeGameId,
  localDateKey,
  shiftDateKey,
  type StreakQualification,
  type StreakSnapshot,
} from '@/core/progression/streak';
import { now } from './repositorySupport';

type StreakRow = {
  profile_id: string;
  current_streak: number;
  best_streak: number;
  last_qualified_date: string | null;
  freezes_available: number;
  last_freeze_award_streak: number;
  updated_at: string;
};

async function ensureRow(db: SQLiteDatabase, profileId: string) {
  await db.runAsync(
    `INSERT OR IGNORE INTO streak_state(
      profile_id,current_streak,best_streak,last_qualified_date,freezes_available,last_freeze_award_streak,updated_at
    ) VALUES(?,0,0,NULL,0,0,?)`,
    profileId,
    now(),
  );
  const row = await db.getFirstAsync<StreakRow>('SELECT * FROM streak_state WHERE profile_id=?', profileId);
  if (!row) throw new Error('No se pudo crear el estado de racha');
  return row;
}

function toSnapshot(row: StreakRow, today: string): StreakSnapshot {
  return {
    profileId: row.profile_id,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastQualifiedDate: row.last_qualified_date,
    freezesAvailable: row.freezes_available,
    lastFreezeAwardStreak: row.last_freeze_award_streak,
    updatedAt: row.updated_at,
    today,
    challengeGameId: getDailyChallengeGameId(today),
    completedToday: row.last_qualified_date === today,
  };
}

async function logEvent(
  db: SQLiteDatabase,
  profileId: string,
  eventType: string,
  localDate: string,
  gameId: string | null,
  streakBefore: number,
  streakAfter: number,
  payload: Record<string, unknown> = {},
) {
  await db.runAsync(
    `INSERT INTO streak_events(
      profile_id,event_type,local_date,game_id,streak_before,streak_after,payload_json,created_at
    ) VALUES(?,?,?,?,?,?,?,?)`,
    profileId,
    eventType,
    localDate,
    gameId,
    streakBefore,
    streakAfter,
    JSON.stringify(payload),
    now(),
  );
}

async function reconcileStreakTx(db: SQLiteDatabase, profileId: string, today: string) {
  let row = await ensureRow(db, profileId);
  if (!row.last_qualified_date || row.current_streak <= 0) return row;

  const diff = calendarDayDiff(row.last_qualified_date, today);
  if (diff <= 1) return row;

  const missedDays = diff - 1;
  const updatedAt = now();
  if (missedDays <= row.freezes_available) {
    const protectedThrough = shiftDateKey(today, -1);
    const nextFreezes = row.freezes_available - missedDays;
    await db.runAsync(
      `UPDATE streak_state
       SET last_qualified_date=?,freezes_available=?,updated_at=?
       WHERE profile_id=?`,
      protectedThrough,
      nextFreezes,
      updatedAt,
      profileId,
    );
    await logEvent(db, profileId, 'STREAK_FREEZE_USED', today, null, row.current_streak, row.current_streak, {
      missedDays,
      freezesUsed: missedDays,
      freezesLeft: nextFreezes,
    });
    row = { ...row, last_qualified_date: protectedThrough, freezes_available: nextFreezes, updated_at: updatedAt };
    return row;
  }

  await db.runAsync(
    `UPDATE streak_state
     SET current_streak=0,last_qualified_date=NULL,last_freeze_award_streak=0,updated_at=?
     WHERE profile_id=?`,
    updatedAt,
    profileId,
  );
  await logEvent(db, profileId, 'STREAK_BROKEN', today, null, row.current_streak, 0, {
    missedDays,
    freezesAvailable: row.freezes_available,
  });
  return {
    ...row,
    current_streak: 0,
    last_qualified_date: null,
    last_freeze_award_streak: 0,
    updated_at: updatedAt,
  };
}

export async function getStreakState(
  db: SQLiteDatabase,
  profileId: string,
  today = localDateKey(),
): Promise<StreakSnapshot> {
  let row: StreakRow | null = null;
  await db.withExclusiveTransactionAsync(async (tx) => {
    row = await reconcileStreakTx(tx, profileId, today);
  });
  if (!row) throw new Error('Estado de racha no disponible');
  return toSnapshot(row, today);
}

export async function qualifyDailyStreak(
  db: SQLiteDatabase,
  profileId: string,
  gameId: string,
  today = localDateKey(),
): Promise<StreakQualification> {
  const challengeGameId = getDailyChallengeGameId(today);
  if (gameId !== challengeGameId) {
    return {
      snapshot: await getStreakState(db, profileId, today),
      qualified: false,
      extended: false,
      freezeAwarded: false,
    };
  }

  let qualification: StreakQualification | null = null;
  await db.withExclusiveTransactionAsync(async (tx) => {
    const row = await reconcileStreakTx(tx, profileId, today);
    if (row.last_qualified_date === today) {
      qualification = {
        snapshot: toSnapshot(row, today),
        qualified: true,
        extended: false,
        freezeAwarded: false,
      };
      return;
    }

    const streakBefore = row.current_streak;
    const nextStreak = Math.max(1, streakBefore + 1);
    const nextBest = Math.max(row.best_streak, nextStreak);
    const milestone = nextStreak > 0 && nextStreak % 7 === 0;
    const freezeAwarded = milestone && row.last_freeze_award_streak !== nextStreak && row.freezes_available < 2;
    const nextFreezes = freezeAwarded ? Math.min(2, row.freezes_available + 1) : row.freezes_available;
    const nextAwardMarker = milestone ? nextStreak : row.last_freeze_award_streak;
    const updatedAt = now();

    await tx.runAsync(
      `UPDATE streak_state
       SET current_streak=?,best_streak=?,last_qualified_date=?,freezes_available=?,last_freeze_award_streak=?,updated_at=?
       WHERE profile_id=?`,
      nextStreak,
      nextBest,
      today,
      nextFreezes,
      nextAwardMarker,
      updatedAt,
      profileId,
    );
    await logEvent(tx, profileId, 'STREAK_EXTENDED', today, gameId, streakBefore, nextStreak, {
      challengeGameId,
      freezeAwarded,
      freezesAvailable: nextFreezes,
    });

    const nextRow: StreakRow = {
      ...row,
      current_streak: nextStreak,
      best_streak: nextBest,
      last_qualified_date: today,
      freezes_available: nextFreezes,
      last_freeze_award_streak: nextAwardMarker,
      updated_at: updatedAt,
    };
    qualification = {
      snapshot: toSnapshot(nextRow, today),
      qualified: true,
      extended: true,
      freezeAwarded,
    };
  });

  if (!qualification) throw new Error('No se pudo actualizar la racha');
  return qualification;
}
