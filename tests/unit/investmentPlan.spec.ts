import { pesos } from '@/core/domain/money';
import {
  calculateInvestmentPayout,
  calculateInvestmentProfit,
  INVESTMENT_RETURN_PERCENT,
  INVESTMENT_TERM_LEVELS,
} from '@/core/economy/investmentPlan';

export function investmentPlanSmokeTest() {
  const principal = pesos(10);
  if (INVESTMENT_TERM_LEVELS !== 4) throw new Error('Investment term must be four levels.');
  if (INVESTMENT_RETURN_PERCENT !== 50) throw new Error('Investment return must be 50%.');
  if (calculateInvestmentProfit(principal) !== pesos(5)) throw new Error('Expected $5 profit.');
  if (calculateInvestmentPayout(principal) !== pesos(15)) throw new Error('Expected $15 payout.');
}
