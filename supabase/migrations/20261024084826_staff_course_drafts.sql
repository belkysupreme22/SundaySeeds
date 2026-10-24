-- SOURCE ONLY: no staff provisioning, live deployment or publication is implied.
-- Requires course library + verified actor migrations. The private draft stores
-- incomplete authored content; it is never a published learner release.
create schema staff_authoring_private;
revoke all on schema staff_authoring_private from public, anon, authenticated, service_role;

-- Staged JSON helpers deliberately return false for SQL/JSON null and malformed
-- scalar/container values. Every object below requires exactly its named keys.
create function staff_authoring_private.exact_object(p_value jsonb,p_keys text[])
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
begin
  if jsonb_typeof(p_value) is distinct from 'object' then return false; end if;
  return p_value ?& p_keys and p_value - p_keys = '{}'::jsonb;
end; $$;

create function staff_authoring_private.draft_string(p_value jsonb,p_limit integer)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare v_text text;
begin
  if jsonb_typeof(p_value) is distinct from 'string' then return false; end if;
  v_text := p_value #>> '{}';
  -- No inline data URL assets, including a data URL pasted into a text field.
  return char_length(v_text) <= p_limit and v_text !~* '\mdata:[^[:space:]]*,'
    and ltrim(v_text) !~* '^data:';
end; $$;

create function staff_authoring_private.draft_id(p_value jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
begin
  if not staff_authoring_private.draft_string(p_value,120) then return false; end if;
  return (p_value #>> '{}') ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
end; $$;

create function staff_authoring_private.nullable_minutes(p_value jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
begin
  if p_value = 'null'::jsonb then return true; end if;
  if jsonb_typeof(p_value) is distinct from 'number' then return false; end if;
  return p_value::numeric between 1 and 9007199254740991
    and trunc(p_value::numeric) = p_value::numeric;
end; $$;

create function staff_authoring_private.draft_string_array(p_value jsonb,p_max integer,p_limit integer)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare v_item jsonb;
begin
  if jsonb_typeof(p_value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_value) > p_max then return false; end if;
  for v_item in select value from jsonb_array_elements(p_value) loop
    if not staff_authoring_private.draft_string(v_item,p_limit) then return false; end if;
  end loop;
  return true;
end; $$;

create function staff_authoring_private.valid_course_draft(p_content jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare
  v_course jsonb; v_module jsonb; v_lesson jsonb; v_item jsonb;
  v_question jsonb; v_option jsonb; v_ref jsonb;
  v_id text; v_answer text;
  v_module_ids text[] := '{}'; v_lesson_ids text[] := '{}';
  v_placed_ids text[] := '{}'; v_local_ids text[]; v_option_ids text[];
begin
  if not staff_authoring_private.exact_object(p_content,array['schemaVersion','course','modules','lessons']) then return false; end if;
  if octet_length(convert_to(p_content::text,'UTF8')) > 1048576
    or p_content->'schemaVersion' <> '1'::jsonb then return false; end if;
  v_course := p_content->'course';
  if not staff_authoring_private.exact_object(v_course,array['title','summary','audience','topics','learningGoals','outcomes','language','level','estimatedMinutes','estimateBasis']) then return false; end if;
  if not staff_authoring_private.draft_string(v_course->'title',200)
    or not staff_authoring_private.draft_string(v_course->'summary',2000)
    or not staff_authoring_private.draft_string(v_course->'audience',300)
    or not staff_authoring_private.draft_string(v_course->'language',50)
    or not (v_course->'level' = 'null'::jsonb or staff_authoring_private.draft_string(v_course->'level',100))
    or not staff_authoring_private.draft_string_array(v_course->'topics',20,200)
    or not staff_authoring_private.draft_string_array(v_course->'learningGoals',20,2000)
    or not staff_authoring_private.draft_string_array(v_course->'outcomes',20,2000)
    or not staff_authoring_private.nullable_minutes(v_course->'estimatedMinutes') then return false; end if;
  if v_course->'estimatedMinutes' = 'null'::jsonb then
    if v_course->'estimateBasis' <> 'null'::jsonb then return false; end if;
  elsif v_course->'estimateBasis' not in ('"reading"'::jsonb,'"full_study"'::jsonb) then return false;
  end if;
  if jsonb_typeof(p_content->'modules') is distinct from 'array'
    or jsonb_typeof(p_content->'lessons') is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_content->'modules') > 100
    or jsonb_array_length(p_content->'lessons') > 1000 then return false; end if;
  for v_lesson in select value from jsonb_array_elements(p_content->'lessons') loop
    if not staff_authoring_private.exact_object(v_lesson,array['id','title','subtitle','scripture','estimatedMinutes','intro','outcomes','memoryVerse','sections','reflection','quiz']) then return false; end if;
    if not staff_authoring_private.draft_id(v_lesson->'id') then return false; end if;
    v_id := v_lesson->>'id';
    if v_id = any(v_lesson_ids) then return false; end if;
    v_lesson_ids := array_append(v_lesson_ids,v_id);
    if not staff_authoring_private.draft_string(v_lesson->'title',200)
      or not staff_authoring_private.draft_string(v_lesson->'subtitle',500)
      or not staff_authoring_private.draft_string(v_lesson->'scripture',300)
      or not staff_authoring_private.draft_string(v_lesson->'intro',10000)
      or not staff_authoring_private.draft_string(v_lesson->'reflection',10000)
      or not staff_authoring_private.nullable_minutes(v_lesson->'estimatedMinutes') then return false; end if;
    if not staff_authoring_private.exact_object(v_lesson->'memoryVerse',array['text','reference']) then return false; end if;
    if not staff_authoring_private.draft_string(v_lesson->'memoryVerse'->'text',10000)
      or not staff_authoring_private.draft_string(v_lesson->'memoryVerse'->'reference',300) then return false; end if;
    if jsonb_typeof(v_lesson->'outcomes') is distinct from 'array'
      or jsonb_typeof(v_lesson->'sections') is distinct from 'array'
      or jsonb_typeof(v_lesson->'quiz') is distinct from 'array' then return false; end if;
    if jsonb_array_length(v_lesson->'outcomes') > 6
      or jsonb_array_length(v_lesson->'sections') > 12
      or jsonb_array_length(v_lesson->'quiz') > 10 then return false; end if;
    for v_item in select value from jsonb_array_elements(v_lesson->'outcomes') loop
      if not staff_authoring_private.exact_object(v_item,array['title','description']) then return false; end if;
      if not staff_authoring_private.draft_string(v_item->'title',200)
        or not staff_authoring_private.draft_string(v_item->'description',2000) then return false; end if;
    end loop;
    v_local_ids := '{}';
    for v_item in select value from jsonb_array_elements(v_lesson->'sections') loop
      if not staff_authoring_private.exact_object(v_item,array['id','title','body']) then return false; end if;
      if not staff_authoring_private.draft_id(v_item->'id')
        or not staff_authoring_private.draft_string(v_item->'title',200)
        or not staff_authoring_private.draft_string(v_item->'body',10000) then return false; end if;
      v_id := v_item->>'id';
      if v_id = any(v_local_ids) then return false; end if;
      v_local_ids := array_append(v_local_ids,v_id);
    end loop;
    v_local_ids := '{}';
    for v_question in select value from jsonb_array_elements(v_lesson->'quiz') loop
      if not staff_authoring_private.exact_object(v_question,array['id','prompt','options','correctOptionId','explanation']) then return false; end if;
      if not staff_authoring_private.draft_id(v_question->'id')
        or not staff_authoring_private.draft_string(v_question->'prompt',10000)
        or not staff_authoring_private.draft_string(v_question->'explanation',10000) then return false; end if;
      v_id := v_question->>'id';
      if v_id = any(v_local_ids) then return false; end if;
      v_local_ids := array_append(v_local_ids,v_id);
      if jsonb_typeof(v_question->'options') is distinct from 'array' then return false; end if;
      if jsonb_array_length(v_question->'options') > 4 then return false; end if;
      v_option_ids := '{}';
      for v_option in select value from jsonb_array_elements(v_question->'options') loop
        if not staff_authoring_private.exact_object(v_option,array['id','text']) then return false; end if;
        if not staff_authoring_private.draft_id(v_option->'id')
          or not staff_authoring_private.draft_string(v_option->'text',10000) then return false; end if;
        v_id := v_option->>'id';
        if v_id = any(v_option_ids) then return false; end if;
        v_option_ids := array_append(v_option_ids,v_id);
      end loop;
      if v_question->'correctOptionId' <> 'null'::jsonb then
        if not staff_authoring_private.draft_id(v_question->'correctOptionId') then return false; end if;
        v_answer := v_question->>'correctOptionId';
        if not (v_answer = any(v_option_ids)) then return false; end if;
      end if;
    end loop;
  end loop;
  for v_module in select value from jsonb_array_elements(p_content->'modules') loop
    if not staff_authoring_private.exact_object(v_module,array['id','title','lessonIds']) then return false; end if;
    if not staff_authoring_private.draft_id(v_module->'id')
      or not staff_authoring_private.draft_string(v_module->'title',200) then return false; end if;
    v_id := v_module->>'id';
    if v_id = any(v_module_ids) then return false; end if;
    v_module_ids := array_append(v_module_ids,v_id);
    if jsonb_typeof(v_module->'lessonIds') is distinct from 'array' then return false; end if;
    if jsonb_array_length(v_module->'lessonIds') > 1000 then return false; end if;
    for v_ref in select value from jsonb_array_elements(v_module->'lessonIds') loop
      if not staff_authoring_private.draft_id(v_ref) then return false; end if;
      v_id := v_ref #>> '{}';
      if not (v_id = any(v_lesson_ids)) or v_id = any(v_placed_ids) then return false; end if;
      v_placed_ids := array_append(v_placed_ids,v_id);
    end loop;
  end loop;
  return true;
end; $$;

create table staff_authoring_private.course_author_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references course_library_private.courses(course_id),
  state text not null default 'active' check (state in ('active','revoked')),
  revision bigint not null default 1 check (revision between 1 and 9007199254740991),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  primary key(user_id,course_id)
);
create index course_author_assignments_course_idx on staff_authoring_private.course_author_assignments(course_id);

create table staff_authoring_private.course_drafts (
  course_id uuid primary key references course_library_private.courses(course_id),
  draft_id uuid not null unique default gen_random_uuid(),
  revision bigint not null check (revision between 1 and 9007199254740991),
  content jsonb not null check (staff_authoring_private.valid_course_draft(content)),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default clock_timestamp()
);
create index course_drafts_updated_by_idx on staff_authoring_private.course_drafts(updated_by);

-- Exact JSONB equality binds a request to its original content without a digest
-- collision or an extension dependency. This private recovery data contains old
-- content and needs a separately agreed retention policy before production.
create table staff_authoring_private.draft_save_receipts (
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  course_id uuid not null references course_library_private.courses(course_id),
  expected_revision bigint not null check (expected_revision between 0 and 9007199254740990),
  saved_revision bigint not null check (saved_revision=expected_revision+1),
  payload jsonb not null check (staff_authoring_private.valid_course_draft(payload)),
  saved_at timestamptz not null default clock_timestamp(),
  primary key(actor_id,request_key)
);
create index draft_save_receipts_course_idx on staff_authoring_private.draft_save_receipts(course_id);

-- Successful writes only. No authored body or answer key is in the audit row.
create table staff_authoring_private.draft_save_audit (
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  course_id uuid not null references course_library_private.courses(course_id),
  draft_id uuid not null references staff_authoring_private.course_drafts(draft_id),
  saved_revision bigint not null check (saved_revision between 1 and 9007199254740991),
  saved_at timestamptz not null,
  primary key(actor_id,request_key),
  foreign key(actor_id,request_key) references staff_authoring_private.draft_save_receipts(actor_id,request_key) on delete cascade
);
create index draft_save_audit_course_idx on staff_authoring_private.draft_save_audit(course_id);
create index draft_save_audit_draft_idx on staff_authoring_private.draft_save_audit(draft_id);

create function staff_authoring_private.guard_author_assignment()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op='INSERT' then
    if new.state <> 'active' or new.revision <> 1 then
      raise exception using errcode='22023',message='invalid_staff_assignment';
    end if;
    new.created_at := clock_timestamp(); new.updated_at := new.created_at;
  else
    if row(new.user_id,new.course_id,new.created_at) is distinct from row(old.user_id,old.course_id,old.created_at)
      or (new.state=old.state and new.revision<>old.revision)
      or (new.state<>old.state and (old.state<>'active' or new.state<>'revoked'
        or new.revision::numeric<>old.revision::numeric+1)) then
      raise exception using errcode='22023',message='invalid_staff_assignment';
    end if;
    new.updated_at := case when new.state=old.state then old.updated_at else clock_timestamp() end;
  end if;
  return new;
end; $$;
create trigger guard_author_assignment before insert or update on staff_authoring_private.course_author_assignments
  for each row execute function staff_authoring_private.guard_author_assignment();

create function staff_authoring_private.guard_course_draft()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op='INSERT' then
    if new.revision<>1 or new.updated_by is null then
      raise exception using errcode='22023',message='invalid_draft_request';
    end if;
  else
    if row(new.course_id,new.draft_id) is distinct from row(old.course_id,old.draft_id) then
      raise exception using errcode='22023',message='invalid_draft_request';
    end if;
    -- Auth deletion clears attribution but must retain the shared course draft.
    if new.updated_by is null and old.updated_by is not null
      and row(new.revision,new.content,new.updated_at) is not distinct from row(old.revision,old.content,old.updated_at) then
      return new;
    end if;
    if new.revision::numeric <> old.revision::numeric+1 or new.updated_by is null then
      raise exception using errcode='22023',message='invalid_draft_request';
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end; $$;
create trigger guard_course_draft before insert or update on staff_authoring_private.course_drafts
  for each row execute function staff_authoring_private.guard_course_draft();

create function staff_authoring_private.reject_save_record_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  raise exception using errcode='22023',message='immutable_draft_save_record';
end; $$;
-- Deletion is not intercepted: owner-mediated Auth deletion must cascade. Clients
-- have no table DELETE grant; this is immutable history, not an erasure blocker.
create trigger immutable_draft_save_receipt before update on staff_authoring_private.draft_save_receipts
  for each row execute function staff_authoring_private.reject_save_record_update();
create trigger immutable_draft_save_audit before update on staff_authoring_private.draft_save_audit
  for each row execute function staff_authoring_private.reject_save_record_update();

create function staff_authoring_private.lock_author_access(p_actor uuid,p_course_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_state text; v_actor uuid;
begin
  if p_course_id is null then raise exception using errcode='22023',message='invalid_draft_request'; end if;
  -- Auth DELETE locks its parent before cascading into assignments. Match that
  -- order before taking assignment SHARE and before later receipt/updater FKs.
  -- Recheck live actor facts after a possible parent-lock wait; session rows are
  -- not locked, so this does not promise cancellation of an in-flight session.
  perform 1 from auth.users where id=p_actor for key share;
  if not found then
    raise exception using errcode='42501',message='authentication_required';
  end if;
  v_actor := course_library_private.verified_course_actor();
  if v_actor is distinct from p_actor then
    raise exception using errcode='42501',message='authentication_required';
  end if;
  select state into v_state from staff_authoring_private.course_author_assignments
    where user_id=p_actor and course_id=p_course_id for share;
  if not found or v_state<>'active' then
    raise exception using errcode='42501',message='staff_access_required';
  end if;
end; $$;

create function staff_authoring_private.draft_projection(p_draft staff_authoring_private.course_drafts)
returns jsonb language sql security invoker set search_path = '' as $$
  select case when p_draft.draft_id is null then 'null'::jsonb else jsonb_build_object(
    'draft_id',p_draft.draft_id,'revision',p_draft.revision,
    'content',p_draft.content,'updated_at',p_draft.updated_at) end;
$$;

create function staff_authoring_private.list_my_authoring_courses()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor(); v_courses jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'course_id',a.course_id,'draft_id',d.draft_id,'revision',coalesce(d.revision,0),
    'title',coalesce(d.content->'course'->>'title',o.title,'Untitled course')) order by a.course_id),'[]'::jsonb)
    into v_courses
    from staff_authoring_private.course_author_assignments a
    left join staff_authoring_private.course_drafts d on d.course_id=a.course_id
    left join public.course_offerings o on o.course_id=a.course_id
    where a.user_id=v_actor and a.state='active';
  return jsonb_build_object('actor_id',v_actor,'courses',v_courses);
end; $$;

create function staff_authoring_private.get_my_course_draft(p_course_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_draft staff_authoring_private.course_drafts%rowtype;
begin
  perform staff_authoring_private.lock_author_access(v_actor,p_course_id);
  select * into v_draft from staff_authoring_private.course_drafts where course_id=p_course_id for share;
  return jsonb_build_object('actor_id',v_actor,'course_id',p_course_id,
    'draft',staff_authoring_private.draft_projection(v_draft));
end; $$;

create function staff_authoring_private.save_my_course_draft(
  p_course_id uuid,p_expected_revision bigint,p_request_key uuid,p_content jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := course_library_private.verified_course_actor();
  v_draft staff_authoring_private.course_drafts%rowtype;
  v_receipt staff_authoring_private.draft_save_receipts%rowtype;
begin
  if p_request_key is null or p_expected_revision is null
    or p_expected_revision not between 0 and 9007199254740991 then
    raise exception using errcode='22023',message='invalid_draft_request';
  end if;
  -- Serialize actor request key -> Auth parent KEY SHARE -> grant SHARE -> draft.
  -- Revocation takes UPDATE on the same assignment. No release/offering/enrollment
  -- lock or mutation participates. Trusted batch revocation must not invert this.
  perform pg_advisory_xact_lock(hashtextextended('staff-request:'||v_actor::text||':'||p_request_key::text,0));
  perform staff_authoring_private.lock_author_access(v_actor,p_course_id);
  if not staff_authoring_private.valid_course_draft(p_content) then
    raise exception using errcode='22023',message='invalid_draft_content';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('staff-draft:'||p_course_id::text,0));
  select * into v_draft from staff_authoring_private.course_drafts where course_id=p_course_id for update;
  select * into v_receipt from staff_authoring_private.draft_save_receipts
    where actor_id=v_actor and request_key=p_request_key;
  if found then
    if v_receipt.course_id<>p_course_id or v_receipt.expected_revision<>p_expected_revision
      or v_receipt.payload is distinct from p_content then
      raise exception using errcode='22023',message='draft_request_mismatch';
    end if;
    if v_draft.draft_id is null or v_draft.revision<v_receipt.saved_revision then
      raise exception using errcode='40001',message='draft_revision_conflict';
    end if;
    -- Receipt is original acknowledgement, draft is CURRENT; no old body leaks.
    return jsonb_build_object('actor_id',v_actor,'course_id',p_course_id,
      'request_key',p_request_key,'saved_revision',v_receipt.saved_revision,
      'draft',staff_authoring_private.draft_projection(v_draft));
  end if;
  if p_expected_revision<>coalesce(v_draft.revision,0) or p_expected_revision=9007199254740991 then
    raise exception using errcode='40001',message='draft_revision_conflict';
  end if;
  if v_draft.draft_id is null then
    insert into staff_authoring_private.course_drafts(course_id,revision,content,updated_by)
      values(p_course_id,1,p_content,v_actor) returning * into v_draft;
  else
    update staff_authoring_private.course_drafts set revision=revision+1,content=p_content,updated_by=v_actor
      where course_id=p_course_id returning * into v_draft;
  end if;
  insert into staff_authoring_private.draft_save_receipts(actor_id,request_key,course_id,expected_revision,saved_revision,payload,saved_at)
    values(v_actor,p_request_key,p_course_id,p_expected_revision,v_draft.revision,p_content,v_draft.updated_at);
  insert into staff_authoring_private.draft_save_audit(actor_id,request_key,course_id,draft_id,saved_revision,saved_at)
    values(v_actor,p_request_key,p_course_id,v_draft.draft_id,v_draft.revision,v_draft.updated_at);
  return jsonb_build_object('actor_id',v_actor,'course_id',p_course_id,
    'request_key',p_request_key,'saved_revision',v_draft.revision,
    'draft',staff_authoring_private.draft_projection(v_draft));
end; $$;

create function public.list_my_authoring_courses()
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.list_my_authoring_courses();
$$;
create function public.get_my_course_draft(p_course_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.get_my_course_draft(p_course_id);
$$;
create function public.save_my_course_draft(p_course_id uuid,p_expected_revision bigint,p_request_key uuid,p_content jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
  select staff_authoring_private.save_my_course_draft(p_course_id,p_expected_revision,p_request_key,p_content);
$$;

alter table staff_authoring_private.course_author_assignments enable row level security;
alter table staff_authoring_private.course_drafts enable row level security;
alter table staff_authoring_private.draft_save_receipts enable row level security;
alter table staff_authoring_private.draft_save_audit enable row level security;
revoke all on all tables in schema staff_authoring_private from public,anon,authenticated,service_role;
revoke all on all functions in schema staff_authoring_private from public,anon,authenticated,service_role;
revoke all on function public.list_my_authoring_courses(),public.get_my_course_draft(uuid),
  public.save_my_course_draft(uuid,bigint,uuid,jsonb) from public,anon,authenticated,service_role;
grant usage on schema staff_authoring_private to authenticated;
grant execute on function staff_authoring_private.list_my_authoring_courses(),
  staff_authoring_private.get_my_course_draft(uuid),
  staff_authoring_private.save_my_course_draft(uuid,bigint,uuid,jsonb) to authenticated;
grant execute on function public.list_my_authoring_courses(),public.get_my_course_draft(uuid),
  public.save_my_course_draft(uuid,bigint,uuid,jsonb) to authenticated;
