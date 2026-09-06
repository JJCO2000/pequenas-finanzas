import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const required = [
  'src/core/economy/investmentPlan.ts',
  'src/registry/investmentCompanions.ts',
  'src/features/wallet/components/InvestmentPortfolio.tsx',
  'src/core/data/database/migrations.ts',
  'src/core/data/repositories/investmentRepository.ts',
  'src/core/data/repositories/repositorySupport.ts',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Investment Plan 2.1 missing: ${file}`);
}
const investment = read('src/core/economy/investmentPlan.ts');
const migrations = read('src/core/data/database/migrations.ts');
const repository = read('src/core/data/repositories/investmentRepository.ts');
const support = read('src/core/data/repositories/repositorySupport.ts');
const map = read('src/features/adventure/AdventureMapScreen.tsx');
if (!/INVESTMENT_TERM_LEVELS\s*=\s*4/.test(investment)) throw new Error('Investment term must be N+4.');
if (!/INVESTMENT_RETURN_PERCENT\s*=\s*50/.test(investment)) throw new Error('Investment return must be +50%.');
if (!/DROP INDEX IF EXISTS investments_one_active_per_profile/.test(migrations)) throw new Error('Multiple active investments are not enabled.');
if (!/status='active'[\s\S]*target_level_order<=\?/.test(repository)) throw new Error('Automatic maturity query missing.');
if (!/mapInvestments\.map/.test(map) || !/getInvestmentCompanion/.test(map)) throw new Error('Investment companions are not rendered on the map.');
if (!/LEGACY_INVESTMENT_COMPANION_KEYS/.test(support)) throw new Error('Legacy investment key compatibility is missing.');
console.log('[OK] Investment Plan 2.1: N+4, +50%, multiple active, automatic maturity, neutral companions and legacy compatibility.');
