import type { ImageSourcePropType } from 'react-native';
import { pesos } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';

export type ShopItem = {
  id: string;
  title: string;
  priceCents: number;
  art: ImageSourcePropType;
  effectTitle: string;
  effectDescription: string;
  gameId: string;
};

type ShopItemCore = Pick<ShopItem, 'id' | 'priceCents' | 'gameId'>;

const SHOP_CATALOG: readonly ShopItemCore[] = [
  { id: 'egg-forest', priceCents: pesos(100), gameId: 'coin-catcher' },
  { id: 'egg-sunset', priceCents: pesos(180), gameId: 'coin-catcher' },
  { id: 'egg-ocean', priceCents: pesos(220), gameId: 'coin-catcher' },
  { id: 'egg-volcano', priceCents: pesos(300), gameId: 'coin-catcher' },
] as const;

export const SHOP_ITEMS: readonly ShopItem[] = SHOP_CATALOG.map((core) => {
  const presentation = ACTIVE_THEME.shop.items[core.id];
  if (!presentation) throw new Error(`Theme ${ACTIVE_THEME.id} is missing shop item ${core.id}`);
  return { ...core, ...presentation, art: presentation.asset };
});

export function getShopItem(id: string) {
  return SHOP_ITEMS.find((item) => item.id === id);
}
