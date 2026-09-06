import type { ThemePack } from './ThemePack';
import { DINO_THEME } from './dinoTheme';
import { SWAP_TEST_THEME } from './swapTestTheme';

export const THEMES: Readonly<Record<string, ThemePack>> = {
  dino: DINO_THEME,
  'swap-test': SWAP_TEST_THEME,
};

/**
 * MVP switch point. The future Design Settings UI can persist one of THEMES keys.
 * Until then, changing this single id is enough to validate a whole-product theme swap.
 */
export const ACTIVE_THEME_ID = 'dino';

export function getTheme(themeId: string): ThemePack {
  return THEMES[themeId] ?? DINO_THEME;
}
