import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/ui/Text';
import { colors, fonts } from '../../../shared/theme/tokens';

export function AccountProviders() {
  const { t } = useTranslation();
  const [provider, setProvider] = useState<string | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  return (
    <View style={styles.group}>
      <View style={styles.divider}>
        <View style={styles.rule} />
        <Text variant="caption" muted style={styles.dividerLabel}>
          {t('authScreens.otherSignInOptions')}
        </Text>
        <View style={styles.rule} />
      </View>
      <Text variant="caption" muted>
        {t('authScreens.providersUnavailable')}
      </Text>
      <View style={[styles.row, stacked && styles.stacked]}>
        {(['Google', 'Apple'] as const).map((name) => (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={t('authScreens.providerAccessibility', { provider: name })}
            onPress={() => setProvider(name)}
            style={({ pressed }) => [
              styles.button,
              stacked && styles.stackedButton,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={styles.iconSlot}
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {name === 'Google' ? (
                <Image
                  source={require('../../../../assets/auth/google-g.png')}
                  style={styles.google}
                  resizeMode="contain"
                  accessible={false}
                />
              ) : (
                <FontAwesome name="apple" size={21} color={colors.ink} />
              )}
            </View>
            <Text variant="label" style={styles.label}>
              {name}
            </Text>
          </Pressable>
        ))}
      </View>
      {provider && (
        <Text variant="small" accessibilityLiveRegion="polite">
          {t('authScreens.providerUnavailableNotice', { provider })}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  google: { width: 20, height: 20 },
  iconSlot: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: { fontFamily: fonts.medium, flexShrink: 1, textAlign: 'center' },
  group: { gap: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLabel: { flexShrink: 1, textAlign: 'center' },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  row: { flexDirection: 'row', gap: 12 },
  stacked: { flexDirection: 'column' },
  stackedButton: { flex: 0 },
  button: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#6B6672',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  pressed: { backgroundColor: colors.soft },
});
