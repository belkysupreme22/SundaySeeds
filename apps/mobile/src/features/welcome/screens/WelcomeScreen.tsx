import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  BackHandler,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { welcomeSlides } from '../data/welcomeSlides';
import { WelcomeArtwork } from '../components/WelcomeArtwork';

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
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || (index === 0 && !saving)) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!saving) setIndex((page) => Math.max(0, page - 1));
        return true;
      });
      return () => subscription.remove();
    }, [index, saving]),
  );
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
              <Image
                source={require('../../../../assets/brand/logo-reversed.png')}
                style={styles.logoImage}
                resizeMode="contain"
                accessible={false}
              />
            </View>
            <Text variant="label" style={styles.brandName}>
              SundaySeeds
            </Text>
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
          <Text variant="hero" accessibilityRole="header" style={styles.headline}>
            {slide.title}
          </Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <WelcomeArtwork slide={slide} height={Math.max(220, Math.min(380, height * 0.38))} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${slide.featureTitle}. ${isLast ? 'Get started' : 'Next introduction page'}`}
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={advance}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card tone="mint" shadow={false} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Icon name={slide.icon} size={24} color={brandColors.forest} />
            </View>
            <View style={styles.featureCopy}>
              <Text variant="label">{slide.featureTitle}</Text>
              <Text variant="small">{slide.featureDescription}</Text>
            </View>
            <View style={styles.featureArrow}>
              <Icon name="arrow-right" size={19} color={brandColors.forest} />
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
  brandName: { color: brandColors.forest },
  logo: {
    width: 34,
    height: 34,
    backgroundColor: brandColors.forest,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: 32, height: 32 },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: 8 },
  headline: { color: brandColors.forest },
  description: { maxWidth: 360, fontSize: 13, lineHeight: 21 },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: brandColors.surface,
  },
  featureIcon: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: brandColors.surfaceStrong,
  },
  featureCopy: { flex: 1, gap: 4 },
  featureArrow: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 16,
    backgroundColor: brandColors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  activeDot: { backgroundColor: brandColors.forest },
  actions: { flexDirection: 'row', gap: 12 },
  stackedActions: { flexDirection: 'column' },
  back: { flex: 1 },
  next: { flex: 2 },
  stackedButton: { flex: 0 },
  recovery: { gap: 12 },
  pressed: { opacity: 0.72 },
});
