import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { brandColors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { ProfileAvatar } from './ProfileAvatar';
import type { AvatarId } from '../types/avatar';

type ProfileHeaderProps = {
  displayName: string;
  avatarId: AvatarId | null;
  loading: boolean;
  unavailable: boolean;
  stacked: boolean;
  onEdit: () => void;
};

export function ProfileHeader({
  displayName,
  avatarId,
  loading,
  unavailable,
  stacked,
  onEdit,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const [editFocused, setEditFocused] = useState(false);
  const canEdit = !loading && !unavailable;
  const name = loading
    ? t('profile.loadingName')
    : unavailable
      ? t('profile.nameUnavailable')
      : displayName || t('profile.greeting', { name: t('profile.learner') });

  return (
    <Card tone="mint" stroke="subtle" shadow={false}>
      <View
        style={[styles.identity, stacked && styles.stacked, canEdit && !stacked && styles.reserve]}
      >
        <ProfileAvatar avatarId={avatarId} size={88} />
        <View accessibilityLiveRegion="polite" style={[styles.copy, stacked && styles.stackedCopy]}>
          <Text variant="heading" accessibilityRole="header" style={styles.name}>
            {name}
          </Text>
          <Text variant="meta" muted>
            {t('profile.identityLabel')}
          </Text>
        </View>
      </View>
      {canEdit && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.edit.title')}
          onPress={onEdit}
          onFocus={() => setEditFocused(true)}
          onBlur={() => setEditFocused(false)}
          style={({ pressed }) => [
            styles.editTarget,
            editFocused && styles.focused,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.editIcon}>
            <Icon name="edit-2" size={16} color={brandColors.forest} />
          </View>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reserve: { paddingRight: targets.minimum + 2 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { color: brandColors.forest },
  stacked: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  stackedCopy: { flex: 0, alignSelf: 'stretch' },
  editTarget: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: targets.minimum,
    height: targets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape.radius.button,
    borderWidth: shape.stroke.focus,
    borderColor: 'transparent',
  },
  focused: { borderColor: brandColors.forest },
  pressed: { backgroundColor: brandColors.surfaceStrong, opacity: motion.pressedOpacity },
  editIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape.radius.chip,
    borderWidth: shape.stroke.soft,
    borderColor: brandColors.controlBorder,
    backgroundColor: brandColors.canvas,
  },
});
