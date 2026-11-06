import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { motion, shape } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import type { AvatarId } from '../types/avatar';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfilePortraitLink({
  avatarId,
  disabled,
  onPress,
}: {
  avatarId: AvatarId | null;
  disabled: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('profile.avatar.change')}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <ProfileAvatar avatarId={avatarId} size={68} />
      <View style={styles.words}>
        <Text variant="meta" muted>
          {t('profile.avatar.label')}
        </Text>
        <Text variant="label">{t('profile.avatar.change')}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={brandColors.forest} />
      {focused && <View style={styles.focusRing} pointerEvents="none" aria-hidden />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: shape.stroke.subtle,
    borderColor: colors.line,
    borderRadius: shape.radius.card,
    backgroundColor: brandColors.surface,
  },
  words: { flex: 1, minWidth: 0, gap: 2 },
  focusRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: shape.stroke.focus,
    borderRadius: shape.radius.card,
    borderColor: brandColors.forest,
  },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
  disabled: { opacity: motion.disabledOpacity },
});
