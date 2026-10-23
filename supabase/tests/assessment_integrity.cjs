/* Run only against the disposable local database prepared by
 * course_quiz_concurrency.cjs. All new fixtures and mutations roll back.
 * Uses privileged writes to exercise storage triggers, not client permissions.
 * Auth is the local minimal shim; this does not test real Supabase Auth.
 * Never reads .env or connects to a hosted database.
 */
'use strict';
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
if (process.env.SUNDAYSEEDS_ISOLATED_DB !== '1') throw Error('Explicit isolated database opt-in required');
const url = new URL(process.env.SUNDAYSEEDS_TEST_DATABASE_URL || '');
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
  throw Error('Only loopback PostgreSQL URLs permitted');
}
if ([...url.searchParams.keys()].some(key => /host|port|service/i.test(key))) throw Error('Connection destination overrides forbidden');
const { Client } = require(process.env.SUNDAYSEEDS_TEST_PG_MODULE || 'pg');
const client = new Client({ connectionString: url.href, application_name: 'sundayseeds-assessment-integrity' });
const results = [];
const query = (sql, params = []) => client.query(sql, params);
const scalar = async (sql, params = []) => (await query(sql, params)).rows[0].value;
const pass = name => { results.push(name); console.log(`PASS ${name}`); };
const tables = ['courses', 'course_releases', 'course_assessment_sets', 'course_enrollments', 'quiz_attempts', 'quiz_checked_answers', 'quiz_outcomes'];
// Compare complete storage state, not just row counts: rejected updates must also
// preserve values. The disposable database is idle during this single-session run.
async function state() {
  const result = {};
  for (const table of tables) {
    result[table] = await scalar(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) value from course_library_private.${table} t`);
  }
  return result;
}
async function rejects(name, sql, params, code, message) {
  const before = await state();
  await query('savepoint rejected_mutation');
  let failure;
  try { await query(sql, params); } catch (error) { failure = error; }
  await query('rollback to savepoint rejected_mutation');
  await query('release savepoint rejected_mutation');
  assert(failure, `${name}: mutation unexpectedly succeeded`);
  assert.equal(failure.code, code, `${name}: SQLSTATE`);
  if (message instanceof RegExp) assert.match(failure.message, message, name);
  else assert.equal(failure.message, message, name);
  assert.deepEqual(await state(), before, `${name}: rejected mutation changed storage`);
  pass(name);
}
async function main() {
  await client.connect();
  await query('begin');
  await query("set local lock_timeout='5s'; set local statement_timeout='10s'");
  const template = (await query(`select r.snapshot release_snapshot,s.snapshot assessment_snapshot
    from course_library_private.course_releases r
    join course_library_private.course_assessment_sets s using(release_id,course_id)
    where r.snapshot->>'title'='Isolated quiz fixture' order by r.edition_number limit 1`)).rows[0];
  assert(template, 'Run course_quiz_concurrency.cjs in a fresh disposable database first');
  const course = randomUUID(), otherCourse = randomUUID();
  const release = randomUUID(), nextRelease = randomUUID(), otherRelease = randomUUID();
  const assessment = randomUUID(), nextAssessment = randomUUID();
  const actor = randomUUID(), otherActor = randomUUID(), session = randomUUID();
  await query('insert into course_library_private.courses(course_id) values($1),($2)', [course, otherCourse]);
  for (const [id, courseId, edition] of [[release, course, 1], [nextRelease, course, 2], [otherRelease, otherCourse, 1]]) {
    await query('insert into course_library_private.course_releases(release_id,course_id,edition_number,snapshot,is_available) values($1,$2,$3,$4,true)', [id, courseId, edition, template.release_snapshot]);
  }
  const insertSet = 'insert into course_library_private.course_assessment_sets(assessment_set_id,release_id,course_id,snapshot) values($1,$2,$3,$4)';
  await rejects('assessment rejects missing release', insertSet, [randomUUID(), randomUUID(), course, template.assessment_snapshot], '22023', 'assessment_snapshot_invalid');
  await rejects('assessment rejects mismatched release and course', insertSet, [randomUUID(), otherRelease, course, template.assessment_snapshot], '22023', 'assessment_snapshot_invalid');
  const duplicateLesson = structuredClone(template.assessment_snapshot);
  duplicateLesson.lessons.push(structuredClone(duplicateLesson.lessons[0]));
  await rejects('assessment rejects duplicate lesson snapshot', insertSet, [randomUUID(), release, course, duplicateLesson], '22023', 'assessment_snapshot_invalid');
  const missing = structuredClone(template.assessment_snapshot);
  missing.lessons.pop();
  await rejects('assessment omitting released lesson', insertSet, [randomUUID(), release, course, missing], '22023', 'assessment_outline_mismatch');
  const extra = structuredClone(template.assessment_snapshot);
  extra.lessons.push({ ...structuredClone(extra.lessons[0]), lessonId: 'extra-lesson', assessmentId: 'extra-check' });
  await rejects('assessment adding unreleased lesson', insertSet, [randomUUID(), release, course, extra], '22023', 'assessment_outline_mismatch');
  await query(insertSet, [assessment, release, course, template.assessment_snapshot]);
  await query(insertSet, [nextAssessment, nextRelease, course, template.assessment_snapshot]);
  pass('complete assessment snapshots accepted');
  await rejects('duplicate assessment set for edition', insertSet, [randomUUID(), release, course, template.assessment_snapshot], '23505', /duplicate key value violates unique constraint/);
  await rejects('sealed assessment update', 'update course_library_private.course_assessment_sets set sealed_at=sealed_at where assessment_set_id=$1', [assessment], '22023', 'assessment_set_is_immutable');
  await rejects('sealed assessment delete', 'delete from course_library_private.course_assessment_sets where assessment_set_id=$1', [assessment], '22023', 'assessment_set_is_immutable');
  await query('insert into auth.users(id,email,email_confirmed_at,is_anonymous) values($1,$2,now(),false),($3,$4,now(),false)', [actor, `${actor}@integrity.invalid`, otherActor, `${otherActor}@integrity.invalid`]);
  await query("insert into auth.sessions(id,user_id,not_after) values($1,$2,now()+interval '1 hour')", [session, actor]);
  const enrollments = (await query('insert into course_library_private.course_enrollments(user_id,course_id,release_id) values($1,$3,$4),($2,$3,$4) returning enrollment_id,user_id', [actor, otherActor, course, release])).rows;
  const enrollment = enrollments.find(row => row.user_id === actor).enrollment_id;
  const otherEnrollment = enrollments.find(row => row.user_id === otherActor).enrollment_id;
  const lesson = template.assessment_snapshot.lessons[0];
  assert.equal(lesson.questions.length, 2, 'Fixture requires two questions');
  const base = { user: actor, enrollment, course, release, set: assessment, lesson: lesson.lessonId, check: lesson.assessmentId };
  const insertAttempt = 'insert into course_library_private.quiz_attempts(attempt_id,user_id,enrollment_id,course_id,release_id,assessment_set_id,lesson_id,assessment_id,start_key) values($1,$2,$3,$4,$5,$6,$7,$8,$9)';
  const attemptParams = (id, binding) => [id, binding.user, binding.enrollment, binding.course, binding.release, binding.set, binding.lesson, binding.check, randomUUID()];
  for (const [name, binding] of [
    ['actor', { user: otherActor }], ['enrollment', { enrollment: otherEnrollment }],
    ['course', { course: otherCourse }], ['release', { release: nextRelease }],
    ['assessment set', { set: nextAssessment }], ['lesson', { lesson: 'missing-lesson' }],
    ['check', { check: 'missing-check' }],
  ]) {
    await rejects(`attempt rejects mismatched ${name}`, insertAttempt, attemptParams(randomUUID(), { ...base, ...binding }), '22023', 'quiz_attempt_binding_invalid');
  }
  const attempt = randomUUID(), zeroAttempt = randomUUID();
  await query(insertAttempt, attemptParams(attempt, base));
  await query(insertAttempt, attemptParams(zeroAttempt, base));
  pass('correctly bound attempts accepted');
  await rejects('attempt update', 'update course_library_private.quiz_attempts set started_at=started_at where attempt_id=$1', [attempt], '22023', 'quiz_attempt_is_immutable');
  const insertAnswer = 'insert into course_library_private.quiz_checked_answers(attempt_id,question_id,option_id) values($1,$2,$3)';
  const first = lesson.questions[0], second = lesson.questions[1];
  await rejects('checked answer rejects unknown question', insertAnswer, [attempt, 'missing-question', first.correctOptionId], '22023', 'quiz_selection_invalid');
  await rejects('checked answer rejects unknown option', insertAnswer, [attempt, first.id, 'missing-option'], '22023', 'quiz_selection_invalid');
  await rejects('checked answer rejects absent attempt', insertAnswer, [randomUUID(), first.id, first.correctOptionId], '22023', 'quiz_attempt_binding_invalid');
  const insertOutcome = 'insert into course_library_private.quiz_outcomes(attempt_id,correct_count,question_count,score_percent) values($1,$2,$3,$4)';
  await rejects('outcome rejects no checked answers', insertOutcome, [attempt, 0, 2, 0], '22023', 'quiz_outcome_invalid');
  await query(insertAnswer, [attempt, first.id, first.correctOptionId]);
  await rejects('outcome rejects partially checked attempt', insertOutcome, [attempt, 1, 2, 50], '22023', 'quiz_outcome_invalid');
  await rejects('checked answer update', 'update course_library_private.quiz_checked_answers set option_id=option_id where attempt_id=$1 and question_id=$2', [attempt, first.id], '22023', 'quiz_record_is_immutable');
  await rejects('duplicate checked answer', insertAnswer, [attempt, first.id, first.correctOptionId], '23505', /duplicate key value violates unique constraint/);
  await query(insertAnswer, [attempt, second.id, second.correctOptionId]);
  for (const [name, correct, total, percent] of [['correct count', 1, 2, 50], ['question count', 2, 3, 67], ['score percent', 2, 2, 99]]) {
    await rejects(`outcome rejects forged ${name}`, insertOutcome, [attempt, correct, total, percent], '22023', 'quiz_outcome_invalid');
  }
  await query(insertOutcome, [attempt, 2, 2, 100]);
  for (const question of lesson.questions) {
    const wrong = question.options.find(option => option.id !== question.correctOptionId).id;
    await query(insertAnswer, [zeroAttempt, question.id, wrong]);
  }
  await query(insertOutcome, [zeroAttempt, 0, 2, 0]);
  assert.deepEqual((await query('select correct_count,question_count,score_percent from course_library_private.quiz_outcomes where attempt_id=any($1::uuid[]) order by score_percent', [[attempt, zeroAttempt]])).rows,
    [{ correct_count: 0, question_count: 2, score_percent: 0 }, { correct_count: 2, question_count: 2, score_percent: 100 }]);
  pass('legitimate zero and full outcomes accepted');
  // Exercise PostgreSQL rounding, including fractions on both sides of 50%.
  const fractionalSnapshot = structuredClone(template.assessment_snapshot);
  fractionalSnapshot.lessons[0].questions.push({ ...structuredClone(first), id: 'question-three' });
  const fractionalSet = randomUUID();
  const actorAttempts = [attempt, zeroAttempt];
  await query(insertSet, [fractionalSet, otherRelease, otherCourse, fractionalSnapshot]);
  const fractionalEnrollment = (await query('insert into course_library_private.course_enrollments(user_id,course_id,release_id) values($1,$2,$3) returning enrollment_id', [actor, otherCourse, otherRelease])).rows[0].enrollment_id;
  for (const [correctCount, percent, wrongPercent] of [[1, 33, 34], [2, 67, 66]]) {
    const id = randomUUID();
    actorAttempts.push(id);
    await query(insertAttempt, attemptParams(id, { ...base, enrollment: fractionalEnrollment, course: otherCourse, release: otherRelease, set: fractionalSet }));
    for (const [index, question] of fractionalSnapshot.lessons[0].questions.entries()) {
      const option = index < correctCount ? question.correctOptionId : question.options.find(item => item.id !== question.correctOptionId).id;
      await query(insertAnswer, [id, question.id, option]);
    }
    await rejects(`outcome rejects incorrect rounding ${correctCount}/3`, insertOutcome, [id, correctCount, 3, wrongPercent], '22023', 'quiz_outcome_invalid');
    await query(insertOutcome, [id, correctCount, 3, percent]);
    assert.equal(await scalar('select score_percent value from course_library_private.quiz_outcomes where attempt_id=$1', [id]), percent);
    pass(`fractional score ${correctCount}/3 rounds to ${percent}`);
  }
  await rejects('outcome update', 'update course_library_private.quiz_outcomes set score_percent=score_percent where attempt_id=$1', [attempt], '22023', 'quiz_record_is_immutable');
  await rejects('checked insert after committed completion fact', insertAnswer, [attempt, first.id, first.correctOptionId], '22023', 'quiz_selection_invalid');
  await rejects('duplicate completed outcome', insertOutcome, [attempt, 2, 2, 100], '23505', /duplicate key value violates unique constraint/);
  const otherAttempt = randomUUID();
  await query(insertAttempt, attemptParams(otherAttempt, { ...base, user: otherActor, enrollment: otherEnrollment }));
  for (const question of lesson.questions) await query(insertAnswer, [otherAttempt, question.id, question.correctOptionId]);
  await query(insertOutcome, [otherAttempt, 2, 2, 100]);
  // Revoke the shim session before user deletion, as required for real Auth too.
  await query('delete from auth.sessions where user_id=$1', [actor]);
  await query('delete from auth.users where id=$1', [actor]);
  for (const [table, predicate, value] of [
    ['course_enrollments', 'user_id=$1', actor], ['quiz_attempts', 'user_id=$1', actor],
    ['quiz_checked_answers', 'attempt_id=any($1::uuid[])', actorAttempts],
    ['quiz_outcomes', 'attempt_id=any($1::uuid[])', actorAttempts],
  ]) assert.equal(Number(await scalar(`select count(*) value from course_library_private.${table} where ${predicate}`, [value])), 0, `${table} cascaded`);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.course_assessment_sets where assessment_set_id=$1', [assessment])), 1);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.course_assessment_sets where assessment_set_id=$1', [fractionalSet])), 1);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.course_enrollments where enrollment_id=$1', [otherEnrollment])), 1);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.quiz_attempts where attempt_id=$1', [otherAttempt])), 1);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.quiz_checked_answers where attempt_id=$1', [otherAttempt])), 2);
  assert.equal(Number(await scalar('select count(*) value from course_library_private.quiz_outcomes where attempt_id=$1 and score_percent=100', [otherAttempt])), 1);
  pass('Auth deletion cascades own enrollment, attempts, checks and outcomes only');
  await query('rollback');
  for (const [table, key, values] of [['courses', 'course_id', [course, otherCourse]], ['quiz_attempts', 'attempt_id', [...actorAttempts, otherAttempt]]]) {
    assert.equal(Number(await scalar(`select count(*) value from course_library_private.${table} where ${key}=any($1::uuid[])`, [values])), 0, `${table}: fixtures rolled back`);
  }
  assert.equal(Number(await scalar('select count(*) value from auth.users where id=any($1::uuid[])', [[actor, otherActor]])), 0);
  pass('all new fixtures rolled back');
  console.log(JSON.stringify({ passed: results.length, checks: results, scope: 'local PostgreSQL storage triggers with Auth shims; all new fixtures rolled back; no hosted changes' }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  try { await query('rollback'); } finally { await client.end(); }
});
