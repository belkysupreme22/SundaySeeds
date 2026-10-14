# LMS implementation plan

Updated 14 October 2026. This extends the [implementation plan](implementation-plan.md), [parallel delivery plan](parallel-delivery-plan.md) and [backend contract proposal](backend-contract-proposal.md). It defines the next teacher/admin work after the owner approved the prototype direction. It does not claim these components or backend services are implemented.

## Confirmed scope and current priority

- Adult learners, assigned teachers, a system-wide super admin and sub-admin roles whose permissions still need definition.
- React + TypeScript teacher/admin screens continue in `apps/teacher-web`, using the existing Radix, Lucide and lazy Recharts foundation. The approved prototype direction is the starting point for further screen design; supplied learner references remain the visual source of truth.
- Quizzes are **automatic, quick knowledge checks**. Each question has a correct answer and explanatory feedback. Learners select an answer, check it, see the answer/explanation and continue. There is no teacher marking queue or manual approval of quiz results.
- Teacher-reviewed assignments are not confirmed by that quiz decision and remain deferred. A full examination or proctoring system is outside the present scope.
- The **mobile Settings reference-12 correction** is implemented in `8a4d709`, including the requested bottom navigation and light-gray card outlines; owner runtime/visual review remains pending. Dashboard expansion now resumes. Settings controls either perform their stated action or clearly explain what is unavailable; a reference alone does not establish account, notification or download services.

## What exists and what does not

| Area | Current implementation | Next capability |
| --- | --- | --- |
| Mobile learner | Sample catalogue, lesson detail/reading, automatic answer checks/explanations, results/retry, bookmarks, reading position, best scores, Profile and Settings | Requested Settings completeness, then remaining Welcome/setup design; later authorized course/class content and acknowledged account progress |
| Teacher | Overview/Lessons/Classes screen prototype; temporary title/scripture/reading/reflection draft creation, editing and preview | Course structure, full lesson authoring and automatic quiz authoring; then class and reporting screens |
| Administrator | Overview/People/Access prototype; empty directory filters and unsaved role-scope proposals | Organization/class directory, concrete scoped permissions, configuration and audit screens |
| Charts | Explicitly illustrative examples loaded on demand | Genuine reporting only after recorded data, permission scopes and denominators exist |
| Backend | Contract and conceptual access-matrix documents | Agreed schema, identity, permission enforcement, durable content/progress and recovery |

The owner's positive prototype feedback accepts the design direction. It is not evidence that installation, type checks, builds, keyboard/accessibility checks or end-to-end flows passed. No new verification results have been supplied for this plan. Drafts are not durable publications, the workspace switch is not authentication, and empty class/directory screens are not working enrollment management.

## Bounded implementation tasks

Each row is a separate task and commit boundary. Split a row further if its implementation grows; do not combine independent teacher, admin, backend or shared-foundation work into one commit. `UI` means an honest interactive screen implementation using temporary or explicitly identified sample data. `Connected` means durable behavior behind approved authorization and data contracts.

| ID | Deliverable and completion target | Depends on |
| --- | --- | --- |
| S2-F — implemented | **Mobile Settings correction:** full groups/components, availability details, single storage explanation, confirmed reset and Profile-active bottom navigation with light-gray cards | `8a4d709`; reference inspected, source formatted and whitespace checked. Owner runtime/visual acceptance pending |
| LMS-T1 | **Course outline UI:** course title/summary, modules, ordered lessons and a clear editable outline. Support add/edit/reorder and useful empty/validation states; no invented enrolled learners | Approved teacher design; define a small course/module draft shape |
| LMS-T2 | **Lesson authoring UI:** integrate existing reading/reflection editor with the outline; outcomes, scripture, structured sections and learner preview. Add image selection/alt text/clear behavior only with explicit temporary preview semantics | LMS-T1; agree supported content types and media limits before durable uploads |
| LMS-T3 | **Quiz authoring UI:** question/options, one correct answer, explanation, add/edit/reorder/remove, validation and learner Check answer preview. Prevent incomplete questions from being considered publishable | LMS-T2; preserve the agreed automatic feedback model |
| LMS-T4 | **Publication workflow UI:** draft validation summary, preview, publication/version status and explicit simulation where services are absent. Editing published content produces a new draft, with withdrawal/archive consequences described | LMS-T1–T3; agreed content lifecycle; no production publish claim |
| LMS-T5 | **Classes and enrollment UI:** class list/detail, assigned content, roster, invitations and membership states. Empty/loading/error views must be designed, with no invented real memberships | Class/invitation contract proposal and teacher assignment boundaries |
| LMS-T6 | **Teacher reporting UI:** class/lesson completion, learner progress, genuine zero versus unavailable values, filters and accessible chart/table alternatives. No grading queue; answer-level views only if permitted | LMS-T5; define measures and denominators; connected figures require LMS-B5 |
| LMS-A1 | **People and organization UI:** adult learner/teacher directory and details, organizations/classes, memberships and invitation lifecycle; scope and status always visible | Agreed organization/class model; permissions remain proposals until LMS-B1 |
| LMS-A2 | **Access administration UI:** roles/capabilities, scope selection, grant/revoke summaries and explicit delegation limits. Model super-admin recovery/last-admin constraints; avoid implied universal sub-admin access | Owner decision on initial scopes, grant authority and bootstrap rules |
| LMS-A3 | **System settings UI:** agreed organization/content defaults, user preferences and support configuration, with validation and clear save states. Separate personal preferences from privileged system changes | Identify concrete configuration consumers; no arbitrary unused switches |
| LMS-A4 | **Audit and operations UI:** authorized event list/detail/filter states and recovery/status presentation. Use explicit examples until authentic events exist; never fabricate a successful privileged action | Agreed audit fields, readership, retention and operational responsibilities |
| LMS-L1 | **Learner course journey UI:** catalogue/course overview, module/lesson ordering, resume/bookmarks and quick knowledge-check feedback. Preserve reading-position/completion distinction and existing useful failure states | LMS-T1 content hierarchy and published content contract; use existing learner references |
| LMS-L2 | **Learner support and accessibility:** remaining Welcome/setup; Settings/help destinations, scalable text, focus/keyboard/touch behavior and understandable empty/error states | S2-F; actual support/contact destinations and supported preferences |
| LMS-B1 | **Backend decision and contract update:** course/module structure, quiz answer/explanation timing, completion/retry/version rules, adult sign-in, pilot ownership, sub-admin scopes and media/data lifecycle | Owner decisions; update existing proposal rather than create competing contracts |
| LMS-B2 | **Schema and authorization:** migrations, relations, RLS/trusted operations and audit foundations for approved scope; deny unauthorized/cross-class access and protect privileged credentials | LMS-B1; explicit connected-implementation start |
| LMS-B3 | **Authentication and enrollment:** configured sign-in/recovery, sessions, invitations/join/revoke, teacher assignment and admin bootstrap | LMS-B2; approved provider and invitation rules |
| LMS-B4 | **Content services:** durable course/module/lesson drafts, revision conflict handling, private media access, immutable publications and withdrawal/archive behavior | LMS-B2–B3; LMS-T1–T4 contracts |
| LMS-B5 | **Learning services:** authorized content access, bookmarks/reading positions, automatic check-answer feedback, trusted attempt completion/scoring, idempotency and genuine reporting queries | LMS-B3–B4; fixed feedback/completion/version semantics |
| LMS-I1 | **Teacher integration:** connect authoring/publication and class reports through feature data adapters; expose acknowledged saves and recoverable errors | LMS-B4–B5; teacher UI tasks |
| LMS-I2 | **Administrator integration:** connect permitted people/roles/configuration/audit actions, confirmation and conflicts to trusted operations | LMS-B2–B5; admin UI tasks and approved capabilities |
| LMS-I3 | **Learner integration:** connect catalogue/journey/feedback/progress through feature hooks/adapters, with session expiry and account-switch isolation | LMS-B3–B5; learner UI tasks and an explicit sample-progress transfer policy |
| LMS-R1 | **Recovery and pilot gate:** record owner-run access/integration/native checks, supported offline behavior, backup/restore responsibilities and actual-class feedback | LMS-I1–I3; no unresolved critical access or data-loss failures |

A shared reusable UI or contract change needed by several rows is its own foundation task/commit. Feature screens must not call storage/backend clients directly. Use existing feature boundaries before adding broad frameworks or packages.

## Assessment and publication rules to carry forward

The sample app already checks answers immediately, explains them, allows a fresh retry and completes a lesson after a fully finished quiz even at zero score. Best percentage persists; complete attempt history does not. Keep that behavior intact while extending authoring. Do not add a passing threshold, timed test, assignment inbox or teacher review state without a new product decision.

For connected learning, agree how each checked answer receives its correct answer and explanation while the final accepted attempt records trusted completion. Feedback must not wait for a teacher. The backend proposal's previously unresolved feedback-release timing must be updated to match the owner's interactive knowledge-check direction; the exact endpoint/transaction design remains a technical decision. Do not present these checks as secure examinations whose answer keys must remain secret after feedback.

Pin attempts and feedback to immutable published lesson/quiz versions. Agree retry limits (if any), score/completion behavior across new versions, older open-version submissions and the effects of withdrawing content or revoking membership. Concurrent draft edits need revision conflicts; uncertain attempt retries need the same submission key so they cannot create duplicate accepted attempts. A new intentional retry uses a new key.

Course/module additions require an explicit extension to the existing lesson-focused contract. Define whether a course can be shared across classes, which published versions a class sees, and how ordering/content changes affect progress before connected authoring. A rearranged outline must not silently invalidate earlier completions.

## Pilot and release gates

1. **Design:** owner accepts each added workflow against the learner references and approved dashboard direction. Include small widths, larger text, long content, keyboard/dialog focus, useful empty/loading/error states and chart data alternatives.
2. **Authority and data:** record first pilot group, curriculum/content rights, adult identity/recovery, teacher assignments, initial sub-admin scopes, retention/export/deletion and operational ownership. UI visibility never enforces permissions.
3. **Connected vertical flow:** authorized teacher creates and publishes a version; adult learner joins the intended class, reads, checks answers and finishes; progress is acknowledged; assigned teacher sees the real result. Verify forbidden and revoked access as well as successful paths.
4. **Recovery:** exercise interrupted draft saves, uncertain quiz submission, session expiry, shared-device account switching, cache isolation and backup/restore. Do not silently upload sample progress or manufacture attempt history from its summary scores. Define supported caching separately from full offline synchronization.
5. **Release:** owner records required builds/tests, native accessibility/device coverage, deferred lint fixes, lifecycle/privacy/store details and pilot feedback before Android release. Web review does not establish native verification; iOS needs its own checks.

The owner retains tests, builds, terminal-heavy work and runtime/visual review unless explicitly delegated. Supply affected screens and actions to check for every task. Source implementation, prototype approval and verified readiness are separate statuses.

## Deferred scope

Teacher-reviewed assignments/submissions, commerce/payments, community/chat/live sessions, certificates/badges, leaderboard/advanced analytics and full offline quiz synchronization remain deferred until explicitly requested with a concrete use case. Notifications, downloads, video, extended personal fields and history require their own working services/data rules; visual Settings components alone do not implement those capabilities.

Next sequence: begin **LMS-T1** with **LMS-B1** planning in parallel. Admin expansion can proceed independently once its file ownership and initial scoped-role decisions are explicit. Automatic quiz authoring (LMS-T3) is not yet implemented; the existing mobile quiz already supplies automatic feedback. The lead updates the tracked roadmap, changelog and ignored handoff as each task lands, and records each task's own commit and actual verification.
