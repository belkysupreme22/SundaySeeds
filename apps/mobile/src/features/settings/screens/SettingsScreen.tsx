import { useState } from 'react';
import { router } from 'expo-router';
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
  const [detail, setDetail] = useState<SettingsDetailKey | null>(null);
  return (
    <Screen tabs>
      <PageHeader title="Settings" subtitle="Make SundaySeeds your own." back />
      <SettingsGroup title="Account">
        <SettingsRow
          icon="user"
          title="Personal information"
          description="Update your display name."
          onPress={() => router.push('/edit-profile')}
        />
        <SettingsRow
          divider
          icon="lock"
          title="Change password"
          value="Unavailable"
          description="Account sign-in is not connected."
          onPress={() => setDetail('password')}
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
          icon="play-circle"
          title="Replay the introduction"
          description="Take another look around SundaySeeds."
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
      <LearningDataControls />
      <View style={styles.signOut}>
        <Button
          label="Log out"
          icon="log-out"
          variant="outline"
          disabled
          style={styles.signOutButton}
          onPress={() => {}}
        />
        <Text variant="caption" muted style={styles.center}>
          No account is signed in.
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
