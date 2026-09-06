import type { SQLiteDatabase } from 'expo-sqlite';
import type { LessonCompletionResult, LevelProgress } from '@/core/domain/types';
import { now, txLog } from './repositorySupport';

export async function getProgress(db: SQLiteDatabase, id: string): Promise<LevelProgress[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM level_progress WHERE profile_id=?', id);
  return rows.map((row) => ({
    profileId: id,
    levelId: row.level_id,
    status: row.status,
    stars: row.stars,
    bestScore: row.best_score,
    attempts: row.attempts,
  }));
}

export async function completeLevelAndReward(
  db: SQLiteDatabase,
  profileId: string,
  levelId: string,
  score: number,
  rewardCents: number,
  nextLevelId: string | null,
): Promise<LessonCompletionResult> {
  let awarded = false;
  await db.withExclusiveTransactionAsync(async (tx) => {
    const progress = await tx.getFirstAsync<any>(
      'SELECT * FROM level_progress WHERE profile_id=? AND level_id=?',
      profileId,
      levelId,
    );
    if (!progress) throw new Error('Nivel inexistente');
    awarded = progress.status !== 'completed';
    await tx.runAsync(
      'UPDATE level_progress SET status=\'completed\',stars=?,best_score=?,attempts=attempts+1,updated_at=? WHERE profile_id=? AND level_id=?',
      score >= 100 ? 3 : 1,
      Math.max(progress.best_score, score),
      now(),
      profileId,
      levelId,
    );
    if (nextLevelId) {
      await tx.runAsync(
        "UPDATE level_progress SET status='available',updated_at=? WHERE profile_id=? AND level_id=? AND status='locked'",
        now(),
        profileId,
        nextLevelId,
      );
    }
    if (awarded && rewardCents > 0) {
      await tx.runAsync(
        'UPDATE wallets SET available_cents=available_cents+?,lifetime_earned_cents=lifetime_earned_cents+? WHERE profile_id=?',
        rewardCents,
        rewardCents,
        profileId,
      );
      await txLog(tx, profileId, 'earn', rewardCents, `Lección: ${levelId}`);
    }
  });
  return { awarded, maturedInvestment: null, maturedInvestments: [] };
}
