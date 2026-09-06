export type MoneyMemoryCard = {
  id: string;
  pairId: string;
  label: string;
};

export const MONEY_MEMORY_CARDS: MoneyMemoryCard[] = [
  { id: 'saving-concept', pairId: 'saving', label: 'AHORRO' },
  { id: 'saving-action', pairId: 'saving', label: 'Meta futura' },
  { id: 'budget-concept', pairId: 'budget', label: 'PRESUPUESTO' },
  { id: 'budget-action', pairId: 'budget', label: 'Plan del dinero' },
  { id: 'need-concept', pairId: 'need', label: 'NECESIDAD' },
  { id: 'need-action', pairId: 'need', label: 'Algo importante' },
  { id: 'invest-concept', pairId: 'invest', label: 'INVERSIÓN' },
  { id: 'invest-action', pairId: 'invest', label: 'Buscar crecimiento' },
];
