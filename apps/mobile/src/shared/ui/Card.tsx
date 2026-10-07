import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, type Pastel } from '../theme/tokens';

export function Card({
  tone,
  shadow = true,
  style,
  ...props
}: ViewProps & { tone?: Pastel; shadow?: boolean }) {
  return (
    <View
      {...props}
      style={[
        styles.card,
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
});
