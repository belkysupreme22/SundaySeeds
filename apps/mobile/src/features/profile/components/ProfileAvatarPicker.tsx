import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { motion } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { avatarIds, type AvatarId } from '../types/avatar';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfileAvatarPicker({
  selectedId,
  disabled,
  onSelect,
}: {
  selectedId: AvatarId | null;
  disabled: boolean;
  onSelect: (id: AvatarId | null) => void;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [focused, setFocused] = useState<AvatarId | 'default' | null>(null);

  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      <Text variant="label" accessibilityRole="header">
        {t('profile.avatar.title')}
      </Text>
      <View style={styles.choices}>
        {avatarIds.map((id) => {
          const selected = selectedId === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={t(`profile.avatar.${id}`)}
              disabled={disabled}
              onPress={() => onSelect(id)}
              onFocus={() => setFocused(id)}
              onBlur={() => setFocused((current) => (current === id ? null : current))}
              style={({ pressed }) => [
                styles.choice,
                width < 320 && styles.narrowChoice,
                selected && styles.selected,
                focused === id && styles.focused,
                pressed && styles.pressed,
              ]}
            >
              <View>
                <ProfileAvatar avatarId={id} size={56} />
                {selected && (
                  <View style={styles.check} aria-hidden>
                    <Icon name="check" size={12} color={brandColors.onForest} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selectedId === null, disabled }}
        disabled={disabled}
        onPress={() => onSelect(null)}
        onFocus={() => setFocused('default')}
        onBlur={() => setFocused((current) => (current === 'default' ? null : current))}
        style={({ pressed }) => [
          styles.defaultChoice,
          focused === 'default' && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        <ProfileAvatar avatarId={null} size={28} />
        <Text variant="small" style={styles.defaultLabel}>
          {t('profile.avatar.default')}
        </Text>
        {selectedId === null && <Icon name="check" size={16} color={brandColors.forest} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 320 },
  choice: {
    flexBasis: '25%',
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  narrowChoice: { flexBasis: '33.333%' },
  defaultChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  defaultLabel: { flex: 1 },
  selected: { backgroundColor: brandColors.surfaceStrong },
  focused: { borderColor: brandColors.forest },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
  check: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.paper,
    backgroundColor: brandColors.forest,
    padding: 2,
  },
});
