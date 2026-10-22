import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';
import { featuredLessonId } from '../data/homeLessons';
export function WeeklyHero() {
  const { width, fontScale } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const availableWidth = cardWidth ?? width - 40;
  const compact = availableWidth < 320;
  const stacked = availableWidth < 250 || fontScale >= 1.5;
  const portraitWidth = Math.min(280, availableWidth * 0.8);
  return (
    <Card
      tone="lavender"
      onLayout={({ nativeEvent }) => setCardWidth(nativeEvent.layout.width)}
      style={[styles.hero, stacked && styles.stacked]}
    >
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="caption" style={styles.eyebrow}>
          FEATURED LESSON
        </Text>
        <Text variant="hero" style={[styles.headline, compact && styles.compactHeadline]}>
          Small acts.{'\n'}Great love.
        </Text>
        <Text variant="small" style={[styles.description, stacked && styles.fullDescription]}>
          Put compassion into practice with the Good Samaritan.
        </Text>
        <Button
          label="Explore lesson"
          variant="dark"
          onPress={() => router.push(`/lessons/${featuredLessonId}`)}
          style={styles.cta}
        />
      </View>
      <View
        style={[styles.art, stacked && styles.stackedArt]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Image
          source={require('../../../../assets/legacy/home_banner_user.png')}
          style={[
            styles.image,
            {
              width: portraitWidth,
              height: portraitWidth * (235 / 280),
              right: -portraitWidth * (26 / 280),
            },
            stacked && styles.stackedImage,
          ]}
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
  hero: { minHeight: 210, padding: 0, overflow: 'hidden', flexDirection: 'row' },
  stacked: { flexDirection: 'column' },
  copy: { flexGrow: 1, flexShrink: 1, flexBasis: 0, gap: 8, paddingLeft: 16, paddingVertical: 14 },
  stackedCopy: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', paddingRight: 16 },
  headline: { fontSize: 24, lineHeight: 31, letterSpacing: -0.6 },
  compactHeadline: { fontSize: 22, lineHeight: 28 },
  eyebrow: { fontSize: 11, lineHeight: 18, letterSpacing: 0.5 },
  description: { maxWidth: 165, fontSize: 12, lineHeight: 19 },
  fullDescription: { maxWidth: '100%' },
  cta: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  art: {
    position: 'relative',
    width: '38%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderTopLeftRadius: 70,
  },
  stackedArt: { width: '100%', aspectRatio: 1.5, borderTopLeftRadius: 0 },
  image: { position: 'absolute', bottom: 0 },
  stackedImage: { right: 0, width: '100%', height: '100%' },
  spark: { position: 'absolute', top: 12, right: 8 },
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
