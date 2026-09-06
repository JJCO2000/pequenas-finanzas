import { pesos } from '@/core/domain/money';
import type { GameResult } from '@/core/game-runtime';
export type RewardRule = { id: string; calculate: (result: GameResult) => number; description: string };
export const REWARD_RULES: Record<string, RewardRule> = {
  'coin-catcher-score': {
    id: 'coin-catcher-score',
    description: '$5 por moneda, máximo $50 por sesión.',
    calculate: (result) => Math.min(pesos(50), Math.max(0, Math.trunc(result.score)) * pesos(5)),
  },
  'score-percent-50': {
    id: 'score-percent-50',
    description: 'Convierte un puntaje de 0 a 100 en una recompensa de hasta $50.',
    calculate: (result) => {
      const score = Math.max(0, Math.min(100, Math.trunc(result.score)));
      return Math.floor(score / 10) * pesos(5);
    },
  },
};
export function calculateGameReward(ruleId: string, result: GameResult) {
  const rule = REWARD_RULES[ruleId];
  if (!rule) throw new Error(`Reward rule desconocida: ${ruleId}`);
  return rule.calculate(result);
}
