import { StyleSheet, View } from 'react-native';

export function StaticLoadingDots({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.row, small && styles.smallRow]}>
      {['#515FF0', '#5B57E8', '#654FE2', '#6E48DC'].map((color) => (
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
