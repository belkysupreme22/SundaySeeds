# Optional learning preferences stay separate from identity

20 October 2026. Additive development migration applied; behavioral checks pending.

Store optional intention, catalog-backed interests, self-described familiarity and
session length in `public.learner_learning_preferences`, separate from the account
display name. Missing row means setup has not started. A completed or dismissed
row prevents repeated automatic onboarding; learners can edit later in Settings.
All answers may be absent. `null` session minutes means no fixed session target,
including “varies”; it does not represent zero study time.

Clients read only their own row through SELECT RLS. Direct writes are revoked.
Two authenticated RPCs derive the actor from `auth.uid()` and require a matching
`auth.users` row with non-null `email_confirmed_at`. User-editable metadata cannot
establish verification. These intentionally exposed SECURITY DEFINER write
endpoints follow the existing profile RPC boundary, with empty search paths,
qualified references and explicit EXECUTE grants. Privilege is necessary because
clients cannot write the table or read trusted Auth records directly.

Save replaces all optional answers and records `completed`. Dismiss records
`dismissed` while preserving existing saved answers; it does not submit editor
drafts. Both require the last acknowledged revision; zero means create only.
Conflicting first inserts and stale updates fail rather than overwriting another
device. Clients reload explicitly before retrying and retain drafts separately.
Changing preferences never grants course/class access, transfers guest records,
marks lessons complete or claims an assessed proficiency level.

The current catalog supports Faith, Prayer, Kindness and Courage interests only.
The SQL checks a unique, one-dimensional array of at most three known interests.
Future catalog expansion requires an intentional matching contract change.

The Supabase CLI is unavailable (`supabase --version`: command not found); no CLI
or dependency was installed. The lead applied only the new additive SQL through
the available Supabase MCP to `sundayseeds-dev`. The migration tool reported success
and `list_migrations` returned version `20261020114334`, name
`learner_learning_preferences`. The local filename mirrors that actual remote
version: `supabase/migrations/20261020114334_learner_learning_preferences.sql`.
Preflight catalog inspection found the preferences relation absent and the existing
profile relation present. Do not replay the profile migration or blanket-push local
migrations: its existing development table's migration history remains unreconciled.

Application success and migration registration establish development DDL deployment,
not permission or runtime correctness. Advisors, permission/input/concurrency checks
and runtime acceptance remain pending. No tests, builds, user-data queries or
credentials/environment changes occurred in this increment. No production database
was selected or changed.
