import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const layoutSource = read('src/features/home/useHomeLayout.ts');
const backgroundSource = read('src/features/home/HomeBackgroundLayer.tsx');
const controlsSource = read('src/features/home/HomeControlsLayer.tsx');
const cardSource = read('src/features/home/components/HomeDestinationCard.tsx');
const missionSource = read('src/features/home/components/HomeMissionCard.tsx');
const destinationsSource = read('src/features/home/homeDestinations.ts');
const startSource = read('src/app/start.tsx');

const COMPACT_MAX_WIDTH = 900;
const COMPACT_MAX_HEIGHT = 500;
const EXPANDED_MIN_WIDTH = 1600;
const EXPANDED_MIN_HEIGHT = 900;
const MIN_TOUCH = 48;
const DESTINATION_PANEL_BORDER_WIDTH = 3;

for (const token of [
  'HOME_COMPACT_MAX_WIDTH = 900',
  'HOME_COMPACT_MAX_HEIGHT = 500',
  'HOME_EXPANDED_MIN_WIDTH = 1600',
  'HOME_EXPANDED_MIN_HEIGHT = 900',
  'HOME_MIN_TOUCH_TARGET = 48',
  'HOME_DESTINATION_PANEL_BORDER_WIDTH = 3',
]) {
  assert.ok(layoutSource.includes(token), `Home layout contract drifted: ${token}`);
}

function resolve(width, height, left = 0, right = 0, top = 0, bottom = 0) {
  const safeWidth = Math.max(1, width - left - right);
  const safeHeight = Math.max(1, height - top - bottom);
  const mode = safeHeight < COMPACT_MAX_HEIGHT || safeWidth < COMPACT_MAX_WIDTH
    ? 'compact'
    : safeWidth >= EXPANDED_MIN_WIDTH && safeHeight >= EXPANDED_MIN_HEIGHT
      ? 'expanded'
      : 'regular';
  const gutter = mode === 'compact' ? 10 : mode === 'expanded' ? 28 : 20;
  const gap = mode === 'compact' ? 8 : mode === 'expanded' ? 16 : 12;
  const contentWidth = Math.max(1, safeWidth - gutter * 2);
  const contentHeight = Math.max(1, safeHeight - gutter * 2);
  const topBarHeight = mode === 'compact' ? 56 : mode === 'expanded' ? 104 : 92;
  const panelPadding = mode === 'compact' ? 8 : mode === 'expanded' ? 18 : 14;
  const panelBorderWidth = DESTINATION_PANEL_BORDER_WIDTH;
  const destinationGap = mode === 'compact' ? 6 : mode === 'expanded' ? 12 : 10;
  const panelWidth = mode === 'compact'
    ? Math.min(320, Math.max(188, contentWidth * 0.42))
    : mode === 'expanded'
      ? Math.min(660, contentWidth * 0.32)
      : Math.min(600, Math.max(420, contentWidth * 0.39));
  const cardWidth = Math.max(
    MIN_TOUCH,
    (panelWidth - panelBorderWidth * 2 - panelPadding * 2 - destinationGap * 2) / 3,
  );
  const cardHeight = mode === 'compact' ? 64 : mode === 'expanded' ? 184 : 166;
  const missionHeight = mode === 'compact' ? 128 : mode === 'expanded' ? 260 : Math.min(250, Math.max(210, contentHeight * 0.3));
  const bodyHeight = contentHeight - topBarHeight - gap;
  const leftWidth = contentWidth - panelWidth - gap;
  const panelTitleAllowance = mode === 'compact' ? 23 : mode === 'expanded' ? 60 : 54;
  const panelRequiredWidth = panelBorderWidth * 2 + panelPadding * 2 + cardWidth * 3 + destinationGap * 2;
  const panelRequiredHeight = panelBorderWidth * 2 + panelPadding * 2 + panelTitleAllowance + cardHeight * 2 + destinationGap;
  return { mode, safeWidth, safeHeight, contentWidth, contentHeight, panelWidth, panelBorderWidth, cardWidth, cardHeight, missionHeight, bodyHeight, leftWidth, panelRequiredWidth, panelRequiredHeight };
}

const cases = [
  [480, 270, 0, 0, 0, 0, 'compact', 'minimum 480x270'],
  [568, 320, 0, 0, 0, 0, 'compact', 'small landscape'],
  [854, 480, 0, 0, 0, 0, 'compact', 'compact 16:9'],
  [852, 393, 59, 59, 0, 21, 'compact', 'notched landscape phone'],
  [1024, 768, 0, 0, 0, 0, 'regular', '4:3 tablet'],
  [1280, 800, 0, 0, 0, 0, 'regular', '16:10 tablet'],
  [1536, 864, 0, 0, 0, 0, 'regular', 'reference landscape'],
  [1920, 1080, 0, 0, 0, 0, 'expanded', 'large landscape'],
  [2400, 1080, 0, 0, 0, 0, 'expanded', 'largest required 2400x1080'],
];

for (const [width, height, left, right, top, bottom, expectedMode, label] of cases) {
  const r = resolve(width, height, left, right, top, bottom);
  assert.equal(r.mode, expectedMode, `${label}: wrong breakpoint mode`);
  assert.ok(r.cardWidth >= MIN_TOUCH, `${label}: destination card width < ${MIN_TOUCH}`);
  assert.ok(r.cardHeight >= MIN_TOUCH, `${label}: destination card height < ${MIN_TOUCH}`);
  assert.ok(r.missionHeight >= MIN_TOUCH, `${label}: mission card cannot contain a ${MIN_TOUCH}dp CTA`);
  assert.ok(r.leftWidth > MIN_TOUCH * 2, `${label}: left column collapses`);
  assert.ok(r.panelWidth < r.contentWidth, `${label}: destination panel consumes full content width`);
  assert.ok(r.panelRequiredWidth <= r.panelWidth + 0.01, `${label}: three-card row overflows panel content box`);
  assert.ok(r.bodyHeight >= r.missionHeight, `${label}: mission card overflows body`);
  assert.ok(r.panelRequiredHeight <= r.bodyHeight + 1, `${label}: six-card grid overflows vertically`);
}

assert.match(backgroundSource, /from 'expo-image'/, 'Home background must use expo-image');
assert.match(backgroundSource, /home-background\.webp/, 'Home background must use the clean background asset');
assert.match(backgroundSource, /contentFit=\{layout\.backgroundFit\}/, 'Background fit must come from centralized layout');
assert.doesNotMatch(backgroundSource, /ImageBackground/, 'Deprecated ImageBackground must not be used');
assert.doesNotMatch(backgroundSource, /StyleSheet\.absoluteFillObject/, 'Home must not reintroduce StyleSheet.absoluteFillObject');
assert.match(controlsSource, /paddingLeft: layout\.insetLeft \+ layout\.gutter/, 'Home controls must physically honor left safe-area inset');
assert.match(controlsSource, /paddingRight: layout\.insetRight \+ layout\.gutter/, 'Home controls must physically honor right safe-area inset');
assert.match(controlsSource, /paddingTop: layout\.insetTop \+ layout\.gutter/, 'Home controls must physically honor top safe-area inset');
assert.match(controlsSource, /paddingBottom: layout\.insetBottom \+ layout\.gutter/, 'Home controls must physically honor bottom safe-area inset');
assert.match(controlsSource, /borderWidth: layout\.destinationPanelBorderWidth/, 'Destination panel border width must come from centralized layout');
assert.match(cardSource, /minWidth: layout\.touchTarget/, 'Destination controls need centralized min touch width');
assert.match(cardSource, /minHeight: layout\.touchTarget/, 'Destination controls need centralized min touch height');
assert.match(cardSource, /accessibilityRole="button"/, 'Destination controls need button semantics');
assert.match(cardSource, /source=\{destination\.art\}/, 'Destination controls must render real art instead of emoji-only buttons');
assert.match(cardSource, /destination\.subtitle/, 'Destination cards must preserve their learning/navigation subtitle');
assert.match(missionSource, /minHeight: layout\.touchTarget/, 'Mission CTA needs centralized min touch height');
assert.match(missionSource, /accessibilityLabel="Ir a mi misión actual"/, 'Mission CTA needs explicit accessibility label');
assert.equal((destinationsSource.match(/\{\n    id: '/g) ?? []).length, 6, 'HOME_DESTINATIONS must contain exactly six destinations');
assert.match(controlsSource, /HOME_DESTINATIONS\.map/, 'Home controls must render destinations data-driven');
assert.match(startSource, /<HomeSceneLayout/, 'Start route must delegate Home layout to HomeSceneLayout');
assert.doesNotMatch(startSource, /Pressable|ActionPill|FloatingCard|referenceCanvas|campInteractionLayer|hiddenProgress|HOME_REFERENCE/, 'Start route must not own old Home rendering/interactions');

for (const source of [backgroundSource, controlsSource, cardSource, missionSource, startSource]) {
  assert.doesNotMatch(source, /home-approved\.webp|repair-home-q80|prepare-home-visual-web/, 'Old exact-reference repair architecture must be absent from Home');
}

console.log('PASS check-home-responsive: compact 480x270 through expanded 2400x1080 satisfy layout, touch-target, illustrated-control and layering contracts.');
