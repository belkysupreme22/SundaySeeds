# 0020 — Scoped staff course-draft foundation

24 October 2026; deployment update 28 October. Status: applied to development after
203 hosted assertions and 11 isolated concurrency groups passed. See the
[verification record](../../supabase/staff-draft-verification.md); staff UI/provider
acceptance remains pending. Decision0019 establishes teacher drafting
and admin review/publication. This increment prepares only authoring authority and
durable draft operations; actual staff identities/bootstrap remain unselected.

## Architecture

- Keep application author assignments distinct from learner enrollment and
  Supabase project administration. Each author assignment names one verified Auth
  user and one existing stable course. No client can grant their own access.
- Use the existing live verified-session actor helper and check the current
  assignment on every operation, including retries. Store private assignment,
  draft, receipt and minimal event data with RLS and revoked direct client access.
  Public invoker wrappers expose only three narrowly checked operations.
- Own the working draft at course scope, with one aggregate revision for course
  metadata, ordered modules and structured lessons/checks. Keep a strict versioned
  draft schema, while allowing incomplete authored text and empty arrays. This
  removes ambiguity between a saved draft and a publishable edition.
- Compare the expected revision for every new save; revision0 means create-only.
  Bind the initiating actor's request key to the exact original save. An exact
  retry returns its saved revision and the current authorized draft without a
  duplicate save/event or rollback to an old content snapshot.
- Serialize request key, Auth-user parent, assignment authority and course-draft
  writes. Lock the Auth parent before assignment to match deletion cascades and
  recheck the live actor after a possible wait. List remains snapshot-based; its
  navigation summary cannot replace the locked Get/Save authority check. A write
  holding authority may finish before a competing revocation; committed
  revocation denies subsequent requests. No instantaneous session cancellation
  claim; the isolated concurrency schedules passed, with provider behavior pending.
- Keep the shared course draft if one author is deleted; null its updater
  attribution and cascade that user's assignment/request/event records. This is
  a bounded development behavior, not the final production audit-retention policy.

## Consequences and limits

Teachers assigned to the same course collaborate on its working draft and see its
teaching answers. This grants no learner records, results, private reflections,
class access, review approval or publication. The source introduces no seeded
assignment, grant-management endpoint, new course creation or administrator role.
Course scope is the implementation default for this bounded foundation; broader
organization/class scopes and delegation require their own agreement.

Private saved-request payload binding enables exact reconciliation but needs a
retention/storage policy before production. The save-event record is minimal and
cannot be supplied by a client as a successful outcome. Failure diagnostics and
audit readership remain separate.

No fixture migration or implicit import of the existing development edition is
performed. Connected staff sign-in/editor wiring, immutable review snapshots,
atomic course publication, media and classes/reporting follow separate increments.
The current dashboard remains the existing session-only prototype.

## Verification

See [backend contract and checks](../../supabase/staff-course-drafts.md) for the
actual review status. Permission/behavior test source does not establish passing
tests. No hosted DDL, real staff grants, draft writes, builds, typecheck or runtime
checks are authorized or claimed by the existence of this decision record.
