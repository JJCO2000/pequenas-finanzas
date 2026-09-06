import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const ok = (m) => console.log(`[OK] ${m}`);
const fail = (m) => { console.error(`[FAIL] ${m}`); process.exitCode = 1; };

const layout = read('src/features/shell/world/useWorldLayout.ts');
const scene = read('src/features/shell/world/WorldScene.tsx');
const theme = read('src/core/theme/dinoTheme.ts');
const registry = read('src/registry/assets.ts');
const coin = read('src/features/games/coin-catcher/Game.native.tsx');
const contract = read('docs/research/COURSE_IMPLEMENTATION_V6.md');

const rejectedNames = ['forest-world-wide.webp', 'arcade-world-wide.webp', 'finance-world-wide.webp', 'market-world-wide.webp'];
for (const name of rejectedNames) {
  if (registry.includes(name) || theme.includes(name)) fail(`Rejected baked-UI background is still runtime-referenced: ${name}`);
}
if (!rejectedNames.some((name) => registry.includes(name) || theme.includes(name))) {
  ok('Baked-UI scenic derivatives are excluded from the runtime asset graph.');
}

if (!scene.includes("from 'expo-image'") || !scene.includes('contentFit="cover"') || !scene.includes('cachePolicy="memory-disk"') || !scene.includes('allowDownscaling')) {
  fail('WorldScene is missing the shared performant Expo Image rendering contract.');
} else ok('WorldScene centralizes cover rendering, downscaling and memory+disk caching.');

if (!layout.includes('WORLD_REFERENCE_WIDTH = 1672') || !layout.includes('WORLD_REFERENCE_HEIGHT = 941')) {
  fail('World reference composition is not pinned to the approved 1672x941 master.');
} else ok('World reference composition is 1672x941.');

if (!layout.includes('Math.min(safeWidth / WORLD_REFERENCE_WIDTH, safeHeight / WORLD_REFERENCE_HEIGHT)')) {
  fail('World layout is not using uniform expand-style scaling.');
} else ok('World layout uses one uniform scale and expands visible logical world for aspect-ratio differences.');

if (!coin.includes('getWorldLayout(width, height)') || !coin.includes('event.x / canvasScale')) {
  fail('Coin Catcher is not converting physical input into the logical world canvas.');
} else ok('Coin Catcher converts physical drag coordinates into the logical world canvas.');

for (const mechanical of ['const COIN_R = 16;', 'const BONUS_R = 18;', 'const HAZARD_R = 20;', 'const BASE_BASKET_WIDTH = 98;', 'const BASKET_HEIGHT = 25;', 'const BASE_SECONDS = 35;', 'useSharedValue<number>(178)']) {
  if (!coin.includes(mechanical)) fail(`Accepted Coin Catcher mechanic changed during visual work: ${mechanical}`);
}
if (!process.exitCode) ok('Coin Catcher accepted collision/timing constants remain unchanged.');

for (const role of ['camp:', 'arcade:', 'investments:', 'market:', 'gameIntro:', 'coinField:']) {
  if (!theme.includes(role)) fail(`ThemePack runtime mapping is missing semantic role ${role}`);
}
if (!process.exitCode) ok('Dino theme exposes semantic world roles instead of feature-level file paths.');

const runtimeDirs = ['assets/world/v6', 'assets/ui/v6'];
let bytes = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel);
    else bytes += fs.statSync(path.join(root, rel)).size;
  }
};
for (const dir of runtimeDirs) walk(dir);
const mib = bytes / (1024 * 1024);
if (mib > 1) fail(`New v6 runtime art exceeds the 1 MiB slice budget: ${mib.toFixed(2)} MiB`);
else ok(`New v6 runtime art slice is ${mib.toFixed(2)} MiB (<= 1 MiB gate).`);

for (const required of ['Grafit Studio', 'PedroTech', 'Riot Games', 'Supercell', 'Ubisoft']) {
  if (!contract.includes(required)) fail(`Course/company implementation contract is missing ${required}.`);
}
if (!process.exitCode) ok('Implementation contract records the reviewed course and game-company guidance.');

if (!process.exitCode) console.log('[OK] WORLD UI v6 implementation contract passed.');
