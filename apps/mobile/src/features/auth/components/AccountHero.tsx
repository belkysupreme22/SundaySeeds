import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { AccountBackdrop } from './AccountBackdrop';

export function AccountHero({
  mode,
  title,
  description,
}: {
  mode: 'sign-in' | 'sign-up';
  title?: string;
  description?: string;
}) {
  const signup = mode === 'sign-up';
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  return (
    <View style={[styles.hero, stacked && styles.stacked]}>
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="heading">{title ?? (signup ? 'Sign up' : 'Sign in')}</Text>
        <Text variant="small">
          {description ??
            (signup
              ? 'Create your account and start growing today.'
              : 'Welcome back! Make room for a little learning today.')}
        </Text>
      </View>
      <View
        style={[styles.art, stacked && styles.stackedArt]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.backdrop}>
          <AccountBackdrop signup={signup} />
        </View>
        <Image
          source={
            signup
              ? require('../../../../assets/auth/sign-up-cutout.png')
              : require('../../../../assets/auth/sign-in-cutout.png')
          }
          style={styles.portrait}
          resizeMode="contain"
          accessible={false}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: {
    minHeight: 225,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    marginBottom: -14,
    // The reference bleeds the portrait/backdrop to the viewport; fields keep their inset.
    marginRight: -20,
  },
  copy: { flex: 1, gap: 6, paddingTop: 22, paddingBottom: 20, zIndex: 1 },
  stacked: { flexDirection: 'column' },
  stackedCopy: { flex: 0, paddingTop: 4, paddingBottom: 8 },
  art: { width: '55%', height: 225, alignSelf: 'flex-end' },
  stackedArt: { width: 220, height: 225, marginTop: -5 },
  // Shift the person too: the cutout's transparent margin must not recreate a form-width inset.
  portrait: { position: 'absolute', width: '110%', height: 226, bottom: -7, right: -44 },
  backdrop: { position: 'absolute', width: '110%', height: 225, bottom: -4, right: -10 },
});
