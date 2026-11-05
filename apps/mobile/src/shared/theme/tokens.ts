// Brand roles lead navigation, actions and large surfaces; pastels remain accents.
export const brandColors = {
  forest: '#173E32',
  onForest: '#F7F3E8',
  canvas: '#F7F3E8',
  surface: '#E6EDDF',
  surfaceStrong: '#D9E5D2',
  muted: '#647261',
  controlBorder: '#788672',
} as const;

export const colors = {
  paper: brandColors.canvas,
  white: '#FFFFFF',
  ink: '#19171D',
  muted: brandColors.muted,
  mint: '#E0ECE2',
  yellow: '#F2E8C9',
  peach: '#F1E2D4',
  pink: '#EEDDDC',
  line: '#D7DCCF',
  outline: brandColors.controlBorder,
  soft: '#EEF0E6',
  success: '#225F4B',
  danger: '#A52F3F',
} as const;
export const accentColors = {
  mint: colors.mint,
  wheat: colors.yellow,
  peach: colors.peach,
  rose: colors.pink,
} as const;
export type Pastel = 'mint' | 'yellow' | 'peach' | 'pink';
// Card-sized tone areas are quieter than the compact accent badges.
export const cardColors: Record<Pastel, string> = {
  mint: brandColors.surface,
  yellow: '#F7F0D7',
  peach: '#F5EBDF',
  pink: '#F5E8E5',
};
export const fonts = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 28 };
