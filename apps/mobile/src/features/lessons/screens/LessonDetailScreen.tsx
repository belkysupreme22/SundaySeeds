import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { getLesson } from '../data/lessons';
import { LessonOverviewHeader } from '../components/LessonOverviewHeader';
import { LessonCurriculum } from '../components/LessonCurriculum';
import { LessonOutcomes } from '../components/LessonOutcomes';
import { LessonProgressSummary } from '../components/LessonProgressSummary';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';
export function LessonDetailScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { bookmarks, toggleBookmark, progress, setSection, error } = useLearningProgress();
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Lesson not found" back />
        <Button label="Explore lessons" onPress={() => router.replace('/lessons')} />
      </Screen>
    );
  const saved = bookmarks.includes(lesson.id);
  const lessonProgress = progress[lesson.id];
  const completed = lessonProgress?.completed;
  return (
    <Screen
      footer={
        <Button
          label={
            completed
              ? 'Revisit lesson'
              : lessonProgress
                ? 'Continue learning'
                : 'Start this lesson'
          }
          onPress={() => {
            if (completed) setSection(lesson.id, 0);
            router.push(`/read/${lesson.id}`);
          }}
        />
      }
    >
      <PageHeader
        title="Lesson overview"
        back
        action={
          <IconButton
            name="bookmark"
            label={saved ? 'Unsave lesson' : 'Save lesson'}
            active={saved}
            onPress={() => toggleBookmark(lesson.id)}
          />
        }
      />
      <LessonOverviewHeader lesson={lesson} />
      <LessonOutcomes outcomes={lesson.outcomes} />
      {lessonProgress && (
        <Card tone={completed ? 'mint' : undefined} shadow={false} style={styles.progress}>
          <Text variant="label">Your learning</Text>
          <LessonProgressSummary readingCount={lesson.sections.length} progress={lessonProgress} />
          {completed ? (
            <Text variant="small">
              Revisit from reading 1. Your completed status and best quiz score stay.
            </Text>
          ) : (
            <Text variant="small">
              Resume at “{lesson.sections[lessonProgress.sectionIndex].title}”.
            </Text>
          )}
          {error && (
            <Text variant="small" muted>
              Your latest progress may not be saved. Use the notice above to try again.
            </Text>
          )}
        </Card>
      )}
      <LessonCurriculum
        lesson={lesson}
        progress={lessonProgress}
        onRead={(index) => {
          setSection(lesson.id, index);
          router.push(`/read/${lesson.id}`);
        }}
        onQuiz={() => router.push(`/quiz/${lesson.id}`)}
      />
      <Card tone="mint" shadow={false}>
        <Text variant="label">A verse to remember</Text>
        <Text variant="title" style={styles.verse}>
          “{lesson.memoryVerse.text}”
        </Text>
        <Text variant="small">{lesson.memoryVerse.reference}</Text>
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  progress: { gap: 10 },
  verse: { marginVertical: 12 },
});
