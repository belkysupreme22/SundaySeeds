import { fonts } from './tokens';

export const readingFonts = {
  latin: 'SourceSerif4_400Regular',
  ethiopic: 'NotoSerifEthiopic_400Regular',
} as const;

export const ethiopicFonts = {
  regular: 'NotoSansEthiopic_400Regular',
  emphasis: 'NotoSansEthiopic_600SemiBold',
  accent: 'GeezGofaMonoC_400Regular',
} as const;

export const authHeadingFonts = {
  latin: fonts.semibold,
  ethiopic: ethiopicFonts.emphasis,
} as const;

// Existing dense UI roles remain stable until each screen's larger-text review.
// New prose uses bodyLarge; long-form lessons use reading. See the system guide.
export const typeScale = {
  body: { fontSize: 14, lineHeight: 23 },
  bodyLarge: { fontSize: 16, lineHeight: 26 },
  small: { fontSize: 12, lineHeight: 19 },
  caption: { fontSize: 10, lineHeight: 16 },
  meta: { fontSize: 12, lineHeight: 18 },
  accentMeta: { fontSize: 12, lineHeight: 18 },
  label: { fontSize: 12, lineHeight: 19, fontFamily: fonts.semibold },
  control: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold },
  title: { fontSize: 17, lineHeight: 25, fontFamily: fonts.semibold, letterSpacing: -0.4 },
  heading: { fontSize: 25, lineHeight: 34, fontFamily: fonts.bold, letterSpacing: -0.7 },
  hero: { fontSize: 27, lineHeight: 35, fontFamily: fonts.bold, letterSpacing: -0.7 },
  authHeading: { fontSize: 26, lineHeight: 37, fontFamily: authHeadingFonts.latin },
  reading: { fontSize: 20, lineHeight: 32, fontFamily: readingFonts.latin },
} as const;

export type TypographyRole = keyof typeof typeScale;

export const emphasizedRoles: readonly TypographyRole[] = [
  'label',
  'control',
  'title',
  'heading',
  'hero',
];
