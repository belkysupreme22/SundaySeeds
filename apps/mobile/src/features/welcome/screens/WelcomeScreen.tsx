import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { welcomeSlides } from '../data/welcomeSlides';

type Props = {
  saving: boolean;
  error: string | null;
  onFinish: () => void;
  onContinueForNow: () => void;
};

export function WelcomeScreen({ saving, error, onFinish, onContinueForNow }: Props) {
  const [index, setIndex] = useState(0);
  const { height } = useWindowDimensions();
  const slide = welcomeSlides[index];
  const isLast = index === welcomeSlides.length - 1;

  return (
    <Screen
      key={index}
      footer={
        <View style={styles.actions}>
          {index > 0 && (
            <Button
              label="Back"
              icon="arrow-left"
              variant="outline"
              disabled={saving}
              onPress={() => setIndex(index - 1)}
              style={styles.back}
            />
          )}
          <Button
            label={saving ? 'One moment…' : isLast ? 'Get started' : 'Next'}
            onPress={() => (isLast ? onFinish() : setIndex(index + 1))}
            disabled={saving}
            style={styles.next}
          />
        </View>
      }
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="sun" size={20} />
          </View>
          <Text variant="label">SundaySeeds</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          accessibilityState={{ disabled: saving }}
          onPress={onFinish}
          style={styles.skip}
        >
          <Text variant="small" muted>
            Skip
          </Text>
        </Pressable>
      </View>

      <View style={styles.intro} accessibilityLiveRegion="polite">
        <Text variant="caption" muted>
          GROW A LITTLE, EVERY DAY
        </Text>
        <Text variant="hero" accessibilityRole="header">
          {slide.title}
        </Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={[styles.artwork, { height: Math.max(180, Math.min(300, height * 0.32)) }]}>
        <Image source={slide.image} style={styles.image} resizeMode="cover" accessible={false} />
        <View style={[styles.sticker, { backgroundColor: colors[slide.accent] }]}>
          <Icon name={slide.icon} size={29} />
        </View>
        <View style={styles.spark}>
          <Icon name="sun" size={26} />
        </View>
      </View>

      <Card tone="lavender" shadow={false} style={styles.feature}>
        <View style={[styles.featureIcon, { backgroundColor: colors[slide.accent] }]}>
          <Icon name={slide.icon} size={24} />
        </View>
        <View style={styles.featureCopy}>
          <Text variant="label">{slide.featureTitle}</Text>
          <Text variant="small">{slide.featureDescription}</Text>
        </View>
      </Card>

      <View
        style={styles.pagination}
        accessible
        accessibilityLabel={`Introduction, page ${index + 1} of ${welcomeSlides.length}`}
      >
        {welcomeSlides.map((item, page) => (
          <View key={item.title} style={[styles.dot, page === index && styles.activeDot]} />
        ))}
      </View>
      {error && (
        <View style={styles.recovery}>
          <Text variant="small" accessibilityRole="alert">
            {error}
          </Text>
          <Button
            label="Continue for now"
            variant="outline"
            disabled={saving}
            onPress={onContinueForNow}
          />
        </View>
      )}
      <Text variant="caption" muted style={styles.note}>
        Explore sample lessons. No account needed. Progress stays on this device.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  logo: {
    width: 34,
    height: 34,
    backgroundColor: colors.yellow,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: 10 },
  description: { maxWidth: 330 },
  artwork: {
    position: 'relative',
    backgroundColor: colors.lavender,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  image: { width: '100%', height: '100%' },
  sticker: {
    position: 'absolute',
    left: 14,
    bottom: 18,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    boxShadow: '2px 3px 0px #26212E',
    transform: [{ rotate: '-7deg' }],
  },
  spark: { position: 'absolute', top: 14, right: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  featureIcon: { padding: 10, borderWidth: 1, borderColor: colors.ink, borderRadius: 8 },
  featureCopy: { flex: 1, gap: 4 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  activeDot: { backgroundColor: colors.primary, width: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  back: { flex: 1 },
  next: { flex: 2 },
  recovery: { gap: 12 },
  note: { textAlign: 'center' },
});
