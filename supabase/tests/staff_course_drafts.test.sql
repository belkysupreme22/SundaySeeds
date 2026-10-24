-- SOURCE ONLY: not executed by the authoring increment.
-- Owner-run on an isolated Supabase development database after
-- 20261024084826_staff_course_drafts.sql and its prerequisites.
-- Fake identities/content only; all fixtures and pgTAP installation roll back.
-- Single-session coverage does not establish concurrent lock/revocation behavior.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,email,email_confirmed_at,is_anonymous,raw_user_meta_data) values
 ('a4000000-0000-4000-8000-000000000001','author-a@staff-draft-test.invalid',now(),false,'{}'),
 ('a4000000-0000-4000-8000-000000000002','author-b@staff-draft-test.invalid',now(),false,'{}'),
 ('a4000000-0000-4000-8000-000000000003','unassigned@staff-draft-test.invalid',now(),false,'{"role":"admin","canPublish":true}'),
 ('a4000000-0000-4000-8000-000000000004','unverified@staff-draft-test.invalid',null,false,'{}'),
 ('a4000000-0000-4000-8000-000000000005','anonymous@staff-draft-test.invalid',now(),true,'{}');
insert into auth.sessions(id,user_id,created_at,updated_at,not_after)
select ('b4000000-0000-4000-8000-00000000000'||n)::uuid,
 ('a4000000-0000-4000-8000-00000000000'||n)::uuid,
 now(),now(),now()+interval '1 hour' from generate_series(1,5) n;
insert into auth.sessions(id,user_id,created_at,updated_at,not_after) values
 ('b4000000-0000-4000-8000-000000000006','a4000000-0000-4000-8000-000000000001',now(),now(),now()-interval '1 hour'),
 ('b4000000-0000-4000-8000-000000000007','a4000000-0000-4000-8000-000000000001',now(),now(),now()+interval '1 hour');
delete from auth.sessions where id='b4000000-0000-4000-8000-000000000007';
create function pg_temp.staff_actor(p_actor uuid,p_session uuid) returns void
language plpgsql as $$ begin
 perform set_config('request.jwt.claim.sub',coalesce(p_actor::text,''),true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',p_actor,
   'role','authenticated','session_id',p_session,
   'user_metadata',jsonb_build_object('role','admin','verified',true,
     'canPublish',true,'course_id','c4000000-0000-4000-8000-000000000001'))::text,true);
end; $$;
create function pg_temp.staff_content(p_title text default '') returns jsonb
language sql as $$ select jsonb_build_object('schemaVersion',1,'course',
 jsonb_build_object('title',p_title,'summary','','audience','','topics','[]'::jsonb,
 'learningGoals','[]'::jsonb,'outcomes','[]'::jsonb,'language','','level',null,
 'estimatedMinutes',null,'estimateBasis',null),'modules','[]'::jsonb,'lessons','[]'::jsonb); $$;
create function pg_temp.staff_lesson_content(p_title text default '') returns jsonb
language sql as $$ select pg_temp.staff_content(p_title)||'{"modules":[{"id":"module-one","title":"","lessonIds":["lesson-one"]}],"lessons":[{"id":"lesson-one","title":"","subtitle":"","scripture":"","estimatedMinutes":null,"intro":"","outcomes":[{"title":"","description":""}],"memoryVerse":{"text":"","reference":""},"sections":[{"id":"section-one","title":"","body":""}],"reflection":"Authored draft reflection","quiz":[{"id":"check-one","prompt":"","options":[],"correctOptionId":null,"explanation":""}]}]}'::jsonb; $$;

insert into course_library_private.courses(course_id)
select ('c4000000-0000-4000-8000-00000000000'||n)::uuid from generate_series(1,3) n;
insert into staff_authoring_private.course_author_assignments(user_id,course_id) values
 ('a4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001'),
 ('a4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000002'),
 ('a4000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000001'),
 ('a4000000-0000-4000-8000-000000000004','c4000000-0000-4000-8000-000000000001'),
 ('a4000000-0000-4000-8000-000000000005','c4000000-0000-4000-8000-000000000001');
create temporary table staff_responses(name text primary key,body jsonb not null);
grant select,insert on staff_responses to authenticated;

-- Private storage and the complete callable boundary, independent of fixtures.
select ok(not has_table_privilege(r,t,'SELECT,INSERT,UPDATE,DELETE'),r||' has no direct privileges on '||t)
from unnest(array['anon','authenticated','service_role']) r,
 unnest(array['staff_authoring_private.course_author_assignments',
 'staff_authoring_private.course_drafts','staff_authoring_private.draft_save_receipts',
 'staff_authoring_private.draft_save_audit']) t;
select ok(c.relrowsecurity,'RLS enabled on '||c.relname)
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='staff_authoring_private' and c.relkind='r';
select ok(not p.prosecdef,'public wrapper is invoker: '||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft');
select ok(p.prosecdef,'private operation is definer: '||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='staff_authoring_private' and p.proname in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft');
select ok(coalesce(p.proconfig @> array['search_path=""'],false),'empty search path on '||n.nspname||'.'||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='staff_authoring_private' or (n.nspname='public' and p.proname in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft'));
select ok(has_function_privilege('authenticated',p.oid,'EXECUTE'), 'authenticated may execute '||n.nspname||'.'||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','staff_authoring_private') and p.proname in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft');
select ok(not has_function_privilege(r,p.oid,'EXECUTE'), r||' cannot execute '||n.nspname||'.'||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace,
 unnest(array['anon','service_role']) r
where n.nspname='staff_authoring_private' or (n.nspname='public' and p.proname in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft'));
select ok(not has_function_privilege('authenticated',p.oid,'EXECUTE'),'internal helper is owner-only: '||p.proname)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='staff_authoring_private' and p.proname not in
 ('list_my_authoring_courses','get_my_course_draft','save_my_course_draft');

set local role anon;
select throws_ok($$select public.list_my_authoring_courses()$$,'42501',null,'anon cannot call staff List');
select throws_ok($$select public.get_my_course_draft(null)$$,'42501',null,'anon cannot call staff Get');
select throws_ok($$select public.save_my_course_draft(null,null,null,null)$$,'42501',null,'anon cannot call staff Save');
select throws_ok($$select * from staff_authoring_private.course_drafts$$,'42501',null,'anon cannot read private drafts');
reset role;
set local role service_role;
select throws_ok($$select * from staff_authoring_private.course_drafts$$,'42501',null,'service role cannot read private drafts through client grants');
select throws_ok($$select public.list_my_authoring_courses()$$,'42501',null,'service role has no staff List entrypoint grant');
reset role;

-- Current Auth state, rather than editable metadata or stale JWT assertions.
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000006');
set local role authenticated;
select throws_ok($$select public.list_my_authoring_courses()$$,'42501','authentication_required','expired session denied');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000007');
set local role authenticated;
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')$$,'42501','authentication_required','deleted session denied');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000002');
set local role authenticated;
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'42501','authentication_required','another user session cannot save');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000004','b4000000-0000-4000-8000-000000000004');
set local role authenticated;
select throws_ok($$select public.list_my_authoring_courses()$$,'42501','email_verification_required','unverified author denied despite assignment and forged verified claim');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000005','b4000000-0000-4000-8000-000000000005');
set local role authenticated;
select throws_ok($$select public.list_my_authoring_courses()$$,'42501','authentication_required','anonymous Auth identity denied despite assignment');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000003','b4000000-0000-4000-8000-000000000003');
set local role authenticated;
select is(public.list_my_authoring_courses()->'courses','[]'::jsonb,'editable admin metadata confers no author assignments');
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')$$,'42501','staff_access_required','unassigned actor cannot read another teacher draft');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'42501','staff_access_required','forged admin metadata cannot save');
reset role;

select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000001');
set local role authenticated;
select throws_ok($$select * from staff_authoring_private.course_drafts$$,'42501',null,'authenticated cannot directly read draft storage');
select throws_ok($$select staff_authoring_private.valid_course_draft(pg_temp.staff_content())$$,'42501',null,'authenticated cannot call internal content helper');
select throws_ok($$select staff_authoring_private.lock_author_access('a4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001')$$,'42501',null,'authenticated cannot bypass entrypoints through internal access helper');
select throws_ok($$insert into staff_authoring_private.course_author_assignments(user_id,course_id) values ('a4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000003')$$,'42501',null,'author cannot self-assign');
insert into staff_responses values('list-empty',public.list_my_authoring_courses());
select is((select body->>'actor_id' from staff_responses where name='list-empty'),'a4000000-0000-4000-8000-000000000001','List derives exact current actor');
select is((select body - array['actor_id','courses'] from staff_responses where name='list-empty'),'{}'::jsonb,'List response has explicit allowlist');
select is((select jsonb_array_length(body->'courses') from staff_responses where name='list-empty'),2,'List includes only two explicitly assigned courses');
select ok(not exists(select 1 from staff_responses r,lateral jsonb_array_elements(r.body->'courses') c where r.name='list-empty' and (c->'draft_id'<>'null'::jsonb or c->'revision'<>'0'::jsonb)),'assigned courses without drafts have explicit null ID and revision zero');
select is(public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')->'draft','null'::jsonb,'authorized missing draft is null');
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000003')$$,'42501','staff_access_required','existing unassigned course denied');
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000099')$$,'42501','staff_access_required','guessed course has same denied outcome');
select throws_ok($$select public.get_my_course_draft(null)$$,'22023','invalid_draft_request','null course rejected');
reset role;
select is((select count(*) from staff_authoring_private.course_drafts),0::bigint,'List/Get and rejected calls never insert a draft');

-- Malformed inputs cannot create drafts, receipts or successful-save audit.
set local role authenticated;
select throws_ok($$select public.save_my_course_draft(null,0,'e4000000-0000-4000-8000-000000000009',pg_temp.staff_content())$$,'22023','invalid_draft_request','null save course rejected');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',null,'e4000000-0000-4000-8000-000000000009',pg_temp.staff_content())$$,'22023','invalid_draft_request','null expected revision rejected');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',-1,'e4000000-0000-4000-8000-000000000009',pg_temp.staff_content())$$,'22023','invalid_draft_request','negative expected revision rejected');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',9007199254740992,'e4000000-0000-4000-8000-000000000009',pg_temp.staff_content())$$,'22023','invalid_draft_request','unsafe expected revision rejected');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,null,pg_temp.staff_content())$$,'22023','invalid_draft_request','null request key rejected');
select throws_ok(format('select public.save_my_course_draft(%L,0,%L,%s)',
 'c4000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000009',v),
 '22023','invalid_draft_content','invalid draft root rejected: '||v)
from unnest(array['null::jsonb','''null''::jsonb','''1''::jsonb','''[]''::jsonb','''{}''::jsonb']) v;
select throws_ok(format('select public.save_my_course_draft(%L,0,%L,%L::jsonb)',
 'c4000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000009',payload),
 '22023','invalid_draft_content',label)
from (values
 (pg_temp.staff_content()||'{"schemaVersion":2}'::jsonb,'unsupported schema version rejected'),
 (pg_temp.staff_content()||'{"image":{"uri":"data:image/png;base64,fixture"}}'::jsonb,'temporary media field rejected'),
 (pg_temp.staff_content()-'modules','missing required root key rejected'),
 (pg_temp.staff_content()||'{"lessons":null}'::jsonb,'null lessons rejected'),
 (jsonb_set(pg_temp.staff_content(),'{course,title}','1'),'nonstring title rejected'),
 (jsonb_set(pg_temp.staff_content(),'{course,estimatedMinutes}','5'),'estimate without basis rejected'),
 (jsonb_set(pg_temp.staff_content(),'{course,topics}','[null]'),'null topic rejected'),
 (jsonb_set(pg_temp.staff_content(),'{modules}','[{"id":"module","title":"","lessonIds":["missing"]}]'),'linked nonexistent lesson rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0}','null'),'null lesson rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,outcomes}','1'),'scalar lesson outcomes rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,memoryVerse}','null'),'null verse rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,sections}','null'),'null sections rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,sections,0,body}','"data:image/png;base64,fixture"'),'inline data URL in text rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,quiz}','null'),'null quiz rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,quiz,0,options}','1'),'scalar options rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,quiz,0,correctOptionId}','"missing"'),'answer must refer to a real option'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{modules,0,id}','" "'),'blank stable ID rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{modules,0,lessonIds}','["lesson-one","lesson-one"]'),'one lesson cannot be linked twice'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons}',
   jsonb_build_array(pg_temp.staff_lesson_content()->'lessons'->0,pg_temp.staff_lesson_content()->'lessons'->0)),'duplicate lesson ID rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,sections}',
   jsonb_build_array(pg_temp.staff_lesson_content()->'lessons'->0->'sections'->0,pg_temp.staff_lesson_content()->'lessons'->0->'sections'->0)),'duplicate section ID rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,quiz}',
   jsonb_build_array(pg_temp.staff_lesson_content()->'lessons'->0->'quiz'->0,pg_temp.staff_lesson_content()->'lessons'->0->'quiz'->0)),'duplicate question ID rejected'),
 (jsonb_set(pg_temp.staff_lesson_content(),'{lessons,0,quiz,0,options}',
   '[{"id":"answer-one","text":""},{"id":"answer-one","text":""}]'),'duplicate option ID rejected')
) invalid(payload,label);
reset role;
select is((select count(*) from staff_authoring_private.course_drafts),0::bigint,'malformed calls leave no draft');
select is((select count(*) from staff_authoring_private.draft_save_receipts),0::bigint,'malformed calls leave no receipt');
select is((select count(*) from staff_authoring_private.draft_save_audit),0::bigint,'malformed and denied calls leave no successful-save audit');

-- First-save CAS, exact retries and request binding.
set local role authenticated;
insert into staff_responses values('first',public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content()));
select is((select body->'saved_revision' from staff_responses where name='first'),'1'::jsonb,'expected zero creates revision one');
select ok((select body->>'actor_id'='a4000000-0000-4000-8000-000000000001' and
 body->>'course_id'='c4000000-0000-4000-8000-000000000001' and
 body->>'request_key'='e4000000-0000-4000-8000-000000000001'
 from staff_responses where name='first'),'save acknowledgement binds exact actor/course/request');
select is((select body->'draft'->'content' from staff_responses where name='first'),pg_temp.staff_content(),'incomplete blank draft round trips without invented content');
select is((select body - array['actor_id','course_id','request_key','saved_revision','draft'] from staff_responses where name='first'),'{}'::jsonb,'save response has explicit allowlist');
select is((select body->'draft' - array['draft_id','revision','content','updated_at'] from staff_responses where name='first'),'{}'::jsonb,'draft response has explicit allowlist');
select ok((select body->'draft'->>'draft_id' is not null and body->'draft'->>'updated_at' is not null from staff_responses where name='first'),'save returns server draft identity and acknowledgement time');
select is(public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content()),(select body from staff_responses where name='first'),'exact same request returns same acknowledgement before other saves');
select is(public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')->'draft',(select body->'draft' from staff_responses where name='first'),'Get returns acknowledged saved draft');
select is((select c->>'title' from jsonb_array_elements(public.list_my_authoring_courses()->'courses') c where c->>'course_id'='c4000000-0000-4000-8000-000000000001'),'','List preserves an authored blank title');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content('Changed'))$$,'22023','draft_request_mismatch','same key cannot bind changed content');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',1,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'22023','draft_request_mismatch','same key cannot bind changed expected revision');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000002',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'22023','draft_request_mismatch','same actor key cannot bind another assigned course');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000002',pg_temp.staff_content('Second'))$$,'40001','draft_revision_conflict','second creator cannot overwrite an existing draft at revision zero');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',2,'e4000000-0000-4000-8000-000000000002',pg_temp.staff_content('Second'))$$,'40001','draft_revision_conflict','future revision rejected');
insert into staff_responses values('second',public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',1,'e4000000-0000-4000-8000-000000000002',pg_temp.staff_lesson_content('Second')));
select is((select body->'saved_revision' from staff_responses where name='second'),'2'::jsonb,'fresh CAS update advances revision');
select is((select body->'draft'->'draft_id' from staff_responses where name='second'),(select body->'draft'->'draft_id' from staff_responses where name='first'),'updates retain server draft identity');
select is((select body->'draft'->'content' from staff_responses where name='second'),pg_temp.staff_lesson_content('Second'),'structured incomplete lesson, reflection and nullable unfinished quiz round trip exactly');
reset role;
select is((select count(*) from staff_authoring_private.draft_save_receipts),2::bigint,'retry and failures did not append receipts');
select is((select count(*) from staff_authoring_private.draft_save_audit),2::bigint,'only two actual saves appended audit events');

-- Same key under another actor is independent; replay sees current shared draft.
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000002','b4000000-0000-4000-8000-000000000002');
set local role authenticated;
select is(jsonb_array_length(public.list_my_authoring_courses()->'courses'),1,'second author sees only their own assignment');
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000002')$$,'42501','staff_access_required','course assigned to first author remains private from second');
insert into staff_responses values('other-author',public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',2,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content('Other author')));
select is((select body->'saved_revision' from staff_responses where name='other-author'),'3'::jsonb,'same request UUID is independent for another actor');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000001');
set local role authenticated;
insert into staff_responses values('old-replay',public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content()));
select is((select body->'saved_revision' from staff_responses where name='old-replay'),'1'::jsonb,'old retry retains its original saved revision');
select is((select body->'draft' from staff_responses where name='old-replay'),(select body->'draft' from staff_responses where name='other-author'),'old retry returns current draft without rolling back another author');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',2,'e4000000-0000-4000-8000-000000000003',pg_temp.staff_content('Stale'))$$,'40001','draft_revision_conflict','stale editor cannot overwrite another author');
insert into staff_responses values('latest',public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',3,'e4000000-0000-4000-8000-000000000003',pg_temp.staff_content('Other author')));
select is((select body->'saved_revision' from staff_responses where name='latest'),'4'::jsonb,'new request with identical content is a new acknowledged save');
select is(public.save_my_course_draft('c4000000-0000-4000-8000-000000000002',0,'e4000000-0000-4000-8000-000000000004',pg_temp.staff_content('Second course'))->'saved_revision','1'::jsonb,'different assigned course has independent revision sequence');
reset role;
select is((select count(*) from staff_authoring_private.draft_save_receipts),5::bigint,'five successful requests have five receipts');
select is((select count(*) from staff_authoring_private.draft_save_audit),5::bigint,'five successful requests have five minimal events');
select throws_ok($$update staff_authoring_private.draft_save_receipts set payload=pg_temp.staff_content('Forged')$$,'22023','immutable_draft_save_record','acknowledged receipt cannot be rewritten');
select throws_ok($$update staff_authoring_private.draft_save_audit set saved_revision=1$$,'22023','immutable_draft_save_record','successful event cannot be rewritten');
select ok(not exists(select 1 from staff_authoring_private.draft_save_audit a where
 to_jsonb(a) ?| array['content','payload','password','token','reflection']), 'audit rows contain no draft content or credentials');
select ok(not exists(select 1 from staff_authoring_private.draft_save_audit a left join
 staff_authoring_private.draft_save_receipts r on r.actor_id=a.actor_id and r.request_key=a.request_key
 where r.actor_id is null or r.course_id<>a.course_id or r.saved_revision<>a.saved_revision or r.saved_at<>a.saved_at),'audit events bind exact successful receipt scope/revision/time');

-- Current revocation denies new operations and exact old-request replay.
update staff_authoring_private.course_author_assignments set state='revoked',revision=revision+1
where user_id='a4000000-0000-4000-8000-000000000001' and course_id='c4000000-0000-4000-8000-000000000001';
select throws_ok($$update staff_authoring_private.course_author_assignments set state='active',revision=revision+1 where user_id='a4000000-0000-4000-8000-000000000001' and course_id='c4000000-0000-4000-8000-000000000001'$$,'22023','invalid_staff_assignment','revoked assignment cannot be reactivated by this lifecycle');
set local role authenticated;
select is(jsonb_array_length(public.list_my_authoring_courses()->'courses'),1,'List filters currently revoked assignment');
select throws_ok($$select public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')$$,'42501','staff_access_required','revoked author cannot Get');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',4,'e4000000-0000-4000-8000-000000000005',pg_temp.staff_content())$$,'42501','staff_access_required','revoked author cannot make a new save');
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'42501','staff_access_required','revoked author cannot replay old receipt or recover private draft');
reset role;
select is((select count(*) from staff_authoring_private.draft_save_audit),5::bigint,'revocation denials create no successful event');

-- Auth deletion removes attribution, not the shared course-owned draft/history.
delete from auth.users where id='a4000000-0000-4000-8000-000000000001';
select is((select count(*) from staff_authoring_private.course_author_assignments where user_id='a4000000-0000-4000-8000-000000000001'),0::bigint,'Auth deletion removes own assignments');
select is((select count(*) from staff_authoring_private.draft_save_receipts where actor_id='a4000000-0000-4000-8000-000000000001'),0::bigint,'Auth deletion removes own receipts');
select is((select count(*) from staff_authoring_private.draft_save_audit where actor_id='a4000000-0000-4000-8000-000000000001'),0::bigint,'Auth deletion removes own save events');
select is((select count(*) from staff_authoring_private.course_drafts),2::bigint,'Auth deletion preserves both course-owned drafts');
select is((select count(*) from staff_authoring_private.course_drafts where updated_by is null),2::bigint,'deleted updater references become null');
select is((select revision from staff_authoring_private.course_drafts where course_id='c4000000-0000-4000-8000-000000000001'),4::bigint,'shared draft revision survives Auth deletion');
select is((select content from staff_authoring_private.course_drafts where course_id='c4000000-0000-4000-8000-000000000001'),pg_temp.staff_content('Other author'),'shared draft content survives Auth deletion');
select is((select count(*) from staff_authoring_private.course_author_assignments where user_id='a4000000-0000-4000-8000-000000000002'),1::bigint,'another author assignment survives');
select is((select count(*) from staff_authoring_private.draft_save_receipts where actor_id='a4000000-0000-4000-8000-000000000002'),1::bigint,'another author receipt survives');
select is((select count(*) from staff_authoring_private.draft_save_audit where actor_id='a4000000-0000-4000-8000-000000000002'),1::bigint,'another author event survives');
set local role authenticated;
select throws_ok($$select public.save_my_course_draft('c4000000-0000-4000-8000-000000000001',0,'e4000000-0000-4000-8000-000000000001',pg_temp.staff_content())$$,'42501','authentication_required','deleted user stale claims cannot replay a save');
reset role;
select pg_temp.staff_actor('a4000000-0000-4000-8000-000000000002','b4000000-0000-4000-8000-000000000002');
set local role authenticated;
select is(public.get_my_course_draft('c4000000-0000-4000-8000-000000000001')->'draft'->'revision','4'::jsonb,'remaining authorized author can still read shared draft');
reset role;

-- Pending separate two-session schedules: competing first inserts; stale author
-- updates; same actor/key races; save/revocation in both commit orders; Auth
-- deletion contention; whole-transaction retry after serialization/deadlock.
select * from finish();
rollback;
