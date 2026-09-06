import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/features/games/coin-catcher/Game.native.tsx',
  'src/features/games/balloon-answer/Game.tsx',
  'src/features/games/treasure-split/Game.tsx',
  'src/features/games/dino-market/Game.tsx',
  'src/features/games/fossil-escape/Game.tsx',
  'src/features/games/king-greedy/Game.tsx',
  'src/features/games/money-memory/Game.tsx',
];

const failures = [];
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/fontSize\s*:\s*(\d+(?:\.\d+)?)/g)) {
    const value = Number(match[1]);
    if (value < 10) failures.push(`${file}: fontSize ${value} is below the 10px gameplay floor`);
  }
}

const host = fs.readFileSync(path.join(root, 'src/features/games/GameHost.tsx'), 'utf8');
for (const required of [
  'finishedSessionRef',
  'finishedSessionRef.current === session.sessionId',
  'finishedSessionRef.current = session.sessionId',
  'onFinish(result)',
]) {
  if (!host.includes(required)) failures.push(`GameHost missing duplicate-finish guard fragment: ${required}`);
}

const route = fs.readFileSync(path.join(root, 'src/app/game/[gameId].tsx'), 'utf8');
for (const required of [
  'saveError',
  'retrySave',
  'submitGameResult',
]) {
  if (!route.includes(required)) failures.push(`Game result route missing save/retry fragment: ${required}`);
}

if (failures.length) {
  console.error('[FAIL] Seven-game regression guard');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('[OK] Seven-game regression guard: type floor, duplicate finish and save retry are present.');
