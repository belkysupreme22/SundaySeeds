import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

export function ProgressBar({ value, color = colors.primary }: { value: number; color?: string }) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    height: 7,
    borderWidth: 0.7,
    borderColor: colors.muted,
    borderRadius: 5,
    backgroundColor: colors.soft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});
