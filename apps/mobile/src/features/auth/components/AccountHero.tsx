import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const signup = mode === 'sign-up';
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  return (
    <View style={[styles.hero, stacked && styles.stacked]}>
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="authHeading" accessibilityRole="header">
          {title ?? t(signup ? 'authScreens.signUp' : 'authScreens.signIn')}
        </Text>
        <Text variant="small">
          {description ?? t(signup ? 'authScreens.signUpBody' : 'authScreens.signInBody')}
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
  copy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    gap: 6,
    paddingTop: 22,
    paddingBottom: 20,
    zIndex: 1,
  },
  stacked: { flexDirection: 'column' },
  stackedCopy: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    alignSelf: 'stretch',
    paddingTop: 4,
    paddingRight: 20,
    paddingBottom: 8,
  },
  art: { width: '55%', height: 225, alignSelf: 'flex-end' },
  stackedArt: { width: 220, height: 225, marginTop: -5 },
  // Shift the person too: the cutout's transparent margin must not recreate a form-width inset.
  portrait: { position: 'absolute', width: '110%', height: 226, bottom: -7, right: -44 },
  backdrop: { position: 'absolute', width: '110%', height: 225, bottom: -4, right: -10 },
});
