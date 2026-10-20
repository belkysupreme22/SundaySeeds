import { View } from 'react-native';
import { LoaderAnimation } from './LoaderAnimation';
import { useLoaderMotion } from './useLoaderMotion';

// Decorative: the containing status or button supplies meaningful accessible text.
export function LoadingIndicator({ small = false }: { small?: boolean }) {
  const animate = useLoaderMotion();
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ width: small ? 40 : 112, height: small ? 18 : 36, flexShrink: 0 }}
    >
      <LoaderAnimation animate={animate} small={small} />
    </View>
  );
}
