import type { WalletTransaction, WalletTransactionKind } from '@/core/domain/types';
import { formatMoney } from '@/core/domain/money';

export type TransactionDirection = 'inflow' | 'outflow' | 'transfer';

export type TransactionPresentation = {
  direction: TransactionDirection;
  label: string;
  symbol: '+' | '−' | '→' | '←' | '↩';
};

const PRESENTATION: Record<WalletTransactionKind, TransactionPresentation> = {
  earn: { direction: 'inflow', label: 'ENTRA', symbol: '+' },
  spend: { direction: 'outflow', label: 'SALE', symbol: '−' },
  save: { direction: 'transfer', label: 'A AHORRO', symbol: '→' },
  unsave: { direction: 'transfer', label: 'DE AHORRO', symbol: '←' },
  invest: { direction: 'transfer', label: 'A INVERSIÓN', symbol: '→' },
  uninvest: { direction: 'transfer', label: 'DE INVERSIÓN', symbol: '←' },
  investment_return: { direction: 'transfer', label: 'COBRO INVERSIÓN', symbol: '↩' },
};

export function getTransactionPresentation(kind: WalletTransactionKind) {
  return PRESENTATION[kind];
}

export function formatTransactionAmount(transaction: WalletTransaction) {
  const presentation = getTransactionPresentation(transaction.kind);
  const amount = formatMoney(transaction.amountCents);
  if (presentation.direction === 'inflow') return `+${amount}`;
  if (presentation.direction === 'outflow') return `−${amount}`;
  return amount;
}
