import { sampleCourse } from '../../courses/data/sampleCourse';
import { lessons } from '../../lessons/data/lessons';
import type { Lesson } from '../../lessons/types';
import type { LearningPreferencesDraft } from '../types';

export type CourseSuggestion = {
  id: string;
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
  reason: string;
  lessonSuggestion: Pick<Lesson, 'id' | 'title' | 'durationMinutes'> | null;
};

// This projects the authored sample, not a connected or expanded course catalog.
export function getCourseSuggestions(preferences: LearningPreferencesDraft): CourseSuggestion[] {
  const courseLessons = sampleCourse.modules
    .flatMap((module) => module.lessonIds)
    .map((id) => lessons.find((lesson) => lesson.id === id))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
  const matchingTopics = preferences.interests.filter((interest) =>
    courseLessons.some((lesson) => lesson.category === interest),
  );
  const topicMatch = (lesson: Lesson) =>
    matchingTopics.includes(lesson.category) ||
    (preferences.intention === 'prayer_habit' && lesson.category === 'Prayer');
  const timeFit = (lesson: Lesson) =>
    preferences.sessionMinutes !== null && lesson.durationMinutes <= preferences.sessionMinutes;
  const rankedLessons = courseLessons
    .map((lesson, order) => ({ lesson, order }))
    .sort(
      (a, b) =>
        Number(topicMatch(b.lesson)) - Number(topicMatch(a.lesson)) ||
        Number(timeFit(b.lesson)) - Number(timeFit(a.lesson)) ||
        a.order - b.order,
    );
  const hasLessonPreference =
    matchingTopics.length > 0 ||
    preferences.intention === 'prayer_habit' ||
    preferences.sessionMinutes !== null;

  return [
    {
      id: sampleCourse.id,
      title: sampleCourse.title,
      description: sampleCourse.description,
      moduleCount: sampleCourse.modules.length,
      lessonCount: courseLessons.length,
      reason:
        matchingTopics.length > 0
          ? `Includes studies on ${matchingTopics.map((topic) => topic.toLowerCase()).join(', ')}.`
          : preferences.intention === 'prayer_habit'
            ? 'Includes a study on making room for prayer.'
            : 'Explore prayer, trust and compassion through short Bible studies.',
      lessonSuggestion: hasLessonPreference ? (rankedLessons[0]?.lesson ?? null) : null,
    },
  ];
}
