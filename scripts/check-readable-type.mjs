import fs from 'node:fs';

const criticalFiles = [
  'src/core/theme/tokens.ts',
  'src/features/shell/gameui/GameSurface.tsx',
  'src/features/games/ui/GameIntroScreen.tsx',
  'src/features/games/ui/GameChrome.tsx',
  'src/features/parents/ParentGate.tsx',
  'src/features/wallet/components/InvestmentPortfolio.tsx',
  'src/app/arcade.tsx',
  'src/app/settings.tsx',
  'src/app/shop.tsx',
  'src/app/collection.tsx',
  'src/app/wallet.tsx',
  'src/app/investments.tsx',
];

let failed = false;
const numericFontSize = /fontSize\s*:\s*(\d+(?:\.\d+)?)/g;

for (const file of criticalFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(numericFontSize)) {
    const size = Number(match[1]);
    if (size < 10) {
      console.error(`[FAIL] ${file}: functional fontSize ${size} is below the 10px compact-UI floor.`);
      failed = true;
    }
  }
}

const tokens = fs.readFileSync('src/core/theme/tokens.ts', 'utf8');
for (const role of ['micro', 'caption', 'label', 'small', 'body']) {
  const match = tokens.match(new RegExp(`${role}\\s*:\\s*(\\d+(?:\\.\\d+)?)`));
  if (!match || Number(match[1]) < 10) {
    console.error(`[FAIL] typography.${role} is missing or below 10.`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`[OK] Readability floor holds across ${criticalFiles.length} critical UI files.`);
