import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, type Pastel } from '../theme/tokens';

export function Card({
  tone,
  shadow = true,
  stroke = 'strong',
  style,
  ...props
}: ViewProps & { tone?: Pastel; shadow?: boolean; stroke?: 'strong' | 'soft' | 'subtle' }) {
  return (
    <View
      {...props}
      style={[
        styles.card,
        stroke !== 'strong' && styles[stroke],
        tone && { backgroundColor: colors[tone] },
        shadow && styles.shadow,
        style,
      ]}
    />
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 16,
  },
  shadow: { boxShadow: '2px 3px 0px #26212E' },
  soft: { borderWidth: 1, borderColor: colors.outline },
  subtle: { borderWidth: 1, borderColor: colors.line },
});
