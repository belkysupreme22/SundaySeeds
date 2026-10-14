import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
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
  const completed = lessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const inProgress = lessons.filter(
    (lesson) => progress[lesson.id] && !progress[lesson.id].completed,
  ).length;
  const saved = lessons.filter((lesson) => bookmarks.includes(lesson.id)).length;

  return (
    <Screen tabs>
      <PageHeader
        title="My profile"
        subtitle="Your space to learn and grow."
        action={
          <IconButton
            name="settings"
            label="Open settings"
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
            <Button label="Try loading my name again" icon="refresh-cw" onPress={retryLoad} />
          </Card>
        )}
        {!learningHydrated || errorKind === 'load' ? (
          <Card tone={errorKind === 'load' ? 'peach' : undefined} shadow={false}>
            <Text variant="small" accessibilityLiveRegion="polite">
              {errorKind === 'load'
                ? 'Your learning summary is unavailable. Use Try loading again in the storage notice above.'
                : 'Loading your learning summary…'}
            </Text>
          </Card>
        ) : (
          <>
            <ProfileLearningStats
              completed={completed}
              inProgress={inProgress}
              saved={saved}
              stacked={stacked}
            />
            {error && (
              <Text variant="caption" muted>
                These counts include session changes that may not be saved. Use the storage notice
                above to try again.
              </Text>
            )}
          </>
        )}
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">My learning</Text>
        <ProfileNavigationGroup
          items={[
            {
              id: 'progress',
              title: 'My learning progress',
              description: 'Reading positions and best quiz scores',
              icon: 'bar-chart-2',
              tone: 'mint',
              onPress: () => router.replace('/progress'),
            },
            {
              id: 'saved',
              title: 'My saved lessons',
              description: 'Lessons you bookmarked for later',
              icon: 'bookmark',
              tone: 'yellow',
              onPress: () => router.replace('/lessons?filter=saved'),
            },
          ]}
        />
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">Make yourself at home</Text>
        <ProfileNavigationGroup
          items={[
            {
              id: 'welcome',
              title: 'View introduction',
              description: 'A quick welcome to SundaySeeds',
              icon: 'sun',
              tone: 'lavender',
              onPress: () => router.push('/welcome'),
            },
            {
              id: 'settings',
              title: 'Settings',
              description: 'Your name, learning data and app information',
              icon: 'settings',
              tone: 'peach',
              onPress: () => router.push('/settings'),
            },
          ]}
        />
      </ContentGroup>
      <Text variant="caption" muted style={styles.center}>
        SundaySeeds · A little faith, every day
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { gap: 10 },
  center: { textAlign: 'center' },
});
