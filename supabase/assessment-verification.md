# Assessment rollback verification — 23 October 2026

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
database advisors for a persistently installed assessment schema, two-session
Start/Check/Finish and revocation schedules, actual network/session-switch behavior,
content import/activation and mobile integration. The tests do not prove immediate
in-flight Auth revocation. See tests/course_quiz_concurrency.md for schedules.

Full two-session behavior needs a separate local database or an approved test branch:
fixtures in a rollback-only transaction cannot be seen by another session. Keep
activation gated until that verification is available. No claim of production
readiness follows from these 116 passing assertions.
