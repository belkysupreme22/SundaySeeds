export const colors = {
  paper: '#FCFAFF',
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
  soft: '#F1EDF7',
  success: '#225F4B',
  danger: '#A52F3F',
} as const;
export type Pastel = 'lavender' | 'mint' | 'yellow' | 'peach' | 'pink';
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 28 };
