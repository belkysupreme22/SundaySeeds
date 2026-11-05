import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brandColors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';
import { ProfileSeal } from './ProfileSeal';

type ProfileHeaderProps = {
  displayName: string;
  loading: boolean;
  unavailable: boolean;
  stacked: boolean;
  onEdit: () => void;
};

export function ProfileHeader({
  displayName,
  loading,
  unavailable,
  stacked,
  onEdit,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  return (
    <Card tone="mint" stroke="soft" shadow={false} style={styles.card}>
      <View style={[styles.identity, stacked && styles.stacked]}>
        <ProfileSeal />
        <View style={[styles.copy, stacked && styles.stackedCopy]} accessibilityLiveRegion="polite">
          <Text variant="meta" muted>
            {t('profile.identityLabel')}
          </Text>
          <Text variant="heading" accessibilityRole="header" style={styles.name}>
            {loading
              ? t('profile.loadingName')
              : unavailable
                ? t('profile.nameUnavailable')
                : displayName || t('profile.greeting', { name: t('profile.learner') })}
          </Text>
        </View>
      </View>
      {!loading && !unavailable && (
        <Button
          label={t(displayName ? 'profile.editName' : 'profile.addName')}
          icon="edit-2"
          variant="outline"
          onPress={onEdit}
          style={styles.edit}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 9, gap: 12 },
  name: { color: brandColors.forest },
  edit: { borderColor: brandColors.controlBorder, minHeight: 44, paddingVertical: 8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedCopy: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'stretch' },
});
