import type { SQLiteDatabase } from 'expo-sqlite';
import type { AdventureDay, AdventureDaySeed, AdventureState, CampaignCompletionResult, GameUnlock } from '@/core/domain/types';
import { claimMaturedInvestmentsTx } from './investmentRepository';
import { enqueueSync, mapAdventureDay, mapAdventureState, now, txLog } from './repositorySupport';

export async function getAdventureState(db: SQLiteDatabase, id: string): Promise<AdventureState | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM adventure_state WHERE profile_id=?', id);
  return row ? mapAdventureState(row) : null;
}

export async function ensureAdventureState(db: SQLiteDatabase, profileId: string): Promise<AdventureState> {
  let state = await getAdventureState(db, profileId);
  if (state) return state;
  const completed = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM level_progress WHERE profile_id=? AND status='completed'",
    profileId,
  );
  const currentDay = Math.max(1, (completed?.count ?? 0) + 1);
  const timestamp = now();
  await db.runAsync(
    'INSERT OR IGNORE INTO adventure_state(profile_id,current_day,highest_generated_day,map_offset_x,updated_at) VALUES(?,?,0,0,?)',
    profileId,
    currentDay,
    timestamp,
  );
  state = await getAdventureState(db, profileId);
  if (!state) throw new Error('No se pudo crear el estado de aventura');
  return state;
}

export async function getAdventureDays(db: SQLiteDatabase, profileId: string): Promise<AdventureDay[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM adventure_days WHERE profile_id=? ORDER BY day_number ASC',
    profileId,
  );
  return rows.map(mapAdventureDay);
}

export async function ensureAdventureDays(
  db: SQLiteDatabase,
  profileId: string,
  seeds: AdventureDaySeed[],
) {
  if (seeds.length === 0) return;
  const timestamp = now();
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const seed of seeds) {
      await tx.runAsync(
        `INSERT INTO adventure_days(
          profile_id,day_number,node_type,content_id,game_id,concept,title,reward_cents,completed,generated_at,completed_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(profile_id,day_number) DO UPDATE SET
          node_type=CASE WHEN adventure_days.completed=0 THEN excluded.node_type ELSE adventure_days.node_type END,
          content_id=CASE WHEN adventure_days.completed=0 THEN excluded.content_id ELSE adventure_days.content_id END,
          game_id=CASE WHEN adventure_days.completed=0 THEN excluded.game_id ELSE adventure_days.game_id END,
          concept=CASE WHEN adventure_days.completed=0 THEN excluded.concept ELSE adventure_days.concept END,
          title=CASE WHEN adventure_days.completed=0 THEN excluded.title ELSE adventure_days.title END,
          reward_cents=CASE WHEN adventure_days.completed=0 THEN excluded.reward_cents ELSE adventure_days.reward_cents END,
          completed=CASE WHEN excluded.completed=1 THEN 1 ELSE adventure_days.completed END,
          completed_at=CASE WHEN excluded.completed=1 AND adventure_days.completed_at IS NULL THEN excluded.completed_at ELSE adventure_days.completed_at END`,
        profileId,
        seed.dayNumber,
        seed.nodeType,
        seed.contentId,
        seed.gameId,
        seed.concept,
        seed.title,
        seed.rewardCents,
        seed.completed ? 1 : 0,
        timestamp,
        seed.completed ? timestamp : null,
      );
    }
    const highest = Math.max(...seeds.map((seed) => seed.dayNumber));
    await tx.runAsync(
      `UPDATE adventure_state
       SET highest_generated_day=MAX(highest_generated_day,?),updated_at=?
       WHERE profile_id=?`,
      highest,
      timestamp,
      profileId,
    );
  });
}

export async function saveMapOffset(db: SQLiteDatabase, profileId: string, offsetX: number) {
  const clean = Number.isFinite(offsetX) ? Math.max(0, offsetX) : 0;
  await db.runAsync(
    'UPDATE adventure_state SET map_offset_x=?,updated_at=? WHERE profile_id=?',
    clean,
    now(),
    profileId,
  );
}

export async function getGameUnlocks(db: SQLiteDatabase, profileId: string): Promise<GameUnlock[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM game_unlocks WHERE profile_id=? ORDER BY unlocked_day ASC,unlocked_at ASC',
    profileId,
  );
  return rows.map((row) => ({
    profileId: row.profile_id,
    gameId: row.game_id,
    unlockedDay: row.unlocked_day,
    unlockedAt: row.unlocked_at,
  }));
}

export async function unlockGame(db: SQLiteDatabase, profileId: string, gameId: string, dayNumber: number) {
  const timestamp = now();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      'INSERT OR IGNORE INTO game_unlocks(profile_id,game_id,unlocked_day,unlocked_at) VALUES(?,?,?,?)',
      profileId,
      gameId,
      dayNumber,
      timestamp,
    );
    await enqueueSync(tx, profileId, 'game_unlock', gameId, 'upsert', { gameId, dayNumber });
  });
}

export async function completeAdventureDayTx(
  tx: SQLiteDatabase,
  profileId: string,
  dayNumber: number,
  score: number,
  rewardCents: number,
  legacyLevelId?: string | null,
  nextLegacyLevelId?: string | null,
): Promise<CampaignCompletionResult> {
  const day = await tx.getFirstAsync<any>(
    'SELECT * FROM adventure_days WHERE profile_id=? AND day_number=?',
    profileId,
    dayNumber,
  );
  if (!day) throw new Error(`Día ${dayNumber} no generado`);

  const state = await tx.getFirstAsync<any>('SELECT * FROM adventure_state WHERE profile_id=?', profileId);
  const previousCurrent = state?.current_day ?? 1;
  if (dayNumber > previousCurrent) {
    throw new Error(`No puedes completar el día ${dayNumber} antes del día ${previousCurrent}.`);
  }

  const awarded = !Boolean(day.completed);
  const timestamp = now();

  if (awarded) {
    await tx.runAsync(
      'UPDATE adventure_days SET completed=1,completed_at=? WHERE profile_id=? AND day_number=?',
      timestamp,
      profileId,
      dayNumber,
    );
    if (rewardCents > 0) {
      await tx.runAsync(
        'UPDATE wallets SET available_cents=available_cents+?,lifetime_earned_cents=lifetime_earned_cents+? WHERE profile_id=?',
        rewardCents,
        rewardCents,
        profileId,
      );
      await txLog(tx, profileId, 'earn', rewardCents, `Día ${dayNumber}: ${day.title}`);
    }
  }

  if (legacyLevelId) {
    const legacy = await tx.getFirstAsync<any>(
      'SELECT * FROM level_progress WHERE profile_id=? AND level_id=?',
      profileId,
      legacyLevelId,
    );
    if (legacy) {
      await tx.runAsync(
        'UPDATE level_progress SET status=\'completed\',stars=?,best_score=?,attempts=attempts+1,updated_at=? WHERE profile_id=? AND level_id=?',
        score >= 100 ? 3 : 1,
        Math.max(legacy.best_score, score),
        timestamp,
        profileId,
        legacyLevelId,
      );
      if (nextLegacyLevelId) {
        await tx.runAsync(
          "UPDATE level_progress SET status='available',updated_at=? WHERE profile_id=? AND level_id=? AND status='locked'",
          timestamp,
          profileId,
          nextLegacyLevelId,
        );
      }
    }
  }

  await tx.runAsync(
    'INSERT INTO learning_events(profile_id,event_type,content_id,score,payload_json,created_at) VALUES(?,?,?,?,?,?)',
    profileId,
    'ADVENTURE_DAY_COMPLETED',
    day.content_id ?? day.game_id ?? `day-${dayNumber}`,
    score,
    JSON.stringify({ dayNumber, nodeType: day.node_type, awarded }),
    timestamp,
  );

  const nextCurrent = awarded && dayNumber >= previousCurrent ? dayNumber + 1 : previousCurrent;
  if (nextCurrent !== previousCurrent) {
    await tx.runAsync(
      'UPDATE adventure_state SET current_day=?,updated_at=? WHERE profile_id=?',
      nextCurrent,
      timestamp,
      profileId,
    );
  }

  const maturedInvestments = await claimMaturedInvestmentsTx(tx, profileId, nextCurrent);
  await enqueueSync(tx, profileId, 'adventure_day', String(dayNumber), 'complete', {
    dayNumber,
    score,
    awarded,
    currentDay: nextCurrent,
  });

  return {
    awarded,
    rewardCents: awarded ? rewardCents : 0,
    currentDay: nextCurrent,
    maturedInvestments,
  };
}

export async function completeAdventureDay(
  db: SQLiteDatabase,
  profileId: string,
  dayNumber: number,
  score: number,
  rewardCents: number,
  legacyLevelId?: string | null,
  nextLegacyLevelId?: string | null,
): Promise<CampaignCompletionResult> {
  let result: CampaignCompletionResult = {
    awarded: false,
    rewardCents: 0,
    currentDay: dayNumber,
    maturedInvestments: [],
  };
  await db.withExclusiveTransactionAsync(async (tx) => {
    result = await completeAdventureDayTx(
      tx,
      profileId,
      dayNumber,
      score,
      rewardCents,
      legacyLevelId,
      nextLegacyLevelId,
    );
  });
  return result;
}
