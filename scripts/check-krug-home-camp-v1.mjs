import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const home = read('src/app/start.tsx');
const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const streak = read('src/features/streak/StreakCard.tsx');
const homeReference = new URL('../assets/world/v7/home-approved.webp', import.meta.url);
const REFERENCE_WIDTH = 1536;
const REFERENCE_HEIGHT = 864;

// Home: preserve the approved 1536x864 composition while keeping the six baked-in
// camp cards independently interactive and accessible.
assert.ok(fs.existsSync(homeReference), 'Approved home reference asset must exist');
const referenceBytes = fs.readFileSync(homeReference);
assert.equal(referenceBytes.length, 14_997, 'Approved home reference byte size changed');
const referenceGitBlobSha = crypto
  .createHash('sha1')
  .update(`blob ${referenceBytes.length}\0`)
  .update(referenceBytes)
  .digest('hex');
assert.equal(referenceGitBlobSha, '9842995da1dfc9afa9553266b2290f0d02d2f49b', 'Approved home reference bytes changed');
assert.match(home, /HOME_REFERENCE = require\('\.\.\/\.\.\/assets\/world\/v7\/home-approved\.webp'\)/, 'Home must use the approved exact-reference artwork');
assert.match(home, /REFERENCE_WIDTH = 1536/, 'Home reference coordinate system must stay locked to 1536px width');
assert.match(home, /REFERENCE_HEIGHT = 864/, 'Home reference coordinate system must stay locked to 864px height');
assert.match(home, /useSafeAreaInsets/, 'Home must read device safe-area insets');
assert.match(home, /safePaddingLeft = Math\.max\(insets\.left, 12\)/, 'Home must match WorldScene left safe gutter');
assert.match(home, /safePaddingRight = Math\.max\(insets\.right, 12\)/, 'Home must match WorldScene right safe gutter');
assert.match(home, /safePaddingTop = Math\.max\(insets\.top, 10\)/, 'Home must match WorldScene top safe gutter');
assert.match(home, /safePaddingBottom = Math\.max\(insets\.bottom, 10\)/, 'Home must match WorldScene bottom safe gutter');
assert.match(home, /safeViewportWidth = Math\.max\(1, viewportWidth - safePaddingLeft - safePaddingRight\)/, 'Home scale must use safe viewport width');
assert.match(home, /safeViewportHeight = Math\.max\(1, viewportHeight - safePaddingTop - safePaddingBottom\)/, 'Home scale must use safe viewport height');
assert.match(home, /referenceScale = Math\.min\(safeViewportWidth \/ REFERENCE_WIDTH, safeViewportHeight \/ REFERENCE_HEIGHT\)/, 'Home reference canvas must contain-fit inside the safe viewport');
assert.match(home, /<WorldScene background=\{HOME_REFERENCE\} tone="none" safe contentStyle=\{styles\.root\}>/, 'Home must enable WorldScene safe-area padding');
assert.match(home, /styles\.referenceCanvas/, 'Home must render all exact-reference content inside one shared canvas');
assert.match(home, /\{ width: px\(REFERENCE_WIDTH\), height: px\(REFERENCE_HEIGHT\) \}/, 'Home reference canvas must scale from the approved dimensions');
assert.match(home, /source=\{HOME_REFERENCE\}[\s\S]{0,180}resizeMode="stretch"[\s\S]{0,180}accessible=\{false\}[\s\S]{0,180}style=\{styles\.referenceArtwork\}/, 'Approved artwork must be a non-accessible visual layer inside the shared reference canvas');
assert.match(home, /root: \{ flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' \}/, 'Home reference canvas must stay centered in every viewport');
assert.match(home, /referenceCanvas: \{ position: 'relative', flexShrink: 0, overflow: 'hidden' \}/, 'Home reference canvas must be the positioning parent for artwork and controls');
assert.match(home, /referenceArtwork: \{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' \}/, 'Approved artwork must fill the exact reference canvas');
assert.match(home, /campInteractionLayer: \{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 19 \}/, 'Camp interaction layer must cover the exact reference canvas');
assert.doesNotMatch(home, /StyleSheet\.absoluteFillObject/, 'RN 0.86 incompatible StyleSheet.absoluteFillObject must not return');
assert.equal((home.match(/styles\.campHitbox/g) ?? []).length, 6, 'Home must expose exactly six secondary destination hitboxes');
assert.equal((home.match(/<ActionPill/g) ?? []).length, 1, 'Home must have exactly one primary ActionPill');
assert.match(home, /label="IR A MI MISIÓN →"/, 'Home primary CTA must describe where it goes');
assert.match(home, /accessibilityLabel="Ir a mi misión actual"/, 'Home primary CTA needs an explicit accessible action');
assert.match(home, /router\.replace\('\/play'/, 'Home mission CTA must lead to the adventure map');
assert.match(home, /SIGUIENTE PASO/, 'Home must identify the next step without requiring interpretation');
assert.match(home, /Tu misión está lista/, 'Home center cue must point to the mission');
assert.doesNotMatch(home, /label="CONTINUAR →"/, 'Ambiguous home CTA CONTINUAR is not allowed');

const homeDestinations = [
  ['Mapa', "router.replace('/play'", 'campMap', 61.7188, 25.9259, 10.6771, 20.4861],
  ['Arcade', "router.push('/arcade'", 'campArcade', 73.8932, 25.9259, 10.7422, 20.3704],
  ['Mi dinero', "router.push('/wallet'", 'campWallet', 86.1328, 26.0417, 10.7422, 20.2546],
  ['Inversiones', "router.push('/investments'", 'campInvestments', 61.7188, 48.1481, 10.7422, 20.6019],
  ['Tienda', "router.push('/shop'", 'campShop', 73.8281, 48.2639, 10.7422, 20.6019],
  ['Colección', "router.push('/collection'", 'campCollection', 86.0677, 48.2639, 10.8073, 20.6019],
];
for (const [label, route, style] of homeDestinations) {
  const labelToken = `accessibilityLabel="${label}"`;
  const labelIndex = home.indexOf(labelToken);
  assert.ok(labelIndex >= 0, `Home destination missing accessible label: ${label}`);
  const controlSource = home.slice(Math.max(0, labelIndex - 120), labelIndex + 260);
  assert.ok(controlSource.includes('accessibilityRole="button"'), `Home destination missing button role: ${label}`);
  assert.ok(controlSource.includes('accessibilityHint='), `Home destination missing accessibility hint: ${label}`);
  assert.ok(home.includes(route), `Home destination missing route: ${label}`);
  assert.ok(home.includes(`styles.${style}`), `Home destination missing measured hitbox: ${label}`);
}

// Coordinates measured from the approved 1536x864 reference. These prevent a later
// refactor from silently drifting the tappable cards away from what the child sees.
for (const exactGeometry of [
  "campMap: { left: '61.7188%', top: '25.9259%', width: '10.6771%', height: '20.4861%' }",
  "campArcade: { left: '73.8932%', top: '25.9259%', width: '10.7422%', height: '20.3704%' }",
  "campWallet: { left: '86.1328%', top: '26.0417%', width: '10.7422%', height: '20.2546%' }",
  "campInvestments: { left: '61.7188%', top: '48.1481%', width: '10.7422%', height: '20.6019%' }",
  "campShop: { left: '73.8281%', top: '48.2639%', width: '10.7422%', height: '20.6019%' }",
  "campCollection: { left: '86.0677%', top: '48.2639%', width: '10.8073%', height: '20.6019%' }",
]) {
  assert.ok(home.includes(exactGeometry), `Home exact-reference geometry drifted: ${exactGeometry.split(':')[0]}`);
}

// Responsive contract: artwork and every percentage-based hitbox share the same
// safe-area-contained 1536x864 canvas. Test ordinary, ultrawide, tablet and cutout cases.
const viewports = [
  [1536, 864, 0, 0, 0, 0, 'reference 16:9'],
  [1920, 1080, 0, 0, 0, 0, 'large 16:9'],
  [2400, 1080, 0, 0, 0, 0, 'wide 20:9'],
  [1280, 800, 0, 0, 0, 0, '16:10 tablet'],
  [1024, 768, 0, 0, 0, 0, '4:3 tablet'],
  [852, 393, 59, 59, 0, 21, 'notched landscape phone'],
  [854, 480, 0, 0, 0, 0, 'compact 16:9'],
  [568, 320, 0, 0, 0, 0, 'small landscape'],
  [480, 270, 0, 0, 0, 0, 'minimum supported landscape'],
];
for (const [viewportWidth, viewportHeight, insetLeft, insetRight, insetTop, insetBottom, label] of viewports) {
  const safeWidth = Math.max(1, viewportWidth - Math.max(insetLeft, 12) - Math.max(insetRight, 12));
  const safeHeight = Math.max(1, viewportHeight - Math.max(insetTop, 10) - Math.max(insetBottom, 10));
  const scale = Math.min(safeWidth / REFERENCE_WIDTH, safeHeight / REFERENCE_HEIGHT);
  const canvasWidth = REFERENCE_WIDTH * scale;
  const canvasHeight = REFERENCE_HEIGHT * scale;
  const offsetX = (safeWidth - canvasWidth) / 2;
  const offsetY = (safeHeight - canvasHeight) / 2;

  assert.ok(canvasWidth <= safeWidth + 1e-6, `${label}: canvas overflows safe width`);
  assert.ok(canvasHeight <= safeHeight + 1e-6, `${label}: canvas overflows safe height`);
  assert.ok(offsetX >= -1e-6 && offsetY >= -1e-6, `${label}: centered safe-canvas offset is invalid`);
  assert.ok(Math.abs(canvasWidth / canvasHeight - REFERENCE_WIDTH / REFERENCE_HEIGHT) < 1e-9, `${label}: canvas aspect ratio drifted`);

  for (const [destination, , , left, top, width, height] of homeDestinations) {
    const screenX = offsetX + (left / 100) * canvasWidth;
    const screenY = offsetY + (top / 100) * canvasHeight;
    const screenWidth = (width / 100) * canvasWidth;
    const screenHeight = (height / 100) * canvasHeight;
    assert.ok(screenX >= offsetX - 1e-6 && screenY >= offsetY - 1e-6, `${label}: ${destination} starts outside artwork`);
    assert.ok(screenX + screenWidth <= offsetX + canvasWidth + 1e-6, `${label}: ${destination} extends past artwork width`);
    assert.ok(screenY + screenHeight <= offsetY + canvasHeight + 1e-6, `${label}: ${destination} extends past artwork height`);
    assert.ok(screenWidth >= 44 && screenHeight >= 44, `${label}: ${destination} touch target falls below 44x44`);
  }

  const missionTouchHeight = 90 * scale + 20; // visual 90px reference height + 10pt transparent expansion on each side.
  assert.ok(missionTouchHeight >= 44, `${label}: mission CTA touch target falls below 44pt`);
}

// Mission card: lock the approved lower-card composition as a real dynamic surface,
// not a screenshot-only decoration. Day/title/status/reward/progress must keep coming
// from app state, while the reference geometry and the single primary CTA stay fixed.
for (const token of [
  'TU MISIÓN · DÍA {currentDay}',
  '{currentTitle}',
  'getAdventureMissionStatus(current)',
  'const stage = getAdventureStage(currentDay)',
  'ETAPA {stage.stageNumber}',
  '{stage.dayInStage}/{stage.totalSlots}',
  'PREMIO {reward}',
  'Juegos {gameUnlocks.length}/{GAMES.length}',
]) {
  assert.ok(home.includes(token), `Home mission card lost dynamic content: ${token}`);
}

for (const exactMissionGeometry of [
  "mission: {\n    position: 'absolute',\n    left: '1.75%',\n    bottom: '4.2%',\n    width: '71.0%',\n    height: '25.4%'",
  "{ width: px(158), height: px(158), borderRadius: px(28), borderWidth: px(5) }",
  "{ width: px(98), height: px(34), borderRadius: px(17), borderWidth: px(2) }",
  "style={[styles.referenceProgress, { marginTop: px(8), maxWidth: px(515) }]} ",
]) {
  const normalizedLock = exactMissionGeometry.endsWith(' ')
    ? exactMissionGeometry.slice(0, -1)
    : exactMissionGeometry;
  assert.ok(home.includes(normalizedLock), `Home approved mission geometry drifted: ${normalizedLock.split('\n')[0]}`);
}
assert.match(home, /width: px\(331\),\s*height: px\(90\),\s*borderRadius: px\(45\),\s*borderWidth: px\(4\),\s*marginLeft: px\(18\)/, 'Home approved mission CTA visual geometry drifted');
assert.match(home, /styles\.continueButtonHitbox/, 'Mission CTA must preserve the approved visual button as its hit target');
assert.match(home, /style=\{styles\.continueButtonHitbox\}/, 'Mission CTA must keep the transparent hitbox over the approved visual button');
assert.match(home, /continueButtonHitbox: \{ position: 'absolute', left: 0, right: 0, top: -10, bottom: -10, opacity: 0 \}/, 'Mission CTA hitbox must exceed the visual button enough for a 44pt minimum target on safe-area compact landscape screens');
assert.match(home, /<AdventureStageProgress dayNumber=\{currentDay\} compact \/>/, 'Mission must keep the canonical adventure progress component wired to the current day');
assert.match(home, /hiddenProgress: \{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' \}/, 'Canonical progress must remain non-visual so it cannot fight the approved reference geometry');

// Camp: daily streak first, destinations second, map exit secondary.
assert.equal((camp.match(/<SceneHotspot/g) ?? []).length, 1, 'Camp destinations are data-driven through one SceneHotspot template');
assert.equal((camp.match(/route: '\//g) ?? []).length, 6, 'Camp must keep six secondary destinations');
assert.match(camp, /Elige tu siguiente paso/, 'Camp title must explain the decision');
assert.match(camp, /SIGUIENTE ACCIÓN/, 'Pending streak must be framed as the next action');
assert.match(camp, /OTROS LUGARES/, 'Camp secondary destinations need a clear heading');
assert.match(camp, /SEGUIR EN EL MAPA →/, 'Camp exit must describe the destination');
assert.match(camp, /tone="light"/, 'Camp map exit must remain visually secondary to the streak action');
assert.ok(camp.indexOf('<StreakCard') < camp.indexOf('<View style={styles.destinations}>'), 'Streak must appear before secondary destinations');
assert.doesNotMatch(camp, /¿A dónde vas\?/, 'Ambiguous camp heading is not allowed');

// Streak: state, challenge, consequence and action all visible without decoding icons.
for (const token of ['RETO DE HOY', 'RACHA', 'SEGUROS', 'MEJOR', 'JUGAR →', 'RACHA COMPLETADA', 'LISTO ✓']) {
  assert.ok(streak.includes(token), `Streak card missing explicit cue: ${token}`);
}
assert.match(streak, /Completa el reto para empezar tu racha\./, 'Zero-day streak needs an explicit first action');
assert.match(streak, /Tu racha está a salvo por hoy\./, 'Completed streak needs explicit success feedback');
assert.match(streak, /accessibilityLabel={`Racha de hoy\./, 'Streak action must be self-describing to accessibility services');
assert.doesNotMatch(streak, /<Text style={styles\.ctaText}>{safe \? '✓' : '→'}<\/Text>/, 'Icon-only streak CTA is not allowed');

console.log('PASS check-krug-home-camp-v1: exact approved asset, safe-area responsive canvas, aligned hitboxes, accessible controls, dynamic mission card, and readable streak states are locked.');