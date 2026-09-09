import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`[FAIL] ${message}`); failed = true; };

const route = fs.readFileSync('src/app/game/[gameId].tsx', 'utf8');
for (const needle of [
  'pendingResult',
  'submittingRef',
  'REINTENTAR GUARDADO',
  'VOLVER SIN CONFIRMAR',
  'la recompensa no se duplica',
]) {
  if (!route.includes(needle)) fail(`Game result UI is missing resilience marker: ${needle}`);
}

const submitIndex = route.indexOf('await submitGameResult(nextResult');
const resultIndex = route.indexOf('setResult(nextResult)', submitIndex);
if (submitIndex < 0 || resultIndex < 0 || resultIndex < submitIndex) {
  fail('Game route must only finalize result after submitGameResult succeeds.');
}
if (route.includes('setResult(nextResult);\n      const outcome = await submitGameResult')) {
  fail('Old stuck-state ordering returned: result is finalized before persistence.');
}

const repository = fs.readFileSync('src/core/data/repositories/gameRepository.ts', 'utf8');
for (const needle of [
  'SELECT reward_cents,mode,campaign_day FROM game_sessions WHERE session_id=?',
  'inferPersistedMultiplier',
  'rewardCents: existing.reward_cents',
  'recorded: false',
]) {
  if (!repository.includes(needle)) fail(`Idempotent repository response is missing: ${needle}`);
}
if (repository.includes("SELECT session_id FROM game_sessions WHERE session_id=?")) {
  fail('Repository still uses the old duplicate-session early return without persisted reward data.');
}

const transactionIndex = repository.indexOf('withExclusiveTransactionAsync');
const insertIndex = repository.indexOf('INSERT INTO game_sessions');
const rewardUpdateIndex = repository.indexOf('UPDATE wallets SET available_cents=available_cents+?');
if (transactionIndex < 0 || insertIndex < transactionIndex || rewardUpdateIndex < insertIndex) {
  fail('Game session and wallet reward must remain in one exclusive transaction.');
}

if (failed) process.exit(1);
console.log('[OK] Game-result saving is recoverable and duplicate session retries return the persisted reward without paying twice.');
