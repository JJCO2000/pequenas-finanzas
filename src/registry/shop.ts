import { pesos } from '@/core/domain/money';
export const SHOP_ITEMS = [
  { id:'egg-forest', title:'Huevo Bosque', priceCents:pesos(100), emoji:'🥚' },
  { id:'egg-sunset', title:'Huevo Atardecer', priceCents:pesos(180), emoji:'🪺' },
  { id:'egg-ocean', title:'Huevo Océano', priceCents:pesos(220), emoji:'🥚' },
  { id:'egg-volcano', title:'Huevo Volcán', priceCents:pesos(300), emoji:'🌋' },
] as const;
