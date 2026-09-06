export type BalloonCategory = 'Necesidad' | 'Deseo' | 'Ahorro';

export type BalloonBudgetItem = {
  id: string;
  label: string;
  category: BalloonCategory;
};

export type BalloonBudgetRound = {
  id: string;
  target: BalloonCategory;
  instruction: string;
  items: BalloonBudgetItem[];
};

export const BALLOON_BUDGET_ROUNDS: BalloonBudgetRound[] = [
  {
    id: 'needs',
    target: 'Necesidad',
    instruction: 'Revienta solo lo que necesitas para tu día.',
    items: [
      { id: 'water', label: 'Agua', category: 'Necesidad' },
      { id: 'notebook', label: 'Cuaderno', category: 'Necesidad' },
      { id: 'toy', label: 'Juguete', category: 'Deseo' },
      { id: 'candy', label: 'Dulces', category: 'Deseo' },
      { id: 'goal', label: 'Meta', category: 'Ahorro' },
      { id: 'emergency', label: 'Emergencia', category: 'Ahorro' },
    ],
  },
  {
    id: 'wants',
    target: 'Deseo',
    instruction: 'Ahora revienta solo los gustos que pueden esperar.',
    items: [
      { id: 'medicine', label: 'Medicina', category: 'Necesidad' },
      { id: 'lunch', label: 'Comida', category: 'Necesidad' },
      { id: 'stickers', label: 'Stickers', category: 'Deseo' },
      { id: 'game', label: 'Videojuego', category: 'Deseo' },
      { id: 'bike', label: 'Bici futura', category: 'Ahorro' },
      { id: 'trip', label: 'Viaje', category: 'Ahorro' },
    ],
  },
  {
    id: 'saving',
    target: 'Ahorro',
    instruction: 'Revienta solo las metas para las que conviene guardar dinero.',
    items: [
      { id: 'rent', label: 'Transporte', category: 'Necesidad' },
      { id: 'uniform', label: 'Uniforme', category: 'Necesidad' },
      { id: 'plush', label: 'Peluche', category: 'Deseo' },
      { id: 'snack', label: 'Snack extra', category: 'Deseo' },
      { id: 'console', label: 'Consola futura', category: 'Ahorro' },
      { id: 'rainy', label: 'Imprevistos', category: 'Ahorro' },
    ],
  },
];
