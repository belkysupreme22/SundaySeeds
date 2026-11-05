import { Text as NativeText, StyleSheet, type TextProps } from 'react-native';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import { isLoaded } from 'expo-font';
import { colors, fonts } from '../theme/tokens';
import {
  emphasizedRoles,
  ethiopicFonts,
  readingFonts,
  typeScale,
  type TypographyRole,
} from '../theme/typography';

const ethiopicScript = /[\u1200-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\u{1E7E0}-\u{1E7FF}]/u;
function containsEthiopic(node: ReactNode): boolean {
  if (typeof node === 'string') return ethiopicScript.test(node);
  if (Array.isArray(node)) return node.some(containsEthiopic);
  if (isValidElement<{ children?: ReactNode }>(node)) return containsEthiopic(node.props.children);
  return false;
}
export function Text({
  variant = 'body',
  muted,
  style,
  ...props
}: TextProps & { variant?: TypographyRole; muted?: boolean }) {
  const ethiopic = containsEthiopic(props.children);
  const ethiopicFamily =
    variant === 'reading'
      ? readingFonts.ethiopic
      : emphasizedRoles.includes(variant)
        ? ethiopicFonts.emphasis
        : ethiopicFonts.regular;
  const scriptStyle = ethiopic
    ? {
        fontFamily: isLoaded(ethiopicFamily) ? ethiopicFamily : undefined,
        letterSpacing: 0,
        lineHeight: Math.max(
          typeScale[variant].lineHeight,
          Math.ceil(typeScale[variant].fontSize * (variant === 'reading' ? 1.7 : 1.6)),
        ),
      }
    : undefined;
  const scriptRuns = (node: ReactNode, prefix = 'text'): ReactNode => {
    if (typeof node === 'string' && ethiopicScript.test(node)) {
      return node
        .split(/([\u1200-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\u{1E7E0}-\u{1E7FF}]+)/u)
        .map((run, index) =>
          ethiopicScript.test(run) ? (
            <NativeText key={`${prefix}-${index}`} style={scriptStyle}>
              {run}
            </NativeText>
          ) : (
            run
          ),
        );
    }
    if (Array.isArray(node))
      return node.map((child, index) => scriptRuns(child, `${prefix}-${index}`));
    if (isValidElement<{ children?: ReactNode }>(node) && node.type === NativeText) {
      return cloneElement(node, undefined, scriptRuns(node.props.children, prefix));
    }
    return node;
  };
  return (
    <NativeText
      {...props}
      style={[
        styles.base,
        typeScale[variant],
        variant === 'reading' && !isLoaded(readingFonts.latin)
          ? { fontFamily: isLoaded(fonts.regular) ? fonts.regular : undefined }
          : undefined,
        ethiopic && scriptStyle ? { lineHeight: scriptStyle.lineHeight } : undefined,
        muted && { color: colors.muted },
        style,
      ]}
    >
      {scriptRuns(props.children)}
    </NativeText>
  );
}
const styles = StyleSheet.create({
  base: { color: colors.ink, fontFamily: fonts.regular },
});
