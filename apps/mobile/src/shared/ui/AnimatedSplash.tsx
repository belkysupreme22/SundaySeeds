import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { UnfoldingSeedMark } from './UnfoldingSeedMark';

type Props = { ready: boolean; onReady: () => void; onComplete: () => void };

export function AnimatedSplash({ ready, onReady, onComplete }: Props) {
  const { width, height, fontScale } = useWindowDimensions();
  const [laidOut, setLaidOut] = useState(false);
  const [wordmarkHeight, setWordmarkHeight] = useState(0);
  const [motionReady, setMotionReady] = useState(false);
  const [artworkReady, setArtworkReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const reduceMotion = useRef(true);
  const assetCanAnimate = useRef(false);
  const backgrounded = useRef(AppState.currentState === 'background');
  const stopCurrent = useRef<(() => void) | null>(null);
  const finishMotion = useRef<(() => void) | null>(null);
  const completed = useRef(false);
  const completionCallback = useRef(onComplete);
  completionCallback.current = onComplete;
  const markSize = Math.max(
    80,
    Math.min(160, width - 64, (height * 0.3) / Math.max(1, fontScale * 0.65)),
  );

  useEffect(() => {
    let active = true;
    let decided = false;
    const decide = (enabled: boolean) => {
      if (!active || decided) return;
      decided = true;
      reduceMotion.current = enabled;
      setMotionReady(true);
    };
    // A late or failed preference query cannot opt someone into motion.
    const deadline = setTimeout(() => decide(true), 200);
    const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (enabled) {
        reduceMotion.current = true;
        stopCurrent.current?.();
      }
      decide(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(decide, () => decide(true));
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgrounded.current = true;
        stopCurrent.current?.();
      }
    });
    return () => {
      active = false;
      clearTimeout(deadline);
      preference.remove();
      appState.remove();
    };
  }, []);

  const handleArtworkReady = useCallback((canAnimate: boolean) => {
    assetCanAnimate.current = canAnimate;
    setArtworkReady(true);
  }, []);
  const handleFinished = useCallback(() => finishMotion.current?.(), []);

  useEffect(() => {
    if (laidOut && wordmarkHeight > 0 && motionReady && (reduceMotion.current || artworkReady))
      onReady();
  }, [artworkReady, laidOut, motionReady, onReady, wordmarkHeight]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    let exiting = false;
    let exitAnimation: Animated.CompositeAnimation | undefined;
    let wordmarkAnimation: Animated.CompositeAnimation | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const complete = () => {
      if (!active || completed.current) return;
      completed.current = true;
      completionCallback.current();
    };
    const stop = () => {
      wordmarkAnimation?.stop();
      exitAnimation?.stop();
      setPlaying(false);
      wordmark.setValue(1);
      opacity.setValue(1);
      complete();
    };
    const finish = () => {
      if (!active || exiting || completed.current) return;
      exiting = true;
      setPlaying(false);
      wordmarkAnimation?.stop();
      wordmark.setValue(1);
      exitAnimation = Animated.sequence([
        Animated.delay(120),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      exitAnimation.start(({ finished }) => {
        if (finished) complete();
      });
    };
    stopCurrent.current = stop;
    finishMotion.current = finish;
    if (backgrounded.current) {
      complete();
    } else if (reduceMotion.current || !assetCanAnimate.current) {
      timers.push(setTimeout(complete, 900));
    } else {
      wordmark.setValue(0);
      setPlaying(true);
      wordmarkAnimation = Animated.sequence([
        Animated.delay(1300),
        Animated.timing(wordmark, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      wordmarkAnimation.start();
      // Native/web completion events can be missed; never trap startup behind art.
      timers.push(setTimeout(finish, 2500));
    }
    timers.push(setTimeout(stop, 3400));
    return () => {
      active = false;
      stopCurrent.current = null;
      finishMotion.current = null;
      wordmarkAnimation?.stop();
      exitAnimation?.stop();
      timers.forEach(clearTimeout);
    };
  }, [opacity, ready, wordmark]);

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
        <View style={styles.brand}>
          {/* Balance the text below so the mark stays at the native canvas centre. */}
          <View style={{ height: wordmarkHeight }} accessible={false} />
          <View
            style={{ width: markSize, height: markSize }}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <UnfoldingSeedMark
              size={markSize}
              animate={motionReady && !reduceMotion.current}
              playing={playing}
              onReady={handleArtworkReady}
              onFinished={handleFinished}
            />
          </View>
          <Animated.View
            onLayout={(event) => setWordmarkHeight(event.nativeEvent.layout.height)}
            style={[
              styles.wordmarkBlock,
              {
                opacity:
                  motionReady && !reduceMotion.current && assetCanAnimate.current ? wordmark : 1,
                transform: [
                  {
                    translateY:
                      motionReady && !reduceMotion.current && assetCanAnimate.current
                        ? wordmark.interpolate({ inputRange: [0, 1], outputRange: [4, 0] })
                        : 0,
                  },
                ],
              },
            ]}
          >
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
          </Animated.View>
        </View>
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
