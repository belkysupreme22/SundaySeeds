/* Owner-run ONLY against a disposable local PostgreSQL database.
 * Auth tables/claims below are shims, NOT real Supabase Auth/JWT verification.
 * Never reads .env. The runner leaves committed fixtures in this disposable DB;
 * discard the entire temporary cluster afterwards. Refuses an existing app schema.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
if (process.env.SUNDAYSEEDS_ISOLATED_DB !== '1') throw Error('Explicit isolated database opt-in required');
const url = new URL(process.env.SUNDAYSEEDS_TEST_DATABASE_URL || '');
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw Error('Only loopback PostgreSQL URLs permitted');
// Do not allow query parameters to override the validated network destination.
if ([...url.searchParams.keys()].some(k => /host|port|service/i.test(k))) throw Error('Connection destination overrides forbidden');
const { Client } = require(process.env.SUNDAYSEEDS_TEST_PG_MODULE || 'pg');
const clients = [];
let actor = 'a1000000-0000-4000-8000-000000000001';
let session = 'b1000000-0000-4000-8000-000000000001';
const course = 'c1000000-0000-4000-8000-000000000001';
const release = 'd1000000-0000-4000-8000-000000000001';
let observer;
const results = [];
async function connect(name) {
  const c = new Client({connectionString:url.href, application_name:`sundayseeds-concurrency-${name}`});
  await c.connect(); clients.push(c);
  await c.query("set lock_timeout='8s'; set statement_timeout='12s'");
  c.pid = (await c.query('select pg_backend_pid() pid')).rows[0].pid;
  return c;
}
async function begin(c, authenticated = true) {
  await c.query('begin');
  if (authenticated) {
    await c.query('set local role authenticated');
    await c.query("select set_config('request.jwt.claim.sub',$1,true), set_config('request.jwt.claims',$2,true)",
      [actor, JSON.stringify({sub:actor,role:'authenticated',session_id:session})]);
  }
}
async function rpc(c, name, args) {
  const placeholders = args.map((_,i)=>`$${i+1}`).join(',');
  return (await c.query(`select public.${name}(${placeholders}) body`, args)).rows[0].body;
}
const start = (c,key=randomUUID(),lesson='lesson-one') => rpc(c,'start_course_quiz',[course,lesson,key]);
const check = (c,id,q='question-one',option='care') => rpc(c,'check_course_quiz_answer',[id,q,option]);
const finish = (c,id) => rpc(c,'finish_course_quiz',[id]);
async function once(c, action) {
  await begin(c);
  try { const value = await action(); await c.query('commit'); return value; }
  catch(e) { await c.query('rollback'); throw e; }
}
async function blocked(waiter, blocker) {
  const deadline = Date.now()+5000;
  do {
    const {rows} = await observer.query(`select a.wait_event_type,
      $2::int = any(pg_blocking_pids(a.pid)) as blocked,
      exists(select 1 from pg_locks l where l.pid=a.pid and not l.granted) as waiting_lock
      from pg_stat_activity a where a.pid=$1`,[waiter.pid,blocker.pid]);
    if(rows[0]?.blocked && rows[0]?.waiting_lock && rows[0]?.wait_event_type==='Lock') return;
    await new Promise(r=>setTimeout(r,20));
  } while(Date.now()<deadline);
  throw Error(`Did not observe database lock wait ${waiter.pid} behind ${blocker.pid}`);
}
// Attach rejection handlers immediately, including expected SQL failures.
const pending = action => action().then(value=>({value}),error=>({error}));
function accepted(result) { if(result.error) throw result.error; return result.value; }
function rejected(result,message) { assert.equal(result.error?.message,message); }
async function race(name,a,b,first,second,verify) {
  await begin(a); await begin(b);
  try {
    const x = await first();
    const p = pending(second);
    await blocked(b,a);
    await a.query('commit');
    const y = await p;
    await b.query(y.error?'rollback':'commit');
    await verify(x,y);
    results.push(name); console.log(`PASS ${name}`);
  } finally { await a.query('rollback'); await b.query('rollback'); }
}
async function count(table,id) {
  return Number((await observer.query(`select count(*) n from course_library_private.${table} where attempt_id=$1`,[id])).rows[0].n);
}
async function ready(c, lesson='lesson-one',wrong=false) {
  return once(c,async()=>{
    const a=await start(c,randomUUID(),lesson);
    await check(c,a.attempt_id,'question-one',wrong?'ignore':'care');
    await check(c,a.attempt_id,'question-two',wrong?'leave':'help');
    return a.attempt_id;
  });
}
async function main() {
  observer=await connect('observer');
  const existing=await observer.query("select to_regnamespace('course_library_private') n, to_regnamespace('auth') a");
  assert.equal(existing.rows[0].n,null,'Requires empty disposable database');
  assert.equal(existing.rows[0].a,null,'Refuses real Auth schemas');
  await observer.query(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean,banned_until timestamptz);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),created_at timestamptz,updated_at timestamptz,not_after timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select nullif(current_setting('request.jwt.claims',true),'')::jsonb$$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid(),auth.jwt() to authenticated;`);
  for (const filename of ['20261021074729_course_library_foundation.sql','20261021080323_verified_course_enrollment.sql','20261023080205_connected_assessment_foundation.sql','20261023081342_trusted_course_quiz_api.sql']) {
    await observer.query(fs.readFileSync(path.join(__dirname,'../migrations',filename),'utf8'));
  }
  const fixtureSource=fs.readFileSync(path.join(__dirname,'course_quiz_rpc.test.sql'),'utf8');
  const from=fixtureSource.indexOf('insert into auth.users');
  const to=fixtureSource.indexOf('create temporary table quiz_responses');
  assert(from>0 && to>from,'Fixture extraction boundaries changed');
  await observer.query(fixtureSource.slice(from,to));
  const a=await connect('a'),b=await connect('b'),admin=await connect('admin');
  const key=randomUUID(); let attempt;
  await race('same Start key',a,b,()=>start(a,key),()=>start(b,key),async(x,y)=>{
    assert.deepEqual(accepted(y),x); attempt=x.attempt_id;
    assert.equal(Number((await observer.query('select count(*) n from course_library_private.quiz_attempts where user_id=$1 and start_key=$2',[actor,key])).rows[0].n),1);
  });
  await once(a,async()=>{await assert.rejects(start(a,key,'lesson-two'),{message:'start_key_conflict'});});
  await race('same checked selection',a,b,()=>check(a,attempt),()=>check(b,attempt),async(x,y)=>{
    assert.deepEqual(accepted(y),x); assert.equal(await count('quiz_checked_answers',attempt),1);
  });
  await race('competing checked selections',a,b,()=>check(a,attempt,'question-two','help'),()=>check(b,attempt,'question-two','leave'),async(x,y)=>{
    rejected(y,'quiz_answer_locked'); assert.equal(await count('quiz_checked_answers',attempt),2);
  });
  let receipt;
  await race('same Finish',a,b,()=>finish(a,attempt),()=>finish(b,attempt),async(x,y)=>{
    assert.deepEqual(accepted(y),x); receipt=x.receipt; assert.equal(await count('quiz_outcomes',attempt),1);
  });
  const partial=await once(a,async()=>{
    const x=await start(a); await check(a,x.attempt_id); return x.attempt_id;
  });
  await race('final Check commits before Finish',a,b,()=>check(a,partial,'question-two','help'),()=>finish(b,partial),async(x,y)=>{
    assert.equal(accepted(y).receipt.score_percent,100); assert.equal(await count('quiz_outcomes',partial),1);
  });
  // Reverse order: hold attempt row while Finish rejects inside a savepoint,
  // then prove final Check waits behind that same transaction's row lock.
  const reverse=await once(a,async()=>{const x=await start(a); await check(a,x.attempt_id); return x.attempt_id;});
  await begin(admin,false); await begin(b);
  try {
    await admin.query('select 1 from course_library_private.quiz_attempts where attempt_id=$1 for update',[reverse]);
    await admin.query('savepoint incomplete');
    await admin.query('set local role authenticated');
    await admin.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[actor,JSON.stringify({sub:actor,session_id:session})]);
    await assert.rejects(finish(admin,reverse),{message:'quiz_incomplete'});
    await admin.query('rollback to savepoint incomplete');
    const p=pending(()=>check(b,reverse,'question-two','help'));
    await blocked(b,admin); assert.equal(await count('quiz_outcomes',reverse),0);
    await admin.query('commit'); accepted(await p); await b.query('commit');
    await once(a,()=>finish(a,reverse)); results.push('Finish rejects before final Check');
  } finally {await admin.query('rollback');await b.query('rollback');}
  const originalActor=actor, originalSession=session;
  async function freshActor() {
    actor=randomUUID();session=randomUUID();
    await observer.query('insert into auth.users(id,email,email_confirmed_at,is_anonymous) values($1,$2,now(),false)',[actor,`${actor}@concurrency.invalid`]);
    await observer.query("insert into auth.sessions(id,user_id,not_after) values($1,$2,now()+interval '1 hour')",[session,actor]);
    await observer.query('insert into course_library_private.course_enrollments(user_id,course_id,release_id) values($1,$2,$3)',[actor,course,release]);
  }
  for(const kind of ['revocation','withdrawal']) {
    await freshActor();
    const mutation=kind==='revocation'
      ? "update course_library_private.course_enrollments set state='revoked' where user_id=$1 and course_id=$2"
      : 'update course_library_private.course_releases set is_available=false where release_id=$1';
    const params=()=>kind==='revocation'?[actor,course]:[release];
    const restore=async()=>{ if(kind==='withdrawal') await observer.query('update course_library_private.course_releases set is_available=true where release_id=$1',[release]); };
    const id=await ready(a);
    await begin(a); await begin(admin,false);
    try {
      const x=await finish(a,id); const p=pending(()=>admin.query(mutation,params()));
      await blocked(admin,a); await a.query('commit'); accepted(await p); await admin.query('commit');
      const replay=await once(b,()=>finish(b,id)); assert.deepEqual(replay.receipt,x.receipt);
      assert.deepEqual(Object.keys(replay).sort(),['best_score_percent','receipt']);
      assert.equal(await count('quiz_outcomes',id),1); results.push(`Finish before ${kind}`);
    } finally {await a.query('rollback');await admin.query('rollback');await restore();}
    await freshActor();
    const denied=await ready(a);
    await begin(admin,false);await begin(b);
    try {
      await admin.query(mutation,params());const p=pending(()=>finish(b,denied));
      await blocked(b,admin);await admin.query('commit');
      rejected(await p,kind==='revocation'?'access_revoked':'quiz_unavailable');await b.query('rollback');
      assert.equal(await count('quiz_outcomes',denied),0);results.push(`${kind} before Finish`);
    } finally {await admin.query('rollback');await b.query('rollback');await restore();}
  }
  actor=originalActor;session=originalSession;
  const zero=await ready(a,'lesson-two',true),full=await ready(b,'lesson-two');
  await begin(a);await begin(b);
  try {
    const values=await Promise.all([finish(a,zero),finish(b,full)]);
    assert.equal(values[0].receipt.score_percent,0);assert.equal(values[1].receipt.score_percent,100);
    await Promise.all([a.query('commit'),b.query('commit')]);
    const progress=await once(a,()=>rpc(a,'get_my_course_quiz_progress',[course]));
    assert.equal(progress.completed_count,2);assert.equal(progress.required_count,2);
    assert.equal(progress.lessons.find(x=>x.lesson_id==='lesson-two').best_score_percent,100);
    results.push('distinct retries preserve zero, highest score and distinct completion');
  } finally {await a.query('rollback');await b.query('rollback');}
  // Live session shim revocation is sequential; real Auth/JWT validation is outside scope.
  await observer.query('delete from auth.sessions where id=$1',[session]);
  await assert.rejects(once(a,()=>finish(a,attempt)),{message:'authentication_required'});
  results.push('deleted session blocks historical receipt');
  assert.equal(receipt.score_percent,100);
  console.log(JSON.stringify({passed:results.length,schedules:results,scope:'local PostgreSQL with Auth shims; discard temporary cluster; no hosted deployment'},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  await Promise.allSettled(clients.map(async c=>{try{await c.query('rollback');}finally{await c.end();}}));
});
