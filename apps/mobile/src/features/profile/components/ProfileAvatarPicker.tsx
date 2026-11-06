import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { brandColors, colors, spacing } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { avatarIds, type AvatarId } from '../types/avatar';
import { ProfileAvatar } from './ProfileAvatar';

const choices = [...avatarIds, null];

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
  const portraitSize = width < 360 ? 64 : 76;

  return (
    <View
      style={styles.choices}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('profile.avatar.title')}
    >
      {choices.map((id) => {
        const key = id ?? 'default';
        const selected = selectedId === id;
        return (
          <View key={key} style={[styles.column, width < 320 && styles.compactColumn]}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={t(`profile.avatar.${key}`)}
              disabled={disabled}
              onPress={() => onSelect(id)}
              onFocus={() => setFocused(key)}
              onBlur={() => setFocused((current) => (current === key ? null : current))}
              style={({ pressed }) => [
                styles.choice,
                selected && styles.selected,
                focused === key && styles.focused,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.ring, selected && styles.selectedRing]}>
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
    backgroundColor: brandColors.canvas,
    borderColor: colors.line,
    borderWidth: shape.stroke.subtle,
    borderRadius: shape.radius.card,
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
  ring: {
    borderRadius: shape.radius.round,
    borderWidth: shape.stroke.focus,
    borderColor: 'transparent',
    padding: 2,
  },
  selectedRing: { borderColor: brandColors.forest },
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
