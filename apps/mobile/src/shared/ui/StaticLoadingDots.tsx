import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

export function StaticLoadingDots({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.row, small && styles.smallRow]}>
      {(['primary', 'mint', 'yellow', 'peach'] as const).map((tone) => (
        <View
          key={tone}
          style={[styles.dot, small && styles.smallDot, { backgroundColor: colors[tone] }]}
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
    gap: 11,
  },
  smallRow: { gap: 4 },
  dot: { width: 13, height: 13, borderRadius: 7, borderWidth: 0.7, borderColor: colors.ink },
  smallDot: { width: 5, height: 5, borderRadius: 3, borderWidth: 0.5 },
});
