import type { SQLiteDatabase } from 'expo-sqlite';
import type { GameRewardResult, GameRunMode, Investment } from '@/core/domain/types';
import { applyArcadeRewardPolicy } from '@/core/economy/arcadeRewardPolicy';
import { completeAdventureDayTx } from './adventureRepository';
import { enqueueSync, now, txLog } from './repositorySupport';

export async function recordGameResult(
  db: SQLiteDatabase,
  profileId: string,
  result: {
    sessionId: string;
    gameId: string;
    score: number;
    durationMs: number;
    completed: boolean;
    metrics: Record<string, unknown>;
  },
  baseRewardCents: number,
  mode: GameRunMode,
  campaignDay: number | null,
): Promise<GameRewardResult> {
  let outcome: GameRewardResult = {
    recorded: false,
    rewardCents: 0,
    baseRewardCents,
    multiplier: 0,
    currentDay: null,
    maturedInvestments: [],
  };

  await db.withExclusiveTransactionAsync(async (tx) => {
    const exists = await tx.getFirstAsync<{ session_id: string }>(
      'SELECT session_id FROM game_sessions WHERE session_id=?',
      result.sessionId,
    );
    if (exists) return;

    let rewardCents = Math.max(0, Math.trunc(baseRewardCents));
    let multiplier = 1;

    if (mode === 'arcade') {
      const previous = await tx.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM game_sessions
         WHERE profile_id=? AND game_id=? AND mode='arcade' AND completed=1
           AND date(created_at,'localtime')=date('now','localtime')`,
        profileId,
        result.gameId,
      );
      const policy = applyArcadeRewardPolicy(rewardCents, previous?.count ?? 0);
      rewardCents = policy.rewardCents;
      multiplier = policy.multiplier;
    } else if (campaignDay !== null) {
      const day = await tx.getFirstAsync<{ completed: number }>(
        'SELECT completed FROM adventure_days WHERE profile_id=? AND day_number=?',
        profileId,
        campaignDay,
      );
      if (day?.completed) {
        rewardCents = 0;
        multiplier = 0;
      }
    }

    await tx.runAsync(
      `INSERT INTO game_sessions(
        session_id,profile_id,game_id,score,duration_ms,completed,reward_cents,metrics_json,created_at,mode,campaign_day
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      result.sessionId,
      profileId,
      result.gameId,
      result.score,
      result.durationMs,
      result.completed ? 1 : 0,
      rewardCents,
      JSON.stringify(result.metrics),
      now(),
      mode,
      campaignDay,
    );
    await tx.runAsync(
      'INSERT INTO learning_events(profile_id,event_type,content_id,score,payload_json,created_at) VALUES(?,?,?,?,?,?)',
      profileId,
      'GAME_FINISHED',
      result.gameId,
      result.score,
      JSON.stringify({ ...result.metrics, mode, campaignDay, multiplier }),
      now(),
    );

    if (rewardCents > 0) {
      await tx.runAsync(
        'UPDATE wallets SET available_cents=available_cents+?,lifetime_earned_cents=lifetime_earned_cents+? WHERE profile_id=?',
        rewardCents,
        rewardCents,
        profileId,
      );
      await txLog(tx, profileId, 'earn', rewardCents, `${mode === 'arcade' ? 'Arcade' : 'Aventura'}: ${result.gameId}`);
    }

    let currentDay: number | null = null;
    let maturedInvestments: Investment[] = [];
    if (mode === 'campaign' && campaignDay !== null && result.completed) {
      await tx.runAsync(
        'INSERT OR IGNORE INTO game_unlocks(profile_id,game_id,unlocked_day,unlocked_at) VALUES(?,?,?,?)',
        profileId,
        result.gameId,
        campaignDay,
        now(),
      );
      const completion = await completeAdventureDayTx(tx, profileId, campaignDay, result.score, 0, null, null);
      currentDay = completion.currentDay;
      maturedInvestments = completion.maturedInvestments;
    }

    await enqueueSync(tx, profileId, 'game_session', result.sessionId, 'create', {
      gameId: result.gameId,
      score: result.score,
      rewardCents,
      mode,
      campaignDay,
    });

    outcome = {
      recorded: true,
      rewardCents,
      baseRewardCents,
      multiplier,
      currentDay,
      maturedInvestments,
    };
  });

  return outcome;
}
