/* Local disposable cluster only, after course_quiz_concurrency.cjs.
 * Verifies source equivalence and one-time import guards. All new state rolls back.
 * No hosted connection or .env reads. Requires mobile dev dependencies for TypeScript.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
if (process.env.SUNDAYSEEDS_ISOLATED_DB !== '1') throw Error('Explicit isolated database opt-in required');
const url = new URL(process.env.SUNDAYSEEDS_TEST_DATABASE_URL || '');
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  || [...url.searchParams.keys()].some(k => /host|port|service/i.test(k))) throw Error('Only loopback PostgreSQL destinations permitted');
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const seed = read('supabase/seeds/development_course_assessments.sql');
const snapshot = JSON.parse(seed.split('$assessment$')[1]);
const ts = createRequire(path.join(root, 'apps/mobile/package.json'))('typescript');
const compiled = ts.transpileModule(read('apps/mobile/src/features/lessons/data/lessons.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const order = ['a-life-of-prayer', 'faith-like-a-seed', 'david-and-goliath', 'good-samaritan'];
const expected = { schemaVersion: 1, lessons: order.map(id => {
  const lesson = sandbox.exports.lessons.find(item => item.id === id);
  return { lessonId: id, assessmentId: `knowledge-check-${id}`, questions: lesson.questions.map(q => ({
    id: q.id, prompt: q.prompt, options: q.options.map((text, i) => ({ id: `option-${'abcd'[i]}`, text })),
    correctOptionId: `option-${'abcd'[q.correctIndex]}`, explanation: q.explanation,
  })) };
}) };
assert.deepEqual(snapshot, JSON.parse(JSON.stringify(expected)));
console.log('PASS all 12 source questions, 48 options and answer mappings match');
const { Client } = require(process.env.SUNDAYSEEDS_TEST_PG_MODULE || 'pg');
const db = new Client({ connectionString: url.href, application_name: 'sundayseeds-assessment-import' });
async function rejects(message) {
  await db.query('savepoint import_guard');
  let error;
  try { await db.query(seed); } catch (e) { error = e; }
  await db.query('rollback to savepoint import_guard');
  await db.query('release savepoint import_guard');
  assert.equal(error?.code, 'P0001'); assert.equal(error?.message, message);
  console.log(`PASS ${message}`);
}
async function preserved() {
  const tables = ['course_library_private.course_releases', 'course_library_private.course_lesson_readings',
    'public.course_offerings', 'course_library_private.course_enrollments', 'course_library_private.quiz_attempts',
    'course_library_private.quiz_checked_answers', 'course_library_private.quiz_outcomes'];
  const rows = {};
  for (const table of tables) rows[table] = (await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) body from ${table} t`)).rows[0].body;
  return rows;
}
async function main() {
  await db.connect(); await db.query("begin; set local lock_timeout='5s'; set local statement_timeout='10s'");
  assert.equal((await db.query("select count(*) n from public.course_offerings where slug='faith-for-everyday-life'")).rows[0].n, '0', 'Requires isolated fixture cluster without development import');
  await rejects('development_course_not_found');
  await db.query(read('supabase/seeds/development_course_outline.sql'));
  await rejects('development_readings_incomplete');
  await db.query(read('supabase/seeds/development_course_readings.sql'));
  await db.query("savepoint available; update course_library_private.course_releases set is_available=false where snapshot->>'slug'='faith-for-everyday-life'");
  await rejects('development_edition_changed_or_unavailable');
  await db.query('rollback to savepoint available; release savepoint available');
  const before = await preserved();
  await db.query(seed);
  const imported = (await db.query("select s.snapshot from course_library_private.course_assessment_sets s join public.course_offerings o using(course_id,release_id) where o.slug='faith-for-everyday-life'")).rows;
  assert.equal(imported.length, 1); assert.deepEqual(imported[0].snapshot, snapshot);
  assert.deepEqual(await preserved(), before);
  console.log('PASS exact sealed set imported; readings, order, offering and all learner records preserved');
  await rejects('development_assessments_already_exist');
  await db.query('rollback');
  assert.equal((await db.query("select count(*) n from public.course_offerings where slug='faith-for-everyday-life'")).rows[0].n, '0');
  console.log('PASS all import fixtures rolled back');
  console.log('PASS 7 import/source groups; no hosted changes');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  try { await db.query('rollback'); } finally { await db.end(); }
});
