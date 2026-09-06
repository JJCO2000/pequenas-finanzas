import { ACTIVE_THEME_ID, getTheme } from './themeRegistry';

/**
 * MVP switch point. Add a ThemePack to themeRegistry and change ACTIVE_THEME_ID here/there.
 * A future Design Settings UI can persist the selected id without changing feature/game code.
 */
export const ACTIVE_THEME = getTheme(ACTIVE_THEME_ID);
