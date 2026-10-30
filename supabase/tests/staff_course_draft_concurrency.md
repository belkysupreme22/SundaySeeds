# Staff draft concurrency verification

28 October 2026: **11 groups passed, 0 failures, 11 observed lock waits** with
`staff_course_draft_concurrency.cjs`. This is actual local PostgreSQL execution,
separate from the rollback-only pgTAP behavioral/permission suite.

The disposable server used PostgreSQL 17.10 from
`@embedded-postgres/darwin-arm64` 17.10.0-beta.17 and `pg` 8.16.3, installed outside
the repository. It listened on `127.0.0.1:65433`; its cluster was
`/tmp/sundayseeds-staff-pg-verification/cluster-run28`. The command's EXIT trap
stopped the server successfully after the passing run (`server stopped`).
Disposable cluster files remain in `/tmp`; no app dependencies or environment
files were changed. Initial sandboxed `initdb` could not create shared memory;
initialization and server/test execution subsequently succeeded with approval.

## Executed schedules

Each schedule uses separate database sessions and READ COMMITTED transactions.
Before releasing a blocker, the observer verifies both the expected backend PID
in `pg_blocking_pids` and an ungranted `pg_locks` entry with a `Lock` wait event.
Elapsed time or a sleep is never accepted as proof of serialization.

| Group | Verified result |
| --- | --- |
| Competing first saves | Exactly one revision-0 creation succeeds; loser gets `40001 draft_revision_conflict` |
| Competing updates | Exactly one save at the shared expected revision succeeds; losing content never overwrites it |
| Exact same-key retry | Identical response; one revision, receipt and successful-save event |
| Changed same-key payload | `22023 draft_request_mismatch`; original content and single receipt/event retained |
| Old receipt with concurrent save | Original `saved_revision` returned with the newer authorized draft |
| Save before assignment revocation | Authorized save commits; revocation waits, then denies Get and original-request replay |
| Assignment revocation before Save | Save waits, then gets `42501 staff_access_required`; draft and counts unchanged |
| Save before Auth deletion | Deletion waits for save, then removes only deleted-author records and updater attribution |
| Auth deletion before Save | Save waits on Auth parent; deletion/cascades complete without lock inversion; save gets `42501 authentication_required` |
| Get before Auth deletion | Deletion waits for Get, then retains the shared draft and other author's records |
| Auth deletion before Get | Get waits on Auth parent; deletion/cascades complete without lock inversion; Get gets `42501 authentication_required` |

All four Auth-deletion schedules assert retained draft identity, revision, content
and update time, null updater attribution, zero deleted-author Auth/session/
assignment/receipt/audit rows, and the other author's single retained assignment,
receipt and audit event. The surviving author can still read the shared draft.

Deletion-first schedules deliberately lock only the Auth parent, start the RPC,
observe it waiting, then execute DELETE and cascades before releasing the parent.
This exercises the parent-before-assignment ordering that prevents the previously
identified inversion. RPC-first schedules hold the completed RPC transaction
while observing the Auth DELETE wait.

## Repeat locally

Run only against a newly initialized disposable PostgreSQL database, using a
superuser able to create roles. The runner refuses existing Auth, course-library
or staff schemas. It creates minimal Auth shims and loads exactly these sources:

- `20261021074729_course_library_foundation.sql`
- `20261021080323_verified_course_enrollment.sql`
- `20261024084826_staff_course_drafts.sql`

With that disposable server already running and `pg` available externally:

```sh
SUNDAYSEEDS_ISOLATED_DB=1 \
SUNDAYSEEDS_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:65433/postgres \
SUNDAYSEEDS_TEST_PG_MODULE=/tmp/sundayseeds-staff-pg-verification/node_modules/pg \
node supabase/tests/staff_course_draft_concurrency.cjs
```

Always stop the disposable server in a shell EXIT trap or equivalent finalizer,
including on failure. Fixtures commit for cross-session observation; use a fresh
database for every rerun. The runner never reads `.env` and accepts only loopback
connection destinations, rejecting destination overrides in URL parameters.

This run used minimal local Auth/session/claim shims, including a cascading
session foreign key. It does not establish real Supabase Auth/JWT/provider,
PostgREST/HTTP, browser adapter retry, deployment, or native/client behavior.
PostgreSQL 17.10 execution does not by itself verify a different hosted patch
version. No hosted database was accessed or modified by this runner.
