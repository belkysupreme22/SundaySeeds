// Brand roles lead navigation, actions and large surfaces; pastels remain accents.
export const brandColors = {
  forest: '#173E32',
  onForest: '#F7F3E8',
  canvas: '#F7F3E8',
  surface: '#E6EDDF',
  surfaceStrong: '#D9E5D2',
  muted: '#647261',
} as const;

export const colors = {
  paper: brandColors.canvas,
  white: '#FFFFFF',
  ink: '#19171D',
  muted: '#6D6777',
  lavender: '#DCD3FA',
  primary: '#CBBBF4',
  mint: '#B9EBDD',
  yellow: '#FFED8D',
  peach: '#FFD0B0',
  pink: '#F3C9EC',
  line: '#DED9E5',
  outline: '#AAA6B1',
  soft: '#F1EDF7',
  success: '#225F4B',
  danger: '#A52F3F',
} as const;
export type Pastel = 'lavender' | 'mint' | 'yellow' | 'peach' | 'pink';
// Card-sized tone areas are quieter than the compact accent badges.
export const cardColors: Record<Pastel, string> = {
  lavender: '#EFEAF4',
  mint: brandColors.surface,
  yellow: '#F7F0D7',
  peach: '#F5EBDF',
  pink: '#F4EAF0',
};
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 28 };
