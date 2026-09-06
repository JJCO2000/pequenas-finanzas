import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let pass = 0;
let fail = 0;
const ok = (cond, msg) => { if (cond) { console.log(`[OK] ${msg}`); pass++; } else { console.error(`[FAIL] ${msg}`); fail++; } };
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));
const noConflicts = s => !/(<<<<<<<|=======|>>>>>>>)/.test(s);
const maxFont = s => Math.max(0, ...[...s.matchAll(/fontSize:\s*(\d+(?:\.\d+)?)/g)].map(m => Number(m[1])));

const screens = [
  {name:'Inicio', rel:'src/app/start.tsx', max:22, contract:s=>s.includes('SceneHotspot')&&s.includes('FloatingCard')&&!s.includes('WorldLibraryCard')},
  {name:'Onboarding', rel:'src/app/onboarding.tsx', max:30, contract:s=>s.includes('ActionPill')&&!s.includes('WorldLibraryCard')},
  {name:'Mapa', rel:'src/features/adventure/AdventureMapScreen.tsx', max:22, contract:s=>s.includes('mapVolcano')&&s.includes('mapIslands')},
  {name:'Campamento', rel:'src/features/adventure/components/AdventureCampMenu.tsx', max:18, contract:s=>s.includes('SceneHotspot')&&!s.includes('WorldLibraryCard')},
  {name:'Mi dinero', rel:'src/app/wallet.tsx', max:18, contract:s=>s.includes('SceneHotspot')&&s.includes('ActionPill')},
  {name:'Inversiones', rel:'src/app/investments.tsx', max:22, contract:s=>s.includes('InvestmentPortfolio')&&s.includes('ActionPill')&&!s.includes('WorldLibraryCard')},
  {name:'Arcade', rel:'src/app/arcade.tsx', max:18, contract:s=>s.includes('GameTile')&&/columns = width >= 700 \? 4/.test(s)&&!s.includes('WorldLibraryCard')},
  {name:'Tienda', rel:'src/app/shop.tsx', max:18, contract:s=>s.includes('CollectibleEgg')&&!s.includes('WorldLibraryCard')},
  {name:'Progreso', rel:'src/app/progress.tsx', max:18, contract:s=>s.includes('GameTile')||s.includes('SceneHotspot')||s.includes('FloatingCard')},
  {name:'Colección', rel:'src/app/collection.tsx', max:18, contract:s=>s.includes('GameTile')&&s.includes('CollectibleEgg')},
  {name:'Adultos', rel:'src/app/parents.tsx', max:18, contract:s=>s.includes('ParentGate')&&s.includes('HudPill')},
  {name:'Gate adultos', rel:'src/features/parents/ParentGate.tsx', max:22, contract:s=>/width:\s*'58%'/.test(s)||/maxWidth:\s*5\d\d/.test(s)},
  {name:'Ajustes', rel:'src/app/settings.tsx', max:18, contract:s=>s.includes('ActionPill')||s.includes('FloatingCard')},
  {name:'Lección', rel:'src/app/lesson/[id].tsx', max:22, contract:s=>s.includes('FloatingCard')&&s.includes('DecisionQuiz')&&!s.includes('WorldPanel')},
  {name:'Quiz', rel:'src/game-kits/quiz/DecisionQuiz.tsx', max:14, contract:s=>/width:\s*'31%'/.test(s)&&s.includes('optionIndex')},
  {name:'Intro juego', rel:'src/features/games/ui/GameIntroScreen.tsx', max:24, contract:s=>s.includes('ActionPill')&&!s.includes('WorldPanel')},
  {name:'Resultado', rel:'src/features/adventure/components/MissionCompleteOverlay.tsx', max:20, contract:s=>/width:\s*'56%'/.test(s)},
  {name:'Atrapa monedas', rel:'src/features/games/coin-catcher/components/CoinCatcherHud.tsx', max:14, contract:s=>/minWidth:\s*52/.test(s)},
  {name:'Globos', rel:'src/features/games/balloon-answer/Game.tsx', max:16, contract:s=>/top:\s*\{ height:\s*42/.test(s)&&/width:\s*84, height:\s*122/.test(s)},
  {name:'Tesoro', rel:'src/features/games/treasure-split/Game.tsx', max:32, contract:s=>/width:\s*'14%'/.test(s)&&/width:\s*'16%'/.test(s)},
  {name:'Mercado', rel:'src/features/games/dino-market/Game.tsx', max:24, contract:s=>/width:\s*'24%'/.test(s)&&/width:\s*'19%'/.test(s)},
  {name:'Escape fósil', rel:'src/features/games/fossil-escape/Game.tsx', max:30, contract:s=>/width:\s*104/.test(s)&&/width:\s*110/.test(s)},
  {name:'Rey codicioso', rel:'src/features/games/king-greedy/Game.tsx', max:20, contract:s=>/width:\s*236, height:\s*220/.test(s)&&/width:\s*'26%'/.test(s)},
  {name:'Memoria', rel:'src/features/games/money-memory/Game.tsx', max:16, contract:s=>/width:\s*'64%'/.test(s)&&/height:\s*82/.test(s)},
];

console.log('=== REVIEW 1/3 · integrity / no forgotten screen ===');
for (const screen of screens) {
  ok(exists(screen.rel), `${screen.name}: file exists`);
  if (exists(screen.rel)) ok(noConflicts(read(screen.rel)), `${screen.name}: no conflict/placeholder corruption`);
}

console.log('\n=== REVIEW 2/3 · density / giant-text / overlap-risk ===');
for (const screen of screens) {
  if (!exists(screen.rel)) continue;
  const s=read(screen.rel);
  const max=maxFont(s);
  ok(max <= screen.max, `${screen.name}: typography bounded (${max} <= ${screen.max})`);
  ok(!/(width|height):\s*['"]?(?:9[0-9]|100)%['"]?[\s\S]{0,120}backgroundColor:\s*colors\.glassDark/.test(s), `${screen.name}: no obvious full-screen dark dashboard panel`);
}
const surface=read('src/features/shell/gameui/GameSurface.tsx');
ok(/gameTile:[\s\S]*?width:\s*142[\s\S]*?height:\s*110/.test(surface), 'Shared game tile baseline stays 142x110');
ok(/hotspot:[\s\S]*?width:\s*82/.test(surface), 'Shared scene hotspots stay compact');
ok(!/contentFit="cover"/.test(read('src/app/arcade.tsx')), 'Arcade thumbnails are not zoom-cropped');
ok(/maxTile = 150/.test(read('src/app/arcade.tsx')), 'Arcade tile width is capped at 150');
ok(/game\.minimumDay \?\? 1/.test(read('src/app/arcade.tsx')) && !read('src/app/arcade.tsx').includes('game.unlockDay'), 'Arcade day metadata uses GameManifest.minimumDay SSOT');
ok(!/<Image[\s\S]{0,180}pointerEvents=/.test(read('src/features/adventure/AdventureMapScreen.tsx')), 'Map decorative Image does not receive unsupported pointerEvents prop');
ok(/DAY_STEP\s*=\s*108|DAY_STEP:\s*108|DAY_STEP = 108/.test(read('src/features/adventure/presentation/adventureMapLayout.ts')), 'Map spacing is zoomed out');
ok(/ADVENTURE_NODE_SIZE\s*=\s*44/.test(read('src/features/adventure/presentation/adventurePresentation.ts')), 'Map nodes are capped at 44');

console.log('\n=== REVIEW 3/3 · per-screen scene/interaction contract ===');
for (const screen of screens) {
  if (!exists(screen.rel)) continue;
  ok(Boolean(screen.contract(read(screen.rel))), `${screen.name}: v9 scene-first contract`);
}
const theme=read('src/core/theme/dinoTheme.ts');
ok(theme.includes('forestLandscape')&&theme.includes('mapWaterLandscape')&&theme.includes('shopLandscape'), 'Theme uses distinct scene backgrounds');
ok(!read('src/features/games/ui/GameIntroScreen.tsx').includes('WorldPanel'), 'Game intro giant panel removed');
ok(!read('src/features/games/money-memory/Game.tsx').includes("stage: { flex: 1, minHeight: 0, borderRadius"), 'Memory stage is no longer boxed inside another giant panel');
ok(!read('src/features/games/king-greedy/Game.tsx').includes("wheelPane: { flex: 1, minWidth: 0, borderRadius"), 'King wheel is rendered as gameplay, not a card inside a card');

const routeDir=path.join(root,'src/app');
const routes=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(/\.tsx$/.test(e.name)) routes.push(path.relative(root,p).replaceAll('\\','/'));}}
walk(routeDir);
ok(routes.length >= 21, `Route inventory covers ${routes.length} app TSX files`);
for(const rel of routes.filter(r=>r.includes('/(tabs)/')||r==='src/app/index.tsx')) {
  const s=read(rel);
  ok(s.includes('Redirect')||s.includes('router.replace')||rel.endsWith('_layout.tsx'), `${rel}: legacy/navigation route accounted for`);
}

console.log(`\nGAME SCENE v9: ${pass} PASS / ${fail} FAIL`);
console.log('[VISUAL-GATE] No static test is allowed to declare aesthetic PASS. Real device screenshots are mandatory.');
process.exit(fail ? 1 : 0);
