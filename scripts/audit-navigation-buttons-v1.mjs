import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const appRoot = path.join(srcRoot, 'app');
const inventoryOnly = process.argv.includes('--inventory');
const baselinePath = path.join(root, 'scripts', 'navigation-button-baseline.json');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function routeFromFile(file) {
  let route = path.relative(appRoot, file).replaceAll('\\', '/').replace(/\.tsx?$/, '');
  if (route.endsWith('/_layout') || route === '_layout') return null;
  route = route.split('/').filter((segment) => !/^\(.+\)$/.test(segment)).join('/');
  route = route.replace(/(^|\/)index$/, '');
  route = `/${route}`.replace(/\/+/g, '/');
  return route.length > 1 && route.endsWith('/') ? route.slice(0, -1) : route;
}

const files = walk(srcRoot);
const tsxFiles = files.filter((file) => file.endsWith('.tsx'));
const appFiles = walk(appRoot).filter((file) => file.endsWith('.tsx'));
const routes = [...new Set(appFiles.map(routeFromFile).filter(Boolean))].sort();
const routeSet = new Set(routes);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function validRoute(target) {
  const clean = target.split('?')[0].split('#')[0] || '/';
  if (routeSet.has(clean)) return true;
  for (const route of routes) {
    const pattern = route
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\[[^/]+\\\]/g, '[^/]+');
    if (new RegExp(`^${pattern}$`).test(clean)) return true;
  }
  return false;
}

const literalTargets = [];
for (const file of tsxFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const patterns = [
    /router\.(?:push|replace|navigate)\(\s*['"`]([^'"`]+)['"`]/g,
    /router\.(?:push|replace|navigate)\(\s*\{\s*pathname:\s*['"`]([^'"`]+)['"`]/g,
    /<Redirect\b[^>]*href=\{?\s*['"`]([^'"`]+)['"`]/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const target = match[1];
      if (target?.startsWith('/') && !target.includes('${')) literalTargets.push({ file: rel(file), target });
    }
  }
}

const invalidTargets = literalTargets.filter(({ target }) => !validRoute(target));
assert.deepEqual(invalidTargets, [], `Navigation targets must resolve to real Expo routes:\n${invalidTargets.map((item) => `${item.file} -> ${item.target}`).join('\n')}`);

const expectations = [
  ['start Arcade', 'src/app/start.tsx', /label="Arcade"[\s\S]{0,180}router\.push\('\/arcade'/],
  ['start Wallet', 'src/app/start.tsx', /label="Mi dinero"[\s\S]{0,180}router\.push\('\/wallet'/],
  ['start Investments', 'src/app/start.tsx', /label="Inversiones"[\s\S]{0,180}router\.push\('\/investments'/],
  ['start Shop', 'src/app/start.tsx', /label="Tienda"[\s\S]{0,180}router\.push\('\/shop'/],
  ['start Collection', 'src/app/start.tsx', /label="Colección"[\s\S]{0,180}router\.push\('\/collection'/],
  ['camp Arcade', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Arcade'[\s\S]{0,120}route: '\/arcade'/],
  ['camp Wallet', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Mi dinero'[\s\S]{0,120}route: '\/wallet'/],
  ['camp Investments', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Inversiones'[\s\S]{0,120}route: '\/investments'/],
  ['camp Progress', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Progreso'[\s\S]{0,120}route: '\/progress'/],
  ['camp Collection', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Colección'[\s\S]{0,120}route: '\/collection'/],
  ['camp Parents', 'src/features/adventure/components/AdventureCampMenu.tsx', /label: 'Adultos'[\s\S]{0,120}route: '\/parents'/],
  ['legacy Games to Arcade', 'src/app/(tabs)/games.tsx', /Redirect[\s\S]*\/arcade/],
  ['Arcade 7-game registry', 'src/app/arcade.tsx', /GAMES\.map/],
  ['Arcade tile to game', 'src/app/arcade.tsx', /pathname: '\/game\/\[gameId\]'[\s\S]{0,100}mode: 'arcade'/],
  ['game arcade return', 'src/app/game/[gameId].tsx', /mode === 'campaign' \? '\/play' : '\/arcade'/],
  ['game wallet secondary action', 'src/app/game/[gameId].tsx', /onSecondary=\{\(\) => router\.push\('\/wallet'/],
  ['camp-back return contract', 'src/features/shell/navigation/useCampBack.ts', /pathname: '\/play'[\s\S]{0,100}camp: '1'/],
  ['wallet shop', 'src/app/wallet.tsx', /label="Tienda"[\s\S]{0,140}router\.push\('\/shop'/],
  ['wallet investment detail', 'src/app/wallet.tsx', /label="VER TODAS"[\s\S]{0,120}router\.push\('\/investments'/],
  ['shop unavailable CTA is disabled', 'src/app/shop.tsx', /disabled=\{selectedOwned \|\| !selectedCanBuy\}/],
  ['investment confirm is disabled', 'src/app/investments.tsx', /disabled=\{!canInvest\}/],
  ['shared ActionPill supports disabled', 'src/features/shell/gameui/GameSurface.tsx', /export function ActionPill[\s\S]{0,900}disabled=\{disabled\}/],
  ['basket label removed', 'src/features/games/coin-catcher/Game.native.tsx', /function BasketObject/],
  ['egg depth treatment', 'src/features/shell/world/WorldDecor.tsx', /eggRing[\s\S]*eggShine[\s\S]*eggStageSelected/],
];

for (const [label, file, pattern] of expectations) {
  const source = read(file);
  assert.match(source, pattern, `Navigation/button expectation failed: ${label}`);
}
assert.doesNotMatch(read('src/features/games/coin-catcher/Game.native.tsx'), />CANASTA</, 'Basket visual must not render the CANASTA text label.');
assert.doesNotMatch(read('src/app/arcade.tsx'), /router\.(?:push|replace|navigate)\(\s*['"`]\/arcade['"`]/, 'Arcade screen must not navigate to itself.');

const interactionTags = [
  'Pressable', 'ActionPill', 'IconButton', 'SceneHotspot', 'GameTile',
  'WorldButton', 'WorldCircleButton', 'PrimaryGameButton', 'SecondaryGameButton', 'StreakCard',
];
const interactionByFile = {};
let totalInteractions = 0;
for (const file of tsxFiles) {
  const source = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const tag of interactionTags) count += (source.match(new RegExp(`<${tag}\\b`, 'g')) ?? []).length;
  if (count > 0) {
    interactionByFile[rel(file)] = count;
    totalInteractions += count;
  }
}

const inventory = {
  schema: 1,
  routeCount: routes.length,
  routes,
  totalInteractions,
  interactionByFile,
};

if (inventoryOnly) {
  console.log('NAVIGATION_BUTTON_INVENTORY_START');
  console.log(JSON.stringify(inventory, null, 2));
  console.log('NAVIGATION_BUTTON_INVENTORY_END');
  console.log(`PASS audit-navigation-buttons-v1 inventory: ${routes.length} routes, ${literalTargets.length} literal route targets, ${totalInteractions} interaction declarations.`);
  process.exit(0);
}

assert.ok(fs.existsSync(baselinePath), 'Missing scripts/navigation-button-baseline.json. Run audit:navigation:inventory, review every interaction, then commit the approved baseline.');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
assert.deepEqual(routes, baseline.routes, 'Route inventory changed. Review every new/removed tab or screen and update the approved baseline.');
assert.deepEqual(interactionByFile, baseline.interactionByFile, 'Button/tab interaction inventory changed. Review the changed controls and update the approved baseline only after they pass.');
assert.equal(totalInteractions, baseline.totalInteractions, 'Interaction total changed without an approved audit baseline update.');

console.log(`PASS audit-navigation-buttons-v1 strict: ${routes.length} routes and ${totalInteractions} approved interactions; route semantics and disabled-state guards passed.`);
