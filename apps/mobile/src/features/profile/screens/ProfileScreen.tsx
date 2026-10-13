import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileNavigationGroup } from '../components/ProfileNavigationGroup';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import type { Pastel } from '../../../shared/theme/tokens';

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
  const stats: { label: string; value: number; tone: Pastel; icon: IconName }[] = [
    { label: 'Completed', value: completed, tone: 'mint', icon: 'check-circle' },
    { label: 'In progress', value: inProgress, tone: 'yellow', icon: 'book-open' },
    { label: 'Saved', value: saved, tone: 'peach', icon: 'bookmark' },
  ];

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
      <ContentGroup>
        <Text variant="title">Learning at a glance</Text>
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
            <View style={[styles.stats, stacked && styles.stacked]}>
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  tone={stat.tone}
                  shadow={false}
                  style={[styles.stat, stacked && styles.stackedStat]}
                  accessible
                  accessibilityLabel={stat.value + ' lessons ' + stat.label.toLowerCase()}
                >
                  <Icon name={stat.icon} size={20} />
                  <Text variant="heading">{stat.value}</Text>
                  <Text variant="small">{stat.label}</Text>
                </Card>
              ))}
            </View>
            <Text variant="caption" muted>
              {error
                ? 'These counts include session changes that may not be saved. Use the storage notice above to try again.'
                : 'From your sample lessons on this device. A finished quiz completes a lesson.'}
            </Text>
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
      <Card shadow={false} style={styles.note}>
        <View style={styles.localHeading}>
          <Icon name="smartphone" size={18} />
          <Text variant="label" style={styles.flexible}>
            A profile on this device
          </Text>
        </View>
        <Text variant="small" muted>
          Your optional name and sample learning stay here. This preview has no signed-in account or
          cloud sync.
        </Text>
      </Card>
      <Text variant="caption" muted style={styles.center}>
        SundaySeeds · A little faith, every day · Preview 0.1.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, minWidth: 0, padding: 12, gap: 5, borderRadius: 9 },
  stacked: { flexDirection: 'column' },
  stackedStat: { flex: 0 },
  note: { gap: 10 },
  localHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flexible: { flex: 1 },
  center: { textAlign: 'center' },
});
