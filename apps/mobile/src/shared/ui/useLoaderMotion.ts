import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

export function useLoaderMotion(): boolean {
  // Start still until the system preference is known, including on web hydration.
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(
    AppState.currentState !== 'background' && AppState.currentState !== 'inactive',
  );
  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      preferenceChanged = true;
      setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (mounted && !preferenceChanged) setReduced(value);
      },
      () => {
        // Keep the still treatment when the preference cannot be read.
      },
    );
    const visibility = AppState.addEventListener('change', (state) =>
      setActive(state === 'active'),
    );
    return () => {
      mounted = false;
      preference?.remove();
      visibility.remove();
    };
  }, []);
  return active && !reduced;
}
