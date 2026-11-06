import { router } from 'expo-router';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { QuizNextAction } from './QuizNextAction';

export function NextStandaloneLesson({ lessonId }: { lessonId: string }) {
  const { progress, hydrated, errorKind } = useLearningProgress();
  if (!hydrated || errorKind || !progress[lessonId]?.completed) {
    return null;
  }

  const next =
    lessons.find(({ id }) => progress[id] && !progress[id].completed) ??
    lessons.find(({ id }) => !progress[id]);
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
