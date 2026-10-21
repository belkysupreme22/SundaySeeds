import type { CourseOutlineModule } from './catalog';

export type CourseEnrollment = {
  enrollmentId: string;
  userId: string;
  courseId: string;
  releaseId: string;
  state: 'active' | 'revoked';
  joinedAt: string;
  editionNumber: number;
  available: boolean;
  title: string;
  modules: CourseOutlineModule[];
};

export type ConnectedLesson = {
  enrollmentId: string;
  userId: string;
  courseId: string;
  releaseId: string;
  lesson: {
    id: string;
    title: string;
    subtitle: string;
    scripture: string;
    estimatedMinutes: number;
    intro: string;
    outcomes: { title: string; description: string }[];
    memoryVerse: { text: string; reference: string };
    sections: { id: string; title: string; body: string }[];
  };
};

export type EnrollmentState =
  | { status: 'loading' | 'joining' | 'signed_out' | 'unverified' }
  | { status: 'ready'; enrollment: CourseEnrollment | null }
  | { status: 'error' | 'uncertain' | 'changed'; message: string };

export type ConnectedLessonState =
  | { status: 'loading' | 'signed_out' | 'unverified' }
  | { status: 'ready'; data: ConnectedLesson }
  | { status: 'error'; message: string };
