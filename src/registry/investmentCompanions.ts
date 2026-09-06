import type { InvestmentCompanionKey } from '@/core/domain/types';
import { ACTIVE_THEME } from '@/core/theme';

const DEFAULT_INVESTMENT_COMPANION = ACTIVE_THEME.investmentCompanions[0]!;

export const INVESTMENT_COMPANIONS = ACTIVE_THEME.investmentCompanions;

export function getInvestmentCompanion(key: InvestmentCompanionKey) {
  return INVESTMENT_COMPANIONS.find((item) => item.key === key) ?? DEFAULT_INVESTMENT_COMPANION;
}

export function getNextInvestmentCompanion(investmentCount: number) {
  return INVESTMENT_COMPANIONS[Math.max(0, investmentCount) % INVESTMENT_COMPANIONS.length]
    ?? DEFAULT_INVESTMENT_COMPANION;
}
