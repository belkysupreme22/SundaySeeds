-- Owner-run only, on an isolated Supabase development database after migration.
-- Every fixture, metadata change and extension creation is rolled back.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'learner-a@profiles-test.invalid',
    '{"display_name":"  Alex \t Rivera  ","role":"admin","verified":true,"user_id":"22222222-2222-4222-8222-222222222222"}'::jsonb
  ),
  ('22222222-2222-4222-8222-222222222222', 'learner-b@profiles-test.invalid', '{}'::jsonb),
  (
    '33333333-3333-4333-8333-333333333333',
    'learner-c@profiles-test.invalid',
    pg_catalog.jsonb_build_object('display_name', pg_catalog.repeat('C', 60))
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'learner-d@profiles-test.invalid',
    '{"display_name":{"role":"admin"}}'::jsonb
  );

insert into public.learner_profiles (user_id, display_name)
values ('22222222-2222-4222-8222-222222222222', 'Bailey');

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.learner_profiles'::regclass),
  'learner profile table has RLS enabled'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.learner_profiles', 'SELECT,INSERT,UPDATE,DELETE'),
  'anonymous role has no profile grants'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.learner_profiles', 'INSERT,UPDATE,DELETE'),
  'authenticated clients have no direct write grants'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.ensure_learner_profile()', 'EXECUTE')
    and not pg_catalog.has_function_privilege('anon', 'public.update_learner_profile(text,bigint)', 'EXECUTE'),
  'anonymous callers cannot execute either profile RPC'
);
select results_eq(
  $$select column_name::text from information_schema.columns
    where table_schema = 'public' and table_name = 'learner_profiles'
    order by ordinal_position$$,
  array['user_id', 'display_name', 'revision', 'updated_at']::text[],
  'profile has presentation fields only; metadata has no authority column'
);

set local role anon;
select throws_ok($$select * from public.learner_profiles$$, '42501', null, 'anon cannot read profiles');
select throws_ok(
  $$insert into public.learner_profiles (user_id) values ('11111111-1111-4111-8111-111111111111')$$,
  '42501', null, 'anon cannot insert a profile'
);
select throws_ok($$update public.learner_profiles set display_name = 'Forged'$$, '42501', null, 'anon cannot update profiles');
select throws_ok($$delete from public.learner_profiles$$, '42501', null, 'anon cannot delete profiles');
select throws_ok($$select * from public.ensure_learner_profile()$$, '42501', null, 'anon cannot ensure profile');
select throws_ok($$select * from public.update_learner_profile('Forged', 1)$$, '42501', null, 'anon cannot save profile');
reset role;

-- The authenticated database role alone is not a principal.
select pg_catalog.set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select pg_catalog.set_config('request.jwt.claim.sub', '', true);
set local role authenticated;
select is((select count(*) from public.learner_profiles), 0::bigint, 'missing principal reads no profiles');
select throws_ok($$select * from public.ensure_learner_profile()$$, '42501', 'authentication_required', 'ensure requires a principal');
select throws_ok($$select * from public.update_learner_profile('Forged', 1)$$, '42501', 'authentication_required', 'save requires a principal');
reset role;

-- User-editable role/verification claims never become the database role or actor.
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","user_metadata":{"role":"admin","verified":true}}',
  true
);
select pg_catalog.set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
set local role authenticated;
select results_eq(
  $$select user_id::text, display_name, revision from public.ensure_learner_profile()$$,
  $$values ('11111111-1111-4111-8111-111111111111'::text, 'Alex Rivera'::text, 1::bigint)$$,
  'ensure creates the actor profile with normalized display metadata and server revision'
);
select is((select count(*) from public.learner_profiles), 1::bigint, 'admin metadata does not expose other profiles');
select is(
  (select count(*) from public.learner_profiles where user_id = '22222222-2222-4222-8222-222222222222'),
  0::bigint,
  'cross-user profile read returns no rows'
);
select ok(
  (select updated_at is not null and updated_at <= pg_catalog.clock_timestamp() from public.learner_profiles),
  'created profile has a server timestamp'
);
select throws_ok(
  $$insert into public.learner_profiles (user_id, display_name) values ('33333333-3333-4333-8333-333333333333', 'Forged')$$,
  '42501', null, 'client cannot create a profile for another identity'
);
select throws_ok(
  $$update public.learner_profiles set display_name = 'Forged' where user_id = '22222222-2222-4222-8222-222222222222'$$,
  '42501', null, 'client cannot write another identity profile'
);
select throws_ok(
  $$update public.learner_profiles set user_id = '33333333-3333-4333-8333-333333333333'$$,
  '42501', null, 'client cannot replace profile identity'
);
select throws_ok($$update public.learner_profiles set revision = 999$$, '42501', null, 'client cannot forge profile revision');
select throws_ok($$update public.learner_profiles set updated_at = '2000-01-01'$$, '42501', null, 'client cannot forge server timestamp');
select throws_ok($$delete from public.learner_profiles$$, '42501', null, 'client cannot delete its own profile');
select throws_ok(
  $$select * from public.ensure_learner_profile('22222222-2222-4222-8222-222222222222'::uuid)$$,
  '42883', null, 'ensure has no caller-selected identity argument'
);
select results_eq(
  $$select user_id::text, display_name, revision from public.update_learner_profile(E'  Alex\n Rivera-Smith  ', 1)$$,
  $$values ('11111111-1111-4111-8111-111111111111'::text, 'Alex Rivera-Smith'::text, 2::bigint)$$,
  'RPC updates only own normalized display name and increments revision'
);
select throws_ok(
  $$select * from public.update_learner_profile('Stale save', 1)$$,
  '40001', 'profile_revision_conflict', 'stale revision cannot overwrite a newer save'
);
select is((select display_name from public.learner_profiles), 'Alex Rivera-Smith', 'failed conflict preserves acknowledged name');
select throws_ok(
  $$select * from public.update_learner_profile(repeat('x', 41), 2)$$,
  '22023', 'invalid_display_name', 'oversized explicit name is rejected without silent truncation'
);
select throws_ok($$select * from public.update_learner_profile('Name', 0)$$, '22023', 'invalid_expected_revision', 'nonpositive revision is rejected');
select throws_ok($$select * from public.update_learner_profile('Name', null)$$, '22023', 'invalid_expected_revision', 'null revision is rejected');
select results_eq(
  $$select display_name, revision from public.update_learner_profile(E' \t\n ', 2)$$,
  $$values (null::text, 3::bigint)$$,
  'blank normalized name clears the optional field'
);
reset role;

-- A later editable Auth metadata change cannot overwrite the acknowledged row.
update auth.users
set raw_user_meta_data = '{"display_name":"Unexpected overwrite","role":"admin"}'::jsonb
where id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
select results_eq(
  $$select display_name, revision from public.ensure_learner_profile()$$,
  $$values (null::text, 3::bigint)$$,
  'ensure is idempotent and never overwrites profile from later metadata'
);
select is(
  (select count(*) from public.ensure_learner_profile()),
  1::bigint,
  'repeated ensure returns exactly one actor profile'
);
reset role;

select pg_catalog.set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select pg_catalog.set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
set local role authenticated;
select throws_ok(
  $$select * from public.update_learner_profile('Not yet provisioned', 1)$$,
  'P0002', 'profile_not_found', 'missing profile has a distinct retry-provisioning error'
);
select is(
  (select char_length(display_name) from public.ensure_learner_profile()),
  40,
  'untrusted signup metadata is capped before initial provisioning'
);
reset role;

select pg_catalog.set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select pg_catalog.set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
set local role authenticated;
select ok(
  (select display_name is null from public.ensure_learner_profile()),
  'non-string metadata cannot become profile text'
);
reset role;

select is(
  (select display_name from public.learner_profiles where user_id = '22222222-2222-4222-8222-222222222222'),
  'Bailey',
  'other identity profile is unchanged by every actor A operation'
);

select * from finish();
rollback;
