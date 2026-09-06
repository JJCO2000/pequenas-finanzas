import type { SQLiteDatabase } from 'expo-sqlite';
import { enqueueSync, now } from './repositorySupport';

export async function getSettings(db: SQLiteDatabase, profileId: string) {
  const rows = await db.getAllAsync<{ setting_key: string; setting_value: string }>(
    'SELECT setting_key,setting_value FROM app_settings WHERE profile_id=?',
    profileId,
  );
  return Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
}

export async function setSetting(
  db: SQLiteDatabase,
  profileId: string,
  key: string,
  value: string,
) {
  const timestamp = now();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `INSERT INTO app_settings(profile_id,setting_key,setting_value,updated_at)
       VALUES(?,?,?,?)
       ON CONFLICT(profile_id,setting_key) DO UPDATE SET setting_value=excluded.setting_value,updated_at=excluded.updated_at`,
      profileId,
      key,
      value,
      timestamp,
    );
    await enqueueSync(tx, profileId, 'setting', key, 'upsert', { key, value });
  });
}
