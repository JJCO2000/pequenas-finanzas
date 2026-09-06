import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const roots = ['src'];
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name).replaceAll('\\','/');
    if (e.isDirectory()) walk(rel);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(rel);
  }
}
for (const d of roots) walk(d);
const candidates = (base) => [base, `${base}.native.tsx`, `${base}.native.ts`, `${base}.tsx`, `${base}.ts`, `${base}.js`, `${base}/index.native.tsx`, `${base}/index.tsx`, `${base}/index.ts`];
const existsModule = (from, spec) => {
  if (!(spec.startsWith('.') || spec.startsWith('@/'))) return true;
  const base = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : path.resolve(root, path.dirname(from), spec);
  return candidates(base).some((p) => fs.existsSync(p));
};
let misses=[];
const re = /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
for (const file of files) {
  const text=fs.readFileSync(path.join(root,file),'utf8');
  for (const m of text.matchAll(re)) if (!existsModule(file,m[1])) misses.push(`${file} -> ${m[1]}`);
}
if (misses.length) { for (const m of misses) console.error(`[FAIL] ${m}`); process.exitCode=1; }
else console.log(`[OK] ${files.length} TS/TSX files: local/alias imports resolve to project files.`);
