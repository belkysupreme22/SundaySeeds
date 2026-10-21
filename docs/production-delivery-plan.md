# Production delivery checkpoint: 21–28 October 2026

Status: delivery plan, not a readiness certification. The owner wants approximately 80% overall completion by next week, across mobile and teacher/admin. Use **28 October** as the checkpoint. The earlier roughly 35% overall estimate was qualitative; there is no weighted, estimated backlog from which to calculate a defensible new percentage. Do not report planning, source implementation or prototype screens as verified production workflows.

## 21 October update

Owner accepted the existing course for development, keeping joined editions and
all-four-checks completion with retries/explanations, no pass mark and optional
private reflection (decision0014). These three choices in the review list below
are now confirmed; the remaining rules and named roles still need resolution.
The additive catalog foundation and metadata-only development import are applied;
Join, lesson bodies and account progress remain unimplemented. This advances the
catalog portion of the 22 October target, not the full enrollment/access batch.

## Outcome and scope

Prioritize one connected development workflow: an authorized teacher saves and publishes a reviewed course; a verified learner joins, studies and submits a knowledge check; progress survives another device; the teacher sees only the permitted class-level learning results. Admin must be able to provision/revoke the required scoped authority with an audit trail. This is the first meaningful production-oriented milestone, not the whole product.

The dependency order is content/access rules → publication and enrollment → trusted attempts/progress → scoped classes/reporting. Backend boundaries and owner decisions are shared dependencies, so adding UI lanes alone cannot compress the whole schedule. Dates below are targets conditional on those decisions and verification, not a promise of 80% readiness. If scope or checks slip, report the unfinished workflow rather than changing the denominator.

## Starting evidence

| Area | What exists | What is still missing for this milestone |
| --- | --- | --- |
| Mobile | Sample course/lesson/quiz journey; development email identity, own profile and optional learning preferences; owner-reported identity and onboarding review | Connected catalog, enrollment, authorized lesson content, trusted quiz submissions, cross-device learning progress and recovery cases |
| Teacher web | Session-only authoring, curriculum, publication, class/invitation and report prototypes | Staff sign-in/authority, durable drafts, reviewed release publishing, real classes/invitations and authorized results |
| Admin web | Session-only people/access/settings/audit prototypes | Trusted scoped grants/revocation, bootstrap/recovery, actual permitted directory/audit reads and operations |
| Backend/operations | Development profile/preferences definitions applied; Auth happy paths reported by owner | Course/class/staff services and permission verification; public email sender/HTTPS callbacks, deployment, lifecycle/backup policy and release checks |

Current prototypes remain useful design assets. They do not establish saved cloud data, publication authority or production analytics. Mailtrap captured-mail development is not public email delivery. No blanket migration push until the manually applied foundation's history is reconciled.

## Target batches and acceptance evidence

Each backend, mobile, teacher and admin unit gets a separate bounded commit. Internal agents can work on independent files after the shared contract is fixed; one lead integrates. Owner-run tests/builds/runtime checks remain the agreement unless explicitly delegated.

| Target | Delivery batch | Evidence needed before calling it complete |
| --- | --- | --- |
| 21 Oct | Reviewable first-course blueprint and focused catalog/access contract; resolve the short decision list below | Concrete content outline and recommended defaults reviewed; record actual decisions, with unresolved items visible |
| 22 Oct | Additive course/release/enrollment schema and access operations; mobile public catalog/details adapter | Applied migration recorded separately from source; owner verifies anonymous/private boundaries, own enrollment and stale/repeated Join cases from the contract |
| 23 Oct | Verified Join, authorized curriculum/lesson reads and safe return through authentication | Owner completes guest → verification → explicit Join → real lesson; two actors, revoked/withdrawn access and lost-response retry do not leak or duplicate data |
| 24 Oct | Minimal staff authority and durable teacher authoring/publishing against the same release contract | Authorized teacher saves/reloads a draft and publishes one reviewed edition; unauthorized actors cannot write/publish; mobile sees the published edition, not fixtures |
| 25 Oct | Trusted quiz submission and account progress; explicit completion policy | Server checks edition/lesson access and answers; retry is idempotent; another device resumes actual progress; sample history stays separate |
| 26 Oct | Invitation-only class membership, teacher-scoped results and minimum admin grants/revocation/audit | Invited learner joins intended class only; teacher sees permitted members/results only; revocation takes effect and auditable actions are actual records |
| 27 Oct | Consolidated error/copy/loading polish and operating/deployment preparation | Clear handling of same-password, expired links, offline/failed reads and uncertain writes; sender/callback/deployment gaps are either resolved or explicitly open |
| 28 Oct | Owner acceptance and readiness review across mobile, teacher and admin | Record actual platforms/devices/build/security checks, failures and unresolved release gates; reassess the same full scope with evidence |

This is an aggressive sequence with almost no contingency. A blocked batch does not prevent independent source work, but dependent publication or access must not be enabled using invented approvals or fixture data. Public metadata and empty/error UI can be prepared while content approval is pending; actual publication and staff access wait for their own decisions.

## Concrete recommendations for owner review

The [first-course blueprint](first-course-blueprint.md) and [course-library contract](course-library-contract.md) are the review artifacts, not abstract technical questions.

1. Use **Faith for everyday life** as an explicitly labelled connected development candidate, subject to named teaching/Scripture-rights review. This does not approve production publication or guest-progress import.
2. Recommend stable editions: joining edition A keeps that curriculum; edition B does not silently change completed work. Withdrawal still blocks content. Record correction, replacement and in-flight submission rules before those paths are enabled (B1-07).
3. Recommend this first course completes when all four knowledge checks have been finished, with retries, answer explanations and no pass mark. Reflection is optional/private; completion measures course activity, not faith growth (B1-08). Define retry/score/reporting semantics before trusted progress work.
4. Recommend returning from sign-in/verification to refreshed course details, then requiring an explicit Join. One public course intent expires after 24 hours and clears on account change/cancel/sign-out (ID-07).
5. Name the accountable content owner/reviewer/publisher and initial staff administrator. Agree staff recovery, permission scope and exactly which class results a teacher may see before implementing grants/reporting (B1-04/06).

Items 1–3 above are now accepted only to the extent recorded in decision0014; item 4, named roles and remaining policy details are still recommendations/unresolved. Public production publication also requires actual rights review; a deadline does not substitute for it. Media, deletion/export, retention/offline behavior and backup/recovery policies remain B1-09 work rather than silently assumed defaults.

## Tracking without inflated percentages

For each workflow record **source implemented**, **development deployed**, **owner verified** and **release-ready**, with a commit/migration or check result where applicable. A source-only feature can advance the first column without advancing the others. No percent is earned merely because a document or screen exists.

At the checkpoint, report mobile, teacher, admin and shared backend/operations separately, then the combined scope. If a percentage is needed, first estimate and weight the agreed remaining feature/verification backlog consistently; do not weight by screen count or average prototype polish with functional readiness. Keep classes, permissions, security, deployment and recovery in the denominator. Reaching the connected workflow is meaningful progress even if evidence does not support 80%.

## Checks and remaining scope

Next owner checks, when implementation exists: mobile catalog/details/Join/lesson/quiz/resume and account switching; teacher draft save/reload/publish and permitted class reports; admin grant/revoke/audit. Review narrow widths/larger text and native separately from browser. Negative actor/access tests, concurrent writes, failure recovery and migration permissions are required acceptance work, not implied by happy-path clicks.

Release work beyond the first workflow includes broader content operations, accessibility/native acceptance, production email and hosted callbacks, dependency/lint remediation, privacy/retention/export/deletion, backup/restore and operational monitoring/support. Schedule the two deferred lint issues for release readiness; no automatic dependency upgrades or new checks are authorized by this plan.

Verification of this planning increment: source/document consistency and whitespace review only. No tests, builds, typecheck/lint, database changes, imports or runtime/native checks. The plan establishes work order, not completion evidence.
