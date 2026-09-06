import type { InventoryItem } from '@/core/domain/types';

export type GameModifiers = {
  extraSeconds: number;
  basketWidthBonus: number;
  magnetRadius: number;
  scoreBonusEvery: number;
};

export function deriveGameModifiers(inventory: InventoryItem[]): GameModifiers {
  const owned = new Set(inventory.filter((item) => item.quantity > 0).map((item) => item.itemId));
  return {
    extraSeconds: owned.has('egg-forest') ? 5 : 0,
    basketWidthBonus: owned.has('egg-sunset') ? 28 : 0,
    magnetRadius: owned.has('egg-ocean') ? 72 : 0,
    scoreBonusEvery: owned.has('egg-volcano') ? 4 : 0,
  };
}
