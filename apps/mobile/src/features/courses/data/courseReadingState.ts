import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileActor } from '../../auth/data/profileApi';
import type { ConnectedLesson } from '../types/enrollment';
import type { CourseReadingState } from '../types/readingState';
import { isCourseId } from './courseCatalog';

const knownErrors = [
  'authentication_required',
  'email_verification_required',
  'access_revoked',
  'invalid_reading_request',
  'reading_unavailable',
  'reading_state_conflict',
] as const;
type RequestCode = (typeof knownErrors)[number] | 'request' | 'invalid_response';

export class CourseReadingStateError extends Error {
  constructor(readonly code: RequestCode) {
    super('The reading request could not be completed.');
  }
}

function invalid(): never {
  throw new CourseReadingStateError('invalid_response');
}
function invalidRequest(): never {
  throw new CourseReadingStateError('invalid_reading_request');
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function uuid(value: unknown): string {
  return isCourseId(value) ? value.toLowerCase() : invalid();
}
function text(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : invalid();
}
function revision(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : invalid();
}

function requestScope(
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  connectedLesson?: ConnectedLesson,
): void {
  if (!isCourseId(actor.userId) || !isCourseId(courseId) || !lessonId.trim()) invalidRequest();
  if (
    connectedLesson &&
    (connectedLesson.userId.toLowerCase() !== actor.userId.toLowerCase() ||
      connectedLesson.courseId !== courseId.toLowerCase() ||
      connectedLesson.lesson.id !== lessonId)
  )
    invalidRequest();
}
function expectedRevision(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) invalidRequest();
}

function readingState(
  value: unknown,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
): CourseReadingState {
  const row = record(value);
  const result: CourseReadingState = {
    enrollmentId: uuid(row.enrollment_id),
    userId: uuid(row.user_id),
    courseId: uuid(row.course_id),
    releaseId: uuid(row.release_id),
    lessonId: text(row.lesson_id),
    sectionId: row.section_id === null ? null : text(row.section_id),
    positionRevision: revision(row.position_revision),
    isBookmarked: typeof row.is_bookmarked === 'boolean' ? row.is_bookmarked : invalid(),
    bookmarkRevision: revision(row.bookmark_revision),
  };
  if (
    result.userId !== actor.userId.toLowerCase() ||
    result.courseId !== courseId.toLowerCase() ||
    result.lessonId !== lessonId ||
    (result.sectionId === null) !== (result.positionRevision === 0) ||
    (result.isBookmarked && result.bookmarkRevision === 0)
  )
    return invalid();
  return result;
}

// Bind the acknowledged state to the exact accessible edition and its section IDs.
// Reading positions and bookmarks do not imply lesson or course completion.
export function validateReadingStateForLesson(
  state: CourseReadingState,
  connectedLesson: ConnectedLesson,
): CourseReadingState {
  if (
    state.enrollmentId !== connectedLesson.enrollmentId ||
    state.userId !== connectedLesson.userId.toLowerCase() ||
    state.courseId !== connectedLesson.courseId ||
    state.releaseId !== connectedLesson.releaseId ||
    state.lessonId !== connectedLesson.lesson.id ||
    (state.sectionId !== null &&
      !connectedLesson.lesson.sections.some((section) => section.id === state.sectionId))
  )
    return invalid();
  return state;
}

async function request(
  client: SupabaseClient,
  actor: ProfileActor,
  rpc: string,
  parameters: Record<string, string | number | boolean>,
): Promise<unknown> {
  try {
    // Pin the initiating account's token even if the active account changes later.
    const { data, error } = await client
      .rpc(rpc, parameters)
      .setHeader('Authorization', `Bearer ${actor.accessToken}`);
    if (error) {
      const code = knownErrors.find((code) => code === error.message) ?? 'request';
      throw new CourseReadingStateError(code);
    }
    return data;
  } catch (error) {
    if (error instanceof CourseReadingStateError) throw error;
    throw new CourseReadingStateError('request');
  }
}

function scopedState(
  value: unknown,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  connectedLesson?: ConnectedLesson,
): CourseReadingState {
  const state = readingState(value, actor, courseId, lessonId);
  return connectedLesson ? validateReadingStateForLesson(state, connectedLesson) : state;
}

export function isUncertainReadingStateError(error: unknown): boolean {
  return (
    !(error instanceof CourseReadingStateError) ||
    error.code === 'request' ||
    error.code === 'invalid_response'
  );
}

export function courseReadingStateMessage(error: unknown): string {
  const code = error instanceof CourseReadingStateError ? error.code : 'request';
  switch (code) {
    case 'authentication_required':
      return 'Your session could not be confirmed. Sign in again to continue.';
    case 'email_verification_required':
      return 'Verify your email before saving reading positions or bookmarks.';
    case 'access_revoked':
      return 'Your access to this course is no longer active.';
    case 'reading_unavailable':
      return 'Saved reading is unavailable for this lesson. Return to the course or try again later.';
    case 'reading_state_conflict':
      return 'Your saved reading changed elsewhere. Reload it before making another change.';
    case 'invalid_reading_request':
      return 'This reading request could not be accepted. Reopen the lesson and try again.';
    default:
      return 'We could not confirm your saved reading. Check your connection and reload before trying again.';
  }
}

export async function loadCourseReadingState(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  connectedLesson?: ConnectedLesson,
): Promise<CourseReadingState> {
  requestScope(actor, courseId, lessonId, connectedLesson);
  const value = await request(client, actor, 'get_my_course_reading_state', {
    p_course_id: courseId,
    p_lesson_id: lessonId,
  });
  return scopedState(value, actor, courseId, lessonId, connectedLesson);
}

export async function saveCourseReadingPosition(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  sectionId: string,
  positionRevision: number,
  connectedLesson?: ConnectedLesson,
): Promise<CourseReadingState> {
  requestScope(actor, courseId, lessonId, connectedLesson);
  expectedRevision(positionRevision);
  if (
    !sectionId.trim() ||
    (connectedLesson &&
      !connectedLesson.lesson.sections.some((section) => section.id === sectionId))
  )
    return invalidRequest();
  const state = scopedState(
    await request(client, actor, 'save_course_reading_position', {
      p_course_id: courseId,
      p_lesson_id: lessonId,
      p_section_id: sectionId,
      p_expected_revision: positionRevision,
    }),
    actor,
    courseId,
    lessonId,
    connectedLesson,
  );
  return state.sectionId === sectionId ? state : invalid();
}

export async function setCourseLessonBookmark(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  isBookmarked: boolean,
  bookmarkRevision: number,
  connectedLesson?: ConnectedLesson,
): Promise<CourseReadingState> {
  requestScope(actor, courseId, lessonId, connectedLesson);
  expectedRevision(bookmarkRevision);
  if (typeof isBookmarked !== 'boolean') return invalidRequest();
  const state = scopedState(
    await request(client, actor, 'set_course_lesson_bookmark', {
      p_course_id: courseId,
      p_lesson_id: lessonId,
      p_is_bookmarked: isBookmarked,
      p_expected_revision: bookmarkRevision,
    }),
    actor,
    courseId,
    lessonId,
    connectedLesson,
  );
  return state.isBookmarked === isBookmarked ? state : invalid();
}
