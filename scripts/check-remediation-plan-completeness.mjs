import fs from 'node:fs';

const verify = fs.readFileSync('VERIFY.ps1', 'utf8');
const required = [
  ['Block 2 navigation', 'check-navigation-return.mjs'],
  ['Block 3 Android immersive', 'check-immersive-system-bars.mjs'],
  ['Block 4 readability', 'check-readable-type.mjs'],
  ['Block 5 SFX', 'check-sfx-runtime.mjs'],
  ['Block 6 egg powers', 'check-egg-power-clarity.mjs'],
  ['P0 result resilience', 'check-game-result-resilience.mjs'],
  ['Block 7 financial direction', 'check-financial-direction.mjs'],
  ['Block 8 local journal', 'check-local-journal.mjs'],
  ['Block 9 seven-game regression', 'check-seven-game-regression.mjs'],
  ['Block 10 Expo dependency check', 'expo install --check'],
  ['Block 10 Expo Doctor', 'expo-doctor@latest'],
  ['Block 10 TypeScript strict', 'tsc --noEmit'],
  ['Block 10 Android export', 'expo export --platform android'],
];

const missing = required.filter(([, fragment]) => !verify.includes(fragment));
if (missing.length) {
  console.error('[FAIL] Remediation plan completeness');
  for (const [name, fragment] of missing) console.error(` - ${name}: missing ${fragment}`);
  process.exit(1);
}

console.log(`[OK] Remediation plan completeness: ${required.length} required controls are wired.`);
