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
];

for (const path of canonicalAssets) {
  assert.ok(exists(path), `Missing canonical Home destination layer: ${path}`);
}

for (const retiredPath of [
  'assets/ui/home/destinations/arcade/mascot.webp',
  'assets/ui/home/destinations/arcade/prop.webp',
  'tmp/should-not-exist.txt',
]) {
  assert.equal(exists(retiredPath), false, `Retired Block 2 path must stay absent: ${retiredPath}`);
}

assert.match(destinationsSource, /kind: 'map'/, 'Mapa must keep a semantic map layer contract');
assert.match(destinationsSource, /dino: require\('[^']*mapa\/dino\.webp'\)/, 'Mapa dino layer must remain explicit');
assert.match(destinationsSource, /sign: require\('[^']*mapa\/sign\.webp'\)/, 'Mapa sign layer must remain explicit');
assert.match(destinationsSource, /kind: 'arcade'/, 'Arcade must keep a semantic arcade layer contract');
assert.match(destinationsSource, /pterosaur: require\('[^']*arcade\/pterosaur\.webp'\)/, 'Arcade pterosaur must be a named canonical layer');
assert.match(destinationsSource, /starBlocks: require\('[^']*arcade\/star-blocks\.webp'\)/, 'Arcade star blocks must be a named canonical layer');
assert.doesNotMatch(destinationsSource, /arcade\/(?:mascot|prop)\.webp/, 'Arcade must not regress to generic mascot/prop asset names');
assert.match(destinationsSource, /case 'arcade':[\s\S]*layers\.background[\s\S]*layers\.pterosaur[\s\S]*layers\.starBlocks/, 'Arcade layer order must stay background -> pterosaur -> star blocks');

assert.match(cardSource, /getHomeDestinationArtLayerEntries\(destination\.artLayers\)/, 'Shared card renderer must consume the destination SSOT layer order');
assert.match(cardSource, /source=\{source\}/, 'Shared card renderer must render the semantic layer source');
assert.match(cardSource, /contentFit="cover"/, 'Canonical scene layers must keep the approved full-canvas crop');
assert.match(cardSource, /style=\{styles\.fullSceneLayer\}/, 'Canonical scene layers must stay locked to one shared scene canvas');

console.log('PASS check-home-destination-layers: Mapa and Arcade use semantic canonical layers; Arcade is background + pterosaur + star blocks with no generic prop contract.');
