import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
const json = (file) => JSON.parse(read(file));
function fail(message) { console.error(`[FAIL] ${message}`); process.exit(1); }
function has(file, pattern, message) { if (!pattern.test(read(file))) fail(message); }

const app = json('app.json');
if (app.expo?.orientation !== 'landscape') fail('Plan 2.1 requires expo.orientation=landscape.');
if (app.expo?.android?.package !== 'com.pequenasfinanzas.app') fail('Android package changed.');

const director = read('src/core/progression/ProgressionDirector.ts');
if (/Math\.random\s*\(/.test(director)) fail('ProgressionDirector must not use Math.random().');
has('src/core/progression/ProgressionDirector.ts', /'lesson'[\s\S]*'activity'[\s\S]*'game'[\s\S]*'decision'[\s\S]*'game'[\s\S]*'review'[\s\S]*'challenge'/, 'Structured infinite flow is missing.');
has('src/core/progression/ProgressionDirector.ts', /buildInitialAdventureDays[\s\S]*games: GameManifest\[\][\s\S]*dayNumber <= 7/, 'Curated first week must be able to introduce campaign games.');
has('src/core/economy/investmentPlan.ts', /INVESTMENT_TERM_LEVELS\s*=\s*4/, 'Investment maturity must be N+4.');
has('src/core/economy/investmentPlan.ts', /INVESTMENT_RETURN_PERCENT\s*=\s*50/, 'Investment return must be +50%.');
has('src/core/economy/arcadeRewardPolicy.ts', /\[1,\s*0\.5,\s*0\.25,\s*0\]/, 'Arcade reward policy must be 100/50/25/0.');
has('src/core/data/database/migrations.ts', /DROP INDEX IF EXISTS investments_one_active_per_profile/, 'Multiple active investments are not enabled.');
has('src/core/data/database/migrations.ts', /CREATE TABLE IF NOT EXISTS adventure_days/, 'adventure_days persistence missing.');
has('src/core/data/database/migrations.ts', /CREATE TABLE IF NOT EXISTS sync_outbox/, 'Cloud-ready sync boundary missing.');
has('src/features/adventure/AdventureMapScreen.tsx', /horizontal/, 'Horizontal map missing.');
has('src/features/adventure/AdventureMapScreen.tsx', /saveMapPosition/, 'Map position persistence missing.');
has('src/features/adventure/AdventureMapScreen.tsx', /ensureAdventureThrough/, 'Infinite map extension missing.');
has('src/app/arcade.tsx', /ARCADE|Arcade/, 'Arcade screen missing.');
has('src/registry/shop.ts', /effectDescription/, 'Shop effects are not described.');
has('src/features/games/coin-catcher/Game.native.tsx', /extraSeconds[\s\S]*basketWidthBonus[\s\S]*magnetRadius[\s\S]*scoreBonusEvery/, 'Coin Catcher upgrades are not wired.');

for (const file of [
  'assets/world/forest/forest-landscape.jpg',
  'assets/world/map/water-landscape.jpg',
  'assets/world/cave/cave-landscape.jpg',
  'assets/world/activity/grass-landscape.jpg',
  'assets/world/shop/terracotta-landscape.jpg',
]) {
  if (!fs.existsSync(file)) fail(`Landscape asset missing: ${file}`);
}

console.log('[OK] Plan 2.1 runtime invariants are present and Plan 1.1 package/boundaries remain compatible.');
