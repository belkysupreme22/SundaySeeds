import { router } from 'expo-router';
import { useCourseJourney } from '../hooks/useCourseJourney';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { QuizNextAction } from '../../quizzes/components/QuizNextAction';

export function CourseQuizNextSteps({ lessonId }: { lessonId: string }) {
  const { lessons, progress, available, next, finished, status, courseId, courseTitle } =
    useCourseJourney();
  if (!lessons.some((lesson) => lesson.id === lessonId)) return null;
  const canContinue =
    available && progress[lessonId]?.completed && !finished && next && next.id !== lessonId;
  return (
    <ContentGroup>
      <Text variant="title">Your course journey</Text>
      <Text variant="label">{courseTitle}</Text>
      <Text variant="small" muted>
        {status}
      </Text>
      {available && finished && (
        <Text variant="small">
          You’ve completed every knowledge check in this course. Revisit a reflection and consider
          how you’ll put it into practice.
        </Text>
      )}
      {canContinue && (
        <QuizNextAction
          title={`Continue with ${next.title}`}
          description={`${next.title} · ${next.durationMinutes} minutes of reading. Read, reflect and explore your next step.`}
          icon="arrow-right"
          tone="mint"
          onPress={() => router.push(`/lessons/${next.id}`)}
        />
      )}
      <QuizNextAction
        title="View course curriculum"
        description="Explore modules, revisit a reflection or choose your next lesson."
        icon="list"
        tone="mint"
        onPress={() => router.push({ pathname: '/courses/[id]', params: { id: courseId } })}
      />
    </ContentGroup>
  );
}
