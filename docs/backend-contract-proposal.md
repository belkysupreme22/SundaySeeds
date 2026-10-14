# Backend contract proposal

Updated 14 October 2026. **Discussion draft; not an approved schema, API or permission implementation.** The owner selected adult learners, screen prototypes before a connected pilot, and backend planning in parallel. Administration means a system-wide super admin with evolving sub-admin roles. Supabase is planned, not configured or connected.

This document supplies a shared vocabulary for the learner app and teacher/admin proposals. It defines capabilities and data concepts rather than finished HTTP routes, SQL or a commitment to a separate API service. See [parallel delivery plan](parallel-delivery-plan.md) for task order and integration gates.

## Minimal entity relationships

| Concept | Relationship and proposed minimum responsibility |
| --- | --- |
| Auth identity and profile | An authenticated adult has a stable identity and display profile. Exact sign-in methods and whether any staff identity also learns remain decisions |
| Organization, class and membership | An organization contains classes; an identity has explicit class memberships. Membership records distinguish learner participation from assigned teacher responsibility and track active/revoked state |
| Scoped role grant | A staff identity receives an explicit capability set and scope from an authorized grantor. The system super-admin bootstrap and sub-admin grant/delegation rules must be agreed before implementation |
| Invitation | Refers to an intended class/membership and, if required, recipient identity. Expiry, redemption limits, revocation and grant authority are enforced by a trusted operation |
| Lesson and lesson version | A stable lesson has editable draft content and immutable published versions containing ordered sections, questions and scoring rules. Class availability points to an allowed published version |
| Quiz attempt and submitted answers | An attempt belongs to one authenticated learner and one published version; its submitted answers produce a trusted score and completion outcome. No synthetic attempts are created from sample summaries |
| Reading progress and bookmark | Per-learner records refer to lesson identity; reading position also identifies the applicable version/section. Completion derives from accepted attempts, not merely opening the last section |
| Audit event | Records agreed privileged actions with actor, action, target, outcome and authoritative time. Retention, readership and sensitive-field redaction remain to be defined |

Media ownership/access can be attached to lesson versions when images enter the pilot. Do not add unrelated profile, analytics or content entities before a concrete workflow requires them. Published content access and private draft access are separate permissions.

## Shared contract rules

- Use stable opaque identifiers; the authenticated principal comes from the validated session, never a client-supplied owner or role assertion.
- Responses distinguish available data, empty results and unavailable/error states. A transport success alone must not be interpreted as a durable mutation unless the operation acknowledges acceptance.
- Proposed failure vocabulary: `unauthenticated`, `forbidden`, `not_found`, `validation_failed`, `conflict`, `expired`, `rate_limited` and `temporarily_unavailable`. Define safe error details, retry guidance and a diagnostic identifier where appropriate; avoid leaking restricted resource existence.
- Server-controlled timestamps describe server events. Client times may be diagnostic input but cannot establish trusted completion or audit history.
- Reads return only authorized fields. Learner question payloads must not expose answer keys or explanations prematurely; the feedback-release policy is a pilot decision.
- List operations need explicit ordering and bounded pagination when the dataset warrants it. Empty pages are not an authorization failure.

## Capability proposals

| Consumer / capability | Request concepts | Response concepts and important failures |
| --- | --- | --- |
| Mobile: browse/open published lesson | Current session, class or visible collection, lesson/version identifier | Authorized lesson summary/content and version; empty collection, unavailable publication, lost membership or expired session |
| Mobile: save reading position/bookmark | Lesson/version, valid section or desired bookmark state, optional revision token | Acknowledged current state/revision; invalid section, stale version, lost access or temporary save failure |
| Mobile: submit quiz attempt | Published version, answers keyed by question, unique submission key | Accepted attempt ID, trusted score/completion and permitted feedback; incomplete/invalid answers, unavailable version, duplicate-key conflict, revoked access or uncertain network outcome |
| Mobile: read progress/results | Current session and authorized lesson scope | Genuine completion/best-score summaries; attempts only if that view is agreed. No results is distinct from a failed load |
| Teacher: create/update draft | Authorized destination scope, draft content, expected draft revision on update | Draft ID and new revision with validation details; forbidden destination, invalid content or concurrent-edit conflict |
| Teacher: preview/publish | Draft ID/revision and intended class visibility | Preview of the proposed version; on publish, acknowledged immutable version and availability. Reject stale draft, invalid quiz/content, missing rights/access or conflicting publication |
| Teacher: read class completion | Assigned class, permitted lesson/version scope, bounded paging | Authorized roster/result summary with explicit denominators; empty class, unavailable result or assignment revoked. No invented hours/streaks/history |
| Staff: issue/revoke invitation | Permitted class/membership, agreed recipient/expiry constraints | Invitation state and safe delivery/redeem information; invalid scope, expired/revoked invitation or insufficient grant authority |
| Mobile: redeem invitation | Validated session and invitation proof | Acknowledged membership or safe existing-member outcome; invalid, expired, revoked, exhausted or wrong-recipient invitation |
| Admin: manage roles/scopes | Target identity, explicit capability/scope, expected current grant revision | Authorized grant/revocation outcome and audit reference; delegation denied, invalid scope, stale grant or protected bootstrap-account rule |
| Admin: inspect system operations/audit | Explicit permitted view and bounded filters | Minimal operational records and permitted audit fields; unknown capability denied. System visibility does not imply unrestricted learner-answer access |

## Published versions and reliable submissions

1. Editing a published lesson creates a new draft/version; it does not mutate the version attached to an existing attempt. Validate question IDs, answer options, scoring rules and class visibility before publication.
2. The learner submits the version they actually saw. Decide whether an already-open older version remains submit-able after a replacement is published, and what unpublishing or membership revocation does to that submission.
3. The client creates one submission key per intentional attempt and reuses it when retrying an uncertain request. Scope uniqueness to the authenticated learner; bind the key to the version and normalized answer payload.
4. Repeating the same key/payload returns the original accepted outcome without creating a second attempt. Reusing a key with different content returns a conflict; a deliberate new attempt uses a new key.
5. A trusted transaction validates authorization/version/answers, computes the score, records the attempt and updates the derived progress outcome atomically. Proposed best score uses the maximum accepted score, including a real zero; confirm rules for retries and lesson-version changes.
6. The mobile UI distinguishes pending/uncertain submission from acknowledged completion. Preserve enough pending state to retry safely; reconciliation, expiry and supported offline behavior require an explicit policy before release.

The sample app currently completes a lesson after any fully finished quiz, with no passing threshold. Preserve that as a candidate rule for discussion, not an implicit production decision. Existing sample progress lacks complete answers/timestamps and cannot be converted into authentic attempt history.

## Proposed permission matrix

“Proposed” means a boundary to approve and enforce in database policies/trusted operations. UI visibility is not enforcement. Deny by default; test both authorized and forbidden cases before claiming readiness.

| Capability | Adult learner | Assigned teacher | System super admin | Scoped sub-admin |
| --- | --- | --- | --- | --- |
| Read published class content | Own active memberships | Assigned classes | Administrative scope to define | Denied until explicit capability/scope agreed |
| Read/edit private lesson drafts | Denied | Authorized assigned scope; draft ownership rule unresolved | Content administration capability to define | Denied until defined |
| Publish/unpublish | Denied | Proposed assigned scope, subject to curriculum authority | Publishing/override authority to define | Denied until defined |
| Submit an attempt/save progress | Own identity only | Only through a separately valid learner membership | No impersonated learner results | No impersonated learner results |
| Read learner results | Own results | Assigned-class summary; answer-level detail unresolved | Routine result access not assumed; purpose/scope unresolved | Denied until defined |
| Issue membership invitations | Denied unless a later self-service rule is agreed | Assigned scope only if grant authority approved | Grant authority/bootstrap policy to define | Denied until defined |
| Grant/revoke staff permissions | Denied | Denied unless explicit delegation is later approved | Proposed administrative responsibility; bootstrap/guardrails unresolved | Denied until explicit delegation limits agreed |
| Inspect privileged audit events | Denied | Denied unless a scoped need is approved | Proposed operational responsibility; fields/retention unresolved | Denied until defined |

Unknown sub-admin scopes must remain denied in production, even when the prototype displays example role-management controls. Never allow a client to choose elevated privileges. Privileged credentials belong only in a trusted environment, never in mobile or browser bundles.

## Decisions to resolve in order

1. **Pilot boundaries:** first organization/class, curriculum owner and who can invite/assign teachers; intended publication/class visibility and content/translation permissions.
2. **Administrative authority:** super-admin bootstrap and recovery; initial sub-admin capabilities/scopes; who may delegate/revoke them; guardrails for the last authorized administrator and audit access.
3. **Identity and membership:** configured sign-in/recovery methods for adults, membership approval/invitation rules, staff-as-learner support and session/account-switch behavior.
4. **Content and assessment:** publication/version lifecycle, old-version submissions, answer/explanation release timing, retry/completion rules and teacher result detail.
5. **Data lifecycle and reliability:** retention/export/deletion, revocation effects, cache isolation, sample-data transfer choice, acknowledged-save/offline behavior, backups and operational ownership.

Next deliverable: resolve decisions 1–3 and annotate this proposal with accepted boundaries before drafting migrations or production auth/role behavior. Teacher/admin layout feedback can proceed independently. No backend code, service configuration, permission tests or runtime validation accompanies this document; the owner retains tests/builds/runtime review unless explicitly delegated.
