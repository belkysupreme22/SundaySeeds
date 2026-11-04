import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme/tokens';

type Props = {
  ready: boolean;
  onReady: () => void;
  onComplete: () => void;
};

// Temporary brand transition while the continuous 3D film is in production.
// Geometry and crop match the static icon; no layered-image growth sequence.
function BrandMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="112 80 800 800">
      <Path
        d="M200 460C310 435 414 453 512 520C610 453 714 435 824 460V754C711 733 609 754 512 824C415 754 313 733 200 754ZM256 505C335 495 411 515 484 561V741C410 697 333 682 256 694ZM540 561C613 515 689 495 768 505V694C691 682 614 697 540 741Z"
        fill="#173E32"
        fillRule="evenodd"
      />
      <Path
        d="M489 682C501 588 497 516 481 461C466 412 481 377 512 350C543 377 558 412 543 461C527 516 523 588 535 682Z"
        fill="#173E32"
        fillRule="evenodd"
      />
      <Path
        d="M512 124C563 96 625 126 636 174C693 166 739 211 738 264C778 297 770 358 724 386C711 430 657 451 611 435C580 459 542 457 512 440C482 457 444 459 413 435C367 451 313 430 300 386C254 358 246 297 286 264C285 211 331 166 388 174C399 126 461 96 512 124ZM421 296A24 24 0 1 0 373 296A24 24 0 1 0 421 296ZM604 244A24 24 0 1 0 556 244A24 24 0 1 0 604 244ZM634 357A24 24 0 1 0 586 357A24 24 0 1 0 634 357Z"
        fill="#173E32"
        fillRule="evenodd"
      />
    </Svg>
  );
}

export function AnimatedSplash({ ready, onReady, onComplete }: Props) {
  const { width, height, fontScale } = useWindowDimensions();
  const [laidOut, setLaidOut] = useState(false);
  const entrance = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  // A slow or unavailable preference query must never opt the user into motion.
  const reduceMotion = useRef(true);
  const motionChanged = useRef(false);
  const stopForReducedMotion = useRef<(() => void) | null>(null);
  const completed = useRef(false);
  const completionCallback = useRef(onComplete);
  completionCallback.current = onComplete;

  const markSize = Math.max(
    80,
    Math.min(144, width - 64, (height * 0.3) / Math.max(1, fontScale * 0.65)),
  );

  useEffect(() => {
    let active = true;
    motionChanged.current = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        motionChanged.current = true;
        reduceMotion.current = enabled;
        if (enabled) stopForReducedMotion.current?.();
      },
    );
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (active && !motionChanged.current) {
          reduceMotion.current = enabled;
          if (enabled) stopForReducedMotion.current?.();
        }
      },
      () => {
        // Keep the static presentation when the preference is unavailable.
      },
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (laidOut) onReady();
  }, [laidOut, onReady]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    let staticTimeout: ReturnType<typeof setTimeout> | undefined;
    const complete = () => {
      if (!active || completed.current) return;
      completed.current = true;
      completionCallback.current();
    };

    entrance.setValue(1);
    opacity.setValue(1);
    if (reduceMotion.current) {
      staticTimeout = setTimeout(complete, 1380);
    } else {
      entrance.setValue(0);
      animation = Animated.sequence([
        Animated.timing(entrance, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      animation.start(({ finished }) => {
        if (finished) complete();
      });
    }

    if (animation) {
      const runningAnimation = animation;
      stopForReducedMotion.current = () => {
        runningAnimation.stop();
        entrance.setValue(1);
        opacity.setValue(1);
        // A live setting change removes the splash without another transition.
        complete();
      };
    }
    const failsafe = setTimeout(complete, 2200);
    return () => {
      active = false;
      stopForReducedMotion.current = null;
      animation?.stop();
      clearTimeout(staticTimeout);
      clearTimeout(failsafe);
    };
  }, [entrance, opacity, ready]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      onLayout={() => setLaidOut(true)}
      pointerEvents="auto"
      accessibilityViewIsModal
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.brand,
            {
              opacity: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1],
              }),
              transform: [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
                {
                  scale: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={{ width: markSize, height: markSize }}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <BrandMark size={markSize} />
          </View>
          <View style={styles.wordmarkBlock}>
            <Text
              style={styles.wordmark}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              maxFontSizeMultiplier={1.4}
            >
              SundaySeeds
            </Text>
            <Text style={styles.tagline}>Grow in faith. One little step.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.paper,
    zIndex: 999,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  brand: { width: '100%', maxWidth: 340, alignItems: 'center', gap: 24 },
  wordmarkBlock: { alignItems: 'center', width: '100%', gap: 9 },
  wordmark: {
    width: '100%',
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 43,
    letterSpacing: -1.1,
    textAlign: 'center',
    color: colors.ink,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.muted,
  },
});
