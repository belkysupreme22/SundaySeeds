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
  onSkip?: () => void;
  initialIndex?: number;
};

export function WelcomeScreen({
  saving,
  error,
  onFinish,
  onContinueForNow,
  onSkip = onFinish,
  initialIndex = 0,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const { height, width, fontScale } = useWindowDimensions();
  const slide = welcomeSlides[index];
  const isLast = index === welcomeSlides.length - 1;
  const stackActions = width < 350 || fontScale >= 1.5;
  function advance() {
    if (isLast) onFinish();
    else setIndex((page) => Math.min(page + 1, welcomeSlides.length - 1));
  }

  return (
    <Screen
      loadingMessage={saving ? 'Opening your learning space…' : undefined}
      key={index}
      footer={
        <View style={[styles.actions, stackActions && styles.stackedActions]}>
          {index > 0 && (
            <Button
              label="Back"
              icon="arrow-left"
              variant="outline"
              disabled={saving}
              onPress={() => setIndex((page) => Math.max(0, page - 1))}
              style={[styles.back, stackActions && styles.stackedButton]}
            />
          )}
          <Button
            label={saving ? 'One moment…' : isLast ? 'Get started' : 'Next'}
            onPress={advance}
            disabled={saving}
            style={[styles.next, stackActions && styles.stackedButton]}
          />
        </View>
      }
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Icon name="sun" size={20} />
            </View>
            <Text variant="label">SundaySeeds</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            disabled={saving}
            accessibilityState={{ disabled: saving }}
            onPress={onSkip}
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
          >
            <Text variant="small" muted>
              Skip
            </Text>
          </Pressable>
        </View>

        <View style={styles.intro} accessibilityLiveRegion="polite">
          <Text variant="hero" accessibilityRole="header">
            {slide.title}
          </Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <View style={[styles.artwork, { height: Math.max(220, Math.min(380, height * 0.38)) }]}>
          <Image source={slide.image} style={styles.image} resizeMode="cover" accessible={false} />
          <View style={[styles.sticker, { backgroundColor: colors[slide.accent] }]}>
            <Icon name={slide.icon} size={29} />
          </View>
          <View
            style={[styles.companionSticker, { backgroundColor: colors[slide.companionAccent] }]}
          >
            <Icon name={slide.companionIcon} size={24} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${slide.featureTitle}. ${isLast ? 'Get started' : 'Next introduction page'}`}
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={advance}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card tone="lavender" shadow={false} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors[slide.accent] }]}>
              <Icon name={slide.icon} size={24} />
            </View>
            <View style={styles.featureCopy}>
              <Text variant="label">{slide.featureTitle}</Text>
              <Text variant="small">{slide.featureDescription}</Text>
            </View>
            <View style={styles.featureArrow}>
              <Icon name="arrow-right" size={19} />
            </View>
          </Card>
        </Pressable>

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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16 },
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
  intro: { gap: 8 },
  description: { maxWidth: 360, fontSize: 13, lineHeight: 21 },
  artwork: {
    position: 'relative',
    backgroundColor: colors.lavender,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  image: { width: '100%', height: '100%' },
  sticker: {
    position: 'absolute',
    left: 14,
    top: 24,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    boxShadow: '2px 3px 0px #26212E',
    transform: [{ rotate: '-7deg' }],
  },
  companionSticker: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    padding: 10,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 9,
    boxShadow: '2px 3px 0px #26212E',
    transform: [{ rotate: '5deg' }],
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  featureIcon: { padding: 8, borderWidth: 1, borderColor: colors.ink, borderRadius: 8 },
  featureCopy: { flex: 1, gap: 4 },
  featureArrow: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  activeDot: { backgroundColor: colors.primary },
  actions: { flexDirection: 'row', gap: 12 },
  stackedActions: { flexDirection: 'column' },
  back: { flex: 1 },
  next: { flex: 2 },
  stackedButton: { flex: 0 },
  recovery: { gap: 12 },
  pressed: { opacity: 0.72 },
});
