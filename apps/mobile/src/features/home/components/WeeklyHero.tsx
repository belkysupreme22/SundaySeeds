import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';
export function WeeklyHero() {
  return (
    <Card tone="lavender" style={styles.hero}>
      <View style={styles.copy}>
        <Text variant="caption" style={styles.eyebrow}>
          THIS WEEK’S LESSON
        </Text>
        <Text variant="hero">Small acts.{'\n'}Great love.</Text>
        <Text variant="small" style={styles.description}>
          Discover what it means to be a good neighbour.
        </Text>
        <Button
          label="Start learning"
          variant="dark"
          onPress={() => router.push('/lessons/good-samaritan')}
          style={styles.cta}
        />
      </View>
      <View style={styles.art}>
        <Image
          source={require('../../../../assets/legacy/home_banner_user.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.spark}>
          <Icon name="sun" size={30} />
        </View>
        <View style={styles.book}>
          <Icon name="book-open" size={24} />
        </View>
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  hero: { minHeight: 235, padding: 18, overflow: 'hidden', position: 'relative' },
  copy: { zIndex: 2, width: '64%', gap: 9 },
  eyebrow: { fontSize: 8, letterSpacing: 0.5 },
  description: { maxWidth: 165, fontSize: 11, lineHeight: 18 },
  cta: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  art: {
    position: 'absolute',
    right: 0,
    top: 34,
    bottom: 0,
    width: '42%',
    overflow: 'hidden',
    borderTopLeftRadius: 85,
  },
  image: { position: 'absolute', right: -26, bottom: 0, width: 280, height: 235 },
  spark: { position: 'absolute', top: 4, right: 8 },
  book: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    backgroundColor: colors.yellow,
    borderWidth: 1.2,
    borderColor: colors.ink,
    padding: 9,
    borderRadius: 9,
    transform: [{ rotate: '8deg' }],
  },
});
