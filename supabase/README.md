# Learner identity database foundation

## Current development assessment state

Both reviewed assessment migrations and the explicit first four-check development
import are now applied to sundayseeds-dev. Installed-schema advisors were reviewed;
no attempts or learner results were imported. See the
[activation record](assessment-development-activation.md) for exact scope, migration
versions, verification and remaining advisory findings. Mobile quiz integration
is next. Dated source checkpoints below preserve history.

## Trusted quiz RPC source — 23 October 2026

Start/resume/Check/Finish/own summary source and rollback tests are prepared, not
applied or SQL-verified. See [assessment API scope](course-assessments.md).


## Assessment foundation — 23 October 2026

Source-only private storage migration and permission-test source are prepared.
Nothing applied, imported or activated. See [assessment scope](course-assessments.md).


## Verified enrollment and reading — 21 October 2026

The next additive migration and four-reading development import are now applied.
Development joining is open only after complete reading coverage; enrollment and
content RPCs enforce verified current actors and pinned editions. See [enrollment
and authorized reading](course-enrollment.md) for APIs, application evidence and
pending owner checks. There are still no trusted assessments/progress or staff
publication services. Older catalog-only checkpoints below preserve prior scope.


## Current development catalog — 21 October 2026

The additive course-library migration and explicit development outline import are
now applied to the intended development project. See [course-library API/deployment
notes](course-library.md). Catalog/details only; no enrollment, connected lesson
body, trusted progress or staff publication service exists yet. Original profile
setup text below is historical; do not replay it or run a blanket migration push.


The planned database is **Supabase Postgres**. These source files introduce only
private learner presentation profiles. They have not been applied to a database
or verified against a running Supabase service. Auth credentials/sessions stay
provider-managed; course, class, staff and learning records are separate slices.

## Client contract

Authenticated clients can select only their own `public.learner_profiles` row.
Direct client inserts, updates and deletes are revoked. The two authenticated
RPCs derive the actor from `auth.uid()`; neither accepts a user ID:

- `ensure_learner_profile()` returns an existing profile or creates it once.
  Creation accepts only a normalized optional `display_name` string from the
  actor's Auth metadata, capped at 40 characters. Later metadata never replaces
  a saved profile. No metadata field grants roles or verification.
- `update_learner_profile(p_display_name text, p_expected_revision bigint)`
  normalizes whitespace, converts blank to `null`, rejects names over 40
  characters and requires the last acknowledged revision. A successful save
  increments the server revision and sets the server timestamp. A conflict
  requires reloading before another explicit save; do not silently retry with a
  newer revision and overwrite another edit.

Both functions return a set containing exactly one row on success. A Supabase
adapter can request `.single()` and map
`{ user_id, display_name, revision, updated_at }` into its feature-owned types.
The PostgreSQL `bigint` revision should be accepted only if safely representable
in the client; unsafe values require an explicit adapter failure.

| SQLSTATE | Message | Meaning |
| --- | --- | --- |
| `42501` | `authentication_required` | Permitted RPC role lacks a valid actor |
| `22023` | `invalid_display_name` | Normalized explicit name exceeds 40 characters |
| `22023` | `invalid_expected_revision` | Missing or nonpositive revision |
| `P0002` | `profile_not_found` | Provision/reload profile before editing |
| `40001` | `profile_revision_conflict` | Supplied revision is stale |

SQLSTATE `42501` also covers ordinary permission denial for anonymous RPC/table
access and direct writes. Do not expose raw database messages to learners.

## Owner setup and verification

No hosted project reference, credentials, callback URL or SMTP sender is defined
here. The owner must choose the development environment and review the migration
before applying it. Supabase roles, Auth schema and a migration owner with the
appropriate privileges are required. This is not standalone PostgreSQL setup.

For a disposable local Supabase environment, the owner can initialize the CLI
configuration, keep Confirm Email enabled, apply this migration and run the
Supabase database tests. No CLI configuration is committed until environment
and Auth callback/delivery decisions are supplied. Do not reset or test against
a production database.

`tests/learner_profiles.test.sql` uses pgTAP, fixed isolated fixture identities
and a transaction ending in rollback. It checks anonymous denial, missing
principals, own reads, cross-user isolation, direct-write denial, actor-bound
RPCs, input normalization, revision conflict and metadata nonauthority. The test
creates pgTAP inside that transaction only if it is missing. No fixture user,
profile or metadata update is intended to persist.

**Pending:** migration application, SQL permission tests, concurrent ensure/save
checks, provider profile provisioning and mobile/runtime acceptance. Writing
these checks is not evidence that they pass.

Implementation references:
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [database function security](https://supabase.com/docs/guides/database/functions).

## Optional learning preferences — development migration applied

The original foundation's application notes above are historical: the development
project now has the profile table and the owner has confirmed identity happy paths.
Its CLI migration history has not been reconciled. **Do not replay the original
profile migration or push all local migrations blindly.**

`migrations/20261020114334_learner_learning_preferences.sql` contains the additive
preferences table and RPCs applied to `sundayseeds-dev` through the available
Supabase MCP on 20 October 2026. The application tool returned success and subsequent
`list_migrations` returned version `20261020114334`, name
`learner_learning_preferences`; the filename uses that actual remote version.
Preflight catalog inspection found the preferences relation absent and the profile
relation present. No user records were queried, inserted or modified for checking.

The Supabase CLI is not installed in this workspace (`supabase --version` returned
command not found). No CLI or dependencies were installed. The MCP deployment
replaced the initially planned CLI generation step; no migration filename was
invented. The old profile migration's history remains unreconciled even though its
table exists. No production deployment occurred.

Next owner steps are to review/reconcile the existing profile migration history
before any history-based push, then run advisors and the permission/concurrency/
runtime checks below in an appropriate disposable environment. No such checks have
run here. The preferences migration is already applied in development; do not
reapply it simply to test it. Tool success establishes DDL application and migration
registration, not permission or behavior acceptance.

### Client contract

Authenticated clients select their own `learner_learning_preferences` row using
`maybeSingle()`. No row means not started; it is not an error. Both RPCs return
exactly one row on success, suitable for `.single()`:

- `save_learner_learning_preferences(p_intention text, p_interests text[],
  p_familiarity text, p_session_minutes integer, p_expected_revision bigint)`
  replaces optional answers and sets `setup_status = 'completed'`.
- `dismiss_learner_learning_preferences(p_expected_revision bigint)` records
  dismissal while preserving stored answers. New dismissal creates empty answers.

No RPC accepts an actor ID. Both require trusted verified email from `auth.users`.
An expected revision of zero creates only; a positive revision updates only that
exact actor revision. Save or dismissal increments the revision and uses the server
timestamp. Never silently retry a conflict with a newer revision.

The returned shape is `{ user_id, intention, interests, familiarity,
session_minutes, setup_status, revision, updated_at }`. Accept only safe integer
revisions in the adapter, as with identity profiles.

| Field | Accepted values |
| --- | --- |
| `intention` | `null`, `explore_faith`, `understand_bible`, `prayer_habit`, `daily_practice`, `deeper_study`, `browsing` |
| `interests` | Unique one-dimensional array, up to three of `Faith`, `Prayer`, `Kindness`, `Courage`; empty allowed |
| `familiarity` | `null`, `new`, `some`, `regular`, `unsure` |
| `session_minutes` | `null`, `5`, `10`, `15`, `20` |
| `setup_status` | `completed` or `dismissed`, chosen by the RPC |

| SQLSTATE | Message | Meaning |
| --- | --- | --- |
| `42501` | `authentication_required` | Actor missing or no longer exists |
| `42501` | `email_verification_required` | Trusted email verification absent |
| `22023` | `invalid_expected_revision` | Missing or negative revision |
| `22023` | `invalid_learning_preferences` | Save input violates the field contract |
| `40001` | `learning_preferences_revision_conflict` | Stale revision, missing expected row, or competing first insert |

Permission denials also use `42501`. Map errors to safe feature feedback; do not
display raw database messages. Successful preferences do not create enrollment,
class membership, learning progress, assessed proficiency or guest-data transfer.

**Pending owner checks:** own SELECT/missing-row behavior; anonymous, direct-write
and cross-account denial; unverified-user RPC rejection including forged metadata;
all allowed optional fields; malformed/duplicate/unknown/null interests; save versus
dismiss preservation; simultaneous first save/dismiss; stale revision rejection;
account deletion; verified mobile/web edit and skip persistence. No SQL check file
or database fixture was added or executed for this increment.
