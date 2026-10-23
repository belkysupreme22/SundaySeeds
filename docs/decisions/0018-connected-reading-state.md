# 0018 — Account reading place and lesson bookmarks

23 October 2026. Implementation follows the owner's next-step instruction; runtime
and native acceptance remain pending.

Reading place and lesson bookmarks are separate from quiz completion and sample
storage. Store them against the learner's exact enrollment, joined release and
lesson. A reading place uses an authored section ID, never a list index, scroll
percentage, inferred reading time or completion flag. All existing connected text
remains visible. A section action explicitly chooses the return location; a
lesson-wide bookmark is a separate action. This increment identifies a saved
section; it does not automatically scroll or introduce a consolidated bookmark list.

Private storage has independent position and bookmark revisions. Trusted RPCs
validate the live verified actor/session, active enrollment, pinned release and
real lesson/section membership before reading or writing. Revoked/withdrawn access
also blocks same-value retries. Only the changed field advances its revision; an
already-current desired value is acknowledged without another update. A stale
revision with a different desired value returns a conflict instead of overwriting
another device's change. No client clock or silent last-write-wins merge is used.

The mobile adapter pins the initiating account's token and validates response
actor/enrollment/course/release/lesson/section identities. Hooks fence route, focus,
account generation and request sequence before sending follow-up requests or
publishing results. A save is shown as confirmed only after acknowledgement. While
an unknown or failed save is pending, retain its exact target/revision for explicit
retry and label previous data as last confirmed. Conflict requires an explicit load
of saved state and another user choice; no automatic revision replacement/retry.

There is no background/offline write queue or durable pending-intent journal for
reading/bookmarks. Leaving/restarting the reader reconciles through an authorized
GET; an unacknowledged selection may need to be chosen again. A successful saved
state belongs to the account and can be loaded on another device. Sample reset
must not clear it, and sample progress/bookmarks are never uploaded or merged.

Cross-device incomplete quiz discovery, consolidated account dashboards/bookmark
lists, automatic scroll resume, content caching, retention/export and staff views
remain separate increments. Previous quiz/mobile acceptance remains pending and is
not implied by this implementation.
