import { StyleSheet, View } from 'react-native';
import { brandColors } from '../../../shared/theme/tokens';

export function QuizScoreRibbon({ correct, total }: { correct: number; total: number }) {
  const portion = total > 0 ? Math.max(0, Math.min(1, correct / total)) : 0;
  return (
    <View
      style={styles.track}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <View style={[styles.fill, { width: `${portion * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    maxWidth: 148,
    height: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brandColors.controlBorder,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: brandColors.forest, borderRadius: 4 },
});
