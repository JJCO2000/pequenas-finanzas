import type { SQLiteDatabase } from 'expo-sqlite';
const VERSION=2;
export async function migrateDb(db:SQLiteDatabase){
 await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
 const row=await db.getFirstAsync<{user_version:number}>('PRAGMA user_version'); const current=row?.user_version??0; if(current>=VERSION)return;
 if(current<1){await db.execAsync(`
 CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY NOT NULL,display_name TEXT NOT NULL,age_band TEXT NOT NULL,avatar_key TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS app_state(key TEXT PRIMARY KEY NOT NULL,value TEXT);
 CREATE TABLE IF NOT EXISTS wallets(profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,available_cents INTEGER NOT NULL DEFAULT 0,savings_cents INTEGER NOT NULL DEFAULT 0,invested_cents INTEGER NOT NULL DEFAULT 0,lifetime_earned_cents INTEGER NOT NULL DEFAULT 0,lifetime_spent_cents INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS level_progress(profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,level_id TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'locked',stars INTEGER NOT NULL DEFAULT 0,best_score INTEGER NOT NULL DEFAULT 0,attempts INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(profile_id,level_id));
 CREATE TABLE IF NOT EXISTS wallet_transactions(id INTEGER PRIMARY KEY AUTOINCREMENT,profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,kind TEXT NOT NULL,amount_cents INTEGER NOT NULL,source TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS learning_events(id INTEGER PRIMARY KEY AUTOINCREMENT,profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,event_type TEXT NOT NULL,content_id TEXT,score INTEGER,payload_json TEXT,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS inventory(profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,item_id TEXT NOT NULL,quantity INTEGER NOT NULL DEFAULT 1,acquired_at TEXT NOT NULL,PRIMARY KEY(profile_id,item_id));
 `)}
 if(current<2){await db.execAsync(`
 CREATE TABLE IF NOT EXISTS game_sessions(session_id TEXT PRIMARY KEY NOT NULL,profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,game_id TEXT NOT NULL,score INTEGER NOT NULL DEFAULT 0,duration_ms INTEGER NOT NULL DEFAULT 0,completed INTEGER NOT NULL DEFAULT 0,reward_cents INTEGER NOT NULL DEFAULT 0,metrics_json TEXT,created_at TEXT NOT NULL);
 `)}
 await db.execAsync(`PRAGMA user_version = ${VERSION};`);
}
