import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { ProgressHero } from '../components/ProgressHero';
import { ProgressStats } from '../components/ProgressStats';
import { LessonProgressRow } from '../components/LessonProgressRow';
import { colors } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

export function ProgressScreen() {
  const { progress, bookmarks, hydrated, error, errorKind } = useLearningProgress();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const entries = lessons.flatMap((lesson) => (progress[lesson.id] ? [progress[lesson.id]] : []));
  const completed = entries.filter((entry) => entry.completed).length;
  const inProgress = entries.length - completed;
  const saved = lessons.filter((lesson) => bookmarks.includes(lesson.id)).length;
  const scores = entries.flatMap((entry) => (entry.bestScore == null ? [] : [entry.bestScore]));
  const averageBestScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const completion = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  if (!hydrated || errorKind === 'load') {
    return (
      <Screen tabs>
        <PageHeader title="Your progress" subtitle="Every little step matters." />
        <Card
          tone={errorKind === 'load' ? 'peach' : 'lavender'}
          style={styles.state}
          accessibilityLiveRegion="polite"
        >
          <Icon name={errorKind === 'load' ? 'alert-circle' : 'book-open'} size={28} />
          <Text variant="title">
            {errorKind === 'load' ? 'Your progress is on hold' : 'Loading your learning…'}
          </Text>
          <Text variant="small">
            {errorKind === 'load'
              ? 'Saved learning is unavailable right now. Use Try loading again in the notice above to restore your dashboard.'
              : 'Your lesson positions, saved lessons and quiz scores will appear here.'}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen tabs>
      <PageHeader title="Your progress" subtitle="Every little step matters." />
      <ProgressHero
        completed={completed}
        total={lessons.length}
        started={entries.length > 0}
        stacked={stacked}
      />
      <ContentGroup>
        <Text variant="title">Overall progress</Text>
        <Card stroke="subtle" shadow={false} style={styles.overall}>
          <View style={styles.between}>
            <Text variant="label" style={styles.grow}>
              {completed} of {lessons.length} lessons completed
            </Text>
            <View style={styles.percentage}>
              <Text variant="title">{completion}%</Text>
            </View>
          </View>
          <ProgressBar
            value={completion}
            label="Completed sample lessons"
            valueText={completed + ' of ' + lessons.length + ' lessons completed'}
          />
          <Text variant="caption" muted>
            Finishing a quiz completes its lesson. Reading position is shown separately below.
          </Text>
        </Card>
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">Learning overview</Text>
        <ProgressStats
          completed={completed}
          inProgress={inProgress}
          saved={saved}
          averageBestScore={averageBestScore}
          scoredLessons={scores.length}
          stacked={stacked}
        />
      </ContentGroup>
      {entries.length === 0 && (
        <Card tone="peach" shadow={false} style={styles.state}>
          <Text variant="title">
            {saved ? 'Your saved lessons are waiting' : 'Your first seed starts here'}
          </Text>
          <Text variant="small">
            {saved
              ? 'Saving a lesson keeps it handy. Open one when you’re ready to begin.'
              : 'Open a sample lesson to begin. Your reading position and best quiz score will appear here.'}
          </Text>
          <Button
            label="Explore lessons"
            icon="arrow-right"
            onPress={() => router.push('/lessons')}
          />
        </Card>
      )}
      <ContentGroup>
        <View style={styles.between}>
          <Text variant="title" style={styles.grow}>
            Lesson progress
          </Text>
          <Text variant="caption" muted>
            {lessons.length} sample lessons
          </Text>
        </View>
        {lessons.map((lesson) => (
          <LessonProgressRow
            key={lesson.id}
            lesson={lesson}
            progress={progress[lesson.id]}
            saved={bookmarks.includes(lesson.id)}
            stacked={stacked}
            onPress={() => router.push(`/lessons/${lesson.id}`)}
          />
        ))}
      </ContentGroup>
      {error && (
        <Text variant="small" muted>
          Your latest progress may not be saved. Use the notice above to try again.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  overall: { gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  grow: { flexGrow: 1, flexShrink: 1 },
  percentage: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 6,
    backgroundColor: colors.lavender,
  },
  state: { gap: 12 },
});
