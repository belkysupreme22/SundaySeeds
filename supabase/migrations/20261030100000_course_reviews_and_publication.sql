-- Migration: Course Reviews and Atomic Publication (S3 & S4)
-- Allows teachers to submit fixed draft snapshots for review, and authorized admins to inspect,
-- request changes, or atomically publish a reviewed edition.

create table staff_authoring_private.course_reviews (
  review_id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course_library_private.courses(course_id),
  draft_id uuid not null,
  revision bigint not null check (revision between 1 and 9007199254740991),
  submitted_by uuid not null references auth.users(id),
  snapshot jsonb not null check (staff_authoring_private.valid_course_draft(snapshot)),
  status text not null default 'pending' check (status in ('pending', 'changes_requested', 'approved', 'published')),
  review_notes text,
  reviewed_by uuid references auth.users(id),
  published_edition_number integer check (published_edition_number is null or published_edition_number > 0),
  published_release_id uuid,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);
create index course_reviews_course_idx on staff_authoring_private.course_reviews(course_id);
create index course_reviews_status_idx on staff_authoring_private.course_reviews(status);

create table staff_authoring_private.review_submission_receipts (
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  review_id uuid not null references staff_authoring_private.course_reviews(review_id) on delete cascade,
  created_at timestamptz not null default clock_timestamp(),
  primary key (actor_id, request_key)
);

create table staff_authoring_private.review_decision_receipts (
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  review_id uuid not null references staff_authoring_private.course_reviews(review_id) on delete cascade,
  action text not null check (action in ('changes_requested', 'approved', 'published')),
  created_at timestamptz not null default clock_timestamp(),
  primary key (actor_id, request_key)
);

alter table staff_authoring_private.course_reviews enable row level security;
alter table staff_authoring_private.review_submission_receipts enable row level security;
alter table staff_authoring_private.review_decision_receipts enable row level security;

revoke all on table staff_authoring_private.course_reviews,
  staff_authoring_private.review_submission_receipts,
  staff_authoring_private.review_decision_receipts
  from public, anon, authenticated, service_role;

-- Submit draft snapshot for admin review
create function staff_authoring_private.submit_course_draft_for_review(
  p_course_id uuid,
  p_expected_revision bigint,
  p_request_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_draft staff_authoring_private.course_drafts%rowtype;
  v_receipt staff_authoring_private.review_submission_receipts%rowtype;
  v_review staff_authoring_private.course_reviews%rowtype;
  v_lesson jsonb;
begin
  if p_request_key is null or p_expected_revision is null then
    raise exception using errcode = '22023', message = 'invalid_review_request';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('review-submit:' || v_actor::text || ':' || p_request_key::text, 0));

  -- Check existing receipt for idempotent retry
  select * into v_receipt
    from staff_authoring_private.review_submission_receipts
    where actor_id = v_actor and request_key = p_request_key;

  if found then
    select * into v_review
      from staff_authoring_private.course_reviews
      where review_id = v_receipt.review_id;
    return jsonb_build_object(
      'ok', true,
      'review_id', v_review.review_id,
      'status', v_review.status,
      'revision', v_review.revision,
      'created_at', v_review.created_at
    );
  end if;

  -- Lock author assignment & draft
  perform staff_authoring_private.lock_author_access(v_actor, p_course_id);
  select * into v_draft
    from staff_authoring_private.course_drafts
    where course_id = p_course_id for share;

  if not found or v_draft.revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'draft_revision_conflict';
  end if;

  -- Quality verification: every lesson must have at least one knowledge check for publication readiness
  for v_lesson in select value from jsonb_array_elements(v_draft.content->'lessons') loop
    if jsonb_array_length(v_lesson->'quiz') < 1 then
      raise exception using errcode = '22023', message = 'all_lessons_require_quizzes_for_review';
    end if;
  end loop;

  -- Insert frozen review snapshot
  insert into staff_authoring_private.course_reviews (
    course_id, draft_id, revision, submitted_by, snapshot, status
  ) values (
    p_course_id, v_draft.draft_id, v_draft.revision, v_actor, v_draft.content, 'pending'
  ) returning * into v_review;

  insert into staff_authoring_private.review_submission_receipts (actor_id, request_key, review_id)
    values (v_actor, p_request_key, v_review.review_id);

  return jsonb_build_object(
    'ok', true,
    'review_id', v_review.review_id,
    'status', v_review.status,
    'revision', v_review.revision,
    'created_at', v_review.created_at
  );
end; $$;

-- List course reviews (Admin sees all; Teachers see their own)
create function staff_authoring_private.list_course_reviews()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_is_admin boolean;
  v_reviews jsonb;
begin
  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  select coalesce(jsonb_agg(jsonb_build_object(
    'review_id', r.review_id,
    'course_id', r.course_id,
    'title', coalesce(r.snapshot->'course'->>'title', o.title, 'Untitled Course'),
    'revision', r.revision,
    'status', r.status,
    'submitted_by', u.email,
    'review_notes', r.review_notes,
    'published_edition_number', r.published_edition_number,
    'created_at', r.created_at,
    'updated_at', r.updated_at
  ) order by r.created_at desc), '[]'::jsonb)
  into v_reviews
  from staff_authoring_private.course_reviews r
  left join public.course_offerings o on o.course_id = r.course_id
  left join auth.users u on u.id = r.submitted_by
  where v_is_admin or r.submitted_by = v_actor;

  return jsonb_build_object('ok', true, 'reviews', v_reviews);
end; $$;

-- Get single review snapshot
create function staff_authoring_private.get_course_review(p_review_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_is_admin boolean;
  v_review staff_authoring_private.course_reviews%rowtype;
  v_submitter_email text;
begin
  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  select * into v_review
    from staff_authoring_private.course_reviews
    where review_id = p_review_id;

  if not found then
    raise exception using errcode = '22023', message = 'review_not_found';
  end if;

  if not v_is_admin and v_review.submitted_by <> v_actor then
    raise exception using errcode = '42501', message = 'access_denied';
  end if;

  select email into v_submitter_email from auth.users where id = v_review.submitted_by;

  return jsonb_build_object(
    'ok', true,
    'review_id', v_review.review_id,
    'course_id', v_review.course_id,
    'revision', v_review.revision,
    'status', v_review.status,
    'submitted_by', coalesce(v_submitter_email, ''),
    'review_notes', v_review.review_notes,
    'published_edition_number', v_review.published_edition_number,
    'snapshot', v_review.snapshot,
    'created_at', v_review.created_at,
    'updated_at', v_review.updated_at
  );
end; $$;

-- Return review for changes
create function staff_authoring_private.return_course_review_for_changes(
  p_review_id uuid,
  p_notes text,
  p_request_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_is_admin boolean;
  v_review staff_authoring_private.course_reviews%rowtype;
begin
  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  select * into v_review
    from staff_authoring_private.course_reviews
    where review_id = p_review_id for update;

  if not found then
    raise exception using errcode = '22023', message = 'review_not_found';
  end if;

  if v_review.status = 'published' then
    raise exception using errcode = '22023', message = 'cannot_return_published_edition';
  end if;

  update staff_authoring_private.course_reviews
    set status = 'changes_requested',
        review_notes = btrim(p_notes),
        reviewed_by = v_actor,
        updated_at = clock_timestamp()
    where review_id = p_review_id
    returning * into v_review;

  insert into staff_authoring_private.review_decision_receipts (actor_id, request_key, review_id, action)
    values (v_actor, p_request_key, p_review_id, 'changes_requested')
    on conflict do nothing;

  return jsonb_build_object('ok', true, 'review_id', v_review.review_id, 'status', v_review.status);
end; $$;

-- Atomic publication of a reviewed edition (S4)
create function staff_authoring_private.publish_course_review(
  p_review_id uuid,
  p_request_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_is_admin boolean;
  v_review staff_authoring_private.course_reviews%rowtype;
  v_course_id uuid;
  v_next_edition integer;
  v_release_id uuid;
  v_snapshot jsonb;
  v_course_meta jsonb;
  v_modules jsonb;
  v_lesson jsonb;
  v_reading_body jsonb;
  v_assessment_snapshot jsonb;
  v_slug text;
begin
  -- 1. Check admin authority
  select exists (
    select 1 from staff_authoring_private.staff_roles
    where user_id = v_actor and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception using errcode = '42501', message = 'admin_permission_required';
  end if;

  -- 2. Lock review record
  select * into v_review
    from staff_authoring_private.course_reviews
    where review_id = p_review_id for update;

  if not found then
    raise exception using errcode = '22023', message = 'review_not_found';
  end if;

  if v_review.status = 'published' then
    return jsonb_build_object(
      'ok', true,
      'review_id', v_review.review_id,
      'status', 'published',
      'edition_number', v_review.published_edition_number,
      'release_id', v_review.published_release_id,
      'message', 'already_published'
    );
  end if;

  v_course_id := v_review.course_id;
  v_snapshot := v_review.snapshot;
  v_course_meta := v_snapshot->'course';
  v_modules := v_snapshot->'modules';

  -- 3. Lock target course and compute next edition number
  perform 1 from course_library_private.courses where course_id = v_course_id for update;

  select coalesce(max(edition_number), 0) + 1 into v_next_edition
    from course_library_private.course_releases
    where course_id = v_course_id;

  v_release_id := gen_random_uuid();

  -- Build slug from title or fallback
  v_slug := lower(regexp_replace(btrim(v_course_meta->>'title'), '[^a-zA-Z0-9]+', '-', 'g'));
  if length(v_slug) < 2 then v_slug := 'course-' || v_next_edition::text; end if;

  -- 4. Insert immutable course release
  insert into course_library_private.course_releases (
    release_id, course_id, edition_number, snapshot, is_available
  ) values (
    v_release_id,
    v_course_id,
    v_next_edition,
    jsonb_build_object(
      'title', v_course_meta->>'title',
      'summary', v_course_meta->>'summary',
      'topics', v_course_meta->'topics',
      'learning_goals', v_course_meta->'learningGoals',
      'outcomes', v_course_meta->'outcomes',
      'audience', v_course_meta->>'audience',
      'language', v_course_meta->>'language',
      'level', v_course_meta->'level',
      'estimated_minutes', v_course_meta->'estimatedMinutes',
      'estimate_basis', v_course_meta->'estimateBasis',
      'modules', v_modules,
      'is_development', true
    ),
    true
  );

  -- 5. Insert each lesson reading into course_lesson_readings
  for v_lesson in select value from jsonb_array_elements(v_snapshot->'lessons') loop
    v_reading_body := jsonb_build_object(
      'id', v_lesson->>'id',
      'title', v_lesson->>'title',
      'subtitle', v_lesson->>'subtitle',
      'scripture', v_lesson->>'scripture',
      'estimated_minutes', v_lesson->'estimatedMinutes',
      'outcomes', v_lesson->'outcomes',
      'sections', v_lesson->'sections',
      'memory_verse', v_lesson->'memoryVerse'
    );

    insert into course_library_private.course_lesson_readings (
      release_id, course_id, lesson_id, body
    ) values (
      v_release_id, v_course_id, v_lesson->>'id', v_reading_body
    );
  end loop;

  -- 6. Insert assessment set (sealed questions and answer keys)
  v_assessment_snapshot := jsonb_build_object(
    'checks', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'lesson_id', l->>'id',
        'questions', l->'quiz'
      )), '[]'::jsonb)
      from jsonb_array_elements(v_snapshot->'lessons') as l
    )
  );

  insert into course_library_private.course_assessment_sets (
    release_id, course_id, snapshot
  ) values (
    v_release_id, v_course_id, v_assessment_snapshot
  );

  -- 7. Update course_offerings to point to the newly published release
  insert into public.course_offerings (
    course_id, release_id, slug, title, summary, topics, learning_goals, outcomes,
    audience, language, level, estimated_minutes, estimate_basis, modules,
    is_listed, joins_open, is_development, is_available
  ) values (
    v_course_id, v_release_id, v_slug, v_course_meta->>'title', v_course_meta->>'summary',
    coalesce((select array_agg(value#>>'{}') from jsonb_array_elements(v_course_meta->'topics')), '{}'::text[]),
    coalesce((select array_agg(value#>>'{}') from jsonb_array_elements(v_course_meta->'learningGoals')), '{}'::text[]),
    coalesce((select array_agg(value#>>'{}') from jsonb_array_elements(v_course_meta->'outcomes')), '{}'::text[]),
    v_course_meta->>'audience', v_course_meta->>'language', v_course_meta->>'level',
    (v_course_meta->>'estimatedMinutes')::integer, v_course_meta->>'estimateBasis',
    v_modules, true, true, true, true
  )
  on conflict (course_id) do update set
    release_id = excluded.release_id,
    offering_revision = public.course_offerings.offering_revision + 1,
    title = excluded.title,
    summary = excluded.summary,
    topics = excluded.topics,
    learning_goals = excluded.learning_goals,
    outcomes = excluded.outcomes,
    audience = excluded.audience,
    language = excluded.language,
    level = excluded.level,
    estimated_minutes = excluded.estimated_minutes,
    estimate_basis = excluded.estimate_basis,
    modules = excluded.modules,
    is_available = true,
    joins_open = true;

  -- 8. Mark review record as published
  update staff_authoring_private.course_reviews
    set status = 'published',
        published_edition_number = v_next_edition,
        published_release_id = v_release_id,
        reviewed_by = v_actor,
        updated_at = clock_timestamp()
    where review_id = p_review_id;

  insert into staff_authoring_private.review_decision_receipts (actor_id, request_key, review_id, action)
    values (v_actor, p_request_key, p_review_id, 'published')
    on conflict do nothing;

  return jsonb_build_object(
    'ok', true,
    'review_id', p_review_id,
    'status', 'published',
    'edition_number', v_next_edition,
    'release_id', v_release_id
  );
end; $$;

-- Public wrappers
create function public.submit_course_draft_for_review(p_course_id uuid, p_expected_revision bigint, p_request_key uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.submit_course_draft_for_review(p_course_id, p_expected_revision, p_request_key);
$$;

create function public.list_course_reviews()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.list_course_reviews();
$$;

create function public.get_course_review(p_review_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.get_course_review(p_review_id);
$$;

create function public.return_course_review_for_changes(p_review_id uuid, p_notes text, p_request_key uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.return_course_review_for_changes(p_review_id, p_notes, p_request_key);
$$;

create function public.publish_course_review(p_review_id uuid, p_request_key uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.publish_course_review(p_review_id, p_request_key);
$$;

-- Revoke all by default
revoke all on function staff_authoring_private.submit_course_draft_for_review(uuid, bigint, uuid),
  staff_authoring_private.list_course_reviews(),
  staff_authoring_private.get_course_review(uuid),
  staff_authoring_private.return_course_review_for_changes(uuid, text, uuid),
  staff_authoring_private.publish_course_review(uuid, uuid)
  from public, anon, authenticated, service_role;

revoke all on function public.submit_course_draft_for_review(uuid, bigint, uuid),
  public.list_course_reviews(),
  public.get_course_review(uuid),
  public.return_course_review_for_changes(uuid, text, uuid),
  public.publish_course_review(uuid, uuid)
  from public, anon, authenticated, service_role;

-- Grant execution to authenticated users
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
