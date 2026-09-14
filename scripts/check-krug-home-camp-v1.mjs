import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const start = read('src/app/start.tsx');
const scene = read('src/features/home/HomeSceneLayout.tsx');
const controls = read('src/features/home/HomeControlsLayer.tsx');
const destinations = read('src/features/home/homeDestinations.ts');
const destinationCard = read('src/features/home/components/HomeDestinationCard.tsx');
const missionCard = read('src/features/home/components/HomeMissionCard.tsx');
const background = new URL('../assets/world/v7/home-background.webp', import.meta.url);

// Home: one scenic background, real dynamic controls, one clear primary mission action.
assert.ok(fs.existsSync(background), 'Clean Home background asset must exist');
const bytes = fs.readFileSync(background);
assert.ok(bytes.length >= 30, 'Home background is truncated');
assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', 'Home background must be a valid RIFF WebP');
assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', 'Home background must be a valid WebP');
assert.equal(bytes.subarray(12, 16).toString('ascii'), 'VP8 ', 'Home background must use the expected lossy WebP payload');
assert.deepEqual([...bytes.subarray(23, 26)], [0x9d, 0x01, 0x2a], 'Home background VP8 frame header is invalid');
const backgroundWidth = bytes.readUInt16LE(26) & 0x3fff;
const backgroundHeight = bytes.readUInt16LE(28) & 0x3fff;
assert.equal(backgroundWidth, 1536, 'Home background width must stay 1536px');
assert.equal(backgroundHeight, 864, 'Home background height must stay 864px');

assert.match(start, /<HomeSceneLayout/, 'Home route must delegate presentation to the responsive scene layout');
assert.doesNotMatch(start, /home-approved|referenceCanvas|campInteractionLayer|hiddenProgress|HOME_REFERENCE/, 'Legacy exact-reference Home architecture must be gone');
assert.match(scene, /<HomeBackgroundLayer[\s\S]*<HomeControlsLayer/, 'Home must layer controls over one background');
assert.match(controls, /SIGUIENTE PASO/, 'Home must identify the next action without interpretation');
assert.match(controls, /OTROS LUGARES/, 'Secondary destinations need a clear heading');
assert.match(controls, /HOME_DESTINATIONS\.map/, 'Secondary destinations must be data-driven');
assert.equal((destinations.match(/\{ id: '/g) ?? []).length, 6, 'Home must keep exactly six secondary destinations');
assert.match(destinationCard, /accessibilityRole="button"/, 'Every destination card template must be a real accessible button');
assert.match(destinationCard, /minHeight: layout\.touchTarget/, 'Destination cards must preserve minimum touch target');
assert.match(missionCard, /label="IR A MI MISIÓN →"/, 'Home primary CTA must describe its destination');
assert.match(missionCard, /accessibilityLabel="Ir a mi misión actual"/, 'Home primary CTA needs an explicit accessible action');
assert.match(controls, /router\.replace\('\/play' as any\)/, 'Home mission CTA must lead to the adventure map');
assert.doesNotMatch(controls, /label="CONTINUAR →"/, 'Ambiguous CONTINUAR CTA is not allowed');

if (process.argv.includes('--home-contract-only')) {
  console.log('PASS check-krug-home-camp-v1 Home hierarchy contract.');
  process.exit(0);
}

const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const streak = read('src/features/streak/StreakCard.tsx');

// Camp: daily streak first, destinations second, map exit secondary.
assert.equal((camp.match(/<SceneHotspot/g) ?? []).length, 1, 'Camp destinations are data-driven through one SceneHotspot template');
assert.equal((camp.match(/route: '\//g) ?? []).length, 6, 'Camp must keep six secondary destinations');
assert.match(camp, /Elige tu siguiente paso/, 'Camp title must explain the decision');
assert.match(camp, /SIGUIENTE ACCIÓN/, 'Pending streak must be framed as the next action');
assert.match(camp, /OTROS LUGARES/, 'Camp secondary destinations need a clear heading');
assert.match(camp, /SEGUIR EN EL MAPA →/, 'Camp exit must describe the destination');
assert.match(camp, /tone="light"/, 'Camp map exit must remain visually secondary to the streak action');
assert.ok(camp.indexOf('<StreakCard') < camp.indexOf('<View style={styles.destinations}>'), 'Streak must appear before secondary destinations');
assert.doesNotMatch(camp, /¿A dónde vas\?/i, 'Ambiguous camp heading must not return');
assert.doesNotMatch(camp, /label="(?:VER|CONTINUAR|ABRIR)"/, 'Camp actions must name their destination/action');

// Streak: current state, explicit action and urgency remain understandable.
assert.match(streak, /getStreakUrgency/, 'Streak card must derive a clear urgency state');
assert.match(streak, /accessibilityRole="button"/, 'Streak action must be accessible as a button');
assert.match(streak, /onPress=\{onPress\}/, 'Streak card must expose its supplied action');
assert.match(streak, /RACHA COMPLETADA/, 'Completed streak state must be explicit');
assert.match(streak, /RETO DE HOY/, 'Pending streak state must name today\'s challenge');
assert.match(streak, /JUGAR →/, 'Pending streak CTA must state the action');
assert.doesNotMatch(streak, /label="VER"/, 'Streak CTA must not fall back to generic VER copy');

console.log('PASS check-krug-home-camp-v1: Home, camp and streak follow clear action hierarchy with deterministic controls.');
