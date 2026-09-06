import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`[FAIL] ${message}`); failed = true; };

const assetPath = 'assets/audio/sfx/tap.wav';
if (!fs.existsSync(assetPath)) {
  fail('Original SFX asset is missing.');
} else {
  const wav = fs.readFileSync(assetPath);
  if (wav.length < 500) fail(`SFX asset is unexpectedly small (${wav.length} bytes).`);
  if (wav.subarray(0, 4).toString('ascii') !== 'RIFF' || wav.subarray(8, 12).toString('ascii') !== 'WAVE') {
    fail('SFX asset is not a valid RIFF/WAVE file.');
  }
}

const provider = fs.readFileSync('src/features/audio/SfxProvider.tsx', 'utf8');
for (const [label, needle] of [
  ['expo-audio player', 'useAudioPlayer'],
  ['sound setting gate', "settings.sound !== 'off'"],
  ['replay from start', 'seekTo(0)'],
  ['cue rate variation', 'playbackRate'],
]) {
  if (!provider.includes(needle)) fail(`SfxProvider is missing ${label}.`);
}

for (const file of ['src/features/shell/gameui/GameSurface.tsx', 'src/features/games/ui/GameChrome.tsx']) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('useSfx')) fail(`${file} is not wired to SFX.`);
  if (!source.includes("play('tap')")) fail(`${file} has no tap feedback.`);
}

const settings = fs.readFileSync('src/app/settings.tsx', 'utf8');
if (!settings.includes('Efectos del juego')) fail('Settings does not describe the implemented sound scope accurately.');
if (settings.includes('Música y efectos')) fail('Settings still promises music although music is not implemented.');

const shop = fs.readFileSync('src/app/shop.tsx', 'utf8');
if (!shop.includes("play('success')") || !shop.includes("play('error')")) fail('Shop lacks success/error SFX feedback.');

if (failed) process.exit(1);
console.log('[OK] SFX asset, setting gate and shared runtime wiring are present.');
