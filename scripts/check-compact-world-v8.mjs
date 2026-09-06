import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
let failures=0, passes=0;
const ok=(msg)=>{passes++; console.log(`[OK] ${msg}`)};
const fail=(msg)=>{failures++; console.error(`[FAIL] ${msg}`)};
const check=(cond,msg)=>cond?ok(msg):fail(msg);

const screens=[
 ['Inicio','src/app/start.tsx',30],
 ['Onboarding','src/app/onboarding.tsx',46],
 ['Mapa','src/features/adventure/AdventureMapScreen.tsx',30],
 ['Campamento','src/features/adventure/components/AdventureCampMenu.tsx',28],
 ['Mi dinero','src/app/wallet.tsx',30],
 ['Inversiones','src/app/investments.tsx',30],
 ['Arcade','src/app/arcade.tsx',28],
 ['Tienda','src/app/shop.tsx',30],
 ['Progreso','src/app/progress.tsx',28],
 ['Colección','src/app/collection.tsx',28],
 ['Adultos','src/app/parents.tsx',28],
 ['Ajustes','src/app/settings.tsx',28],
 ['Lección','src/app/lesson/[id].tsx',30],
 ['Quiz','src/game-kits/quiz/DecisionQuiz.tsx',28],
 ['Intro juego','src/features/games/ui/GameIntroScreen.tsx',32],
 ['Atrapa monedas','src/features/games/coin-catcher/Game.native.tsx',46],
 ['Globos','src/features/games/balloon-answer/Game.tsx',24],
 ['Tesoro','src/features/games/treasure-split/Game.tsx',36],
 ['Mercado','src/features/games/dino-market/Game.tsx',24],
 ['Escape fósil','src/features/games/fossil-escape/Game.tsx',46],
 ['Rey codicioso','src/features/games/king-greedy/Game.tsx',32],
 ['Memoria','src/features/games/money-memory/Game.tsx',24],
 ['Resultado','src/features/adventure/components/MissionCompleteOverlay.tsx',28],
];

console.log('=== REVISION 1/3 · integridad estructural por pantalla ===');
for(const [name,file] of screens){
 const src=read(file);
 check(src.length>120 && !src.includes('<<<<<<<') && !src.includes('>>>>>>>'),`${name}: archivo íntegro, sin conflictos/placeholder roto`);
 check(src.includes('export ') || src.includes('function '),`${name}: componente/implementación presente`);
}

console.log('\n=== REVISION 2/3 · densidad / gigantismo / texto ===');
for(const [name,file,maxFont] of screens){
 const src=read(file);
 const fonts=[...src.matchAll(/fontSize\s*:\s*(\d+(?:\.\d+)?)/g)].map(m=>Number(m[1]));
 const max=fonts.length?Math.max(...fonts):0;
 check(max<=maxFont,`${name}: tipografía acotada (max ${max} <= ${maxFont})`);
 check(!/fontSize\s*:\s*(?:5\d|[6-9]\d|\d{3,})/.test(src),`${name}: sin texto monstruoso permanente`);
}

console.log('\n=== REVISION 3/3 · contrato visual y navegación ===');
const start=read('src/app/start.tsx');
check(start.includes('WorldMiniTile') && start.includes('height: 248') && start.includes('fontSize: 28'),'Inicio: misión compacta + accesos pequeños');
const arcade=read('src/app/arcade.tsx');
check(arcade.includes('columns = width >= 1180 ? 4 : width >= 860 ? 3 : 2') && arcade.includes('height: 132') && arcade.includes('GAMES.map'),'Arcade: biblioteca responsive 2–4 columnas, 7 juegos');
const camp=read('src/features/adventure/components/AdventureCampMenu.tsx');
check(camp.includes("columns = width >= 1180 ? 6 : 3") && camp.includes('height: 112') && camp.includes('MENU_ITEMS.map'),'Campamento: 6 destinos compactos, no mega-cards');
const map=read('src/features/adventure/presentation/adventureMapLayout.ts')+read('src/features/adventure/AdventureMapScreen.tsx');
check(map.includes('DAY_STEP = 132') && map.includes('AdventureVolcano') && !map.includes('ACTIVE_THEME.mapVolcano'),'Mapa: cámara alejada y volcán procedural integrado');
const shop=read('src/app/shop.tsx');
check(shop.includes('CollectibleEgg') && shop.includes('height: 132') && shop.includes('EGG_ACCENTS'),'Tienda: huevos coleccionables compactos y comparables');
const investments=read('src/app/investments.tsx');
check(investments.includes("width: '26%'") && investments.includes('maxWidth: 330') && investments.includes('height: 132'),'Inversiones: portfolio/expediciones compactos');
const wallet=read('src/app/wallet.tsx');
check(wallet.includes('height: 118') && wallet.includes('modeTabs') && wallet.includes('fontSize: 18'),'Mi dinero: estantes y tabs compactos');
const collection=read('src/app/collection.tsx');
check(collection.includes('CollectibleEgg') && collection.includes('WorldLibraryCard') && collection.includes('height: 124'),'Colección: galería densa de objetos/juegos');
const progress=read('src/app/progress.tsx');
check(progress.includes('height: 124') && progress.includes('maxWidth: 205'),'Progreso: tarjetas recientes compactas');
const adults=read('src/app/parents.tsx');
check(adults.includes("width: '26%'") && adults.includes('maxWidth: 300'),'Adultos: resumen compacto');
const settings=read('src/app/settings.tsx');
check(settings.includes('maxHeight: 220') && settings.includes('maxWidth: 390'),'Ajustes: opciones acotadas, sin panel dominante');
const lesson=read('src/game-kits/quiz/DecisionQuiz.tsx');
check(lesson.includes('minHeight: 68') && lesson.includes('minHeight: 46') && lesson.includes("flexBasis: '30%'") ,'Lección: situación + opciones pequeñas como idea original');
const intro=read('src/features/games/ui/GameIntroScreen.tsx');
check(intro.includes('width:196') && intro.includes('minHeight:78') && intro.includes('width:180'),'Intro juego: arte, pasos y CTA compactos');
const objects=read('src/features/games/ui/GameObjects.tsx');
check(objects.includes('balloonBody') && objects.includes('CoinPile') && objects.includes('FossilObject') && objects.includes('MemoryObject') && objects.includes('TreasureChest'),'Gameplay: globos/dinero/fósiles/memoria/tesoro son objetos visuales reales');
const balloon=read('src/features/games/balloon-answer/Game.tsx');
check(balloon.includes('BalloonObject') && balloon.includes('width: 108, height: 156'),'Globos: objetos con silueta de globo y escala compacta');
const treasure=read('src/features/games/treasure-split/Game.tsx');
check(treasure.includes('TreasureChest') && treasure.includes('CoinPile') && treasure.includes("width: '18%'") ,'Tesoro: cofre/monedas reales y paneles reducidos');
const market=read('src/features/games/dino-market/Game.tsx');
check(market.includes('ACTIVE_THEME.marketItems') && market.includes("width: '24%'") && market.includes("width: '23%'") ,'Mercado: productos reales en estante 4-columnas + carrito compacto');
const fossil=read('src/features/games/fossil-escape/Game.tsx');
check(fossil.includes('FossilObject') && fossil.includes('size={44}') && fossil.includes('width: 130'),'Escape: fósiles reales, hotspots compactos');
const king=read('src/features/games/king-greedy/Game.tsx');
check(king.includes('CoinPile') && king.includes('width: 286, height: 266') && king.includes("width: '30%'") ,'Rey: rueda y riesgo reducidos, monedas físicas');
const memory=read('src/features/games/money-memory/Game.tsx');
check(memory.includes('MemoryObject') && memory.includes('size={46}') && memory.includes('height: 96'),'Memoria: objetos semánticos en grid compacto');
const coin=read('src/features/games/coin-catcher/Game.native.tsx');
check(coin.includes('const logicalX = event.x / canvasScale') && coin.includes('COIN_R') && coin.includes('BASKET_HEIGHT'),'Atrapa monedas: drag lógico y geometría funcional preservada');

// No olvidos: toda ruta visual se clasifica; los tabs legacy deben ser redirect/layout.
const appDir=path.join(root,'src/app');
const routeFiles=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.tsx'))routeFiles.push(path.relative(root,p).replaceAll('\\','/'));}}
walk(appDir);
const visualRoutes=new Set(['src/app/arcade.tsx','src/app/collection.tsx','src/app/investments.tsx','src/app/onboarding.tsx','src/app/parents.tsx','src/app/play.tsx','src/app/progress.tsx','src/app/settings.tsx','src/app/shop.tsx','src/app/start.tsx','src/app/wallet.tsx','src/app/game/[gameId].tsx','src/app/lesson/[id].tsx']);
for(const f of routeFiles){
 if(f.endsWith('/_layout.tsx')||f==='src/app/_layout.tsx') continue;
 if(visualRoutes.has(f)) continue;
 const s=read(f);
 check(s.includes('Redirect')||s.includes('router.replace'),`Ruta legacy ${f}: redirige al shell actual`);
}
check(routeFiles.length>=20,`Cobertura de rutas: ${routeFiles.length} archivos de app inventariados`);

console.log(`\nCOMPACT WORLD v8: ${passes} PASS / ${failures} FAIL`);
if(failures) process.exit(1);
