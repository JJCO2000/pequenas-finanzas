import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const specs = [
  ['src/core/game-runtime/systems/collision.ts', 'circleIntersectsRect'],
  ['src/core/game-runtime/systems/spawn.ts', 'deterministicSpawnX'],
  ['src/core/game-runtime/systems/movement.ts', 'clamp'],
];

let failed = false;
for (const [rel, fn] of specs) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`[FAIL] Missing ${rel}`);
    failed = true;
    continue;
  }
  const src = fs.readFileSync(full, 'utf8');
  const start = src.indexOf(`function ${fn}`);
  if (start < 0) {
    console.error(`[FAIL] ${fn} not found in ${rel}`);
    failed = true;
    continue;
  }
  const bodyStart = src.indexOf('{', start);
  const probe = src.slice(bodyStart + 1, bodyStart + 100);
  if (!/["']worklet["']\s*;/.test(probe)) {
    console.error(`[FAIL] ${fn} is called from the UI Runtime but is not marked as a worklet.`);
    failed = true;
  } else {
    console.log(`[OK] ${fn} is UI-runtime safe.`);
  }
}

const gamePath = path.join(root, 'src/features/games/coin-catcher/Game.native.tsx');
if (!fs.existsSync(gamePath)) {
  console.error('[FAIL] Coin Catcher native game missing.');
  failed = true;
} else {
  const game = fs.readFileSync(gamePath, 'utf8');
  for (const fn of ['circleIntersectsRect', 'deterministicSpawnX', 'clamp']) {
    if (!game.includes(fn)) {
      console.error(`[FAIL] Coin Catcher no longer references expected helper ${fn}; review gate.`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('[OK] Coin Catcher worklet boundary verified.');
