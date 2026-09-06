import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const checks = [];
const check = (condition, label) => checks.push({ ok: Boolean(condition), label });

const arcade = read('src/app/arcade.tsx');
const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const start = read('src/app/start.tsx');
const wallet = read('src/app/wallet.tsx');
const investments = read('src/app/investments.tsx');
const shop = read('src/app/shop.tsx');
const progress = read('src/app/progress.tsx');
const collection = read('src/app/collection.tsx');
const settings = read('src/app/settings.tsx');
const parents = read('src/app/parents.tsx');
const map = read('src/features/adventure/AdventureMapScreen.tsx');
const mapNode = read('src/features/adventure/components/AdventureMapNode.tsx');
const currentMission = read('src/features/adventure/components/AdventureCurrentMissionCard.tsx');
const library = read('src/features/shell/world/WorldLibrary.tsx');
const objects = read('src/features/games/ui/GameObjects.tsx');
const balloon = read('src/features/games/balloon-answer/Game.tsx');
const treasure = read('src/features/games/treasure-split/Game.tsx');
const fossil = read('src/features/games/fossil-escape/Game.tsx');
const memory = read('src/features/games/money-memory/Game.tsx');
const king = read('src/features/games/king-greedy/Game.tsx');
const market = read('src/features/games/dino-market/Game.tsx');
const coin = read('src/features/games/coin-catcher/Game.native.tsx');
const theme = read('src/core/theme/dinoTheme.ts');
const docs = read('docs/research/COURSE_IMPLEMENTATION_V7_LIBRARY_WORLD.md');

check(library.includes('WorldLibraryCard') && library.includes("from 'expo-image'") && library.includes('cachePolicy="memory-disk"'), 'Shared illustrated library card exists and uses optimized Expo Image.');
check(arcade.includes('Biblioteca de retos') && arcade.includes('GAMES.map') && arcade.includes('WorldLibraryCard') && arcade.includes('columns = width >= 1250 ? 4 : width >= 900 ? 3 : 2'), 'Arcade is a responsive 2–4 column visual library.');
check(!/gameUnlocks|isUnlocked|lockedPoster|disabled=\{!isUnlocked\}/.test(arcade), 'Arcade remains 7/7 free-play.');
check(camp.includes('MENU_ITEMS.map') && camp.includes('WorldLibraryCard') && camp.includes("width: '31.8%'") && !camp.includes("width: '49%'"), 'Camp is a 3x2 visual module library, not the old dashboard/list.');
check([start,wallet,investments,shop,progress,collection,settings,parents].every((x) => x.includes('<WorldScene')), 'Core app surfaces all live inside the shared world scene grammar.');
check([start,wallet,shop,progress,collection].every((x) => x.includes('WorldLibraryCard')), 'Major browse/choice surfaces use shared illustrated library cards.');
check(map.includes('ACTIVE_THEME.world.map ?? ACTIVE_THEME.world.arcade') && mapNode.includes('ACTIVE_THEME.gameThumbnails') && currentMission.includes('ACTIVE_THEME.gameThumbnails'), 'Adventure map and current mission use the approved illustrated art system.');
check(mapNode.includes('Boolean(gameArt) ? styles.gameNode : undefined') && !mapNode.includes('gameArt && styles.gameNode'), 'Adventure map game-art styling is explicitly boolean and safe for React Native numeric image sources.');
check(theme.includes('shell: ASSETS.world.v6GameIntroWide') && theme.includes('camp: ASSETS.world.v6GameIntroWide') && theme.includes('investments: ASSETS.world.v6GameIntroWide') && theme.includes('lesson: ASSETS.world.v6GameIntroWide'), 'Dino theme uses the approved cartoon world background across the product.');
check(objects.includes('BalloonObject') && balloon.includes('<BalloonObject'), 'Balloon game renders balloon-shaped interactive objects.');
check(objects.includes('TreasureChest') && treasure.includes('<TreasureChest') && treasure.includes('<CoinPile'), 'Treasure game renders chest and actual coin sprites.');
check(objects.includes('FossilObject') && fossil.includes('<FossilObject'), 'Fossil Escape renders fossil objects instead of abstract hotspot glyphs.');
check(objects.includes('MemoryObject') && memory.includes('<MemoryObject'), 'Money Memory renders semantic object art instead of geometric glyphs.');
check(king.includes('<CoinPile') && king.includes('COFRE SEGURO') && king.includes('MESA DE RIESGO'), 'King Greedy renders safe and exposed money as coins.');
check(market.includes('ACTIVE_THEME.marketItems') && market.includes('<Image source={itemArt}'), 'Dino Market continues to render real product sprites.');
check(coin.includes('const COIN_R = 16') && coin.includes('const BONUS_R = 18') && coin.includes('const HAZARD_R = 20') && coin.includes('const BASE_BASKET_WIDTH = 98') && coin.includes('const BASKET_HEIGHT = 25'), 'Coin Catcher accepted collision geometry remains unchanged.');
check(docs.includes('Grafit Studio') && docs.includes('Nima Tahami') && docs.includes('Malewicz') && docs.includes('PedroTech') && docs.includes('Coco Code') && docs.includes('Riot Games') && docs.includes('Supercell') && docs.includes('Ubisoft'), 'v7 implementation records the requested training/company sources and their code mapping.');

for (const c of checks) console.log(`${c.ok ? '[OK]' : '[FAIL]'} ${c.label}`);
const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error(`\nWORLD LIBRARY v7 failed: ${failed.length}/${checks.length}.`);
  process.exit(1);
}
console.log('[OK] WORLD LIBRARY v7 implementation control passed.');
