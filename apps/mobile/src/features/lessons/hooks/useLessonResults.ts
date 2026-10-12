import { lessons } from '../data/lessons';
import type { LessonCategory } from '../types';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';

export const lessonFilters = [
  { value: 'all', label: 'All lessons' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'saved', label: 'Saved' },
  { value: 'completed', label: 'Completed' },
] as const;

export type LessonFilter = (typeof lessonFilters)[number]['value'];

export function getLessonFilter(value?: string): LessonFilter {
  return lessonFilters.find((filter) => filter.value === value)?.value ?? 'all';
}

export function useLessonResults({
  topic,
  filter,
  query = '',
}: {
  topic?: LessonCategory;
  filter: LessonFilter;
  query?: string;
}) {
  const { bookmarks, progress } = useLearningProgress();
  const search = query.toLowerCase().trim();

  return lessons.filter(
    (lesson) =>
      (!topic || lesson.category === topic) &&
      (filter !== 'saved' || bookmarks.includes(lesson.id)) &&
      (filter !== 'completed' || progress[lesson.id]?.completed) &&
      (filter !== 'in-progress' || (progress[lesson.id] && !progress[lesson.id].completed)) &&
      `${lesson.title} ${lesson.category} ${lesson.scripture}`.toLowerCase().includes(search),
  );
}
