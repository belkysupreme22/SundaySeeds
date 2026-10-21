-- Additive verified enrollment and authorized reading. No seed or staff APIs.
-- Applied to SundaySeeds development via MCP; filename uses actual remote version.
create table course_library_private.course_enrollments (
  enrollment_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null,
  release_id uuid not null,
  state text not null default 'active' check (state in ('active', 'revoked')),
  joined_at timestamptz not null default clock_timestamp(),
  unique (user_id, course_id),
  foreign key (release_id, course_id)
    references course_library_private.course_releases(release_id, course_id)
);
create index course_enrollments_release_idx
  on course_library_private.course_enrollments(release_id, course_id);

create function course_library_private.valid_lesson_reading(p_body jsonb)
returns boolean language plpgsql immutable security invoker set search_path = ''
as $$
declare
  v_item jsonb;
  v_key text;
  v_ids text[] := '{}';
begin
  if jsonb_typeof(p_body) is distinct from 'object' then return false; end if;
  if p_body - array['id','title','subtitle','scripture','estimatedMinutes','intro',
    'outcomes','memoryVerse','sections'] <> '{}'::jsonb then return false; end if;
  foreach v_key in array array['id','title','subtitle','scripture','intro'] loop
    if jsonb_typeof(p_body->v_key) is distinct from 'string'
      or length(btrim(p_body->>v_key)) = 0 then return false; end if;
  end loop;
  if jsonb_typeof(p_body->'estimatedMinutes') is distinct from 'number'
    or (p_body->>'estimatedMinutes') !~ '^[1-9][0-9]{0,5}$' then return false; end if;
  if jsonb_typeof(p_body->'memoryVerse') is distinct from 'object' then return false; end if;
  if (p_body->'memoryVerse') - array['text','reference'] <> '{}'::jsonb then return false; end if;
  foreach v_key in array array['text','reference'] loop
    if jsonb_typeof(p_body->'memoryVerse'->v_key) is distinct from 'string'
      or length(btrim(p_body->'memoryVerse'->>v_key)) = 0 then return false; end if;
  end loop;
  if jsonb_typeof(p_body->'outcomes') is distinct from 'array'
    or jsonb_typeof(p_body->'sections') is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_body->'outcomes') = 0
    or jsonb_array_length(p_body->'sections') = 0 then return false; end if;
  for v_item in select value from jsonb_array_elements(p_body->'outcomes') loop
    if jsonb_typeof(v_item) is distinct from 'object' then return false; end if;
    if v_item - array['title','description'] <> '{}'::jsonb then return false; end if;
    foreach v_key in array array['title','description'] loop
      if jsonb_typeof(v_item->v_key) is distinct from 'string'
        or length(btrim(v_item->>v_key)) = 0 then return false; end if;
    end loop;
  end loop;
  for v_item in select value from jsonb_array_elements(p_body->'sections') loop
    if jsonb_typeof(v_item) is distinct from 'object' then return false; end if;
    if v_item - array['id','title','body'] <> '{}'::jsonb then return false; end if;
    foreach v_key in array array['id','title','body'] loop
      if jsonb_typeof(v_item->v_key) is distinct from 'string'
        or length(btrim(v_item->>v_key)) = 0 then return false; end if;
    end loop;
    if (v_item->>'id') = any(v_ids) then return false; end if;
    v_ids := array_append(v_ids, v_item->>'id');
  end loop;
  return true;
end;
$$;

create table course_library_private.course_lesson_readings (
  release_id uuid not null,
  course_id uuid not null,
  lesson_id text not null,
  body jsonb not null,
  primary key (release_id, lesson_id),
  foreign key (release_id, course_id)
    references course_library_private.course_releases(release_id, course_id),
  check (course_library_private.valid_lesson_reading(body)),
  check (body->>'id' = lesson_id)
);
create index course_lesson_readings_course_idx
  on course_library_private.course_lesson_readings(course_id, release_id);
alter table course_library_private.course_enrollments enable row level security;
alter table course_library_private.course_lesson_readings enable row level security;
revoke all on table course_library_private.course_enrollments,
  course_library_private.course_lesson_readings from public, anon, authenticated, service_role;

create function course_library_private.guard_lesson_reading()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op <> 'INSERT' then
    raise exception using errcode = '22023', message = 'lesson_reading_is_immutable';
  end if;
  -- Use release -> offering lock order. Body import is allowed only before
  -- admission; closing/withdrawing an enrolled edition must not unfreeze it.
  perform 1 from course_library_private.course_releases
    where release_id = new.release_id and course_id = new.course_id for share;
  perform 1 from public.course_offerings
    where release_id = new.release_id and course_id = new.course_id for share;
  if exists (select 1 from public.course_offerings
      where release_id = new.release_id and course_id = new.course_id and joins_open)
    or exists (select 1 from course_library_private.course_enrollments
      where release_id = new.release_id and course_id = new.course_id) then
    raise exception using errcode = '22023', message = 'lesson_reading_is_immutable';
  end if;
  -- The released outline, identity, title, Scripture and reading estimate agree.
  if not exists (
    select 1 from course_library_private.course_releases r,
      lateral jsonb_array_elements(r.snapshot->'modules') m,
      lateral jsonb_array_elements(m->'lessons') l
    where r.release_id = new.release_id and r.course_id = new.course_id
      and l->>'id' = new.lesson_id and l->>'title' = new.body->>'title'
      and l->>'scripture' = new.body->>'scripture'
      and (l->'estimatedMinutes' is null or l->'estimatedMinutes' = 'null'::jsonb
        or l->'estimatedMinutes' = new.body->'estimatedMinutes')
  ) then
    raise exception using errcode = '22023', message = 'lesson_outline_mismatch';
  end if;
  return new;
end;
$$;
create trigger guard_lesson_reading before insert or update or delete
  on course_library_private.course_lesson_readings for each row
  execute function course_library_private.guard_lesson_reading();

-- Admission can open only after the entire released outline has immutable
-- readings. Once complete, its fixed IDs and primary key prevent later appends,
-- even if joins subsequently close before anyone enrolls.
create function course_library_private.guard_course_admission()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_modules jsonb;
begin
  if new.joins_open then
    select snapshot->'modules' into v_modules
      from course_library_private.course_releases
      where release_id = new.release_id and course_id = new.course_id for share;
    if not found or not course_library_private.valid_public_outline(v_modules) then
      raise exception using errcode = '22023', message = 'course_content_not_ready';
    end if;
    if exists (select 1 from jsonb_array_elements(v_modules) m,
      lateral jsonb_array_elements(m->'lessons') l
      where not exists (select 1 from course_library_private.course_lesson_readings c
        where c.release_id = new.release_id and c.course_id = new.course_id
          and c.lesson_id = l->>'id')) then
      raise exception using errcode = '22023', message = 'course_content_not_ready';
    end if;
  end if;
  return new;
end;
$$;
create trigger guard_course_admission before insert or update of joins_open, release_id
  on public.course_offerings for each row
  execute function course_library_private.guard_course_admission();

create function course_library_private.guard_course_enrollment()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'state') is distinct from (to_jsonb(old) - 'state')
    or (old.state = 'revoked' and new.state <> 'revoked') then
    raise exception using errcode = '22023', message = 'enrollment_is_immutable';
  end if;
  return new;
end;
$$;
create trigger guard_course_enrollment before update
  on course_library_private.course_enrollments for each row
  execute function course_library_private.guard_course_enrollment();

-- Internal helpers are not directly exposed by PostgREST. Public wrappers below
-- remain invoker; only three actor-checked helpers receive authenticated EXECUTE.
create function course_library_private.verified_course_actor()
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_confirmed timestamptz;
  v_session text := auth.jwt()->>'session_id';
begin
  select u.email_confirmed_at into v_confirmed from auth.users u
    where u.id = v_actor and not coalesce(u.is_anonymous, false)
      and (u.banned_until is null or u.banned_until <= clock_timestamp());
  if not found or not exists (
    select 1 from auth.sessions s where s.user_id = v_actor
      and s.id::text = v_session
      and (s.not_after is null or s.not_after > clock_timestamp())
  ) then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if v_confirmed is null then
    raise exception using errcode = '42501', message = 'email_verification_required';
  end if;
  return v_actor;
end;
$$;

create function course_library_private.enrollment_projection(
  p_enrollment course_library_private.course_enrollments
)
returns jsonb language sql security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'enrollment_id', p_enrollment.enrollment_id, 'user_id', p_enrollment.user_id,
    'course_id', p_enrollment.course_id, 'release_id', p_enrollment.release_id,
    'state', p_enrollment.state, 'joined_at', p_enrollment.joined_at,
    'edition_number', r.edition_number,
    'available', r.is_available and p_enrollment.state = 'active',
    'title', r.snapshot->>'title', 'modules', r.snapshot->'modules'
  ) from course_library_private.course_releases r
    where r.release_id = p_enrollment.release_id and r.course_id = p_enrollment.course_id;
$$;

create function course_library_private.get_my_course_enrollment(p_course_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_enrollment course_library_private.course_enrollments%rowtype;
begin
  select * into v_enrollment from course_library_private.course_enrollments
    where user_id = v_actor and course_id = p_course_id;
  if not found then return null; end if;
  return course_library_private.enrollment_projection(v_enrollment);
end;
$$;

create function course_library_private.join_course(p_course_id uuid, p_offering_revision integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_enrollment course_library_private.course_enrollments%rowtype;
  v_offering public.course_offerings%rowtype;
  v_release course_library_private.course_releases%rowtype;
  v_release_id uuid;
begin
  if p_course_id is null or p_offering_revision is null or p_offering_revision < 1 then
    raise exception using errcode = '22023', message = 'invalid_course_request';
  end if;
  -- Serialize retries for this actor/course, including competing first inserts.
  perform pg_advisory_xact_lock(hashtextextended(v_actor::text || ':' || p_course_id::text, 0));
  select * into v_enrollment from course_library_private.course_enrollments
    where user_id = v_actor and course_id = p_course_id for share;
  if found then
    if v_enrollment.state = 'revoked' then
      raise exception using errcode = '42501', message = 'access_revoked';
    end if;
    return jsonb_build_object('outcome', 'already_joined',
      'enrollment', course_library_private.enrollment_projection(v_enrollment));
  end if;
  -- Locate without locking, then lock release BEFORE offering and recheck it.
  select release_id into v_release_id from public.course_offerings where course_id = p_course_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'course_unavailable';
  end if;
  select * into v_release from course_library_private.course_releases
    where release_id = v_release_id and course_id = p_course_id for share;
  select * into v_offering from public.course_offerings
    where course_id = p_course_id for share;
  if not found or v_offering.release_id <> v_release_id
    or v_offering.offering_revision <> p_offering_revision then
    raise exception using errcode = '40001', message = 'course_changed';
  end if;
  if not v_release.is_available or not v_offering.is_available or not v_offering.joins_open
    or not course_library_private.valid_public_outline(v_release.snapshot->'modules') then
    raise exception using errcode = 'P0002', message = 'course_unavailable';
  end if;
  -- Require every exact released lesson to have real immutable reading content.
  if exists (
    select 1 from jsonb_array_elements(v_release.snapshot->'modules') m,
      lateral jsonb_array_elements(m->'lessons') l
    where not exists (
      select 1 from course_library_private.course_lesson_readings c
      where c.release_id = v_release.release_id and c.course_id = p_course_id
        and c.lesson_id = l->>'id'
    )
  ) then
    raise exception using errcode = 'P0002', message = 'course_unavailable';
  end if;
  insert into course_library_private.course_enrollments(user_id, course_id, release_id)
    values (v_actor, p_course_id, v_release.release_id) returning * into v_enrollment;
  return jsonb_build_object('outcome', 'joined',
    'enrollment', course_library_private.enrollment_projection(v_enrollment));
end;
$$;

create function course_library_private.get_enrolled_course_lesson(p_course_id uuid, p_lesson_id text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_result jsonb;
begin
  if exists (select 1 from course_library_private.course_enrollments
    where user_id = v_actor and course_id = p_course_id and state = 'revoked') then
    raise exception using errcode = '42501', message = 'access_revoked';
  end if;
  -- Authorization, current availability and exact membership are in the body
  -- query itself; a guessed ID or earlier successful preflight grants no access.
  select jsonb_build_object(
    'enrollment_id', e.enrollment_id, 'user_id', e.user_id,
    'course_id', e.course_id, 'release_id', e.release_id, 'lesson', c.body
  ) into v_result
  from course_library_private.course_enrollments e
  join course_library_private.course_releases r
    on r.release_id = e.release_id and r.course_id = e.course_id
  join course_library_private.course_lesson_readings c
    on c.release_id = e.release_id and c.course_id = e.course_id and c.lesson_id = p_lesson_id
  where e.user_id = v_actor and e.course_id = p_course_id and e.state = 'active'
    and r.is_available and exists (
      select 1 from jsonb_array_elements(r.snapshot->'modules') m,
        lateral jsonb_array_elements(m->'lessons') l where l->>'id' = c.lesson_id
    ) for share of e, r;
  if not found then
    raise exception using errcode = 'P0002', message = 'lesson_unavailable';
  end if;
  return v_result;
end;
$$;

create function public.get_my_course_enrollment(p_course_id uuid)
returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.get_my_course_enrollment(p_course_id); $$;
create function public.join_course(p_course_id uuid, p_offering_revision integer)
returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.join_course(p_course_id, p_offering_revision); $$;
create function public.get_enrolled_course_lesson(p_course_id uuid, p_lesson_id text)
returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.get_enrolled_course_lesson(p_course_id, p_lesson_id); $$;

revoke all on function course_library_private.valid_lesson_reading(jsonb),
  course_library_private.guard_lesson_reading(), course_library_private.guard_course_admission(),
  course_library_private.guard_course_enrollment(),
  course_library_private.verified_course_actor(),
  course_library_private.enrollment_projection(course_library_private.course_enrollments),
  course_library_private.get_my_course_enrollment(uuid),
  course_library_private.join_course(uuid, integer),
  course_library_private.get_enrolled_course_lesson(uuid, text),
  public.get_my_course_enrollment(uuid), public.join_course(uuid, integer),
  public.get_enrolled_course_lesson(uuid, text) from public, anon, authenticated, service_role;
grant usage on schema course_library_private to authenticated;
grant execute on function course_library_private.get_my_course_enrollment(uuid),
  course_library_private.join_course(uuid, integer),
  course_library_private.get_enrolled_course_lesson(uuid, text),
  public.get_my_course_enrollment(uuid), public.join_course(uuid, integer),
  public.get_enrolled_course_lesson(uuid, text) to authenticated;
