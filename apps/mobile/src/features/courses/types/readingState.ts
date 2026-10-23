export type CourseReadingState = {
  enrollmentId: string;
  userId: string;
  courseId: string;
  releaseId: string;
  lessonId: string;
  sectionId: string | null;
  positionRevision: number;
  isBookmarked: boolean;
  bookmarkRevision: number;
};
