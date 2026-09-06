import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { console.error(`[FAIL] ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`[OK] ${message}`);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel));
    else if (/\.tsx?$/.test(entry.name)) out.push(rel.replaceAll('\\', '/'));
  }
  return out;
}

const srcFiles = walk('src');
const source = new Map(srcFiles.map((file) => [file, read(file)]));

const assetViolations = [...source].filter(([file, text]) =>
  text.includes('ASSETS.') && file !== 'src/core/theme/dinoTheme.ts' && file !== 'src/registry/assets.ts'
);
if (assetViolations.length) fail(`Raw ASSETS consumed outside asset/theme source: ${assetViolations.map(([f]) => f).join(', ')}`);
else ok('Semantic UI assets come from ThemePack; raw ASSETS stay in registry/assets + dinoTheme.');

const requireViolations = [...source].filter(([file, text]) => text.includes('require(') && file !== 'src/registry/assets.ts');
if (requireViolations.length) fail(`Runtime require() outside registry/assets.ts: ${requireViolations.map(([f]) => f).join(', ')}`);
else ok('Runtime require() remains centralized in registry/assets.ts.');

const legacyThemeTerms = /InvestmentDinosaur|investmentDinosaurs|dinosaurKey|getInvestmentDinosaur|getNextInvestmentDinosaur/;
const legacyViolations = [...source].filter(([file, text]) => legacyThemeTerms.test(text));
if (legacyViolations.length) fail(`Species-specific investment domain API remains: ${legacyViolations.map(([f]) => f).join(', ')}`);
else ok('Investment domain uses neutral companion terminology.');

const repository = read('src/core/data/repositories/appRepository.ts').split(/\r?\n/).length;
if (repository > 30) fail(`appRepository.ts is still monolithic (${repository} lines).`);
else ok(`appRepository.ts is a compatibility barrel (${repository} lines).`);

const repoFiles = srcFiles.filter((f) => f.startsWith('src/core/data/repositories/') && f.endsWith('.ts'));
const repoSizes = repoFiles.map((f) => ({ f, lines: read(f).split(/\r?\n/).length }));
const largest = repoSizes.sort((a,b) => b.lines-a.lines)[0];
if (largest?.lines > 320) fail(`Repository concern too large: ${largest.f} (${largest.lines}).`);
else ok(`Repository implementation split by concern; largest is ${largest?.lines ?? 0} lines.`);

const gamePresentation = read('src/registry/gamePresentation.ts');
if (!gamePresentation.includes('game.presentation.badge') || !gamePresentation.includes('ACTIVE_THEME.gameHeroes')) {
  fail('Game presentation is not derived from manifest + theme.');
} else ok('Game presentation derives from one metadata source (manifest) plus active ThemePack.');

for (const file of srcFiles.filter((f) => /src\/features\/games\/[^/]+\/manifest\.ts$/.test(f))) {
  if (!read(file).includes('presentation:')) fail(`Missing manifest presentation metadata: ${file}`);
}

const gitignore = read('.gitignore');
if (!gitignore.includes('.pf-backups/')) {
  fail('.pf-backups/ is not ignored.');
} else {
  ok('.pf-backups/ is ignored to prevent backup pollution.');
}

// Runtime backups are expected: INSTALL.ps1 creates .pf-backups for rollback.
// What must never happen is shipping/versioning those backups as product source.
let trackedBackupFiles = [];
try {
  const { execFileSync } = await import('node:child_process');
  const output = execFileSync('git', ['ls-files', '--', '.pf-backups'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  trackedBackupFiles = output.split(/\r?\n/).filter(Boolean);
} catch {
  // Git may be unavailable; .gitignore remains the fallback structural guard.
}

if (trackedBackupFiles.length) {
  fail(`.pf-backups contains versioned files: ${trackedBackupFiles.join(', ')}`);
} else {
  ok('Runtime .pf-backups may exist for rollback, but no backup files are versioned/shipped as source.');
}

const support = read('src/core/data/repositories/repositorySupport.ts');
if (!support.includes('LEGACY_INVESTMENT_COMPANION_KEYS') || !support.includes('row.dinosaur_key')) {
  fail('Legacy investment compatibility adapter missing.');
} else ok('Legacy SQLite dinosaur_key values are isolated behind a compatibility adapter.');

if (!process.exitCode) console.log('[OK] PLAN 7 JUEGOS — BLOQUE 0 SSOT control passed.');
