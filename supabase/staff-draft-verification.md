# Staff draft verification — 28 October 2026

## Hosted rollback-only suite

The owner authorized verification against **sundayseeds-dev**
(`ypykbtwwyebsfqtdvodj`) and subsequent development deployment after the checks pass.
The single-session suite passed **203 assertions, zero failures**, on hosted
PostgreSQL **17.11**, through Supabase MCP.

The transaction included only the new staff migration and its pgTAP suite; existing
library/verified-actor prerequisites were already installed. Fictional Auth users,
sessions, courses and assignments were rolled back with the migration. Post-run
inspection confirmed the staff schema and Save RPC absent, and zero fixture Auth
users/course IDs with the suite's `a4000000-`/`c4000000-` prefixes. No real staff
identity or assignment was created.

Coverage includes live-session/verification gates, forged metadata denial, private
table/helper grants, function search paths, assigned-course isolation, absence
without creation, malformed draft validation, compare-and-swap revisions, exact
request binding, old-receipt/current-draft replay, minimal event counts,
revocation and Auth-deletion retention/cascades. These are database tests, not
Supabase provider/JWT, HTTP or dashboard acceptance.

Two source test issues were corrected before the passing run: parenthesized JSON
extraction before subtracting keys, and null-safe comparisons so omitted response
fields fail. Independent source review found no remaining blocker.

Three earlier large-batch calls returned request-state/transport errors and do not
count as test results. Absence was rechecked before retry. The smaller helper uses
pgTAP's installed `finish(true)` implementation, inspected transactionally before
use: failed assertions and no tests raise an exception. Its referenced materialized
summary forces execution and returns the actual pass/fail counts (`203/0`,
`1..203`). Any ordinary SQL error also aborts the transaction.

## Reproduction

From repository root:

```sh
python3 supabase/tests/prepare_staff_verification.py
```

This only writes `/tmp/sundayseeds-verify-staff.sql`; it never connects or deploys.
Review before execution. It requires the staff schema/RPC to be absent and refuses
an already installed foundation. Use an isolated development database with the
library and verified-actor prerequisites, never production. After deployment, use
a fresh database for this unapplied-schema suite rather than dropping live tables.
The narrow SQL splitter supports this suite's line comments and quoted bodies;
it is not a general SQL parser.

## Local concurrency

The [isolated runner](tests/staff_course_draft_concurrency.cjs) passed **11 groups,
zero failures, 11 observed lock waits** on PostgreSQL **17.10**, using minimal Auth
shims. Independent source review found no blocker. It checks competing create/
update saves, same-key replay/conflict, old receipt with current draft, revocation
in both orders, and Get/Save each against Auth deletion in both orders. Assertions
include retained shared content/revision/time, deleted-author cascades and surviving
author access/records. See the [run record](tests/staff_course_draft_concurrency.md)
for exact schedules, pinned tooling and reproduction. The temporary server stopped;
a subsequent status check confirmed no server running. No app dependency changed.

## Development deployment

Supabase MCP `apply_migration` acknowledged success for `staff_course_drafts` on
28 October. Migration history records hosted version **20261028081455** for source
**20261024084826**. Do not rename source history or blanket-push migrations.
The applied source SHA-256 is
`84fc307716dd1436256d7154cb5b1c65dee6a87b0a70ff16361dbbb4be40b04a`.

Post-deployment catalog inspection confirmed:

- Four private tables, all RLS enabled, each empty: assignments/drafts/receipts/audit
  all zero. No real staff assignment or draft import.
- Zero direct SELECT/INSERT/UPDATE/DELETE grants for anon, authenticated or
  service_role; zero anon/service_role function execution grants.
- Seventeen functions with empty search paths: three public invoker wrappers,
  three checked private definers, and eleven internal helpers. Authenticated has
  exactly six execution grants (the wrappers and operations), none on helpers.

Installed advisors were compared with the pre-deployment baseline:

| Finding | Before → after | Interpretation |
| --- | --- | --- |
| [RLS enabled without policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), INFO | 9 → 13 | Four private tables intentionally deny direct access; checked operations mediate access |
| [Authenticated public definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), WARN | 4 → 4 | Existing profile/preferences operations; no new warning |
| [Leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), WARN | 1 → 1 | Existing Auth setting; unchanged |
| [Unindexed foreign keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), INFO | 5 → 5 | Existing findings; none added by staff tables |
| [Unused indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), INFO | 3 → 8 | Five new supporting indexes on empty staff tables; retained for FK/query paths |

No production database, staff provisioning or learner content/history changed.

## Remaining gates

Next: staff sign-in and editor integration as a separate UI increment. Actual
owner-selected identities and trusted provisioning are required before real staff
access. Admin review/publication, production audit/retention and rights approval
remain separate. Network/account-switch behavior and visual/native acceptance are
not established by these database checks. No instantaneous cancellation of
in-flight Auth/session requests is claimed. Existing learner quiz/reading acceptance
is unchanged. No app typecheck, lint, build or runtime review ran in this increment.
