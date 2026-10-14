import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lessons } from '../../lessons/data/lessons';
import { colors } from '../../../shared/theme/tokens';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';

export type SettingsDetailKey =
  | 'password'
  | 'email'
  | 'appearance'
  | 'language'
  | 'playback'
  | 'downloads'
  | 'data'
  | 'help'
  | 'privacy'
  | 'terms'
  | 'about';

type DetailContent = { title: string; status?: string; paragraphs: string[] };

const details: Record<SettingsDetailKey, DetailContent> = {
  password: {
    title: 'Change password',
    status: 'Account sign-in is not available yet',
    paragraphs: [
      'There is no password to change in this version. Password settings will be available when account sign-in is connected.',
    ],
  },
  email: {
    title: 'Email preferences',
    status: 'Email delivery is not connected',
    paragraphs: [
      'SundaySeeds does not send learning emails in this version. Email preferences will become available with an account and email service.',
    ],
  },
  appearance: {
    title: 'Appearance',
    status: 'Light mode',
    paragraphs: [
      'SundaySeeds currently uses the light appearance shown throughout the app. Dark mode and automatic theme switching are not available yet.',
    ],
  },
  language: {
    title: 'Language',
    status: 'English',
    paragraphs: [
      'The app and sample lessons are currently available in English. Additional languages are not available yet.',
    ],
  },
  playback: {
    title: 'Video playback',
    status: 'Video lessons are not available yet',
    paragraphs: [
      'The current lessons use reading, reflection and quizzes. There is no video player or playback preference to configure.',
    ],
  },
  downloads: {
    title: 'Download quality',
    status: 'Downloads are not available yet',
    paragraphs: [
      'There is no lesson download manager in this version, so download quality cannot be changed.',
    ],
  },
  data: {
    title: 'Data usage',
    paragraphs: [
      'Your name, reading positions, quiz scores and bookmarks stay in this app on this device. They are not backed up to an account or synced with a class.',
      'Reset learning progress removes quiz scores, reading positions and bookmarks. Your display name and introduction preference are kept.',
      'Wi-Fi-only and mobile-data preferences are not available yet.',
    ],
  },
  help: {
    title: 'Help Center',
    paragraphs: [
      'Find a lesson: open Lessons to browse the sample collection, search by title or scripture, or use the filter icon. You can leave all filters off.',
      'Start learning: open a lesson and choose Start or Continue. Read each section, then move to the quiz.',
      'Take a quiz: choose an answer, tap Check answer, read the explanation and continue. Finish all questions to record completion.',
      'See your progress: open Progress for completed lessons and best quiz scores. Use the bookmark icon on a lesson to save it for later.',
      'Start fresh: use Reset learning progress in Settings. You can cancel before confirming.',
      'If a storage warning appears, use Try loading again or Try saving again in that notice. A warning means your changes may not have been saved.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    status: 'Official policy not published yet',
    paragraphs: [
      'An official privacy policy has not been published for this preview. This panel is a status notice, not a privacy policy.',
      'For the current storage behavior, open Data usage in Settings.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    status: 'Official terms not published yet',
    paragraphs: [
      'Official terms of service have not been published for this preview. There are no terms to review or accept in this panel.',
    ],
  },
  about: {
    title: 'About SundaySeeds',
    status: 'Version 0.1.0',
    paragraphs: [
      'A little faith, every day.',
      `Explore ${lessons.length} sample lessons with scripture, reflection and short quizzes.`,
    ],
  },
};

export function SettingsDetailSheet({
  detail,
  onClose,
}: {
  detail: SettingsDetailKey | null;
  onClose: () => void;
}) {
  if (!detail) return null;
  const content = details[detail];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.panel} accessibilityViewIsModal>
          <ScrollView key={detail} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text variant="title" accessibilityRole="header" style={styles.heading}>
                {content.title}
              </Text>
              <IconButton name="x" label={`Close ${content.title}`} onPress={onClose} />
            </View>
            {content.status ? (
              <View style={styles.status}>
                <Text variant="label">{content.status}</Text>
              </View>
            ) : null}
            {content.paragraphs.map((paragraph) => (
              <Text key={paragraph} variant="small">
                {paragraph}
              </Text>
            ))}
            <Button label="Done" icon="check" onPress={onClose} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 23, 29, 0.35)',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    overflow: 'hidden',
  },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { flex: 1 },
  status: { padding: 10, backgroundColor: colors.lavender, borderRadius: 6 },
});
