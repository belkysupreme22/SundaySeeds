import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLearningProfile } from '../../learning-profile/hooks/useLearningProfile';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { LessonCard } from '../../lessons/components/LessonCard';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { SectionHeading } from '../../../shared/ui/SectionHeading';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { WeeklyHero } from '../components/WeeklyHero';
import { ContinueLearning } from '../components/ContinueLearning';
import { CourseJourneyCard } from '../../courses/components/CourseJourneyCard';
import { useLearnerProfile } from '../../profile/hooks/useLearnerProfile';
import { getHomeLessons } from '../data/homeLessons';
export function HomeScreen() {
  const { t } = useTranslation();
  const { shouldPrompt } = useLearningProfile();
  useFocusEffect(
    useCallback(() => {
      if (shouldPrompt) router.replace('/learning-profile');
    }, [shouldPrompt]),
  );
  const { width, fontScale } = useWindowDimensions();
  const wrapShortcuts = width < 360 || fontScale > 1.2;
  const { user } = useAuth();
  const { displayName } = useLearnerProfile();
  const greetingName = user ? displayName || t('profile.learner') : t('profile.learner');
  const { bookmarks, progress, errorKind } = useLearningProgress();
  const { continuing, suggestions } = getHomeLessons(progress);
  const completed = Object.values(progress).filter((p) => p.completed).length;
  const shortcuts: {
    title: string;
    subtitle: string;
    label?: string;
    icon: IconName;
    action: () => void;
  }[] = [
    {
      title: t('home.courses'),
      subtitle: t('home.browseCourses'),
      label: t('home.browseCourseLabel'),
      icon: 'book-open',
      action: () => router.push('/courses'),
    },
    {
      title: t('home.saved'),
      subtitle:
        errorKind === 'load'
          ? t('common.unavailable')
          : t('home.savedCount', { count: bookmarks.length }),
      icon: 'bookmark',
      action: () => router.replace('/lessons?filter=saved'),
    },
    {
      title: t('home.practice'),
      subtitle: t('home.quickQuiz'),
      icon: 'edit-3',
      action: () => router.push('/quiz/good-samaritan'),
    },
    {
      title: t('home.myGrowth'),
      subtitle:
        errorKind === 'load'
          ? t('common.unavailable')
          : t('home.finishedCount', { count: completed }),
      icon: 'award',
      action: () => router.replace('/progress'),
    },
  ];
  return (
    <Screen tabs>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Image
              source={require('../../../../assets/brand/logo-reversed.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessible={false}
            />
          </View>
          <View style={styles.greeting}>
            <Text variant="title" style={styles.brandTitle}>
              {t('home.greeting', { name: greetingName })}
            </Text>
            <Text variant="caption" muted>
              {t('home.subtitle')}
            </Text>
          </View>
        </View>
        <IconButton
          name="user"
          label={t('home.yourProfile')}
          onPress={() => router.replace('/profile')}
        />
      </View>
      <WeeklyHero />
      <ContentGroup>
        <SectionHeading title={t('home.quickAccess')} />
        <View style={styles.shortcuts}>
          {shortcuts.map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={item.label ?? `${item.title}, ${item.subtitle}`}
              onPress={item.action}
              style={[
                styles.shortcut,
                wrapShortcuts && styles.wideShortcut,
                { minWidth: 72 * fontScale },
              ]}
            >
              <Card tone="mint" shadow={false} style={styles.shortcutCard}>
                <Icon name={item.icon} size={23} color={brandColors.forest} />
                <Text variant="label" style={styles.shortcutTitle}>
                  {item.title}
                </Text>
                <Text variant="caption" style={styles.shortcutSubtitle}>
                  {item.subtitle}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ContentGroup>
      <ContinueLearning lessons={continuing} />
      <ContentGroup>
        <SectionHeading title={t('home.courseJourney')} />
        <CourseJourneyCard />
      </ContentGroup>
      <ContentGroup>
        <SectionHeading
          title={t('home.growToday')}
          action={t('common.viewAll')}
          onPress={() => router.replace('/lessons')}
        />
        {suggestions.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </ContentGroup>
      <ContentGroup>
        <SectionHeading title={t('home.memoryVerse')} />
        <Card tone="mint" shadow={false}>
          <View style={styles.verseTitle}>
            <Icon name="sun" size={20} color={brandColors.forest} />
            <Text variant="caption">{t('home.memoryVerseLabel')}</Text>
          </View>
          <Text variant="title" style={styles.verse}>
            {t('home.verseText')}
          </Text>
          <Text variant="small">{t('home.verseRef')}</Text>
        </Card>
      </ContentGroup>
      <Text variant="caption" muted style={styles.demo}>
        {t('common.tagline')}
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center', flex: 1 },
  greeting: { flex: 1 },
  logo: {
    width: 35,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.1,
    borderRadius: 8,
    borderColor: colors.ink,
    backgroundColor: brandColors.forest,
  },
  logoImage: { width: 29, height: 33 },
  brandTitle: { color: brandColors.forest },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shortcut: { flexGrow: 1, flexBasis: '20%' },
  wideShortcut: { flexBasis: '45%' },
  shortcutCard: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    gap: 6,
    minHeight: 96,
  },
  shortcutTitle: { fontSize: 12, lineHeight: 19, textAlign: 'center' },
  shortcutSubtitle: { fontSize: 11, lineHeight: 18, textAlign: 'center' },
  verseTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  verse: { marginTop: 10, marginBottom: 8 },
  demo: { textAlign: 'center', paddingHorizontal: 10 },
});
