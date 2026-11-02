import { router } from 'expo-router';
import { useEffect } from 'react';
import { useCourseJourney } from '../hooks/useCourseJourney';
import { Screen } from '../../../shared/ui/Screen';
import { LoadingState } from '../../../shared/ui/LoadingState';

export function CourseScreen() {
  const { courseId } = useCourseJourney();

  useEffect(() => {
    if (courseId) {
      router.replace({ pathname: '/courses/[id]', params: { id: courseId } });
    }
  }, [courseId]);

  return (
    <Screen tabs>
      <LoadingState label="Loading course…" />
    </Screen>
  );
}
