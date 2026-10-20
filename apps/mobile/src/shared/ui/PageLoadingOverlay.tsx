import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LoadingState } from './LoadingState';
import { useLoaderMotion } from './useLoaderMotion';

export function PageLoadingOverlay({ label }: { label: string }) {
  const motion = useLoaderMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!motion) {
      opacity.setValue(1);
      return;
    }
    opacity.setValue(0);
    const entry = Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    entry.start();
    return () => entry.stop();
  }, [motion, opacity]);
  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <View style={styles.panel}>
        <LoadingState label={label} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 304,
    padding: 20,
  },
});
