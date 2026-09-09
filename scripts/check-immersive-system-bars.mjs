import fs from 'node:fs';

const files = [
  'src/app/_layout.tsx',
  'src/app/(tabs)/_layout.tsx',
];

let failed = false;

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const checks = [
    ['Android platform guard', "Platform.OS === 'android'"],
    ['navigation bar hidden', 'navigationBarHidden: immersiveAndroid'],
    ['status bar hidden', 'statusBarHidden: immersiveAndroid'],
  ];

  for (const [label, needle] of checks) {
    if (!source.includes(needle)) {
      console.error(`[FAIL] ${file}: missing ${label}`);
      failed = true;
    }
  }

  for (const deprecated of ['navigationBarTranslucent:', 'navigationBarColor:', 'statusBarTranslucent:']) {
    if (source.includes(deprecated)) {
      console.error(`[FAIL] ${file}: deprecated edge-to-edge option found: ${deprecated}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('[OK] Android immersive system-bar policy is present in root and nested stacks.');
