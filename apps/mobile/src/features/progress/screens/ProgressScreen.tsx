import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { ProgressHero } from '../components/ProgressHero';
import { ProgressStats } from '../components/ProgressStats';
import { LessonProgressRow } from '../components/LessonProgressRow';
import { LearningMilestones } from '../components/LearningMilestones';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';

export function ProgressScreen() {
  const { t } = useTranslation();
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
  const nextLesson =
    lessons.find((lesson) => progress[lesson.id] && !progress[lesson.id].completed) ??
    lessons.find((lesson) => !progress[lesson.id] && bookmarks.includes(lesson.id)) ??
    lessons.find((lesson) => !progress[lesson.id]);
  const nextProgress = nextLesson ? progress[nextLesson.id] : undefined;

  if (!hydrated || errorKind === 'load') {
    return (
      <Screen tabs>
        <PageHeader title={t('progress.title')} subtitle={t('progress.subtitle')} />
        <Card
          tone={errorKind === 'load' ? 'peach' : 'mint'}
          style={styles.state}
          accessibilityLiveRegion="polite"
        >
          <Icon name={errorKind === 'load' ? 'alert-circle' : 'book-open'} size={28} />
          <Text variant="title">
            {errorKind === 'load' ? t('progress.onHold') : t('progress.loading')}
          </Text>
          <Text variant="small">
            {errorKind === 'load' ? t('progress.onHoldDesc') : t('progress.loadingDesc')}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen tabs>
      <PageHeader title={t('progress.title')} subtitle={t('progress.subtitle')} />
      <ProgressHero
        completed={completed}
        total={lessons.length}
        started={entries.length > 0}
        stacked={stacked}
      />
      <ContentGroup>
        <Text variant="title" accessibilityRole="header">
          {t('progress.milestoneBoard')}
        </Text>
        <Card stroke="subtle" shadow={false} style={styles.overall}>
          <View style={styles.between}>
            <Text variant="label">
              {t('progress.lessonsCompleted', { completed, total: lessons.length })}
            </Text>
            <Text variant="meta" muted>
              {t('progress.milestoneInProgress', { count: inProgress })}
            </Text>
          </View>
          {nextLesson && (
            <View style={styles.nextStep}>
              <Text variant="meta" muted>
                {t('progress.milestoneNextLesson')}
              </Text>
              <Text variant="title">{nextLesson.title}</Text>
              {nextProgress && (
                <Text variant="small">
                  {t('progress.milestoneReadingPlace', {
                    position: nextProgress.sectionIndex + 1,
                    total: nextLesson.sections.length,
                  })}
                </Text>
              )}
              <Button
                label={t(nextProgress ? 'progress.milestoneResume' : 'progress.milestoneOpen')}
                icon="arrow-right"
                onPress={() =>
                  router.push(nextProgress ? `/read/${nextLesson.id}` : `/lessons/${nextLesson.id}`)
                }
              />
            </View>
          )}
          <LearningMilestones
            started={entries.length > 0}
            completed={completed}
            total={lessons.length}
          />
        </Card>
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">{t('progress.overview')}</Text>
        <ProgressStats
          saved={saved}
          averageBestScore={averageBestScore}
          scoredLessons={scores.length}
          stacked={stacked}
        />
      </ContentGroup>
      <ContentGroup>
        <View style={styles.between}>
          <Text variant="title" style={styles.grow}>
            {t('progress.lessonHistory')}
          </Text>
          <Text variant="caption" muted>
            {lessons.length} {t('lessons.sampleLessons')}
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
  nextStep: {
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: brandColors.surface,
  },
  state: { gap: 12 },
});
