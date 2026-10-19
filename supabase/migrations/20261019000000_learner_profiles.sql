-- Identity foundation only. No enrollment, class, staff, or sample-learning records.
begin;

create table public.learner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  revision bigint not null default 1,
  updated_at timestamptz not null default pg_catalog.clock_timestamp(),
  constraint learner_profiles_revision_positive check (revision > 0),
  constraint learner_profiles_display_name_valid check (
    display_name is null or (
      pg_catalog.char_length(display_name) between 1 and 40
      and display_name = pg_catalog.btrim(
        pg_catalog.regexp_replace(display_name, '[[:space:]]+', ' ', 'g')
      )
    )
  )
);

alter table public.learner_profiles enable row level security;

-- Explicitly remove automatic grants as well as PUBLIC inheritance. Clients
-- may read their own row; every mutation goes through an actor-bound RPC.
revoke all on table public.learner_profiles from public, anon, authenticated, service_role;
grant select on table public.learner_profiles to authenticated;

create policy learner_profiles_select_own
  on public.learner_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.ensure_learner_profile()
returns setof public.learner_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  -- Auth metadata is user-editable. Only this optional presentation string is
  -- read, only on creation; it never supplies identity, verification or roles.
  select case
    when pg_catalog.jsonb_typeof(u.raw_user_meta_data -> 'display_name') = 'string'
    then nullif(
      pg_catalog.btrim(pg_catalog.left(
        pg_catalog.btrim(pg_catalog.regexp_replace(
          u.raw_user_meta_data ->> 'display_name', '[[:space:]]+', ' ', 'g'
        )),
        40
      )),
      ''
    )
    else null
  end
  into v_display_name
  from auth.users as u
  where u.id = v_user_id;

  if not found then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  insert into public.learner_profiles (user_id, display_name)
  values (v_user_id, v_display_name)
  on conflict (user_id) do nothing;

  return query
    select p.* from public.learner_profiles as p where p.user_id = v_user_id;
end;
$$;

create function public.update_learner_profile(
  p_display_name text,
  p_expected_revision bigint
)
returns setof public.learner_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if p_expected_revision is null or p_expected_revision < 1 then
    raise exception using errcode = '22023', message = 'invalid_expected_revision';
  end if;

  v_display_name := nullif(
    pg_catalog.btrim(pg_catalog.regexp_replace(p_display_name, '[[:space:]]+', ' ', 'g')),
    ''
  );
  if pg_catalog.char_length(v_display_name) > 40 then
    raise exception using errcode = '22023', message = 'invalid_display_name';
  end if;

  return query
    update public.learner_profiles as p
    set display_name = v_display_name,
        revision = p.revision + 1,
        updated_at = pg_catalog.clock_timestamp()
    where p.user_id = v_user_id and p.revision = p_expected_revision
    returning p.*;

  if not found then
    if exists (select 1 from public.learner_profiles as p where p.user_id = v_user_id) then
      raise exception using errcode = '40001', message = 'profile_revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'profile_not_found';
  end if;
end;
$$;

-- Function creation defaults can grant PUBLIC and direct client privileges.
-- Revoke each explicitly; only authenticated requests can execute these RPCs.
revoke all on function public.ensure_learner_profile() from public, anon, authenticated, service_role;
revoke all on function public.update_learner_profile(text, bigint) from public, anon, authenticated, service_role;
grant execute on function public.ensure_learner_profile() to authenticated;
grant execute on function public.update_learner_profile(text, bigint) to authenticated;

comment on table public.learner_profiles is
  'Private learner presentation profile. No role, verification, enrollment or class authority.';
comment on function public.ensure_learner_profile() is
  'Idempotently creates or returns the authenticated actor profile; does not overwrite an existing row.';
comment on function public.update_learner_profile(text, bigint) is
  'Updates only the authenticated actor display name with an expected-revision check.';

commit;
