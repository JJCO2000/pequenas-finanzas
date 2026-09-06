import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`[FAIL] ${message}`); failed = true; };

const shop = fs.readFileSync('src/app/shop.tsx', 'utf8');
for (const needle of ['item.effectTitle', '✓ ACTIVO', 'PODER PERMANENTE · ATRAPA MONEDAS', 'SE ACTIVA AL CANJEAR']) {
  if (!shop.includes(needle)) fail(`Shop is missing clarity marker: ${needle}`);
}

const collection = fs.readFileSync('src/app/collection.tsx', 'utf8');
for (const needle of ['item.effectTitle', '✓ ACTIVO', 'BLOQUEADO', 'Poderes de Atrapa Monedas']) {
  if (!collection.includes(needle)) fail(`Collection is missing clarity marker: ${needle}`);
}
if (collection.includes("isOwned ? item.title.replace('Huevo ', '') : '?'")) {
  fail('Collection still hides locked egg names behind ?');
}

const gameRoute = fs.readFileSync('src/app/game/[gameId].tsx', 'utf8');
if (!gameRoute.includes('activePowerLabels')) fail('Game route does not derive/pass active powers.');
if (!gameRoute.includes('SHOP_ITEMS')) fail('Game route does not use shop catalog as power presentation SSOT.');

const intro = fs.readFileSync('src/features/games/ui/GameIntroScreen.tsx', 'utf8');
if (!intro.includes('PODERES ACTIVOS')) fail('Game intro does not expose active powers.');

const policy = fs.readFileSync('src/core/economy/gameUpgradePolicy.ts', 'utf8');
for (const [label, needle] of [
  ['forest +5 seconds', "extraSeconds: owned.has('egg-forest') ? 5 : 0"],
  ['sunset +28 basket', "basketWidthBonus: owned.has('egg-sunset') ? 28 : 0"],
  ['ocean magnet 72', "magnetRadius: owned.has('egg-ocean') ? 72 : 0"],
  ['volcano every 4', "scoreBonusEvery: owned.has('egg-volcano') ? 4 : 0"],
]) {
  if (!policy.includes(needle)) fail(`Power invariant changed: ${label}`);
}

const catalog = fs.readFileSync('src/registry/shop.ts', 'utf8');
for (const [id, price] of [['egg-forest', 100], ['egg-sunset', 180], ['egg-ocean', 220], ['egg-volcano', 300]]) {
  const pattern = new RegExp(`id:\\s*'${id}'[^\\n]*priceCents:\\s*pesos\\(${price}\\)[^\\n]*gameId:\\s*'coin-catcher'`);
  if (!pattern.test(catalog)) fail(`Shop invariant changed for ${id}: expected ${price} pesos and coin-catcher target.`);
}

if (failed) process.exit(1);
console.log('[OK] Egg powers are visible and mechanics/prices remain unchanged (5/28/72/4; 100/180/220/300).');
