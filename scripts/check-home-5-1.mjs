import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync(new URL('../src/app/start.tsx', import.meta.url), 'utf8');

assert.match(home, /testID="home-reference-canvas"/, 'Home must expose the exact reference canvas for rendered visual verification');

const hiddenProgressIndex = home.indexOf('style={styles.hiddenProgress}');
assert.ok(hiddenProgressIndex >= 0, 'Hidden canonical progress wrapper must exist');
const hiddenProgressSource = home.slice(Math.max(0, hiddenProgressIndex - 260), hiddenProgressIndex + 220);
assert.ok(hiddenProgressSource.includes('pointerEvents="none"'), 'Hidden canonical progress must not intercept touches');
assert.ok(hiddenProgressSource.includes('accessible={false}'), 'Hidden canonical progress wrapper must not become an accessibility element');
assert.ok(hiddenProgressSource.includes('accessibilityElementsHidden'), 'Hidden canonical progress descendants must be hidden from iOS accessibility');
assert.ok(hiddenProgressSource.includes('importantForAccessibility="no-hide-descendants"'), 'Hidden canonical progress descendants must be hidden from Android accessibility');
assert.ok(hiddenProgressSource.includes('<AdventureStageProgress dayNumber={currentDay} compact />'), 'Hidden canonical progress must stay wired to the current day');

assert.match(home, /hiddenProgress: \{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' \}/, 'Canonical progress must remain visually inert');
assert.match(home, /const stage = getAdventureStage\(currentDay\)/, 'Visible mission progress must still come from the canonical adventure stage calculation');

console.log('PASS check-home-5-1: hidden progress is accessibility-safe and reference canvas is E2E-addressable.');
