import { useAuth } from '../../auth/hooks/useAuth';
import { Card } from '../../../shared/ui/Card';
import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LearningDataControls } from '../components/LearningDataControls';
import { SettingsGroup, SettingsRow } from '../components/SettingsGroup';
import { SettingsDetailSheet, type SettingsDetailKey } from '../components/SettingsDetailSheet';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { colors } from '../../../shared/theme/tokens';

export function SettingsScreen() {
  const auth = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
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
    else setNotice(result.message);
  }
  return (
    <Screen tabs loadingMessage={loggingOut && auth.busy ? 'Signing out…' : undefined}>
      <PageHeader title="Settings" subtitle="Make SundaySeeds your own." back />
      <SettingsGroup title="Account">
        <SettingsRow
          icon="log-in"
          title={auth.user ? auth.user.email : 'Sign in or create an account'}
          value={
            !auth.hydrated
              ? 'Loading…'
              : auth.user
                ? auth.user.verified
                  ? 'Verified'
                  : 'Verify email'
                : 'Optional'
          }
          description={
            auth.user
              ? 'Manage your signed-in account.'
              : 'Sign in, create an account or keep exploring.'
          }
          onPress={() => router.push(auth.user ? '/verify-email' : '/sign-in')}
        />
        <SettingsRow
          divider
          icon="user"
          title="Personal information"
          description="Update your display name."
          onPress={() => router.push('/edit-profile')}
        />
        <SettingsRow
          divider
          icon="lock"
          title="Change password"
          value={auth.configured ? 'Email link' : 'Unavailable'}
          description="Request an email to choose a new password."
          onPress={() => router.push('/forgot-password')}
        />
        <SettingsRow
          divider
          icon="mail"
          title="Email preferences"
          value="Unavailable"
          description="Email delivery is not connected."
          onPress={() => setDetail('email')}
        />
      </SettingsGroup>
      <SettingsGroup title="App Settings">
        <SettingsRow
          icon="sun"
          title="Appearance"
          value="Light mode"
          onPress={() => setDetail('appearance')}
        />
        <SettingsRow
          divider
          icon="globe"
          title="Language"
          value="English"
          onPress={() => setDetail('language')}
        />
        <SettingsRow
          divider
          icon="play-circle"
          title="Video playback"
          value="Unavailable"
          onPress={() => setDetail('playback')}
        />
        <SettingsRow
          divider
          icon="download"
          title="Download quality"
          value="Unavailable"
          onPress={() => setDetail('downloads')}
        />
        <SettingsRow divider icon="database" title="Data usage" onPress={() => setDetail('data')} />
      </SettingsGroup>
      <SettingsGroup title="Learning">
        <SettingsRow
          icon="compass"
          title="Learning profile"
          description="Choose your interests, starting point and study rhythm."
          value={auth.user?.verified ? undefined : 'Optional'}
          onPress={() => router.push('/learning-profile?mode=edit')}
        />
        <SettingsRow
          divider
          icon="play-circle"
          title="Replay the introduction"
          description="Revisit account options and optional name setup."
          onPress={() => router.push('/welcome')}
        />
      </SettingsGroup>
      <SettingsGroup title="Support & About">
        <SettingsRow
          icon="help-circle"
          title="Help Center"
          description="Get help with learning and saved progress."
          onPress={() => setDetail('help')}
        />
        <SettingsRow
          divider
          icon="shield"
          title="Privacy Policy"
          value="Not published"
          onPress={() => setDetail('privacy')}
        />
        <SettingsRow
          divider
          icon="file-text"
          title="Terms of Service"
          value="Not published"
          onPress={() => setDetail('terms')}
        />
        <SettingsRow
          divider
          icon="info"
          title="About SundaySeeds"
          description="Version 0.1.0"
          onPress={() => setDetail('about')}
        />
      </SettingsGroup>
      {(notice || auth.error) && (
        <Card tone="lavender" shadow={false} stroke="soft">
          <Text accessibilityLiveRegion="polite">{notice || auth.error}</Text>
        </Card>
      )}
      <LearningDataControls />
      <View style={styles.signOut}>
        <Button
          label="Log out"
          icon="log-out"
          variant="outline"
          disabled={!auth.user || auth.busy || !auth.hydrated}
          loading={loggingOut && auth.busy}
          style={styles.signOutButton}
          onPress={() => void logout()}
        />
        <Text variant="caption" muted style={styles.center}>
          {auth.user ? 'Signs out on this device.' : 'No account is signed in.'}
        </Text>
      </View>
      <Text variant="caption" muted style={styles.center}>
        A little faith, every day.
      </Text>
      <SettingsDetailSheet detail={detail} onClose={() => setDetail(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  signOut: { gap: 6 },
  signOutButton: { borderColor: colors.danger, borderRadius: 6, minHeight: 44 },
  center: { textAlign: 'center' },
});
