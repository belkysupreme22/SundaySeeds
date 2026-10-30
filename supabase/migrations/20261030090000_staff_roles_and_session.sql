-- Migration: Staff Roles and Session Verification (RBAC)
-- Provides explicit role-based access control (admin, teacher) and staff session inspection.

create table staff_authoring_private.staff_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher')),
  created_at timestamptz not null default clock_timestamp(),
  primary key (user_id, role)
);
create index staff_roles_role_idx on staff_authoring_private.staff_roles(role);

alter table staff_authoring_private.staff_roles enable row level security;
revoke all on table staff_authoring_private.staff_roles from public, anon, authenticated, service_role;

-- Session resolution RPC
create function staff_authoring_private.get_my_staff_session()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_email text;
  v_roles jsonb;
  v_courses jsonb;
begin
  -- Resolve verified actor; throws 42501 if unverified or no session
  v_actor := course_library_private.verified_course_actor();
  
  select email into v_email from auth.users where id = v_actor;

  -- Collect explicit staff roles
  select coalesce(jsonb_agg(role order by role), '[]'::jsonb)
    into v_roles
    from staff_authoring_private.staff_roles
    where user_id = v_actor;

  -- Collect active assigned courses
  select coalesce(jsonb_agg(jsonb_build_object(
    'course_id', a.course_id,
    'draft_id', d.draft_id,
    'revision', coalesce(d.revision, 0),
    'title', coalesce(d.content->'course'->>'title', o.title, 'Untitled course')
  ) order by a.course_id), '[]'::jsonb)
    into v_courses
    from staff_authoring_private.course_author_assignments a
    left join staff_authoring_private.course_drafts d on d.course_id = a.course_id
    left join public.course_offerings o on o.course_id = a.course_id
    where a.user_id = v_actor and a.state = 'active';

  -- If user has course author assignments, ensure 'teacher' role is included in effective roles
  if jsonb_array_length(v_courses) > 0 and not (v_roles ? 'teacher') then
    v_roles := v_roles || '["teacher"]'::jsonb;
  end if;

  return jsonb_build_object(
    'actor_id', v_actor,
    'email', coalesce(v_email, ''),
    'roles', v_roles,
    'assigned_courses', v_courses
  );
end; $$;

-- Bootstrap helper: allows the first verified staff user to claim initial admin role in development
-- Once an admin exists, self-bootstrap is locked.
create function staff_authoring_private.bootstrap_initial_admin()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_admin_count integer;
begin
  v_actor := course_library_private.verified_course_actor();
  
  select count(*) into v_admin_count
    from staff_authoring_private.staff_roles
    where role = 'admin';

  if v_admin_count > 0 then
    raise exception using errcode = '42501', message = 'admin_bootstrap_already_completed';
  end if;

  insert into staff_authoring_private.staff_roles (user_id, role)
    values (v_actor, 'admin')
    on conflict do nothing;

  -- Also grant teacher role to the initial admin for complete development testing
  insert into staff_authoring_private.staff_roles (user_id, role)
    values (v_actor, 'teacher')
    on conflict do nothing;

  return staff_authoring_private.get_my_staff_session();
end; $$;

-- Admin role assignment: authorized admins can grant or revoke roles for other users
create function staff_authoring_private.set_staff_role(p_target_email text, p_role text, p_active boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_target_id uuid;
  v_is_admin boolean;
begin
  v_actor := course_library_private.verified_course_actor();

  -- Verify caller is an active admin
  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  if p_role not in ('admin', 'teacher') then
    raise exception using errcode = '22023', message = 'invalid_role';
  end if;

  -- Look up target user by email
  select id into v_target_id
    from auth.users
    where email = lower(btrim(p_target_email));

  if v_target_id is null then
    raise exception using errcode = '22023', message = 'user_not_found';
  end if;

  if p_active then
    insert into staff_authoring_private.staff_roles (user_id, role)
      values (v_target_id, p_role)
      on conflict do nothing;
  else
    -- Prevent removing the last admin
    if p_role = 'admin' then
      if (select count(*) from staff_authoring_private.staff_roles where role = 'admin') <= 1 then
        raise exception using errcode = '22023', message = 'cannot_remove_last_admin';
      end if;
    end if;
    delete from staff_authoring_private.staff_roles
      where user_id = v_target_id and role = p_role;
  end if;

  return jsonb_build_object('ok', true, 'target_user_id', v_target_id, 'role', p_role, 'active', p_active);
end; $$;

-- Public wrappers
create function public.get_my_staff_session()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.get_my_staff_session();
$$;

create function public.bootstrap_initial_admin()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.bootstrap_initial_admin();
$$;

create function public.set_staff_role(p_target_email text, p_role text, p_active boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.set_staff_role(p_target_email, p_role, p_active);
$$;

-- Permissions
revoke all on function staff_authoring_private.get_my_staff_session(),
  staff_authoring_private.bootstrap_initial_admin(),
  staff_authoring_private.set_staff_role(text, text, boolean)
  from public, anon, authenticated, service_role;

revoke all on function public.get_my_staff_session(),
  public.bootstrap_initial_admin(),
  public.set_staff_role(text, text, boolean)
  from public, anon, authenticated, service_role;

grant execute on function staff_authoring_private.get_my_staff_session(),
  staff_authoring_private.bootstrap_initial_admin(),
  staff_authoring_private.set_staff_role(text, text, boolean)
  to authenticated;

grant execute on function public.get_my_staff_session(),
  public.bootstrap_initial_admin(),
  public.set_staff_role(text, text, boolean)
  to authenticated;
