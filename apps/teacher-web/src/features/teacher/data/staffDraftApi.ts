import { callRpc, type StaffCourseAssignment } from "../../../shared/data/supabaseClient";

export interface DraftLessonSection {
  id: string;
  title: string;
  body: string;
}

export interface DraftQuizOption {
  id: string;
  text: string;
}

export interface DraftQuizQuestion {
  id: string;
  prompt: string;
  options: DraftQuizOption[];
  correctOptionId: string | null;
  explanation: string;
}

export interface DraftLesson {
  id: string;
  title: string;
  subtitle: string;
  scripture: string;
  estimatedMinutes: number | null;
  intro: string;
  outcomes: { title: string; description: string }[];
  memoryVerse: { text: string; reference: string };
  sections: DraftLessonSection[];
  reflection: string;
  quiz: DraftQuizQuestion[];
}

export interface DraftModule {
  id: string;
  title: string;
  lessonIds: string[];
}

export interface CourseDraftAggregate {
  schemaVersion: "1";
  course: {
    title: string;
    summary: string;
    audience: string;
    topics: string[];
    learningGoals: string[];
    outcomes: string[];
    language: string;
    level: string | null;
    estimatedMinutes: number | null;
    estimateBasis: "reading" | "full_study" | null;
  };
  modules: DraftModule[];
  lessons: DraftLesson[];
}

export interface CourseDraftEnvelope {
  actor_id: string;
  course_id: string;
  draft: {
    draft_id: string;
    revision: number;
    content: CourseDraftAggregate;
    updated_at: string;
  } | null;
}

export interface SaveDraftResult {
  actor_id: string;
  course_id: string;
  request_key: string;
  saved_revision: number;
  draft: {
    draft_id: string;
    revision: number;
    content: CourseDraftAggregate;
    updated_at: string;
  };
}

export async function fetchMyAuthoringCourses(): Promise<StaffCourseAssignment[]> {
  const result = await callRpc<{ actor_id: string; courses: StaffCourseAssignment[] }>(
    "list_my_authoring_courses",
  );
  return result.courses || [];
}

export async function fetchCourseDraft(
  courseId: string,
): Promise<CourseDraftEnvelope["draft"]> {
  const result = await callRpc<CourseDraftEnvelope>("get_my_course_draft", {
    p_course_id: courseId,
  });
  return result.draft;
}

export async function saveCourseDraft(
  courseId: string,
  expectedRevision: number,
  content: CourseDraftAggregate,
  requestKey: string = crypto.randomUUID(),
): Promise<SaveDraftResult> {
  return await callRpc<SaveDraftResult>("save_my_course_draft", {
    p_course_id: courseId,
    p_expected_revision: expectedRevision,
    p_request_key: requestKey,
    p_content: content,
  });
}

export interface CourseReviewItem {
  review_id: string;
  course_id: string;
  title: string;
  revision: number;
  status: "pending" | "changes_requested" | "approved" | "published";
  submitted_by: string;
  review_notes: string | null;
  published_edition_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseReviewDetails extends CourseReviewItem {
  snapshot: CourseDraftAggregate;
}

export async function submitCourseForReview(
  courseId: string,
  expectedRevision: number,
  requestKey: string = crypto.randomUUID(),
): Promise<{ ok: boolean; review_id: string; status: string }> {
  return await callRpc<{ ok: boolean; review_id: string; status: string }>(
    "submit_course_draft_for_review",
    {
      p_course_id: courseId,
      p_expected_revision: expectedRevision,
      p_request_key: requestKey,
    },
  );
}

export async function fetchCourseReviews(): Promise<CourseReviewItem[]> {
  const result = await callRpc<{ ok: boolean; reviews: CourseReviewItem[] }>(
    "list_course_reviews",
  );
  return result.reviews || [];
}

export async function fetchCourseReview(reviewId: string): Promise<CourseReviewDetails> {
  return await callRpc<CourseReviewDetails>("get_course_review", {
    p_review_id: reviewId,
  });
}

export async function returnCourseReview(
  reviewId: string,
  notes: string,
  requestKey: string = crypto.randomUUID(),
): Promise<{ ok: boolean }> {
  return await callRpc<{ ok: boolean }>("return_course_review_for_changes", {
    p_review_id: reviewId,
    p_notes: notes,
    p_request_key: requestKey,
  });
}

export async function publishCourseReview(
  reviewId: string,
  requestKey: string = crypto.randomUUID(),
): Promise<{ ok: boolean; edition_number: number; release_id: string }> {
  return await callRpc<{ ok: boolean; edition_number: number; release_id: string }>(
    "publish_course_review",
    {
      p_review_id: reviewId,
      p_request_key: requestKey,
    },
  );
}
