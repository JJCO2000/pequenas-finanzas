import fs from 'node:fs';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}
function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
}

const ts = readJson('tsconfig.json');
if (Object.prototype.hasOwnProperty.call(ts.compilerOptions ?? {}, 'baseUrl')) {
  fail('tsconfig.json still contains deprecated compilerOptions.baseUrl.');
}
const alias = ts.compilerOptions?.paths?.['@/*'];
if (!Array.isArray(alias) || !alias.includes('./src/*')) {
  fail('tsconfig alias @/* must resolve explicitly to ./src/*.');
}

const app = readJson('app.json');
const plugins = Array.isArray(app.expo?.plugins) ? app.expo.plugins : [];
const audio = plugins.find((p) => (Array.isArray(p) ? p[0] : p) === 'expo-audio');
if (!Array.isArray(audio) || !audio[1] || typeof audio[1] !== 'object') {
  fail('expo-audio must use explicit child-safe plugin options.');
}
const opts = audio[1];
if (opts.microphonePermission !== false || opts.recordAudioAndroid !== false || opts.enableBackgroundRecording !== false || opts.enableBackgroundPlayback !== false) {
  fail('expo-audio child-safe options are not all disabled.');
}
console.log('[OK] TypeScript 6 aliases and child-safe audio config are correct.');
