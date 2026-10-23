# Connected quiz concurrency acceptance

Owner-run on an isolated development database after both assessment migrations and
rollback fixture setup. **Not executed.** Sequential pgTAP is not concurrency proof.
Use two independent authenticated SQL transactions with real fixture session claims;
use a separate privileged transaction only for fixture revocation/withdrawal.
Do not run these schedules against real learner records.

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
Also run the permission/behavior pgTAP source and database advisors; source review
and these written schedules do not establish a passing result.
