# Connected course-library contract — review draft

Prepared 21 October 2026 for owner review alongside the [first-course blueprint](first-course-blueprint.md).
This is the next planning deliverable, not an accepted release policy or an implemented service.
The owner's instruction to proceed authorizes this draft; it does not accept every proposed default below.
Read with the [backend decision register](backend-contract-proposal.md), [real-world scenarios](course-model-research.md) and [auth flow](auth-onboarding-flow.md).

## Scope and established rules

V1 connects public discovery and course details, verified direct joining and authorized curriculum/lesson reads.
Registration, verification, viewing details and recovery never enroll a learner. Classes still require invitations;
course joining establishes neither class membership nor staff authority. Automatic knowledge-check feedback is confirmed,
but trusted attempts, completion, retries, scoring and progress synchronization are a separate B1-08 implementation gate.
Existing guest sample learning remains available independently.

Current source has identity/profile/preferences integration and a device-only sample course. It has no connected
catalog, enrollment, content-access or publication service. Teacher/admin prototypes are not authoritative records.
This increment defines no SQL, deployed configuration, final API paths, staff grants or content import.

## Recommended defaults requiring review

These recommendations refine B1-07 and ID-07; they remain proposals until explicitly accepted.

| Question | Recommended V1 behavior |
| --- | --- |
| What does a learner join? | A stable course identity with one immutable published edition, called a `release` in the backend proposal. Pin enrollment to that release. Later edits publish another release; an explicit future migration policy governs moving existing learners. |
| What if the offering changes while details are open? | Details supply an offering revision. A new Join submits that reviewed revision. If the offered release or admission terms changed, return `course_changed`, refresh details and require another explicit Join. Never silently join an unseen edition. |
| What if Join repeats or its response is lost? | Keep one current enrollment per authenticated actor/course. Concurrent requests and retries reconcile to the same enrollment ID and pinned release. A revoked enrollment returns `access_revoked`; Join never reactivates it. |
| Does a pinned edition guarantee permanent access? | No. Every content read checks current release availability and current enrollment state. Withdrawal blocks reads even when content was previously displayed; the UI must not promise permanent access. Offline retention and in-flight submissions need B1-07/09 decisions. |
| Are visibility and access the same? | No. Unlisted means absent from discovery but directly discoverable by its public ID. Closing new joins blocks new enrollment while existing active learners retain available pinned content. Withdrawing a release blocks its content. Revoking enrollment blocks that learner. These states are independent. |
| Who can publish or change these states? | No new authority is assigned here. Content owner, reviewer, rights and permitted publisher require B1-04; staff capabilities, bootstrap and audit access require B1-06 before staff operations. |

A new default release must be available before it can be offered. Publishing, replacing or withdrawing it must
never expose a partial curriculum. Safety/rights corrections to an old edition need an explicit withdrawal/replacement
policy; immutable history does not force continued distribution. Classes and their assignment rules remain separate.

## Public projection

Expose a deliberate public projection of published offerings, separate from private enrollments and authoring records.
Public details may include a curriculum outline; lesson bodies remain behind authorized content reads.

| Field | Meaning and source |
| --- | --- |
| Course ID, title, summary | Stable identity and reviewed public copy. Never derive connected records from mobile or teacher fixtures. |
| Offered release ID, offering revision | Exact available edition and reviewed admission revision; returned for Join reconciliation. |
| Topics, supported learning goals | Authored identifiers with readable labels. Unknown metadata is empty; do not infer theological expertise from a title. |
| Outcomes | Reviewed statements of what a learner can understand or practice. Unknown outcomes are omitted, not generated as facts. |
| Audience, language, level | Authored audience and content language. Level is nullable; unspecified must not become “beginner.” Familiarity answers are preferences, not qualifications. |
| Time estimate and basis | Nullable minutes plus explicit basis such as estimated reading or estimated full study. State included activities. Unknown full effort remains unknown; do not relabel reading time as total study time. |
| Module/lesson counts, outline | Derived from the offered immutable release and its exact ordered references. No fabricated counts; duplicate placement/reuse rules need agreement before publication. |
| Discovery and joining state | Whether listed and whether new joins are open; withdrawn content is unavailable. Do not disclose private staff notes or withdrawal reasons. |

The bundled sample currently has two modules/four lessons and 26 minutes summed from authored lesson estimates;
its overview calls that reading time. Reflection and quiz effort have not been measured. It has no authoritative
connected course-level goals or level. Publication metadata must be reviewed rather than copied or embellished.

## Optional preferences and recommendations

Use only available public offerings and optional saved answers: intention, topics, familiarity and preferred session time.
Explain a match using actual metadata, for example “Includes prayer studies” when the published topics support it.
Ignore missing answers and missing metadata; skipped onboarding keeps the whole available library usable.
No faith score, invented percentage fit, proficiency claim or inferred completion history. Preferences never grant access.
Time-fit suggestions need a lesson estimate with a known basis and a clear label; a course total cannot establish
that each lesson fits a session. Familiarity influences ranking only when an authored level mapping supports it.
Use deterministic ordering with stable authored order as a tie-breaker; show ordinary discovery when no match is supported.

## Conceptual operations and actor boundary

These names describe behavior, not committed HTTP routes, client query paths or a new framework.
Trusted operations derive the actor from the validated session, never caller-supplied learner IDs or editable profile fields.

| Operation | Request and acknowledged result |
| --- | --- |
| List public offerings | Public filters/cursor → listed available public projections; empty and failed loading are distinct. No private enrollment/progress join in the public response. |
| Read public details | Public course ID → current projection/revision, or unavailable. An unlisted course can have public details; a private/draft course cannot be enumerated through this operation. |
| Read my enrollment | Validated actor and course ID → own active/revoked record or no enrollment. No record is different from an unknown/failed read. |
| Join course | Verified actor, course ID and reviewed offering revision → `joined` or `already_joined`, same enrollment ID and pinned release. Typed failures include `verification_required`, `course_changed`, `unavailable`, `access_revoked`, `session_required` and temporary failure. |
| Read enrolled curriculum | Verified actor and enrollment context → authorized pinned release outline, or access/publication/session failure. Check current enrollment and release availability on every read. |
| Open lesson | Verified actor, enrollment/course/release/lesson context → exact authorized lesson version. Enforce lesson membership in that release in the content query itself; possession of a lesson ID or a separate successful preflight is insufficient. |

An existing active enrollment is reconciled before considering a new Join: do not replace its release when the offered
revision changes, and do not block its still-available content merely because new joins closed. Revocation wins.
The private enrollment contains stable ID, actor ID, course ID, pinned release, state and authoritative timestamps;
its learner-facing projection contains only that actor's necessary fields. Public responses contain no enrollment list.
Unknown Join outcomes reconcile against the same actor/course; do not create a replacement key or presume failure.
Bind requests to the initiating session and discard their UI/cache results after account change or sign-out.
Failures carry safe copy and retryability; raw provider details, private identifiers and secrets stay out of learner messages.

Authorized lesson content excludes answer keys and scoring rules that reveal correct options before submission.
The separate trusted assessment operation returns the confirmed checked-answer/explanation feedback after accepted
submission. Do not add client scoring, fabricate attempts or treat opening a lesson as completion to finish this slice.

## Auth return and sample isolation

Reuse proposed ID-07: one pending public course intent per installation, expiring after 24 hours, holding only
public course ID, intended Join/Start action and creation time. No arbitrary redirect or proof/token in normal navigation.
Clear on cancel, sign-out, account switch or expiry; retain through ordinary same-account authentication continuation.
Return to refreshed details and recheck verification/current availability before an explicit Join/Start.
Email confirmation and recovery links never enroll automatically; optional profile questions remain skippable.

The first-course blueprint is a review candidate. No sample import is approved. If approved later, create explicit
connected identifiers and reviewed publication data; do not treat guest lesson IDs as existing server records.
Keep sample storage and connected caches separate. A failed connected read must never silently fall back to sample
content, progress or history. No automatic transfer, merge or cross-course credit from shared lesson identities.

## Acceptance scenarios for the implementation slice

1. A guest opens listed details and an unlisted direct link without receiving lesson bodies, drafts, answer keys or private records. Unknown/private IDs return safe unavailable results.
2. An unverified learner chooses Join, verifies and returns to refreshed details; enrollment exists only after explicit Join. Skipping the learning profile does not block this flow.
3. The offered edition changes between details and a new Join: `course_changed` creates no enrollment and presents the new details for review.
4. Two taps, concurrent devices or a timed-out Join reconcile to one actor/course enrollment and the same pinned release; no false success or duplicate records.
5. A learner keeps edition A when B is offered. Closing new joins preserves active access to available A; withdrawing A or revoking enrollment blocks reads. Retrying Join does not reactivate access.
6. A guessed lesson ID, another course's lesson or another learner's enrollment cannot retrieve content. A withdrawn release fails in the content read itself despite an earlier successful check.
7. An account switch during Join/read cannot show the prior actor's result to the new actor. Guest progress remains separate; failed connected loading shows a real failure and no sample fallback.
8. With skipped answers or missing metadata, discovery makes no unsupported match/level/time claims. Accepted quiz feedback remains separate from public content and from unapproved completion/reporting policy.

## Ordered implementation gates

1. Review the blueprint and accept/revise B1-07 defaults and ID-07; identify content owner/reviewer/publisher and rights under B1-04. No production publication before these decisions.
2. Prepare reviewed publication data and the minimal public projection/access boundaries; then feature-owned source adapters and truthful list/details/empty/error states. Screens and routes never call storage/backend clients directly.
3. Implement trusted verified/idempotent Join and own-enrollment reads, including stale offering, revocation, actor change and uncertain-response reconciliation. Add safe auth return after ID-07 agreement.
4. Connect curriculum/lesson reads only with enforced current release/enrollment/membership authorization. Enable Start only when this real path exists; no route into fixtures masquerading as enrolled content.
5. Schedule trusted submissions/progress as the following slice after B1-07/08/09 policies; class invitations and staff publishing stay gated by their separate authority decisions. Owner runs runtime/tests/build checks unless explicitly delegated.

Verification for this deliverable: repository/source and document review only. No schema, services, imports,
tests, builds, runtime or native checks were performed; acceptance scenarios are future checks, not passing results.
