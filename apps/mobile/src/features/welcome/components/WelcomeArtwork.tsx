import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { welcomeAccentColors, type WelcomeSlide } from '../data/welcomeSlides';

export function WelcomeArtwork({ slide, height }: { slide: WelcomeSlide; height: number }) {
  const entrance = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let live = true;
    let preferenceChanged = false;
    const motionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        preferenceChanged = true;
        setReduceMotion(value);
      },
    );
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (live && !preferenceChanged) setReduceMotion(value);
      },
      () => {
        // An unavailable preference keeps the artwork static.
      },
    );
    const appSubscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => {
      live = false;
      motionSubscription.remove();
      appSubscription.remove();
    };
  }, []);

  const motionAllowed = reduceMotion === false && appActive && imageState === 'ready';
  useFocusEffect(
    useCallback(() => {
      if (!motionAllowed) return;
      entrance.setValue(0);
      drift.setValue(0);
      const reveal = Animated.timing(entrance, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        isInteraction: false,
      });
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(drift, {
            toValue: 1,
            duration: 4200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(drift, {
            toValue: 0,
            duration: 4200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            isInteraction: false,
          }),
        ]),
      );
      reveal.start();
      breathe.start();
      return () => {
        reveal.stop();
        breathe.stop();
        entrance.setValue(1);
        drift.setValue(0);
      };
    }, [drift, entrance, motionAllowed]),
  );

  return (
    <View
      style={[styles.artwork, { height }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {imageState !== 'failed' ? (
        <Animated.Image
          source={slide.image}
          style={[
            styles.image,
            motionAllowed && {
              opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }),
              transform: [
                { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1.065] }) },
                { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
              ],
            },
          ]}
          resizeMode="cover"
          accessible={false}
          onLoad={() => setImageState('ready')}
          onError={() => setImageState('failed')}
        />
      ) : (
        <View style={styles.fallback}>
          <Icon name={slide.icon} size={64} color={brandColors.forest} />
        </View>
      )}
      <Animated.View
        style={[
          styles.sticker,
          {
            backgroundColor: welcomeAccentColors[slide.accent],
            transform: [
              { rotate: '-7deg' },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
            ],
          },
        ]}
      >
        <Icon name={slide.icon} size={29} color={brandColors.forest} />
      </Animated.View>
      <Animated.View
        style={[
          styles.companionSticker,
          {
            backgroundColor: welcomeAccentColors[slide.companionAccent],
            transform: [
              { rotate: '5deg' },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) },
            ],
          },
        ]}
      >
        <Icon name={slide.companionIcon} size={24} color={brandColors.forest} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    position: 'relative',
    backgroundColor: brandColors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sticker: {
    position: 'absolute',
    left: 14,
    top: 24,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    boxShadow: '2px 3px 0px #26212E',
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
  },
});
