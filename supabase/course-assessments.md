# Connected assessment foundation

23 October 2026. **Rollback SQL verification passed; not persistently deployed or activated.** See
[verification record](assessment-verification.md).

Policy: [decision0016](../docs/decisions/0016-connected-assessment-policy.md).
Migration: `20261023080205_connected_assessment_foundation.sql`, generated using
Supabase CLI migration new. Do not use a blanket migration push against the hosted
project: existing historical migrations were already applied separately.

## Storage boundary

The private whole-edition assessment snapshot contains stable lesson, assessment,
question and option IDs, prompts, private answer keys and explanations. Validation
rejects unknown properties, duplicate IDs, missing options and invalid answer keys.
The insertion trigger requires exactly the released outline's lesson set. Every
insert is sealed immediately; update/delete and a second set for that release fail.
This implements the approved additive first development assessment activation
without changing readings, released metadata or enrollment pins. This migration
inserts no assessment content and does not itself activate quizzes.

Attempts bind to an exact assessment set and an exact enrollment/user/course/edition
composite foreign key. Actor-scoped start keys prevent duplicate stored identities;
future APIs must compare request scope before returning a reused key. Checked
selections reference valid questions/options and cannot be updated. An outcome
requires every question checked and exact server-computed counts/rounded percentage.
Answer and outcome inserts serialize on the attempt row. Outcomes are the completion
facts; there is no client-editable completion flag or course-wide score.

All four tables have RLS with no client policies, and explicit table/helper-function
privilege revokes including service_role. There are no public assessment RPCs.
Database owners can still perform privileged operations; Auth-user deletion cascades
through attempts. No retention/export/delete policy or client deletion API is added.

## Verification and next increment

`tests/assessment_foundation.test.sql` is owner-run, rollback-only pgTAP source:
RLS, role privileges, direct-access denial and malformed snapshot validation.
Its 36 assertions passed in a rollback-only PostgreSQL run. Persistent deployment,
advisors and full trigger edge fixtures remain pending. Additional required acceptance cases before enabling
quizzes: missing/extra outline lessons; sealed updates; cross-enrollment/edition
binding; invalid/changed choices; partial or forged outcomes; zero/full scores;
concurrent Check/Finish; actual role/default privilege behavior and Auth cascades.

Next implement trusted Start/Check/Finish and own summary RPCs. Require the existing
verified live actor/session and current enrollment/release access at acceptance.
Coordinate a consistent enrollment/release/assessment/attempt lock order with
revocation; offering closure alone must not revoke a pinned enrollment. Same checked
selection and Finish retries return acknowledged results; changed payloads conflict.
Historical receipt replay after withdrawal must omit question/key/feedback content.
Read payloads must explicitly allowlist fields from the private snapshot.

Only after permission/concurrency checks: explicit approved four-check import and
activation, then mobile integration. No sample progress/history is imported. Reading
positions/bookmarks synchronize separately with stale-write handling. No staff
publication, course migration or production content review is implemented here.

## Trusted RPC source increment — 23 October 2026

Migration `20261023081342_trusted_course_quiz_api.sql` follows the foundation;
**not persistently deployed; 80 RPC assertions passed in rollback-only SQL tests**.
All endpoints derive their own verified actor/session; none accepts a learner ID.
Public wrappers run as invoker and call narrowly granted private definer entrypoints
with an empty search path. Internal helpers remain uncallable by client roles.
Direct answer-key/attempt/outcome table access stays revoked.

| RPC | Request | Acknowledged result |
| --- | --- | --- |
| `start_course_quiz` | course ID, lesson ID, actor-scoped UUID start key | Exact pinned attempt and safe questions; same key/scope returns same attempt |
| `get_course_quiz_attempt` | attempt ID | Own active attempt, safe questions and feedback only for checked answers |
| `check_course_quiz_answer` | attempt ID, question ID, option ID | First accepted selection with correct option, correctness and explanation |
| `finish_course_quiz` | attempt ID | `{receipt, best_score_percent}`; no questions or feedback |
| `get_my_course_quiz_progress` | course ID | Own edition's required/completed checks and per-lesson best scores |

Start/Get project question and option fields explicitly; explanations/keys appear
only in checked-answer feedback. Changing a checked selection returns a conflict;
an intentional retry starts a new key/attempt. Finish accepts only fully checked
attempts, deriving score server-side and storing one immutable outcome. Receipt score/count/time fields are immutable; `best_score_percent` is a separate
current aggregate and may improve on later attempts. A repeated
Finish can return an already-committed own redacted receipt after withdrawal;
it cannot reopen question/feedback access. Best scores include recorded zero and
never decrease. No course-wide score is introduced. Multiple attempts cannot inflate
completion of the same required lesson.

New access/check/submission locks the enrollment, then pinned release, then attempt.
Start additionally serializes actor/start-key reuse. Withdrawn/revoked access blocks
unfinished submissions; admission closure of the current offering is independent.
Read the migration and concurrency schedules together before implementing privileged
revocation operations. Session validation is at request entry; in-flight Auth-session
revocation timing requires acceptance, not a claim of instantaneous token invalidation.

Failures include denied verification/access, unavailable attempt/assessment, invalid
request/selection, reused start-key scope conflict, checked-answer conflict and
incomplete quiz. Mobile adapters must map these to safe messages and preserve the
original attempt/key on an uncertain response. A missing enrollment or assessment
is distinct from a failed query or fabricated empty history. Sample learning remains
isolated; these summaries do not imply reading-position/bookmark synchronization.

`tests/course_quiz_rpc.test.sql` supplies rollback-only permission/behavior fixtures;
`tests/course_quiz_concurrency.md` lists separate multi-transaction schedules.
The single-session RPC suite passed 80 assertions; concurrency schedules are not
executed. Deployment/advisors, concurrent revocation/Finish, actual session timing
and mobile integration remain pending. See assessment-verification.md.
No content imported or assessments activated by this RPC migration.
