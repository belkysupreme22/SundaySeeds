-- SOURCE ONLY: additive storage; no activation, content, client API or progress.
-- A later reviewed import inserts one complete sealed snapshot for an edition.
create function course_library_private.valid_assessment_snapshot(p_snapshot jsonb)
returns boolean language plpgsql immutable security invoker set search_path = ''
as $$
declare
  v_lesson jsonb;
  v_question jsonb;
  v_option jsonb;
  v_key text;
  v_lessons text[] := '{}';
  v_questions text[];
  v_options text[];
begin
  if jsonb_typeof(p_snapshot) is distinct from 'object' then return false; end if;
  if p_snapshot - array['schemaVersion','lessons'] <> '{}'::jsonb
    or p_snapshot->'schemaVersion' is distinct from '1'::jsonb
    or jsonb_typeof(p_snapshot->'lessons') is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_snapshot->'lessons') not between 1 and 1000 then return false; end if;
  for v_lesson in select value from jsonb_array_elements(p_snapshot->'lessons') loop
    if jsonb_typeof(v_lesson) is distinct from 'object' then return false; end if;
    if v_lesson - array['lessonId','assessmentId','questions'] <> '{}'::jsonb then return false; end if;
    foreach v_key in array array['lessonId','assessmentId'] loop
      if jsonb_typeof(v_lesson->v_key) is distinct from 'string'
        or (v_lesson->>v_key) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        or length(v_lesson->>v_key) > 120 then return false; end if;
    end loop;
    if (v_lesson->>'lessonId') = any(v_lessons)
      or jsonb_typeof(v_lesson->'questions') is distinct from 'array' then return false; end if;
    if jsonb_array_length(v_lesson->'questions') not between 1 and 100 then return false; end if;
    v_lessons := array_append(v_lessons, v_lesson->>'lessonId');
    v_questions := '{}';
    for v_question in select value from jsonb_array_elements(v_lesson->'questions') loop
      if jsonb_typeof(v_question) is distinct from 'object' then return false; end if;
      if v_question - array['id','prompt','options','correctOptionId','explanation'] <> '{}'::jsonb then return false; end if;
      foreach v_key in array array['id','prompt','correctOptionId','explanation'] loop
        if jsonb_typeof(v_question->v_key) is distinct from 'string'
          or length(btrim(v_question->>v_key)) not between 1 and 10000 then return false; end if;
      end loop;
      if (v_question->>'id') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        or length(v_question->>'id') > 120
        or (v_question->>'id') = any(v_questions)
        or jsonb_typeof(v_question->'options') is distinct from 'array' then return false; end if;
      if jsonb_array_length(v_question->'options') not between 2 and 10 then return false; end if;
      v_questions := array_append(v_questions, v_question->>'id');
      v_options := '{}';
      for v_option in select value from jsonb_array_elements(v_question->'options') loop
        if jsonb_typeof(v_option) is distinct from 'object' then return false; end if;
        if v_option - array['id','text'] <> '{}'::jsonb
          or jsonb_typeof(v_option->'id') is distinct from 'string'
          or (v_option->>'id') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
          or length(v_option->>'id') > 120
          or (v_option->>'id') = any(v_options)
          or jsonb_typeof(v_option->'text') is distinct from 'string'
          or length(btrim(v_option->>'text')) not between 1 and 10000 then return false; end if;
        v_options := array_append(v_options, v_option->>'id');
      end loop;
      if not (v_question->>'correctOptionId') = any(v_options) then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;

create table course_library_private.course_assessment_sets (
  assessment_set_id uuid primary key default gen_random_uuid(),
  release_id uuid not null unique,
  course_id uuid not null,
  snapshot jsonb not null check (course_library_private.valid_assessment_snapshot(snapshot)),
  sealed_at timestamptz not null default clock_timestamp(),
  unique (assessment_set_id, release_id, course_id),
  foreign key (release_id, course_id)
    references course_library_private.course_releases(release_id, course_id)
);
create index course_assessment_sets_course_idx
  on course_library_private.course_assessment_sets(course_id, release_id);

create function course_library_private.guard_assessment_set()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_modules jsonb;
begin
  if tg_op <> 'INSERT' then
    raise exception using errcode = '22023', message = 'assessment_set_is_immutable';
  end if;
  select snapshot->'modules' into v_modules from course_library_private.course_releases
    where release_id = new.release_id and course_id = new.course_id for share;
  if not found or not course_library_private.valid_public_outline(v_modules)
    or not course_library_private.valid_assessment_snapshot(new.snapshot) then
    raise exception using errcode = '22023', message = 'assessment_snapshot_invalid';
  end if;
  -- Every released lesson has exactly one check; no extra/omitted lesson IDs.
  if exists (select 1 from jsonb_array_elements(v_modules) m,
      lateral jsonb_array_elements(m->'lessons') l
    where not exists (select 1 from jsonb_array_elements(new.snapshot->'lessons') a
      where a->>'lessonId' = l->>'id'))
    or exists (select 1 from jsonb_array_elements(new.snapshot->'lessons') a
      where not exists (select 1 from jsonb_array_elements(v_modules) m,
        lateral jsonb_array_elements(m->'lessons') l where l->>'id' = a->>'lessonId')) then
    raise exception using errcode = '22023', message = 'assessment_outline_mismatch';
  end if;
  return new;
end;
$$;
create trigger guard_assessment_set before insert or update or delete
  on course_library_private.course_assessment_sets for each row
  execute function course_library_private.guard_assessment_set();

-- Composite ownership key prevents cross-actor/edition enrollment binding.
alter table course_library_private.course_enrollments
  add constraint course_enrollments_assessment_binding_key
  unique (enrollment_id, user_id, course_id, release_id);

create table course_library_private.quiz_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrollment_id uuid not null,
  course_id uuid not null,
  release_id uuid not null,
  assessment_set_id uuid not null,
  lesson_id text not null,
  assessment_id text not null,
  start_key uuid not null,
  started_at timestamptz not null default clock_timestamp(),
  unique (user_id, start_key),
  foreign key (enrollment_id, user_id, course_id, release_id)
    references course_library_private.course_enrollments(enrollment_id, user_id, course_id, release_id)
    on delete cascade,
  foreign key (assessment_set_id, release_id, course_id)
    references course_library_private.course_assessment_sets(assessment_set_id, release_id, course_id)
);
create index quiz_attempts_enrollment_idx on course_library_private.quiz_attempts(enrollment_id);
create index quiz_attempts_assessment_idx on course_library_private.quiz_attempts(assessment_set_id, release_id, course_id);
create index quiz_attempts_lesson_idx on course_library_private.quiz_attempts(user_id, release_id, lesson_id);

create table course_library_private.quiz_checked_answers (
  attempt_id uuid not null references course_library_private.quiz_attempts(attempt_id) on delete cascade,
  question_id text not null,
  option_id text not null,
  checked_at timestamptz not null default clock_timestamp(),
  primary key (attempt_id, question_id)
);
-- A committed result is the completion fact. No mutable client score/progress row.
create table course_library_private.quiz_outcomes (
  attempt_id uuid primary key references course_library_private.quiz_attempts(attempt_id) on delete cascade,
  correct_count integer not null check (correct_count >= 0),
  question_count integer not null check (question_count > 0),
  score_percent integer not null check (score_percent between 0 and 100),
  finished_at timestamptz not null default clock_timestamp(),
  check (correct_count <= question_count)
);

create function course_library_private.guard_quiz_attempt()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    raise exception using errcode = '22023', message = 'quiz_attempt_is_immutable';
  end if;
  if not exists (select 1 from course_library_private.course_enrollments e
    where e.enrollment_id = new.enrollment_id and e.user_id = new.user_id
      and e.course_id = new.course_id and e.release_id = new.release_id)
    or not exists (select 1 from course_library_private.course_assessment_sets s,
      lateral jsonb_array_elements(s.snapshot->'lessons') l
      where s.assessment_set_id = new.assessment_set_id and s.release_id = new.release_id
        and s.course_id = new.course_id and l->>'lessonId' = new.lesson_id
        and l->>'assessmentId' = new.assessment_id) then
    raise exception using errcode = '22023', message = 'quiz_attempt_binding_invalid';
  end if;
  return new;
end;
$$;
create trigger guard_quiz_attempt before insert or update
  on course_library_private.quiz_attempts for each row
  execute function course_library_private.guard_quiz_attempt();

create function course_library_private.guard_quiz_record()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_questions jsonb;
  v_total integer;
  v_checked integer;
  v_correct integer;
begin
  if tg_op = 'UPDATE' then
    raise exception using errcode = '22023', message = 'quiz_record_is_immutable';
  end if;
  -- All Check/Finish writers serialize on the same attempt before reading state.
  perform 1 from course_library_private.quiz_attempts where attempt_id = new.attempt_id for update;
  select l->'questions' into v_questions
    from course_library_private.quiz_attempts a
    join course_library_private.course_assessment_sets s using (assessment_set_id),
    lateral jsonb_array_elements(s.snapshot->'lessons') l
    where a.attempt_id = new.attempt_id and l->>'lessonId' = a.lesson_id
      and l->>'assessmentId' = a.assessment_id;
  if v_questions is null then
    raise exception using errcode = '22023', message = 'quiz_attempt_binding_invalid';
  end if;
  if tg_table_name = 'quiz_checked_answers' then
    if exists (select 1 from course_library_private.quiz_outcomes where attempt_id = new.attempt_id)
      or not exists (select 1 from jsonb_array_elements(v_questions) q,
        lateral jsonb_array_elements(q->'options') o
        where q->>'id' = new.question_id and o->>'id' = new.option_id) then
      raise exception using errcode = '22023', message = 'quiz_selection_invalid';
    end if;
  else
    v_total := jsonb_array_length(v_questions);
    select count(*), count(*) filter (where c.option_id = q->>'correctOptionId')
      into v_checked, v_correct
      from course_library_private.quiz_checked_answers c
      join jsonb_array_elements(v_questions) q on q->>'id' = c.question_id
      where c.attempt_id = new.attempt_id;
    if v_checked <> v_total or new.question_count <> v_total
      or new.correct_count <> v_correct
      or new.score_percent <> round(100.0 * v_correct / v_total)::integer then
      raise exception using errcode = '22023', message = 'quiz_outcome_invalid';
    end if;
  end if;
  return new;
end;
$$;
create trigger guard_quiz_checked_answer before insert or update
  on course_library_private.quiz_checked_answers for each row
  execute function course_library_private.guard_quiz_record();
create trigger guard_quiz_outcome before insert or update
  on course_library_private.quiz_outcomes for each row
  execute function course_library_private.guard_quiz_record();

alter table course_library_private.course_assessment_sets enable row level security;
alter table course_library_private.quiz_attempts enable row level security;
alter table course_library_private.quiz_checked_answers enable row level security;
alter table course_library_private.quiz_outcomes enable row level security;
revoke all on table course_library_private.course_assessment_sets,
  course_library_private.quiz_attempts, course_library_private.quiz_checked_answers,
  course_library_private.quiz_outcomes from public, anon, authenticated, service_role;
revoke all on function course_library_private.valid_assessment_snapshot(jsonb),
  course_library_private.guard_assessment_set(), course_library_private.guard_quiz_attempt(),
  course_library_private.guard_quiz_record() from public, anon, authenticated, service_role;
-- No direct policies/grants. Future trusted actor/session/access-checked APIs must
-- be reviewed separately before these tables become usable from any client.
