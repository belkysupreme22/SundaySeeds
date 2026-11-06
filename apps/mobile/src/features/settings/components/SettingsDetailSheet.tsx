import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { motion, targets } from '../../../shared/theme/motion';
import { brandColors } from '../../../shared/theme/tokens';
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
    paragraphs: ['Course lessons use reading, reflection and knowledge checks.'],
  },
  downloads: {
    title: 'Download quality',
    status: 'Downloads are not available yet',
    paragraphs: ['Open course lessons online from the Course library.'],
  },
  data: {
    title: 'Data usage',
    paragraphs: [
      'Your account stores your display name, learning preferences, course enrollments, saved reading places, bookmarks and completed knowledge checks. The app keeps a recovery record on this device while it confirms an interrupted quiz submission.',
      'Your guest name and your chosen profile portrait stay on this device. The app keeps separate portrait choices for guests and signed-in accounts.',
      'If you used the previous Lessons tab, its reading places, quiz scores, bookmarks and badges stay on this device. Course progress comes from activity in the courses you join.',
      'Wi-Fi-only and mobile-data preferences are not available yet.',
    ],
  },
  help: {
    title: 'Help Center',
    paragraphs: [
      'Open Courses to browse the Course library and view course outlines. To join, sign in, verify your email and choose Join course. Open lessons from the outline for the edition you joined.',
      'In a course lesson, choose Open knowledge check. Check each answer, then choose Finish quiz to record the result. Return to the course for completed checks and best scores. If a submission is interrupted, choose Check again to recover the same attempt.',
      'Choose Save my place here beside a section to return to that spot, or Bookmark this lesson to save the lesson for later. Sign in with the same account to access these choices on another device. If the app cannot confirm a save, retry the change or choose Reload saved state.',
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
    paragraphs: ['Official terms of service have not been published yet.'],
  },
  about: {
    title: 'About SundaySeeds',
    status: 'Version 0.1.0',
    paragraphs: [
      'A little faith, every day.',
      'Explore Scripture, reflection and short knowledge checks in the Course library.',
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
  const [focusedLanguage, setFocusedLanguage] = useState<AppLanguage | null>(null);
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
            onFocus={() => setFocusedLanguage(option.code)}
            onBlur={() =>
              setFocusedLanguage((current) => (current === option.code ? null : current))
            }
            style={({ pressed }) => [
              styles.languageOption,
              selected && styles.languageOptionSelected,
              pressed && styles.languagePressed,
            ]}
          >
            <View style={styles.languageWords}>
              <Text variant="label">{option.nativeLabel}</Text>
              {option.code !== option.nativeLabel && (
                <Text variant="small" muted={!selected}>
                  {option.label}
                </Text>
              )}
            </View>
            {selected && <View style={styles.selectedDot} />}
            {focusedLanguage === option.code && (
              <View style={styles.languageFocus} pointerEvents="none" aria-hidden />
            )}
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
    backgroundColor: brandColors.surfaceRaised,
    borderWidth: 1,
    borderColor: brandColors.surfaceEdge,
    borderRadius: 10,
    overflow: 'hidden',
  },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { flex: 1 },
  status: { padding: 10, backgroundColor: brandColors.surface, borderRadius: 6 },
  languageList: { gap: 8 },
  languageOption: {
    minHeight: targets.minimum,
    padding: 14,
    borderWidth: 1,
    borderColor: brandColors.surfaceEdge,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: brandColors.canvas,
  },
  languageWords: { flex: 1, minWidth: 0 },
  languagePressed: { opacity: motion.pressedOpacity },
  languageFocus: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: brandColors.forest,
    borderRadius: 8,
  },
  languageOptionSelected: {
    borderColor: brandColors.forest,
    backgroundColor: brandColors.surfaceStrong,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.forest,
  },
});
