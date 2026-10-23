import { BlurView } from 'expo-blur';
import { useEffect, useRef, type RefObject } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LoadingState } from './LoadingState';
import { useLoaderMotion } from './useLoaderMotion';

export function PageLoadingOverlay({
  label,
  blurTarget,
}: {
  label: string;
  blurTarget: RefObject<View | null>;
}) {
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
      <BlurView
        pointerEvents="none"
        intensity={35}
        tint="light"
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.panel}>
        <LoadingState label={label} />
      </View>
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
