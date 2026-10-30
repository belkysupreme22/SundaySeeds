/* Owner-run ONLY against an empty disposable local PostgreSQL database.
 * Auth tables/claims are shims, NOT Supabase Auth/JWT/provider verification.
 * Never reads .env. Fixtures commit; discard the temporary cluster afterwards.
 * Requires pg supplied externally; does not install or change app dependencies.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
if (process.env.SUNDAYSEEDS_ISOLATED_DB !== '1') throw Error('Explicit isolated database opt-in required');
const url = new URL(process.env.SUNDAYSEEDS_TEST_DATABASE_URL || '');
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw Error('Only loopback PostgreSQL URLs permitted');
if ([...url.searchParams.keys()].some(k => /host|port|service/i.test(k))) throw Error('Connection destination overrides forbidden');
const { Client } = require(process.env.SUNDAYSEEDS_TEST_PG_MODULE || 'pg');
const clients = [], results = [], waits = [];
let observer;
const content = title => ({schemaVersion:1,course:{title,summary:'',audience:'',topics:[],learningGoals:[],outcomes:[],language:'',level:null,estimatedMinutes:null,estimateBasis:null},modules:[],lessons:[]});
async function connect(name) {
  const c = new Client({connectionString:url.href,application_name:`sundayseeds-staff-concurrency-${name}`});
  await c.connect(); clients.push(c);
  await c.query("set lock_timeout='8s'; set statement_timeout='12s'; set deadlock_timeout='250ms'");
  c.pid = (await c.query('select pg_backend_pid() pid')).rows[0].pid;
  return c;
}
async function begin(c, actor) {
  await c.query('begin isolation level read committed');
  if (actor) {
    await c.query('set local role authenticated');
    await c.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",
      [actor.id,JSON.stringify({sub:actor.id,role:'authenticated',session_id:actor.session})]);
  }
}
async function rpc(c,name,args) {
  return (await c.query(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) body`,args)).rows[0].body;
}
const save = (c,f,revision,key,payload) => rpc(c,'save_my_course_draft',[f.course,revision,key,payload]);
const get = (c,f) => rpc(c,'get_my_course_draft',[f.course]);
async function once(c,actor,action) {
  await begin(c,actor);
  try { const value=await action(); await c.query('commit'); return value; }
  catch(e) {await c.query('rollback');throw e;}
}
// Attach rejection handlers before observing waits, including expected SQL errors.
const pending = action => action().then(value=>({value}),error=>({error}));
function accepted(result) {if(result.error) throw result.error;return result.value;}
function rejected(result,code,message) {assert.equal(result.error?.code,code);assert.equal(result.error?.message,message);}
async function blocked(waiter,blocker,label) {
  const deadline=Date.now()+5000;
  do {
    const {rows}=await observer.query(`select a.wait_event_type,
      $2::int=any(pg_blocking_pids(a.pid)) as blocked,
      exists(select 1 from pg_locks l where l.pid=a.pid and not l.granted) as waiting_lock
      from pg_stat_activity a where a.pid=$1`,[waiter.pid,blocker.pid]);
    if(rows[0]?.blocked && rows[0]?.waiting_lock && rows[0]?.wait_event_type==='Lock') {
      waits.push({label,waiter:waiter.pid,blocker:blocker.pid}); return;
    }
    // Yield only; elapsed time is never evidence of serialization.
    await new Promise(resolve=>setImmediate(resolve));
  } while(Date.now()<deadline);
  throw Error(`No observed database lock wait: ${label}`);
}
function pass(name) {results.push(name);console.log(`PASS ${name}`);}
async function fixture() {
  const f={course:randomUUID(),a:{id:randomUUID(),session:randomUUID()},b:{id:randomUUID(),session:randomUUID()}};
  await observer.query('insert into course_library_private.courses(course_id) values($1)',[f.course]);
  for(const actor of [f.a,f.b]) {
    await observer.query('insert into auth.users(id,email,email_confirmed_at,is_anonymous) values($1,$2,now(),false)',[actor.id,`${actor.id}@staff-concurrency.invalid`]);
    await observer.query("insert into auth.sessions(id,user_id,not_after) values($1,$2,now()+interval '1 hour')",[actor.session,actor.id]);
    await observer.query('insert into staff_authoring_private.course_author_assignments(user_id,course_id) values($1,$2)',[actor.id,f.course]);
  }
  return f;
}
async function stored(f) {
  return (await observer.query(`select draft_id,revision::int,content,updated_by,updated_at from staff_authoring_private.course_drafts where course_id=$1`,[f.course])).rows[0];
}
async function counts(f,receipts,audit=receipts) {
  const row=(await observer.query(`select
    (select count(*)::int from staff_authoring_private.course_drafts where course_id=$1) drafts,
    (select count(*)::int from staff_authoring_private.draft_save_receipts where course_id=$1) receipts,
    (select count(*)::int from staff_authoring_private.draft_save_audit where course_id=$1) audit`,[f.course])).rows[0];
  assert.deepEqual(row,{drafts:1,receipts,audit});
}
async function race(name,a,b,actorA,actorB,first,second,verify) {
  await begin(a,actorA);await begin(b,actorB);
  try {
    const x=await first(),p=pending(second);
    await blocked(b,a,name);await a.query('commit');
    const y=await p;await b.query(y.error?'rollback':'commit');
    await verify(x,y);pass(name);
  } finally {await a.query('rollback');await b.query('rollback');}
}
async function main() {
  observer=await connect('observer');
  const existing=(await observer.query("select to_regnamespace('course_library_private') library,to_regnamespace('staff_authoring_private') staff,to_regnamespace('auth') auth")).rows[0];
  assert.deepEqual(existing,{library:null,staff:null,auth:null},'Refuses existing app/Auth schemas');
  await observer.query(`create role anon;create role authenticated;create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean,banned_until timestamptz);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id) on delete cascade,created_at timestamptz,updated_at timestamptz,not_after timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select nullif(current_setting('request.jwt.claims',true),'')::jsonb$$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid(),auth.jwt() to authenticated;`);
  for(const filename of ['20261021074729_course_library_foundation.sql','20261021080323_verified_course_enrollment.sql','20261024084826_staff_course_drafts.sql']) {
    await observer.query(fs.readFileSync(path.join(__dirname,'../migrations',filename),'utf8'));
  }
  const a=await connect('a'),b=await connect('b'),admin=await connect('admin');
  let f=await fixture();
  await race('competing first saves: one CAS winner',a,b,f.a,f.b,
    ()=>save(a,f,0,randomUUID(),content('first winner')),()=>save(b,f,0,randomUUID(),content('first loser')),
    async(x,y)=>{rejected(y,'40001','draft_revision_conflict');assert.equal(x.saved_revision,1);assert.deepEqual((await stored(f)).content,content('first winner'));await counts(f,1);});
  await race('competing updates: one CAS winner',a,b,f.a,f.b,
    ()=>save(a,f,1,randomUUID(),content('update winner')),()=>save(b,f,1,randomUUID(),content('update loser')),
    async(x,y)=>{rejected(y,'40001','draft_revision_conflict');assert.equal(x.saved_revision,2);assert.equal((await stored(f)).revision,2);assert.deepEqual((await stored(f)).content,content('update winner'));await counts(f,2);});
  f=await fixture();let key=randomUUID();const original=content('same request');
  await race('concurrent exact same-key retry deduplicates',a,b,f.a,f.a,
    ()=>save(a,f,0,key,original),()=>save(b,f,0,key,original),
    async(x,y)=>{assert.deepEqual(accepted(y),x);await counts(f,1);assert.equal((await stored(f)).revision,1);});
  f=await fixture();key=randomUUID();
  await race('concurrent changed same-key payload conflicts',a,b,f.a,f.a,
    ()=>save(a,f,0,key,content('bound')),()=>save(b,f,0,key,content('changed')),
    async(x,y)=>{rejected(y,'22023','draft_request_mismatch');assert.equal(x.saved_revision,1);assert.deepEqual((await stored(f)).content,content('bound'));await counts(f,1);});
  f=await fixture();key=randomUUID();const old=content('original receipt');
  const receipt=await once(a,f.a,()=>save(a,f,0,key,old));
  await race('old receipt returns current concurrently updated draft',a,b,f.b,f.a,
    ()=>save(a,f,1,randomUUID(),content('new current draft')),()=>save(b,f,0,key,old),
    async(x,y)=>{const replay=accepted(y);assert.equal(replay.saved_revision,receipt.saved_revision);assert.equal(replay.saved_revision,1);assert.equal(replay.draft.revision,2);assert.deepEqual(replay.draft,x.draft);await counts(f,2);});
  f=await fixture();key=randomUUID();
  const revoke=(c,fixture)=>c.query("update staff_authoring_private.course_author_assignments set state='revoked',revision=revision+1 where user_id=$1 and course_id=$2",[fixture.a.id,fixture.course]);
  await race('save commits before assignment revocation',a,admin,f.a,null,
    ()=>save(a,f,0,key,content('authorized save')),()=>revoke(admin,f),
    async(x,y)=>{accepted(y);assert.equal(x.saved_revision,1);await counts(f,1);await assert.rejects(once(b,f.a,()=>save(b,f,0,key,content('authorized save'))),{code:'42501',message:'staff_access_required'});await assert.rejects(once(b,f.a,()=>get(b,f)),{code:'42501',message:'staff_access_required'});await counts(f,1);});
  f=await fixture();await once(a,f.b,()=>save(a,f,0,randomUUID(),content('retained')));const beforeRevocation=await stored(f);
  await race('assignment revocation commits before save',admin,b,null,f.a,
    ()=>revoke(admin,f),()=>save(b,f,1,randomUUID(),content('denied')),
    async(x,y)=>{assert.equal(x.rowCount,1);rejected(y,'42501','staff_access_required');assert.deepEqual(await stored(f),beforeRevocation);await counts(f,1);});
  // Exercise Save and Get on both sides of Auth deletion. In deletion-first
  // schedules hold ONLY the parent row, observe the RPC waiting on it, then run
  // DELETE/cascades while that RPC remains in flight. An assignment-first RPC
  // would invert locks and fail here rather than allow the DELETE to complete.
  for(const operation of ['Save','Get']) for(const order of ['RPC first','Auth deletion first']) {
    f=await fixture();
    await once(a,f.b,()=>save(a,f,0,randomUUID(),content('other author record')));
    await once(a,f.a,()=>save(a,f,1,randomUUID(),content('shared retained content')));
    const baseline=await stored(f),name=`${operation}: ${order}`;
    const invoke=()=>operation==='Save'?save(a,f,2,randomUUID(),content('last authorized save')):get(a,f);
    await begin(a,f.a);await begin(admin);
    let expected=baseline;
    try {
      if(order==='RPC first') {
        const response=await invoke();
        if(operation==='Save') expected={...baseline,revision:3,content:content('last authorized save'),updated_at:new Date(response.draft.updated_at)};
        const p=pending(()=>admin.query('delete from auth.users where id=$1',[f.a.id]));
        await blocked(admin,a,name);await a.query('commit');assert.equal(accepted(await p).rowCount,1);await admin.query('commit');
      } else {
        await admin.query('select id from auth.users where id=$1 for update',[f.a.id]);
        const p=pending(invoke);await blocked(a,admin,name);
        assert.equal((await admin.query('delete from auth.users where id=$1',[f.a.id])).rowCount,1);
        await admin.query('commit');rejected(await p,'42501','authentication_required');await a.query('rollback');
      }
      const retained=await stored(f);
      assert.equal(retained.draft_id,expected.draft_id);assert.equal(retained.revision,expected.revision);assert.deepEqual(retained.content,expected.content);assert.deepEqual(retained.updated_at,expected.updated_at);assert.equal(retained.updated_by,null);
      await counts(f,1);
      const deleted=(await observer.query(`select
        (select count(*)::int from auth.users where id=$1) users,
        (select count(*)::int from auth.sessions where user_id=$1) sessions,
        (select count(*)::int from staff_authoring_private.course_author_assignments where user_id=$1) assignments,
        (select count(*)::int from staff_authoring_private.draft_save_receipts where actor_id=$1) receipts,
        (select count(*)::int from staff_authoring_private.draft_save_audit where actor_id=$1) audit`,[f.a.id])).rows[0];
      assert.deepEqual(deleted,{users:0,sessions:0,assignments:0,receipts:0,audit:0});
      const survivor=(await observer.query(`select
        (select count(*)::int from staff_authoring_private.course_author_assignments where user_id=$1 and course_id=$2) assignments,
        (select count(*)::int from staff_authoring_private.draft_save_receipts where actor_id=$1 and course_id=$2) receipts,
        (select count(*)::int from staff_authoring_private.draft_save_audit where actor_id=$1 and course_id=$2) audit`,[f.b.id,f.course])).rows[0];
      assert.deepEqual(survivor,{assignments:1,receipts:1,audit:1});
      const response=await once(b,f.b,()=>get(b,f));assert.equal(response.draft.revision,expected.revision);assert.deepEqual(response.draft.content,expected.content);
      pass(name);
    } finally {await a.query('rollback');await admin.query('rollback');}
  }
  assert.equal(results.length,11);assert.equal(waits.length,11);
  console.log(JSON.stringify({passed:results.length,failed:0,observed_lock_waits:waits.length,schedules:results,waits,scope:'Disposable local PostgreSQL with minimal Auth shims; no hosted deployment or real JWT verification'},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  await Promise.allSettled(clients.map(async c=>{try{await c.query('rollback');}finally{await c.end();}}));
});
