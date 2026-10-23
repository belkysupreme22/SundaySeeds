import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileActor } from '../../auth/data/profileApi';
import { isCourseId } from '../../courses/data/courseCatalog';
import type {
  ConnectedQuizAttempt,
  ConnectedQuizQuestion,
  CourseQuizProgress,
  QuizFeedback,
  QuizFinish,
  QuizReceipt,
} from '../types/connectedQuiz';

const knownErrors = [
  'authentication_required',
  'email_verification_required',
  'access_revoked',
  'quiz_unavailable',
  'quiz_attempt_unavailable',
  'invalid_quiz_request',
  'start_key_conflict',
  'quiz_answer_locked',
  'quiz_selection_invalid',
  'quiz_incomplete',
] as const;
type RequestCode = (typeof knownErrors)[number] | 'request' | 'invalid_response';

export class ConnectedQuizError extends Error {
  constructor(readonly code: RequestCode) {
    super('The knowledge check request could not be completed.');
  }
}

function invalid(): never {
  throw new ConnectedQuizError('invalid_response');
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return invalid();
  return value;
}
function uuid(value: unknown): string {
  if (!isCourseId(value)) return invalid();
  return value.toLowerCase();
}
function count(value: unknown, minimum = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum)
    return invalid();
  return value;
}
function score(value: unknown): number {
  const result = count(value);
  return result <= 100 ? result : invalid();
}
function boolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : invalid();
}
function list<T>(value: unknown, parse: (item: unknown) => T): T[] {
  if (!Array.isArray(value) || !value.length) return invalid();
  return value.map(parse);
}
function unique(ids: string[]): void {
  if (new Set(ids).size !== ids.length) invalid();
}
function feedback(value: unknown): QuizFeedback {
  const row = record(value);
  const result = {
    optionId: text(row.option_id),
    correctOptionId: text(row.correct_option_id),
    isCorrect: boolean(row.is_correct),
    explanation: text(row.explanation),
  };
  if (result.isCorrect !== (result.optionId === result.correctOptionId)) return invalid();
  return result;
}
function question(value: unknown): ConnectedQuizQuestion {
  const row = record(value);
  const options = list(row.options, (value) => {
    const option = record(value);
    return { id: text(option.id), text: text(option.text) };
  });
  unique(options.map((option) => option.id));
  if (options.length < 2) return invalid();
  const checkedAnswer = row.checked_answer === null ? null : feedback(row.checked_answer);
  if (
    checkedAnswer &&
    (!options.some((option) => option.id === checkedAnswer.optionId) ||
      !options.some((option) => option.id === checkedAnswer.correctOptionId))
  )
    return invalid();
  return { id: text(row.id), prompt: text(row.prompt), options, checkedAnswer };
}
function receipt(value: unknown): QuizReceipt {
  const row = record(value);
  const correctCount = count(row.correct_count);
  const questionCount = count(row.question_count, 1);
  const scorePercent = score(row.score_percent);
  if (
    correctCount > questionCount ||
    // Validate the acknowledged score; never produce an outcome from local selections.
    scorePercent !== Math.round((100 * correctCount) / questionCount) ||
    typeof row.finished_at !== 'string' ||
    !Number.isFinite(Date.parse(row.finished_at))
  )
    return invalid();
  return {
    attemptId: uuid(row.attempt_id),
    courseId: uuid(row.course_id),
    releaseId: uuid(row.release_id),
    lessonId: text(row.lesson_id),
    correctCount,
    questionCount,
    scorePercent,
    finishedAt: row.finished_at,
  };
}
function attempt(value: unknown): ConnectedQuizAttempt {
  const row = record(value);
  const result: ConnectedQuizAttempt = {
    attemptId: uuid(row.attempt_id),
    courseId: uuid(row.course_id),
    releaseId: uuid(row.release_id),
    lessonId: text(row.lesson_id),
    assessmentId: text(row.assessment_id),
    questions: list(row.questions, question),
    receipt: row.receipt === null ? null : receipt(row.receipt),
  };
  unique(result.questions.map((item) => item.id));
  if (result.receipt) {
    const saved = result.receipt;
    if (
      saved.attemptId !== result.attemptId ||
      saved.courseId !== result.courseId ||
      saved.releaseId !== result.releaseId ||
      saved.lessonId !== result.lessonId ||
      saved.questionCount !== result.questions.length ||
      result.questions.some((item) => item.checkedAnswer === null) ||
      saved.correctCount !== result.questions.filter((item) => item.checkedAnswer?.isCorrect).length
    )
      return invalid();
  }
  return result;
}
function progress(value: unknown, courseId: string): CourseQuizProgress {
  const row = record(value);
  const result: CourseQuizProgress = {
    courseId: uuid(row.course_id),
    releaseId: uuid(row.release_id),
    available: boolean(row.available),
    assessmentAvailable: boolean(row.assessment_available),
    requiredCount: null,
    completedCount: null,
    completed: null,
    lessons: null,
  };
  if (result.courseId !== courseId || (!result.available && result.assessmentAvailable))
    return invalid();
  if (!result.available || !result.assessmentAvailable) {
    if (
      row.required_count !== null ||
      row.completed_count !== null ||
      row.completed !== null ||
      row.lessons !== null
    )
      return invalid();
    return result;
  }
  const lessons = list(row.lessons, (value) => {
    const lesson = record(value);
    const completed = boolean(lesson.completed);
    const bestScorePercent =
      lesson.best_score_percent === null ? null : score(lesson.best_score_percent);
    if (completed !== (bestScorePercent !== null)) return invalid();
    return { lessonId: text(lesson.lesson_id), completed, bestScorePercent };
  });
  unique(lessons.map((lesson) => lesson.lessonId));
  const requiredCount = count(row.required_count, 1);
  const completedCount = count(row.completed_count);
  const completed = boolean(row.completed);
  if (
    requiredCount !== lessons.length ||
    completedCount !== lessons.filter((lesson) => lesson.completed).length ||
    completed !== (completedCount === requiredCount)
  )
    return invalid();
  return { ...result, requiredCount, completedCount, completed, lessons };
}

async function request(
  client: SupabaseClient,
  actor: ProfileActor,
  rpc: string,
  parameters: Record<string, string>,
): Promise<unknown> {
  try {
    // Keep the initiating account's token pinned even if the active account changes.
    const { data, error } = await client
      .rpc(rpc, parameters)
      .setHeader('Authorization', `Bearer ${actor.accessToken}`);
    if (error) {
      const code = knownErrors.find((code) => code === error.message) ?? 'request';
      throw new ConnectedQuizError(code);
    }
    return data;
  } catch (error) {
    if (error instanceof ConnectedQuizError) throw error;
    throw new ConnectedQuizError('request');
  }
}

export function isUncertainQuizError(error: unknown): boolean {
  return (
    !(error instanceof ConnectedQuizError) ||
    error.code === 'request' ||
    error.code === 'invalid_response'
  );
}

export function connectedQuizMessage(error: unknown): string {
  const code = error instanceof ConnectedQuizError ? error.code : 'request';
  switch (code) {
    case 'authentication_required':
      return 'Your session could not be confirmed. Sign in again to continue.';
    case 'email_verification_required':
      return 'Verify your email before starting a knowledge check.';
    case 'access_revoked':
      return 'Your access to this course is no longer active.';
    case 'quiz_unavailable':
    case 'quiz_attempt_unavailable':
      return 'This knowledge check is unavailable. Return to the course and try again later.';
    case 'quiz_answer_locked':
      return 'An answer has already been checked. Reload this attempt to continue.';
    case 'quiz_incomplete':
      return 'Check every answer before finishing this knowledge check.';
    case 'start_key_conflict':
    case 'invalid_quiz_request':
    case 'quiz_selection_invalid':
      return 'This request could not be accepted. Return to the course and reopen the knowledge check.';
    default:
      return 'We could not confirm this request. Check your connection and retry to recover your saved attempt.';
  }
}

export async function startConnectedQuiz(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
  lessonId: string,
  startKey: string,
): Promise<ConnectedQuizAttempt> {
  const requestedCourse = uuid(courseId);
  text(lessonId);
  uuid(startKey);
  const result = attempt(
    await request(client, actor, 'start_course_quiz', {
      p_course_id: courseId,
      p_lesson_id: lessonId,
      p_start_key: startKey,
    }),
  );
  if (result.courseId !== requestedCourse || result.lessonId !== lessonId) return invalid();
  return result;
}

export async function loadConnectedQuizAttempt(
  client: SupabaseClient,
  actor: ProfileActor,
  attemptId: string,
): Promise<ConnectedQuizAttempt> {
  const requestedAttempt = uuid(attemptId);
  const result = attempt(
    await request(client, actor, 'get_course_quiz_attempt', { p_attempt_id: attemptId }),
  );
  if (result.attemptId !== requestedAttempt) return invalid();
  return result;
}

export async function checkConnectedQuizAnswer(
  client: SupabaseClient,
  actor: ProfileActor,
  attemptId: string,
  questionId: string,
  optionId: string,
): Promise<QuizFeedback> {
  const requestedAttempt = uuid(attemptId);
  text(questionId);
  text(optionId);
  const row = record(
    await request(client, actor, 'check_course_quiz_answer', {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_option_id: optionId,
    }),
  );
  const result = feedback(row);
  if (
    uuid(row.attempt_id) !== requestedAttempt ||
    row.question_id !== questionId ||
    result.optionId !== optionId
  )
    return invalid();
  return result;
}

export async function finishConnectedQuiz(
  client: SupabaseClient,
  actor: ProfileActor,
  attemptId: string,
): Promise<QuizFinish> {
  const requestedAttempt = uuid(attemptId);
  const row = record(
    await request(client, actor, 'finish_course_quiz', { p_attempt_id: attemptId }),
  );
  const result = { receipt: receipt(row.receipt), bestScorePercent: score(row.best_score_percent) };
  if (
    result.receipt.attemptId !== requestedAttempt ||
    result.bestScorePercent < result.receipt.scorePercent
  )
    return invalid();
  return result;
}

export async function loadCourseQuizProgress(
  client: SupabaseClient,
  actor: ProfileActor,
  courseId: string,
): Promise<CourseQuizProgress | null> {
  const requestedCourse = uuid(courseId);
  const value = await request(client, actor, 'get_my_course_quiz_progress', {
    p_course_id: courseId,
  });
  return value === null ? null : progress(value, requestedCourse);
}
