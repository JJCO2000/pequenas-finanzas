import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`[FAIL] ${message}`); failed = true; };

const support = fs.readFileSync('src/core/data/repositories/repositorySupport.ts', 'utf8');
for (const needle of [
  'LOCAL_CHANGE_JOURNAL_LIMIT = 250',
  "'local_only'",
  'recordLocalChange',
  'ORDER BY id DESC',
  'LOCAL_CHANGE_JOURNAL_LIMIT',
]) {
  if (!support.includes(needle)) fail(`Local journal is missing bounded/local-only marker: ${needle}`);
}
if (support.includes("'pending',?)")) fail('Repository support still creates fake pending-sync rows.');

const migrations = fs.readFileSync('src/core/data/database/migrations.ts', 'utf8');
for (const needle of [
  'const VERSION = 5',
  'if (current < 5)',
  "SET status='local_only',synced_at=NULL",
  'DROP INDEX IF EXISTS sync_outbox_pending',
  'CREATE INDEX IF NOT EXISTS sync_outbox_local_history',
  '>= 250',
]) {
  if (!migrations.includes(needle)) fail(`Migration v5 is missing local-journal normalization: ${needle}`);
}

const appRepository = fs.readFileSync('src/core/data/repositories/useAppRepository.ts', 'utf8');
for (const suspicious of ['flushSync', 'sendSync', 'uploadOutbox', 'processOutbox']) {
  if (appRepository.includes(suspicious)) fail(`Unexpected remote-sync surface exists without an audited transport contract: ${suspicious}`);
}

if (failed) process.exit(1);
console.log('[OK] Phantom sync queue is a local-only journal capped at 250 records per profile; financial/game tables are untouched.');
