export type MarketCategory = 'drink' | 'food' | 'school' | 'fun' | 'safety';

export type MarketItem = {
  id: string;
  label: string;
  price: number;
  category: MarketCategory;
};

export type DinoMarketMission = {
  id: string;
  budget: number;
  maxSpend: number;
  requiredCategories: MarketCategory[];
  instruction: string;
  items: MarketItem[];
};

export const DINO_MARKET_MISSIONS: DinoMarketMission[] = [
  {
    id: 'school-day',
    budget: 12,
    maxSpend: 12,
    requiredCategories: ['drink', 'food', 'school'],
    instruction: 'Compra bebida, comida y algo escolar sin pasar de $12.',
    items: [
      { id: 'water', label: 'Agua', price: 3, category: 'drink' },
      { id: 'juice', label: 'Jugo', price: 5, category: 'drink' },
      { id: 'apple', label: 'Manzana', price: 4, category: 'food' },
      { id: 'pizza', label: 'Pizza', price: 8, category: 'food' },
      { id: 'pencil', label: 'Lápiz', price: 5, category: 'school' },
      { id: 'toy', label: 'Juguete', price: 9, category: 'fun' },
    ],
  },
  {
    id: 'save-some',
    budget: 15,
    maxSpend: 11,
    requiredCategories: ['food', 'fun'],
    instruction: 'Elige comida y diversión, pero conserva al menos $4.',
    items: [
      { id: 'sandwich', label: 'Sándwich', price: 6, category: 'food' },
      { id: 'fruit', label: 'Fruta', price: 4, category: 'food' },
      { id: 'stickers', label: 'Stickers', price: 5, category: 'fun' },
      { id: 'figure', label: 'Figura', price: 10, category: 'fun' },
      { id: 'water2', label: 'Agua', price: 3, category: 'drink' },
      { id: 'marker', label: 'Plumón', price: 4, category: 'school' },
    ],
  },
  {
    id: 'emergency-kit',
    budget: 14,
    maxSpend: 14,
    requiredCategories: ['safety', 'drink'],
    instruction: 'Arma un kit para imprevistos: seguridad + bebida sin desperdiciar el presupuesto.',
    items: [
      { id: 'bandage', label: 'Curitas', price: 6, category: 'safety' },
      { id: 'flashlight', label: 'Linterna', price: 9, category: 'safety' },
      { id: 'water3', label: 'Agua', price: 3, category: 'drink' },
      { id: 'soda', label: 'Refresco', price: 6, category: 'drink' },
      { id: 'candy2', label: 'Dulces', price: 4, category: 'fun' },
      { id: 'eraser', label: 'Goma', price: 3, category: 'school' },
    ],
  },
];
