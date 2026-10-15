# Parallel delivery plan

Updated 14 October 2026. This supplements [the implementation plan](implementation-plan.md) with independent workstreams and integration gates. Task IDs below are handoff identifiers, not a claim that their work has shipped.

## Confirmed direction

- The owner selected **screen prototypes before a connected pilot, alongside backend planning**. Learner design work continues in parallel.
- The owner has approved the teacher/admin prototype design direction and requested the core LMS expansion in [the LMS implementation plan](lms-implementation-plan.md). Quizzes are automatic knowledge checks with correct answers/explanations; teacher-reviewed assignments remain deferred. Prototype approval does not establish runtime or permission validation.
- Learners are **adults**. Parent-managed and child-account workflows are outside this plan.
- Administration means a **system-wide super admin with sub-admin roles**. Sub-admin responsibilities, scope and delegation rules are still to be defined; no universal sub-admin access is assumed.
- Supabase and a responsive React teacher dashboard remain the planned architecture. No backend service, authentication provider or production role system is currently connected.
- The owner selected **React + TypeScript** for the web screens. Teacher and admin share `apps/teacher-web`, using Vite, selected Radix primitives, Lucide and lazily loaded Recharts examples. The mobile app remains React Native + Expo + TypeScript.
- The supplied screenshots are the learner visual references. There is no supplied teacher or admin dashboard reference: the React screens are **design proposals for review**, adapting references 05/07/12 for palette, outlines, typography and spacing.
- Routine product copy should use plain feature names instead of repeating “local profile,” “local learning,” or storage implementation details. Preserve useful save-failure/reset explanations and honest sample labels; simplifying copy must not imply cloud sync or a production account.

## Workstream A — learner application

| ID | Work / deliverable | Dependency and completion target |
| --- | --- | --- |
| A0 — implemented | Correct Profile name/avatar alignment and compact summary tiles against reference-12; simplify repetitive storage copy across the app | Commit `cd00e19`. Real counts, unavailable states, shared input treatment and recovery retained. Owner visual acceptance pending |
| S2 / S2-F — implemented | Settings: full Account/App Settings/Support & About components, learning replay, light-gray outlines and Profile-active bottom navigation | Reference-12 right inspected. Existing editor/reset/recovery preserved; unavailable services/policies are explicitly identified in detail sheets. Owner runtime/visual acceptance pending |
| O1 | Welcome: finish three-page composition, imagery, cards, indicators and navigation | Reference-01. Preserve first-launch preference, replay and Skip/Back/Next/Get started |
| O2 | One optional minimal setup flow using the existing display name | References 02/04 are alternatives. Add topic preferences only if their effect is implemented; avoid unnecessary identity fields |
| A1 | Owner acceptance of completed learner designs | D1–D4, L1–L3, P1, S1–S2 and A0 are implemented, with runtime/visual acceptance pending. Include O1/O2 as they land |

## Workstream T — teacher dashboard

| ID | Work / deliverable | Dependency and completion target |
| --- | --- | --- |
| T0 — source implemented | React teacher proposal: `apps/teacher-web/src/features/teacher` | Overview/Lessons/Classes tabs, in-memory draft create/edit/preview and an optional chart example. No class records or publishing. Dependencies and runtime/visual review pending; layout is not yet an approved production reference |
| T1 | Confirm dashboard navigation, empty/loading/error states and content workflow from T0 | Owner design feedback plus agreed content/class boundaries. Record the approved proposal as the reference for subsequent implementation |
| T2 — authoring and publication simulation implemented | Extend the React shell and draft/preview editor after T1 | LMS-T1–T4 outlines, structured readings/covers, quizzes and simulated lesson versions exist. Classes/reporting and connected loading/error/data adapters remain; contract agreement precedes connected behavior |
| T3 | Connect draft validation, preview and publish to versioned content | Requires B2–B5 and permission evidence. Published edits must not rewrite the meaning of previous attempts |
| T4 | Connect assigned-class roster and genuine completion/results views | Requires membership scopes and B6. No fabricated production statistics or access to unassigned classes |

T0 can demonstrate a publishing interaction, but any such action is a clearly labelled prototype simulation. T3 is where durable, authorized publishing becomes real.

## Workstream M — system administration

| ID | Work / deliverable | Dependency and completion target |
| --- | --- | --- |
| M0 — source implemented | React admin proposal: `apps/teacher-web/src/features/admin` | Overview/People/Access tabs, empty directory filters, unsaved sub-admin scope proposal and optional chart example. No fabricated accounts or role grants. Dependencies and runtime/visual review pending |
| M1 | Define super-admin bootstrap, sub-admin capabilities and assignment scopes | Owner decision before production role grants. Specify allowed resources/actions, scope, grant/revoke authority and delegation limits |
| M2 | Approve admin layout and decide the production application boundary | Teacher/admin share a review shell under decision 0003. Use M0/T0 feedback and M1 to decide production routing/deployment; switching workspaces is not authorization |
| M3 | Implement scoped admin management and audit views | After B2/B3 permission boundaries and M1. Role changes require trusted authorization and an auditable outcome; client controls alone do not enforce access |
| M4 | Implement operational lifecycle actions selected for the pilot | Define suspension/revocation, content visibility and data-retention effects first; exclude unagreed destructive/bulk actions |

M0 is a design proposal, not a finalized permission model. “System-wide” does not by itself decide which learner records a particular sub-admin may inspect or alter.

## Workstream B — backend planning, then implementation

The following sequence separates documents that can be prepared now from service work that depends on accepted pilot decisions. The listed entities and contracts are proposals until agreed; no schema or endpoint exists merely because it appears here.

| ID | Deliverable | Gate / required decisions |
| --- | --- | --- |
| B0 | Pilot decision record: first organization/class, curriculum owner, teacher grant authority, adult account ownership, content/translation rights and operating responsibilities | Adults and system-wide admin are confirmed. Exact pilot, sub-admin scopes, configured sign-in methods and content rights remain open |
| B1 — draft ready | Contract proposal covering IDs, error states, pagination where needed, draft/published content, membership, progress and attempt submission | See [backend contract proposal](backend-contract-proposal.md). Naming and interaction requirements still require agreement; fields are not frozen |
| B2 — conceptual draft ready | Schema/migration and access-matrix proposal | Candidate entities and deny-by-default access matrix are documented in the contract proposal. Concrete schema/migrations await B0/M1; introduce only agreed pilot entities |
| B3 | Implement migrations, RLS and trusted privileged operations with permission checks | Requires B0/B2 and explicit start of connected implementation. Deny cross-class/learner access; teachers only assigned scope; no client-selected elevated roles or bundled privileged keys |
| B4 | Implement configured authentication, recovery/session states and invitation/join lifecycle | Use reference-03 for learner authentication after service configuration. Validate invitation target, expiry, revocation and use rules server-side; define shared-device/session-expiry behavior |
| B5 | Implement draft/preview/publish content and media access | Requires teacher/admin authority decisions and content rights. Pin published versions; define draft visibility, unpublishing and media ownership/limits |
| B6 | Implement trusted quiz submission, results, progress and bookmarks | Score on a trusted boundary, bind attempts to versions, prevent duplicate submission and define timestamp/completion/retry semantics. Do not accept arbitrary client scores |
| B7 | Integrate mobile/teacher/admin feature data adapters | Screens remain free of backend clients. Define server acknowledgement, offline/session failures, retry and account-switch cache isolation |
| B8 | Connected pilot readiness and actual-class trial | Owner-run access/integration/native checks, backup/recovery and operational handoff; then gather real learner/teacher feedback |

B1 contract discussion should cover: retrieving authorized published lessons; creating/updating drafts with conflict handling; publishing a version; submitting a version-bound attempt with an idempotency key; reading permitted results; saving reading position/bookmarks; issuing/redeeming/revoking invitations; and granting/revoking scoped roles. These describe capabilities, not final HTTP routes or a commitment to a new API layer.

Keep existing sample progress separate from account data until an explicit transfer decision is made. Current summaries lack complete attempts and timestamps, so they cannot become authentic historical attempts. Cross-device merge, retention/export/deletion, sign-out cache clearing and audit visibility must be decided before handling real records. No production privacy/security assurance is implied by this planning document.

## Parallel ownership and integration

| Lane | Exclusive initial file ownership | Integration boundary |
| --- | --- | --- |
| Learner lead | `apps/mobile` changes for A0, then S2/O1/O2 | Avoid shared-component changes by concurrent dashboard agents |
| Teacher proposal | `apps/teacher-web/src/features/teacher` | Feature components/styles only; no shared dependency/config changes |
| Admin proposal | `apps/teacher-web/src/features/admin` | Feature components/styles only; no role schema or production authorization code |
| Web integrator | `apps/teacher-web` entry/config, shared styles/charts and package manifest | Owns shared dependencies, imports and integration; owner generates the initial lockfile during installation |
| Planning | `docs/parallel-delivery-plan.md`, `docs/backend-contract-proposal.md` | Main lead integrates status into the tracked roadmap and ignored handoff |

One lead integrates and commits each bounded task separately, updates `CHANGELOG.md`, the tracked roadmap and `docs/AGENT_HANDOFF.local.md`, and assigns future ownership before implementation starts. The owner explicitly requires separate commits for shared foundations, teacher screens, admin screens and backend planning; do not combine independent workstreams. Agents report exact files, behavior, unresolved decisions and actual verification. They do not create user-visible Codex tasks for internal delegation.

Before connected code work begins, assign exclusive ownership for approved adapters, `packages/contracts` and `supabase`. One designated integrator owns shared contracts, dependency manifests and lockfiles. Do not let parallel tasks independently change these boundaries. Contract changes must notify each consuming lane before integration.

## Integration gates and owner checks

1. **Proposal gate:** owner reviews teacher/admin layouts and workflows; learner changes follow their supplied references. Prototype review does not approve production permissions.
2. **Contract gate:** resolve B0, M1 and content/version rules; record decisions and agree contracts/access matrix before migrations or connected role behavior.
3. **Vertical-flow gate:** teacher creates a draft, previews and publishes; an authorized adult learner accesses it, finishes a quiz, and sees acknowledged progress; the assigned teacher sees the genuine result. Verify isolation and denied actions alongside successful flows.
4. **Pilot/release gate:** owner runs required checks and approves evidence. Pending checks remain open; a working sample or static prototype is not pilot readiness.

The owner handles tests, builds, terminal-heavy checks and runtime/visual review unless explicitly delegated. Handoffs must list screens and actions to try, including narrow layouts, larger text, empty/loading/error states and keyboard/accessibility behavior. Native Android/iOS validation cannot be claimed from web previews. The two known lint issues remain deferred until requested or release readiness.

## Remaining scope after these streams

- Reliability and real-class pilot: connected reading recovery, supported text caching, network feedback, duplicate-submit protection and observed feedback across several Sundays.
- Android release: owner-led native/accessibility/automated checks, deferred lint cleanup, lifecycle handling, assets/configuration and accurate store/privacy information; iOS needs separate validation.
- Still deferred: assignments/submissions; badges/certificates/history; community/chat/live sessions; notifications/downloads; expanded profile/setup/avatar uploads; video/resources/personal notes; payments, leaderboards, advanced analytics and full offline quiz synchronization. Reopen only with an agreed behavior, data model and operational owner.

## Status at this checkpoint

React + TypeScript teacher/admin screen source is implemented, A0 learner corrections are committed, and B1/B2 conceptual proposals are documented. The obsolete standalone teacher HTML artifact was superseded by the React workspace. Production backend/authentication/dashboard integration has not begun. Dependency installation, initial lockfile, typecheck/build and runtime/visual acceptance remain with the owner; source implementation does not certify those checks.

Source task commits: shared React foundation `a91263a`, teacher screens `3e4bea7`, admin screens `4369e77`. Backend contracts and delivery documentation form a separate task commit.

Next: LMS-T1–T4 authoring/publication simulation source is implemented. Continue LMS-T5 classes/enrollment prototypes and LMS-B1 contracts in [the LMS plan](lms-implementation-plan.md); teacher/admin tasks remain separate increments. Resolve B0/M1 before production access. Learner O1 → O2 remains queued after S2/S2-F. Owner confirmed learner stroke and structured lesson visuals; new quiz/publication and native/automated checks remain pending. [Review checks](../apps/teacher-web/README.md) include snapshots/next drafts, withdraw/archive/restore, keyboard focus, narrow screens and larger text.
