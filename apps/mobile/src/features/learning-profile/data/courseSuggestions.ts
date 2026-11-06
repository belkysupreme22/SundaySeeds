import type { CourseOffering } from '../../courses/types/catalog';
import type { LearningPreferencesDraft } from '../types';

export function getCourseSuggestion(
  offerings: readonly CourseOffering[],
  preferences: LearningPreferencesDraft,
) {
  const interests = new Set(preferences.interests.map((interest) => interest.toLowerCase()));
  if (preferences.intention === 'prayer_habit') interests.add('prayer');
  const sessionMinutes = preferences.sessionMinutes;

  return offerings
    .map((course) => {
      const matchingTopics = course.topics.filter((topic) =>
        interests.has(topic.trim().toLowerCase()),
      );
      const lessonSuggestion =
        sessionMinutes === null
          ? undefined
          : course.modules
              .flatMap((module) => module.lessons)
              .find(
                (lesson) =>
                  lesson.estimatedMinutes !== null && lesson.estimatedMinutes <= sessionMinutes,
              );
      return { course, matchingTopics, lessonSuggestion };
    })
    .sort(
      (a, b) =>
        b.matchingTopics.length - a.matchingTopics.length ||
        Number(Boolean(b.lessonSuggestion)) - Number(Boolean(a.lessonSuggestion)),
    )[0];
}
