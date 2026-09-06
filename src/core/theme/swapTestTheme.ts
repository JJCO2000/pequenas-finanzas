import type { ThemePack } from './ThemePack';
import { DINO_THEME } from './dinoTheme';

/**
 * Validation-only ThemePack. It intentionally remaps roles and visible copy without
 * adding new assets. If this pack can replace DINO_THEME from one registry switch,
 * feature code is not coupled to dinosaur-specific names or asset keys.
 *
 * This is not exposed in Settings and is not part of the MVP UI.
 */
export const SWAP_TEST_THEME: ThemePack = {
  ...DINO_THEME,
  id: 'swap-test',
  name: 'Prueba de intercambio',
  copy: {
    ...DINO_THEME.copy,
    companionSingular: 'compañero',
    companionPlural: 'compañeros',
    currencySingular: 'ficha',
    currencyPlural: 'fichas',
    escapeLocationLabel: 'Templo',
    games: {
      ...DINO_THEME.copy.games,
      'treasure-split': {
        title: 'Reparte los recursos',
        description: 'Planea cómo repartir fichas, descubre un evento sorpresa y observa qué tan resistente fue tu decisión.',
        shortInstruction: 'Planea el reparto, simula el evento y aprende de la consecuencia.',
      },
      'dino-market': { title: 'Mercado de la aventura', description: 'Recorre los estantes, completa tu lista, compara precios y pasa por caja sin romper el presupuesto.' },
      'fossil-escape': {
        title: 'Escape del templo',
        description: 'Explora el templo, toca objetos, resuelve cerraduras financieras y reúne cuatro llaves para abrir la salida.',
      },
    },
  },
  characters: {
    ...DINO_THEME.characters,
    primary: DINO_THEME.characters.secondary,
    secondary: DINO_THEME.characters.primary,
    marketGuide: DINO_THEME.characters.tertiary,
    escapeGuide: DINO_THEME.characters.quaternary,
    startCast: [...DINO_THEME.characters.startCast].reverse(),
  },
  world: {
    ...DINO_THEME.world,
    finance: DINO_THEME.world.activity,
    parents: DINO_THEME.world.onboarding,
  },
  shop: {
    ...DINO_THEME.shop,
    shelfTitle: 'Elige una reliquia',
    shelfHint: 'Toca una reliquia para ver qué cambia en tus minijuegos.',
    items: {
      'egg-forest': { ...DINO_THEME.shop.items['egg-forest']!, title: 'Reliquia Bosque' },
      'egg-sunset': { ...DINO_THEME.shop.items['egg-sunset']!, title: 'Reliquia Atardecer' },
      'egg-ocean': { ...DINO_THEME.shop.items['egg-ocean']!, title: 'Reliquia Océano', effectTitle: 'Imán de recursos' },
      'egg-volcano': { ...DINO_THEME.shop.items['egg-volcano']!, title: 'Reliquia Volcán' },
    },
  },
  investmentCompanions: DINO_THEME.investmentCompanions.map((item, index) => ({
    ...item,
    label: `Compañero ${index + 1}`,
  })),
};
