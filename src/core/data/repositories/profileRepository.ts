import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { AgeBand, ChildProfile } from '@/core/domain/types';
import { DEFAULT_PROFILE_AVATAR_KEY } from '@/core/domain/profileDefaults';
import { ACTIVE_PROFILE_STATE_KEY, enqueueSync, now } from './repositorySupport';

export async function getActiveProfile(db: SQLiteDatabase): Promise<ChildProfile | null> {
  const state = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_state WHERE key=?',
    ACTIVE_PROFILE_STATE_KEY,
  );
  if (!state?.value) return null;

  const row = await db.getFirstAsync<any>('SELECT * FROM profiles WHERE id=?', state.value);
  return row
    ? {
        id: row.id,
        displayName: row.display_name,
        ageBand: row.age_band,
        avatarKey: row.avatar_key,
      }
    : null;
}

export async function createProfile(
  db: SQLiteDatabase,
  name: string,
  ageBand: AgeBand,
  levelIds: string[],
) {
  const id = Crypto.randomUUID();
  const timestamp = now();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      'INSERT INTO profiles VALUES(?,?,?,?,?,?)',
      id,
      name.trim(),
      ageBand,
      DEFAULT_PROFILE_AVATAR_KEY,
      timestamp,
      timestamp,
    );
    await tx.runAsync('INSERT INTO wallets(profile_id) VALUES(?)', id);
    await tx.runAsync('INSERT OR REPLACE INTO app_state(key,value) VALUES(?,?)', ACTIVE_PROFILE_STATE_KEY, id);
    await tx.runAsync(
      'INSERT OR IGNORE INTO adventure_state(profile_id,current_day,highest_generated_day,map_offset_x,updated_at) VALUES(?,1,0,0,?)',
      id,
      timestamp,
    );
    for (const [index, levelId] of levelIds.entries()) {
      await tx.runAsync(
        'INSERT INTO level_progress(profile_id,level_id,status,updated_at) VALUES(?,?,?,?)',
        id,
        levelId,
        index === 0 ? 'available' : 'locked',
        timestamp,
      );
    }
    await enqueueSync(tx, id, 'profile', id, 'create', { displayName: name.trim(), ageBand });
  });

  return id;
}
