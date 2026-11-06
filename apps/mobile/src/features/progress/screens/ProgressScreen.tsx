import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../auth/hooks/useAuth';
import { brandColors, spacing } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';

export function ProgressScreen() {
  const { t } = useTranslation();
  const { hydrated, user } = useAuth();
  const description = !hydrated
    ? 'common.loading'
    : !user
      ? 'progress.connected.guest'
      : user.verified
        ? 'progress.connected.description'
        : 'progress.connected.unverified';

  return (
    <Screen tabs>
      <PageHeader title={t('progress.title')} />
      <Card stroke="subtle" shadow={false} style={styles.card}>
        <View style={styles.icon} aria-hidden>
          <Icon name="bar-chart-2" size={24} color={brandColors.forest} />
        </View>
        <Text variant="title" accessibilityRole="header">
          {t('progress.connected.title')}
        </Text>
        <Text variant="small" accessibilityLiveRegion="polite">
          {t(description)}
        </Text>
        <Button
          label={t('home.browseCourseLabel')}
          icon="book-open"
          onPress={() => router.replace('/courses')}
        />
        {hydrated && !user?.verified && (
          <Button
            label={t(user ? 'settings.verifyEmail' : 'auth.signIn')}
            icon={user ? 'mail' : 'log-in'}
            variant="outline"
            onPress={() => router.push(user ? '/verify-email' : '/sign-in')}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: brandColors.surfaceRaised,
    borderColor: brandColors.surfaceEdge,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: brandColors.surface,
  },
});
