import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../i18n/useLanguage';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { targets } from '../../../shared/theme/motion';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

export function AccountLanguagePicker() {
  const { t } = useTranslation();
  const { language, changeLanguage, availableLanguages, loading } = useLanguage();

  return (
    <View
      style={styles.group}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('language.selectLanguage')}
    >
      {availableLanguages.map(({ code, nativeLabel }) => {
        const selected = code === language;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityLabel={nativeLabel}
            accessibilityLanguage={code === 'am' ? 'am-ET' : 'en'}
            accessibilityState={{ checked: selected, disabled: loading }}
            disabled={loading}
            onPress={() => void changeLanguage(code)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            {selected && <Icon name="check" size={16} color={brandColors.forest} />}
            <Text variant="control" style={styles.label}>
              {nativeLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: targets.minimum,
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
  },
  selected: { backgroundColor: brandColors.surfaceStrong, borderColor: brandColors.forest },
  pressed: { backgroundColor: brandColors.surface },
  label: { flexShrink: 1, color: brandColors.forest },
});
