import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const ok = (label) => console.log(`[OK] ${label}`);
const fail = (label) => { console.error(`[FAIL] ${label}`); process.exitCode = 1; };
const expect = (cond, label) => cond ? ok(label) : fail(label);

const files = {
  coin: read('src/features/games/coin-catcher/Game.native.tsx'),
  balloon: read('src/features/games/balloon-answer/Game.tsx'),
  treasure: read('src/features/games/treasure-split/Game.tsx'),
  market: read('src/features/games/dino-market/Game.tsx'),
  escape: read('src/features/games/fossil-escape/Game.tsx'),
  king: read('src/features/games/king-greedy/Game.tsx'),
  memory: read('src/features/games/money-memory/Game.tsx'),
  route: read('src/app/game/[gameId].tsx'),
  arcade: read('src/app/arcade.tsx'),
  play: read('src/app/play.tsx'),
  result: read('src/features/adventure/components/MissionCompleteOverlay.tsx'),
  collection: read('src/app/collection.tsx'),
  investments: read('src/app/investments.tsx'),
  campBack: read('src/features/shell/navigation/useCampBack.ts'),
  start: read('src/app/start.tsx'),
};
const joined = Object.values(files).join('\n');

expect(!joined.includes('StyleSheet.absoluteFillObject'), 'RN 0.86: no unsupported StyleSheet.absoluteFillObject.');
expect(!/<(?:Animated\.)?Image\b[^>]*\bpointerEvents=/.test(joined), 'RN 0.86: pointerEvents is not assigned directly to Image/Animated.Image.');
expect(files.coin.includes('useSharedValue<number>(178)'), 'Coin Catcher shared speed is explicitly number-typed.');
expect(files.treasure.includes('TREASURE_SPLIT_ROUNDS[roundIndex] ?? TREASURE_SPLIT_ROUNDS[0]!'), 'Treasure Split guards strict indexed round access.');
expect(files.escape.includes('const activeClue = active === null ? null : (FOSSIL_ESCAPE_CLUES[active] ?? null)') && files.escape.includes('const activeSpot = active === null ? null : (HOTSPOTS[active] ?? null)') && files.escape.includes('if (!clue) return;'), 'Fossil Escape guards active clue/hotspot indexes.');
expect(files.king.includes('const outcome = SPACES[index];') && files.king.includes('if (!outcome) return;') && files.king.includes('SPACES[active]?.label'), 'King Greedy guards computed and displayed roulette outcome indexes.');
expect(files.balloon.includes('if (!round || waveItems.length === 0)') && files.market.includes('if (!mission) return null;'), 'Balloon and Market guard dynamic round/mission indexes.');
expect(files.memory.includes('const newcomer = pool[newcomerIndex]!') && files.memory.includes('MONEY_MEMORY_CARDS'), 'Money Memory marks deterministic non-empty pool accesses explicitly.');
expect(files.route.includes('const finish = (nextResult: GameResult)') && files.route.includes('onFinish={finish}'), 'Game route has an explicit typed GameResult callback boundary.');

const arcadeIsFreePlay =
  files.arcade.includes('GAMES.map') &&
  files.arcade.includes("mode: 'arcade'") &&
  !/gameUnlocks|isUnlocked|lockedPoster|ctaLocked|POR DESCUBRIR/.test(files.arcade) &&
  !/\bdisabled\s*=/.test(files.arcade);
expect(arcadeIsFreePlay, 'Arcade is 7/7 free-play without campaign unlock gating.');

expect(files.play.includes('adventureDays.length > 0') && files.play.includes('waitedTooLong') && files.play.includes('REINTENTAR MAPA'), 'Adventure map has a bounded local-loading recovery path.');
expect(!files.result.includes('Boolean(saveError)') && files.result.includes('Guardado pendiente') && files.result.includes('Puedes salir ahora'), 'Result screen never traps navigation behind a secondary save error.');
expect(files.balloon.includes('const ITEMS_PER_WAVE = 2') && files.balloon.includes('waveItems.map') && files.balloon.includes('ITEM_ICON'), 'Balloon game uses two simultaneous visual choices with item drawings.');
expect(files.balloon.includes('onPressIn={pop}') && files.balloon.includes('hitSlop={14}') && files.balloon.includes('pressedRef.current'), 'Balloon taps fire on touch-down with an enlarged guarded hit target.');
expect(files.collection.includes('Los 7 juegos son libres') && files.collection.includes('locked={false}') && !files.collection.includes('gameUnlocks'), 'Museum does not mislabel free Arcade games as locked.');
expect(files.collection.includes('Hallazgos ocultos') && files.collection.includes('HIDDEN_FINDS') && files.collection.includes('museum.find.'), 'Museum includes a future-ready hidden finds subsection with persisted discovery keys.');
expect(files.investments.includes('ELIGES') && files.investments.includes('VIAJA') && files.investments.includes('REGRESA') && files.investments.includes('×1.5'), 'Investments explains the full money journey visually.');
expect(files.route.includes("params: { from: 'game-result' }") && files.campBack.includes("const fromGameResult = from === 'game-result'") && files.campBack.includes("router.replace('/play' as any)"), 'Post-game Arcade back returns deterministically to the adventure map instead of a stale result route.');
expect(files.start.includes('hotspotPanel') && files.start.includes('CAMPAMENTO') && files.start.includes('missionAccent') && files.start.includes('SceneHotspot'), 'Home preserves its navigation structure while adding deliberate visual hierarchy.');

if (process.exitCode) process.exit(process.exitCode);
ok('PLAN 7 strict TypeScript/RN compatibility guard passed.');
