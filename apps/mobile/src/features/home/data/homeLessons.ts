import { lessons } from '../../lessons/data/lessons';
import type { LessonProgress } from '../../progress/data/progressStorage';

export const featuredLessonId = 'good-samaritan';

export function getHomeLessons(progress: Record<string, LessonProgress>) {
  const continuing = lessons
    .filter((lesson) => progress[lesson.id] && !progress[lesson.id].completed)
    .slice(0, 2);
  const suggestions = lessons
    .filter(
      (lesson) =>
        lesson.id !== featuredLessonId &&
        !continuing.some((continued) => continued.id === lesson.id),
    )
    .slice(0, 2);
  return { continuing, suggestions };
}
