import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

export function ProgressBar({
  value,
  color = colors.primary,
  label,
  valueText,
}: {
  value: number;
  color?: string;
  label?: string;
  valueText?: string;
}) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: valueText }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={valueText}
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
