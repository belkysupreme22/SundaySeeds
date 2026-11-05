import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, AppState, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { seedPaths } from '../../../shared/branding/seedMark';
import { motion } from '../../../shared/theme/motion';
import { accentColors, brandColors } from '../../../shared/theme/tokens';
import { Text } from '../../../shared/ui/Text';

const grains = [
  {
    id: 'left-seed',
    kind: 'seed',
    x: -104,
    rise: -22,
    land: 17,
    tilt: -32,
    color: accentColors.wheat,
  },
  {
    id: 'left-leaf',
    kind: 'leaf',
    x: -83,
    rise: -44,
    land: -13,
    tilt: -52,
    color: brandColors.forest,
  },
  {
    id: 'left-petal',
    kind: 'leaf',
    x: -74,
    rise: 4,
    land: 38,
    tilt: -92,
    color: accentColors.rose,
  },
  {
    id: 'left-high-seed',
    kind: 'seed',
    x: -54,
    rise: -46,
    land: -27,
    tilt: 26,
    color: accentColors.peach,
  },
  {
    id: 'right-high-leaf',
    kind: 'leaf',
    x: 51,
    rise: -47,
    land: -32,
    tilt: 40,
    color: accentColors.wheat,
  },
  {
    id: 'right-seed',
    kind: 'seed',
    x: 72,
    rise: -22,
    land: 20,
    tilt: -28,
    color: accentColors.rose,
  },
  {
    id: 'right-leaf',
    kind: 'leaf',
    x: 86,
    rise: -37,
    land: -9,
    tilt: 82,
    color: brandColors.forest,
  },
  {
    id: 'right-petal',
    kind: 'leaf',
    x: 103,
    rise: -5,
    land: 27,
    tilt: 112,
    color: accentColors.peach,
  },
] as const;

export function QuizCompletion({ celebrate }: { celebrate: boolean }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const timeline = useRef(new Animated.Value(1)).current;
  const consumed = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!celebrate || consumed.current) return;
      let live = true;
      let animation: Animated.CompositeAnimation | undefined;
      const settle = () => {
        consumed.current = true;
        animation?.stop();
        timeline.setValue(1);
      };
      const decide = (reduced: boolean) => {
        if (!live || consumed.current) return;
        if (reduced || AppState.currentState !== 'active') {
          settle();
          return;
        }
        consumed.current = true;
        timeline.setValue(0);
        animation = Animated.timing(timeline, {
          toValue: 1,
          duration: motion.duration.celebration,
          isInteraction: false,
          useNativeDriver: Platform.OS !== 'web',
        });
        animation.start();
      };

      // A late preference response keeps the finished result still.
      const deadline = setTimeout(() => decide(true), motion.duration.page);
      const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
        if (reduced) settle();
        else decide(false);
      });
      const visibility = AppState.addEventListener('change', (state) => {
        if (state !== 'active') settle();
      });
      void AccessibilityInfo.isReduceMotionEnabled().then(decide, () => decide(true));

      return () => {
        live = false;
        if (!navigation.isFocused()) consumed.current = true;
        clearTimeout(deadline);
        preference?.remove();
        visibility?.remove();
        animation?.stop();
        timeline.setValue(1);
      };
    }, [celebrate, navigation, timeline]),
  );

  return (
    <View style={styles.completion}>
      <View
        style={styles.artwork}
        pointerEvents="none"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {celebrate &&
          grains.map((grain) => (
            <Animated.View
              key={grain.id}
              style={[
                styles.grain,
                {
                  opacity: timeline.interpolate({
                    inputRange: [0, 0.14, 0.68, 1],
                    outputRange: [0, 1, 0.85, 0],
                  }),
                  transform: [
                    {
                      translateX: timeline.interpolate({
                        inputRange: [0, 0.55, 1],
                        outputRange: [0, grain.x * 0.84, grain.x],
                      }),
                    },
                    {
                      translateY: timeline.interpolate({
                        inputRange: [0, 0.48, 1],
                        outputRange: [8, grain.rise, grain.land],
                      }),
                    },
                    {
                      rotate: timeline.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${grain.tilt}deg`],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 18 18">
                {grain.kind === 'leaf' ? (
                  <Path
                    d="M3 14C3 7 8 3 15 3C15 10 10 14 3 14Z"
                    fill={grain.color}
                    stroke={brandColors.controlBorder}
                  />
                ) : (
                  <G transform="rotate(28 9 9)">
                    <Path
                      d="M9 2C12 4 14 7 14 10C14 13 12 15 9 15C6 15 4 13 4 10C4 7 6 4 9 2Z"
                      fill={grain.color}
                      stroke={brandColors.controlBorder}
                    />
                    <Path d="M9 5Q7 9 9 12" fill="none" stroke={brandColors.controlBorder} />
                  </G>
                )}
              </Svg>
            </Animated.View>
          ))}
        <Svg width="100%" height="100%" viewBox="0 0 252 122">
          <Path
            d="M21 81Q49 74 69 91M183 91Q203 74 231 81M38 49L47 55M204 55L213 49"
            fill="none"
            stroke={brandColors.controlBorder}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <Path
            d="M49 77Q38 66 28 71Q35 80 49 77ZM203 77Q214 66 224 71Q217 80 203 77Z"
            fill={accentColors.wheat}
            stroke={brandColors.controlBorder}
          />
          <Circle cx={58} cy={41} r={2} fill={brandColors.controlBorder} />
          <Circle cx={194} cy={41} r={2} fill={brandColors.controlBorder} />
          <Path
            d="M126 11C149 11 168 28 168 52V91Q168 105 154 105H98Q84 105 84 91V52C84 28 103 11 126 11Z"
            fill={brandColors.forest}
          />
          <Path
            d="M126 17C146 17 162 32 162 52V90Q162 99 153 99H99Q90 99 90 90V52C90 32 106 17 126 17Z"
            fill="none"
            stroke={brandColors.surfaceStrong}
            strokeOpacity={0.55}
          />
          <G transform="translate(100 27) scale(0.08125) translate(-192 -192)">
            {seedPaths.map(({ id, d }) => (
              <Path key={id} d={d} fill={brandColors.onForest} fillRule="evenodd" />
            ))}
          </G>
          <Path
            d="M107 88H119M133 88H145"
            fill="none"
            stroke={brandColors.surfaceStrong}
            strokeOpacity={0.7}
            strokeLinecap="round"
          />
          <Circle cx={126} cy={88} r={2} fill={accentColors.wheat} />
        </Svg>
      </View>
      <Text variant="heading" accessibilityRole="header" style={styles.center}>
        {t('quiz.celebrationTitle')}
      </Text>
      <Text muted style={styles.center}>
        {t('quiz.celebrationSubtitle')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  completion: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  artwork: { width: 252, maxWidth: '100%', height: 122, overflow: 'hidden' },
  grain: { position: 'absolute', left: '50%', top: '50%', marginLeft: -9, marginTop: -9 },
  center: { textAlign: 'center' },
});
