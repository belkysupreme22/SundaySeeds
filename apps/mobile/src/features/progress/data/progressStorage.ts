import { getLesson } from '../../lessons/data/lessons';

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
};

export function emptyLearning(): SavedLearning {
  return { version: 1, progress: {}, bookmarks: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
      (entry.bestScore !== null &&
        (typeof entry.bestScore !== 'number' ||
          !Number.isInteger(entry.bestScore) ||
          entry.bestScore < 0 ||
          entry.bestScore > 100))
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
  return { version: 1, progress, bookmarks };
}
