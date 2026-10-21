-- Applied additively to SundaySeeds development via MCP. Actual remote version.
-- No seed, grants to staff or Join operation.
create schema course_library_private;
revoke all on schema course_library_private from public, anon, authenticated, service_role;

create table course_library_private.courses (
  course_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Released metadata is immutable; availability is a separate current access fact.
-- Snapshot keys exactly match the public metadata portion checked below.
create table course_library_private.course_releases (
  release_id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course_library_private.courses(course_id),
  edition_number integer not null check (edition_number > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  is_available boolean not null default false,
  created_at timestamptz not null default now(),
  unique (course_id, edition_number),
  unique (release_id, course_id)
);

-- Deliberate public projection: never add bodies, answers, staff notes or learners.
create table public.course_offerings (
  course_id uuid primary key references course_library_private.courses(course_id),
  release_id uuid not null unique,
  offering_revision integer not null default 1 check (offering_revision > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) between 1 and 200),
  summary text not null check (length(btrim(summary)) between 1 and 2000),
  topics text[] not null default '{}',
  learning_goals text[] not null default '{}',
  outcomes text[] not null default '{}',
  audience text not null check (length(btrim(audience)) between 1 and 300),
  language text not null check (length(btrim(language)) between 1 and 50),
  level text check (level is null or length(btrim(level)) between 1 and 100),
  estimated_minutes integer check (estimated_minutes > 0),
  estimate_basis text check (estimate_basis in ('reading', 'full_study')),
  modules jsonb not null check (jsonb_typeof(modules) = 'array'),
  is_listed boolean not null default false,
  joins_open boolean not null default false,
  is_development boolean not null default true,
  is_available boolean not null default false,
  foreign key (release_id, course_id)
    references course_library_private.course_releases(release_id, course_id),
  check ((estimated_minutes is null) = (estimate_basis is null)),
  check (array_position(topics, null) is null),
  check (array_position(learning_goals, null) is null),
  check (array_position(outcomes, null) is null)
);

alter table course_library_private.courses enable row level security;
alter table course_library_private.course_releases enable row level security;
alter table public.course_offerings enable row level security;
revoke all on table course_library_private.courses,
  course_library_private.course_releases, public.course_offerings
  from public, anon, authenticated, service_role;
grant select on public.course_offerings to anon, authenticated;
create policy available_course_metadata on public.course_offerings
  for select to anon, authenticated using (is_available);

-- Validate the outline allowlist so a privileged import cannot accidentally put
-- lesson bodies, questions or answer keys into the public curriculum JSON.
create function course_library_private.valid_public_outline(p_modules jsonb)
returns boolean language plpgsql immutable security invoker set search_path = ''
as $$
declare
  v_module jsonb;
  v_lesson jsonb;
  v_module_ids text[] := '{}';
  v_lesson_ids text[] := '{}';
begin
  if jsonb_typeof(p_modules) is distinct from 'array'
    or jsonb_array_length(p_modules) = 0 then return false; end if;
  for v_module in select value from jsonb_array_elements(p_modules) loop
    if jsonb_typeof(v_module) is distinct from 'object'
      or (v_module - array['id', 'title', 'lessons']) <> '{}'::jsonb
      or jsonb_typeof(v_module->'id') is distinct from 'string'
      or length(btrim(v_module->>'id')) = 0
      or (v_module->>'id') = any(v_module_ids)
      or jsonb_typeof(v_module->'title') is distinct from 'string'
      or length(btrim(v_module->>'title')) = 0
      or jsonb_typeof(v_module->'lessons') is distinct from 'array'
      then return false; end if;
    if jsonb_array_length(v_module->'lessons') = 0 then return false; end if;
    v_module_ids := array_append(v_module_ids, v_module->>'id');
    for v_lesson in select value from jsonb_array_elements(v_module->'lessons') loop
      if jsonb_typeof(v_lesson) is distinct from 'object'
        or (v_lesson - array['id', 'title', 'scripture', 'estimatedMinutes']) <> '{}'::jsonb
        or jsonb_typeof(v_lesson->'id') is distinct from 'string'
        or length(btrim(v_lesson->>'id')) = 0
        or (v_lesson->>'id') = any(v_lesson_ids)
        or jsonb_typeof(v_lesson->'title') is distinct from 'string'
        or length(btrim(v_lesson->>'title')) = 0
        or jsonb_typeof(v_lesson->'scripture') is distinct from 'string'
        or length(btrim(v_lesson->>'scripture')) = 0
        then return false; end if;
      if v_lesson ? 'estimatedMinutes' and v_lesson->'estimatedMinutes' <> 'null'::jsonb then
        if jsonb_typeof(v_lesson->'estimatedMinutes') is distinct from 'number'
          or (v_lesson->>'estimatedMinutes') !~ '^[1-9][0-9]*$'
          then return false; end if;
      end if;
      v_lesson_ids := array_append(v_lesson_ids, v_lesson->>'id');
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function course_library_private.valid_public_outline(jsonb)
  from public, anon, authenticated, service_role;

create function course_library_private.guard_course_release()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using errcode = '22023', message = 'course_release_is_immutable';
  end if;
  if (to_jsonb(new) - 'is_available') is distinct from (to_jsonb(old) - 'is_available') then
    raise exception using errcode = '22023', message = 'course_release_is_immutable';
  end if;
  return new;
end;
$$;
revoke all on function course_library_private.guard_course_release()
  from public, anon, authenticated, service_role;
create trigger guard_course_release before update or delete
  on course_library_private.course_releases for each row
  execute function course_library_private.guard_course_release();

create function course_library_private.guard_course_offering()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_release course_library_private.course_releases%rowtype;
  v_metadata jsonb;
begin
  -- Shared row lock serializes availability changes against this projection read.
  select * into v_release from course_library_private.course_releases
    where release_id = new.release_id and course_id = new.course_id for share;
  if not found then
    raise exception using errcode = '23503', message = 'course_release_not_found';
  end if;
  v_metadata := to_jsonb(new) - array[
    'course_id', 'release_id', 'offering_revision', 'is_listed', 'joins_open', 'is_available'
  ];
  if v_metadata is distinct from v_release.snapshot
    or not course_library_private.valid_public_outline(new.modules) then
    raise exception using errcode = '22023', message = 'course_metadata_snapshot_mismatch';
  end if;
  new.is_available := v_release.is_available;
  if tg_op = 'UPDATE' then
    if new.course_id is distinct from old.course_id then
      raise exception using errcode = '22023', message = 'course_identity_is_immutable';
    end if;
    -- Any admission/public offering change increments the reviewed revision.
    -- Availability-only synchronization also increments it; never trust input.
    if (to_jsonb(new) - 'offering_revision') is distinct from
      (to_jsonb(old) - 'offering_revision') then
      new.offering_revision := old.offering_revision + 1;
    else
      new.offering_revision := old.offering_revision;
    end if;
  else
    new.offering_revision := 1;
  end if;
  return new;
end;
$$;
revoke all on function course_library_private.guard_course_offering()
  from public, anon, authenticated, service_role;
create trigger guard_course_offering before insert or update
  on public.course_offerings for each row
  execute function course_library_private.guard_course_offering();

create function course_library_private.sync_course_availability()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  update public.course_offerings set is_available = new.is_available
    where release_id = new.release_id and course_id = new.course_id;
  return new;
end;
$$;
revoke all on function course_library_private.sync_course_availability()
  from public, anon, authenticated, service_role;
create trigger sync_course_availability after update of is_available
  on course_library_private.course_releases for each row
  when (old.is_available is distinct from new.is_available)
  execute function course_library_private.sync_course_availability();

create function public.list_course_offerings()
returns setof public.course_offerings language sql stable security invoker
set search_path = ''
as $$
  select * from public.course_offerings
  where is_listed and is_available order by title, course_id;
$$;
create function public.get_course_offering(p_course_id uuid)
returns setof public.course_offerings language sql stable security invoker
set search_path = ''
as $$
  select * from public.course_offerings
  where course_id = p_course_id and is_available;
$$;
revoke all on function public.list_course_offerings(), public.get_course_offering(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.list_course_offerings(), public.get_course_offering(uuid)
  to anon, authenticated;
