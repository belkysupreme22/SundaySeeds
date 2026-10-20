-- Applied to sundayseeds-dev through Supabase MCP on 20 October 2026.
-- Filename uses the actual remote migration version returned by list_migrations.
-- The existing learner_profiles migration history remains unreconciled: do not
-- replay that foundation or blanket-push local migrations. Permission/runtime
-- verification for this additive preferences migration remains pending.
begin;

create table public.learner_learning_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  intention text,
  interests text[] not null default '{}',
  familiarity text,
  session_minutes integer,
  setup_status text not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default pg_catalog.clock_timestamp(),
  constraint learning_preferences_intention_valid check (
    intention is null or intention in (
      'explore_faith', 'understand_bible', 'prayer_habit', 'daily_practice',
      'deeper_study', 'browsing'
    )
  ),
  constraint learning_preferences_interests_valid check (
    case
      when pg_catalog.cardinality(interests) = 0 then true
      when pg_catalog.cardinality(interests) > 3
        or pg_catalog.array_ndims(interests) <> 1
        or pg_catalog.array_lower(interests, 1) <> 1 then false
      else
        interests <@ array['Faith', 'Prayer', 'Kindness', 'Courage']::text[]
        and pg_catalog.array_position(interests, null) is null
        and pg_catalog.cardinality(pg_catalog.array_positions(interests, 'Faith')) <= 1
        and pg_catalog.cardinality(pg_catalog.array_positions(interests, 'Prayer')) <= 1
        and pg_catalog.cardinality(pg_catalog.array_positions(interests, 'Kindness')) <= 1
        and pg_catalog.cardinality(pg_catalog.array_positions(interests, 'Courage')) <= 1
    end
  ),
  constraint learning_preferences_familiarity_valid check (
    familiarity is null or familiarity in ('new', 'some', 'regular', 'unsure')
  ),
  constraint learning_preferences_session_minutes_valid check (
    session_minutes is null or session_minutes in (5, 10, 15, 20)
  ),
  constraint learning_preferences_setup_status_valid check (
    setup_status in ('completed', 'dismissed')
  ),
  constraint learning_preferences_revision_positive check (revision >= 1)
);

alter table public.learner_learning_preferences enable row level security;
revoke all on table public.learner_learning_preferences
  from public, anon, authenticated, service_role;
grant select on table public.learner_learning_preferences to authenticated;
create policy learning_preferences_select_own
  on public.learner_learning_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

-- These are deliberately narrow privileged write endpoints: clients have no
-- direct write grants. Both check the actual actor and trusted Auth verification.
-- No metadata, client user ID, enrollment or class authority is accepted.
create function public.save_learner_learning_preferences(
  p_intention text,
  p_interests text[],
  p_familiarity text,
  p_session_minutes integer,
  p_expected_revision bigint
)
returns setof public.learner_learning_preferences
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1 from auth.users as u where u.id = v_user_id
  ) then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if not exists (
    select 1 from auth.users as u
    where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'email_verification_required';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception using errcode = '22023', message = 'invalid_expected_revision';
  end if;

  if p_expected_revision = 0 then
    return query
      insert into public.learner_learning_preferences (
        user_id, intention, interests, familiarity, session_minutes, setup_status
      ) values (
        v_user_id, p_intention, p_interests, p_familiarity, p_session_minutes, 'completed'
      ) on conflict (user_id) do nothing
      returning *;
  else
    return query
      update public.learner_learning_preferences as p
      set intention = p_intention,
          interests = p_interests,
          familiarity = p_familiarity,
          session_minutes = p_session_minutes,
          setup_status = 'completed',
          revision = p.revision + 1,
          updated_at = pg_catalog.clock_timestamp()
      where p.user_id = v_user_id and p.revision = p_expected_revision
      returning p.*;
  end if;
  if not found then
    raise exception using errcode = '40001', message = 'learning_preferences_revision_conflict';
  end if;
exception
  when check_violation or not_null_violation then
    raise exception using errcode = '22023', message = 'invalid_learning_preferences';
end;
$$;

create function public.dismiss_learner_learning_preferences(p_expected_revision bigint)
returns setof public.learner_learning_preferences
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1 from auth.users as u where u.id = v_user_id
  ) then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if not exists (
    select 1 from auth.users as u
    where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'email_verification_required';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception using errcode = '22023', message = 'invalid_expected_revision';
  end if;

  if p_expected_revision = 0 then
    return query
      insert into public.learner_learning_preferences (user_id, setup_status)
      values (v_user_id, 'dismissed')
      on conflict (user_id) do nothing
      returning *;
  else
    -- Dismissal never writes answer fields, including an editor's unsaved draft.
    return query
      update public.learner_learning_preferences as p
      set setup_status = 'dismissed',
          revision = p.revision + 1,
          updated_at = pg_catalog.clock_timestamp()
      where p.user_id = v_user_id and p.revision = p_expected_revision
      returning p.*;
  end if;
  if not found then
    raise exception using errcode = '40001', message = 'learning_preferences_revision_conflict';
  end if;
end;
$$;

revoke all on function public.save_learner_learning_preferences(text, text[], text, integer, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.dismiss_learner_learning_preferences(bigint)
  from public, anon, authenticated, service_role;
grant execute on function public.save_learner_learning_preferences(text, text[], text, integer, bigint)
  to authenticated;
grant execute on function public.dismiss_learner_learning_preferences(bigint) to authenticated;

comment on table public.learner_learning_preferences is
  'Private optional learning preferences; no role, proficiency proof, enrollment, class or progress authority.';
comment on function public.save_learner_learning_preferences(text, text[], text, integer, bigint) is
  'Verified actor only. Replaces optional answers and completes setup against the acknowledged revision; zero creates only.';
comment on function public.dismiss_learner_learning_preferences(bigint) is
  'Verified actor only. Records dismissal without replacing saved answers; zero creates only.';

commit;
