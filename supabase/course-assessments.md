# Connected assessment foundation

23 October 2026. **Source prepared; not applied or verified against Postgres.**

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
It has not run. Migration application, SQL parsing/execution, advisors and full
trigger fixtures are pending. Additional required acceptance cases before enabling
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
