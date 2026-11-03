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

// Same silhouette and crop as assets/brand/logo.svg and its native splash export.
function BrandMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="160 160 704 704">
      <Path
        d="M484 459V414C397 371 406 263 512 184C618 263 627 371 540 414V459C621 410 722 403 824 430V732C706 711 606 738 512 806C418 738 318 711 200 732V430C302 403 403 410 484 459ZM512 267C472 309 462 350 512 379C562 350 552 309 512 267ZM484 521C413 471 331 455 256 475V671C340 667 419 690 484 731V521ZM540 521V731C605 690 684 667 768 671V475C693 455 611 471 540 521Z"
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
