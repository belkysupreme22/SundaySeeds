import { useCallback, useState, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import { Animated, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useLoaderMotion } from '../../../shared/ui/useLoaderMotion';

export function CourseLoadingSkeleton({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const animate = useLoaderMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      if (!animate) return;

      const timing = {
        duration: 760,
        isInteraction: false,
        useNativeDriver: Platform.OS !== 'web',
      };
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { ...timing, toValue: 0.58 }),
          Animated.timing(opacity, { ...timing, toValue: 1 }),
        ]),
      );
      pulse.start();
      return () => {
        pulse.stop();
        opacity.setValue(1);
      };
    }, [animate, opacity]),
  );

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
    >
      <Animated.View aria-hidden style={[style, { opacity }]}>
        {children}
      </Animated.View>
    </View>
  );
}
