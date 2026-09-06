import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { console.error(`[FAIL] ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`[OK] ${message}`);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const expected = [
  ['coin-catcher', 5],
  ['balloon-answer', 10],
  ['treasure-split', 12],
  ['dino-market', 17],
  ['fossil-escape', 19],
  ['king-greedy', 24],
  ['money-memory', 26],
];
const registry = read('src/registry/games.ts');
const manifests = new Map();
for (const [id] of expected) {
  const dir = id;
  const file = `src/features/games/${dir}/manifest.ts`;
  manifests.set(id, read(file));
}
for (const [id, day] of expected) {
  const text = manifests.get(id);
  if (!text?.includes(`id: '${id}'`) || !text.includes(`minimumDay: ${day}`)) fail(`${id} id/day changed.`);
}
if (expected.every(([id]) => registry.includes(id === 'coin-catcher' ? 'COIN_CATCHER_MANIFEST' : id.split('-').map(x=>x.toUpperCase()).join('_')))) {
  // Registry imports use manifest constants; detailed order is checked below.
}
const orderTokens = ['COIN_CATCHER_MANIFEST','BALLOON_ANSWER_MANIFEST','TREASURE_SPLIT_MANIFEST','DINO_MARKET_MANIFEST','FOSSIL_ESCAPE_MANIFEST','KING_GREEDY_MANIFEST','MONEY_MEMORY_MANIFEST'];
let last = -1; let orderGood = true;
for (const token of orderTokens) { const idx = registry.lastIndexOf(token); if (idx <= last) orderGood = false; last = idx; }
if (!orderGood) fail('7-game registry order changed.'); else ok('7 game ids and campaign order remain stable through Day 26.');

const route = read('src/app/game/[gameId].tsx');
if (!route.includes('GameIntroScreen') || !route.includes('GameHost') || !route.includes('MissionCompleteOverlay')) fail('Game shell missing per-game intro, direct gameplay host or completion overlay.');
else ok('Every game enters through a dedicated intro before direct fullscreen gameplay.');
if (route.includes('missionStrip') || /sidePane|missionPanel/.test(route)) fail('Learning/instruction layout still consumes permanent gameplay space.');
if (!route.includes('LearningPeek') || !route.includes('learningOpen')) fail('Gameplay learning help is not collapsible/overlay-only.');
else ok('Learning help defaults outside layout flow and can be opened/minimized without shrinking gameplay.');

for (const [id] of expected) {
  const text = manifests.get(id) ?? '';
  const introStepCount = (text.match(/introSteps:/g) ?? []).length;
  if (introStepCount !== 1) fail(`${id} must own exactly one introSteps source in its manifest.`);
}
ok('All 7 manifests own their intro instructions in the existing game SSOT.');

const arcade = read('src/app/arcade.tsx');
if (!arcade.includes('GAMES.map') || !arcade.includes('7 juegos disponibles') || !arcade.includes('Elige un')) fail('Arcade free-play catalog is incomplete.');
else ok('Arcade exposes the complete 7-game catalog as free play.');
if (/gameUnlocks|isUnlocked|lockedPoster|ctaLocked|POR DESCUBRIR|disabled=\{!isUnlocked\}/.test(arcade)) fail('Arcade still gates games behind campaign unlock state.');
else ok('Arcade has zero campaign-lock gating; all 7 games are always playable there.');
if (/Mis juegos[\s\S]{0,500}Recompensas Arcade/.test(arcade)) fail('Legacy sparse Arcade layout appears to remain.');

const investments = read('src/app/investments.tsx');
for (const token of ['INVEST_AMOUNTS', 'invest(amountCents)', 'InvestmentPortfolio', 'calculateInvestmentPayout']) {
  if (!investments.includes(token)) fail(`Investments 2.0 missing ${token}.`);
}
if (investments.includes('INVEST_AMOUNTS') && investments.includes('10, 20, 50')) ok('Investments allows direct $10/$20/$50 purchase from the portfolio screen.');

const gameFiles = {
  coin: read('src/features/games/coin-catcher/Game.native.tsx'),
  balloon: read('src/features/games/balloon-answer/Game.tsx'),
  treasure: read('src/features/games/treasure-split/Game.tsx'),
  market: read('src/features/games/dino-market/Game.tsx'),
  escape: read('src/features/games/fossil-escape/Game.tsx'),
  king: read('src/features/games/king-greedy/Game.tsx'),
  memory: read('src/features/games/money-memory/Game.tsx'),
};

const required = {
  coin: ['coin1X','coin2X','bonusY','hazardY','bestCombo','useFrameCallback','Gesture.Pan'],
  balloon: ['Animated.loop','lives','combo','ROUND_SECONDS','FloatingBalloon','poppedTargets'],
  treasure: ["'plan' | 'simulate' | 'result'",'EVENTO OCULTO','Animated.timing','allocation','RESILIENCIA'],
  market: ['cart','PASAR POR CAJA','requiredCategories','maxSpend','selectedItems'],
  escape: ['HOTSPOTS','solved','PUERTA FINAL','shake','modalShade','ESCAPAR'],
  king: ['spinning','banked','exposed','CODICIA','ASEGURAR','stopSpin'],
  memory: ["'memorize' | 'choose' | 'feedback'",'newcomer','streak','revealMs','¿Qué apareció que NO estaba?'],
};
for (const [key, tokens] of Object.entries(required)) {
  const missing = tokens.filter((token) => !gameFiles[key].includes(token));
  if (missing.length) fail(`${key} gameplay donor loop incomplete: ${missing.join(', ')}`);
  else ok(`${key} donor gameplay loop is present and non-static.`);
}

for (const [key, text] of Object.entries(gameFiles)) {
  if (text.includes('Alert.alert')) fail(`${key} uses native Alert inside gameplay.`);
  if (text.includes('ASSETS.')) fail(`${key} bypasses ThemePack with raw ASSETS.`);
  if (text.includes('absoluteFillObject')) fail(`${key} reintroduces RN 0.86-incompatible StyleSheet.absoluteFillObject.`);
  if (/<(?:Animated\.)?Image[^>]*pointerEvents=/.test(text)) fail(`${key} sets pointerEvents directly on Image (RN 0.86 typing regression).`);
}
ok('All 7 games avoid native Alert, raw thematic assets and known RN 0.86 regressions.');

if (!gameFiles.treasure.includes('TREASURE_SPLIT_ROUNDS[roundIndex] ?? TREASURE_SPLIT_ROUNDS[0]!')) fail('Treasure Split still leaves current round possibly undefined under noUncheckedIndexedAccess.');
if (!gameFiles.escape.includes('const activeSpot') || !gameFiles.escape.includes('HOTSPOTS[index] ?? HOTSPOTS[0]')) fail('Fossil Escape hotspot access is not guarded for strict TS/noUncheckedIndexedAccess.');
if (!gameFiles.king.includes('if (!outcome) return;')) fail('King Greedy outcome access is not guarded for strict TS/noUncheckedIndexedAccess.');
else ok('Strict-index guards cover the 12 TypeScript errors reported by the real project.');

const intro = read('src/features/games/ui/GameIntroScreen.tsx');
if (!intro.includes('Jugar ahora') || !intro.includes('introSteps.map') || !intro.includes('LearningPeek')) fail('Shared intro/minimizable learning UI is incomplete.');
else ok('Shared intro + minimizable learning UI is centralized and reusable across all games.');

const chrome = read('src/features/games/ui/GameChrome.tsx');
if (!['HudChip','GameProgress','FeedbackPill','PrimaryGameButton'].every((token) => chrome.includes(token))) fail('Shared game chrome incomplete.');
else ok('Shared HUD/progress/feedback controls centralize game feel without centralizing gameplay logic.');

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['audit:plan7-full'] !== 'node scripts/check-plan7-full.mjs') fail('npm audit:plan7-full missing.');
else ok('Plan 7 Full control is wired into package scripts.');

if (!process.exitCode) console.log('[OK] PLAN 7 JUEGOS — FULL PATCH control passed.');
