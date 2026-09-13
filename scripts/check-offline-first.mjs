import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('../', import.meta.url);
const SRC = new URL('../src/', import.meta.url);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
}

walk(SRC.pathname);

const forbidden = [
  { name: 'runtime fetch()', re: /\bfetch\s*\(/ },
  { name: 'axios runtime client', re: /\baxios\b/ },
  { name: 'Supabase runtime client', re: /createClient\s*\(|@supabase\/supabase-js/ },
  { name: 'remote image/source URI', re: /(?:source|uri)\s*[=:]\s*\{?\s*['"]https?:\/\// },
  { name: 'WebSocket runtime dependency', re: /\bWebSocket\s*\(/ },
];

const violations = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.re.test(source)) violations.push(`${path.relative(ROOT.pathname, file)} -> ${rule.name}`);
  }
}

assert.equal(violations.length, 0, `Offline-first violations:\n${violations.join('\n')}`);

const migrations = fs.readFileSync(new URL('../src/core/data/database/migrations.ts', import.meta.url), 'utf8');
assert.match(migrations, /CREATE TABLE IF NOT EXISTS profiles/, 'SQLite profile persistence missing');
assert.match(migrations, /CREATE TABLE IF NOT EXISTS game_sessions/, 'SQLite game-session persistence missing');
assert.match(migrations, /CREATE TABLE IF NOT EXISTS adventure_state/, 'SQLite adventure persistence missing');

const appJson = JSON.parse(fs.readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
assert.notEqual(appJson?.expo?.updates?.useEmbeddedUpdate, false, 'Embedded update must stay enabled for offline fallback');

console.log(`PASS offline-first: ${files.length} source files have no required runtime network dependency; SQLite persistence and embedded-update fallback are present.`);
