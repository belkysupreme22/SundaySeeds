import { getSupabaseClient } from '../../../shared/data/supabase';
import type { CourseOffering, CourseOutlineModule } from '../types/catalog';

export class CourseCatalogError extends Error {
  constructor(readonly kind: 'unconfigured' | 'request' | 'invalid_response') {
    super('The course library could not be loaded.');
  }
}

export function isCourseId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)
  );
}

function invalid(): never {
  throw new CourseCatalogError('invalid_response');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return invalid();
  return value;
}

function texts(value: unknown): string[] {
  if (!Array.isArray(value)) return invalid();
  return value.map(text);
}

function minutes(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) return invalid();
  return value;
}

function outline(value: unknown): CourseOutlineModule[] {
  if (!Array.isArray(value) || value.length === 0) return invalid();
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  return value.map((item) => {
    const row = record(item);
    const id = text(row.id);
    if (moduleIds.has(id) || !Array.isArray(row.lessons) || row.lessons.length === 0)
      return invalid();
    moduleIds.add(id);
    return {
      id,
      title: text(row.title),
      lessons: row.lessons.map((item: unknown) => {
        const lesson = record(item);
        const lessonId = text(lesson.id);
        if (lessonIds.has(lessonId)) return invalid();
        lessonIds.add(lessonId);
        return {
          id: lessonId,
          title: text(lesson.title),
          scripture: text(lesson.scripture),
          estimatedMinutes: minutes(lesson.estimatedMinutes ?? null),
        };
      }),
    };
  });
}

function parseOffering(value: unknown): CourseOffering {
  const row = record(value);
  if (
    !isCourseId(row.course_id) ||
    !isCourseId(row.release_id) ||
    typeof row.offering_revision !== 'number' ||
    !Number.isSafeInteger(row.offering_revision) ||
    row.offering_revision < 1 ||
    typeof row.is_listed !== 'boolean' ||
    typeof row.joins_open !== 'boolean' ||
    typeof row.is_development !== 'boolean' ||
    row.is_available !== true ||
    !(
      row.estimate_basis === null ||
      row.estimate_basis === 'reading' ||
      row.estimate_basis === 'full_study'
    )
  )
    return invalid();
  const estimatedMinutes = minutes(row.estimated_minutes);
  if ((estimatedMinutes === null) !== (row.estimate_basis === null)) return invalid();
  return {
    courseId: row.course_id.toLowerCase(),
    releaseId: row.release_id.toLowerCase(),
    offeringRevision: row.offering_revision,
    slug: text(row.slug),
    title: text(row.title),
    summary: text(row.summary),
    topics: texts(row.topics),
    learningGoals: texts(row.learning_goals),
    outcomes: texts(row.outcomes),
    audience: text(row.audience),
    language: text(row.language),
    level: row.level === null ? null : text(row.level),
    estimatedMinutes,
    estimateBasis: row.estimate_basis,
    modules: outline(row.modules),
    isListed: row.is_listed,
    joinsOpen: row.joins_open,
    isDevelopment: row.is_development,
  };
}

function parseOfferings(value: unknown): CourseOffering[] {
  if (!Array.isArray(value)) return invalid();
  const rows = value.map(parseOffering);
  if (new Set(rows.map((row) => row.courseId)).size !== rows.length) return invalid();
  return rows;
}

export async function listCourseOfferings(): Promise<CourseOffering[]> {
  const client = getSupabaseClient();
  if (!client) throw new CourseCatalogError('unconfigured');
  const { data, error } = await client.rpc('list_course_offerings');
  if (error) throw new CourseCatalogError('request');
  const courses = parseOfferings(data);
  if (courses.some((course) => !course.isListed)) return invalid();
  return courses;
}

export async function getCourseOffering(courseId: string): Promise<CourseOffering | null> {
  if (!isCourseId(courseId)) return null;
  const normalizedId = courseId.toLowerCase();
  const client = getSupabaseClient();
  if (!client) throw new CourseCatalogError('unconfigured');
  const { data, error } = await client.rpc('get_course_offering', { p_course_id: normalizedId });
  if (error) throw new CourseCatalogError('request');
  const rows = parseOfferings(data);
  if (rows.length > 1 || rows.some((row) => row.courseId !== normalizedId)) return invalid();
  return rows[0] ?? null;
}
