"""Build rollback-only assessment suites from the repository root.

Only generates /tmp SQL files; does not connect to a database. Each suite adds the
unapplied migrations inside its transaction and raises on any failed TAP result.
Confirmed against these suites on PostgreSQL 17.11; not a general SQL parser.
"""
from pathlib import Path
import re
# Split PostgreSQL statements while preserving quoted and dollar-quoted bodies.
def split_sql(s):
 out=[];start=0;i=0;quote=None;comment=False
 while i<len(s):
  if comment:
   if s[i]=='\n':comment=False
   i+=1;continue
  if quote:
   if s.startswith(quote,i):
    if quote in ["'",'"'] and s.startswith(quote*2,i):i+=2;continue
    i+=len(quote);quote=None;continue
   i+=1;continue
  if s.startswith('--',i):comment=True;i+=2;continue
  if s[i] in ["'",'"']:quote=s[i];i+=1;continue
  if s[i]=='$':
   m=re.match(r'\$[A-Za-z_0-9]*\$',s[i:])
   if m:quote=m.group();i+=len(quote);continue
  if s[i]==';':out.append(s[start:i]);start=i+1
  i+=1
 return out
foundation=Path('supabase/migrations/20261023080205_connected_assessment_foundation.sql').read_text()
rpc=Path('supabase/migrations/20261023081342_trusted_course_quiz_api.sql').read_text()
for filename,label in [('assessment_foundation.test.sql','foundation'),('course_quiz_rpc.test.sql','rpc')]:
 statements=split_sql(Path('supabase/tests/'+filename).read_text());out=['begin;','set local lock_timeout = \'5s\';',foundation,rpc,'create temporary table audit_results(result text);','grant insert,select on audit_results to anon,authenticated;']
 for stmt in statements:
  cleaned=re.sub(r'--[^\n]*','',stmt).strip()
  if not cleaned or cleaned.lower() in ['begin','rollback']:continue
  if cleaned.lower().startswith('select '):
   out.append('insert into pg_temp.audit_results select v.value from ('+stmt+') r cross join lateral pg_catalog.jsonb_each_text(pg_catalog.to_jsonb(r)) v;')
  else:out.append(stmt+';')
 out+= ["do $$ declare failures text; begin select string_agg(result,E'\\n') into failures from pg_temp.audit_results where result like 'not ok%'; if failures is not null then raise exception 'Assessment checks failed: %', failures; end if; if not exists(select 1 from pg_temp.audit_results where result like 'ok %') then raise exception 'No assertions executed'; end if; end $$;", "select count(*) filter(where result like 'ok %') as passed, count(*) filter(where result like 'not ok%') as failed from pg_temp.audit_results;",'rollback;']
 Path('/tmp/sundayseeds-verify-'+label+'.sql').write_text('\n'.join(out))
 print(label+' verification assembled')
