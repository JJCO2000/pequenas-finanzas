export type TreasureBucket = 'spend' | 'save' | 'invest';

export type TreasureSplitRound = {
  id: string;
  total: number;
  spend: number;
  save: number;
  invest: number;
  story: string;
};

export const TREASURE_SPLIT_ROUNDS: TreasureSplitRound[] = [
  {
    id: 'balanced',
    total: 10,
    spend: 4,
    save: 4,
    invest: 2,
    story: 'Tienes 10 recursos y un día normal por delante. Decide cómo equilibrar hoy, tu meta y el crecimiento.',
  },
  {
    id: 'goal-first',
    total: 10,
    spend: 3,
    save: 5,
    invest: 2,
    story: 'Tu meta está cerca. Decide cuánto proteger para el futuro sin quedarte sin recursos para hoy.',
  },
  {
    id: 'grow',
    total: 10,
    spend: 2,
    save: 3,
    invest: 5,
    story: 'Quieres hacer crecer más tu tesoro. Decide cuánto arriesgar sin abandonar gasto y ahorro.',
  },
];
