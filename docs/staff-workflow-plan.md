# Connected staff workflow

Updated 28 October 2026. Status: staged implementation. The owner confirmed that
teachers draft and admins review/publish. The remaining authority and lifecycle
rules below are proposals, not active permissions. See
[decision0019](decisions/0019-staff-review-and-publication.md).

S1/S2 backend foundation now exists under
[decision0020](decisions/0020-scoped-staff-course-drafts.md): assigned-course
authority and draft List/Get/Save with revisions and exact-request recovery.
See the [backend contract](../supabase/staff-course-drafts.md). The migration is
applied to development after 203 hosted assertions and 11 local concurrency groups
passed; installed grants/advisors were inspected. See the
[verification record](../supabase/staff-draft-verification.md). No real assignments
or staff UI connection are established. Next staff sign-in/editor wiring; owner
acceptance, trusted bootstrap and admin review/publication remain separate gates.

## Delivery order

The first connected staff result should be an authorized teacher saving a course
draft, reloading it after sign-in and seeing the same acknowledged revision.
Admin review/publication follows as a separate increment. This avoids connecting
the existing simulated Publish buttons before trusted staff authority exists.

Planning and source preparation can advance while the owner checks the mobile
[quiz journey](connected-quiz-acceptance.md) and
[reading state](connected-reading-acceptance.md). Those checks remain open; fix
reported findings before calling the combined learner/staff journey accepted.

| Increment | Deliverable | Evidence needed |
| --- | --- | --- |
| S1 — authority foundation | Verified staff session; server-owned course assignments and finite capabilities; own authorized workspace response | Cross-actor/scope denial, revoked grant and deleted-session denial; reviewed bootstrap procedure before any actual grant |
| S2 — durable authoring | Course draft read/save with expected revision; acknowledged saved state; recoverable conflict; actual mutation audit | Save/reload, concurrent editors, lost response and account switch; fixtures stay separate |
| S3 — admin review | Submit one fixed course revision, inspect complete learner preview, return for changes with a reason | Submitted content cannot drift during review; changed content needs a new submission; teacher cannot approve/publish |
| S4 — publication | Admin publishes exactly the reviewed revision as one complete immutable edition | All-or-nothing metadata/readings/checks, duplicate-request reconciliation, concurrency, old enrollments and new Join behavior |
| S5 — later operations | Class invitations, pinned assignments, permitted reports, broader grant administration and lifecycle controls | Separate owner policies and genuine class/result/audit access checks |

Each backend, teacher UI and admin UI increment gets a separate commit. The
dashboard remains a session-only prototype until its matching adapter and trusted
operation exist. No prototype fixture becomes a real course, grant or audit event.

## Existing screens and integration gaps

| Existing source | Reuse | Required connected change |
| --- | --- | --- |
| Teacher Courses and editorial studio | Course brief, ordered modules, lesson links, explicit saves, unsaved-change handling | Stable server IDs, scope, acknowledged revision and durable draft data |
| Lesson/quiz editor and preview | Structured sections, outcomes, single-answer questions, explanations | Complete the published reading fields and validate a deliberate authoring-to-release conversion |
| Lesson publication simulation | Preview/readiness interaction patterns | Replace connected actions with Submit for review; admin publishes a complete course edition |
| Course review | Complete outline and linked lesson inspection | Review exact saved content and server validation; no partially published course |
| Admin Access | Scoped assignment review and revocation presentation | New explicit course authority contract; current organization/class proposals are not real grants |
| Classes, Reports, Audit & operations | Later UI patterns | Real membership/release/result bindings and authoritative events; existing examples remain isolated |

The shell's Teacher/Admin switch in `apps/teacher-web/src/App.tsx` is a review
control. Connected navigation must derive permitted workspaces from the server.
Entering an admin URL or choosing a workspace cannot grant authority.

## Proposed minimum authority

Start with course scope because courses already exist in the connected model.
Do not invent organizations or class scopes to connect the first authoring flow.
A staff identity can also be a learner, but staff access never creates enrollment,
class membership or learner progress.

| Capability | Proposed holder and scope | Boundary |
| --- | --- | --- |
| Read/edit draft; submit for review | Teacher explicitly assigned to a course | No self-assignment, publication, roster or result access |
| Read review; return changes; publish | Admin explicitly authorized for that course | No implied grant management, private reflection or learner-result access |
| Provision/revoke staff assignments | Separately authorized administrator | Bootstrap, delegation, recovery and last-admin rules require owner agreement |
| Read operational audit | Separately authorized reader | Publication authority does not automatically expose all audit or learner records |

These are operation groups for review, not finalized role names or enum values.
The prototype's `content.prepare`, organization/class scopes and role labels must
not be automatically converted into them. For S1/S2, provision only the approved
development course assignment through an explicit trusted procedure; a public
role editor and general course creation can wait.

Trusted operations derive the verified actor and live session from the request and
check current database grants. Never authorize from a display name, editable
`user_metadata`, workspace choice or client-provided user/role. Token claims alone
cannot provide immediate grant revocation. Pin the initiating session in adapters
and discard stale results after an account, token, focus or resource change.

Prefer narrow RPCs over direct draft/grant table access, using the existing public
invoker/private checked-operation pattern where privileged access is necessary.
Private tables have RLS and revoked client access; helpers get explicit execution
permissions and empty search paths. Frontends receive only public configuration
and the signed-in user's token. Supabase project/team roles and application staff
grants are separate systems.

## Draft and review contract

Propose a course aggregate with server-owned course ID, draft revision, metadata,
ordered modules and stable linked lesson/question/option IDs. Save the aggregate
with one expected revision initially; granular collaborative editing can follow a
demonstrated need. Shared lesson edits must not silently change another course's
submitted review: the review stores its own complete snapshot.

Drafts may be incomplete. Saving is not publication readiness. An acknowledged
save returns the server revision; a stale revision preserves the editor's input
and offers reload/review rather than overwriting another editor. A save has an
actor-scoped request key and payload binding so a lost response can reconcile the
same change. Different content under that key is rejected. Do not rotate the key
solely because a request timed out, or show an uncertain response as Saved.

Submission captures a complete immutable review snapshot, its source revision,
author and server time. Admin sees that snapshot, validation findings and a learner
preview from the same data. Return for changes retains the reviewed snapshot and
reason; resubmission creates a new review. Editing a working draft cannot alter a
pending review. The publication action identifies the exact approved review;
approval of an older review never silently approves newer draft content.

Proposed operation boundaries (names are not deployed RPCs):

| Operation | Reviewed input | Acknowledgement |
| --- | --- | --- |
| Load staff workspace/draft | Current session, course ID | Current permitted actions and exact draft/revision, or denied/unavailable |
| Save draft | Course ID, expected revision, request key, draft content | Saved revision/request receipt, validation, conflict or uncertain outcome |
| Submit review | Course ID, expected revision, request key | Fixed review ID/source revision and validation findings |
| Return for changes | Review ID, expected review state, reason, request key | Acknowledged review decision; no learner content change |
| Publish reviewed edition | Review ID, expected review/offering state, request key | Immutable edition ID/number and publication receipt, or no committed publication |

Successful staff mutations append minimal actual events in the same transaction:
actor, operation, resource, revision/review/release reference, server time and
request reference. Do not log passwords, tokens, full answer keys or private learner
reflections. Denied/failed calls are not successful audit events; diagnostics need
a separate redacted path because transaction rollback also rolls back inserts.
Audit readership, retention and account deletion effects remain decisions.

## Authoring-to-release mapping

The current teacher `LessonDraft` is not the published learner body. A connected
editor needs explicit fields and server validation; do not fill teaching gaps with
fabricated text or generate content from prototype examples.

| Current draft shape | Connected release requirement |
| --- | --- |
| Course title/summary/audience/outcomes | Also topics, learning goals, language, nullable level and estimate/basis; required versus optional values follow the published schema |
| Lesson title, Scripture reference, sections | Also subtitle, introduction, positive reading estimate and memory-verse text/reference |
| Outcome strings | Authored outcome title/description pairs; do not duplicate strings as invented descriptions |
| Standalone reflection | Current reading body has no reflection field; agree explicit representation before connecting it; do not silently drop authored material |
| Temporary image/data URL | Current learner reading contract has no cover media; agree storage/rights/access before enabling connected upload/publication |
| Optional quiz | Current connected assessment requires one nonempty knowledge check for every lesson; incomplete drafts may save, but cannot publish under that contract |
| Counter-based prototype IDs | Stable server-owned course/draft identities and validated stable content IDs; do not import fixture IDs as authoritative records |

The existing quiz editor's limits (up to ten questions, two to four options) are
stricter than the database's limits (up to 100 questions, two to ten options).
Keep any tighter product limits explicit and enforce them at publication too.
Reading-only lessons need a separately agreed completion policy before release;
they are not enabled by the prototype's optional-quiz control.

## Atomic publication and learner continuity

Proposed publication sequence, subject to implementation/permission checks:

1. Recheck current admin authority, review state, complete content/rights review
   and the exact request key/payload. Allocate an edition number under course
   serialization; clients cannot choose a conflicting edition number.
2. Insert a new unavailable immutable course release, all exact outline readings
   and one complete sealed assessment set in the same transaction. Reuse deployed
   validators; reject missing, duplicate, extra or mismatched content IDs.
3. Verify outline/body titles, Scripture and estimates agree; every required
   lesson has its check, valid choices, one answer and an explanation. Ensure
   public metadata contains no lesson bodies, answer keys or review notes.
4. Record publication provenance and acknowledgement atomically. Public promotion,
   listing and opening joins are explicit reviewed choices; publication alone
   must not silently open enrollment. If promoted, use the expected offering
   revision, explicitly activate the complete release's availability and only
   point the offering to fully ready content in that transaction. A staged
   unavailable release is not learner-accessible publication.
5. Any failure rolls back the entire change. A repeated request returns its
   acknowledged receipt without creating another edition, while current authority
   still controls access to private review data.

Publishing edition B preserves existing enrollments, attempts, scores, reading
places and bookmarks on edition A. New learners join the currently offered ready
edition. No automatic transfer or credit copying is introduced. Content corrections
also create a new edition; emergency withdrawal is a separate privileged operation
whose authority, reason and restoration policy must be agreed before enabling it.

Before S4, document the complete lock graph across grants/revocation, review,
course, release, offering, enrollment and attempts. In particular, acquire needed
release locks before offering mutation, matching existing reading/assessment
guards; avoid a new release-to-enrollment inversion against learner operations.
Serialize grant revocation with authorized writes. Verify both commit orders and
whole-transaction retry for deadlock/serialization failures using the same request
key. Existing source review does not establish concurrency acceptance.

## Remaining decisions and release gates

| Item | Current state | Needed before |
| --- | --- | --- |
| Teacher drafts; admin reviews/publishes | Confirmed by owner, 24 October | Recorded in decision0019 |
| First development staff identities and bootstrap/recovery owner | Unnamed | Actual staff grants or connected staff access |
| Course-scoped assignments; grant issuer/delegation and protected admin rules | Proposed above | S1 implementation/grant activation |
| Staff sign-in/session policy, callback origin and production MFA requirement | Pending | Connected sign-in configuration and privileged production access |
| Named teaching/rights reviewer and publisher; can one person hold both roles? | Pending | Actual content approval/publication; no invented approvals |
| One knowledge check per released lesson | Existing connected constraint; broader authoring policy pending | S4 or a separately approved reading-only contract |
| Promote/list/open joins; withdraw/restore; audit readers/retention | Proposed explicit separation; authority pending | Corresponding mutations/reads |
| Organizations/classes/invitations/results/media | Separate later contracts | S5 and connected media |

The first implementation target is S1/S2 source preparation for a scoped durable
draft, with the authority policy reviewed before enabling it. Do not create a real
staff user/grant, deploy privileged APIs or publish content just because this plan
exists. Existing learner acceptance and broader production readiness stay open.

Actual verification for this planning increment: repository/source inspection,
independent prototype inventory and independent contract review against the
existing reading/offering/assessment validators; no blocking finding. No app changes,
schema changes, grants, content imports, tests, builds or runtime/native checks.

Official guidance reviewed 24 October: [database function security](https://supabase.com/docs/guides/database/functions),
[RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)
and [sessions](https://supabase.com/docs/guides/auth/sessions). These support the
technical boundaries, not the proposed product permissions. The
[changelog](https://supabase.com/changelog) and relevant
[PostgreSQL17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
and [HTTP TLS](https://supabase.com/changelog/cbc-tls-ciphers-deprecated) notices were
reviewed; this document introduces no extension or client transport change and
does not certify device compatibility.
