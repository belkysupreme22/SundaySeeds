import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { CourseCatalogError, listCourseOfferings } from '../data/courseCatalog';
import type { CatalogState, CourseOffering } from '../types/catalog';

export function useCourseCatalog() {
  const [state, setState] = useState<CatalogState<CourseOffering[]>>({ status: 'loading' });
  const [request, setRequest] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setState({ status: 'loading' });
      void listCourseOfferings().then(
        (data) => {
          if (active) setState({ status: 'ready', data });
        },
        (error: unknown) => {
          if (active)
            setState({
              status:
                error instanceof CourseCatalogError && error.kind === 'unconfigured'
                  ? 'unconfigured'
                  : 'error',
            });
        },
      );
      return () => {
        active = false;
      };
    }, [request]),
  );
  return { state, reload: () => setRequest((current) => current + 1) };
}
