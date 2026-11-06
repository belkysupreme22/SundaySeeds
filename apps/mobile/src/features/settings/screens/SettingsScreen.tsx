import { useAuth } from '../../auth/hooks/useAuth';
import type { LocalizedAuthResult } from '../../auth/types';
import { Card } from '../../../shared/ui/Card';
import { useCallback, useRef, useState } from 'react';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SettingsGroup, SettingsRow } from '../components/SettingsGroup';
import { SettingsDetailSheet, type SettingsDetailKey } from '../components/SettingsDetailSheet';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { cardColors, colors } from '../../../shared/theme/tokens';
import { useLanguage } from '../../../i18n/useLanguage';

export function SettingsScreen() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { language, availableLanguages } = useLanguage();
  const currentLangLabel =
    availableLanguages.find((l) => l.code === language)?.nativeLabel ?? 'English';
  const [notice, setNotice] = useState<LocalizedAuthResult | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [detail, setDetail] = useState<SettingsDetailKey | null>(null);
  const focused = useRef(false);
  const logoutAttempt = useRef(0);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        ++logoutAttempt.current;
      };
    }, []),
  );

  async function logout() {
    const userId = auth.user?.id;
    if (!userId || auth.busy) return;
    const attempt = ++logoutAttempt.current;
    setNotice(null);
    setLoggingOut(true);
    const result = await auth.signOut(userId);
    setLoggingOut(false);
    if (!focused.current || logoutAttempt.current !== attempt) return;
    if (result.ok) router.replace('/home');
    else setNotice(result);
  }
  if (!auth.hydrated || (!auth.user && loggingOut)) {
    return (
      <Screen loadingMessage={t(loggingOut ? 'settings.signingOut' : 'settings.statusLoading')}>
        {null}
      </Screen>
    );
  }
  if (!auth.user) return <Redirect href="/profile" />;
  const { email, verified } = auth.user;

  return (
    <Screen tabs loadingMessage={loggingOut && auth.busy ? t('settings.signingOut') : undefined}>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} back />
      <SettingsGroup title={t('settings.account')}>
        <SettingsRow
          icon="log-in"
          title={email}
          value={t(verified ? 'settings.verified' : 'settings.verifyEmail')}
          description={t(verified ? 'settings.signedIn' : 'settings.confirmEmail')}
          onPress={
            verified
              ? undefined
              : () => router.push({ pathname: '/verify-email', params: { returnTo: '/settings' } })
          }
        />
        <SettingsRow
          divider
          icon="user"
          title={t('settings.personalInfo')}
          description={t('settings.personalInfoDesc')}
          onPress={() => router.push('/edit-profile')}
        />
        <SettingsRow
          divider
          icon="lock"
          title={t('settings.changePassword')}
          value={auth.configured ? t('settings.emailLink') : t('common.unavailable')}
          description={t('settings.changePasswordDesc')}
          onPress={() => router.push('/forgot-password')}
        />
        <SettingsRow
          divider
          icon="mail"
          title={t('settings.emailPrefs')}
          value={t('common.unavailable')}
          description={t('settings.emailPrefsDesc')}
          onPress={() => setDetail('email')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.appSettings')}>
        <SettingsRow
          icon="sun"
          title={t('settings.appearance')}
          value={t('settings.lightMode')}
          onPress={() => setDetail('appearance')}
        />
        <SettingsRow
          divider
          icon="globe"
          title={t('settings.language')}
          value={currentLangLabel}
          onPress={() => setDetail('language')}
        />
        <SettingsRow
          divider
          icon="play-circle"
          title={t('settings.videoPlayback')}
          value={t('common.unavailable')}
          onPress={() => setDetail('playback')}
        />
        <SettingsRow
          divider
          icon="download"
          title={t('settings.downloadQuality')}
          value={t('common.unavailable')}
          onPress={() => setDetail('downloads')}
        />
        <SettingsRow
          divider
          icon="database"
          title={t('settings.dataUsage')}
          onPress={() => setDetail('data')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.learning')}>
        <SettingsRow
          icon="compass"
          title={t('settings.learningProfile')}
          description={t('settings.learningProfileDesc')}
          value={verified ? undefined : t('settings.verifyEmail')}
          onPress={() => router.push('/learning-profile?mode=edit')}
        />
        <SettingsRow
          divider
          icon="play-circle"
          title={t('settings.replayIntro')}
          description={t('settings.replayIntroDesc')}
          onPress={() => router.push('/welcome')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.support')}>
        <SettingsRow
          icon="help-circle"
          title={t('settings.helpCenter')}
          description={t('settings.helpCenterDesc')}
          onPress={() => setDetail('help')}
        />
        <SettingsRow
          divider
          icon="shield"
          title={t('settings.privacy')}
          value={t('settings.notPublished')}
          onPress={() => setDetail('privacy')}
        />
        <SettingsRow
          divider
          icon="file-text"
          title={t('settings.terms')}
          value={t('settings.notPublished')}
          onPress={() => setDetail('terms')}
        />
        <SettingsRow
          divider
          icon="info"
          title={t('settings.about')}
          description={t('settings.version')}
          onPress={() => setDetail('about')}
        />
      </SettingsGroup>
      {(notice || auth.error) && (
        <Card tone="peach" shadow={false} stroke="soft">
          <Text accessibilityLiveRegion="polite">
            {notice ? t(notice.messageKey, { defaultValue: notice.message }) : auth.error}
          </Text>
        </Card>
      )}
      <View style={styles.signOut}>
        <Button
          label={t('settings.logOut')}
          icon="log-out"
          variant="outline"
          disabled={auth.busy}
          loading={loggingOut && auth.busy}
          style={styles.signOutButton}
          onPress={() => void logout()}
        />
        <Text variant="caption" muted style={styles.center}>
          {t('settings.signsOutDevice')}
        </Text>
      </View>
      <Text variant="caption" muted style={styles.center}>
        {t('common.tagline')}
      </Text>
      <SettingsDetailSheet detail={detail} onClose={() => setDetail(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  signOut: { gap: 6 },
  signOutButton: {
    borderColor: colors.danger,
    borderRadius: 6,
    minHeight: 44,
    backgroundColor: cardColors.pink,
  },
  center: { textAlign: 'center' },
});
