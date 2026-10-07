import { getLesson } from '../../lessons/data/lessons';
import {
  emptyLearning,
  parseSavedLearning,
  PROGRESS_STORAGE_KEY,
  type LessonProgress,
  type SavedLearning,
} from './progressStorage';

export type LearningSnapshot = {
  hydrated: boolean;
  error: string | null;
  progress: Record<string, LessonProgress>;
  bookmarks: string[];
};

type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
};

const defaultProgress = (): LessonProgress => ({
  sectionIndex: 0,
  completed: false,
  bestScore: null,
});

/** One store per provider: keeps persistence out of screens and serializes local writes. */
export function createLearningStore(storage: Storage) {
  let saved = emptyLearning();
  let snapshot: LearningSnapshot = { hydrated: false, error: null, progress: {}, bookmarks: [] };
  let writable = false;
  let hydration: Promise<void> | undefined;
  let writeQueue = Promise.resolve();
  const listeners = new Set<() => void>();

  function publish(error: string | null = snapshot.error) {
    snapshot = {
      hydrated: snapshot.hydrated,
      error,
      progress: saved.progress,
      bookmarks: saved.bookmarks,
    };
    listeners.forEach((listener) => listener());
  }

  function persist(next: SavedLearning): Promise<void> {
    // Capture this version now. A slower old write must finish before a newer
    // version (or an explicit reset), so stale progress cannot win the race.
    const serialized = JSON.stringify(next);
    const pending = writeQueue.then(async () => {
      try {
        await storage.setItem(PROGRESS_STORAGE_KEY, serialized);
        publish(null);
      } catch {
        publish(
          'Your latest changes could not be saved on this device. They may be lost if you close the app. Try the action again.',
        );
        throw new Error('Device storage could not save your changes.');
      }
    });
    // Recover the queue after a failure so the next action can retry storage.
    writeQueue = pending.catch(() => undefined);
    return pending;
  }

  function update(next: SavedLearning) {
    // Never persist the initial empty state while hydration is still pending.
    // On read failure, preserve stored bytes until the user explicitly resets.
    if (!writable) return;
    saved = next;
    publish();
    void persist(next).catch(() => undefined);
  }

  function hydrate(): Promise<void> {
    hydration ??= (async () => {
      try {
        saved = parseSavedLearning(await storage.getItem(PROGRESS_STORAGE_KEY));
        writable = true;
        snapshot = { ...snapshot, hydrated: true };
        publish(null);
      } catch {
        snapshot = { ...snapshot, hydrated: true };
        publish(
          'Saved learning could not be loaded. Changes are paused to protect your data. Reopen the app to retry, or reset device progress in Profile.',
        );
      }
    })();
    return hydration;
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hydrate,
    setSection(id: string, index: number) {
      const lesson = getLesson(id);
      if (!lesson || !Number.isInteger(index) || index < 0 || index >= lesson.sections.length)
        return;
      const previous = saved.progress[id] ?? defaultProgress();
      update({
        ...saved,
        progress: { ...saved.progress, [id]: { ...previous, sectionIndex: index } },
      });
    },
    completeQuiz(id: string, score: number) {
      const lesson = getLesson(id);
      if (!lesson || !Number.isInteger(score) || score < 0 || score > 100) return;
      const previous = saved.progress[id] ?? defaultProgress();
      update({
        ...saved,
        progress: {
          ...saved.progress,
          [id]: {
            sectionIndex: lesson.sections.length - 1,
            completed: true,
            bestScore: Math.max(previous.bestScore ?? 0, score),
          },
        },
      });
    },
    toggleBookmark(id: string) {
      if (!getLesson(id)) return;
      const bookmarks = saved.bookmarks.includes(id)
        ? saved.bookmarks.filter((bookmark) => bookmark !== id)
        : [...saved.bookmarks, id];
      update({ ...saved, bookmarks });
    },
    async resetProgress(): Promise<void> {
      // Wait for hydration so a late read cannot restore progress after reset.
      await hydrate();
      saved = emptyLearning();
      writable = true;
      publish();
      await persist(saved);
    },
  };
}
