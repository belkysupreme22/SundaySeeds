-- SOURCE ONLY. No assessment activation or historical progress import.
-- Internal helpers are callable only by the owner; entrypoints validate the actor.
create function course_library_private.lock_quiz_access(p_actor uuid, p_enrollment uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_e course_library_private.course_enrollments%rowtype; v_available boolean;
begin
  select * into v_e from course_library_private.course_enrollments
    where enrollment_id = p_enrollment and user_id = p_actor for share;
  if not found then raise exception using errcode='P0002', message='quiz_unavailable'; end if;
  if v_e.state <> 'active' then raise exception using errcode='42501', message='access_revoked'; end if;
  select is_available into v_available from course_library_private.course_releases
    where release_id=v_e.release_id and course_id=v_e.course_id for share;
  if v_available is distinct from true then
    raise exception using errcode='P0002', message='quiz_unavailable';
  end if;
end; $$;

create function course_library_private.quiz_receipt(p_attempt uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object('attempt_id', a.attempt_id, 'course_id', a.course_id,
    'release_id', a.release_id, 'lesson_id', a.lesson_id,
    'correct_count', o.correct_count, 'question_count', o.question_count,
    'score_percent', o.score_percent, 'finished_at', o.finished_at)
  from course_library_private.quiz_attempts a join course_library_private.quiz_outcomes o using(attempt_id)
  where a.attempt_id=p_attempt;
$$;


-- Completion fact stays immutable; best score is a separately labelled current
-- own aggregate and may improve after another completed attempt.
create function course_library_private.quiz_finish_projection(p_attempt uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object('receipt', course_library_private.quiz_receipt(a.attempt_id),
    'best_score_percent', (select max(o.score_percent)
      from course_library_private.quiz_attempts x
      join course_library_private.quiz_outcomes o using(attempt_id)
      where x.enrollment_id=a.enrollment_id and x.lesson_id=a.lesson_id))
  from course_library_private.quiz_attempts a where a.attempt_id=p_attempt;
$$;

create function course_library_private.quiz_attempt_projection(p_attempt uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object('attempt_id', a.attempt_id, 'course_id', a.course_id,
    'release_id', a.release_id, 'lesson_id', a.lesson_id, 'assessment_id', a.assessment_id,
    'questions', (select jsonb_agg(jsonb_build_object('id',q->>'id','prompt',q->>'prompt',
      'options',(select jsonb_agg(jsonb_build_object('id',opt->>'id','text',opt->>'text') order by ord)
        from jsonb_array_elements(q->'options') with ordinality z(opt,ord)),
      'checked_answer', case when c.question_id is null then null else jsonb_build_object(
        'option_id',c.option_id,'correct_option_id',q->>'correctOptionId',
        'is_correct',c.option_id=q->>'correctOptionId','explanation',q->>'explanation') end) order by n)
      from jsonb_array_elements(l->'questions') with ordinality qs(q,n)
      left join course_library_private.quiz_checked_answers c on c.attempt_id=a.attempt_id and c.question_id=q->>'id'),
    'receipt', course_library_private.quiz_receipt(a.attempt_id))
  from course_library_private.quiz_attempts a
  join course_library_private.course_assessment_sets s using(assessment_set_id),
  lateral jsonb_array_elements(s.snapshot->'lessons') l
  where a.attempt_id=p_attempt and l->>'lessonId'=a.lesson_id;
$$;

create function course_library_private.start_course_quiz(p_course_id uuid,p_lesson_id text,p_start_key uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor();
  v_e course_library_private.course_enrollments%rowtype;
  v_a course_library_private.quiz_attempts%rowtype; v_set uuid; v_assessment text;
begin
  if p_course_id is null or p_lesson_id is null or p_start_key is null then
    raise exception using errcode='22023',message='invalid_quiz_request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_actor::text || ':quiz:' || p_start_key::text,0));
  select * into v_a from course_library_private.quiz_attempts where user_id=v_actor and start_key=p_start_key;
  if found and (v_a.course_id<>p_course_id or v_a.lesson_id<>p_lesson_id) then
    raise exception using errcode='22023',message='start_key_conflict'; end if;
  select * into v_e from course_library_private.course_enrollments where user_id=v_actor and course_id=p_course_id;
  if not found then raise exception using errcode='P0002',message='quiz_unavailable'; end if;
  perform course_library_private.lock_quiz_access(v_actor,v_e.enrollment_id);
  if v_a.attempt_id is not null then
    perform 1 from course_library_private.quiz_attempts where attempt_id=v_a.attempt_id for update;
    return course_library_private.quiz_attempt_projection(v_a.attempt_id);
  end if;
  select s.assessment_set_id,l->>'assessmentId' into v_set,v_assessment
    from course_library_private.course_assessment_sets s,lateral jsonb_array_elements(s.snapshot->'lessons') l
    where s.release_id=v_e.release_id and s.course_id=p_course_id and l->>'lessonId'=p_lesson_id;
  if not found then raise exception using errcode='P0002',message='quiz_unavailable'; end if;
  insert into course_library_private.quiz_attempts(user_id,enrollment_id,course_id,release_id,assessment_set_id,lesson_id,assessment_id,start_key)
    values(v_actor,v_e.enrollment_id,p_course_id,v_e.release_id,v_set,p_lesson_id,v_assessment,p_start_key) returning * into v_a;
  return course_library_private.quiz_attempt_projection(v_a.attempt_id);
end; $$;

create function course_library_private.get_course_quiz_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor(); v_a course_library_private.quiz_attempts%rowtype;
begin
  select * into v_a from course_library_private.quiz_attempts where attempt_id=p_attempt_id and user_id=v_actor;
  if not found then raise exception using errcode='P0002',message='quiz_attempt_unavailable'; end if;
  perform course_library_private.lock_quiz_access(v_actor,v_a.enrollment_id);
  perform 1 from course_library_private.quiz_attempts where attempt_id=p_attempt_id for update;
  return course_library_private.quiz_attempt_projection(p_attempt_id);
end; $$;

create function course_library_private.check_course_quiz_answer(p_attempt_id uuid,p_question_id text,p_option_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor(); v_a course_library_private.quiz_attempts%rowtype;
  v_q jsonb; v_existing text;
begin
  select * into v_a from course_library_private.quiz_attempts where attempt_id=p_attempt_id and user_id=v_actor;
  if not found then raise exception using errcode='P0002',message='quiz_attempt_unavailable'; end if;
  perform course_library_private.lock_quiz_access(v_actor,v_a.enrollment_id);
  perform 1 from course_library_private.quiz_attempts where attempt_id=p_attempt_id for update;
  select q into v_q from course_library_private.course_assessment_sets s,
    lateral jsonb_array_elements(s.snapshot->'lessons') l,lateral jsonb_array_elements(l->'questions') q
    where s.assessment_set_id=v_a.assessment_set_id and l->>'lessonId'=v_a.lesson_id and q->>'id'=p_question_id;
  if v_q is null or p_option_id is null or not exists(select 1 from jsonb_array_elements(v_q->'options') o where o->>'id'=p_option_id) then
    raise exception using errcode='22023',message='quiz_selection_invalid'; end if;
  select option_id into v_existing from course_library_private.quiz_checked_answers where attempt_id=p_attempt_id and question_id=p_question_id;
  if found then
    if v_existing<>p_option_id then raise exception using errcode='22023',message='quiz_answer_locked'; end if;
  else
    if exists(select 1 from course_library_private.quiz_outcomes where attempt_id=p_attempt_id) then
      raise exception using errcode='22023',message='quiz_answer_locked'; end if;
    insert into course_library_private.quiz_checked_answers(attempt_id,question_id,option_id) values(p_attempt_id,p_question_id,p_option_id);
  end if;
  return jsonb_build_object('attempt_id',p_attempt_id,'question_id',p_question_id,'option_id',p_option_id,
    'correct_option_id',v_q->>'correctOptionId','is_correct',p_option_id=v_q->>'correctOptionId','explanation',v_q->>'explanation');
end; $$;

create function course_library_private.finish_course_quiz(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor(); v_a course_library_private.quiz_attempts%rowtype;
  v_questions jsonb; v_checked integer; v_correct integer; v_total integer;
begin
  select * into v_a from course_library_private.quiz_attempts where attempt_id=p_attempt_id and user_id=v_actor;
  if not found then raise exception using errcode='P0002',message='quiz_attempt_unavailable'; end if;
  -- Already-committed receipts are history only: no questions or feedback, even
  -- after withdrawal. Live actor/session validation above is still mandatory.
  if exists(select 1 from course_library_private.quiz_outcomes where attempt_id=p_attempt_id) then
    return course_library_private.quiz_finish_projection(p_attempt_id); end if;
  perform course_library_private.lock_quiz_access(v_actor,v_a.enrollment_id);
  perform 1 from course_library_private.quiz_attempts where attempt_id=p_attempt_id for update;
  if exists(select 1 from course_library_private.quiz_outcomes where attempt_id=p_attempt_id) then
    return course_library_private.quiz_finish_projection(p_attempt_id); end if;
  select l->'questions' into v_questions from course_library_private.course_assessment_sets s,
    lateral jsonb_array_elements(s.snapshot->'lessons') l
    where s.assessment_set_id=v_a.assessment_set_id and l->>'lessonId'=v_a.lesson_id;
  v_total:=jsonb_array_length(v_questions);
  select count(*),count(*) filter(where c.option_id=q->>'correctOptionId') into v_checked,v_correct
    from course_library_private.quiz_checked_answers c join jsonb_array_elements(v_questions) q on q->>'id'=c.question_id
    where c.attempt_id=p_attempt_id;
  if v_total is null or v_checked<>v_total then raise exception using errcode='22023',message='quiz_incomplete'; end if;
  insert into course_library_private.quiz_outcomes(attempt_id,correct_count,question_count,score_percent)
    values(p_attempt_id,v_correct,v_total,round(100.0*v_correct/v_total)::integer);
  return course_library_private.quiz_finish_projection(p_attempt_id);
end; $$;

create function course_library_private.get_my_course_quiz_progress(p_course_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := course_library_private.verified_course_actor(); v_e course_library_private.course_enrollments%rowtype;
  v_r course_library_private.course_releases%rowtype; v_lessons jsonb; v_required integer; v_completed integer; v_available boolean;
begin
  select * into v_e from course_library_private.course_enrollments where user_id=v_actor and course_id=p_course_id for share;
  if not found then return null; end if;
  select * into v_r from course_library_private.course_releases where release_id=v_e.release_id and course_id=p_course_id for share;
  v_available:=v_e.state='active' and v_r.is_available;
  -- Unavailable is distinct from an accessible edition with no attempts. Do not
  -- expose protected assessment identities or imply zero learning history.
  if v_available is distinct from true then return jsonb_build_object('course_id',p_course_id,'release_id',v_e.release_id,
    'available',false,'assessment_available',false,'required_count',null,'completed_count',null,'completed',null,'lessons',null); end if;
  if not exists(select 1 from course_library_private.course_assessment_sets where release_id=v_e.release_id) then
    return jsonb_build_object('course_id',p_course_id,'release_id',v_e.release_id,'available',true,
      'assessment_available',false,'required_count',null,'completed_count',null,'completed',null,'lessons',null); end if;
  select jsonb_agg(jsonb_build_object('lesson_id',l->>'id','completed',b.best is not null,'best_score_percent',b.best) order by mi,li),
    count(*),count(*) filter(where b.best is not null) into v_lessons,v_required,v_completed
    from jsonb_array_elements(v_r.snapshot->'modules') with ordinality ms(m,mi),
    lateral jsonb_array_elements(m->'lessons') with ordinality ls(l,li)
    left join lateral (select max(o.score_percent) best from course_library_private.quiz_attempts a
      join course_library_private.quiz_outcomes o using(attempt_id)
      where a.enrollment_id=v_e.enrollment_id and a.lesson_id=l->>'id') b on true;
  return jsonb_build_object('course_id',p_course_id,'release_id',v_e.release_id,'available',true,'assessment_available',true,
    'required_count',v_required,'completed_count',v_completed,'completed',v_required>0 and v_completed=v_required,'lessons',v_lessons);
end; $$;

create function public.start_course_quiz(p_course_id uuid,p_lesson_id text,p_start_key uuid) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.start_course_quiz(p_course_id,p_lesson_id,p_start_key); $$;

create function public.check_course_quiz_answer(p_attempt_id uuid,p_question_id text,p_option_id text) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.check_course_quiz_answer(p_attempt_id,p_question_id,p_option_id); $$;

create function public.finish_course_quiz(p_attempt_id uuid) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.finish_course_quiz(p_attempt_id); $$;

create function public.get_course_quiz_attempt(p_attempt_id uuid) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.get_course_quiz_attempt(p_attempt_id); $$;

create function public.get_my_course_quiz_progress(p_course_id uuid) returns jsonb language sql volatile security invoker set search_path = ''
as $$ select course_library_private.get_my_course_quiz_progress(p_course_id); $$;
revoke all on function course_library_private.lock_quiz_access(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.quiz_receipt(uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.quiz_attempt_projection(uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.start_course_quiz(uuid,text,uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.check_course_quiz_answer(uuid,text,text) from public,anon,authenticated,service_role;
revoke all on function course_library_private.finish_course_quiz(uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.get_course_quiz_attempt(uuid) from public,anon,authenticated,service_role;
revoke all on function course_library_private.get_my_course_quiz_progress(uuid) from public,anon,authenticated,service_role;
revoke all on function public.start_course_quiz(uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.start_course_quiz(uuid,text,uuid), course_library_private.start_course_quiz(uuid,text,uuid) to authenticated;
revoke all on function public.check_course_quiz_answer(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.check_course_quiz_answer(uuid,text,text), course_library_private.check_course_quiz_answer(uuid,text,text) to authenticated;
revoke all on function public.finish_course_quiz(uuid) from public,anon,authenticated,service_role;
grant execute on function public.finish_course_quiz(uuid), course_library_private.finish_course_quiz(uuid) to authenticated;
revoke all on function public.get_course_quiz_attempt(uuid) from public,anon,authenticated,service_role;
grant execute on function public.get_course_quiz_attempt(uuid), course_library_private.get_course_quiz_attempt(uuid) to authenticated;
revoke all on function public.get_my_course_quiz_progress(uuid) from public,anon,authenticated,service_role;
grant execute on function public.get_my_course_quiz_progress(uuid), course_library_private.get_my_course_quiz_progress(uuid) to authenticated;

revoke all on function course_library_private.quiz_finish_projection(uuid) from public,anon,authenticated,service_role;
