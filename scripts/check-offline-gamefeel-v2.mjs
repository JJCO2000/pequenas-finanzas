import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const gameRoute = read('src/app/game/[gameId].tsx');
const resultOverlay = read('src/features/adventure/components/MissionCompleteOverlay.tsx');
const play = read('src/app/play.tsx');
const balloon = read('src/features/games/balloon-answer/Game.tsx');
const memory = read('src/features/games/money-memory/Game.tsx');
const treasure = read('src/features/games/treasure-split/Game.tsx');
const coin = read('src/features/games/coin-catcher/Game.native.tsx');
const shop = read('src/app/shop.tsx');
const theme = read('src/core/theme/dinoTheme.ts');

assert.match(gameRoute, /visible=\{Boolean\(result\)\}/, 'post-game overlay must appear immediately when a GameResult exists');
assert.match(gameRoute, /stats=\{result \? resultStats\(result\)/, 'post-game overlay must expose game metrics');
assert.match(resultOverlay, /saving\?: boolean/, 'result overlay must represent saving state without hiding completion');
assert.match(resultOverlay, /detailGrid/, 'result overlay must render detailed statistics');

assert.match(play, /adventureDays\.length > 0/, 'map route must wait for hydrated adventure days');
assert.match(play, /Preparando caminos, retos y recompensas/, 'map must show an intentional boot state instead of an empty world');
assert.match(theme, /map: ASSETS\.world\.forestLandscape/, 'adventure map should use the richer world art selected for v2');

assert.match(balloon, /RisingBalloon/, 'balloon game must use real rising balloons');
assert.match(balloon, /onEscape/, 'balloons must have an actual escape outcome');
assert.doesNotMatch(balloon, /round\.items\.map\(/, 'balloon game must not regress to the old static six-balloon board');

assert.match(memory, /FlipCard/, 'memory game must use flip cards');
assert.match(memory, /'shuffle'/, 'memory game must include a shuffle phase');
assert.match(memory, /'reveal'/, 'memory game must reveal the extra card after the shuffle');
assert.match(memory, /rotateY/, 'memory cards must perform a 3D flip');
assert.match(memory, /\+1 CARTA/, 'new-card beat must be explicit');

assert.match(treasure, /<Modal visible=\{phase === 'result'\}/, 'treasure result must use a readable popup');
assert.match(treasure, /QUÉ PASÓ/, 'treasure popup must explain the consequence');
assert.match(treasure, /EQUILIBRIO/, 'treasure popup must compare choice with the round balance');

assert.match(coin, /<BasketObject \/>/, 'coin catcher must render a basket independent of optional art');
assert.doesNotMatch(coin, />\s*CANASTA\s*</i, 'basket must not contain CANASTA text');

assert.match(shop, /LEGENDARIO/, 'egg shop must expose rarity/world identity');
assert.match(shop, /worldPortal/, 'egg cards must have distinct world presentation');
assert.match(shop, /wobble/, 'selected egg must have game-like motion');

console.log('PASS offline-gamefeel-v2: immediate results, hydrated map, rising balloons, flip/shuffle memory, treasure popup, basket and egg presentation are wired.');
