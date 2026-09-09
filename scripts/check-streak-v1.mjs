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

console.log('PASS check-streak-v1: persistence, qualification, UI, safe-area and shared visual upgrades are wired.');
