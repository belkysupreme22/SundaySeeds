# Private learner profile foundation

19 October 2026. Source implementation authorized; database deployment and verification pending.

Use Supabase PostgreSQL for application records and Supabase Auth for credentials,
email proof and sessions. The first migration introduces only an own presentation
profile. Registration does not create an enrollment, class membership or staff role.

Authenticated clients read their own row through RLS. Direct client writes are
revoked; narrow RPCs derive the actor from `auth.uid()`, initialize an optional
display name once and save against an expected revision. These security-definer
operations use an empty search path, qualified references and explicit execute
grants. User-editable metadata never grants authority or establishes verification.

The owner requested preparation for a new development project, with domain and
email sender configurable. No existing unrelated project is selected. The SQL
is an unapplied source draft; rollback-only permission checks are supplied for
owner execution. CLI migration registration, advisors, permission/concurrency
tests and runtime acceptance remain pending under the owner's verification
agreement. No service is connected by committing these files.
