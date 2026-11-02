-- SundaySeeds — Applied Pending Migrations Bundle (S1 through S5)
-- Target: sundayseeds-dev (PostgreSQL 17.11)
-- Contains:
-- 1. 20261030090000_staff_roles_and_session.sql
-- 2. 20261030100000_course_reviews_and_publication.sql
-- 3. 20261030110000_classes_and_staff_administration.sql

BEGIN;

-- ============================================================================
-- 1. Staff Roles and Session Resolution (S1)
-- ============================================================================

create table if not exists staff_authoring_private.staff_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher')),
  created_at timestamptz not null default clock_timestamp(),
  primary key (user_id, role)
);
create index if not exists staff_roles_role_idx on staff_authoring_private.staff_roles(role);

alter table staff_authoring_private.staff_roles enable row level security;
revoke all on table staff_authoring_private.staff_roles from public, anon, authenticated, service_role;

create or replace function staff_authoring_private.get_my_staff_session()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_email text;
  v_roles jsonb;
  v_courses jsonb;
begin
  v_actor := course_library_private.verified_course_actor();
  
  select email into v_email from auth.users where id = v_actor;

  select coalesce(jsonb_agg(role order by role), '[]'::jsonb)
    into v_roles
    from staff_authoring_private.staff_roles
    where user_id = v_actor;

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

create or replace function staff_authoring_private.bootstrap_initial_admin()
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

  insert into staff_authoring_private.staff_roles (user_id, role)
    values (v_actor, 'teacher')
    on conflict do nothing;

  return staff_authoring_private.get_my_staff_session();
end; $$;

create or replace function staff_authoring_private.set_staff_role(p_target_email text, p_role text, p_active boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_target_id uuid;
  v_is_admin boolean;
begin
  v_actor := course_library_private.verified_course_actor();

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

create or replace function public.get_my_staff_session()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.get_my_staff_session();
$$;

create or replace function public.bootstrap_initial_admin()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.bootstrap_initial_admin();
$$;

create or replace function public.set_staff_role(p_target_email text, p_role text, p_active boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.set_staff_role(p_target_email, p_role, p_active);
$$;

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

-- ============================================================================
-- 2. Course Reviews and Atomic Publication (S3 & S4)
-- ============================================================================

create table if not exists course_library_private.course_reviews (
  review_id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course_library_private.courses(course_id),
  revision bigint not null check (revision between 1 and 9007199254740991),
  snapshot jsonb not null check (staff_authoring_private.valid_course_draft(snapshot)),
  status text not null default 'submitted' check (status in ('submitted', 'changes_requested', 'approved', 'published')),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text check (char_length(review_notes) <= 5000),
  published_edition_number integer check (published_edition_number between 1 and 2147483647),
  published_release_id uuid references course_library_private.course_releases(release_id),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);

create index if not exists course_reviews_course_idx on course_library_private.course_reviews(course_id);
create index if not exists course_reviews_status_idx on course_library_private.course_reviews(status);

alter table course_library_private.course_reviews enable row level security;
revoke all on table course_library_private.course_reviews from public, anon, authenticated, service_role;

create or replace function staff_authoring_private.submit_course_draft_for_review(
  p_course_id uuid,
  p_expected_revision bigint,
  p_request_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_draft record;
  v_review_id uuid;
  v_module jsonb;
  v_lesson jsonb;
begin
  v_actor := course_library_private.verified_course_actor();

  if not exists (
    select 1 from staff_authoring_private.course_author_assignments
    where user_id = v_actor and course_id = p_course_id and state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'author_assignment_required';
  end if;

  select * into v_draft
  from staff_authoring_private.course_drafts
  where course_id = p_course_id
  for update;

  if v_draft is null then
    raise exception using errcode = '22023', message = 'draft_not_found';
  end if;

  if v_draft.revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'draft_revision_conflict';
  end if;

  if jsonb_array_length(v_draft.content->'modules') = 0 then
    raise exception using errcode = '22023', message = 'course_must_have_at_least_one_module';
  end if;

  if jsonb_array_length(v_draft.content->'lessons') = 0 then
    raise exception using errcode = '22023', message = 'course_must_have_at_least_one_lesson';
  end if;

  for v_lesson in select value from jsonb_array_elements(v_draft.content->'lessons') loop
    if jsonb_array_length(v_lesson->'quiz') = 0 then
      raise exception using errcode = '22023', message = 'every_lesson_must_have_at_least_one_quiz_question';
    end if;
  end loop;

  insert into course_library_private.course_reviews (
    course_id, revision, snapshot, status, submitted_by
  ) values (
    p_course_id, v_draft.revision, v_draft.content, 'submitted', v_actor
  ) returning review_id into v_review_id;

  return jsonb_build_object(
    'ok', true,
    'review_id', v_review_id,
    'course_id', p_course_id,
    'revision', v_draft.revision,
    'status', 'submitted'
  );
end; $$;

create or replace function staff_authoring_private.list_course_reviews()
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
      'review_id', r.review_id,
      'course_id', r.course_id,
      'title', coalesce(r.snapshot->'course'->>'title', 'Untitled course'),
      'revision', r.revision,
      'status', r.status,
      'submitted_by', u.email,
      'review_notes', r.review_notes,
      'published_edition_number', r.published_edition_number,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ) order by r.created_at desc
  ), '[]'::jsonb)
  into v_result
  from course_library_private.course_reviews r
  left join auth.users u on u.id = r.submitted_by;

  return jsonb_build_object('ok', true, 'reviews', v_result);
end; $$;

create or replace function staff_authoring_private.get_course_review(p_review_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_admin boolean;
  v_review record;
  v_user_email text;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  select * into v_review
  from course_library_private.course_reviews
  where review_id = p_review_id;

  if v_review is null then
    raise exception using errcode = '22023', message = 'review_not_found';
  end if;

  select email into v_user_email from auth.users where id = v_review.submitted_by;

  return jsonb_build_object(
    'review_id', v_review.review_id,
    'course_id', v_review.course_id,
    'title', coalesce(v_review.snapshot->'course'->>'title', 'Untitled course'),
    'revision', v_review.revision,
    'status', v_review.status,
    'submitted_by', coalesce(v_user_email, ''),
    'review_notes', v_review.review_notes,
    'published_edition_number', v_review.published_edition_number,
    'snapshot', v_review.snapshot,
    'created_at', v_review.created_at,
    'updated_at', v_review.updated_at
  );
end; $$;

create or replace function staff_authoring_private.return_course_review_for_changes(
  p_review_id uuid,
  p_notes text,
  p_request_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_admin boolean;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  update course_library_private.course_reviews
  set status = 'changes_requested',
      reviewed_by = v_actor,
      review_notes = btrim(p_notes),
      updated_at = clock_timestamp()
  where review_id = p_review_id;

  return jsonb_build_object('ok', true, 'review_id', p_review_id, 'status', 'changes_requested');
end; $$;

create or replace function staff_authoring_private.publish_course_review(
  p_review_id uuid,
  p_request_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_admin boolean;
  v_review record;
  v_next_edition integer;
  v_release_id uuid;
  v_set_id uuid;
  v_lesson jsonb;
  v_section jsonb;
  v_question jsonb;
  v_opt jsonb;
  v_outline jsonb;
  v_modules jsonb;
  v_lesson_id text;
  v_content_questions jsonb;
  v_correct_mappings jsonb;
  v_order_index integer;
  v_q_index integer;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  select * into v_review
  from course_library_private.course_reviews
  where review_id = p_review_id
  for update;

  if v_review is null then
    raise exception using errcode = '22023', message = 'review_not_found';
  end if;

  if v_review.status = 'published' then
    return jsonb_build_object(
      'ok', true,
      'review_id', p_review_id,
      'status', 'published',
      'edition_number', v_review.published_edition_number,
      'release_id', v_review.published_release_id,
      'replayed', true
    );
  end if;

  select coalesce(max(edition_number), 0) + 1 into v_next_edition
  from course_library_private.course_releases
  where course_id = v_review.course_id;

  v_release_id := gen_random_uuid();
  v_modules := v_review.snapshot->'modules';

  v_outline := jsonb_build_object(
    'modules', v_modules,
    'lessons', (
      select jsonb_agg(
        jsonb_build_object(
          'id', l->>'id',
          'title', l->>'title',
          'subtitle', l->>'subtitle',
          'scripture', l->>'scripture',
          'estimatedMinutes', (l->>'estimatedMinutes')::numeric
        )
      ) from jsonb_array_elements(v_review.snapshot->'lessons') as l
    )
  );

  insert into course_library_private.course_releases (
    release_id, course_id, edition_number, status, content_hash, outline, availability
  ) values (
    v_release_id,
    v_review.course_id,
    v_next_edition,
    'immutable',
    encode(digest(v_review.snapshot::text, 'sha256'), 'hex'),
    v_outline,
    'available'
  );

  for v_lesson in select value from jsonb_array_elements(v_review.snapshot->'lessons') loop
    v_lesson_id := v_lesson->>'id';
    v_order_index := 1;
    for v_section in select value from jsonb_array_elements(v_lesson->'sections') loop
      insert into course_library_private.course_lesson_readings (
        release_id, lesson_id, section_id, order_index, title, body
      ) values (
        v_release_id,
        v_lesson_id,
        v_section->>'id',
        v_order_index,
        v_section->>'title',
        v_section->>'body'
      );
      v_order_index := v_order_index + 1;
    end loop;
  end loop;

  v_set_id := gen_random_uuid();
  v_content_questions := '[]'::jsonb;
  v_correct_mappings := '{}'::jsonb;
  v_q_index := 1;

  for v_lesson in select value from jsonb_array_elements(v_review.snapshot->'lessons') loop
    v_lesson_id := v_lesson->>'id';
    for v_question in select value from jsonb_array_elements(v_lesson->'quiz') loop
      v_content_questions := v_content_questions || jsonb_build_object(
        'id', 'q' || v_q_index::text,
        'lesson_id', v_lesson_id,
        'prompt', v_question->>'prompt',
        'options', (
          select jsonb_agg(
            jsonb_build_object(
              'id', opt->>'id',
              'text', opt->>'text'
            )
          ) from jsonb_array_elements(v_question->'options') as opt
        ),
        'explanation', v_question->>'explanation'
      );

      v_correct_mappings := v_correct_mappings || jsonb_build_object(
        'q' || v_q_index::text,
        coalesce(v_question->>'correctOptionId', (v_question->'options'->0->>'id'))
      );

      v_q_index := v_q_index + 1;
    end loop;
  end loop;

  insert into course_assessment_private.course_assessment_sets (
    set_id, release_id, questions, correct_answers, status
  ) values (
    v_set_id,
    v_release_id,
    v_content_questions,
    v_correct_mappings,
    'active'
  );

  update public.course_offerings
  set current_release_id = v_release_id,
      edition_number = v_next_edition,
      title = coalesce(v_review.snapshot->'course'->>'title', title),
      summary = coalesce(v_review.snapshot->'course'->>'summary', summary),
      updated_at = clock_timestamp()
  where course_id = v_review.course_id;

  update course_library_private.course_reviews
  set status = 'published',
      reviewed_by = v_actor,
      published_edition_number = v_next_edition,
      published_release_id = v_release_id,
      updated_at = clock_timestamp()
  where review_id = p_review_id;

  return jsonb_build_object(
    'ok', true,
    'review_id', p_review_id,
    'edition_number', v_next_edition,
    'release_id', v_release_id,
    'status', 'published'
  );
end; $$;

create or replace function public.submit_course_draft_for_review(
  p_course_id uuid,
  p_expected_revision bigint,
  p_request_key uuid
)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.submit_course_draft_for_review(p_course_id, p_expected_revision, p_request_key);
$$;

create or replace function public.list_course_reviews()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.list_course_reviews();
$$;

create or replace function public.get_course_review(p_review_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.get_course_review(p_review_id);
$$;

create or replace function public.return_course_review_for_changes(
  p_review_id uuid,
  p_notes text,
  p_request_key uuid
)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.return_course_review_for_changes(p_review_id, p_notes, p_request_key);
$$;

create or replace function public.publish_course_review(
  p_review_id uuid,
  p_request_key uuid
)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.publish_course_review(p_review_id, p_request_key);
$$;

grant execute on function staff_authoring_private.submit_course_draft_for_review(uuid, bigint, uuid),
  staff_authoring_private.list_course_reviews(),
  staff_authoring_private.get_course_review(uuid),
  staff_authoring_private.return_course_review_for_changes(uuid, text, uuid),
  staff_authoring_private.publish_course_review(uuid, uuid)
  to authenticated;

grant execute on function public.submit_course_draft_for_review(uuid, bigint, uuid),
  public.list_course_reviews(),
  public.get_course_review(uuid),
  public.return_course_review_for_changes(uuid, text, uuid),
  public.publish_course_review(uuid, uuid)
  to authenticated;

-- ============================================================================
-- 3. Classes and Staff Administration (S5)
-- ============================================================================

create or replace function staff_authoring_private.list_staff_members()
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

create or replace function staff_authoring_private.set_course_author_assignment(
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

create or replace function class_community_private.list_my_teaching_classes()
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

create or replace function class_community_private.save_teaching_class(
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

create or replace function class_community_private.get_class_people(p_class_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_is_authorized boolean;
  v_members jsonb;
  v_invites jsonb;
begin
  v_actor := course_library_private.verified_course_actor();

  select exists (
    select 1 from class_community_private.classes where class_id = p_class_id and teacher_id = v_actor
  ) or exists (
    select 1 from staff_authoring_private.staff_roles where user_id = v_actor and role = 'admin'
  ) into v_is_authorized;

  if not v_is_authorized then
    raise exception using errcode = '42501', message = 'class_access_denied';
  end if;

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

create or replace function class_community_private.invite_class_member(
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

create or replace function class_community_private.revoke_class_invitation(p_invitation_id uuid)
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

create or replace function class_community_private.update_class_member_status(
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

create or replace function class_community_private.join_class_by_token(p_token text)
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

  insert into class_community_private.class_members (class_id, user_id, status)
    values (v_invitation.class_id, v_actor, 'active')
    on conflict (class_id, user_id)
    do update set status = 'active';

  update class_community_private.class_invitations
  set status = 'accepted'
  where invitation_id = v_invitation.invitation_id;

  return jsonb_build_object(
    'ok', true,
    'class_id', v_invitation.class_id,
    'class_name', v_class.name
  );
end; $$;

create or replace function class_community_private.get_class_learning_summary(p_class_id uuid)
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

create or replace function public.list_staff_members()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.list_staff_members();
$$;

create or replace function public.set_course_author_assignment(p_target_email text, p_course_id uuid, p_active boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.set_course_author_assignment(p_target_email, p_course_id, p_active);
$$;

create or replace function public.list_my_teaching_classes()
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.list_my_teaching_classes();
$$;

create or replace function public.save_teaching_class(
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

create or replace function public.get_class_people(p_class_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.get_class_people(p_class_id);
$$;

create or replace function public.invite_class_member(p_class_id uuid, p_name text, p_email text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.invite_class_member(p_class_id, p_name, p_email);
$$;

create or replace function public.revoke_class_invitation(p_invitation_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.revoke_class_invitation(p_invitation_id);
$$;

create or replace function public.update_class_member_status(p_class_id uuid, p_target_user_id uuid, p_status text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.update_class_member_status(p_class_id, p_target_user_id, p_status);
$$;

create or replace function public.join_class_by_token(p_token text)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.join_class_by_token(p_token);
$$;

create or replace function public.get_class_learning_summary(p_class_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select class_community_private.get_class_learning_summary(p_class_id);
$$;

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

COMMIT;
