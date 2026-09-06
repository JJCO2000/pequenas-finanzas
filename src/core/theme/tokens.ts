export const colors = {
  forestDark: '#123F2C',
  forestDeep: '#0B3324',
  forest: '#0D6B49',
  forestBright: '#14845B',
  leaf: '#72AD54',
  leafSoft: '#A6D393',
  aqua: '#27B8CF',
  aquaSoft: '#A9E6EF',
  sky: '#DDF4FA',
  orange: '#F47A22',
  orangeSoft: '#FFC89E',
  gold: '#FFD34E',
  goldSoft: '#FFE79A',
  brown: '#8A5B42',
  cream: '#F8F2E5',
  creamStrong: '#E7DCC6',
  surface: '#FFFDF8',
  surfaceMuted: '#EFF6E8',
  surfaceGreen: '#EAF7E5',
  surfaceGold: '#FFF4C9',
  surfaceAqua: '#E4F8FB',
  surfaceOrange: '#FFF0E5',
  surfacePurple: '#F1E8FF',
  surfaceDanger: '#FFE5E2',
  white: '#FFFFFF',
  ink: '#17352A',
  inkMuted: '#66756C',
  purple: '#8C62D4',
  danger: '#D54A4A',
  disabled: '#B8C3BA',
  transparent: 'transparent',
  glassDark: 'rgba(9, 61, 42, 0.94)',
  glassForest: 'rgba(13, 107, 73, 0.88)',
  glassCream: 'rgba(255, 253, 248, 0.96)',
  glassBrown: 'rgba(111, 73, 54, 0.91)',
  glassBlack: 'rgba(18, 16, 13, 0.48)',
  glassWhite: 'rgba(255, 255, 255, 0.82)',
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
export const radii = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

// Compact landscape UI still needs a readable floor. Functional copy should
// use these roles instead of one-off 5–9px values.
export const typography = {
  micro: 10,
  caption: 11,
  label: 12,
  small: 13,
  body: 17,
  h2: 21,
  h1: 28,
  title: 36,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
