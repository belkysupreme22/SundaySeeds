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
      <Text variant="title">Your course journey</Text>
      <Text variant="label">{sampleCourse.title}</Text>
      <Text variant="small" muted>
        {status}
      </Text>
      {available && finished && (
        <Text variant="small">
          You’ve finished every lesson quiz in this sample course. Revisit any lesson from the
          curriculum.
        </Text>
      )}
      {canContinue && (
        <QuizNextAction
          title={`Continue with ${next.title}`}
          description={`${nextModule?.title ?? 'Course lesson'} · ${next.durationMinutes} min. Open the lesson overview and pick up your saved place.`}
          icon="arrow-right"
          tone="lavender"
          onPress={() => router.push(`/lessons/${next.id}`)}
        />
      )}
      <QuizNextAction
        title="View course curriculum"
        description="See both modules and choose a lesson. Your best quiz scores stay."
        icon="list"
        tone="mint"
        onPress={() => router.push('/lessons/course')}
      />
    </ContentGroup>
  );
}
