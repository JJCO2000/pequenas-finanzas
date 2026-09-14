import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync(new URL('../src/app/start.tsx', import.meta.url), 'utf8');

assert.match(home, /testID="home-reference-canvas"/, 'Home must expose the exact reference canvas for rendered visual verification');
assert.match(
  home,
  /<View\s+pointerEvents="none"\s+accessible=\{false\}\s+accessibilityElementsHidden\s+importantForAccessibility="no-hide-descendants"\s+style=\{styles\.hiddenProgress\}>[\s\S]{0,180}<AdventureStageProgress dayNumber=\{currentDay\} compact \/>/,
  'Hidden canonical progress must be removed from both iOS and Android accessibility trees',
);
assert.match(home, /hiddenProgress: \{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' \}/, 'Canonical progress must remain visually inert');
assert.match(home, /const stage = getAdventureStage\(currentDay\)/, 'Visible mission progress must still come from the canonical adventure stage calculation');

console.log('PASS check-home-5-1: hidden progress is accessibility-safe and reference canvas is E2E-addressable.');
