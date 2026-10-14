import { router } from 'expo-router';
import { lessons } from '../../lessons/data/lessons';
import { LearningDataControls } from '../components/LearningDataControls';
import { SettingsGroup, SettingsRow } from '../components/SettingsGroup';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';

export function SettingsScreen() {
  return (
    <Screen>
      <PageHeader title="Settings" subtitle="Make SundaySeeds your own." back />
      <SettingsGroup title="Personal information">
        <SettingsRow
          icon="user"
          title="Display name"
          description="Choose how we greet you."
          onPress={() => router.push('/edit-profile')}
        />
      </SettingsGroup>
      <SettingsGroup title="Learning data">
        <SettingsRow
          icon="play-circle"
          title="Replay the introduction"
          description="Take another look around SundaySeeds."
          onPress={() => router.push('/welcome')}
        />
        <SettingsRow
          divider
          icon="smartphone"
          title="How your learning is saved"
          description="Your name, reading positions, quiz scores and bookmarks stay in this app on this device. They are not backed up to an account or synced with a class."
        />
      </SettingsGroup>
      <SettingsGroup title="About SundaySeeds">
        <SettingsRow icon="info" title="SundaySeeds" description="Version 0.1.0" />
        <SettingsRow
          divider
          icon="book-open"
          title="Learn a little, grow each day"
          description={`Explore ${lessons.length} sample lessons with scripture, reflection and short quizzes.`}
        />
      </SettingsGroup>
      <LearningDataControls />
      <Text variant="caption" muted style={{ textAlign: 'center' }}>
        A little faith, every day.
      </Text>
    </Screen>
  );
}
