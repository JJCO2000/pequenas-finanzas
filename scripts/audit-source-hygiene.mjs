import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const files = walk(srcRoot);
const rows = files.map((file) => ({
  file: path.relative(root, file).replaceAll('\\', '/'),
  text: fs.readFileSync(file, 'utf8'),
}));
const joined = rows.map((row) => row.text).join('\n');

const critical = [
  ['TypeScript suppression', /@ts-(?:ignore|nocheck)/g],
  ['dynamic eval', /\beval\s*\(|\bnew\s+Function\s*\(/g],
  ['private-key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['service-role credential name', /SUPABASE_SERVICE_ROLE_KEY/g],
  ['async useEffect callback', /useEffect\s*\(\s*async\b/g],
  ['unsupported absoluteFillObject', /StyleSheet\.absoluteFillObject/g],
];

let failed = false;
for (const [label, pattern] of critical) {
  const hits = rows.flatMap((row) => [...row.text.matchAll(pattern)].map(() => row.file));
  if (hits.length) {
    failed = true;
    console.error(`[FAIL] ${label}: ${hits.length} hit(s) in ${[...new Set(hits)].join(', ')}`);
  } else {
    console.log(`[OK] ${label}: 0`);
  }
}

const advisory = [
  ['explicit any assertions', /\bas any\b/g],
  ['TODO/FIXME markers', /\b(?:TODO|FIXME)\b/g],
  ['console logging', /console\.(?:log|warn|error)\s*\(/g],
  ['Math.random calls', /Math\.random\s*\(/g],
  ['timers', /\b(?:setTimeout|setInterval)\s*\(/g],
];

console.log(`\n[AUDIT] scanned ${files.length} TypeScript/TSX files under src/.`);
for (const [label, pattern] of advisory) {
  const count = [...joined.matchAll(pattern)].length;
  console.log(`[INFO] ${label}: ${count}`);
}

if (failed) process.exit(1);
console.log('PASS audit-source-hygiene: no critical source hygiene violations detected.');
