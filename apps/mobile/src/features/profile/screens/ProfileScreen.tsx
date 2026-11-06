import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { useProfileAvatar } from '../hooks/useProfileAvatar';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileNavigationGroup } from '../components/ProfileNavigationGroup';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { displayName, hydrated: profileHydrated, loadError, retryLoad } = useLearnerProfile();
  const { avatarId } = useProfileAvatar();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;

  return (
    <Screen tabs>
      <PageHeader
        title={t('profile.title')}
        action={
          <IconButton
            name="settings"
            label={t('settings.title')}
            onPress={() => router.push('/settings')}
          />
        }
      />
      <ContentGroup>
        <ProfileHeader
          displayName={displayName}
          avatarId={avatarId}
          loading={!profileHydrated}
          unavailable={!!loadError}
          stacked={stacked}
          onEdit={() => router.push('/edit-profile')}
        />
        {loadError && (
          <Card tone="peach" shadow={false} style={styles.note}>
            <Text accessibilityRole="alert" variant="small">
              {loadError}
            </Text>
            <Button label={t('common.retry')} icon="refresh-cw" onPress={retryLoad} />
          </Card>
        )}
      </ContentGroup>
      <ProfileNavigationGroup
        items={[
          {
            id: 'progress',
            title: t('progress.title'),
            description: t('progress.connected.profileDescription'),
            icon: 'bar-chart-2',
            tone: 'mint',
            onPress: () => router.replace('/progress'),
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { gap: 10 },
});
