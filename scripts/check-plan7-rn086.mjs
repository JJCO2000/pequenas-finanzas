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
  'src/app/arcade.tsx',
  'src/app/investments.tsx',
  'src/app/game/[gameId].tsx',
];
let failed = false;
const fail = (m) => { failed = true; console.error(`[FAIL] ${m}`); };
const ok = (m) => console.log(`[OK] ${m}`);
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (text.includes('StyleSheet.absoluteFillObject')) fail(`${file}: absoluteFillObject no existe en los typings RN 0.86 usados por el proyecto.`);
  if (/<(?:Animated\.)?Image\b[^>]*\bpointerEvents=/.test(text)) fail(`${file}: pointerEvents directo sobre Image/Animated.Image rompe typings RN 0.86.`);
}
const coin = fs.readFileSync(path.join(root, files[0]), 'utf8');
if (!coin.includes('useSharedValue<number>')) fail('Coin Catcher debe tipar SharedValue numericos para evitar inferencia literal RN/Reanimated.');
else ok('Coin Catcher usa SharedValue<number> explicito.');
if (!failed) ok('Preflight RN 0.86: no se detectaron las regresiones que rompieron el patch anterior.');
process.exitCode = failed ? 1 : 0;
