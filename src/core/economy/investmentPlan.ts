import type { Investment } from '@/core/domain/types';

export const INVESTMENT_TERM_LEVELS = 4;
export const INVESTMENT_RETURN_PERCENT = 50;

export type InvestmentOpportunity = {
  createdLevelId: string;
  createdLevelOrder: number;
  targetLevelId: string;
  targetLevelOrder: number;
};

export type InvestmentForecastPoint = {
  levelId: string;
  levelOrder: number;
  projectedProfitCents: number;
  projectedValueCents: number;
  claimableCents: number;
  isTarget: boolean;
};

export function calculateInvestmentProfit(principalCents: number) {
  return Math.round(Math.max(0, Math.trunc(principalCents)) * (INVESTMENT_RETURN_PERCENT / 100));
}

export function calculateInvestmentPayout(principalCents: number) {
  const principal = Math.max(0, Math.trunc(principalCents));
  return principal + calculateInvestmentProfit(principal);
}

export function getInvestmentOpportunityForDay(currentDay: number): InvestmentOpportunity {
  const createdDay = Math.max(1, Math.trunc(currentDay));
  const targetDay = createdDay + INVESTMENT_TERM_LEVELS;
  return {
    createdLevelId: `day-${createdDay}`,
    createdLevelOrder: createdDay,
    targetLevelId: `day-${targetDay}`,
    targetLevelOrder: targetDay,
  };
}

export function buildInvestmentForecastByDays(
  seed: Pick<Investment, 'principalCents' | 'payoutCents' | 'createdLevelOrder' | 'targetLevelOrder'>,
): InvestmentForecastPoint[] {
  const start = seed.createdLevelOrder;
  const target = seed.targetLevelOrder;
  if (target <= start) return [];
  const totalProfit = Math.max(0, seed.payoutCents - seed.principalCents);
  const denominator = Math.max(1, target - start);
  const points: InvestmentForecastPoint[] = [];

  for (let day = start; day <= target; day += 1) {
    const ratio = (day - start) / denominator;
    const projectedProfitCents = Math.round(totalProfit * ratio);
    const isTarget = day === target;
    points.push({
      levelId: `day-${day}`,
      levelOrder: day,
      projectedProfitCents,
      projectedValueCents: seed.principalCents + projectedProfitCents,
      claimableCents: isTarget ? seed.payoutCents : 0,
      isTarget,
    });
  }
  return points;
}

export function buildPortfolioProfitForecast(investments: Investment[]) {
  if (investments.length === 0) return [] as InvestmentForecastPoint[];
  const start = Math.min(...investments.map((item) => item.createdLevelOrder));
  const target = Math.max(...investments.map((item) => item.targetLevelOrder));
  const points: InvestmentForecastPoint[] = [];

  for (let day = start; day <= target; day += 1) {
    let projectedProfitCents = 0;
    let projectedValueCents = 0;
    let claimableCents = 0;
    for (const investment of investments) {
      if (day < investment.createdLevelOrder) continue;
      const denominator = Math.max(1, investment.targetLevelOrder - investment.createdLevelOrder);
      const ratio = Math.min(1, Math.max(0, (day - investment.createdLevelOrder) / denominator));
      const profit = Math.round(investment.profitCents * ratio);
      projectedProfitCents += profit;
      projectedValueCents += investment.principalCents + profit;
      if (day === investment.targetLevelOrder) claimableCents += investment.payoutCents;
    }
    points.push({
      levelId: `day-${day}`,
      levelOrder: day,
      projectedProfitCents,
      projectedValueCents,
      claimableCents,
      isTarget: claimableCents > 0,
    });
  }
  return points;
}
