import { getLesson } from '../../lessons/data/lessons';
import {
  emptyStudyActivity,
  recentQuizLimit,
  type RecentStudyQuiz,
  type StudyActivity,
} from './studyActivity';

export const PROGRESS_STORAGE_KEY = 'sundayseeds.learning.v1';

export type LessonProgress = {
  sectionIndex: number;
  completed: boolean;
  bestScore: number | null;
};

export type SavedLearning = {
  version: 1;
  progress: Record<string, LessonProgress>;
  bookmarks: string[];
  activity: StudyActivity;
};

export function emptyLearning(): SavedLearning {
  return { version: 1, progress: {}, bookmarks: [], activity: emptyStudyActivity() };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDay(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Math.abs(value) <= 100_000_000;
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isRecentStudyQuiz(value: unknown): value is RecentStudyQuiz {
  return (
    isRecord(value) &&
    isId(value.lessonId) &&
    isDay(value.day) &&
    typeof value.finishedAt === 'number' &&
    Number.isInteger(value.finishedAt) &&
    Math.abs(value.finishedAt) <= 8_640_000_000_000_000 &&
    isScore(value.score) &&
    typeof value.retake === 'boolean' &&
    typeof value.improved === 'boolean' &&
    (!value.improved || value.retake)
  );
}

function parseStudyActivity(value: unknown): StudyActivity {
  // Earlier snapshots have no record of which days quizzes were completed.
  if (value === undefined) return emptyStudyActivity();
  if (
    !isRecord(value) ||
    !Array.isArray(value.days) ||
    !value.days.every(isDay) ||
    !isRecord(value.firstDayByLesson) ||
    !Object.values(value.firstDayByLesson).every(isDay) ||
    !Array.isArray(value.reviewedLessonIds) ||
    !value.reviewedLessonIds.every(isId) ||
    !Array.isArray(value.improvedLessonIds) ||
    !value.improvedLessonIds.every(isId)
  ) {
    throw new Error('Saved study activity could not be read.');
  }

  const best = value.personalBest;
  if (
    best !== null &&
    (!isRecord(best) ||
      !isId(best.lessonId) ||
      !isScore(best.previousScore) ||
      !isScore(best.score) ||
      best.score <= best.previousScore)
  ) {
    throw new Error('Saved personal best could not be read.');
  }

  const recentQuizzes = value.recentQuizzes;
  if (
    recentQuizzes !== undefined &&
    (!Array.isArray(recentQuizzes) || !recentQuizzes.every(isRecentStudyQuiz))
  ) {
    throw new Error('Saved recent study activity could not be read.');
  }

  return {
    days: [...new Set(value.days)],
    firstDayByLesson: value.firstDayByLesson as Record<string, number>,
    reviewedLessonIds: [...new Set(value.reviewedLessonIds)],
    improvedLessonIds: [...new Set(value.improvedLessonIds)],
    personalBest:
      best === null
        ? null
        : { lessonId: best.lessonId, previousScore: best.previousScore, score: best.score },
    recentQuizzes: recentQuizzes?.slice(0, recentQuizLimit) ?? [],
  };
}

export function parseSavedLearning(raw: string | null): SavedLearning {
  if (raw === null) return emptyLearning();
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.progress) ||
    !Array.isArray(value.bookmarks)
  ) {
    throw new Error('Saved learning data has an unsupported format.');
  }

  const progress: Record<string, LessonProgress> = {};
  for (const [id, entry] of Object.entries(value.progress)) {
    const lesson = getLesson(id);
    // Removed lessons should not prevent someone opening their remaining progress.
    if (!lesson) continue;
    if (
      !isRecord(entry) ||
      typeof entry.sectionIndex !== 'number' ||
      !Number.isInteger(entry.sectionIndex) ||
      entry.sectionIndex < 0 ||
      entry.sectionIndex >= lesson.sections.length ||
      typeof entry.completed !== 'boolean' ||
      (entry.bestScore !== null && !isScore(entry.bestScore))
    ) {
      throw new Error('Saved lesson progress could not be read.');
    }
    progress[id] = {
      sectionIndex: entry.sectionIndex,
      completed: entry.completed,
      bestScore: entry.bestScore as number | null,
    };
  }

  if (!value.bookmarks.every((id: unknown) => typeof id === 'string')) {
    throw new Error('Saved bookmarks could not be read.');
  }
  const bookmarks = [...new Set(value.bookmarks as string[])].filter((id) => getLesson(id));
  return { version: 1, progress, bookmarks, activity: parseStudyActivity(value.activity) };
}
