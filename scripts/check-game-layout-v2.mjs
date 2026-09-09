import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const route = read('src/app/game/[gameId].tsx');
const coin = read('src/features/games/coin-catcher/Game.native.tsx');
const treasure = read('src/features/games/treasure-split/Game.tsx');
const market = read('src/features/games/dino-market/Game.tsx');
const escape = read('src/features/games/fossil-escape/Game.tsx');
const king = read('src/features/games/king-greedy/Game.tsx');
const memory = read('src/features/games/money-memory/Game.tsx');
const balloons = read('src/features/games/balloon-answer/Game.tsx');

// Global shell: controls overlay the reserved corners instead of stealing vertical gameplay space.
assert.match(route, /styles\.controlsOverlay/, 'game shell must use overlay controls');
assert.match(route, /styles\.floatingBack/, 'compact back control missing');
assert.doesNotMatch(route, /styles\.gameNav/, 'game shell must not reserve a full-height navigation row');
assert.match(route, /gameViewport: \{ flex: 1/, 'game viewport must retain full flexible height');

// Screens with a top prompt reserve horizontal corner space for shell controls.
for (const [name, source] of Object.entries({ treasure, market, escape, king, memory, balloons })) {
  assert.match(source, /paddingLeft: 100, paddingRight: 48/, `${name} top row must clear overlay controls horizontally`);
}

// Coin Catcher: physics and rendering use the measured game canvas, not the whole phone window.
assert.match(coin, /type LayoutChangeEvent/, 'coin catcher must type its layout measurement');
assert.match(coin, /onCanvasLayout/, 'coin catcher canvas measurement missing');
assert.match(coin, /onLayout=\{onCanvasLayout\}/, 'coin catcher root must report its actual layout');
assert.match(coin, /getWorldLayout\(measuredWidth, measuredHeight\)/, 'coin catcher world layout must use measured viewport');
assert.match(coin, /function BasketObject/, 'coin catcher guaranteed basket missing');
assert.match(coin, /basketY = stageHeight - 92/, 'basket must be placed relative to measured stage height');

// Treasure Split: never clip the 142x130 chest inside a shorter hidden container.
assert.match(treasure, /sourceChestScale/, 'treasure source needs an explicit scaled chest wrapper');
assert.match(treasure, /overflow: 'visible'/, 'treasure chest container must not clip the chest');
assert.doesNotMatch(treasure, /Arrastra el valor/, 'treasure instructions must match the plus/minus controls');
assert.match(treasure, /Usa \+ \/ − para repartir/, 'treasure plus/minus instruction missing');

// Market: six products fit predictably as 3x2 and category controls must actually filter.
assert.match(market, /type MarketFilter = 'all' \| MarketCategory/, 'market filter state missing');
assert.match(market, /displayedItems/, 'market must render filtered items');
assert.match(market, /changeFilter/, 'market tabs must be functional controls');
assert.match(market, /width: '32%', height: '46%'/, 'market product cards must use a stable 3x2 layout');
assert.match(market, /overflow: 'hidden'/, 'market aisle must contain its products');

// Cave: landmarks live inside a bounded field instead of four independent absolute cards.
assert.match(escape, /landmarkField/, 'cave landmark field missing');
assert.match(escape, /landmarkIcon/, 'cave landmarks need distinct visual identities');
assert.doesNotMatch(escape, /left: spot\.left, top: spot\.top/, 'cave must not position large cards by unconstrained hotspot percentages');

// Roulette: a true circular wheel, circular pockets, fixed pointer and upright labels during rotation.
assert.match(king, /width: 244, height: 244, borderRadius: 122/, 'roulette wheel must be circular');
assert.match(king, /pocket: \{ position: 'absolute', width: 54, height: 54, borderRadius: 27/, 'roulette needs circular pockets');
assert.match(king, /counterRotate/, 'roulette labels must counter-rotate to remain readable');
assert.match(king, /fullTurns = 6 \+/, 'roulette must complete multiple physical turns before stopping');
assert.match(king, /Easing\.out\(Easing\.exp\)/, 'roulette must visibly decelerate');
assert.match(king, /pointerTip/, 'roulette fixed result pointer missing');

console.log('PASS check-game-layout-v2: full-height shell, measured canvas, contained layouts and roulette geometry are guarded.');
