import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileLearningStats } from '../components/ProfileLearningStats';
import { ProfileNavigationGroup } from '../components/ProfileNavigationGroup';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { displayName, hydrated: profileHydrated, loadError, retryLoad } = useLearnerProfile();
  const {
    progress,
    bookmarks,
    hydrated: learningHydrated,
    error,
    errorKind,
  } = useLearningProgress();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const entries = lessons.flatMap((lesson) => (progress[lesson.id] ? [progress[lesson.id]] : []));
  const completed = entries.filter((entry) => entry.completed).length;
  const inProgress = entries.length - completed;
  const saved = lessons.filter((lesson) => bookmarks.includes(lesson.id)).length;
  const learningReady = learningHydrated && errorKind !== 'load';

  return (
    <Screen tabs>
      <PageHeader
        title={t('profile.title')}
        action={
          <IconButton
            name="settings"
            label={t('settings.title')}
            onPress={() => router.push('/settings')}
          />
        }
      />
      <ContentGroup>
        <ProfileHeader
          displayName={displayName}
          loading={!profileHydrated}
          unavailable={!!loadError}
          stacked={stacked}
          onEdit={() => router.push('/edit-profile')}
        />
        {loadError && (
          <Card tone="peach" shadow={false} style={styles.note}>
            <Text accessibilityRole="alert" variant="small">
              {loadError}
            </Text>
            <Button label={t('common.retry')} icon="refresh-cw" onPress={retryLoad} />
          </Card>
        )}
      </ContentGroup>
      <ContentGroup>
        <Text variant="title" accessibilityRole="header">
          {t('profile.lessonActivity')}
        </Text>
        {!learningReady ? (
          <Card tone={errorKind === 'load' ? 'peach' : undefined} stroke="soft" shadow={false}>
            <Text variant="small" accessibilityLiveRegion="polite">
              {errorKind === 'load' ? t('progress.onHoldDesc') : t('progress.loading')}
            </Text>
          </Card>
        ) : (
          <>
            <ProfileLearningStats
              completed={completed}
              inProgress={inProgress}
              saved={saved}
              onOpen={(filter) => router.replace({ pathname: '/lessons', params: { filter } })}
            />
            {error && (
              <Text variant="caption" muted>
                {t('profile.learningSaveWarning')}
              </Text>
            )}
          </>
        )}
        <ProfileNavigationGroup
          items={[
            {
              id: 'progress',
              title: t('progress.title'),
              description: t('profile.progressDescription'),
              icon: 'bar-chart-2',
              tone: 'mint',
              onPress: () => router.replace('/progress'),
            },
            ...(!learningReady
              ? [
                  {
                    id: 'saved',
                    title: t('lessons.savedLessons'),
                    description: t('profile.savedDescription'),
                    icon: 'bookmark' as const,
                    tone: 'yellow' as const,
                    onPress: () => router.replace('/lessons?filter=saved'),
                  },
                ]
              : []),
          ]}
        />
      </ContentGroup>
      <ContentGroup>
        <Text variant="title" accessibilityRole="header">
          {t('settings.about')}
        </Text>
        <ProfileNavigationGroup
          items={[
            {
              id: 'welcome',
              title: t('settings.replayIntro'),
              description: t('settings.replayIntroDesc'),
              icon: 'sun',
              tone: 'yellow',
              onPress: () => router.push('/welcome'),
            },
          ]}
        />
      </ContentGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { gap: 10 },
});
