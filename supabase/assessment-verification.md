# Assessment verification — 23 October 2026

The owner explicitly approved rollback-only tests in **sundayseeds-dev** after
branch creation was declined. No local Docker/Postgres was available. No test
branch was created, and neither assessment migration was deployed persistently.

## Actual results

PostgreSQL 17.11, using Supabase MCP execute_sql:

| Suite | Passed | Failed |
| --- | ---: | ---: |
| Assessment foundation permissions/validation | 36 | 0 |
| Trusted quiz RPC behavior/permissions | 80 | 0 |

Each transaction created both source migrations, installed pgTAP transactionally if
needed, ran one suite and ended in ROLLBACK. SELECT results were captured into a
temporary table; a final guard raised on any `not ok` TAP result or absence of
assertions. This prevents successful SQL transport being mistaken for a passing
suite. An initial transport failure returned no verification result; absence of
new objects was confirmed before retrying. Only acknowledged runs above count.

The RPC suite exercised session/verification gates, private answer denial, actor
and joined-edition binding, Start-key reuse/conflict, immutable checked selections,
incomplete Finish rejection, zero/full scores, maximum score retention, distinct
lesson completion and withdrawn/revoked receipt redaction. These are single-session
checks, not concurrent-transaction or mobile acceptance.

Post-run queries confirmed assessment/attempt tables and Start RPC absent, and zero
fixture Auth users (`@quiz-rpc-test.invalid`) and fixture courses. No content import,
quiz activation or real learner completion was retained.

## Reproduction and remaining gates

From repository root, `python3 supabase/tests/prepare_assessment_verification.py`
prepares `/tmp/sundayseeds-verify-foundation.sql` and
`/tmp/sundayseeds-verify-rpc.sql`. Review before using: these assume assessment
migrations are not already installed. The helper only writes SQL; it neither
connects nor deploys. Do not run against production. This verification permission
was for rollback-only development testing, not persistent fixtures or deployment.

Still pending: full binding/immutability trigger edge fixtures beyond these suites,
database advisors for a persistently installed assessment schema, actual
network/session-switch behavior,
content import/activation and mobile integration. The tests do not prove immediate
in-flight Auth revocation. See tests/course_quiz_concurrency.md for schedules.

## Isolated local concurrency run

`tests/course_quiz_concurrency.cjs` passed **12 test groups, zero failures** on
local PostgreSQL **17.10**. Ten groups observed actual lock waits through
`pg_blocking_pids`, `pg_locks` and `pg_stat_activity` before releasing the blocking
transaction. The other groups checked concurrent distinct retries and sequential
session deletion. No deadlocks or lock/statement timeouts occurred.

Verified same-key Start deduplication, checked-answer replay/conflicts, one outcome
for simultaneous Finish, final Check versus Finish, both commit orders for
enrollment revocation and release withdrawal, redacted historical receipts, highest
score including zero, distinct lesson completion and rejection after session deletion.
The reverse incomplete-Finish schedule deliberately holds the attempt lock through
a privileged transaction/savepoint; it is a controlled lock-boundary test rather
than a claim that a rejected HTTP request keeps a transaction open.

This run used four tracked migrations and committed fake fixtures in a disposable
loopback-only cluster under `/tmp/sundayseeds-pg-verification`. Minimal Auth tables
and claim functions were shims, not Supabase Auth/JWT verification. PostgreSQL 17.10
differs from hosted 17.11. The temporary server was stopped after the run; its
disposable files remain under `/tmp`. No app dependencies or hosted data changed.
Temporary tooling: `@embedded-postgres/darwin-arm64@17.10.0-beta.17` and
`pg@8.16.3`, installed outside the repository. Package lifecycle hooks were disabled;
the supplied symlink hydration script was reviewed and run to restore bundled
library links before initializing the cluster.

To reproduce, provision a fresh isolated PostgreSQL database with a privileged
owner, install a pinned `pg` client outside the app, and run from repository root:

```sh
SUNDAYSEEDS_ISOLATED_DB=1 \
SUNDAYSEEDS_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:65432/postgres \
SUNDAYSEEDS_TEST_PG_MODULE=/absolute/path/to/node_modules/pg \
node supabase/tests/course_quiz_concurrency.cjs
```

The harness refuses non-loopback destinations or existing Auth/app schemas and
never reads environment files. It leaves local fixture state and must only target
a disposable database. Stop/discard that cluster after testing.

The concurrency gate for these schedules is satisfied locally. Remaining gates
include additional integrity-trigger edge fixtures, installed-schema advisors,
development deployment/import, actual SDK/network/account-switch acceptance and
mobile integration. Immediate in-flight Auth revocation remains unproven.
No claim of production readiness follows from these results.
