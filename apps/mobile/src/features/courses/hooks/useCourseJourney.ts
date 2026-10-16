import { sampleCourse } from '../data/sampleCourse';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';

/** Derive course summaries from the existing lesson store; never persist a second completion flag. */
export function useCourseJourney() {
  const { progress, hydrated, errorKind } = useLearningProgress();
  const lessons = sampleCourse.modules
    .flatMap((module) => module.lessonIds.map(getLesson))
    .filter((lesson) => lesson !== undefined);
  const available = hydrated && errorKind !== 'load';
  const completed = lessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const started = lessons.some((lesson) => progress[lesson.id]);
  // Storage has no last-opened timestamp: prefer started unfinished lessons in curriculum order.
  const next =
    lessons.find((lesson) => progress[lesson.id] && !progress[lesson.id].completed) ??
    lessons.find((lesson) => !progress[lesson.id]?.completed) ??
    lessons[0];
  const finished = lessons.length > 0 && completed === lessons.length;
  const status = !hydrated
    ? 'Loading your progress…'
    : !available
      ? 'Progress unavailable. Use the recovery notice to try again.'
      : `${completed} of ${lessons.length} lesson quizzes finished`;
  return { lessons, progress, available, completed, started, next, finished, status };
}
