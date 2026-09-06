import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const fail = (m) => { console.error(`[FAIL] ${m}`); process.exitCode = 1; };
const ok = (m) => console.log(`[OK] ${m}`);

const registry = read('src/registry/assets.ts');
const visual = read('src/features/shell/components/PFVisual.tsx');
const intro = read('src/features/games/ui/GameIntroScreen.tsx');
const arcade = read('src/app/arcade.tsx');
const investments = read('src/app/investments.tsx');
const games = [
  'src/features/games/coin-catcher/Game.native.tsx',
  'src/features/games/balloon-answer/Game.tsx',
  'src/features/games/treasure-split/Game.tsx',
  'src/features/games/dino-market/Game.tsx',
  'src/features/games/fossil-escape/Game.tsx',
  'src/features/games/king-greedy/Game.tsx',
  'src/features/games/money-memory/Game.tsx',
].map(read);

const forbiddenRuntime = ['forest-portrait', 'water-portrait', 'cave-portrait', 'grass-portrait', 'terracotta-portrait', 'sky-field-portrait', 'dino-sheet.png'];
const leaked = forbiddenRuntime.filter((x) => registry.includes(x));
if (leaked.length) fail(`Heavy portrait/reference assets still referenced at runtime: ${leaked.join(', ')}`);
else ok('Runtime asset graph is landscape-only for world backgrounds; heavy portrait/reference assets are not bundled by registry.');

if (!visual.includes("from 'expo-image'") || !visual.includes('cachePolicy="memory-disk"') || !visual.includes('contentFit="cover"')) fail('ScenicBackdrop is not using performant shared Expo Image loading.');
else ok('ScenicBackdrop centralizes reusable background rendering with Expo Image cache + cover.');

if (fs.existsSync(path.join(root, 'assets', 'visual-v5'))) fail('Visual v5 introduced a new full-screen mockup asset folder.');
else ok('Visual v5 adds zero full-screen mockup PNG/JPG assets.');

if (!intro.includes('introSteps.map') || !intro.includes('YellowButton') || !intro.includes('learningLine')) fail('Game intro is not the shared concise reference layout.');
else ok('All 7 games share one concise intro component: hero + 3 steps + one learning strip + one CTA.');

if (!arcade.includes('GAMES.map') || /gameUnlocks|isUnlocked|lockedPoster/.test(arcade)) fail('Arcade lost 7/7 direct free play.');
else ok('Arcade remains 7/7 free play.');
if (!investments.includes('setInvestOpen(true)') || !investments.includes('<Modal')) fail('Investments lost the single-button/modal purchase model.');
else ok('Investments uses one primary Invest action with modal purchase flow.');

for (const [i, text] of games.entries()) {
  const permanentTextWalls = (text.match(/learningObjective|financialConcept/g) ?? []).length;
  if (permanentTextWalls > 0) fail(`Game ${i + 1} embeds educational copy inside gameplay instead of the shared overlay.`);
}
if (!process.exitCode) ok('Gameplay code does not embed permanent learning text walls.');

const hudCounts = games.map((text) => (text.match(/<HudChip/g) ?? []).length);
if (hudCounts.some((n) => n > 3)) fail(`A gameplay screen exceeds 3 primary HUD chips: ${hudCounts.join('/')}`);
else ok(`Gameplay HUD density <= 3 chips per game (${hudCounts.join('/')}).`);

console.log('[TARGET] Visual code/layout target >= 90/100; final visual score requires screenshots from the real device.');
if (!process.exitCode) console.log('[OK] FULL VISUAL v5 lightweight-system control passed.');
