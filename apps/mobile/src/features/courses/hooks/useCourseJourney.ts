import { useCourseCatalog } from './useCourseCatalog';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';

const FALLBACK_REAL_COURSE_ID = '12de2847-b8a0-4489-b081-fb3e99a3de2e';

/** Derive course summaries from the real course offering; never persist a second completion flag. */
export function useCourseJourney() {
  const { progress, hydrated, errorKind } = useLearningProgress();
  const { state: catalogState } = useCourseCatalog();

  const realCourse =
    catalogState.status === 'ready' && catalogState.data.length > 0
      ? catalogState.data[0]
      : null;

  const courseId = realCourse?.courseId ?? FALLBACK_REAL_COURSE_ID;
  const courseTitle = realCourse?.title ?? 'Faith for everyday life';
  const moduleCount = realCourse?.modules.length ?? 2;

  const lessonIds = realCourse
    ? realCourse.modules.flatMap((m) => m.lessons.map((l) => l.id))
    : ['a-life-of-prayer', 'faith-like-a-seed', 'david-and-goliath', 'good-samaritan'];

  const lessons = lessonIds
    .map(getLesson)
    .filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== undefined);

  const available = hydrated && errorKind !== 'load';
  const completed = lessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const started = lessons.some((lesson) => progress[lesson.id]);
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

  return {
    courseId,
    courseTitle,
    moduleCount,
    lessons,
    progress,
    available,
    completed,
    started,
    next,
    finished,
    status,
  };
}
