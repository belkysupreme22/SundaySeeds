# 0015 — Verified enrollment and edition-bound reading

Date: 21 October 2026. Status: implemented development architecture under the owner’s next-step instruction.

## Context

Catalog and first-course decisions are established in decision0014. The owner requested the next implementation step. Joining must create a real account-bound enrollment and open actual authorized reading, with no route into sample fixtures or invented progress.

## Implementation

- Seal enrollment and immutable reading content in the unexposed private schema. RLS and revoked direct grants prevent client table access. Use public invoker RPC wrappers and narrowly executable private definer operations, with empty search paths and explicit actor checks.
- Derive actor from the request, require trusted verified/nonanonymous/nonbanned Auth identity and a matching current Auth session. Ignore user-editable metadata for access. Pin the initiating JWT in client adapters and discard actor/session/focus-stale results.
- Keep one enrollment per actor/course and pin its release permanently. Reconcile existing membership before new offering checks; serialize competing joins. A stale reviewed offering requires refresh and an explicit new Join. Revocation cannot be undone by retrying Join.
- Open admission only when the complete immutable outline has matching real reading rows. Read each lesson through a query that checks current actor enrollment, release availability and exact lesson membership together. Delivered text cannot be recalled; later requests must recheck access.
- Keep current offered metadata separate from the learner’s pinned outline. A changed or closed offering does not silently move an active learner to another edition. An unavailable pinned edition returns no lesson body.
- Import the approved existing teaching text only for development, without quizzes/answers or guest history. Connected quiz submission, completion, reading position and bookmarks are not implemented by enrollment.

The implementation includes safe stale-offering/retry/revocation handling needed for this slice. It does not introduce staff authority, publication/correction/withdrawal operations, offline caching, edition transfer, new retention rules or teacher visibility. Those broader policies remain open.

## Auth navigation and verification

Persisted ID-07 course-return intent remains deferred. A guest can enter ordinary sign-in/registration/verification and manually return through Browse courses; none of these actions enrolls automatically. Verified Join remains a separate explicit action.

Application acknowledgements and source review are recorded in the database guide. Runtime, permission, concurrency and native acceptance remain with the owner. The older catalog’s administrative write lock-order concern must be resolved before staff publishing operations are connected.
