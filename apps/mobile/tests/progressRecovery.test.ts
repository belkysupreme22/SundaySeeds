import assert from 'node:assert/strict';
import test from 'node:test';
import { lessons } from '../src/features/lessons/data/lessons';
import { createLearningStore } from '../src/features/progress/data/createLearningStore';
import {
  emptyLearning,
  parseSavedLearning,
  type SavedLearning,
} from '../src/features/progress/data/progressStorage';

const lesson = lessons[0];
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function existingLearning(): SavedLearning {
  return {
    ...emptyLearning(),
    progress: { [lesson.id]: { sectionIndex: 2, completed: true, bestScore: 100 } },
    bookmarks: [lesson.id],
  };
}

function controlledWrites() {
  let disk: string | null = null;
  const writes: { value: string; completion: ReturnType<typeof deferred<void>> }[] = [];
  const store = createLearningStore({
    getItem: async () => disk,
    setItem: async (_key, value) => {
      const completion = deferred<void>();
      writes.push({ value, completion });
      await completion.promise;
      disk = value;
    },
  });
  return { store, writes, readDisk: () => parseSavedLearning(disk) };
}

test('retrying a failed read restores saved learning without writing and shares concurrent attempts', async () => {
  const existing = existingLearning();
  const originalBytes = JSON.stringify(existing);
  const retryRead = deferred<string | null>();
  const writes: string[] = [];
  let reads = 0;
  const store = createLearningStore({
    getItem: async () => {
      reads += 1;
      if (reads === 1) throw new Error('Temporarily unavailable');
      return retryRead.promise;
    },
    setItem: async (_key, value) => {
      writes.push(value);
    },
  });
  await store.hydrate();
  const loadError = store.getSnapshot().error;
  assert.ok(loadError);

  const firstRetry = store.retryStorage();
  const secondRetry = store.retryStorage();
  await settle();
  assert.equal(reads, 2);
  assert.equal(store.getSnapshot().recovering, true);
  assert.equal(store.getSnapshot().error, loadError);
  retryRead.resolve(originalBytes);
  await Promise.all([firstRetry, secondRetry]);

  assert.deepEqual(store.getSnapshot().progress, existing.progress);
  assert.deepEqual(store.getSnapshot().bookmarks, existing.bookmarks);
  assert.equal(store.getSnapshot().error, null);
  assert.equal(store.getSnapshot().recovering, false);
  assert.deepEqual(writes, []);
});

test('repeated read failures preserve original bytes and keep all learning mutations blocked', async () => {
  const originalBytes = '{unreadable saved data';
  let disk = originalBytes;
  let reads = 0;
  const writes: string[] = [];
  const store = createLearningStore({
    getItem: async () => {
      reads += 1;
      return disk;
    },
    setItem: async (_key, value) => {
      writes.push(value);
      disk = value;
    },
  });
  await store.hydrate();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await store.retryStorage();
    store.setSection(lesson.id, 1);
    store.completeQuiz(lesson.id, 100);
    store.toggleBookmark(lesson.id);
    await settle();
    assert.ok(store.getSnapshot().error);
    assert.equal(store.getSnapshot().recovering, false);
    assert.deepEqual(store.getSnapshot().progress, {});
    assert.deepEqual(store.getSnapshot().bookmarks, []);
  }
  assert.equal(reads, 3);
  assert.equal(disk, originalBytes);
  assert.deepEqual(writes, []);
});

test('hydrate remains idempotent after a successful recovery and preserves newer changes', async () => {
  let reads = 0;
  const store = createLearningStore({
    getItem: async () => {
      reads += 1;
      if (reads === 1) throw new Error('Unavailable');
      return JSON.stringify(existingLearning());
    },
    setItem: async () => undefined,
  });
  await store.hydrate();
  await store.retryStorage();
  store.setSection(lesson.id, 0);
  store.toggleBookmark(lesson.id);
  await settle();
  await Promise.all([store.hydrate(), store.hydrate()]);
  assert.equal(reads, 2);
  assert.equal(store.getSnapshot().progress[lesson.id].sectionIndex, 0);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
});

test('failed bookmark writes retry the same snapshot once without toggling the bookmark', async () => {
  const { store, writes, readDisk } = controlledWrites();
  await store.hydrate();
  store.toggleBookmark(lesson.id);
  await settle();
  writes[0].completion.reject(new Error('Storage full'));
  await settle();
  const saveError = store.getSnapshot().error;
  assert.ok(saveError);

  const firstRetry = store.retryStorage();
  const secondRetry = store.retryStorage();
  await settle();
  assert.equal(writes.length, 2);
  assert.equal(writes[1].value, writes[0].value);
  assert.deepEqual(store.getSnapshot().bookmarks, [lesson.id]);
  assert.equal(store.getSnapshot().recovering, true);
  assert.equal(store.getSnapshot().error, saveError);
  writes[1].completion.resolve();
  await Promise.all([firstRetry, secondRetry]);
  assert.deepEqual(readDisk().bookmarks, [lesson.id]);
  assert.equal(store.getSnapshot().error, null);
  assert.equal(store.getSnapshot().recovering, false);
});

test('a failed save retry retains changes and can be retried again', async () => {
  const { store, writes, readDisk } = controlledWrites();
  await store.hydrate();
  store.completeQuiz(lesson.id, 100);
  await settle();
  writes[0].completion.reject(new Error('Storage full'));
  await settle();
  const failedRetry = store.retryStorage();
  await settle();
  writes[1].completion.reject(new Error('Still full'));
  await failedRetry;
  assert.equal(store.getSnapshot().recovering, false);
  assert.ok(store.getSnapshot().error);
  assert.equal(store.getSnapshot().progress[lesson.id].bestScore, 100);

  const successfulRetry = store.retryStorage();
  await settle();
  assert.equal(writes[2].value, writes[0].value);
  writes[2].completion.resolve();
  await successfulRetry;
  assert.equal(readDisk().progress[lesson.id].bestScore, 100);
  assert.equal(store.getSnapshot().error, null);
});

test('new edits during a save retry win and its stale success cannot clear the pending error', async () => {
  const { store, writes, readDisk } = controlledWrites();
  await store.hydrate();
  store.toggleBookmark(lesson.id);
  await settle();
  writes[0].completion.reject(new Error('Storage full'));
  await settle();
  const saveError = store.getSnapshot().error;
  const retry = store.retryStorage();
  await settle();
  store.toggleBookmark(lesson.id);
  store.setSection(lesson.id, 1);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  writes[1].completion.resolve();
  await retry;
  await settle();
  assert.equal(store.getSnapshot().error, saveError);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  assert.equal(store.getSnapshot().progress[lesson.id].sectionIndex, 1);

  writes[2].completion.resolve();
  await settle();
  assert.equal(store.getSnapshot().error, saveError);
  assert.equal(writes.length, 4);
  writes[3].completion.resolve();
  await settle();
  assert.deepEqual(readDisk().bookmarks, []);
  assert.equal(readDisk().progress[lesson.id].sectionIndex, 1);
  assert.equal(store.getSnapshot().error, null);
});

test('reset queued during a save retry wins over the retried snapshot', async () => {
  const { store, writes, readDisk } = controlledWrites();
  await store.hydrate();
  store.toggleBookmark(lesson.id);
  await settle();
  writes[0].completion.reject(new Error('Storage full'));
  await settle();
  const retry = store.retryStorage();
  await settle();
  const reset = store.resetProgress();
  await settle();
  assert.equal(writes.length, 2);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  writes[1].completion.resolve();
  await retry;
  await settle();
  assert.ok(store.getSnapshot().error);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  assert.deepEqual(parseSavedLearning(writes[2].value), emptyLearning());
  writes[2].completion.resolve();
  await reset;
  assert.deepEqual(readDisk(), emptyLearning());
  assert.equal(store.getSnapshot().error, null);
});

test('reset waits for an active recovery read so late stored progress cannot return', async () => {
  let disk = JSON.stringify(existingLearning());
  const retryRead = deferred<string | null>();
  const writes: string[] = [];
  let reads = 0;
  const store = createLearningStore({
    getItem: async () => {
      reads += 1;
      if (reads === 1) throw new Error('Unavailable');
      return retryRead.promise;
    },
    setItem: async (_key, value) => {
      writes.push(value);
      disk = value;
    },
  });
  await store.hydrate();
  const retry = store.retryStorage();
  const reset = store.resetProgress();
  await settle();
  assert.deepEqual(writes, []);
  retryRead.resolve(disk);
  await Promise.all([retry, reset]);
  assert.equal(writes.length, 1);
  assert.deepEqual(parseSavedLearning(disk), emptyLearning());
  assert.deepEqual(store.getSnapshot().progress, {});
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  assert.equal(store.getSnapshot().error, null);
});
