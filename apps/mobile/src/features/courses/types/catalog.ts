export type CourseOutlineLesson = {
  id: string;
  title: string;
  scripture: string;
  estimatedMinutes: number | null;
};

export type CourseOutlineModule = {
  id: string;
  title: string;
  lessons: CourseOutlineLesson[];
};

export type CourseOffering = {
  courseId: string;
  releaseId: string;
  offeringRevision: number;
  slug: string;
  title: string;
  summary: string;
  topics: string[];
  learningGoals: string[];
  outcomes: string[];
  audience: string;
  language: string;
  level: string | null;
  estimatedMinutes: number | null;
  estimateBasis: 'reading' | 'full_study' | null;
  modules: CourseOutlineModule[];
  isListed: boolean;
  joinsOpen: boolean;
  isDevelopment: boolean;
};

export type CatalogState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'unconfigured' }
  | { status: 'error' };

export function courseTimeLabel(course: CourseOffering): string | null {
  if (course.estimatedMinutes === null || course.estimateBasis === null) return null;
  return course.estimateBasis === 'reading'
    ? `About ${course.estimatedMinutes} min of reading`
    : `About ${course.estimatedMinutes} min of study`;
}
