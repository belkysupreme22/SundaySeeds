import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { lessons } from '../../lessons/data/lessons';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';
import { useLanguage, AVAILABLE_LANGUAGES, type AppLanguage } from '../../../i18n/useLanguage';

export type SettingsDetailKey =
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
  email: {
    title: 'Email preferences',
    status: 'Learning-email preferences are not available yet',
    paragraphs: [
      'Learning reminders and course-update emails are not available yet. There are no learning-email preferences to change here.',
      'Account confirmation and password-recovery emails are separate from learning emails. Use the account verification or Change password actions for those requests.',
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
    status: undefined,
    paragraphs: [],
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
      'Reading positions, quiz scores and bookmarks from the Lessons tab stay on this device, along with your guest name. Signing in does not upload or merge them. Your account display name is stored separately with your account.',
      'Account learning preferences, enrollments, course reading places, lesson bookmarks and completed knowledge checks are stored with your account. A small recovery record on this device keeps an interrupted quiz request on the same attempt; it is not a saved result.',
      'Reset lesson activity clears the quiz scores, reading positions and bookmarks stored on this device. Names, account learning preferences, course enrollments, connected reading places and bookmarks, quiz results and your introduction preference are kept.',
      'Wi-Fi-only and mobile-data preferences are not available yet.',
    ],
  },
  help: {
    title: 'Help Center',
    paragraphs: [
      'Find a lesson: open Lessons to browse the lesson collection, search by title or scripture, or use the filter icon. You can leave all filters off.',
      'Start a lesson: open its overview and choose Start or Continue. Read each section, then move to the quiz.',
      'Take a lesson quiz: choose an answer, tap Check answer, read the explanation and continue. Finish all questions to record completion.',
      'See lesson progress: open Progress for completed lessons and best quiz scores. Use the bookmark icon on a lesson to save it for later.',
      'Browse connected courses: choose Courses on Home to open the Course library. An available course shows its outline; joining requires a verified account and an explicit Join action. Open joined readings from your saved-edition curriculum.',
      'Take a course knowledge check: open a joined reading and choose Open knowledge check. Check each answer, then Finish quiz to record the result. Return to the course for completed checks and best scores. If a request is interrupted, choose Check again to recover the same attempt.',
      'Keep a course reading place: choose Save my place here beside a section and Bookmark this lesson to keep it bookmarked. Your verified account can load these choices on another device. If saving is not confirmed, retry the same change or reload saved state; a conflict requires reloading before another choice.',
      'Start fresh: use Reset lesson activity in Settings. You can cancel before confirming; account enrollments are kept.',
      'If saved learning cannot load, changes pause to protect it. Use Try loading again in the notice. If changes cannot save, keep the app open and use Try saving again.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    status: 'Official policy not published yet',
    paragraphs: [
      'An official privacy policy has not been published yet.',
      'For the current storage behavior, open Data usage in Settings.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    status: 'Official terms not published yet',
    paragraphs: [
      'Official terms of service have not been published yet.',
    ],
  },
  about: {
    title: 'About SundaySeeds',
    status: 'Version 0.1.0',
    paragraphs: [
      'A little faith, every day.',
      `Explore ${lessons.length} lessons with scripture, reflection and short quizzes.`,
      'Loading animation: “Loading dots” by Kyle McGahey on LottieFiles, adapted for SundaySeeds under the Lottie Simple License.',
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
  const { t } = useTranslation();
  const { language, changeLanguage, loading } = useLanguage();
  if (!detail) return null;
  const content = details[detail];
  const title = detail === 'language' ? t('settings.language') : content.title;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.panel} accessibilityViewIsModal>
          <ScrollView key={detail} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text variant="title" accessibilityRole="header" style={styles.heading}>
                {title}
              </Text>
              <IconButton name="x" label={t('common.close')} onPress={onClose} />
            </View>
            {detail === 'language' ? (
              <LanguagePicker
                current={language}
                loading={loading}
                onChange={(lang) => void changeLanguage(lang)}
              />
            ) : (
              <>
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
              </>
            )}
            <Button label={t('common.close')} icon="check" onPress={onClose} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function LanguagePicker({
  current,
  loading,
  onChange,
}: {
  current: AppLanguage;
  loading: boolean;
  onChange: (lang: AppLanguage) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.languageList} accessibilityRole="radiogroup">
      <Text variant="small" muted>
        {t('language.selectLanguage')}
      </Text>
      {AVAILABLE_LANGUAGES.map((option) => {
        const selected = option.code === current;
        return (
          <Pressable
            key={option.code}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: loading }}
            accessibilityLabel={option.nativeLabel}
            disabled={loading}
            onPress={() => onChange(option.code)}
            style={[styles.languageOption, selected && styles.languageOptionSelected]}
          >
            <Text variant="label">{option.nativeLabel}</Text>
            {option.code !== option.nativeLabel && (
              <Text variant="small" muted>
                {option.label}
              </Text>
            )}
            {selected && <View style={styles.selectedDot} />}
          </Pressable>
        );
      })}
    </View>
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
  status: { padding: 10, backgroundColor: brandColors.surface, borderRadius: 6 },
  languageList: { gap: 8 },
  languageOption: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageOptionSelected: {
    borderColor: brandColors.forest,
    backgroundColor: brandColors.surfaceStrong,
  },
  selectedDot: {
    marginLeft: 'auto',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.forest,
  },
});
