# Course-library database foundation

Source: `migrations/20261021074729_course_library_foundation.sql`. Applied additively to `sundayseeds-dev` (`ypykbtwwyebsfqtdvodj`) through Supabase MCP on 21 October 2026. The tool reported success; migration history returned actual version `20261021074729`, used for this filename. No migration filename was invented. The migration contains no course seed, account data, staff grants, enrollment or publication operation. The owner approved the existing course for development, stable joined editions and all-four-checks completion; production content/rights review and remaining policies are separate.

## Public client contract

- `list_course_offerings()` returns available, listed metadata ordered by title/course ID.
- `get_course_offering(p_course_id uuid)` returns zero or one available metadata row, including unlisted offerings.
- Both are `SECURITY INVOKER`, executable only by `anon` and `authenticated`, subject to the table's SELECT policy. No anonymous/authenticated write or privileged function is introduced.
- `public.course_offerings` is a deliberate public metadata table. It contains no lesson bodies, quizzes, answer keys, authoring notes, enrollments, progress, learners or withdrawal reasons. Direct table SELECT also permits unlisted available rows: unlisted means omitted from discovery, not private or secret.
- Fields: `course_id`, `release_id`, `offering_revision`, `slug`, `title`, `summary`, `topics`, `learning_goals`, `outcomes`, `audience`, `language`, nullable `level`, nullable paired `estimated_minutes`/`estimate_basis`, `modules`, `is_listed`, `joins_open`, `is_development`, `is_available`.
- `modules` contains only `{id,title,lessons:[{id,title,scripture,estimatedMinutes?}]}`. A database allowlist rejects unknown keys and duplicate lesson/module IDs. Counts are derived from this outline; estimates must state reading versus full-study basis. Unknown metadata remains unknown.
- `is_available` is a synchronized public access fact. It is not accepted from callers and clients cannot mutate it. It avoids a privileged RLS helper or a join into private records on public reads.

## Private foundation and invariants

`course_library_private.courses` supplies stable course identities. `course_releases` binds a generated release ID and positive edition number to that course and freezes its public metadata snapshot. Only `is_available` can change after insertion; update/delete protection preserves edition history. These private tables have RLS enabled, no client policies/grants and no public function exposing their contents.

The snapshot must equal the public offering row after removing only `course_id`, `release_id`, `offering_revision`, `is_listed`, `joins_open` and `is_available`. Thus it includes all public authored fields, `modules` and `is_development`. A course/release composite foreign key prevents attaching another course's release. To change authored metadata, insert a new release with a new edition number, then change the offering in the same privileged transaction. No staff capability to do that is created here.

An invoker trigger takes a shared release-row lock, checks the exact snapshot, validates the public outline and copies current availability. Release availability changes synchronize the current offering atomically. Changes to the public offering increment `offering_revision`; an unchanged write does not. Availability and joins are independent: setting availability false hides metadata; setting `joins_open` false leaves available metadata visible. Future lesson-access operations must check current release availability independently; a previously successful catalog response grants no access.

No enrollment table is created prematurely. The following Join slice must bind a unique actor/course enrollment to a release, validate trusted email verification and implement idempotent/stale-offering/revocation behavior. Current metadata and `joins_open` do not grant access or make Join operational. Keep joins closed until that path and authorized lesson reads exist.

## Deployment and checks

Lead reviewed this source before the intended-development migration. Preserve the existing manually applied profile foundation and use the actual remote migration version when mirroring source; do not run a blanket push or replay old files. The CLI remains unavailable; no CLI installation or blanket push was performed.

Separately, `seeds/development_course_outline.sql` was executed once on that development project after the schema. It imports only approved development metadata and the four-lesson outline, marks it as development, and keeps joins closed. UUIDs are database-generated; there is no lesson body, quiz, account or guest-progress import. Re-execution intentionally fails rather than altering an existing edition. Do not run this seed against production. Tool acknowledgement is not a permission/runtime acceptance result.

Source review found an opposite lock order between offering updates (offering → release) and availability updates (release → offering). PostgreSQL may abort one concurrent administrative transaction with a deadlock; no partial write is committed. There is no client/staff mutation API in this slice. Before adding publishing/withdrawal operations, enforce release-before-offering locking and whole-transaction retry semantics, then verify concurrency. Do not claim these future writes are accepted.

Pending owner checks: anonymous/authenticated available versus unavailable reads; unlisted direct lookup versus list exclusion; draft/private-table denial; all direct-write denial; snapshot and outline rejection; same-course release binding; immutable edition metadata; availability synchronization; offering revision change/no-op behavior; concurrent availability/offering updates. No tests, builds, SQL execution, advisor, permission or runtime checks were run by this source-writing agent.

Official guidance reviewed: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [database function security](https://supabase.com/docs/guides/database/functions). No `SECURITY DEFINER`, user-editable metadata authorization or exposed private view is used.
