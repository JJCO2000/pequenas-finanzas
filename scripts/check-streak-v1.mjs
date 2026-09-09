import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const migrations = read('src/core/data/database/migrations.ts');
const streakPolicy = read('src/core/progression/streak.ts');
const streakRepository = read('src/core/data/repositories/streakRepository.ts');
const provider = read('src/features/session/AppDataProvider.tsx');
const mapMission = read('src/features/adventure/components/AdventureCurrentMissionCard.tsx');
const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const gameRoute = read('src/app/game/[gameId].tsx');
const objects = read('src/features/games/ui/GameObjects.tsx');
const balloons = read('src/features/games/balloon-answer/Game.tsx');
const coinCatcher = read('src/features/games/coin-catcher/Game.native.tsx');
const treasure = read('src/features/games/treasure-split/Game.tsx');
const market = read('src/features/games/dino-market/Game.tsx');
const fossil = read('src/features/games/fossil-escape/Game.tsx');
const king = read('src/features/games/king-greedy/Game.tsx');
const memory = read('src/features/games/money-memory/Game.tsx');

assert.match(migrations, /const VERSION = 5;/, 'migration version must be 5');
assert.match(migrations, /CREATE TABLE IF NOT EXISTS streak_state/, 'streak_state table missing');
assert.match(migrations, /CREATE TABLE IF NOT EXISTS streak_events/, 'streak_events table missing');

for (const gameId of ['coin-catcher', 'balloon-answer', 'treasure-split', 'dino-market', 'fossil-escape', 'king-greedy', 'money-memory']) {
  assert.ok(streakPolicy.includes(`'${gameId}'`), `daily rotation missing ${gameId}`);
}
assert.match(streakRepository, /freezes_available < 2/, 'freeze cap must be enforced');
assert.match(streakRepository, /nextStreak % 7 === 0/, '7-day freeze milestone missing');
assert.match(streakRepository, /STREAK_EXTENDED/, 'streak extended event missing');
assert.match(streakRepository, /STREAK_FREEZE_USED/, 'freeze event missing');
assert.match(streakRepository, /STREAK_BROKEN/, 'break event missing');

assert.match(provider, /if \(result\.completed\) \{\s*await repository\.qualifyDailyStreak/, 'streak must qualify only after completed game');
assert.match(mapMission, /<StreakCard/, 'map streak CTA missing');
assert.match(camp, /<StreakCard/, 'camp streak integration missing');

assert.match(gameRoute, /useSafeAreaInsets/, 'game route safe-area integration missing');
assert.match(gameRoute, /paddingLeft: safeHorizontal/, 'game viewport horizontal safe area missing');

assert.match(objects, /balloonHighlightWide/, 'balloon depth treatment missing');
assert.match(objects, /chestGlow/, 'treasure chest glow missing');
assert.match(objects, /fossilGlow/, 'fossil pulse missing');
assert.match(objects, /memoryMedallion/, 'memory visual upgrade missing');
assert.match(balloons, /popBurst/, 'balloon pop burst missing');
assert.match(coinCatcher, /basketShadow/, 'coin catcher basket depth missing');
assert.match(coinCatcher, /bonusAura/, 'coin catcher bonus cue missing');
assert.match(treasure, /TreasureChest/, 'treasure game must use the chest object');
assert.match(market, /checkoutScan/, 'market checkout scan feedback missing');
assert.match(market, /shelfRail/, 'market shelf depth missing');
assert.match(fossil, /FossilObject/, 'fossil game must use fossil object art');
assert.match(king, /pointerPulse/, 'king wheel pointer animation missing');
assert.match(king, /wheelInnerRing/, 'king wheel physical rim missing');
assert.match(memory, /MemoryObject/, 'memory game must use enhanced memory objects');

console.log('PASS check-streak-v1: streak rules, safe-area and visual polish hooks for all seven games are wired.');
