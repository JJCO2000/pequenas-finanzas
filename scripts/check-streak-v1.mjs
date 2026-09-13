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
assert.match(gameRoute, /styles\.controlsOverlay/, 'game controls must overlay reserved corners instead of consuming gameplay height');
assert.doesNotMatch(gameRoute, /styles\.gameNav/, 'game navigation row must not shrink gameplay');
assert.match(gameRoute, /paddingLeft: safeHorizontal/, 'game viewport horizontal safe area missing');

assert.match(objects, /balloonHighlightWide/, 'balloon depth treatment missing');
assert.match(objects, /chestGlow/, 'treasure chest treatment missing');
assert.match(balloons, /popBurst/, 'balloon pop burst missing');

assert.match(coinCatcher, /function BasketObject/, 'coin catcher must render a guaranteed basket object');
assert.match(coinCatcher, /onLayout=\{onCanvasLayout\}/, 'coin catcher must measure the real gameplay viewport');
assert.match(coinCatcher, /basketBody/, 'coin catcher basket body missing');
assert.match(coinCatcher, /bonusAura/, 'coin catcher bonus cue missing');

assert.match(treasure, /availableCoinTray/, 'treasure free coins must live outside the chest');
assert.match(treasure, /<TreasureChest count=\{0\}/, 'treasure chest must be decorative and not cover the free-coin pile');
assert.match(treasure, /overflow: 'visible'/, 'treasure chest must not be clipped');

assert.match(market, /DEBES LLEVAR:/, 'market must explicitly label required categories');
assert.match(market, /cartChecklist/, 'market cart must repeat the mission checklist');
assert.match(market, /getMarketFallbackGlyph/, 'market missing-art products need recognizable fallbacks');
assert.match(market, /displayedItems/, 'market category tabs must filter products');
assert.match(market, /checkoutScan/, 'market checkout scan feedback missing');

assert.match(fossil, /landmarkField/, 'cave exploration needs a bounded landmark field');
assert.match(fossil, /landmarkIcon/, 'cave landmarks need distinct visual identities');

assert.match(king, /Animated\.timing\(wheelRotation/, 'king roulette must physically rotate');
assert.match(king, /Easing\.out\(Easing\.exp\)/, 'king roulette must decelerate like a wheel');
assert.match(king, /counterRotate/, 'king roulette labels must stay readable while wheel rotates');
assert.match(king, /outcomeIndex/, 'king roulette result selection must be explicit');
assert.doesNotMatch(king, /setInterval\(\(\) => setActive/, 'king roulette must not fake spinning by cycling active cards');
assert.match(king, /pointerTip/, 'king roulette needs a fixed result pointer');

for (const glyph of ['🐷', '🎯', '🧾', '📋', '💧', '❤️', '🌱', '📈']) {
  assert.ok(memory.includes(glyph), `memory visual missing distinct glyph ${glyph}`);
}
assert.match(memory, /Voltean · se mezclan · aparece una más/, 'memory instructions must explain the flip-shuffle-new-card loop');
assert.match(memory, /rotateY/, 'memory cards must visibly flip instead of only swapping content');

console.log('PASS check-streak-v1: streak rules and current game visual regression guards are wired.');
