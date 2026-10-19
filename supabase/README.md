# Learner identity database foundation

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
