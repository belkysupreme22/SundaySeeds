import { Image, StyleSheet, View } from 'react-native';
import { colors, type Pastel } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
const portraits = {
  'good-samaritan': require('../../../../assets/orthodox/lesson_good_samaritan.jpg'),
  'david-and-goliath': require('../../../../assets/orthodox/lesson_david_goliath.jpg'),
  'a-life-of-prayer': require('../../../../assets/orthodox/lesson_life_of_prayer.jpg'),
  'faith-like-a-seed': require('../../../../assets/orthodox/lesson_faith_seed.jpg'),
};
export function LessonArtwork({
  id,
  tone,
  large = false,
}: {
  id: string;
  tone: Pastel;
  large?: boolean;
}) {
  const source = portraits[id as keyof typeof portraits] ?? portraits['good-samaritan'];
  return (
    <View style={[styles.frame, { backgroundColor: colors[tone] }, large && styles.large]}>
      <Image
        source={source}
        style={styles.portrait}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={[styles.stamp, { backgroundColor: colors[tone] }]}>
        <Icon name="book-open" size={large ? 24 : 17} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    width: 88,
    height: 104,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 0.8,
    borderColor: colors.ink,
  },
  large: { width: 118, height: 160 },
  portrait: { width: '100%', height: '100%' },
  stamp: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    padding: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.ink,
  },
});
