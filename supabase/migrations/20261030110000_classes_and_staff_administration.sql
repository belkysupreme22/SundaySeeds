-- Migration: Classes, Memberships, Staff Administration & Reporting (S5)
-- Provides teacher classes, invitation-only memberships, teacher-scoped progress reporting,
-- and administrative staff member/author assignment management.

-- ============================================================================
-- 1. Staff Administration Extensions (staff_authoring_private)
-- ============================================================================

-- List all staff accounts, active roles, and course author assignments
create function staff_authoring_private.list_staff_members()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_admin boolean;
  v_result jsonb;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'roles', coalesce(r.roles, '[]'::jsonb),
      'assigned_courses', coalesce(c.courses, '[]'::jsonb)
    ) order by u.email
  ), '[]'::jsonb)
  into v_result
  from auth.users u
  left join lateral (
    select jsonb_agg(sr.role order by sr.role) as roles
    from staff_authoring_private.staff_roles sr
    where sr.user_id = u.id
  ) r on true
  left join lateral (
    select jsonb_agg(jsonb_build_object(
      'course_id', caa.course_id,
      'state', caa.state,
      'title', coalesce(o.title, 'Course ' || caa.course_id::text)
    ) order by caa.course_id) as courses
    from staff_authoring_private.course_author_assignments caa
    left join public.course_offerings o on o.course_id = caa.course_id
    where caa.user_id = u.id and caa.state = 'active'
  ) c on true
  where r.roles is not null or c.courses is not null;

  return v_result;
end; $$;

-- Assign or revoke course authoring permission for a teacher
create function staff_authoring_private.set_course_author_assignment(
  p_target_email text,
  p_course_id uuid,
  p_active boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_admin boolean;
  v_target_id uuid;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  -- Verify course exists
  if not exists (select 1 from course_library_private.courses where course_id = p_course_id) then
    raise exception using errcode = '22023', message = 'course_not_found';
  end if;

  select id into v_target_id
  from auth.users
  where email = lower(btrim(p_target_email));

  if v_target_id is null then
    raise exception using errcode = '22023', message = 'user_not_found';
  end if;

  if p_active then
    insert into staff_authoring_private.course_author_assignments (user_id, course_id, state, revision)
      values (v_target_id, p_course_id, 'active', 1)
      on conflict (user_id, course_id)
      do update set state = 'active', updated_at = clock_timestamp();

    -- Ensure author has teacher role
    insert into staff_authoring_private.staff_roles (user_id, role)
      values (v_target_id, 'teacher')
      on conflict do nothing;
  else
    update staff_authoring_private.course_author_assignments
      set state = 'revoked', updated_at = clock_timestamp()
      where user_id = v_target_id and course_id = p_course_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'target_user_id', v_target_id,
    'course_id', p_course_id,
    'active', p_active
  );
end; $$;

-- ============================================================================
-- 2. Classes and Community Schema (class_community_private)
-- ============================================================================

create schema if not exists class_community_private;
revoke all on schema class_community_private from public, anon, authenticated, service_role;

create table if not exists class_community_private.classes (
  class_id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  description text not null default '' check (char_length(description) <= 1000),
  meeting text not null default '' check (char_length(meeting) <= 500),
  archived boolean not null default false,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);
create index if not exists classes_teacher_idx on class_community_private.classes(teacher_id);

create table if not exists class_community_private.class_courses (
  class_id uuid not null references class_community_private.classes(class_id) on delete cascade,
  course_id uuid not null references course_library_private.courses(course_id),
  primary key (class_id, course_id)
);
create index if not exists class_courses_course_idx on class_community_private.class_courses(course_id);

create table if not exists class_community_private.class_members (
  class_id uuid not null references class_community_private.classes(class_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'removed')),
  joined_at timestamptz not null default clock_timestamp(),
  primary key (class_id, user_id)
);
create index if not exists class_members_user_idx on class_community_private.class_members(user_id);

create table if not exists class_community_private.class_invitations (
  invitation_id uuid primary key default gen_random_uuid(),
  class_id uuid not null references class_community_private.classes(class_id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 255),
  name text not null default '' check (char_length(name) <= 200),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default (clock_timestamp() + interval '14 days')
);
create index if not exists class_invitations_class_idx on class_community_private.class_invitations(class_id);
create index if not exists class_invitations_token_idx on class_community_private.class_invitations(token);

alter table class_community_private.classes enable row level security;
alter table class_community_private.class_courses enable row level security;
alter table class_community_private.class_members enable row level security;
alter table class_community_private.class_invitations enable row level security;

revoke all on table class_community_private.classes,
  class_community_private.class_courses,
  class_community_private.class_members,
  class_community_private.class_invitations
  from public, anon, authenticated, service_role;

-- ============================================================================
-- 3. Teaching Class Operations RPCs
-- ============================================================================

-- List classes taught by authenticated user
create function class_community_private.list_my_teaching_classes()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_result jsonb;
begin
  v_actor := course_library_private.verified_course_actor();

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.class_id,
      'name', c.name,
      'description', c.description,
      'meeting', c.meeting,
      'archived', c.archived,
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'courseIds', coalesce(courses.ids, '[]'::jsonb),
      'memberCount', coalesce(members.cnt, 0),
      'invitationCount', coalesce(invites.cnt, 0)
    ) order by c.archived asc, c.created_at desc
  ), '[]'::jsonb)
  into v_result
  from class_community_private.classes c
  left join lateral (
    select jsonb_agg(cc.course_id) as ids
    from class_community_private.class_courses cc
    where cc.class_id = c.class_id
  ) courses on true
  left join lateral (
    select count(*)::integer as cnt
    from class_community_private.class_members cm
    where cm.class_id = c.class_id and cm.status = 'active'
  ) members on true
  left join lateral (
    select count(*)::integer as cnt
    from class_community_private.class_invitations ci
    where ci.class_id = c.class_id and ci.status = 'pending' and ci.expires_at > clock_timestamp()
  ) invites on true
  where c.teacher_id = v_actor;

  return v_result;
end; $$;

-- Save class (create or update)
create function class_community_private.save_teaching_class(
  p_class_id uuid,
  p_name text,
  p_description text,
  p_meeting text,
  p_archived boolean,
  p_course_ids uuid[]
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_class_id uuid;
  v_name text;
  v_cid uuid;
begin
  v_actor := course_library_private.verified_course_actor();

  v_name := btrim(coalesce(p_name, ''));
  if char_length(v_name) < 1 or char_length(v_name) > 200 then
    raise exception using errcode = '22023', message = 'invalid_class_name';
  end if;

  if p_class_id is not null then
    -- Verify ownership
    if not exists (
      select 1 from class_community_private.classes
      where class_id = p_class_id and teacher_id = v_actor
    ) then
      raise exception using errcode = '42501', message = 'class_not_found_or_unauthorized';
    end if;

    update class_community_private.classes
    set name = v_name,
        description = btrim(coalesce(p_description, '')),
        meeting = btrim(coalesce(p_meeting, '')),
        archived = coalesce(p_archived, false),
        updated_at = clock_timestamp()
    where class_id = p_class_id;

    v_class_id := p_class_id;
  else
    insert into class_community_private.classes (
      teacher_id, name, description, meeting, archived
    ) values (
      v_actor, v_name, btrim(coalesce(p_description, '')), btrim(coalesce(p_meeting, '')), coalesce(p_archived, false)
    ) returning class_id into v_class_id;
  end if;

  -- Update course associations if provided
  if p_course_ids is not null then
    delete from class_community_private.class_courses where class_id = v_class_id;
    foreach v_cid in array p_course_ids loop
      if exists (select 1 from course_library_private.courses where course_id = v_cid) then
        insert into class_community_private.class_courses (class_id, course_id)
          values (v_class_id, v_cid)
          on conflict do nothing;
      end if;
    end loop;
  end if;

  return jsonb_build_object('ok', true, 'class_id', v_class_id);
end; $$;

-- Get people (members and invitations) for a class
create function class_community_private.get_class_people(p_class_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_authorized boolean;
  v_members jsonb;
  v_invites jsonb;
begin
  v_actor := course_library_private.verified_course_actor();

  -- Teacher owner or admin can inspect class roster
  select exists (
    select 1 from class_community_private.classes where class_id = p_class_id and teacher_id = v_actor
  ) or exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) into v_is_authorized;

  if not v_is_authorized then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

  -- Active and removed members
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', cm.user_id,
      'name', coalesce(p.full_name, 'Learner'),
      'email', u.email,
      'status', cm.status,
      'joined_at', cm.joined_at
    ) order by cm.joined_at desc
  ), '[]'::jsonb)
  into v_members
  from class_community_private.class_members cm
  join auth.users u on u.id = cm.user_id
  left join public.learner_profiles p on p.user_id = cm.user_id
  where cm.class_id = p_class_id;

  -- Invitations
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', ci.invitation_id,
      'name', ci.name,
      'email', ci.email,
      'token', ci.token,
      'status', case
        when ci.status = 'pending' and ci.expires_at <= clock_timestamp() then 'expired'
        else ci.status
      end,
      'created_at', ci.created_at,
      'expires_at', ci.expires_at
    ) order by ci.created_at desc
  ), '[]'::jsonb)
  into v_invites
  from class_community_private.class_invitations ci
  where ci.class_id = p_class_id;

  return jsonb_build_object(
    'class_id', p_class_id,
    'members', v_members,
    'invitations', v_invites
  );
end; $$;

-- Create an invitation to a class
create function class_community_private.invite_class_member(
  p_class_id uuid,
  p_name text,
  p_email text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_clean_email text;
  v_invite_id uuid;
  v_token text;
begin
  v_actor := course_library_private.verified_course_actor();

  if not exists (
    select 1 from class_community_private.classes where class_id = p_class_id and teacher_id = v_actor
  ) and not exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

  v_clean_email := lower(btrim(coalesce(p_email, '')));
  if char_length(v_clean_email) < 3 or v_clean_email !~* '^.+@.+\..+$' then
    raise exception using errcode = '22023', message = 'invalid_email';
  end if;

  insert into class_community_private.class_invitations (
    class_id, email, name
  ) values (
    p_class_id, v_clean_email, btrim(coalesce(p_name, ''))
  ) returning invitation_id, token into v_invite_id, v_token;

  return jsonb_build_object(
    'ok', true,
    'invitation_id', v_invite_id,
    'token', v_token,
    'email', v_clean_email
  );
end; $$;

-- Revoke an invitation
create function class_community_private.revoke_class_invitation(p_invitation_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_class_id uuid;
begin
  v_actor := course_library_private.verified_course_actor();

  select class_id into v_class_id
  from class_community_private.class_invitations
  where invitation_id = p_invitation_id;

  if v_class_id is null then
    raise exception using errcode = '22023', message = 'invitation_not_found';
  end if;

  if not exists (
    select 1 from class_community_private.classes where class_id = v_class_id and teacher_id = v_actor
  ) and not exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

  update class_community_private.class_invitations
  set status = 'revoked'
  where invitation_id = p_invitation_id;

  return jsonb_build_object('ok', true, 'invitation_id', p_invitation_id);
end; $$;

-- Update member status (e.g. remove or reactivate)
create function class_community_private.update_class_member_status(
  p_class_id uuid,
  p_target_user_id uuid,
  p_status text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
begin
  v_actor := course_library_private.verified_course_actor();

  if not exists (
    select 1 from class_community_private.classes where class_id = p_class_id and teacher_id = v_actor
  ) and not exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

  if p_status not in ('active', 'removed') then
    raise exception using errcode = '22023', message = 'invalid_member_status';
  end if;

  update class_community_private.class_members
  set status = p_status
  where class_id = p_class_id and user_id = p_target_user_id;

  return jsonb_build_object('ok', true, 'class_id', p_class_id, 'user_id', p_target_user_id, 'status', p_status);
end; $$;

-- Accept an invitation (learner self-service)
create function class_community_private.join_class_by_token(p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_invitation record;
  v_class record;
begin
  v_actor := course_library_private.verified_course_actor();

  select * into v_invitation
  from class_community_private.class_invitations
  where token = btrim(coalesce(p_token, ''));

  if v_invitation is null then
    raise exception using errcode = '22023', message = 'invalid_invitation_token';
  end if;

  if v_invitation.status <> 'pending' or v_invitation.expires_at <= clock_timestamp() then
    raise exception using errcode = '22023', message = 'invitation_expired_or_inactive';
  end if;

  select * into v_class
  from class_community_private.classes
  where class_id = v_invitation.class_id;

  if v_class.archived then
    raise exception using errcode = '22023', message = 'class_archived';
  end if;

  -- Insert or reactivate membership
  insert into class_community_private.class_members (class_id, user_id, status)
    values (v_invitation.class_id, v_actor, 'active')
    on conflict (class_id, user_id)
    do update set status = 'active';

  -- Mark invite accepted
  update class_community_private.class_invitations
  set status = 'accepted'
  where invitation_id = v_invitation.invitation_id;

  return jsonb_build_object(
    'ok', true,
    'class_id', v_invitation.class_id,
    'class_name', v_class.name
  );
end; $$;

-- ============================================================================
-- 4. Teacher-Scoped Reporting RPC (get_class_learning_summary)
-- ============================================================================

create function class_community_private.get_class_learning_summary(p_class_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_authorized boolean;
  v_class record;
  v_course_stats jsonb;
  v_member_count integer;
begin
  v_actor := course_library_private.verified_course_actor();

  select * into v_class
  from class_community_private.classes
  where class_id = p_class_id;

  if v_class is null then
    raise exception using errcode = '22023', message = 'class_not_found';
  end if;

  select (v_class.teacher_id = v_actor) or exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) into v_is_authorized;

  if not v_is_authorized then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

  select count(*) into v_member_count
  from class_community_private.class_members
  where class_id = p_class_id and status = 'active';

  -- Aggregate course completion stats across class members
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'course_id', cc.course_id,
      'title', coalesce(o.title, 'Course ' || cc.course_id::text),
      'active_learners', v_member_count,
      'completed_lessons', coalesce(read_stats.completed_count, 0),
      'average_quiz_score', coalesce(quiz_stats.avg_score, 0),
      'quizzes_taken', coalesce(quiz_stats.attempt_count, 0)
    )
  ), '[]'::jsonb)
  into v_course_stats
  from class_community_private.class_courses cc
  left join public.course_offerings o on o.course_id = cc.course_id
  left join lateral (
    select count(*)::integer as completed_count
    from course_reading_private.account_reading_states ars
    join class_community_private.class_members cm on cm.user_id = ars.actor_id
    where cm.class_id = p_class_id and cm.status = 'active'
  ) read_stats on true
  left join lateral (
    select
      round(avg(cqa.score_percentage))::integer as avg_score,
      count(*)::integer as attempt_count
    from course_assessment_private.course_quiz_attempts cqa
    join class_community_private.class_members cm on cm.user_id = cqa.actor_id
    where cm.class_id = p_class_id and cm.status = 'active'
      and cqa.status = 'finished'
  ) quiz_stats on true
  where cc.class_id = p_class_id;

  return jsonb_build_object(
    'class_id', p_class_id,
    'class_name', v_class.name,
    'member_count', v_member_count,
    'courses', v_course_stats
  );
end; $$;

-- ============================================================================
-- 5. Public Invoker Wrappers & Grants
-- ============================================================================

create function public.list_staff_members()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.list_staff_members();
$$;

create function public.set_course_author_assignment(p_target_email text, p_course_id uuid, p_active boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.set_course_author_assignment(p_target_email, p_course_id, p_active);
$$;

create function public.list_my_teaching_classes()
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.list_my_teaching_classes();
$$;

create function public.save_teaching_class(
  p_class_id uuid,
  p_name text,
  p_description text,
  p_meeting text,
  p_archived boolean,
  p_course_ids uuid[]
)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.save_teaching_class(
    p_class_id, p_name, p_description, p_meeting, p_archived, p_course_ids
  );
$$;

create function public.get_class_people(p_class_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.get_class_people(p_class_id);
$$;

create function public.invite_class_member(p_class_id uuid, p_name text, p_email text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.invite_class_member(p_class_id, p_name, p_email);
$$;

create function public.revoke_class_invitation(p_invitation_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.revoke_class_invitation(p_invitation_id);
$$;

create function public.update_class_member_status(p_class_id uuid, p_target_user_id uuid, p_status text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.update_class_member_status(p_class_id, p_target_user_id, p_status);
$$;

create function public.join_class_by_token(p_token text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.join_class_by_token(p_token);
$$;

create function public.get_class_learning_summary(p_class_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.get_class_learning_summary(p_class_id);
$$;

-- Permissions
grant execute on function staff_authoring_private.list_staff_members(),
  staff_authoring_private.set_course_author_assignment(text, uuid, boolean),
  class_community_private.list_my_teaching_classes(),
  class_community_private.save_teaching_class(uuid, text, text, text, boolean, uuid[]),
  class_community_private.get_class_people(uuid),
  class_community_private.invite_class_member(uuid, text, text),
  class_community_private.revoke_class_invitation(uuid),
  class_community_private.update_class_member_status(uuid, uuid, text),
  class_community_private.join_class_by_token(text),
  class_community_private.get_class_learning_summary(uuid)
  to authenticated;

grant execute on function public.list_staff_members(),
  public.set_course_author_assignment(text, uuid, boolean),
  public.list_my_teaching_classes(),
  public.save_teaching_class(uuid, text, text, text, boolean, uuid[]),
  public.get_class_people(uuid),
  public.invite_class_member(uuid, text, text),
  public.revoke_class_invitation(uuid),
  public.update_class_member_status(uuid, uuid, text),
  public.join_class_by_token(text),
  public.get_class_learning_summary(uuid)
  to authenticated;
