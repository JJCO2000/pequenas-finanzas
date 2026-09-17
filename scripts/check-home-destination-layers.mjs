import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const fileUrl = (path) => new URL(path, root);
const read = (path) => fs.readFileSync(fileUrl(path), 'utf8');
const exists = (path) => fs.existsSync(fileUrl(path));

const destinationsSource = read('src/features/home/homeDestinations.ts');
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
  'assets/ui/home/destinations/inversiones/background.png',
  'assets/ui/home/destinations/inversiones/stegosaur.png',
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
  'tmp/should-not-exist.txt',
]) {
  assert.equal(exists(retiredPath), false, `Retired Home destination path must stay absent: ${retiredPath}`);
}

assert.match(destinationsSource, /kind: 'map'/, 'Mapa must keep a semantic map layer contract');
assert.match(destinationsSource, /dino: require\('[^']*mapa\/dino\.webp'\)/, 'Mapa dino layer must remain explicit');
assert.match(destinationsSource, /sign: require\('[^']*mapa\/sign\.webp'\)/, 'Mapa sign layer must remain explicit');

assert.match(destinationsSource, /kind: 'arcade'/, 'Arcade must keep a semantic arcade layer contract');
assert.match(destinationsSource, /pterosaur: require\('[^']*arcade\/pterosaur\.webp'\)/, 'Arcade pterosaur must be a named canonical layer');
assert.match(destinationsSource, /starBlocks: require\('[^']*arcade\/star-blocks\.webp'\)/, 'Arcade star blocks must be a named canonical layer');
assert.match(destinationsSource, /id: 'arcade'[\s\S]*artHeightRatio: 0\.67/, 'Arcade must preserve the approved reference art-height ratio');
assert.doesNotMatch(destinationsSource, /arcade\/(?:mascot|prop)\.webp/, 'Arcade must not regress to generic mascot/prop asset names');
assert.match(destinationsSource, /case 'arcade':[\s\S]*layers\.background[\s\S]*layers\.pterosaur[\s\S]*layers\.starBlocks/, 'Arcade layer order must stay background -> pterosaur -> star blocks');

assert.match(destinationsSource, /kind: 'wallet'/, 'Mi dinero must keep a semantic wallet layer contract');
assert.match(destinationsSource, /background: require\('[^']*dinero\/background\.png'\)/, 'Mi dinero background must remain explicit');
assert.match(destinationsSource, /coinStack: require\('[^']*dinero\/coin-stack\.svg'\)/, 'Mi dinero coin stack must be a named canonical layer');
assert.match(destinationsSource, /starCoin: require\('[^']*dinero\/star-coin\.svg'\)/, 'Mi dinero star coin must be a named canonical layer');
assert.match(destinationsSource, /id: 'wallet'[\s\S]*artLayers: walletArt[\s\S]*artHeightRatio: 0\.67/, 'Mi dinero must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'wallet':[\s\S]*layers\.background[\s\S]*layers\.coinStack[\s\S]*layers\.starCoin/, 'Mi dinero layer order must stay background -> coin stack -> star coin');
assert.doesNotMatch(destinationsSource, /id: 'wallet'[\s\S]{0,300}dinero-vector\.svg/, 'Mi dinero must not regress to the legacy single SVG');

assert.match(destinationsSource, /kind: 'investments'/, 'Inversiones must keep a semantic investments layer contract');
assert.match(destinationsSource, /background: require\('[^']*inversiones\/background\.png'\)/, 'Inversiones background must remain explicit');
assert.match(destinationsSource, /stegosaur: require\('[^']*inversiones\/stegosaur\.png'\)/, 'Inversiones stegosaur must be a named canonical layer');
assert.match(destinationsSource, /id: 'investments'[\s\S]*artLayers: investmentsArt[\s\S]*artHeightRatio: 0\.67/, 'Inversiones must preserve the approved reference art-height ratio');
assert.match(destinationsSource, /case 'investments':[\s\S]*layers\.background[\s\S]*layers\.stegosaur/, 'Inversiones layer order must stay background -> stegosaur');
assert.doesNotMatch(destinationsSource, /id: 'investments'[\s\S]{0,350}inversiones-vector\.svg/, 'Inversiones must not regress to the legacy single SVG');
assert.doesNotMatch(destinationsSource, /inversiones\/(?:mascot|prop|foreground)\./, 'Inversiones must not regress to vague fake layer names');

assert.match(cardSource, /getHomeDestinationArtLayerEntries\(destination\.artLayers\)/, 'Shared card renderer must consume the destination SSOT layer order');
assert.match(cardSource, /destination\.artHeightRatio \?\? \(expanded \? 0\.68 : 0\.66\)/, 'Approved per-destination art ratio must override the shared layered fallback');
assert.match(cardSource, /source=\{source\}/, 'Shared card renderer must render the semantic layer source');
assert.match(cardSource, /contentFit="cover"/, 'Canonical scene layers must keep the approved full-canvas crop');
assert.match(cardSource, /style=\{styles\.fullSceneLayer\}/, 'Canonical scene layers must stay locked to one shared scene canvas');

console.log('PASS check-home-destination-layers: Mapa, Arcade, Mi dinero and Inversiones use semantic canonical layers; Block 4 keeps background + stegosaur at the approved 67% framing.');
