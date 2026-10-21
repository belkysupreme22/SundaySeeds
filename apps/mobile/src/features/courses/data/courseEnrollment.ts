import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileActor } from '../../auth/data/profileApi';
import { isCourseId } from './courseCatalog';
import type { CourseOutlineModule } from '../types/catalog';
import type { ConnectedLesson, CourseEnrollment } from '../types/enrollment';

const knownErrors = [
  'authentication_required',
  'email_verification_required',
  'course_changed',
  'course_unavailable',
  'access_revoked',
  'lesson_unavailable',
] as const;
type RequestCode = (typeof knownErrors)[number] | 'request' | 'invalid_response';

export class CourseEnrollmentError extends Error {
  constructor(readonly code: RequestCode) {
    super('The course request could not be completed.');
  }
}

function invalid(): never {
  throw new CourseEnrollmentError('invalid_response');
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return invalid();
  return value;
}
function id(value: unknown): string {
  if (!isCourseId(value)) return invalid();
  return value.toLowerCase();
}
function positive(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) return invalid();
  return value;
}
function list<T>(value: unknown, parse: (item: unknown) => T): T[] {
  if (!Array.isArray(value) || value.length === 0) return invalid();
  return value.map(parse);
}
function outline(value: unknown): CourseOutlineModule[] {
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  return list(value, (item) => {
    const row = record(item);
    const moduleId = text(row.id);
    if (moduleIds.has(moduleId)) return invalid();
    moduleIds.add(moduleId);
    return {
      id: moduleId,
      title: text(row.title),
      lessons: list(row.lessons, (item) => {
        const lesson = record(item);
        const lessonId = text(lesson.id);
        if (lessonIds.has(lessonId)) return invalid();
        lessonIds.add(lessonId);
        return {
          id: lessonId,
          title: text(lesson.title),
          scripture: text(lesson.scripture),
          estimatedMinutes:
            lesson.estimatedMinutes == null ? null : positive(lesson.estimatedMinutes),
        };
      }),
    };
  });
}
function enrollment(value: unknown, actorId: string, courseId: string): CourseEnrollment {
  const row = record(value);
  if (
    row.user_id !== actorId ||
    id(row.course_id) !== courseId ||
    (row.state !== 'active' && row.state !== 'revoked') ||
    typeof row.available !== 'boolean' ||
    typeof row.joined_at !== 'string' ||
    !Number.isFinite(Date.parse(row.joined_at))
  )
    return invalid();
  return {
    enrollmentId: id(row.enrollment_id),
    userId: actorId,
    courseId,
    releaseId: id(row.release_id),
    state: row.state,
    joinedAt: row.joined_at,
    editionNumber: positive(row.edition_number),
    available: row.available,
    title: text(row.title),
    modules: outline(row.modules),
  };
}
function requestFailure(error: { message: string }): never {
  const code = knownErrors.find((code) => code === error.message) ?? 'request';
  throw new CourseEnrollmentError(code);
}

export function enrollmentMessage(error: unknown): string {
  const code = error instanceof CourseEnrollmentError ? error.code : 'request';
  switch (code) {
    case 'authentication_required':
      return 'Your session could not be confirmed. Sign in again to continue.';
    case 'email_verification_required':
      return 'Verify your email before joining or opening this course.';
    case 'course_changed':
      return 'This course changed. Refresh its details, then choose Join again.';
    case 'course_unavailable':
      return 'This course is unavailable right now. Return to the library or try again later.';
    case 'access_revoked':
      return 'Your access to this course is no longer active.';
    case 'lesson_unavailable':
      return 'This lesson is unavailable for your course edition.';
    default:
      return 'We could not load your course access. Check your connection and try again.';
  }
}

export async function loadOwnEnrollment(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
) {
  if (!isCourseId(courseId)) return invalid();
  const { data, error } = await client
    .rpc('get_my_course_enrollment', { p_course_id: courseId })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`);
  if (error) return requestFailure(error);
  return data === null ? null : enrollment(data, actor.userId, courseId.toLowerCase());
}

export async function joinCourse(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  revision: number,
) {
  if (!isCourseId(courseId)) return invalid();
  positive(revision);
  const { data, error } = await client
    .rpc('join_course', {
      p_course_id: courseId,
      p_offering_revision: revision,
    })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`);
  if (error) return requestFailure(error);
  const row = record(data);
  if (row.outcome !== 'joined' && row.outcome !== 'already_joined') return invalid();
  const result = enrollment(row.enrollment, actor.userId, courseId.toLowerCase());
  if (result.state !== 'active') return invalid();
  return result;
}

export async function loadConnectedLesson(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
): Promise<ConnectedLesson> {
  if (!isCourseId(courseId) || !lessonId.trim()) return invalid();
  const { data, error } = await client
    .rpc('get_enrolled_course_lesson', {
      p_course_id: courseId,
      p_lesson_id: lessonId,
    })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`);
  if (error) return requestFailure(error);
  const row = record(data);
  if (row.user_id !== actor.userId || id(row.course_id) !== courseId.toLowerCase())
    return invalid();
  const lesson = record(row.lesson);
  if (lesson.id !== lessonId) return invalid();
  const verse = record(lesson.memoryVerse);
  const sections = list(lesson.sections, (item) => {
    const section = record(item);
    return { id: text(section.id), title: text(section.title), body: text(section.body) };
  });
  if (new Set(sections.map((section) => section.id)).size !== sections.length) return invalid();
  return {
    enrollmentId: id(row.enrollment_id),
    userId: actor.userId,
    courseId: courseId.toLowerCase(),
    releaseId: id(row.release_id),
    lesson: {
      id: lessonId,
      title: text(lesson.title),
      subtitle: text(lesson.subtitle),
      scripture: text(lesson.scripture),
      estimatedMinutes: positive(lesson.estimatedMinutes),
      intro: text(lesson.intro),
      outcomes: list(lesson.outcomes, (item) => {
        const outcome = record(item);
        return { title: text(outcome.title), description: text(outcome.description) };
      }),
      memoryVerse: { text: text(verse.text), reference: text(verse.reference) },
      sections,
    },
  };
}
