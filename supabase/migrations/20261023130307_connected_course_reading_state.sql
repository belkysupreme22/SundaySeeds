-- SOURCE ONLY. Separate acknowledged reading preferences, never completion.
-- Requires the library, enrollment and assessment-foundation migrations.
create table course_library_private.lesson_reading_state (
  enrollment_id uuid not null,
  user_id uuid not null,
  course_id uuid not null,
  release_id uuid not null,
  lesson_id text not null,
  section_id text,
  position_revision bigint not null default 0
    check (position_revision between 0 and 9007199254740991),
  is_bookmarked boolean not null default false,
  bookmark_revision bigint not null default 0
    check (bookmark_revision between 0 and 9007199254740991),
  check ((section_id is null) = (position_revision = 0)),
  check (not is_bookmarked or bookmark_revision > 0),
  primary key (enrollment_id, lesson_id),
  foreign key (enrollment_id, user_id, course_id, release_id)
    references course_library_private.course_enrollments(enrollment_id, user_id, course_id, release_id)
    on delete cascade,
  foreign key (release_id, lesson_id)
    references course_library_private.course_lesson_readings(release_id, lesson_id)
);
create index lesson_reading_state_reading_idx
  on course_library_private.lesson_reading_state(release_id, lesson_id);
alter table course_library_private.lesson_reading_state enable row level security;
revoke all on table course_library_private.lesson_reading_state
  from public, anon, authenticated, service_role;

create function course_library_private.guard_lesson_reading_state()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    -- APIs first establish an empty row, then advance only the changed field.
    if new.section_id is not null or new.position_revision <> 0
      or new.is_bookmarked or new.bookmark_revision <> 0 then
      raise exception using errcode='22023', message='invalid_reading_request';
    end if;
  else
    if row(new.enrollment_id,new.user_id,new.course_id,new.release_id,new.lesson_id)
      is distinct from row(old.enrollment_id,old.user_id,old.course_id,old.release_id,old.lesson_id)
      or (new.section_id is not distinct from old.section_id
        and new.position_revision <> old.position_revision)
      or (new.section_id is distinct from old.section_id
        and new.position_revision::numeric <> old.position_revision::numeric + 1)
      or (new.is_bookmarked = old.is_bookmarked and new.bookmark_revision <> old.bookmark_revision)
      or (new.is_bookmarked <> old.is_bookmarked
        and new.bookmark_revision::numeric <> old.bookmark_revision::numeric + 1) then
      raise exception using errcode='22023', message='invalid_reading_request';
    end if;
  end if;
  if new.section_id is not null and not exists (
    select 1 from course_library_private.course_lesson_readings c,
      lateral jsonb_array_elements(c.body->'sections') s
    where c.release_id=new.release_id and c.course_id=new.course_id
      and c.lesson_id=new.lesson_id and s->>'id'=new.section_id
  ) then
    raise exception using errcode='22023', message='invalid_reading_request';
  end if;
  return new;
end; $$;
create trigger guard_lesson_reading_state before insert or update
  on course_library_private.lesson_reading_state for each row
  execute function course_library_private.guard_lesson_reading_state();

-- All state operations lock actor/enrollment/lesson first (including first
-- inserts), then enrollment -> release -> state. The pinned scope is immutable.
create function course_library_private.lock_course_reading_access(
  p_actor uuid, p_course_id uuid, p_lesson_id text
) returns course_library_private.course_enrollments
language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
  v_e course_library_private.course_enrollments%rowtype;
  v_r course_library_private.course_releases%rowtype;
begin
  if p_course_id is null or p_lesson_id is null or length(btrim(p_lesson_id))=0 then
    raise exception using errcode='22023', message='invalid_reading_request';
  end if;
  select enrollment_id into v_id from course_library_private.course_enrollments
    where user_id=p_actor and course_id=p_course_id;
  if not found then raise exception using errcode='P0002', message='reading_unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(
    p_actor::text || ':reading:' || v_id::text || ':' || p_lesson_id, 0));
  select * into v_e from course_library_private.course_enrollments
    where enrollment_id=v_id and user_id=p_actor and course_id=p_course_id for share;
  if not found then raise exception using errcode='P0002', message='reading_unavailable'; end if;
  if v_e.state <> 'active' then
    raise exception using errcode='42501', message='access_revoked';
  end if;
  select * into v_r from course_library_private.course_releases
    where release_id=v_e.release_id and course_id=p_course_id for share;
  if not found or not v_r.is_available then
    raise exception using errcode='P0002', message='reading_unavailable';
  end if;
  if not exists (
    select 1 from course_library_private.course_lesson_readings c
    where c.release_id=v_e.release_id and c.course_id=p_course_id and c.lesson_id=p_lesson_id
      and exists (select 1 from jsonb_array_elements(v_r.snapshot->'modules') m,
        lateral jsonb_array_elements(m->'lessons') l where l->>'id'=c.lesson_id)
  ) then
    raise exception using errcode='P0002', message='reading_unavailable';
  end if;
  return v_e;
end; $$;

create function course_library_private.course_reading_state_projection(
  p_e course_library_private.course_enrollments, p_lesson_id text,
  p_s course_library_private.lesson_reading_state
) returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'enrollment_id',p_e.enrollment_id,'user_id',p_e.user_id,
    'course_id',p_e.course_id,'release_id',p_e.release_id,'lesson_id',p_lesson_id,
    'section_id',p_s.section_id,'position_revision',coalesce(p_s.position_revision,0),
    'is_bookmarked',coalesce(p_s.is_bookmarked,false),
    'bookmark_revision',coalesce(p_s.bookmark_revision,0));
$$;

create function course_library_private.get_my_course_reading_state(p_course_id uuid,p_lesson_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_e course_library_private.course_enrollments%rowtype;
  v_s course_library_private.lesson_reading_state%rowtype;
begin
  v_e := course_library_private.lock_course_reading_access(v_actor,p_course_id,p_lesson_id);
  select * into v_s from course_library_private.lesson_reading_state
    where enrollment_id=v_e.enrollment_id and lesson_id=p_lesson_id for share;
  -- An absent authorized row is known empty; no row is created by reading it.
  return course_library_private.course_reading_state_projection(v_e,p_lesson_id,v_s);
end; $$;

-- Owner-only implementation shared by the two actor-checked write entrypoints.
create function course_library_private.write_course_reading_state(
  p_actor uuid,p_course_id uuid,p_lesson_id text,p_field text,
  p_section_id text,p_is_bookmarked boolean,p_expected_revision bigint
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_e course_library_private.course_enrollments%rowtype;
  v_s course_library_private.lesson_reading_state%rowtype;
  v_revision bigint;
  v_same boolean;
begin
  if p_expected_revision is null or p_expected_revision not between 0 and 9007199254740991
    or p_field is null or p_field not in ('position','bookmark')
    or (p_field='bookmark' and p_is_bookmarked is null)
    or (p_field='position' and (p_section_id is null or length(btrim(p_section_id))=0)) then
    raise exception using errcode='22023', message='invalid_reading_request';
  end if;
  v_e := course_library_private.lock_course_reading_access(p_actor,p_course_id,p_lesson_id);
  if p_field='position' and p_section_id is not null and not exists (
    select 1 from course_library_private.course_lesson_readings c,
      lateral jsonb_array_elements(c.body->'sections') s
    where c.release_id=v_e.release_id and c.course_id=p_course_id
      and c.lesson_id=p_lesson_id and s->>'id'=p_section_id
  ) then
    raise exception using errcode='22023', message='invalid_reading_request';
  end if;
  insert into course_library_private.lesson_reading_state(
    enrollment_id,user_id,course_id,release_id,lesson_id
  ) values(v_e.enrollment_id,p_actor,p_course_id,v_e.release_id,p_lesson_id)
    on conflict(enrollment_id,lesson_id) do nothing;
  select * into strict v_s from course_library_private.lesson_reading_state
    where enrollment_id=v_e.enrollment_id and lesson_id=p_lesson_id for update;
  if p_field='position' then
    v_revision := v_s.position_revision;
    v_same := v_s.section_id is not distinct from p_section_id;
  else
    v_revision := v_s.bookmark_revision;
    v_same := v_s.is_bookmarked=p_is_bookmarked;
  end if;
  -- A future revision is never a retry. A stale identical desired value is safe
  -- to acknowledge without mutation; a stale different value must be reviewed.
  if p_expected_revision > v_revision or (not v_same and p_expected_revision <> v_revision)
    or (not v_same and v_revision=9007199254740991) then
    raise exception using errcode='40001', message='reading_state_conflict';
  end if;
  if not v_same then
    if p_field='position' then
      update course_library_private.lesson_reading_state
        set section_id=p_section_id,position_revision=position_revision+1
        where enrollment_id=v_e.enrollment_id and lesson_id=p_lesson_id returning * into v_s;
    else
      update course_library_private.lesson_reading_state
        set is_bookmarked=p_is_bookmarked,bookmark_revision=bookmark_revision+1
        where enrollment_id=v_e.enrollment_id and lesson_id=p_lesson_id returning * into v_s;
    end if;
  end if;
  return course_library_private.course_reading_state_projection(v_e,p_lesson_id,v_s);
end; $$;

create function course_library_private.save_course_reading_position(
  p_course_id uuid,p_lesson_id text,p_section_id text,p_expected_revision bigint
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor();
begin
  return course_library_private.write_course_reading_state(
    v_actor,p_course_id,p_lesson_id,'position',p_section_id,null,p_expected_revision);
end; $$;
create function course_library_private.set_course_lesson_bookmark(
  p_course_id uuid,p_lesson_id text,p_is_bookmarked boolean,p_expected_revision bigint
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor();
begin
  return course_library_private.write_course_reading_state(
    v_actor,p_course_id,p_lesson_id,'bookmark',null,p_is_bookmarked,p_expected_revision);
end; $$;

create function public.get_my_course_reading_state(p_course_id uuid,p_lesson_id text)
returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.get_my_course_reading_state(p_course_id,p_lesson_id); $$;
create function public.save_course_reading_position(
  p_course_id uuid,p_lesson_id text,p_section_id text,p_expected_revision bigint
) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.save_course_reading_position(p_course_id,p_lesson_id,p_section_id,p_expected_revision); $$;
create function public.set_course_lesson_bookmark(
  p_course_id uuid,p_lesson_id text,p_is_bookmarked boolean,p_expected_revision bigint
) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.set_course_lesson_bookmark(p_course_id,p_lesson_id,p_is_bookmarked,p_expected_revision); $$;

revoke all on function course_library_private.guard_lesson_reading_state(),
  course_library_private.lock_course_reading_access(uuid,uuid,text),
  course_library_private.course_reading_state_projection(course_library_private.course_enrollments,text,course_library_private.lesson_reading_state),
  course_library_private.write_course_reading_state(uuid,uuid,text,text,text,boolean,bigint),
  course_library_private.get_my_course_reading_state(uuid,text),
  course_library_private.save_course_reading_position(uuid,text,text,bigint),
  course_library_private.set_course_lesson_bookmark(uuid,text,boolean,bigint),
  public.get_my_course_reading_state(uuid,text),
  public.save_course_reading_position(uuid,text,text,bigint),
  public.set_course_lesson_bookmark(uuid,text,boolean,bigint)
  from public, anon, authenticated, service_role;
grant execute on function course_library_private.get_my_course_reading_state(uuid,text),
  course_library_private.save_course_reading_position(uuid,text,text,bigint),
  course_library_private.set_course_lesson_bookmark(uuid,text,boolean,bigint),
  public.get_my_course_reading_state(uuid,text),
  public.save_course_reading_position(uuid,text,text,bigint),
  public.set_course_lesson_bookmark(uuid,text,boolean,bigint) to authenticated;
