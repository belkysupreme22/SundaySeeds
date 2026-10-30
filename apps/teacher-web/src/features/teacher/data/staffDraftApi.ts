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

// ============================================================================
// Staff Administration (Admin Only)
// ============================================================================

export interface StaffMemberItem {
  user_id: string;
  email: string;
  created_at: string;
  roles: ("admin" | "teacher")[];
  assigned_courses: {
    course_id: string;
    state: "active" | "revoked";
    title: string;
  }[];
}

export async function fetchStaffMembers(): Promise<StaffMemberItem[]> {
  return await callRpc<StaffMemberItem[]>("list_staff_members");
}

export async function updateStaffRole(
  email: string,
  role: "admin" | "teacher",
  active: boolean,
): Promise<{ ok: boolean; target_user_id: string; role: string; active: boolean }> {
  return await callRpc<{ ok: boolean; target_user_id: string; role: string; active: boolean }>(
    "set_staff_role",
    {
      p_target_email: email,
      p_role: role,
      p_active: active,
    },
  );
}

export async function updateCourseAuthorAssignment(
  email: string,
  courseId: string,
  active: boolean,
): Promise<{ ok: boolean; target_user_id: string; course_id: string; active: boolean }> {
  return await callRpc<{ ok: boolean; target_user_id: string; course_id: string; active: boolean }>(
    "set_course_author_assignment",
    {
      p_target_email: email,
      p_course_id: courseId,
      p_active: active,
    },
  );
}

// ============================================================================
// Classes & Memberships (S5)
// ============================================================================

export interface TeachingClassSummary {
  id: string;
  name: string;
  description: string;
  meeting: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  courseIds: string[];
  memberCount: number;
  invitationCount: number;
}

export interface ClassMember {
  id: string;
  name: string;
  email: string;
  status: "active" | "removed";
  joined_at: string;
}

export interface ClassInvitation {
  id: string;
  name: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  created_at: string;
  expires_at: string;
}

export interface ClassPeopleData {
  class_id: string;
  members: ClassMember[];
  invitations: ClassInvitation[];
}

export interface ClassCourseLearningStat {
  course_id: string;
  title: string;
  active_learners: number;
  completed_lessons: number;
  average_quiz_score: number;
  quizzes_taken: number;
}

export interface ClassLearningSummary {
  class_id: string;
  class_name: string;
  member_count: number;
  courses: ClassCourseLearningStat[];
}

export async function fetchMyTeachingClasses(): Promise<TeachingClassSummary[]> {
  return await callRpc<TeachingClassSummary[]>("list_my_teaching_classes");
}

export async function saveTeachingClassApi(
  classId: string | null,
  name: string,
  description: string,
  meeting: string,
  archived: boolean,
  courseIds: string[] = [],
): Promise<{ ok: boolean; class_id: string }> {
  return await callRpc<{ ok: boolean; class_id: string }>("save_teaching_class", {
    p_class_id: classId,
    p_name: name,
    p_description: description,
    p_meeting: meeting,
    p_archived: archived,
    p_course_ids: courseIds,
  });
}

export async function fetchClassPeople(classId: string): Promise<ClassPeopleData> {
  return await callRpc<ClassPeopleData>("get_class_people", {
    p_class_id: classId,
  });
}

export async function inviteClassMemberApi(
  classId: string,
  name: string,
  email: string,
): Promise<{ ok: boolean; invitation_id: string; token: string; email: string }> {
  return await callRpc<{ ok: boolean; invitation_id: string; token: string; email: string }>(
    "invite_class_member",
    {
      p_class_id: classId,
      p_name: name,
      p_email: email,
    },
  );
}

export async function revokeClassInvitationApi(invitationId: string): Promise<{ ok: boolean }> {
  return await callRpc<{ ok: boolean }>("revoke_class_invitation", {
    p_invitation_id: invitationId,
  });
}

export async function updateClassMemberStatusApi(
  classId: string,
  userId: string,
  status: "active" | "removed",
): Promise<{ ok: boolean }> {
  return await callRpc<{ ok: boolean }>("update_class_member_status", {
    p_class_id: classId,
    p_target_user_id: userId,
    p_status: status,
  });
}

export async function fetchClassLearningSummary(classId: string): Promise<ClassLearningSummary> {
  return await callRpc<ClassLearningSummary>("get_class_learning_summary", {
    p_class_id: classId,
  });
}
