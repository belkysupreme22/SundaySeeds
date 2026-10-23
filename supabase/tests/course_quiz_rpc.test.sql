-- Owner-run only on an isolated Supabase development database after assessment
-- foundation AND trusted quiz RPC migrations. Source prepared; not executed.
-- No production content, learners or progress: all fixtures roll back.
-- This single-session suite does not establish concurrent transaction behavior.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,email,email_confirmed_at,is_anonymous) values
 ('a1000000-0000-4000-8000-000000000001','a@quiz-rpc-test.invalid',now(),false),
 ('a1000000-0000-4000-8000-000000000002','b@quiz-rpc-test.invalid',now(),false),
 ('a1000000-0000-4000-8000-000000000003','unverified@quiz-rpc-test.invalid',null,false),
 ('a1000000-0000-4000-8000-000000000004','anonymous@quiz-rpc-test.invalid',now(),true);
insert into auth.sessions(id,user_id,created_at,updated_at,not_after) values
 ('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001',now(),now(),now()+interval '1 hour'),
 ('b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002',now(),now(),now()+interval '1 hour'),
 ('b1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003',now(),now(),now()+interval '1 hour'),
 ('b1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000004',now(),now(),now()+interval '1 hour'),
 ('b1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000001',now(),now(),now()-interval '1 hour');

-- Set both claim representations explicitly; user metadata cannot supply access.
create function pg_temp.quiz_actor(p_actor uuid,p_session uuid) returns void
language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub',coalesce(p_actor::text,''),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',p_actor,
   'role','authenticated','session_id',p_session,
   'user_metadata',jsonb_build_object('verified',true,'role','admin'))::text,true);
end; $$;

insert into course_library_private.courses(course_id)
 values ('c1000000-0000-4000-8000-000000000001');
-- No public offering is needed: authorization belongs to the pinned release.
insert into course_library_private.course_releases(release_id,course_id,edition_number,snapshot,is_available)
select ('d1000000-0000-4000-8000-00000000000'||edition)::uuid,
 'c1000000-0000-4000-8000-000000000001',edition,
 '{"title":"Isolated quiz fixture","modules":[{"id":"module-one","title":"Module","lessons":[{"id":"lesson-one","title":"First","scripture":"Luke 10"},{"id":"lesson-two","title":"Second","scripture":"Luke 11"}]}]}'::jsonb,true
from generate_series(1,2) edition;
insert into course_library_private.course_assessment_sets(release_id,course_id,snapshot)
select release_id,course_id,
 jsonb_build_object('schemaVersion',1,'lessons',(
   select jsonb_agg(jsonb_build_object('lessonId',lesson,'assessmentId','check-'||lesson,
     'questions','[{"id":"question-one","prompt":"Choose care","options":[{"id":"care","text":"Care"},{"id":"ignore","text":"Ignore"}],"correctOptionId":"care","explanation":"Care is practical."},{"id":"question-two","prompt":"Choose help","options":[{"id":"help","text":"Help"},{"id":"leave","text":"Leave"}],"correctOptionId":"help","explanation":"Help your neighbour."}]'::jsonb))
   from unnest(array['lesson-one','lesson-two']) lesson))
from course_library_private.course_releases where course_id='c1000000-0000-4000-8000-000000000001';
insert into course_library_private.course_enrollments(user_id,course_id,release_id)
select actor,'c1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001'
from unnest(array['a1000000-0000-4000-8000-000000000001'::uuid,'a1000000-0000-4000-8000-000000000002'::uuid]) actor;
create temporary table quiz_responses(name text primary key,body jsonb not null);
grant select,insert on quiz_responses to authenticated;

select ok(not has_table_privilege('authenticated', 'course_library_private.course_assessment_sets','SELECT'), 'answer-key snapshot has no client read grant');
set local role authenticated;
select throws_ok($$select snapshot from course_library_private.course_assessment_sets$$,'42501',null,'client cannot read answer keys directly');
reset role;
set local role anon;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501',null,'anonymous cannot call public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501',null,'anonymous cannot call public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501',null,'anonymous cannot call public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501',null,'anonymous cannot call public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501',null,'anonymous cannot call public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000005');
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','expired session blocked by public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501','authentication_required','expired session blocked by public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501','authentication_required','expired session blocked by public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501','authentication_required','expired session blocked by public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','expired session blocked by public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000002');
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','another actor session blocked by public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501','authentication_required','another actor session blocked by public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501','authentication_required','another actor session blocked by public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501','authentication_required','another actor session blocked by public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','another actor session blocked by public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000009');
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','missing live session blocked by public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501','authentication_required','missing live session blocked by public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501','authentication_required','missing live session blocked by public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501','authentication_required','missing live session blocked by public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','missing live session blocked by public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000003');
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501','email_verification_required','unverified email blocked by public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501','email_verification_required','unverified email blocked by public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501','email_verification_required','unverified email blocked by public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501','email_verification_required','unverified email blocked by public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501','email_verification_required','unverified email blocked by public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000004','b1000000-0000-4000-8000-000000000004');
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','anonymous Auth identity blocked by public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt(null)$$,'42501','authentication_required','anonymous Auth identity blocked by public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer(null,'question-one','care')$$,'42501','authentication_required','anonymous Auth identity blocked by public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz(null)$$,'42501','authentication_required','anonymous Auth identity blocked by public.finish_course_quiz');
select throws_ok($$select public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','anonymous Auth identity blocked by public.get_my_course_quiz_progress');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001');
set local role authenticated;
insert into quiz_responses values('first',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001'));
select is(public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001'),(select body from quiz_responses where name='first'),'same Start key replays same attempt');
select is((select body->>'release_id' from quiz_responses where name='first'),'d1000000-0000-4000-8000-000000000001','attempt stays in joined edition with another edition present');
select ok((select body->'questions'->0->'checked_answer' = 'null'::jsonb and body->'receipt' = 'null'::jsonb from quiz_responses where name='first'),'initial attempt has no checked answer or outcome');
select ok(not exists(select 1 from quiz_responses r,lateral jsonb_array_elements(r.body->'questions') q where r.name='first' and (q - array['id','prompt','options','checked_answer']) <> '{}'::jsonb),'initial questions have explicit key allowlist');
select ok(not exists(select 1 from quiz_responses r,lateral jsonb_array_elements(r.body->'questions') q,lateral jsonb_array_elements(q->'options') o where r.name='first' and (o - array['id','text']) <> '{}'::jsonb),'options contain no answer keys or feedback');
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-two','e1000000-0000-4000-8000-000000000001')$$,'22023','start_key_conflict','Start key cannot be reused for another lesson');
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','missing','e1000000-0000-4000-8000-000000000009')$$,'P0002','quiz_unavailable','guessed lesson cannot start quiz');
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'22023','quiz_incomplete','Finish rejects no checked answers');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-one','nonexistent')$$,'22023','quiz_selection_invalid','unknown option is rejected');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'nonexistent','care')$$,'22023','quiz_selection_invalid','unknown question is rejected');
insert into quiz_responses values('check',public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-one','ignore'));
select is(public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-one','ignore'),(select body from quiz_responses where name='check'),'same checked selection replays feedback');
select ok((select body->>'correct_option_id'='care' and body->'is_correct'='false'::jsonb and body->>'explanation'='Care is practical.' from quiz_responses where name='check'),'server returns teaching feedback for accepted selection');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-one','care')$$,'22023','quiz_answer_locked','changing checked selection requires new attempt');
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'22023','quiz_incomplete','Finish rejects partially checked attempt');
select is(public.get_course_quiz_attempt((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))->'questions'->1->'checked_answer','null'::jsonb,'unchecked question remains private after another answer was checked');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002');
set local role authenticated;
select throws_ok($$select public.get_course_quiz_attempt((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'P0002','quiz_attempt_unavailable','another learner cannot use attempt via public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-two','help')$$,'P0002','quiz_attempt_unavailable','another learner cannot use attempt via public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'P0002','quiz_attempt_unavailable','another learner cannot use attempt via public.finish_course_quiz');
select is(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->>'completed_count','0','other learner has no inherited completion');
insert into quiz_responses values('other-actor',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000001'));
select isnt((select body->>'attempt_id' from quiz_responses where name='other-actor'),(select body->>'attempt_id' from quiz_responses where name='first'),'Start idempotency key is scoped to authenticated actor');
reset role;
select pg_temp.quiz_actor('a1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001');
set local role authenticated;
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),'question-two','leave');
insert into quiz_responses values('zero',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first')));
select ok((select body->'receipt'->>'score_percent'='0' and body->'receipt'->>'correct_count'='0' and body->'receipt'->>'question_count'='2' and body->'receipt'->>'finished_at' is not null from quiz_responses where name='zero'),'zero score has trusted counts and completion timestamp');
select is(public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first')),(select body from quiz_responses where name='zero'),'Finish replay returns same committed receipt');
select throws_ok($$insert into course_library_private.quiz_outcomes(attempt_id,correct_count,question_count,score_percent) values ((select (body->>'attempt_id')::uuid from quiz_responses where name='first'),2,2,100)$$,'42501',null,'learner cannot forge score through direct outcome write');
select ok(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->>'completed_count'='1' and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'completed'='false'::jsonb,'zero completes one distinct lesson without minimum score');
insert into quiz_responses values('full-attempt',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000002'));
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='full-attempt'),'question-one','care');
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='full-attempt'),'question-two','help');
insert into quiz_responses values('full-receipt',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='full-attempt')));
insert into quiz_responses values('lower-attempt',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000003'));
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='lower-attempt'),'question-one','ignore');
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='lower-attempt'),'question-two','leave');
insert into quiz_responses values('lower-receipt',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='lower-attempt')));
insert into quiz_responses values('second-attempt',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-two','e1000000-0000-4000-8000-000000000004'));
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='second-attempt'),'question-one','care');
select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='second-attempt'),'question-two','help');
insert into quiz_responses values('second-receipt',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='second-attempt')));
select is(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'lessons'->0->>'best_score_percent','100','later zero score cannot reduce highest completed score');
select ok(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->>'required_count'='2' and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->>'completed_count'='2' and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'completed'='true'::jsonb,'completion counts distinct released lessons rather than attempts');
select is(public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))->'receipt',(select body->'receipt' from quiz_responses where name='zero'),'later retry cannot rewrite original score or timestamp');
insert into quiz_responses values('unfinished',public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-two','e1000000-0000-4000-8000-000000000005'));
reset role;
update course_library_private.course_releases set is_available=false where release_id='d1000000-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000008')$$,'P0002','quiz_unavailable','withdrawn access blocks public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'P0002','quiz_unavailable','withdrawn access blocks public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='unfinished'),'question-one','care')$$,'P0002','quiz_unavailable','withdrawn access blocks public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='unfinished'))$$,'P0002','quiz_unavailable','withdrawn access blocks public.finish_course_quiz');
insert into quiz_responses values('withdrawn-receipt',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first')));
select is((select body->'receipt' from quiz_responses where name='withdrawn-receipt'),(select body->'receipt' from quiz_responses where name='zero'),'withdrawn access retains only original outcome receipt');
select ok((select (body->'receipt') - array['attempt_id','course_id','release_id','lesson_id','correct_count','question_count','score_percent','finished_at']='{}'::jsonb and body - array['receipt','best_score_percent']='{}'::jsonb from quiz_responses where name='withdrawn-receipt'),'withdrawn receipt allowlist excludes question keys and teaching feedback');
select ok(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'available'='false'::jsonb and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'completed_count'='null'::jsonb and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'lessons'='null'::jsonb,'withdrawn summary is unavailable rather than empty history');
reset role;
update course_library_private.course_releases set is_available=true where release_id='d1000000-0000-4000-8000-000000000001';
update course_library_private.course_enrollments set state='revoked' where user_id='a1000000-0000-4000-8000-000000000001' and course_id='c1000000-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select public.start_course_quiz('c1000000-0000-4000-8000-000000000001','lesson-one','e1000000-0000-4000-8000-000000000008')$$,'42501','access_revoked','revoked access blocks public.start_course_quiz');
select throws_ok($$select public.get_course_quiz_attempt((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'42501','access_revoked','revoked access blocks public.get_course_quiz_attempt');
select throws_ok($$select public.check_course_quiz_answer((select (body->>'attempt_id')::uuid from quiz_responses where name='unfinished'),'question-one','care')$$,'42501','access_revoked','revoked access blocks public.check_course_quiz_answer');
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='unfinished'))$$,'42501','access_revoked','revoked access blocks public.finish_course_quiz');
insert into quiz_responses values('revoked-receipt',public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first')));
select is((select body->'receipt' from quiz_responses where name='revoked-receipt'),(select body->'receipt' from quiz_responses where name='zero'),'revoked access retains only original outcome receipt');
select ok((select (body->'receipt') - array['attempt_id','course_id','release_id','lesson_id','correct_count','question_count','score_percent','finished_at']='{}'::jsonb and body - array['receipt','best_score_percent']='{}'::jsonb from quiz_responses where name='revoked-receipt'),'revoked receipt allowlist excludes question keys and teaching feedback');
select ok(public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'available'='false'::jsonb and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'completed_count'='null'::jsonb and public.get_my_course_quiz_progress('c1000000-0000-4000-8000-000000000001')->'lessons'='null'::jsonb,'revoked summary is unavailable rather than empty history');
reset role;
select is((select count(*) from course_library_private.quiz_attempts where user_id='a1000000-0000-4000-8000-000000000001'),5::bigint,'failed requests and Start retries create no extra attempts');
select is((select count(*) from course_library_private.quiz_outcomes o join course_library_private.quiz_attempts a using(attempt_id) where a.user_id='a1000000-0000-4000-8000-000000000001'),4::bigint,'Finish retries and blocked submission create no duplicate completion');
select is((select count(*) from course_library_private.quiz_checked_answers c join course_library_private.quiz_attempts a using(attempt_id) where a.user_id='a1000000-0000-4000-8000-000000000001'),8::bigint,'invalid and changed selections do not alter accepted answers');
select is((select count(*) from course_library_private.quiz_attempts where user_id='a1000000-0000-4000-8000-000000000002'),1::bigint,'cross-actor calls cannot alter explicitly started own attempt count');
select is((select count(*) from course_library_private.quiz_attempts where release_id='d1000000-0000-4000-8000-000000000002'),0::bigint,'no attempts or score are imported into another edition');
select ok((select a.user_id=e.user_id and a.release_id=e.release_id and a.course_id=e.course_id and a.assessment_set_id=s.assessment_set_id from course_library_private.quiz_attempts a join course_library_private.course_enrollments e using(enrollment_id) join course_library_private.course_assessment_sets s on s.release_id=a.release_id where a.attempt_id=(select (body->>'attempt_id')::uuid from quiz_responses where name='first')),'attempt ownership and assessment are bound by server to exact enrollment');
select pg_temp.quiz_actor(null,null);
set local role authenticated;
select throws_ok($$select public.finish_course_quiz((select (body->>'attempt_id')::uuid from quiz_responses where name='first'))$$,'42501','authentication_required','historical receipt still requires authenticated live principal');
reset role;
select * from finish();
rollback;
