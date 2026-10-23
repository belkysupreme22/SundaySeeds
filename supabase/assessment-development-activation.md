# Development assessment activation — 23 October 2026

## Applied scope

Applied to **sundayseeds-dev** (`ypykbtwwyebsfqtdvodj`, PostgreSQL17.11) through
Supabase MCP. The two previously reviewed/tested migrations now exist persistently:

| Source version | Hosted migration version | Name |
| --- | --- | --- |
| 20261023080205 | 20261023091733 | connected_assessment_foundation |
| 20261023081342 | 20261023091743 | trusted_course_quiz_api |

MCP assigns hosted migration timestamps; these correspond to the exact source SQL.
Do not replay these migrations through a blanket push or rename historical source
files. Reconcile migration history explicitly before adopting a CLI push workflow.

The separate explicit `seeds/development_course_assessments.sql` import inserted
one sealed set in edition1 of **Faith for everyday life**: four checks, three
questions each, 12 total. Source questions/options/explanations match the existing
lesson blueprint; stable option-a/b/c/d keys follow its original option order.
Correct-answer mappings remain in the private snapshot. Later corrections need a
new edition; no silent edits to this sealed set or enrollment pins.

Pre/post queries confirmed one set (previously zero), valid snapshot, unchanged
release/reading/offering hashes and joins-open state. Attempts and outcomes remain
zero. No sample progress, account history or enrollment was manufactured. The first
import request had a transport failure; absence was verified before retrying.
The acknowledged retry succeeded and final queries confirmed all four checks.

## Verification

Before deployment: hosted rollback suites36+80 assertions; local PostgreSQL17.10
concurrency12 groups and storage integrity38 groups with Auth shims. See
[verification record](assessment-verification.md) for precise limits.

Before import: `tests/development_assessment_import.cjs` passed seven groups in the
disposable local cluster. It compares all12 questions/48 options and correct-answer
mappings against the TypeScript source; rejects missing course/readings, unavailable
edition and repeated import; compares preserved content/listing/learning tables;
and confirms all fixtures rolled back. Independent seed review found no blocker.
Temporary server stopped after verification. Run with the same loopback-only env
variables as the other local harnesses; mobile TypeScript dev dependency is needed.

Post-deployment privilege queries confirmed RLS on all four assessment tables,
zero policies, and no SELECT/INSERT/UPDATE/DELETE grants for anon, authenticated or
service_role. Authenticated learners use the five actor-checked quiz RPCs.
No real learner session, provider callback, mobile/network or native acceptance
was exercised by this deployment. Production teaching/Scripture-rights review is
still required.

## Advisor review

Security and performance advisors were run after both migrations, before the data
import. No new assessment security warning was reported.

- Eight [RLS enabled with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
  INFO findings include the four new private assessment tables and four existing
  private library tables. Deny-by-default access is intentional; direct privileges
  remain revoked. Do not add client table policies merely to silence this notice.
- Four [authenticated SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
  WARN findings concern existing public profile/preference RPCs, not new quiz
  wrappers. Those intentional APIs need a broader identity security review; they
  were not rewritten in this assessment deployment.
- [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
  remains disabled (WARN). This Auth setting was not changed; address during
  release/security readiness after checking project eligibility.
- Four [foreign-key index](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
  INFO findings concern assessment sets, attempts, readings and offerings. The new
  sets have a unique release_id lookup and attempts have an enrollment_id index;
  the advisor requests full composite coverage. Keep performance/index review
  separate and assess query plans/workload before adding redundant indexes.
- Four [unused-index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
  INFO findings concern newly created assessment/attempt indexes before workload.
  Their lack of usage at deployment is not grounds for deletion.

## Next increment

Connect mobile Start/resume/Check/Finish and acknowledged own progress. Preserve
actor fencing, original idempotency keys on uncertain responses, server feedback
and scoring, access-loss recovery and separate sample storage. Backend activation
alone does not make the existing mobile quiz connected. Reading positions and
bookmarks, staff publication, production release and native acceptance remain
separate work.
