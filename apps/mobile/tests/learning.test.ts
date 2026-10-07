import assert from 'node:assert/strict';
import test from 'node:test';
import { lessons } from '../src/features/lessons/data/lessons';
import { scoreQuiz } from '../src/features/quizzes/data/scoreQuiz';
import { createLearningStore } from '../src/features/progress/data/createLearningStore';
import { emptyLearning, parseSavedLearning } from '../src/features/progress/data/progressStorage';

const firstLesson = lessons[0];
const delay = () => new Promise<void>((resolve) => setImmediate(resolve));

test('all sample lessons have valid questions and independently identifiable content', () => {
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 4);
  for (const lesson of lessons) {
    assert.match(lesson.intro, /Sample lesson/);
    assert.equal(lesson.sections.length, 3);
    assert.equal(new Set(lesson.sections.map((section) => section.id)).size, 3);
    assert.equal(lesson.questions.length, 3);
    for (const question of lesson.questions) {
      assert.ok(question.options[question.correctIndex]);
    }
  }
});

test('quiz scoring calculates a percentage and rejects missing or invalid answers', () => {
  const questions = firstLesson.questions;
  const answers = questions.map((question) => question.correctIndex);
  assert.deepEqual(scoreQuiz(questions, answers), { correct: 3, total: 3, percentage: 100 });
  answers[0] = (answers[0] + 1) % questions[0].options.length;
  assert.deepEqual(scoreQuiz(questions, answers), { correct: 2, total: 3, percentage: 67 });
  assert.throws(() => scoreQuiz(questions, []));
  assert.throws(() => scoreQuiz(questions, [null, 0, 0]));
  assert.throws(() => scoreQuiz(questions, [-1, 0, 0]));
  assert.throws(() => scoreQuiz(questions, [99, 0, 0]));
  assert.throws(() => scoreQuiz(questions, [0.5, 0, 0]));
});

test('storage validation rejects malformed progress and unsupported versions', () => {
  assert.deepEqual(parseSavedLearning(null), emptyLearning());
  assert.throws(() => parseSavedLearning('{broken'));
  assert.throws(() => parseSavedLearning(JSON.stringify({ ...emptyLearning(), version: 2 })));
  assert.throws(() =>
    parseSavedLearning(
      JSON.stringify({
        ...emptyLearning(),
        progress: { [firstLesson.id]: { sectionIndex: 30, completed: false, bestScore: null } },
      }),
    ),
  );
  assert.throws(() =>
    parseSavedLearning(
      JSON.stringify({
        ...emptyLearning(),
        progress: { [firstLesson.id]: { sectionIndex: 0, completed: true, bestScore: 101 } },
      }),
    ),
  );
  assert.throws(() => parseSavedLearning(JSON.stringify({ ...emptyLearning(), bookmarks: [17] })));
  assert.deepEqual(
    parseSavedLearning(
      JSON.stringify({
        ...emptyLearning(),
        bookmarks: [firstLesson.id, firstLesson.id, 'removed-lesson'],
      }),
    ).bookmarks,
    [firstLesson.id],
  );
});

test('hydration does not overwrite stored progress with the initial empty state', async () => {
  let releaseRead: (value: string | null) => void = () => undefined;
  const writes: string[] = [];
  const store = createLearningStore({
    getItem: () =>
      new Promise((resolve) => {
        releaseRead = resolve;
      }),
    setItem: async (_key, value) => {
      writes.push(value);
    },
  });
  const hydration = store.hydrate();
  store.setSection(firstLesson.id, 0);
  const existing = {
    ...emptyLearning(),
    progress: { [firstLesson.id]: { sectionIndex: 2, completed: true, bestScore: 100 } },
  };
  releaseRead(JSON.stringify(existing));
  await hydration;
  assert.equal(store.getSnapshot().hydrated, true);
  assert.deepEqual(store.getSnapshot().progress, existing.progress);
  assert.deepEqual(writes, []);
});

test('quiz retries retain the best score and reading cannot undo completion', async () => {
  const store = createLearningStore({ getItem: async () => null, setItem: async () => undefined });
  await store.hydrate();
  store.completeQuiz(firstLesson.id, 100);
  store.completeQuiz(firstLesson.id, 33);
  store.setSection(firstLesson.id, 0);
  assert.deepEqual(store.getSnapshot().progress[firstLesson.id], {
    sectionIndex: 0,
    completed: true,
    bestScore: 100,
  });
  store.completeQuiz('missing', 100);
  store.setSection(firstLesson.id, -1);
  assert.equal(Object.keys(store.getSnapshot().progress).length, 1);
  store.toggleBookmark(firstLesson.id);
  store.toggleBookmark(firstLesson.id);
  assert.deepEqual(store.getSnapshot().bookmarks, []);
  await delay();
});

test('serialized writes ensure reset wins even if an older save is slow', async () => {
  let releaseFirstWrite: () => void = () => undefined;
  const writes: string[] = [];
  let disk: string | null = null;
  const store = createLearningStore({
    getItem: async () => null,
    setItem: async (_key, value) => {
      writes.push(value);
      if (writes.length === 1)
        await new Promise<void>((resolve) => {
          releaseFirstWrite = resolve;
        });
      disk = value;
    },
  });
  await store.hydrate();
  store.setSection(firstLesson.id, 1);
  await delay();
  const resetting = store.resetProgress();
  await delay();
  assert.equal(writes.length, 1);
  releaseFirstWrite();
  await resetting;
  assert.equal(writes.length, 2);
  assert.deepEqual(parseSavedLearning(disk), emptyLearning());
});

test('read failures preserve data until an explicit reset', async () => {
  const writes: string[] = [];
  const store = createLearningStore({
    getItem: async () => {
      throw new Error('Unavailable');
    },
    setItem: async (_key, value) => {
      writes.push(value);
    },
  });
  await store.hydrate();
  assert.match(store.getSnapshot().error ?? '', /could not be loaded/);
  store.completeQuiz(firstLesson.id, 100);
  await delay();
  assert.equal(writes.length, 0);
  await store.resetProgress();
  assert.equal(writes.length, 1);
  assert.equal(store.getSnapshot().error, null);
});

test('write failures are visible and subsequent actions can save successfully', async () => {
  let shouldFail = true;
  const store = createLearningStore({
    getItem: async () => null,
    setItem: async () => {
      if (shouldFail) throw new Error('Storage full');
    },
  });
  await store.hydrate();
  store.setSection(firstLesson.id, 1);
  await delay();
  assert.match(store.getSnapshot().error ?? '', /could not be saved/);
  shouldFail = false;
  store.setSection(firstLesson.id, 2);
  await delay();
  assert.equal(store.getSnapshot().error, null);
});
