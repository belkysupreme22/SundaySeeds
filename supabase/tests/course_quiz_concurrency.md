# Connected quiz concurrency acceptance

Executed 23 October 2026 using `course_quiz_concurrency.cjs`: **12 groups passed**
on isolated local PostgreSQL 17.10, with ten observed lock waits. Auth tables and
claims were shims; no hosted schema or data changed. See
[actual verification and reproduction](../assessment-verification.md).

The harness requires an empty disposable loopback database and commits fake fixtures
for cross-session visibility. It refuses existing Auth/app schemas, never reads
`.env`, and rolls back/ends connections in cleanup. It does not replace real
Supabase Auth, network, native or in-flight session-revocation acceptance.

## Required schedules

- Start the same actor/start key concurrently: one attempt ID, same scope and no
  second row. Reuse that key for a different lesson/course: conflict, no retargeting.
- Check the same question/selection concurrently: one checked row, same feedback.
  Competing different selections: only the first accepted selection persists;
  the other request conflicts. No overwriting a checked selection.
- Finish the same fully checked attempt concurrently: one immutable outcome,
  identical receipt ID/score/time on retry; no double counting in course completion.
- Check the final question against Finish: Finish either sees all committed checked
  answers or rejects as incomplete; it must never accept a partial/forged score.
- Finish against enrollment revocation: if Finish holds the enrollment access lock
  first, revocation waits until it commits. If revocation commits first, unfinished
  submission fails access recheck. Retry of an outcome already committed returns
  only its own redacted receipt, never questions/keys/explanations.
- Finish against pinned-release withdrawal: same deterministic boundary using the
  release access lock. Closing current offering admission alone does not revoke a
  valid pinned enrollment. Publication/transfer operations remain deferred.
- Concurrent attempts with different keys: each is a distinct intentional retry;
  best score is max accepted score including a genuine zero, and course completion
  counts distinct required lesson checks, not attempt count.
- Revoke/delete the fixture Auth session before the next operation: every API
  rejects stale credentials. Deleting/banning/unverifying a fixture user must not
  become authorization through user-editable JWT metadata.

Confirm both commit order and durable row counts, then discard the isolated fixture
state. Record deadlocks/serialization errors explicitly: do not silently call a new
Start key to recover an uncertain request. Reconcile using the original attempt/key.
The permission/behavior pgTAP suites passed separately in hosted rollback-only
transactions. Installed-schema advisors and remaining trigger edge fixtures are
still pending. The Auth deletion group is sequential, not an in-flight revocation
test; banning/unverifying cases belong to separate authorization coverage.
