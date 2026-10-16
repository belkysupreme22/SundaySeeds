# Backend contract proposal

**16 October — auth follow-up UI scope:** Verification and new-password screens are explicitly reachable previews of future states; every service action remains unavailable. [Auth onboarding flow](auth-onboarding-flow.md) records the paths and backend considerations. No delivery method, code/token format, password policy, callback contract or verified-access gate is chosen. The question of requiring email verification before course access is unanswered; B1-05b remains open.

**16 October provider UI request:** Owner requested Google and Apple options from the account reference. Both now exist as unavailable screen actions on mobile sign-in/sign-up. Email/password self-onboarding remains confirmed. Provider setup, callbacks, email collision/account linking, verification and recovery behavior remain undefined and unconfigured; adding buttons does not establish a working OAuth service.

Updated 16 October 2026. **Discussion draft; not an approved schema, API or permission implementation.** The owner selected adult learners, **self-onboarding with email and password**, screen prototypes before a connected pilot, and backend planning in parallel. Adults can register without a prior invitation. Administration means a system-wide super admin with evolving sub-admin roles. Supabase is planned, not configured or connected. Registration selection does not settle email verification, recovery, staff sign-in, class admission or invitation policy.

This document supplies a shared vocabulary for the learner app and teacher/admin proposals. It defines capabilities and data concepts rather than finished HTTP routes, SQL or a commitment to a separate API service. See [parallel delivery plan](parallel-delivery-plan.md) for task order and integration gates.

## Current implementation and contract boundary

Mobile email/password self-registration, sign-in and recovery now have reference-based screen prototypes reachable from Settings. They validate fields and show service-unavailable outcomes; no identity provider, verification/reset delivery, policy consent or session exists. The optional name field does not update the learner profile. B1-05b remains open and these screens do not constitute LMS-B3 implementation.

Teacher course/module authoring, structured lessons and automatic quizzes, preview/publication snapshots, class/enrollment examples and reports now have source prototypes. Administrator directory, scoped Access proposals, Settings and audit/operations examples also exist. Their state is session-only and does not establish real accounts, authorization, publication, invitations or audit history.

Mobile now groups four stable sample lesson IDs into one course with two modules. Home, Lessons, curriculum and quiz results derive a course journey from the existing lesson store. Quiz completion, reading position and best score remain distinct. The sample course is not a publication produced by the teacher workspace. A connected adapter must never treat either prototype's fixtures as authoritative records.

## Minimal entity relationships

| Concept | Relationship and proposed minimum responsibility |
| --- | --- |
| Auth identity and profile | An authenticated adult has a stable identity and display profile. Adults self-register with email and password (owner selected 16 October); verification/recovery, staff sign-in and staff-as-learner rules remain decisions. Self-registration does not establish class membership or a staff grant |
| Organization, class and membership | An organization contains classes; an identity has explicit class memberships. Membership records distinguish learner participation from assigned teacher responsibility and track active/revoked state |
| Scoped role grant | A staff identity receives an explicit capability set and scope from an authorized grantor. The system super-admin bootstrap and sub-admin grant/delegation rules must be agreed before implementation |
| Invitation | Refers to an intended class/membership and, if required, recipient identity. Expiry, redemption limits, revocation and grant authority are enforced by a trusted operation |
| Course, module and course release | Stable course/module identities organize ordered lesson references. Teacher authoring and a sample mobile curriculum exist. Proposed immutable course releases bind ordered modules to exact published lesson versions; class availability refers to a release, never a mutable draft. Release promotion, withdrawal and existing-learner rules remain decisions |
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
- Reads return only authorized fields. The owner confirmed automatic knowledge checks: show the correct answer and explanation after the learner checks a response, with no teacher review. Define the trusted feedback operation and version binding before connected work; initial question payloads need not expose unchecked answers. These are learning interactions, not proctored examinations.
- List operations need explicit ordering and bounded pagination when the dataset warrants it. Empty pages are not an authorization failure.

## Capability proposals

| Consumer / capability | Request concepts | Response concepts and important failures |
| --- | --- | --- |
| Adult: self-register | Email, password and agreed minimal profile fields through the configured identity service; no caller-selected privileged role | Safe registration/verification state and next step; validation, rate limiting or temporary failure. Account creation is separate from class admission and staff grants; exact verification, duplicate-account messaging and recovery behavior remain to be agreed |
| Mobile: browse/open course curriculum | Validated session, authorized class/collection and course release identifier | Ordered modules with exact lesson/version references and permitted lesson summaries; empty catalogue, unavailable release, lost access or failed load. No draft content or inaccessible lesson metadata |
| Mobile: browse/open published lesson | Current session, class or visible collection, lesson/version identifier | Authorized lesson summary/content and version; empty collection, unavailable publication, lost membership or expired session |
| Mobile: save reading position/bookmark | Lesson/version, valid section or desired bookmark state, optional revision token | Acknowledged current state/revision; invalid section, stale version, lost access or temporary save failure |
| Mobile: check a quiz answer | Authorized published version, question ID and selected choice | Automatic correct/incorrect feedback, correct answer and explanation for that version; invalid question/choice, revoked access or unavailable version. Checking one answer is not final attempt completion |
| Mobile: submit quiz attempt | Published version, answers keyed by question, unique submission key | Accepted attempt ID, trusted score/completion and permitted feedback; incomplete/invalid answers, unavailable version, duplicate-key conflict, revoked access or uncertain network outcome |
| Mobile: read progress/results | Current session and authorized lesson scope | Genuine completion/best-score summaries; attempts only if that view is agreed. No results is distinct from a failed load |
| Teacher: create/update draft | Authorized destination scope, draft content, expected draft revision on update | Draft ID and new revision with validation details; forbidden destination, invalid content or concurrent-edit conflict |
| Teacher: preview/publish | Draft ID/revision and intended class visibility | Preview of the proposed version; on publish, acknowledged immutable version and availability. Reject stale draft, invalid quiz/content, missing rights/access or conflicting publication |
| Teacher: publish course release | Course revision, ordered module/lesson references, reviewed lesson revisions and permitted destination | Atomic acknowledged release snapshot or conflict/validation error. No partly published course; publication is separate from making a release available to a class |
| Staff: assign/replace class course release | Authorized class, immutable release ID, expected assignment revision | Acknowledged assignment revision and explicit availability; reject withdrawn release, stale revision or unauthorized class. Existing learner/version handling requires an agreed policy |
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

## Course release and progress proposal

These are reviewable candidate rules, not production decisions:

1. A course draft contains ordered modules and lesson references. Preview identifies the exact draft revisions reviewed. Publishing verifies all referenced content, questions, media readiness and authority before committing one immutable release snapshot. Concurrent edits return a conflict; the client reviews the changed content instead of silently overwriting it.
2. A class-course assignment identifies a release. Reordering a draft does not reorder an assigned release. Adding/replacing a lesson produces another release; whether existing learners stay pinned or move is an owner decision. Withdrawal, revoked membership and in-flight attempts require explicit rules before enabling submissions.
3. Curriculum reads return release/module/lesson/section identifiers, not positional IDs derived from list indexes. Connected reading position is bound to the version and stable section ID; a missing section requires a visible restart/remap choice, never a silent index carryover.
4. Proposed lesson completion is an accepted, fully submitted automatic quiz without a passing threshold; retries are allowed and best score is the highest accepted score **within the same lesson version**, including zero. These mirror current learning intent but still need production agreement. An updated version must not inherit an old-version completion by accident.
5. Proposed course summary counts distinct required lesson-version references in the assigned release. Duplicated lesson placement must not inflate the denominator; publication should reject duplicate placement until reuse semantics are agreed. Empty releases cannot be published. A summary states its release ID, numerator/denominator and data availability; unknown progress is not a recorded zero. Required/optional lessons are not implemented and need an explicit rule if introduced.
6. Reading progress and bookmarks are not completion evidence. The current sample resume policy is started unfinished lessons in curriculum order, then first unfinished; no recency timestamp exists. Preserve that as a simple candidate without inventing last-activity history.
7. Existing `sundayseeds.learning.v1` data has no authenticated owner or published-version proof. Default proposal: keep it isolated as sample learning; do not import it into trusted attempts, class reports or audit events. Any future transfer is an explicit, owner-approved migration with clear limits, never an automatic account merge.

## Operations and integration boundaries

| Prototype action | Connected responsibility to agree and implement |
| --- | --- |
| Directory classifications and invitation examples | Profile labels do not grant access. Trusted memberships, invitation expiry/recipient/redemption and teacher assignment must be validated together; delivery failure is distinct from invitation creation |
| Role proposal and assignment-review snapshots | Saving a proposal must not activate grants. Trusted grant operations validate the grantor's current authority, reviewed revision and scope in one transaction. Editing a role does not silently broaden existing grants; revocation/history and concurrent last-admin protection need server rules |
| Settings defaults | New-form prefills are client preferences unless explicitly approved as durable scoped defaults. Help text/table density are not security policy. Policy changes cannot be smuggled through general Settings saves |
| Audit/service examples | Fictional fixtures never become audit records. Trusted operations produce redacted events with authoritative outcome/time and a diagnostic reference. A client cannot assert success, healthy services or restore completion; readership, retention and operational checks remain decisions |
| Automatic answer feedback | Knowledge checks provide correct answers/explanations without teacher review. Bind feedback and submission to the same immutable question version; do not trust a client-calculated score |
| Uncertain save or submission | Use acknowledged revisions and idempotent submission reconciliation. Never repeat an attempt with a new key solely because a response timed out. Session/account changes isolate caches and pending writes by authenticated identity |

No SQL, RLS policies, provider configuration, credentials, email delivery or network calls are introduced by this proposal. LMS-B2 must implement only the subset approved through the decision register below.

## Decision register for the connected pilot

| ID | State | Decision or concrete question | Blocks |
| --- | --- | --- | --- |
| B1-01 | Confirmed by owner | Adult learners; system-wide super admin and evolving sub-admin structure | Product scope established; capabilities remain open |
| B1-02 | Confirmed by owner, 16 October | Adult learner sign-in: email and password | Provider/verification/recovery configuration still pending |
| B1-03 | Confirmed by owner | Automatic knowledge checks with answers and explanations; no teacher marking | Feedback operation implementation |
| B1-04 | Owner decision required | First organization/class, curriculum owner, content/translation rights and permitted publisher/inviter | Real pilot data and content publication |
| B1-05a | Confirmed by owner, 16 October | Adult learner self-onboarding: create an account without an invitation using email/password. Class admission and staff grants are separate | Registration UI/contract direction established; no service configured |
| B1-05b | Owner decision required | Whether email verification is required before course access (question unanswered); verification/recovery method and destination; class discovery/admission or invitation rules; staff sign-in and staff-as-learner support | Remaining identity/enrollment workflow and connected implementation; follow-up UI previews do not settle these rules |
| B1-06 | Owner decision required | Super-admin bootstrap/backup/recovery, initial sub-admin capabilities/scopes, delegation and audit readers | Production grants/administrative authorization |
| B1-07 | Proposal above; not accepted | Immutable course releases, class assignment pinning, withdrawal/revocation and older in-flight attempts | Schema and publishing/learning services |
| B1-08 | Proposal above; not accepted | Completion without pass threshold, unlimited retries, version-bound best score and course denominator | Trusted attempts and reporting |
| B1-09 | Owner decision required | Media ownership/access, retention/deletion/export, backup owner and supported offline/retry behavior | Storage and release readiness |
| B1-10 | Proposed isolation; not accepted migration policy | Keep sample progress separate; determine whether any explicit transfer is wanted | Learner integration/account-switch behavior |

An agent may refine proposals and adapters' conceptual boundaries while these questions are open. It must not mark them accepted, invent pilot identities, configure production access or import fixtures. Record each owner answer here and propagate it to the implementation plan and ignored handoff.

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
3. **Identity and membership:** adult email/password self-registration is selected. Define verification/recovery, class admission, staff sign-in and account-switch rules before connected implementation. Do not require an invitation to create an adult learner account or infer class/staff access from registration.
4. **Content and assessment:** course/module hierarchy and publication/version lifecycle, old-version submissions, implementation of automatic checked-answer feedback, retry/completion rules and teacher result detail. Teacher review is not part of quiz completion.
5. **Data lifecycle and reliability:** retention/export/deletion, revocation effects, cache isolation, sample-data transfer choice, acknowledged-save/offline behavior, backups and operational ownership.

Next deliverable: resolve B1-04, B1-05b and B1-06, then agree the release/assessment/lifecycle subset before drafting migrations or production auth/role behavior. Email/password learner self-onboarding is confirmed; LMS-B1 as a whole remains open. Teacher/admin layout feedback and learner runtime/visual acceptance can proceed independently. No backend code, service configuration, permission tests or runtime validation accompanies this document; the owner retains tests/builds/runtime review unless explicitly delegated.
