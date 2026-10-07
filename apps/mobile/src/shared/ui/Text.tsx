import { Text as NativeText, StyleSheet, type TextProps } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Variant = 'body' | 'small' | 'caption' | 'label' | 'title' | 'heading' | 'hero';
export function Text({
  variant = 'body',
  muted,
  style,
  ...props
}: TextProps & { variant?: Variant; muted?: boolean }) {
  return (
    <NativeText
      {...props}
      style={[styles.base, styles[variant], muted && { color: colors.muted }, style]}
    />
  );
}
const styles = StyleSheet.create({
  base: { color: colors.ink, fontFamily: fonts.regular },
  body: { fontSize: 14, lineHeight: 23 },
  small: { fontSize: 12, lineHeight: 19 },
  caption: { fontSize: 10, lineHeight: 16 },
  label: { fontSize: 12, lineHeight: 19, fontFamily: fonts.semibold },
  title: { fontSize: 17, lineHeight: 25, fontFamily: fonts.semibold, letterSpacing: -0.4 },
  heading: { fontSize: 25, lineHeight: 34, fontFamily: fonts.bold, letterSpacing: -0.7 },
  hero: { fontSize: 27, lineHeight: 35, fontFamily: fonts.bold, letterSpacing: -0.7 },
});
