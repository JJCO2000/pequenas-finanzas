import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`[FAIL] ${message}`); failed = true; };

const presentation = fs.readFileSync('src/features/wallet/transactionPresentation.ts', 'utf8');
for (const [kind, direction, label, symbol] of [
  ['earn', 'inflow', 'ENTRA', '+'],
  ['spend', 'outflow', 'SALE', '−'],
  ['save', 'transfer', 'A AHORRO', '→'],
  ['unsave', 'transfer', 'DE AHORRO', '←'],
  ['invest', 'transfer', 'A INVERSIÓN', '→'],
  ['uninvest', 'transfer', 'DE INVERSIÓN', '←'],
  ['investment_return', 'transfer', 'COBRO INVERSIÓN', '↩'],
]) {
  const line = new RegExp(`${kind}:\\s*\\{[^\\n]*direction:\\s*'${direction}'[^\\n]*label:\\s*'${label}'[^\\n]*symbol:\\s*'${symbol}'`);
  if (!line.test(presentation)) fail(`Transaction presentation changed for ${kind}.`);
}
if (!presentation.includes("if (presentation.direction === 'inflow') return `+${amount}`")) fail('Inflows must render with +.');
if (!presentation.includes("if (presentation.direction === 'outflow') return `−${amount}`")) fail('Outflows must render with −.');

const walletUi = fs.readFileSync('src/app/wallet.tsx', 'utf8');
for (const needle of ['getTransactionPresentation', 'formatTransactionAmount', 'historyInflow', 'historyOutflow', 'historyTransfer']) {
  if (!walletUi.includes(needle)) fail(`Wallet history is missing direction UI: ${needle}`);
}
if (walletUi.includes('formatMoney(transaction.amountCents)')) fail('Wallet reverted to unsigned transaction amounts.');

const walletRepo = fs.readFileSync('src/core/data/repositories/walletRepository.ts', 'utf8');
for (const needle of [
  "case 'earn':\n        available += amount;\n        earned += amount;",
  "case 'spend':\n        if (available < amount) throw new Error('Saldo insuficiente');\n        available -= amount;\n        spent += amount;",
  "case 'save':\n        if (available < amount) throw new Error('Saldo insuficiente');\n        available -= amount;\n        savings += amount;",
  "case 'unsave':\n        if (savings < amount) throw new Error('Ahorro insuficiente');\n        savings -= amount;\n        available += amount;",
]) {
  if (!walletRepo.includes(needle)) fail('Core wallet accounting invariant changed.');
}

const investmentRepo = fs.readFileSync('src/core/data/repositories/investmentRepository.ts', 'utf8');
if (!investmentRepo.includes('lifetime_earned_cents=lifetime_earned_cents+?')) fail('Investment profit must still increase lifetime earned.');
if (!investmentRepo.includes("'investment_return',\n      investment.payoutCents")) fail('Investment return log must still record payout amount.');

if (failed) process.exit(1);
console.log('[OK] Transaction history distinguishes inflow/outflow/transfer without changing wallet accounting.');
