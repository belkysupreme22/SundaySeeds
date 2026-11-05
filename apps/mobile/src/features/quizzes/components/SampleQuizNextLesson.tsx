import { router } from 'expo-router';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { sampleCourse } from '../../courses/data/sampleCourse';
import { QuizNextAction } from './QuizNextAction';

const sampleLessonIds = sampleCourse.modules.flatMap((module) => module.lessonIds);

export function SampleQuizNextLesson({ lessonId }: { lessonId: string }) {
  const { progress, hydrated, errorKind } = useLearningProgress();
  if (
    !hydrated ||
    errorKind ||
    !sampleLessonIds.includes(lessonId) ||
    !progress[lessonId]?.completed
  ) {
    return null;
  }

  const nextId =
    sampleLessonIds.find((id) => progress[id] && !progress[id].completed) ??
    sampleLessonIds.find((id) => !progress[id]?.completed);
  const next = nextId ? getLesson(nextId) : undefined;
  if (!next) return null;

  return (
    <QuizNextAction
      title={`Continue with ${next.title}`}
      description={`${next.durationMinutes} minutes of reading`}
      icon="arrow-right"
      tone="mint"
      onPress={() => router.push(`/lessons/${next.id}`)}
    />
  );
}
