import AsyncStorage from '@react-native-async-storage/async-storage';
import { uuid } from 'expo-modules-core';
import { isCourseId } from '../../courses/data/courseCatalog';

// A recovery journal, never a source of accepted answers, scores or completion.
// Keep only request identities/selection IDs; teaching content stays on the server.
export type QuizRequest = {
  version: 1;
  startKey: string;
  attemptId: string | null;
  pending: null | { kind: 'finish' } | { kind: 'check'; questionId: string; optionId: string };
};
export class QuizRequestStorageError extends Error {
  constructor() {
    super('Quiz recovery storage is unavailable.');
  }
}
const queues = new Map<string, Promise<unknown>>();
export function quizRequestKey(userId: string, courseId: string, lessonId: string) {
  if (!isCourseId(userId) || !isCourseId(courseId) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(lessonId))
    throw new Error('Invalid quiz scope');
  return `sundayseeds.quiz-request.v1.${userId.toLowerCase()}.${courseId.toLowerCase()}.${lessonId}`;
}
function serialized<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const result = (queues.get(key) ?? Promise.resolve())
    .catch(() => undefined)
    .then(operation)
    .catch(() => {
      throw new QuizRequestStorageError();
    });
  const settled = result.then(
    () => undefined,
    () => undefined,
  );
  queues.set(key, settled);
  void settled.then(() => {
    if (queues.get(key) === settled) queues.delete(key);
  });
  return result;
}
function parse(raw: string): QuizRequest {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid quiz recovery');
  const row = value as Record<string, unknown>;
  if (
    row.version !== 1 ||
    !isCourseId(row.startKey) ||
    (row.attemptId !== null && !isCourseId(row.attemptId))
  )
    throw new Error('Invalid quiz recovery');
  if (row.pending === null)
    return {
      version: 1,
      startKey: row.startKey,
      attemptId: row.attemptId as string | null,
      pending: null,
    };
  if (!row.pending || typeof row.pending !== 'object' || Array.isArray(row.pending))
    throw new Error('Invalid quiz recovery');
  const pending = row.pending as Record<string, unknown>;
  if (pending.kind === 'finish')
    return {
      version: 1,
      startKey: row.startKey,
      attemptId: row.attemptId as string | null,
      pending: { kind: 'finish' },
    };
  if (
    pending.kind === 'check' &&
    typeof pending.questionId === 'string' &&
    pending.questionId.trim() &&
    typeof pending.optionId === 'string' &&
    pending.optionId.trim()
  )
    return {
      version: 1,
      startKey: row.startKey,
      attemptId: row.attemptId as string | null,
      pending: { kind: 'check', questionId: pending.questionId, optionId: pending.optionId },
    };
  throw new Error('Invalid quiz recovery');
}
export function readQuizRequest(key: string): Promise<QuizRequest> {
  return serialized(key, async () => {
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) return parse(raw);
    const entry: QuizRequest = { version: 1, startKey: uuid.v4(), attemptId: null, pending: null };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    return entry;
  });
}
export function writeQuizRequest(key: string, entry: QuizRequest): Promise<void> {
  return serialized(key, () => AsyncStorage.setItem(key, JSON.stringify(entry)));
}
// Only explicit retry after an acknowledged Finish can rotate the Start key.
export function replaceQuizRequest(key: string): Promise<QuizRequest> {
  return serialized(key, async () => {
    const entry: QuizRequest = { version: 1, startKey: uuid.v4(), attemptId: null, pending: null };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    return entry;
  });
}
