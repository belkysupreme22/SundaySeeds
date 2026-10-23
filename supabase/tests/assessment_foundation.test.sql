-- Owner-run on an isolated development database after the foundation migration.
-- Source only: no evidence these assertions pass until actually executed.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok(c.relrowsecurity, n.nspname || '.' || c.relname || ' has RLS')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'course_library_private'
  and c.relname in ('course_assessment_sets','quiz_attempts','quiz_checked_answers','quiz_outcomes');
select ok(not has_table_privilege(r.role_name, 'course_library_private.' || t.table_name,
  'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),
  r.role_name || ' has no direct privileges on ' || t.table_name)
from unnest(array['anon','authenticated','service_role']) r(role_name)
cross join unnest(array['course_assessment_sets','quiz_attempts','quiz_checked_answers','quiz_outcomes']) t(table_name);
select ok(not has_function_privilege(r.role_name, f.signature, 'EXECUTE'),
  r.role_name || ' cannot execute ' || f.signature)
from unnest(array['anon','authenticated','service_role']) r(role_name)
cross join unnest(array[
  'course_library_private.valid_assessment_snapshot(jsonb)',
  'course_library_private.guard_assessment_set()',
  'course_library_private.guard_quiz_attempt()',
  'course_library_private.guard_quiz_record()'
]) f(signature);

create temporary table assessment_fixture(body jsonb);
insert into assessment_fixture values ('{"schemaVersion":1,"lessons":[{"lessonId":"lesson-one","assessmentId":"check-one","questions":[{"id":"question-one","prompt":"Choose care","options":[{"id":"option-a","text":"Care"},{"id":"option-b","text":"Ignore"}],"correctOptionId":"option-a","explanation":"Care is practical."}]}]}');
select ok(course_library_private.valid_assessment_snapshot(body), 'complete assessment shape accepted') from assessment_fixture;
select ok(not course_library_private.valid_assessment_snapshot(body || '{"extra":"key"}'), 'unknown snapshot fields rejected') from assessment_fixture;
select ok(not course_library_private.valid_assessment_snapshot(jsonb_set(body, '{lessons,0,questions,0,correctOptionId}', '"missing"')), 'answer must identify an existing option') from assessment_fixture;
select ok(not course_library_private.valid_assessment_snapshot(jsonb_set(body, '{lessons,0,questions,0,options,1,id}', '"option-a"')), 'duplicate option IDs rejected') from assessment_fixture;
select ok(not course_library_private.valid_assessment_snapshot(jsonb_set(body, '{lessons}', '[]')), 'empty assessment set rejected') from assessment_fixture;
select ok(not course_library_private.valid_assessment_snapshot('null'), 'null JSON rejected');

set local role anon;
select throws_ok('select * from course_library_private.course_assessment_sets', '42501', null, 'anonymous cannot read answer keys');
reset role;
set local role authenticated;
select throws_ok('select * from course_library_private.quiz_attempts', '42501', null, 'authenticated role cannot read attempts directly');
reset role;
select * from finish();
rollback;
