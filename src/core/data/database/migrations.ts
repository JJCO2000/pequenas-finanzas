import type { SQLiteDatabase } from 'expo-sqlite';

const VERSION = 5;

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= VERSION) return;

  if (current < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles(
        id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL,
        age_band TEXT NOT NULL,
        avatar_key TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_state(key TEXT PRIMARY KEY NOT NULL,value TEXT);
      CREATE TABLE IF NOT EXISTS wallets(
        profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        available_cents INTEGER NOT NULL DEFAULT 0,
        savings_cents INTEGER NOT NULL DEFAULT 0,
        invested_cents INTEGER NOT NULL DEFAULT 0,
        lifetime_earned_cents INTEGER NOT NULL DEFAULT 0,
        lifetime_spent_cents INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS level_progress(
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        level_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'locked',
        stars INTEGER NOT NULL DEFAULT 0,
        best_score INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY(profile_id,level_id)
      );
      CREATE TABLE IF NOT EXISTS wallet_transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        source TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS learning_events(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        content_id TEXT,
        score INTEGER,
        payload_json TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS inventory(
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        item_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        acquired_at TEXT NOT NULL,
        PRIMARY KEY(profile_id,item_id)
      );
    `);
  }

  if (current < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS game_sessions(
        session_id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        reward_cents INTEGER NOT NULL DEFAULT 0,
        metrics_json TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  if (current < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS investments(
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        principal_cents INTEGER NOT NULL,
        profit_cents INTEGER NOT NULL,
        payout_cents INTEGER NOT NULL,
        created_level_id TEXT NOT NULL,
        created_level_order INTEGER NOT NULL,
        target_level_id TEXT NOT NULL,
        target_level_order INTEGER NOT NULL,
        dinosaur_key TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        claimed_at TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS investments_one_active_per_profile
        ON investments(profile_id)
        WHERE status = 'active';

      INSERT INTO wallet_transactions(profile_id,kind,amount_cents,source,created_at)
      SELECT profile_id,'uninvest',invested_cents,'Migracion: inversion anterior devuelta',datetime('now')
      FROM wallets
      WHERE invested_cents > 0;

      UPDATE wallets
      SET available_cents = available_cents + invested_cents,
          invested_cents = 0
      WHERE invested_cents > 0;
    `);
  }

  if (current < 4) {
    const gameSessionColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(game_sessions)');
    if (!gameSessionColumns.some((column) => column.name === 'mode')) {
      await db.execAsync("ALTER TABLE game_sessions ADD COLUMN mode TEXT NOT NULL DEFAULT 'arcade';");
    }
    if (!gameSessionColumns.some((column) => column.name === 'campaign_day')) {
      await db.execAsync('ALTER TABLE game_sessions ADD COLUMN campaign_day INTEGER;');
    }

    await db.execAsync(`
      DROP INDEX IF EXISTS investments_one_active_per_profile;

      CREATE INDEX IF NOT EXISTS investments_active_target
        ON investments(profile_id,status,target_level_order);

      CREATE TABLE IF NOT EXISTS adventure_state(
        profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        current_day INTEGER NOT NULL DEFAULT 1,
        highest_generated_day INTEGER NOT NULL DEFAULT 0,
        map_offset_x REAL NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS adventure_days(
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        node_type TEXT NOT NULL,
        content_id TEXT,
        game_id TEXT,
        concept TEXT NOT NULL,
        title TEXT NOT NULL,
        reward_cents INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        generated_at TEXT NOT NULL,
        completed_at TEXT,
        PRIMARY KEY(profile_id,day_number)
      );

      CREATE INDEX IF NOT EXISTS adventure_days_profile_completed
        ON adventure_days(profile_id,completed,day_number);

      CREATE TABLE IF NOT EXISTS game_unlocks(
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        unlocked_day INTEGER NOT NULL,
        unlocked_at TEXT NOT NULL,
        PRIMARY KEY(profile_id,game_id)
      );

      CREATE TABLE IF NOT EXISTS app_settings(
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY(profile_id,setting_key)
      );

      CREATE TABLE IF NOT EXISTS sync_outbox(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        synced_at TEXT
      );

      CREATE INDEX IF NOT EXISTS sync_outbox_pending
        ON sync_outbox(profile_id,status,id);

      INSERT OR IGNORE INTO adventure_state(profile_id,current_day,highest_generated_day,map_offset_x,updated_at)
      SELECT
        p.id,
        CASE
          WHEN (SELECT COUNT(*) FROM level_progress lp WHERE lp.profile_id=p.id AND lp.status='completed') >= 9 THEN 10
          ELSE (SELECT COUNT(*) FROM level_progress lp WHERE lp.profile_id=p.id AND lp.status='completed') + 1
        END,
        0,
        0,
        datetime('now')
      FROM profiles p;

      INSERT OR IGNORE INTO game_unlocks(profile_id,game_id,unlocked_day,unlocked_at)
      SELECT profile_id,game_id,1,MIN(created_at)
      FROM game_sessions
      GROUP BY profile_id,game_id;
    `);
  }

  if (current < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS streak_state(
        profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        last_qualified_date TEXT,
        freezes_available INTEGER NOT NULL DEFAULT 0,
        last_freeze_award_streak INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS streak_events(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        local_date TEXT NOT NULL,
        game_id TEXT,
        streak_before INTEGER NOT NULL DEFAULT 0,
        streak_after INTEGER NOT NULL DEFAULT 0,
        payload_json TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS streak_events_profile_date
        ON streak_events(profile_id,local_date,id);

      INSERT OR IGNORE INTO streak_state(
        profile_id,current_streak,best_streak,last_qualified_date,freezes_available,last_freeze_award_streak,updated_at
      )
      SELECT id,0,0,NULL,0,0,datetime('now') FROM profiles;
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${VERSION};`);
}
