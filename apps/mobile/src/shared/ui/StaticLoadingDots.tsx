import { StyleSheet, View } from 'react-native';
import { brandColors, colors } from '../theme/tokens';

// Left to right, matching the fills in the bundled Loading Dots animation.
const dotColors = [brandColors.forest, colors.success, brandColors.muted, brandColors.controlBorder];

export function StaticLoadingDots({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.row, small && styles.smallRow]}>
      {dotColors.map((color) => (
        <View
          key={color}
          style={[styles.dot, small && styles.smallDot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  smallRow: { gap: 4 },
  dot: { width: 24, height: 24, borderRadius: 12 },
  smallDot: { width: 5, height: 5, borderRadius: 3 },
});
