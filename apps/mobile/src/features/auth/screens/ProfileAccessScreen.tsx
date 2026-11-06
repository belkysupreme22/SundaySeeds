import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brandColors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { AccountHero } from '../components/AccountHero';
import { AccountLanguagePicker } from '../components/AccountLanguagePicker';
import { useAuth } from '../hooks/useAuth';

export function ProfileAccessScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();

  return (
    <Screen tabs>
      <PageHeader title={t('profile.title')} />
      <AccountLanguagePicker />
      <AccountHero
        mode="sign-in"
        title={t('profileAccess.title')}
        description={t('profileAccess.description')}
      />
      <Card stroke="subtle" shadow={false} style={styles.actions}>
        {configured ? (
          <>
            <Button
              label={t('authScreens.signIn')}
              icon="log-in"
              onPress={() =>
                router.push({ pathname: '/sign-in', params: { returnTo: '/profile' } })
              }
            />
            <Button
              label={t('authScreens.signUp')}
              variant="outline"
              onPress={() =>
                router.push({ pathname: '/sign-up', params: { returnTo: '/profile' } })
              }
            />
          </>
        ) : (
          <Text variant="small">{t('authScreens.accountUnavailable')}</Text>
        )}
        <Text variant="caption" muted>
          {t('profileAccess.guest')}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 12, backgroundColor: brandColors.surfaceRaised },
});
