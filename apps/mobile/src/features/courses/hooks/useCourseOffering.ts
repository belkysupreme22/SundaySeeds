import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { CourseCatalogError, getCourseOffering } from '../data/courseCatalog';
import type { CatalogState, CourseOffering } from '../types/catalog';

export function useCourseOffering(courseId: string) {
  const [result, setResult] = useState<{
    courseId: string;
    state: CatalogState<CourseOffering | null>;
  }>({ courseId, state: { status: 'loading' } });
  const [request, setRequest] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setResult({ courseId, state: { status: 'loading' } });
      void getCourseOffering(courseId).then(
        (data) => {
          if (active) setResult({ courseId, state: { status: 'ready', data } });
        },
        (error: unknown) => {
          if (active)
            setResult({
              courseId,
              state: {
                status:
                  error instanceof CourseCatalogError && error.kind === 'unconfigured'
                    ? 'unconfigured'
                    : 'error',
              },
            });
        },
      );
      return () => {
        active = false;
      };
    }, [courseId, request]),
  );
  const state: CatalogState<CourseOffering | null> =
    result.courseId === courseId ? result.state : { status: 'loading' };
  return { state, reload: () => setRequest((current) => current + 1) };
}
