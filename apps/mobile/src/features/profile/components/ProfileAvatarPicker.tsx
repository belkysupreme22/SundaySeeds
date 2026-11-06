import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { brandColors, colors, spacing } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { avatarIds, type AvatarId } from '../types/avatar';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfileAvatarPicker({
  selectedId,
  disabled,
  onSelect,
}: {
  selectedId: AvatarId | null;
  disabled: boolean;
  onSelect: (id: AvatarId) => void;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [focused, setFocused] = useState<AvatarId | null>(null);
  const portraitSize = width < 360 ? 64 : 76;

  return (
    <View
      style={styles.choices}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('profile.avatar.title')}
    >
      {avatarIds.map((id) => {
        const selected = selectedId === id;
        return (
          <View key={id} style={[styles.column, width < 320 && styles.compactColumn]}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={t(`profile.avatar.${id}`)}
              disabled={disabled}
              onPress={() => onSelect(id)}
              onFocus={() => setFocused(id)}
              onBlur={() => setFocused((current) => (current === id ? null : current))}
              style={({ pressed }) => [
                styles.choice,
                selected && styles.selected,
                focused === id && styles.focused,
                pressed && styles.pressed,
              ]}
            >
              <View>
                <ProfileAvatar avatarId={id} size={portraitSize} />
                {selected && (
                  <View style={styles.check} aria-hidden>
                    <Icon name="check" size={12} color={brandColors.onForest} />
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.sm,
    padding: spacing.sm,
  },
  column: { width: '33.333%', paddingHorizontal: spacing.xs },
  compactColumn: { width: '50%' },
  choice: {
    minHeight: targets.preferred,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: shape.radius.card,
    borderWidth: shape.stroke.focus,
    borderColor: 'transparent',
  },
  selected: { backgroundColor: brandColors.surfaceStrong },
  focused: { borderColor: brandColors.forest },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
  check: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderRadius: shape.radius.round,
    borderWidth: 1,
    borderColor: colors.paper,
    backgroundColor: brandColors.forest,
    padding: 2,
  },
});
