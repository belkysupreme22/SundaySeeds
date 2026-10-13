import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';

type ProgressHeroProps = { completed: number; total: number; started: boolean; stacked: boolean };

export function ProgressHero({ completed, total, started, stacked }: ProgressHeroProps) {
  const allComplete = total > 0 && completed === total;
  return (
    <Card tone="lavender" style={[styles.hero, stacked && styles.stacked]}>
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="caption">YOUR LEARNING JOURNEY</Text>
        <Text variant="heading">
          {allComplete
            ? 'Look how far you’ve grown.'
            : started
              ? 'Keep growing.'
              : 'Start with a little seed.'}
        </Text>
        <Text variant="small">
          {allComplete
            ? 'You’ve finished every sample quiz. Revisit a lesson and carry it into your week.'
            : started
              ? 'Pick up a lesson, reflect on its message and take one small step forward.'
              : 'A story, a reflection, a small act of faith. Your first lesson is waiting.'}
        </Text>
        <View style={styles.label}>
          <Text variant="caption">{total} sample lessons · On this device</Text>
        </View>
      </View>
      <View style={[styles.art, stacked && styles.stackedArt]} accessible={false}>
        <Image
          source={require('../../../../assets/legacy/home_banner_user.png')}
          style={styles.portrait}
          resizeMode="cover"
          accessible={false}
          accessibilityIgnoresInvertColors
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 8 },
  label: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 5,
  },
  art: {
    width: 100,
    height: 150,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 7,
    backgroundColor: colors.lavender,
  },
  portrait: { position: 'absolute', right: -8, width: '185%', height: '100%' },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  stackedCopy: { flex: 0 },
  stackedArt: { width: 118, height: 145, alignSelf: 'center' },
});
