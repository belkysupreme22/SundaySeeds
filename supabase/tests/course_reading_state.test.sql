-- SOURCE ONLY; owner-run on an isolated Supabase development database after
-- 20261023130307_connected_course_reading_state.sql and its prerequisites.
-- No real accounts, course content or progress; every fixture rolls back.
-- Single-session coverage does not establish concurrent transaction behavior.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,email,email_confirmed_at,is_anonymous) values
 ('a3000000-0000-4000-8000-000000000001','a@reading-state-test.invalid',now(),false),
 ('a3000000-0000-4000-8000-000000000002','b@reading-state-test.invalid',now(),false),
 ('a3000000-0000-4000-8000-000000000003','unverified@reading-state-test.invalid',null,false);
insert into auth.sessions(id,user_id,created_at,updated_at,not_after) values
 ('b3000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001',now(),now(),now()+interval '1 hour'),
 ('b3000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002',now(),now(),now()+interval '1 hour'),
 ('b3000000-0000-4000-8000-000000000003','a3000000-0000-4000-8000-000000000003',now(),now(),now()+interval '1 hour'),
 ('b3000000-0000-4000-8000-000000000004','a3000000-0000-4000-8000-000000000001',now(),now(),now()-interval '1 hour');
create function pg_temp.reading_actor(p_actor uuid,p_session uuid) returns void
language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub',coalesce(p_actor::text,''),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',p_actor,
   'role','authenticated','session_id',p_session)::text,true);
end; $$;

insert into course_library_private.courses(course_id)
 values ('c3000000-0000-4000-8000-000000000001');
insert into course_library_private.course_releases(release_id,course_id,edition_number,snapshot,is_available)
select ('d3000000-0000-4000-8000-00000000000'||edition)::uuid,
 'c3000000-0000-4000-8000-000000000001',edition,
 '{"title":"Isolated reading fixture","modules":[{"id":"module-one","title":"Module","lessons":[{"id":"lesson-one","title":"First","scripture":"Luke 10"},{"id":"lesson-two","title":"Second","scripture":"Luke 11"}]}]}'::jsonb,true
from generate_series(1,2) edition;
insert into course_library_private.course_lesson_readings(release_id,course_id,lesson_id,body)
select r.release_id,r.course_id,l->>'id',jsonb_build_object(
 'id',l->>'id','title',l->>'title','subtitle','Reading','scripture',l->>'scripture',
 'estimatedMinutes',5,'intro','Fixture reading',
 'outcomes',jsonb_build_array(jsonb_build_object('title','Learn','description','Read carefully')),
 'memoryVerse',jsonb_build_object('text','Fixture quotation','reference','Fixture'),
 'sections',jsonb_build_array(
   jsonb_build_object('id',case when r.edition_number=1 and l->>'id'='lesson-one'
     then 'section A / 1' else 'first-'||r.edition_number||'-'||(l->>'id') end,
     'title','First section','body','First paragraph'),
   jsonb_build_object('id','last-'||(l->>'id'),'title','Last section','body','Last paragraph')))
from course_library_private.course_releases r,
 lateral jsonb_array_elements(r.snapshot->'modules') m,
 lateral jsonb_array_elements(m->'lessons') l
where r.course_id='c3000000-0000-4000-8000-000000000001';
insert into course_library_private.course_enrollments(user_id,course_id,release_id) values
 ('a3000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001'),
 ('a3000000-0000-4000-8000-000000000002','c3000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000002');

select ok(not has_table_privilege('authenticated','course_library_private.lesson_reading_state','SELECT,INSERT,UPDATE,DELETE'),'authenticated has no direct state grants');
select ok(not has_table_privilege('service_role','course_library_private.lesson_reading_state','SELECT,INSERT,UPDATE,DELETE'),'service role has no direct state grants');
select ok(not has_function_privilege('authenticated','course_library_private.write_course_reading_state(uuid,uuid,text,text,text,boolean,bigint)','EXECUTE'),'internal writer cannot be called by client');
select ok(not has_function_privilege('authenticated','course_library_private.lock_course_reading_access(uuid,uuid,text)','EXECUTE'),'internal access helper cannot be called by client');
select ok(not has_function_privilege('anon','public.get_my_course_reading_state(uuid,text)','EXECUTE'),'anonymous cannot Get');
select ok(not has_function_privilege('anon','public.save_course_reading_position(uuid,text,text,bigint)','EXECUTE'),'anonymous cannot save position');
select ok(not has_function_privilege('anon','public.set_course_lesson_bookmark(uuid,text,boolean,bigint)','EXECUTE'),'anonymous cannot bookmark');
select ok(not has_function_privilege('service_role','public.set_course_lesson_bookmark(uuid,text,boolean,bigint)','EXECUTE'),'service role has no client bookmark grant');
select ok((select relrowsecurity from pg_class where oid='course_library_private.lesson_reading_state'::regclass),'private state RLS enabled');

select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000004');
set local role authenticated;
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')$$,'42501','authentication_required','expired live session denied');
reset role;
select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000003','b3000000-0000-4000-8000-000000000003');
set local role authenticated;
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')$$,'42501','email_verification_required','unverified actor denied');
reset role;
select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000002');
set local role authenticated;
select throws_ok($$select public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',false,0)$$,'42501','authentication_required','other actor session cannot acknowledge even unchanged value');
reset role;
select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001');
set local role authenticated;
select throws_ok($$select * from course_library_private.lesson_reading_state$$,'42501',null,'state table cannot be read directly');
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')->'section_id','null'::jsonb,'authorized missing state has null section');
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')->'position_revision','0'::jsonb,'missing position is known revision zero');
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')->'is_bookmarked','false'::jsonb,'missing bookmark is known false');
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')->>'release_id','d3000000-0000-4000-8000-000000000001','Get binds joined edition');
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one') - array['enrollment_id','user_id','course_id','release_id','lesson_id','section_id','position_revision','is_bookmarked','bookmark_revision'],'{}'::jsonb,'ack has explicit flat allowlist');
select throws_ok($$select public.get_my_course_reading_state(null,'lesson-one')$$,'22023','invalid_reading_request','null course rejected');
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','missing')$$,'P0002','reading_unavailable','guessed lesson rejected');
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000099','lesson-one')$$,'P0002','reading_unavailable','unenrolled course never receives empty ack');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one',null,0)$$,'22023','invalid_reading_request','null position write rejected');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','first-2-lesson-one',0)$$,'22023','invalid_reading_request','section from another edition rejected');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','last-lesson-two',0)$$,'22023','invalid_reading_request','section from another lesson rejected');
select throws_ok($$select public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,-1)$$,'22023','invalid_reading_request','negative revision rejected');
select throws_ok($$select public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',false,1)$$,'40001','reading_state_conflict','future revision rejected even for same desired value');
reset role;
select is((select count(*) from course_library_private.lesson_reading_state),0::bigint,'Get and rejected writes retained no state rows');
set local role authenticated;
select is(public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,0)->'bookmark_revision','1'::jsonb,'first bookmark advances only own revision');
select is(public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,0)->'bookmark_revision','1'::jsonb,'lost-response same desired retry does not advance');
select is(public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','section A / 1',0)->'position_revision','1'::jsonb,'real non-slug exact section accepted independently of bookmark revision');
select is(public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','section A / 1',0)->'bookmark_revision','1'::jsonb,'position retry preserves bookmark');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one',null,1)$$,'22023','invalid_reading_request','saved position cannot be cleared into incompatible null revision');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','last-lesson-one',0)$$,'40001','reading_state_conflict','stale different position cannot overwrite');
select is(public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','last-lesson-one',1)->'position_revision','2'::jsonb,'fresh position advances');
select is(public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',false,1)->'bookmark_revision','2'::jsonb,'bookmark clears independently of advanced position revision');
select throws_ok($$select public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,1)$$,'40001','reading_state_conflict','stale changed bookmark cannot overwrite');
reset role;

select throws_ok($$update course_library_private.lesson_reading_state set user_id='a3000000-0000-4000-8000-000000000002'$$,'22023','invalid_reading_request','guard rejects actor rebinding');
select throws_ok($$update course_library_private.lesson_reading_state set position_revision=position_revision+1$$,'22023','invalid_reading_request','unchanged position cannot advance revision');
select throws_ok($$update course_library_private.lesson_reading_state set section_id='section A / 1'$$,'22023','invalid_reading_request','changed position must advance revision');
select throws_ok($$update course_library_private.lesson_reading_state set section_id='unknown',position_revision=position_revision+1$$,'22023','invalid_reading_request','guard rejects forged section');
select throws_ok($$update course_library_private.lesson_reading_state set bookmark_revision=bookmark_revision+1$$,'22023','invalid_reading_request','unchanged bookmark cannot advance revision');

select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000002','b3000000-0000-4000-8000-000000000002');
set local role authenticated;
select is(public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')->'position_revision','0'::jsonb,'another account has no inherited position');
select is(public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,0)->>'release_id','d3000000-0000-4000-8000-000000000002','other account keeps own pinned edition');
reset role;
update course_library_private.course_enrollments set state='revoked'
 where user_id='a3000000-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')$$,'42501','access_revoked','revoked learner cannot read state');
select throws_ok($$select public.set_course_lesson_bookmark('c3000000-0000-4000-8000-000000000001','lesson-one',true,0)$$,'42501','access_revoked','revoked unchanged retry denied');
reset role;
select pg_temp.reading_actor('a3000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001');
update course_library_private.course_releases set is_available=false
 where release_id='d3000000-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select public.get_my_course_reading_state('c3000000-0000-4000-8000-000000000001','lesson-one')$$,'P0002','reading_unavailable','withdrawn pinned release denied');
select throws_ok($$select public.save_course_reading_position('c3000000-0000-4000-8000-000000000001','lesson-one','last-lesson-one',1)$$,'P0002','reading_unavailable','withdrawn unchanged position retry denied');
reset role;
delete from auth.users where id='a3000000-0000-4000-8000-000000000001';
select is((select count(*) from course_library_private.lesson_reading_state where user_id='a3000000-0000-4000-8000-000000000001'),0::bigint,'Auth deletion cascades own reading state');
select is((select count(*) from course_library_private.lesson_reading_state where user_id='a3000000-0000-4000-8000-000000000002'),1::bigint,'Auth deletion preserves other account state');
select * from finish();
rollback;
