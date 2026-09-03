import { pesos } from '@/core/domain/money';
export const REWARDS = {
  'lesson-20': pesos(20), 'lesson-25': pesos(25), 'lesson-30': pesos(30), 'lesson-35': pesos(35), 'lesson-40': pesos(40), 'lesson-50': pesos(50),
} as const;
export function getFixedReward(id: string) { const value = REWARDS[id as keyof typeof REWARDS]; if (value === undefined) throw new Error(`Reward inexistente: ${id}`); return value; }
