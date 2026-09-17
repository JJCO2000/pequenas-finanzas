import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const fileUrl = (path) => new URL(path, root);
const read = (path) => fs.readFileSync(fileUrl(path), 'utf8');
const exists = (path) => fs.existsSync(fileUrl(path));

const destinationsSource = read('src/features/home/homeDestinations.ts');
const assetsSource = read('src/registry/assets.ts');
const themeSource = read('src/core/theme/dinoTheme.ts');
const cardSource = read('src/features/home/components/HomeDestinationCard.tsx');

const canonicalAssets = [
  'assets/ui/home/destinations/mapa/background.jpg',
  'assets/ui/home/destinations/mapa/dino.webp',
  'assets/ui/home/destinations/mapa/sign.webp',
  'assets/ui/home/destinations/arcade/background.webp',
  'assets/ui/home/destinations/arcade/pterosaur.webp',
  'assets/ui/home/destinations/arcade/star-blocks.webp',
  'assets/ui/home/destinations/dinero/background.png',
  'assets/ui/home/destinations/dinero/coin-stack.svg',
  'assets/ui/home/destinations/dinero/star-coin.svg',
  'assets/ui/home/destinations/inversiones/background.webp',
  'assets/ui/home/destinations/inversiones/stegosaur.png',
  'assets/ui/home/destinations/tienda/background.webp',
  'assets/ui/home/destinations/tienda/egg-nest.webp',
  'assets/ui/home/destinations/coleccion/background.webp',
  'assets/ui/home/destinations/coleccion/longneck.webp',
];

for (const path of canonicalAssets) {
  assert.ok(exists(path), `Missing canonical Home destination layer: ${path}`);
}

for (const retiredPath of [
  'assets/ui/home/destinations/arcade/mascot.webp',
  'assets/ui/home/destinations/arcade/prop.webp',
  'assets/ui/home/destinations/dinero/coin-stack.png',
  'assets/ui/home/destinations/dinero/star-coin.png',
  'assets/ui/home/dinero-vector.svg',
  'assets/ui/home/inversiones-vector.svg',
  'assets/ui/home/tienda-vector.svg',
  'assets/ui/home/coleccion-vector.svg',
  'tmp/should-not-exist.txt',
]) {
  assert.equal(exists(retiredPath), false, `Retired Home destination path must stay absent: ${retiredPath}`);
}

assert.match(assetsSource, /homeDestinations:\s*{/, 'Canonical Home destination assets must live in registry/assets.ts');
assert.match(themeSource, /destinations:\s*{[\s\S]*\.\.\.ASSETS\.homeDestinations[\s\S]*backgroundBlurRadius:\s*10/, 'Theme must expose canonical destination assets and shared blur');
assert.doesNotMatch(destinationsSource, /require\(/, 'Home feature must consume the destination SSOT instead of owning runtime requires');
for (const key of ['map', 'arcade', 'wallet', 'investments', 'shop', 'collection']) {
  assert.match(destinationsSource, new RegExp(`ACTIVE_THEME\\.destinations\\.${key}\\.`), `${key} must consume ACTIVE_THEME destination art`);
}

assert.match(destinationsSource, /kind: 'map'/, 'Mapa must keep a semantic map layer contract');
assert.match(assetsSource, /dino: require\('[^']*mapa\/dino\.webp'\)/, 'Mapa dino layer must remain explicit');
assert.match(assetsSource, /sign: require\('[^']*mapa\/sign\.webp'\)/, 'Mapa sign layer must remain explicit');

assert.match(destinationsSource, /kind: 'arcade'/, 'Arcade must keep a semantic arcade layer contract');
assert.match(assetsSource, /pterosaur: require\('[^']*arcade\/pterosaur\.webp'\)/, 'Arcade pterosaur must be a named canonical layer');
assert.match(assetsSource, /starBlocks: require\('[^']*arcade\/star-blocks\.webp'\)/, 'Arcade star blocks must be a named canonical layer');
assert.match(destinationsSource, /id: 'arcade'[\s\S]*artHeightRatio: 0\.67/, 'Arcade must preserve the approved reference art-height ratio');
assert.doesNotMatch(destinationsSource, /arcade\/(?:mascot|prop)\.webp/, 'Arcade must not regress to generic mascot/prop asset names');
assert.match(destinationsSource, /case 'arcade':[\s\S]*layers\.background[\s\S]*layers\.pterosaur[\s\S]*layers\.starBlocks/, 'Arcade layer order must stay background -> pterosaur -> star blocks');

assert.match(destinationsSource, /kind: 'wallet'/, 'Mi dinero must keep a semantic wallet layer contract');
assert.match(assetsSource, /background: require\('[^']*dinero\/background\.png'\)/, 'Mi dinero background must remain explicit');
assert.match(assetsSource, /coinStack: require\('[^']*dinero\/coin-stack\.svg'\)/, 'Mi dinero coin stack must be a named canonical layer');
assert.match(assetsSource, /starCoin: require\('[^']*dinero\/star-coin\.svg'\)/, 'Mi dinero star coin must be a named canonical layer');
assert.match(destinationsSource, /id: 'wallet'[\s\S]*artLayers: walletArt[\s\S]*artHeightRatio: 0\.67/, 'Mi dinero must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'wallet':[\s\S]*layers\.background[\s\S]*layers\.coinStack[\s\S]*layers\.starCoin/, 'Mi dinero layer order must stay background -> coin stack -> star coin');
assert.doesNotMatch(destinationsSource, /id: 'wallet'[\s\S]{0,300}dinero-vector\.svg/, 'Mi dinero must not regress to the legacy single SVG');

assert.match(destinationsSource, /kind: 'investments'/, 'Inversiones must keep a semantic investments layer contract');
assert.match(assetsSource, /background: require\('[^']*inversiones\/background\.webp'\)/, 'Inversiones background must remain explicit');
assert.match(assetsSource, /stegosaur: require\('[^']*inversiones\/stegosaur\.png'\)/, 'Inversiones stegosaur must be a named canonical layer');
assert.match(destinationsSource, /id: 'investments'[\s\S]*artLayers: investmentsArt[\s\S]*artHeightRatio: 0\.67/, 'Inversiones must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'investments':[\s\S]*layers\.background[\s\S]*layers\.stegosaur/, 'Inversiones layer order must stay background -> stegosaur');
assert.doesNotMatch(destinationsSource, /id: 'investments'[\s\S]{0,350}inversiones-vector\.svg/, 'Inversiones must not regress to the legacy single SVG');
assert.doesNotMatch(destinationsSource, /inversiones\/(?:mascot|prop|foreground)\./, 'Inversiones must not regress to vague fake layer names');

assert.match(destinationsSource, /kind: 'shop'/, 'Tienda must keep a semantic shop layer contract');
assert.match(assetsSource, /background: require\('[^']*tienda\/background\.webp'\)/, 'Tienda background must remain explicit');
assert.match(assetsSource, /eggNest: require\('[^']*tienda\/egg-nest\.webp'\)/, 'Tienda egg and nest must be one named canonical foreground layer');
assert.match(destinationsSource, /id: 'shop'[\s\S]*artLayers: shopArt[\s\S]*artHeightRatio: 0\.67/, 'Tienda must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'shop':[\s\S]*layers\.background[\s\S]*layers\.eggNest/, 'Tienda layer order must stay background -> egg nest');
assert.doesNotMatch(destinationsSource, /id: 'shop'[\s\S]{0,350}tienda-vector\.svg/, 'Tienda must not regress to the legacy single SVG');
assert.doesNotMatch(destinationsSource, /tienda\/(?:mascot|prop|foreground)\./, 'Tienda must not regress to vague fake layer names');

assert.match(destinationsSource, /kind: 'collection'/, 'Colección must keep a semantic collection layer contract');
assert.match(assetsSource, /background: require\('[^']*coleccion\/background\.webp'\)/, 'Colección museum background must remain explicit');
assert.match(assetsSource, /longneck: require\('[^']*coleccion\/longneck\.webp'\)/, 'Colección longneck must be a named canonical foreground layer');
assert.match(destinationsSource, /id: 'collection'[\s\S]*artLayers: collectionArt[\s\S]*artHeightRatio: 0\.67/, 'Colección must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'collection':[\s\S]*layers\.background[\s\S]*layers\.longneck/, 'Colección layer order must stay background -> longneck');
assert.doesNotMatch(destinationsSource, /id: 'collection'[\s\S]{0,350}coleccion-vector\.svg/, 'Colección must not regress to the legacy single SVG');
assert.doesNotMatch(destinationsSource, /coleccion\/(?:mascot|prop|foreground)\./, 'Colección must not regress to vague fake layer names');

assert.match(cardSource, /getHomeDestinationArtLayerEntries\(destination\.artLayers\)/, 'Shared card renderer must consume the destination SSOT layer order');
assert.match(cardSource, /destination\.artHeightRatio \?\? \(expanded \? 0\.68 : 0\.66\)/, 'Approved per-destination art ratio must override the shared layered fallback');
assert.match(cardSource, /source=\{source\}/, 'Shared card renderer must render the semantic layer source');
assert.match(cardSource, /contentFit="cover"/, 'Canonical scene layers must keep the approved full-canvas crop');
assert.match(cardSource, /style=\{styles\.fullSceneLayer\}/, 'Canonical scene layers must stay locked to one shared scene canvas');

console.log('PASS check-home-destination-layers: Mapa, Arcade, Mi dinero, Inversiones, Tienda and Colección use semantic canonical layers; Block 6 keeps background + longneck at the approved 67% framing.');
