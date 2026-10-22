import { router } from 'expo-router';
import { sampleCourse } from '../data/sampleCourse';
import { useCourseJourney } from '../hooks/useCourseJourney';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { QuizNextAction } from '../../quizzes/components/QuizNextAction';

export function CourseQuizNextSteps({ lessonId }: { lessonId: string }) {
  const { lessons, progress, available, next, finished, status } = useCourseJourney();
  if (!lessons.some((lesson) => lesson.id === lessonId)) return null;
  const canContinue =
    available && progress[lessonId]?.completed && !finished && next && next.id !== lessonId;
  const nextModule = canContinue
    ? sampleCourse.modules.find((module) => module.lessonIds.includes(next.id))
    : undefined;
  return (
    <ContentGroup>
      <Text variant="title">Your sample course journey</Text>
      <Text variant="label">{sampleCourse.title}</Text>
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
          description={`${nextModule?.title ?? 'Course lesson'} · ${next.durationMinutes} minutes of reading. Read, reflect and explore your next step.`}
          icon="arrow-right"
          tone="lavender"
          onPress={() => router.push(`/lessons/${next.id}`)}
        />
      )}
      <QuizNextAction
        title="View course curriculum"
        description="Explore both modules, revisit a reflection or choose your next lesson."
        icon="list"
        tone="mint"
        onPress={() => router.push('/lessons/course')}
      />
    </ContentGroup>
  );
}
