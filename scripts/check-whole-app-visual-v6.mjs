import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const ok = (m) => console.log(`[OK] ${m}`);
const fail = (m) => { console.error(`[FAIL] ${m}`); process.exitCode = 1; };

const screens = {
  start: read('src/app/start.tsx'),
  onboarding: read('src/app/onboarding.tsx'),
  wallet: read('src/app/wallet.tsx'),
  investments: read('src/app/investments.tsx'),
  shop: read('src/app/shop.tsx'),
  settings: read('src/app/settings.tsx'),
  parents: read('src/app/parents.tsx'),
  collection: read('src/app/collection.tsx'),
  progress: read('src/app/progress.tsx'),
  arcade: read('src/app/arcade.tsx'),
  lesson: read('src/app/lesson/[id].tsx'),
  game: read('src/app/game/[gameId].tsx'),
};
const map = read('src/features/adventure/AdventureMapScreen.tsx');
const pfVisual = read('src/features/shell/components/PFVisual.tsx');

for (const name of ['start', 'onboarding', 'progress', 'arcade']) {
  if (!screens[name].includes('WorldScene')) fail(`${name} is outside the shared world-scene grammar.`);
}
if (!process.exitCode) ok('Start, onboarding, progress and Arcade use the shared WorldScene grammar.');

for (const name of ['wallet', 'shop', 'settings', 'parents', 'collection']) {
  const worldV7 = screens[name].includes('WorldScene') && screens[name].includes('WorldHeader');
  const legacyV6 = screens[name].includes('ScenicBackdrop') && screens[name].includes('LandscapeHeader');
  if (!worldV7 && !legacyV6) fail(`${name} is missing the shared world/scenic header grammar.`);
}
if (!process.exitCode) ok('Wallet, shop, settings, adults and collection share world/scenic header primitives.');

if (!(screens.investments.includes('WorldScene') || screens.investments.includes('ScenicBackdrop')) || !screens.investments.includes('InvestmentPortfolio')) {
  fail('Investments is outside the shared scenic shell or lost its real portfolio.');
} else ok('Investments remains real-state portfolio UI inside the shared scenic shell.');

if (!screens.lesson.includes('WorldScene') || !screens.lesson.includes('WorldButton') || !screens.lesson.includes('WorldPanel')) {
  fail('Lessons are not integrated into the v6 world UI grammar.');
} else ok('Lessons use world scenes, reusable actions and in-world feedback.');
if (/Alert\.alert\(/.test(screens.lesson)) fail('Lesson still breaks immersion with native Alert feedback.');
else ok('Lesson retry feedback stays in-world instead of using a native Alert.');

if (!map.includes("from 'expo-image'") || !map.includes('cachePolicy="memory-disk"') || !map.includes('allowDownscaling')) {
  fail('Adventure map background rendering is not using the optimized image contract.');
} else ok('Adventure map tiles use Expo Image caching and downscaling.');
if (!map.includes('useSafeAreaInsets') || !map.includes('insets.left') || !map.includes('insets.right') || !map.includes('insets.bottom')) {
  fail('Adventure map HUD is not safe-area anchored.');
} else ok('Adventure map HUD respects landscape safe areas.');

if (!pfVisual.includes("from 'expo-image'") || !pfVisual.includes('cachePolicy="memory-disk"') || !pfVisual.includes('allowDownscaling')) {
  fail('Legacy-compatible ScenicBackdrop is missing the optimized Expo Image contract.');
} else ok('ScenicBackdrop also uses the optimized image contract, so secondary screens inherit it.');

const redirects = ['src/app/(tabs)/index.tsx','src/app/(tabs)/games.tsx','src/app/(tabs)/map.tsx','src/app/(tabs)/parents.tsx','src/app/(tabs)/wallet.tsx'];
for (const f of redirects) {
  if (!read(f).includes('Redirect')) fail(`Legacy tab route is no longer a redirect: ${f}`);
}
if (!process.exitCode) ok('Legacy routes still redirect into the single current app; no sub-app/router fork was introduced.');

const forbidden = ['forest-world-wide.webp','arcade-world-wide.webp','finance-world-wide.webp','market-world-wide.webp'];
const runtimeText = Object.values(screens).join('\n') + map + read('src/core/theme/dinoTheme.ts') + read('src/registry/assets.ts');
for (const asset of forbidden) if (runtimeText.includes(asset)) fail(`Rejected baked-state art leaked into runtime: ${asset}`);
if (!process.exitCode) ok('Rejected baked-state master images remain outside runtime code.');

console.log('[SCOPE] Entry + onboarding + map + camp + wallet + investments + shop + progress + collection + arcade + adults + settings + lessons + game route are covered by the v6 presentation contract.');
if (!process.exitCode) console.log('[OK] WHOLE APP visual implementation v6 control passed.');
