# 0016 — Connected development assessment policy

Date: 23 October 2026. Status: owner choices accepted; implementation pending.

## Accepted choices

- Keep the highest accepted quiz score within the learner’s joined edition.
- Allow retries without a fixed attempt limit. Technical request throttling is separate from a learning attempt limit.
- Recheck current course access before accepting submission; withdrawn access blocks unfinished attempts. A draft is not recorded completion.
- Activate the first immutable set of four knowledge checks in the current development edition. Preserve its readings and lesson order. Later quiz changes require a new edition; do not move enrollment pins automatically.

These choices supplement decision0014: all four checks complete the course, retries and explanations are supported, no minimum score, reflection optional. This is a one-time additive development activation, not general permission to mutate published editions. No historical attempts or sample results may be manufactured.

## Implementation contract to deliver

Seal a complete assessment snapshot before enabling attempts. Bind every question, option, attempt and accepted completion to its exact enrolled edition and lesson. Keep correct-answer keys private; public discovery and initial question payloads must exclude them.

Start creates an own server-bound attempt with an actor-scoped idempotency key. Checking records the first accepted selection and returns teaching feedback. Repeating the same selection returns the same feedback; changing a checked answer requires a new attempt. Finish requires every question checked, scores on the server and records completion atomically. Retrying a committed submission returns its original receipt rather than recording another attempt.

Use the existing trusted actor/session and enrollment checks on question access, answer checking and Finish. A previously committed outcome remains historical; replaying its receipt must not grant renewed lesson or answer access after withdrawal. The precise redacted receipt shape remains part of implementation review.

Return this attempt and best lesson score; do not introduce a course-wide score or teacher reports. Course completion counts the four distinct required checks of the joined edition. Reading position and bookmarks remain independent of completion. Sample storage stays isolated and is never imported as trusted learning history.

## Delivery boundaries

1. Additive schema/private assessment snapshot and permission-test source; separate explicit development import/activation.
2. Trusted Start/Check/Finish and own progress projections, with idempotency and revocation/concurrency checks.
3. Mobile connected quiz flow and acknowledged progress, with actor fencing and uncertain-submission reconciliation.
4. Reading/bookmark synchronization as a separate bounded increment, including section identity and stale-write handling.

No database migration, content import, attempt, account progress, deployment or runtime verification is established by this decision. Production content rights, staff publication, retention/reporting, correction/transfer operations and native acceptance remain separate.
