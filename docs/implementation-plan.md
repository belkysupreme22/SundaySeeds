# SundaySeeds implementation plan

## Ordered Home audit A20–A21 — 22 October 2026

Reference05 and actual 320px Home exposed a collapsed featured-hero copy box, letting
the portrait cover its action/text. Minimal Home-only responsive sizing now reserves
text height; 320px/390px screenshots checked, no assets/shared styles changed. Next
in this same audit: restore header/hero/shortcuts order and distinct discovery/resume
roles while preserving Home sections, sample curriculum and the existing tab model.
Native acceptance remains pending; see [evidence](learner-screen-audit.md).

## Ordered audit A14–A19: optional learning profile — 22 October 2026

Settings edit success now stays focused on saved preferences and returns to Settings;
discovery is omitted only in editing mode. First-setup result and question layouts
are unchanged. Browser 320px/390px checks cover result Back/Edit/return, load retry,
failed saves, revision conflict/reload with draft retention, slow exit, unanswered
save and Skip/reload. All service responses intercepted; real persistence/security
and native checks remain pending. Final typecheck has only the existing loader error.
Next A20–A21 Home audit, preserving sections/tab model and treating course-entry
duplication explicitly. Setup-result action hierarchy remains separately recorded.

Session guidance now describes pausing between readings; sample hints explicitly
say minutes of reading. No ranking, choices, duration values or layout changes.
Browser copy/flow checked at 320px/390px. Typecheck after the scoped Back correction
has one remaining baseline error (PageLoadingOverlay); the profile error is fixed.

Question-control browser checks passed at 320px/390px with synthetic verified identity
and intercepted preference responses. Preserved optionality, all four pages, card
appearance, deselection, three-topic cap, draft retention and Cancel. Fixed missing
web checked/disabled semantics in the feature choice cards and the existing missing
Back callback dependency argument in the audited screen. Native Back/screen-reader/
text scaling remain pending. See [per-screen evidence](learner-screen-audit.md).
Time wording and Settings-result corrections were kept in separate scoped increments.

## Ordered audit A09–A13: recovery and proof boundaries — 22 October 2026

Invalid-link buttons now name their unchanged destinations: Back to sign up for
confirmation, Request a recovery email for recovery. Both clicks checked at both
widths; no resend service invented. Next A14–A19 optional learning-profile screens;
retain unresolved signed-in/proof-success/native variants in the checklist.

A12 guidance now correctly asks the learner to open the recovery email; a distinct
hero mode preserves the actual proof/password instruction and existing artwork.
Both contexts' copy checked at 320px/390px, guidance screenshots inspected. No
shared sizing or other screen layout changes; native text scaling remains pending.

Browser recovery validation/simulated responses/pending exit and no-account
verification guidance checked at 320px/390px. Both email-proof routes now defer
parameter clearing until linking listeners mount; direct links previously retained
their token in the URL. Explicit Continue, memory-only candidate and current-account
isolation are unchanged. Invalid/simulated-expiry, cleared-link reload and late
response after exit checked; no service mutations or real proofs used. Native,
actual proof/password success and other identity variants remain pending. Follow
[screen evidence](learner-screen-audit.md); copy corrections stay separate.

## Ordered audit A07–A08: account forms — 22 October 2026

Added upfront Google/Apple unavailable guidance and descriptive informational-action
labels while preserving reference03 buttons/artwork/fields. Isolated browser checks
at 320px/390px passed validation, password reveal, provider information, intercepted
sign-in failure, pending exit and embedded onboarding/recovery Back navigation.
No external Auth request or service mutation; Home/navigation logic unchanged.
See [actual coverage and pending states](learner-screen-audit.md). Real submissions,
native keyboard/Back/text scaling and screen-reader acceptance remain pending.
No automated suite/typecheck/lint/build rerun for this copy-only change; existing
baseline failures remain. Continue in order with A09 then A10–A13 proof states.

## Onboarding boundary and responsive hero — 22 October 2026

A05 caption now truthfully presents optional accounts; its layout is unchanged.
Basic A06 guest name/Back/save/Skip and welcome failure/reload boundaries passed
browser checks. An actual 320px screenshot then reproduced AccountHero text/portrait
overlap from collapsed stacked copy. The minimal shared sizing correction was
rendered on **each caller** (choice/Sign in/Sign up) at 320×568 and 390×844; visible
text clears the portrait and regular layouts are retained. No Home/tab changes,
new assets, app dependencies, account submissions or service mutations.

See [per-screen evidence](learner-screen-audit.md). Native Back/text-scale/keyboard
and remaining A06 name-error/account variants are pending. A07/A08 received hero
layout caller checks only; full auth-form auditing follows in order. Whole-project
typecheck still has only the two known baseline errors, not a green check. Shared
Card/Button/loader defaults remain untouched. Continue with A07–A13 account forms
and proof states, without redesigning Home or bundling other screens’ fixes.

## Ordered audit pass 1: introduction — 22 October 2026

Continued A01–A04 in checklist order, preserving the existing reference01 layout.
Added a local focused Android Back listener to WelcomeScreen, including saving
and first-page behavior; shared replay is an affected caller. No Home/navigation,
storage, database or global style change. Browser first-entry, visible Next/Back,
feature-card Next, Skip, completion reload, welcome-storage failure recovery and
replay boundary checks passed in isolated guest contexts at 390×844/320×568 with
screenshots inspected. Native Back and native larger-text/keyboard checks remain
pending. See [per-screen results](learner-screen-audit.md).

The requested typecheck still reports the same two baseline errors in learning
profile and shared loader code; this pass does not fix other screens incidentally.
Browser automation uses the bundled Playwright library; an approved cache-only
headless-browser download supplied its missing binary, with no app dependency or
lockfile changes. The running Expo web preview was started for this audit; owner
environment files were not manually read or changed.

## Current priority: ordered learner screen audit — 21 October 2026

Owner reported overlapping course/lesson entry points and that recent changes
messed up Home. They explicitly require a screen-by-screen checklist beginning at
onboarding, with no screen changed incidentally while another is fixed. The
unreviewed multi-screen rewrite from this turn was fully reverted; current app
source remains committed baseline `d6d3beb`, including its Home Browse button,
which is an audit finding rather than accepted composition.

[Ordered audit checklist and source findings](learner-screen-audit.md) covers first
launch/introduction, identity/proofs, all optional questions, Home, catalog/enrollment,
both learning paths, quiz/review/progress, Profile, every Settings sheet, replay and
logout. References01–12 and source reviewed with bounded independent read-only
lanes; actual rendered comparison/native acceptance remains pending. Useful context
and learning feedback must not be removed simply because content appears twice.

Requested regression baseline on restored source: typecheck fails with two errors
(missing useCallback dependencies argument; unsupported typed absoluteFillObject).
Tests:16pass/1fail, the latter requiring repeated Sample lesson wording in every
intro. No fixes from this audit remain in app/test source. No lint/build/browser/
native/DB behavioral checks or service/environment changes. Next: follow checklist
A01 onward and apply only isolated, reference-supported corrections; shared changes
need their own caller checks. Connected quiz/progress work waits behind this audit.

## Home course-library discoverability — 21 October 2026

Owner could not find Browse courses on Home. Source had a small section-header
link below the hero, shortcuts and continue-learning area; actual rendered cause
was not observed. Moved the action to a full-width existing outline Button directly
below the greeting and removed the duplicate lower link. It still opens `/courses`;
no shared defaults, backend or sample journey changes. Source/whitespace review
only, no tests/build/typecheck/lint/runtime/native checks. Owner reloads Home and
checks visible Browse courses → Course library, narrow widths and larger text.
The connected quiz/progress priority remains unchanged after this navigation fix.

## Mobile verified Join and connected reading — 21 October 2026

Course details now load own enrollment through actor-scoped hooks and show explicit
Join only after a confirmed missing enrollment and open offering. The client pins
the initiating JWT, fences actor/session/focus changes and reconciles own membership
before retrying. A stale offering requires refreshed details and another explicit
Join; uncertain outcomes are not presented as failure or success.

Enrolled learners see their pinned edition and module/lesson links separately from
the current offered outline. `/courses/[id]/lessons/[lessonId]` loads authorized real
teaching text through its feature adapter/hook, never sample fixtures. It shows
outcomes, sections, Scripture and memory verse, with no sample bookmarks, reading
position, quiz scoring or fabricated progress. Optional reflection remains a prompt,
not a submitted response. Guest/unverified learners enter existing identity routes
and manually return through Browse courses; persisted ID-07 intent stays deferred.

Existing cards/pastels/strokes and centered page loaders are reused; shared defaults
and environment/dependencies are unchanged. Source/API/security and whitespace
review only; tests/build/typecheck/lint/advisors/runtime/native/visual checks remain
owner-run. Review verified Join → edition 1 → each reading; reopen/reload/sign in
on another device to confirm enrollment; sign out/account switch without old owned
data; guest/unverified/direct unauthorized lesson; failed requests/stale offering;
narrow widths/larger text and native separately. Broader SQL permission/concurrency
cases are in the enrollment guide. Next implementation: trusted knowledge checks
and synced account learning progress, with remaining retry/score/in-flight semantics
resolved before enabling submissions. Teacher/admin remain session-only prototypes.

## Enrollment and authorized reading foundation — 21 October 2026

Owner’s next-step instruction continues the approved connected development flow.
Applied migration `20261021080323_verified_course_enrollment` additively through MCP;
mirrored actual remote version, no CLI install or old-migration replay. Private
actor/course enrollments and immutable lesson readings have no client table grants.
Narrow operations require trusted verified identity and current session; Join is
idempotent and edition-pinned, and lesson body reads enforce current access and
exact membership in the same query. See [decision0015](decisions/0015-enrollment-and-authorized-reading.md).

Imported the four approved development readings without quiz questions/answers,
sample progress or account history; development admission opened only after full
outline coverage. [Database evidence and pending checks](../supabase/course-enrollment.md)
separate source/application from acceptance. Source and independent security/API
review only; no tests/build/typecheck/lint/advisors/behavioral SQL/native/runtime
checks. Broader staff, correction/transfer, in-flight assessment and lifecycle
policies remain open; the known direct administrative lock-order concern is not
claimed resolved. No persisted ID-07 auth-return intent is introduced.

Next mobile increment wires explicit Join, own pinned curriculum and server-loaded
reading. Trusted knowledge-check submissions and synced learning progress follow;
first-course completion is accepted but not yet computed by the backend.

## Mobile connected catalog source — 21 October 2026

`/courses` now requests the real public catalog, with separate loading, empty,
error and unavailable-configuration states. `/courses/[id]` shows the acknowledged
metadata, outcomes, time basis and ordered module/lesson outline. UUID/revision,
availability and nested payload validation sit in the course adapter; focused hooks
ignore superseded responses. Routes compose screens, and screens do not call SDKs.

The approved development outline is labelled Development course; the existing guest
journey is an explicit separate Sample course entry. No fallback into fixtures on
request failure, invented matching/progress or operational Join/Start action. The
connected detail page explains enrollment is forthcoming and has no lesson links.
Existing onboarding suggestions still describe the sample; connected preference
ranking remains later work. Teacher/admin remain session-only prototypes.

Visual adaptation uses existing discovery cards, lavender summary, mint status and
yellow sample treatment with shared outlines/offset shadows; shared defaults are
unchanged. No new assets/dependencies or environment changes. Source/API/security
and whitespace review only; no tests/build/typecheck/lint/runtime/visual/native
verification. Owner next: Home → Browse courses → View course; check two modules,
four lessons, 26min reading label, unavailable ID, retry/failure and separate sample
journey, narrow widths/larger text and native separately. Next implementation is
verified/idempotent enrollment plus authorized edition-bound lesson content; clarify
remaining auth-return/access rules before enabling that path.

## Current checkpoint: development catalog foundation — 21 October 2026

Owner explicitly accepted the first development course, preserving joined editions
and all-four-checks completion without a minimum score, with retries/explanations
and optional private reflection. See [decision0014](decisions/0014-first-connected-course.md).
Remaining access/attempt/lifecycle/staff decisions are not blanket-approved.

Applied additive catalog migration `20261021074729_course_library_foundation`
through MCP to the intended development project. Separately imported the approved
course metadata/outline with generated connected IDs, development label and joins
closed. Public list/details use invoker RPCs/RLS and exact immutable snapshots;
no lesson bodies, answers, enrollment, attempts or guest history were imported.
See [deployment evidence and API](../supabase/course-library.md). Foundation history
was not replayed; no CLI/dependencies/env changes. Enrollment is deferred to the
actual verified/idempotent Join slice rather than adding a premature empty table.

Source/security/document review and application acknowledgements only; owner
permission/concurrency/build/runtime/native checks remain pending. No advisors or
behavioral SQL tests were run under the owner-run verification agreement. Future
staff mutations must resolve the documented offering/release lock-order concern.
Next: connected mobile discovery/details, then verified enrollment plus authorized
lesson reads, keeping development/sample and account progress separate.

## Current priority: connected workflow and 28 October checkpoint — 21 October 2026

The owner asked to accelerate toward 80% overall by next week. The target checkpoint
is 28 October; no measured backlog currently supports a guaranteed percentage.
[Production delivery plan](production-delivery-plan.md) sequences the backend,
mobile, teacher and admin work and separates source, deployment and owner acceptance.

Completed this bounded planning task: [first-course blueprint](first-course-blueprint.md)
and [focused catalog/access contract](course-library-contract.md). The existing
Faith for everyday life course is a development candidate, not an approved import.
Stable editions, no-pass-mark completion and safe auth return are explicit
recommendations for review, not newly confirmed policies. Content/staff authority
and report visibility remain gates for the relevant implementation batches.

Next implementation unit: additive course/release/enrollment access foundation and
mobile public catalog/details, then verified Join and authorized lesson reads.
Resolve the concrete draft choices before dependent behavior is enabled. Durable
teacher publication, trusted progress, classes/reporting and admin authority follow
in separate commits. Current learner identity/profile/preferences are connected in
development; teacher/admin remain session-only prototypes. No app/schema/service
change or runtime/test/build verification is included in this planning increment.

## Current priority: real-world course model and operating scenarios — 20 October 2026

The owner reports reviewing onboarding and approved course-library contract planning.
When asked about initial course content and edition updates, they requested deeper
research and emphasized actual learner/teacher/Sunday-school use rather than further
design-led assumptions. [Course-model research](course-model-research.md) now compares
official LMS and adult Bible-study structures and walks eight operational scenarios.

Findings support course → modules where useful → lessons/activities, separate from
classes and dated meetings. Reflection, knowledge checks, completion and permission
have different meanings; weekly curriculum length is not a personal session estimate.
The report explains living courses versus stable editions through a concrete progress
example. Neither the existing sample as connected content nor the edition policy is
owner-selected yet. No approved automatic-feedback rule is changed by competitor
research; teacher visibility and completion criteria remain our own decisions.

Next bounded deliverable: one reviewable course blueprint (audience/outcomes, Scripture
and rights/reviewer, lesson sequence, activities, estimate basis, completion and update
example). Use current content as a candidate, not an automatic production import.
Then finalize public catalog/enrollment/content-access contracts and start additive
schema/adapters in their own implementation increment. Classes/staff authority,
connected progress and the consolidated polishing sprint remain separate workstreams.
Official-source/source review and whitespace review only; no app/schema/service,
credentials, tests/build/typecheck/lint/runtime changes in this research increment.

## Loader appearance correction — 20 October 2026

Owner requested a transparent loader with the selected Lottie file's exact original
colors. Restored original blue-to-purple fills, opacity keyframes and unoutlined
shapes from the downloaded source; retained only the canvas crop. Static fallback
uses the same colors. Removed the white panel, border, shadow and translucent page
wash. Large centered placement,0.65speed,180ms entryfade and immediate completion
remain. Source/formatting/whitespace review only; owner visual/native checks pending.

## Lottie loading treatment — 20 October 2026

Owner requested LottieFiles loaders where appropriate. Source now uses a locally
bundled adaptation of Kyle McGahey's Loading dots in SundaySeeds pastels: large
startup/welcome/profile status and centered page overlays for account/profile
requests. The owner corrected the initial button placement: buttons now retain only
busy/disabled semantics; animation is page-centered at 208×68. Shared 0.65 speed
produces a roughly two-second loop with 180 ms entry fade, immediate disappearance
on completion and static reduced motion. Actual
pending states control visibility; errors and verification instructions remain
static. Reduced motion/player failure retains still dots and useful labels. Native
and browser players are separate; no runtime LottieFiles fetch or synthetic wait.
See [decision0013](decisions/0013-local-lottie-loading-indicators.md).

The Expo-compatible native and SVG web players were installed with scripts disabled.
Only source/installed API and documentation review, independent source review,
formatting and whitespace review ran. Next owner restarts Expo and reviews startup,
profile loading/save, sign-in/signup/recovery/verification/reset requests, failure
completion, reduced motion/background behavior and small widths/larger text on web
and native separately. This requested animation slice does not complete the deferred
app-wide copy/error polishing sprint or outstanding learning-profile acceptance.

## Learning-profile source and owner review — 20 October 2026

The owner approved the research-based intention → interests → Bible-study familiarity → session time → course choices flow. Source now includes four optional pages, Back/deselect/Skip, saved preference summary, Settings editing, a one-course directory and truthful sample lesson hints. Verified Home entry opens setup only after an acknowledged missing preference row; completed/dismissed rows prevent repeated prompts. Initial load failures offer retry/exit without overwriting values. Skip immediately suppresses prompting for this session and attempts durable dismissal. See [implemented flow and owner review](auth-onboarding-flow.md#next-slice-optional-learning-profile--20-october-2026).

Separate private preference SQL/RPCs were committed as `8866fda` and applied additively through Supabase MCP to the intended development project. Remote migration history supplied the actual version `20261020114334`; source mirrors it. The CLI remains absent, no install was added, and the existing manually applied profile foundation was not replayed. Its history reconciliation remains a separate prerequisite before a blanket CLI push.

The current app still contains one bundled sample course. Recommendations can explain an included topic and hint at a lesson using actual duration metadata; authored course-level goal/level matching and connected course content/enrollment remain later work. No fictional course inventory, history, progress, membership or enrollment was introduced. Guest learning and owner environment files stay separate.

Actual verification: reference/source review, independent bounded source reviews, scoped formatting and whitespace review; MCP DDL success and migration-list metadata confirm application only. Owner-run tests/typecheck/lint/builds, runtime/rendered/native review and database permission/concurrency/advisor checks remain pending. The owner reports reviewing the onboarding flow; no detailed platform/error/security coverage or automated results were supplied. Outstanding coverage includes session refresh/account switching, failure/conflict paths, narrow widths/larger text and database permissions. Consolidated polishing remains queued; real-world course-model research now precedes authentic catalog/admission.

## Identity owner checks and log review — 20 October 2026

The owner confirms signup/email verification/sign-in, logout → generic Home, account name save/refresh/re-sign-in and password recovery work in the development sandbox flow. Requested read-only Supabase Auth log review shows recovery POST `/recover` 200, proof POST `/verify` 200, password PUT `/user` 200, logout POST `/logout` 204 and subsequent login POST `/token` 200. A preceding password-update rejection is 422 `same_password` (“New password should be different from the old password”), so the observed reuse error is correct backend validation during reset, not evidence of a connection problem. Logs contain no password values and do not establish which password was submitted to a login request.

Source inspection confirms `emailProof.reset()` currently maps password-update errors to generic feedback. Per owner instruction, defer error-copy/validation/loading/recovery feedback polishing to one consolidated app-wide sprint; include an actionable same-password message, safe invalid-credential messaging, and distinction between network, provider/delivery, rate-limit, validation and partial-success outcomes without exposing raw sensitive errors. No UI/code polish is performed in this increment. Remaining acceptance includes expired/reused proof, cross-account isolation, offline/storage/conflict/revocation scenarios, native/accessibility and owner-run SQL/automated/build checks. Real delivery/domain and hosted callbacks remain pilot setup work. Next: agree the next bounded backend/course slice without treating the happy-path checks as blanket release acceptance.

## Logout navigation and greeting — 20 October 2026

The owner reports sandbox signup/email confirmation/sign-in now reaches Verified status. This is bounded owner acceptance; profile persistence, recovery, cross-account/failure/native/automated checks are not yet confirmed. The owner then requested logout → Home and explicitly chose a generic greeting when signed out. Settings now navigates Home only after acknowledged sign-out, with an initiating-account/focus guard. Home personalizes only while signed in; saved guest names and sample learning remain unchanged, with guest name still available on Profile. Name setup/editor copy is aligned. Source formatting, independent source review and whitespace checks only; runtime/native/tests remain owner-run and pending. Next owner reviews logout/greeting, then completes own-profile persistence and password-reset acceptance; content/admission services stay separate.

## No-domain development option — 20 October 2026

The owner still has no domain. A domain purchase is not required to continue development: the walkthrough now offers Mailtrap Email Sandbox as custom SMTP, with captured confirmation/reset messages in a private development inbox. It keeps the existing hosted Supabase project, Confirm Email and custom token-hash callback contract. This is a recommended setup path based on official SMTP documentation, not a selected/configured/tested provider. Captured-mail flow testing does not verify real inbox delivery or email ownership; proper sender/domain delivery remains a pilot prerequisite. Owner env configuration and guest/form checks are reported complete; connected identity acceptance remains pending.

## Setup prerequisite correction — 20 October 2026

The owner reported that Confirm signup source editing requires custom SMTP. Current official Supabase documentation confirms that new Free projects created from 3 June 2026 cannot edit templates while using default SMTP. The walkthrough now puts custom SMTP/verified sender setup before template editing and distinguishes localhost destinations from mail-service configuration. Default templates do not satisfy our implemented token-hash callback contract; keep Confirm Email enabled. Public app configuration can proceed, but email confirmation/reset acceptance awaits a configured sender and both templates. No paid plan, provider/domain purchase, configuration bypass or alternate callback implementation was introduced. Documentation/source and whitespace review only; service/runtime checks remain pending.

## Identity/profile source prepared — 19 October 2026

The owner approved proceeding from the contract into the first identity/profile slice, requested preparation for a **new development Supabase project** and configurable domain/sender, and explicitly approved installing the Supabase client, SecureStore and URL polyfill. Database source is committed separately in `317b280`: private learner profiles, own-read RLS, actor-bound RPCs and expected revisions, with rollback-only permission checks written but not run.

Mobile source now wires the existing email/password forms, explicit-action token-hash confirmation/recovery pages, native credential storage/browser tab sessions, validated account state, own profile/name editing and current-device Settings sign-out. Account and sample data remain separate; no enrollment/class/staff/connected-learning service is introduced. This implements the identity/profile source portion of the phased contract, not a working deployed backend or release acceptance. Related defaults ID-01–05/08 are applied for this bounded source slice; class invitation and course-return proposals ID-06/07 remain deferred. Account linking/social providers and public policy documents remain unresolved.

Next: follow [Supabase setup](supabase-setup.md) to create/select the intended development project, apply/review profile SQL, enable Confirm Email, configure exact web callbacks/templates, public environment values and development delivery. Localhost review can begin on one computer; owned HTTPS callback hosting and SMTP are needed for wider device/learner review. The owner requested this walkthrough while implementation was ongoing. No unrelated existing Supabase project has been modified.

Actual verification: the delegated package install succeeded with scripts disabled and a committed lockfile; reference 03/current official docs/installed SDK/source review informed the implementation. Formatting and whitespace checks are recorded separately. Tests, typecheck/lint, builds, SQL/security checks and runtime/native/rendered acceptance remain owner-run and pending. Installation reported 29 dependency audit findings; review is pending, no forced upgrades applied. After identity acceptance, scope authentic course catalog/enrollment using confirmed B1-05c/d; invitation/staff/content gates remain separate.

Earlier dated checkpoints below preserve their own planning-only state; this checkpoint supersedes their next-step/implementation-start notes.

## Owner visual approval and backend planning — 19 October 2026

The owner approved the visuals of optional account onboarding (`752de75`) and learner sample-content polish (`f0b0792`). Record this as visual approval of those increments only: no platform, viewport, native accessibility, runtime/error coverage or automated/build results were supplied. Other learner/teacher/admin acceptance remains separate.

The next workstream is **LMS-B1 learner identity and course-admission planning**, extending the [existing backend proposal](backend-contract-proposal.md). New confirmed rules: email verification before starting connected courses; verified learners join courses directly; classes require invitations. Guest browsing/details and the current guest sample learning remain. Course enrollment is separate from class membership and staff authority.

**Contract draft v1 is prepared:** [learner identity and course-access contract](backend-contract-proposal.md#learner-identity-and-course-access-contract) now contains identity states/diagram, minimal records and ownership, request/outcome/failure tables, email/callback alternatives, profile/session/sample isolation, course/class boundaries, implementation slices and planned acceptance evidence. Independent source/contract review and current official Supabase/Expo documentation informed it; no provider, schema, app, tests/builds or runtime changes were made.

Next: review proposed defaults ID-01–08 and supply project/environment ownership, callback domain/hosting, sender and account-policy inputs for the first slice. Recommended defaults include explicit-action email links, optional 40-character display name without automatic guest-name transfer, passphrases, per-device sign-out, sign-in after reset, recipient-bound seven-day invitations and separate sample progress. These are proposals, not owner confirmations. The first slice remains email/password identity, verification/recovery, own profile and Settings session/sign-out; approve its bounded implementation start before code/configuration. Course/release/content ownership and staff authority remain gates for their corresponding later slices. Do not reopen confirmed B1-05c/d.

## Learner sample content polish — 19 October 2026

Following optional account onboarding in `752de75`, the owner requested realistic sample data and finished product wording for review. The four original adult lessons now have refined introductions/outcomes and 12 reading/reflection sections; the course/module descriptions, curriculum guidance and post-quiz next steps describe the learning experience. Home labels its fixed selection Featured lesson rather than implying a weekly publication schedule. Existing sample badges identify content without repeated inline sample prefixes or an architecture-oriented course footer.

Course/module/lesson/section/question IDs, ordering, question text/answer keys, reading durations, storage schema and progress logic are unchanged. No fabricated enrollment, instructor, history, analytics, account or connected service is added. Scope is the current learner course journey; teacher/admin examples remain their separate prototypes. Changed source was formatted and reviewed; owner visual approval is recorded above. Tests/build/typecheck/lint and runtime/native coverage remain unreported. Remaining checks include Home → curriculum → all four lesson overviews/readers → quiz next steps at narrow widths/larger text and persistence recovery.

## Optional account onboarding — 19 October 2026

The owner approved an optional account step after Welcome, with Create account, Sign in and Skip for now. First launch and Settings introduction replay share the account/form steps; Skip opens Home directly using the existing welcome preference. Add a name for your welcome retains the existing optional name flow, with Back to account options. Existing completed users keep Home; sample courses/lessons stay available without sign-in. Auth forms keep truthful unavailable outcomes and explicit follow-up previews; no session, enrollment, email verification policy, storage schema or backend connection is introduced. See [auth flow and owner checks](auth-onboarding-flow.md) and [decision 0009](decisions/0009-optional-account-onboarding.md).

References 01/02/03 informed the new choice page and retained forms. Source formatting/review completed and owner visual approval is recorded above; tests/build/typecheck/lint and runtime/native/error-state coverage remain unreported. Learner sample content polish is recorded separately above. Future sign-in/verification and admission at connected course Start/Join is still unimplemented; follow the focused planning checkpoint above before connected work.

## Current checkpoint — 19 October 2026

The owner approved a documentation cleanup after the agent-guidance audit: correct mobile commands/SDK guidance and web chart/simulation wording, align supporting instructions and current roadmap summaries, and recreate the ignored local handoff. No app behavior, service configuration or product policy changes are part of this increment. Verification is documentation/source and diff review only; tests, builds, typecheck/lint and runtime/native/visual checks remain owner-run and pending where not already evidenced.

Source implementation includes the learner sample course journey (curriculum, Home/Lessons discovery and resume, post-quiz next steps), O1/O2, teacher T1–T6/editorial studio, admin A1–A4 and five account UI previews. Their implementation does not establish acceptance or connected services. The owner previously confirmed learner stroke visuals and optional name-setup replay; those confirmations do not accept later increments.

Next sequence: owner reviews sign-in/signup, recovery, verification and new-password previews using [auth onboarding flow](auth-onboarding-flow.md); address bounded design feedback; resolve pilot/content ownership (B1-04), verification/recovery/class admission/staff identity (B1-05b) and admin authority (B1-06) in the [backend decision register](backend-contract-proposal.md). Agree the remaining release/assessment/lifecycle scope and explicitly approve connected implementation before migrations, auth configuration or integration. Adult email/password self-registration without an invitation is already confirmed; class membership and staff authority remain separate.

## Historical checkpoints

Dated notes below preserve the state of their increments. Their old next-step, dependency and instruction-withdrawal statements are historical and do not override the current owner instructions, applicable AGENTS files or current flow/decision docs.

**16 October — SVG web warning fix:** Replaced the native-only `accessible={false}` prop on both auth SVG roots with `aria-hidden`, following a focused reproduction of the React DOM warning. See [auth flow checks](auth-onboarding-flow.md). Browser/native review remains pending; account-policy decisions and screen flow are unchanged.

**16 October — social-button follow-up:** Refined Google/Apple button proportions, border weight and icon alignment against reference 03. Both auth screens share the correction; see [current auth flow](auth-onboarding-flow.md). No scope/backend decision changed; owner rendered review remains pending.

**16 October — auth input follow-up:** Applied reference-03 field-specific charcoal outlines, semibold inside labels, masked crossed-eye glyph and violet focus treatment through an opt-in account appearance. Other screens retain their respective styles. See [current auth flow](auth-onboarding-flow.md); rendered review remains pending after the preview tool failed to start.

**16 October — current auth UI increment:** Email-verification and new-password screen previews extend the existing account/recovery flow, with reference-informed mail artwork and restored CTA arrows. See [auth onboarding flow](auth-onboarding-flow.md) for routes, unavailable-service behavior, owner checks and next work. No connected authentication or verification requirement is introduced; B1-05b remains open. This checkpoint supersedes earlier auth next-step notes below.

**Reference edge correction, 16 October:** Auth AccountHero now extends through the Screen's 20px right content inset to the viewport edge. Portrait/backdrop are clipped at that edge; form fields and left title keep their inset. Owner should specifically compare the right edge on both sign-in and signup at narrow/default/larger text sizes. This remains part of the same unaccepted visual refinement task.

**Final SVG correction, 16 October:** After further owner feedback, account backdrops now use separate editable Path contours in AccountBackdrop.tsx, not native block shapes or raster approximations. Added Expo SDK57-recommended react-native-svg 15.15.4 and installed it with scripts disabled; package/lockfile changes belong to this visual task. Native/web runtime checks remain owner-run. Preserve the pale lilac account-only page tint, reference-reconstructed portrait cutouts, official multicolour Google asset, Apple option, inside-label fields and account spacing. Earlier backdrop PNG/script experiments were removed before commit. SVG/portrait reconstruction is not recovered original source or pixel-exact acceptance. Final asset provenance/prompts: apps/mobile/assets/auth/ARTWORK.md.

**16 October final account visual refinement:** Owner requested closer reference-03 centre/right fidelity, including portraits, backdrops, Google/Apple, fonts and placement. Reconstructed portrait cutouts from the screenshot replace the earlier different subjects. Clean code-authored transparent lavender jagged and yellow rounded/notched backdrop assets replace block shapes/generated glow. Account page only uses pale lilac #F8F5FC; input surfaces stay white. Optional inside-label treatment in shared InputField, account-specific tighter Screen spacing, Poppins hierarchy, right-aligned recovery and text switch links refine placement without changing other screens' default layouts. Google now uses the official multicolour asset, Apple the installed mark; both actions remain explicitly unavailable. No real login, provider configuration or sample-fill action. Source/asset inspection and scoped formatting/whitespace only; owner rendered/native/narrow/larger-text/keyboard review pending. Reconstructed portraits are approximations from low-resolution references, not retrieved original stock files. Prompts/provenance and backdrop source are in assets/auth/ARTWORK.md.

**16 October account artwork refinement:** Rechecked reference-03 centre sign-in/right sign-up. Account screens now use transparent lavender-clothed portraits over native yellow/lavender angular layers, cross/ray accents and a back/badge top bar. Google and Apple options appear below the divider on both sign-in and sign-up at the owner's request; selecting one displays unavailable-provider feedback without login. Account service notice moved below the form. No example-fill action restored. Owner composited-screen/native/keyboard/larger-text review pending; scoped source formatting/whitespace only. Next: visual acceptance and B1-05b/provider configuration decisions before connected identity.

**16 October — account screen prototypes:** Settings → Account → Sign in or create an account opens mobile email/password sign-in, self-registration and recovery screens. Reference 03 informs illustrated pastel headers and outlined shared fields. Registration has optional display name and password confirmation; show/hide, empty/email/mismatch validation and navigation work in source. Valid forms show explicit service-unavailable feedback, never success. Terms/privacy are unavailable information rather than a false agreement checkbox. No auth/network/storage/profile/progress change; Welcome remains the confirmed optional name flow. Owner runtime/visual review pending. Next: review these screens; agree B1-05b verification/recovery and class admission plus staff authority before connecting services.

**16 October owner decision — self-onboarding:** Adults create their own learner accounts with email/password; no prior invitation is required for registration. Account creation is separate from class membership and staff permissions. The backend proposal records B1-05a as confirmed; B1-05b still covers verification/recovery, class admission and staff identity rules. No service configuration or authentication implementation. Next design task may prototype self-registration/sign-in/recovery against references 02–04 while unresolved behavior remains explicitly unavailable.

**16 October — LMS-B1 contract refresh:** [Backend proposal](backend-contract-proposal.md) now reflects teacher course releases, admin operations and the complete sample learner course journey. The owner confirmed **email/password adult learner sign-in**. Added a decision register separating that choice and automatic quizzes from unresolved pilot ownership, registration/recovery, staff authority, release/version/completion and data lifecycle policies. Immutable release binding, version-bound scores and isolated sample progress remain proposals. LMS-B1 is still open; no migrations, auth configuration, live connection or grants. Next: owner choices B1-04–06, then approve the release/assessment/lifecycle subset before LMS-B2. Learner/teacher/admin runtime and visual acceptance remain pending.

**16 October — LMS-L1 post-quiz flow:** Quiz results now include course identity, quiz-finished count, an unfinished lesson suggestion and curriculum access for lessons in the sample course. All quizzes finished shows a revisit message. Review/retry and See my progress remain. Reference-07 next-action rows are reused. No completion rule, storage, score or backend changes. Owner runtime/visual review pending. Next: review the complete learner course journey; LMS-B1 adult access/content decisions remain the next connected-work gate.

**16 October — LMS-L1 discovery/resume follow-up:** Home and Lessons now share a course journey card with live lesson-quiz counts, loading/recovery states, curriculum access and Continue course once a lesson has started. The curriculum and cards use one derived summary, preserving stable lesson IDs and existing storage. Reference 05 informs the outlined lavender-accent card; narrow/larger text stacks the card header. Owner visual/runtime review pending. Next: learner post-quiz return to course, then LMS-B1 content/access decisions before connected work.

**16 October — LMS-L1 sample learner course journey:** Lessons → Explore course opens Faith for everyday life, with two modules referencing the four existing sample lesson IDs. The curriculum shows reading duration, quiz-finished counts and per-lesson reading/completion state; Continue prioritizes an unfinished started lesson, then the first unfinished lesson. All finished offers Revisit course. Lessons stay freely accessible in any order and retain their existing overview/reader/quiz routes, bookmarks, reading positions and best scores. Lesson overviews link back to the curriculum. Progress loading/read failure is distinct from zero completion; the global recovery notice remains authoritative. No enrollment, certificate, publication/version policy, teacher-draft synchronization, storage schema or backend connection was introduced. Reference 07 informed the lavender course summary and grouped numbered curriculum; this is an intentional SundaySeeds sample adaptation. Owner review: Lessons → Explore course → lesson → read/quiz → return to curriculum; partial/all completion, saved lesson, recovery, direct route, narrow/larger text and bottom navigation. Source formatting/whitespace checks only; runtime/build/typecheck/lint and visual acceptance pending owner. Next: owner review of LMS-L1, then learner course discovery/resume refinements and LMS-B1 content/access decisions before connected work.

Updated 16 October 2026. This plan turns the reference designs into a sequence of complete learner flows. It separates implemented functionality, remaining design work and owner acceptance; a working screen is not automatically a finished design.

**Learner design source is implemented through O2.** The owner confirmed optional name setup/replay working visually; remaining screen acceptance, tests and runtime/native coverage stay pending. D1–D4 discovery, L1–L3 learning-flow, P1 Progress and S1–S2 Profile/Settings designs are implemented and awaiting owner runtime/visual review. The owner approved the teacher/admin design direction and requested LMS expansion, with the full reference-12 Settings components prioritized first. Dashboard design acceptance does not establish backend or automated-check readiness.

**Current dashboard action:** LMS-T1–T6 and LMS-S1 editorial studio are implemented in source, including class/enrollment simulation and labelled example reports. LMS-A1 People/Organizations/Invitations prototypes are also implemented in source. LMS-A2 Access proposal/review/safeguard screens are implemented in source. LMS-A3 Settings defaults/view/support controls are implemented with concrete consumers. LMS-A4 audit/operations examples are implemented in source. Next is LMS-L1 course-aware learner journey planning/prototyping alongside LMS-B1 contract decisions, using the [LMS implementation plan](lms-implementation-plan.md). Reports, scoped administration, integration and release remain separate tasks. Knowledge checks show correct answers/explanations automatically; no teacher grading queue is required.

**15 October publication checkpoint:** lesson cards offer Publication review with readiness checks, draft/snapshot preview, confirmed simulated publishing and version history. Publishing freezes a copied lesson snapshot; saving later edits creates a working draft without changing earlier snapshots. Withdrawal retains history/draft and clears simulated availability. Archive also blocks editing/publishing; restore returns to a draft without republishing. Course links remain stable. Reference-07/08 informed grouped readiness, fine outlines, pastel states and preview hierarchy; publication-specific controls adapt the approved dashboard language. This is lesson-level page-session simulation, not a course-wide publication or backend implementation. Real version/access/progress/withdrawal decisions remain LMS-B1. Owner runtime/visual and automated checks remain pending; scoped formatting/source/whitespace checks only.

**15 October quiz-authoring checkpoint:** reference-08 informed lavender question cards, outlined options, mint checked-answer feedback and reading-to-quiz navigation. The optional lesson builder supports up to ten questions, two–four distinct options, one correct answer, explanations and question/option ordering/removal. Validation blocks incomplete quiz saves and attempts. Preview checks each answer immediately, preserves choices while moving among questions and provides actual attempt results, answer review and a fresh retry. Example course lessons contain labelled sample questions. All data/results remain temporary; no publication, learner progress, teacher marking or backend service was added. Owner confirmed the preceding LMS-T2 visuals; this added workflow and all automated/native checks remain pending.

**15 October structured lesson checkpoint:** the lesson editor now has outcomes, scripture, ordered titled reading sections, reflection, optional temporary cover selection/alt text/clear, unsaved learner preview and discard confirmation. Lessons can be edited directly from a module without losing their course links. References 07/08 informed outcome tiles and reading navigation; sample lessons retain their text in two sections. The preview accepts incomplete content for inspection; saves require a title, complete sections and image alt text. Prototype limits: six outcomes, twelve sections, PNG/JPEG/WebP up to 5 MB; durable media contracts remain open. No uploads, publication, quiz authoring or backend integration. New workflow and image/focus/narrow-layout checks remain with owner; scoped formatting and whitespace checks only.

**14 October course-outline checkpoint:** references 07/05 informed the new teacher Courses tab. Teachers can create/edit course details, add/rename/reorder modules, attach/reorder/preview/unlink existing lesson drafts and confirm course/module removal without deleting drafts. Blank-title and empty states are included. Feature-hook state survives tab/workspace switching and resets on refresh. No publication, persistence or backend service was added. Owner workflow, narrow/large-text, keyboard and automated checks remain pending; scoped source formatting and whitespace checks only.

Owner refinement in this increment: clarify Course → Modules → Lessons with a three-step guide, create-and-attach lessons directly within a module, and provide an explicit editable example course with two modules and three labelled sample lessons. The example opens on request, preserves edits when reopened and adds no learner activity or membership records. This completes outline-flow clarity within LMS-T1; structured authoring remains LMS-T2.

**Parallel work approved, 14 October:** teacher and system-administration screen prototypes proceed before the connected pilot, alongside backend planning. The audience is adult learners; administration includes a system-wide super admin and evolving sub-admin roles. Detailed delegated permissions remain undecided. Follow the [parallel delivery plan](parallel-delivery-plan.md) and [decision 0003](decisions/0003-parallel-prototypes-and-administration.md). This changes the preparation order below; backend services and production dashboards are not yet implemented.

**React prototype checkpoint, 14 October:** `apps/teacher-web` now contains the teacher and admin screen proposals in React + TypeScript, as selected by the owner. Teacher draft create/edit/preview, admin directory filters/scope proposals and optional illustrative charts are implemented in source. Radix primitives, Lucide and lazily loaded Recharts support the shared design. [Backend contracts and a conceptual access matrix](backend-contract-proposal.md) are drafted for agreement. Dependency installation, initial lockfile, build/type checks and runtime/visual review remain pending with the owner; see the [workspace README](../apps/teacher-web/README.md). Next learner implementation remains S2; next dashboard steps are layout/workflow acceptance and permission decisions, before connected work.

Latest screenshot feedback identifies the inner browser input focus rectangle. The shared web input now explicitly resets outline style/width/colour and box shadow, preserving the surrounding field's focus treatment. Rendered confirmation remains pending; the fix is preserved in D4.

**14 October stroke correction:** the owner requested the lighter bottom-navigation frame and a screen-specific border audit, explicitly rejecting a global dark-to-gray substitution. Reference-matched changes are limited to Profile/Progress frames, quiz-choice/next-action/reader rows and the completion emblem. Strong Home/discovery/lesson/Welcome outlines, shared button/card defaults and input focus behavior are preserved. See the stroke matrix in [design-reference.md](design-reference.md). The owner subsequently confirmed the visuals for `bd8a243`; platform/device and automated-check coverage were not supplied. This is a separate corrective task, not completion of O1 or LMS-T1.

**Owner-requested addition during D3:** shared InputField provides consistent idle/focus treatment. After owner feedback, Search uses its borderless soft variant with lavender focus fill and an unboxed clear icon; Edit Profile retains the outlined variant and Browse's entry retains its keyboard-focus styling. Source inventory found no other editable inputs. Visual review remains pending.

## Delivery agreement

- Build the React Native + Expo + TypeScript app in `apps/mobile`, following its working agreement and existing feature boundaries.
- Inspect the relevant reference panels before each screen change. Keep the pale lavender, mint, yellow and peach palette, dark fine outlines, modest radii, geometric type and crisp offset shadows. Adapt course content to Sunday school without inventing unavailable services.
- Complete one screen group through small, coherent commits, then move to the next group. Revisit earlier screens for owner feedback, broken interactions or shared-component regressions rather than open-ended polish.
- The owner handles terminal-heavy checks, runtime testing and visual review. Provide a short handoff with affected screens, actions to try and known limitations. Do not run builds, tests or review jobs unless the owner requests them.
- Record implementation and acceptance separately. Pending owner review can remain queued while the next screen is implemented; it must not be reported as a pass. Native verification cannot be inferred from web previews.
- Keep sample content identifiable and explain storage once in Settings. Do not repeat local/device/preview labels across learner screens. Every visible control must work; omit controls whose underlying feature is not implemented.
- The two existing lint issues are deferred at the owner's request. They are not the next product task, but remain outstanding before release.
- Maintain `CHANGELOG.md` and document material architecture decisions in `docs/decisions`. No production accounts, class memberships or backend connectivity are assumed.

## Current baseline

The app already contains functional versions of welcome, Home, lesson browsing/topics, lesson detail, reader, quiz/results/answer review, progress, profile editing and settings. Four sample lessons support bookmarks, reading positions and best quiz scores on the device.

Recent increments added lesson outcome tiles, completed-lesson revisiting, explicit storage-recovery retries and Home/lesson-card layout changes. The 12 October Home design increment is implemented but has not completed owner runtime or visual review. Earlier verification records remain in [verification](verification); they do not establish acceptance of later changes.

There is no connected authentication, real class enrolment, production teacher publishing, notifications service or download manager. Teacher/admin screen prototypes exist in `apps/teacher-web`; see the [LMS plan](lms-implementation-plan.md) for their current source status.

## Phase 1 — Complete the learner frontend designs

All tasks below build on the existing app. They are remaining design/interaction work, not a claim that their screens are entirely absent. Their acceptance criteria are targets for the owner's review.

| Order | Screen group | References | Starting point / status |
| --- | --- | --- | --- |
| D1–D4 | Lessons discovery | [06](references/reference-06.png) | D1–D4 implemented; owner runtime/visual review pending |
| L1–L3 | Lesson overview, reader and quiz | [07](references/reference-07.png), [08](references/reference-08.png) | L1–L3 implemented; owner runtime/visual review pending |
| P1 | Progress dashboard | [05](references/reference-05.png) middle/right, [09](references/reference-09.png) right | Implemented; owner runtime/visual review pending |
| S1–S2 | Profile and settings | [12](references/reference-12.png) left/right | Both implemented; owner runtime/visual review pending |
| O1–O2 | Welcome and profile setup | [01](references/reference-01.png), [02](references/reference-02.png), [04](references/reference-04.png) | Welcome and optional name setup implemented; owner acceptance pending |

### 1. Lessons discovery — implemented, acceptance pending

**D1 implementation checkpoint (12 October):** compact browse header/search, lavender portrait hero with working topic action, sample-lesson heading/count and clear controls are implemented. Existing outlined lesson cards, combined status/topic/query filtering, bookmarks and anchored navigation are retained. Hero stacks below 350 logical pixels or at native font scales of 1.5 and above. Owner testing and visual acceptance are pending; no tests, builds or runtime review were run for this increment.

**D2 implementation checkpoint (12 October):** topic tiles now use compact outlined pastel rows, aligned icons and actual collection counts. The final full-width All lessons tile adapts the reference's last row and opens the complete sample collection. Below 350 logical pixels or at native font scales of 1.5 and above, topics use one column. The four existing topics and navigation remain; no extra categories were invented. Owner testing and visual acceptance are pending; no tests, builds or runtime review were run.

**D3 implementation checkpoint (12 October):** Browse's search entry opens `/lessons/search`, carrying its topic and status. The dedicated screen has an editable query (subsequently changed to a soft borderless treatment at the owner's request), matching counts/cards, removable context labels, separate query/filter clearing and empty-result recovery. Both screens share matching logic; query/topic/status live in the search route, with normal stack Back retaining browse context. Direct-entry Back falls back to Lessons. No inactive instructor/course tabs or sorting claims were added. Formatting was applied only to changed source files; tests, typecheck, lint, builds and runtime/visual review remain with the owner.

**D4 implementation checkpoint (12 October, updated after owner feedback):** Browse and Search share an icon-only filter control with no adjacent summaries/chips. The scrollable panel allows one optional topic and one optional status; tapping a selected option turns it off. There are no mandatory All selections: zero selected filters means no topic/status restriction. Opening copies applied values into a draft; Clear resets only the draft, Apply commits it (including zero filters), and Cancel/close/system Back discards it. Search text remains applied and a live count previews matching lessons. The active count remains in the accessibility label, with lavender fill indicating an active restriction. Narrow/large-text choices stack. No storage changes or dependencies; tests, typecheck, lint, builds and runtime/visual review were not run. L1 is next.

**D1. Browse lessons:** implement reference-06's left-panel hierarchy: search entry, compact illustrated hero, section headings, outlined lesson cards and anchored navigation. Use sample lesson groupings, with no fabricated popularity, ratings, teachers or class data.

**D2. Topic grid:** finish the middle-panel tile proportions, icon placement, colours, counts and spacing. Keep the existing Faith, Kindness, Courage and Prayer topics; counts come from the available lessons.

**D3. Dedicated search/results:** add the right-panel search experience, including query editing/clearing, matching results, result count, back navigation and a useful empty state. Search lesson titles, topics and scripture. Do not add inactive instructor or course tabs.

**D4. Filters:** provide a working filter control for topic and All, Saved, In progress or Completed status. Preserve combinations with search; support clear/apply behavior as appropriate to the chosen control. Do not add unsupported rating, price or difficulty filters.

**Owner acceptance:** browse -> topic/search -> results -> matching lesson works; filters and counts agree with the sample collection; back navigation preserves intended context; empty results can be cleared; bookmark state stays consistent across Home and Lessons.

### 2. Learning flow

**L1 implementation checkpoint (12 October):** reference-07's overview/curriculum hierarchy now appears through a compact portrait header with title/subtitle/scripture, bordered metadata row, icon-and-copy learning tiles, grouped reading rows and a mint quiz entry showing an actual best score only when completed. Resume highlighting, bookmarks, progress/storage notices, memory verse and fixed Start/Continue/Revisit actions are preserved. Header/metadata/outcomes adapt below 350 logical pixels or at fontScale >= 1.5. No fabricated instructor, pricing, enrolment or per-reading completion. Source formatting only; automated checks and runtime/visual acceptance remain pending with the owner. L2 is next.

**L1. Lesson overview:** carry reference-07's overview and curriculum hierarchy through the remaining detail layout. Preserve the learning tiles, scripture, metadata, memory verse, section list, reading-position marker and Start/Continue/Revisit action. Adapt enrolment/payment treatments to the already-available sample lesson; no paid-enrolment controls.

**L2. Reader:** complete reference-08's reading hierarchy, section indicator, reflection/memory-verse treatment and previous/next actions. Reopen the saved section and preserve completed status when revisiting. Use text lessons; video, resource downloads and personal notes are not part of this increment unless their behavior is separately scoped and implemented.

**L2 implementation checkpoint (13 October):** compact section header, explicit reading-position bar with separate completion/revisit text, section-specific reflection cards, memory verse and a working Up next row now adapt reference-08 to text lessons. Original content is preserved; recognised reflection paragraphs are presented as cards instead of being followed by a duplicate generic prompt. The fixed Previous/Next/Take quiz controls stack below 350 logical pixels or fontScale >= 1.5. Initial position recording, saved-section navigation and storage recovery remain; reading the final section does not mark completion. Only changed files were formatted; tests, typecheck, lint, builds and runtime/visual review remain pending with the owner. L3 is next.

**L3. Quiz and results:** finish the lavender question card, outlined choices, selected/correct/incorrect states, explanations, completion presentation and answer review. Preserve unanswered-question handling, retry behavior, best scores and storage-recovery feedback.

**L3 implementation checkpoint (13 October):** reference-08's compact quiz composition now has a grouped checked-answer progress bar, lavender question card, outlined choices with dark selected letter badges, explicit checked-answer labels and pastel explanation cards. Checking all answers is distinct from finishing the quiz. Reference-07's completion treatment is adapted to a mint check, sample-lesson portrait summary, separate this-attempt/best-score figures and working outlined review/retry rows. Lesson/score layouts stack below 350 logical pixels or fontScale >= 1.5; badges grow with text. Storage-error wording replaces unconditional save wording; existing global recovery and scoring remain. No passing threshold, certificates or attempt history. Only changed source formatting and whitespace checks were performed; tests, typecheck, lint, builds and runtime/visual review remain with the owner. P1 is next.

**Owner acceptance:** complete Home -> lesson -> reader -> quiz -> results -> progress; restore reading position and saved results after restart; revisit without losing completion or best score; distinguish reading position from quiz completion; exercise unanswered, incorrect-answer and save-failure states.

### 3. Progress dashboard

**P1. Dashboard:** implement the reference's encouraging summary, completion visualisation, pastel statistics and outlined lesson-progress rows. Show actual completed lessons, in-progress lessons, saved lessons and best quiz scores where useful. Include a useful first-use state and links back into learning.

**P1 implementation checkpoint (13 October):** references 05/09 now inform a lavender portrait hero, overall completion count/percentage/bar, four pastel statistics and outlined portrait lesson rows. Counts use current sample lessons; average best score includes genuine zero scores and states its quiz denominator. Saved-only, fresh/reset, started and all-completed states use appropriate copy. Loading/read failures withhold dashboard figures; save failures keep current session figures with warning wording and existing global retry. Reading position remains separate from quiz completion. Hero, tiles and lesson rows stack below 350 logical pixels or fontScale >= 1.5. The overall bar adapts the reference's circular visual without adding a chart dependency. No time filters, historical charts, hours, streaks, XP or certificates. Source formatting/whitespace checks only; tests, typecheck, lint, builds and runtime/visual review remain with the owner. S1 is next.

Do not display learning hours, streaks, weekly graphs, XP or historical activity that the app does not record. Reference-10's history timeline requires an explicit event-history feature and is deferred.

**Owner acceptance:** totals agree with stored learning; a finished quiz updates the dashboard; each lesson opens the correct destination; fresh/reset data does not show invented activity; storage failures remain understandable.

### 4. Profile and settings

**S1. Profile:** finish the reference-12 profile header, personal summary, genuine local-learning statistics and grouped navigation rows. Keep the optional display-name editor and clearly identify the local preview.

**S1 implementation checkpoint (13 October):** reference-12's lavender identity card, edit affordance, compact statistics and outlined navigation groups are implemented. The generic avatar represents a device-local profile; real completed/in-progress/saved counts replace enrolment/certificate/streak data. Profile name and learning data have independent loading/failure presentation; unavailable values are not shown as an empty name or zero counts. The header and statistics stack below 350 logical pixels or fontScale >= 1.5. Existing editor/save/cancel, Saved, Progress, introduction and Settings destinations remain. No account, biography, skills, goals or uploads were added. Three changed source files formatted and whitespace checked; tests, typecheck, lint, builds and runtime/visual review remain with the owner. S2 is next.

**S2. Settings:** finish Personal information, Learning data, introduction replay and About/support presentation using the grouped outlined-row design. Keep the existing confirmed reset behavior and error recovery. Only include support links with real destinations; account settings arrive with authentication.

**S2 implementation checkpoint (14 October):** reference-12 right now informs compact white outlined groups, simple leading icons, separators and smaller section headings. Display name opens the existing editor; introduction replay opens the existing Welcome flow, whose completion returns Home. Storage is explained once in a static row; About shows the version and actual sample collection size. The reset action remains separate beneath the groups, with confirmation/cancel, duplicate-action protection and busy/success/failure messages preserved. Name and welcome preference survive learning reset. Row copy wraps without fixed heights; informational rows have no navigation arrows. No password, sign-out, notification or unsupported support links. Source formatting/whitespace checks only; tests/typecheck/lint/builds/runtime and visual acceptance remain with the owner. O1 is next.

**S2 owner-requested reference completion (14 October):** the owner explicitly asked for the remaining Settings components from reference-12. This reopens their **screen presentation**, overriding the earlier omission of unavailable controls without bringing forward their services. Account now includes Personal information, Change password and Email preferences. App Settings includes Appearance, Language, Video playback, Download quality and Data usage. Support & About includes Help Center, Privacy Policy, Terms of Service and About; Log out is visible but disabled because no account is signed in. Existing editor/replay/reset actions remain. Detail sheets explain availability, show current Light mode/English, provide useful help and hold the single storage explanation under Data usage. Password/email/video/download services and official policy/terms documents remain unavailable and are marked accordingly; there are no pretend toggles, saves, published policies or logout actions. Larger text moves values below row titles. Owner runtime/visual checks remain pending.

Further owner corrections in this follow-up: Settings includes anchored bottom navigation, with Profile active, and uses light-gray one-point card outlines matching reference-12 instead of dark borders. Existing Home/Lessons/Progress/Profile destinations are preserved. Owner should compare the cards, bottom safe area and active tab against the reference; these changes have not been runtime-verified.

**S1 owner correction (14 October):** name/edit and avatar now share one compact row, with the redundant profile banner removed. White outlined icon/count tiles sit directly beneath the profile card; long names and larger text retain adaptive layout. Repeated local/device/preview labels are removed across learner screens, with one storage explanation in Settings. Data, reset and recovery behavior remain. Formatting/whitespace inspection only; owner acceptance pending.

**Owner acceptance:** profile edits update the greeting and persist; save/cancel return correctly; reset confirmation can be cancelled and clears only learning data when confirmed; rows have real destinations. Notifications/downloads, password changes and sign-out are not presented as working in the local demo.

### 5. Welcome and profile setup

**O1. Welcome:** finish reference-01's three-page composition with Sunday school copy, prominent imagery, pastel feature cards, page indicators and Back/Next/Skip/Get started behavior. Preserve replay and the saved welcome preference.

**O2. Minimal setup — source implemented:** references 02 and 04 inform one optional display-name flow, not duplicate flows. Reuse the optional display name. Topic preferences may be introduced only with a concrete local effect, such as ordering suggested lessons; otherwise defer that step. Do not collect email, country, birth date, skill level or study goals merely because the reference includes them.

**Owner acceptance:** first launch and replay behave correctly; skipping optional setup still reaches Home; preferences persist without altering learning progress; no unsupported account or recommendation claims appear.

### Frontend acceptance gate

The owner reviews the screen groups using [design-reference.md](design-reference.md): 360 × 800 and 390 × 844 layouts, 150%/200% text size, touch targets, readable contrast, safe areas, navigation, empty/loading/error states and persistence. Record intentional Sunday school adaptations and outstanding differences.

Phase 1 is accepted only when the complete learner journey and required native checks are recorded and the owner approves the visual result. Implementing the remaining groups can continue while earlier reviews are pending.

## Phase 2 — Connected pilot and authentication

**Confirmed:** adult learners self-register with email/password without an invitation; account creation is separate from class membership and staff permissions. System-wide super admin with sub-admin roles to be defined. **Dependencies:** confirm the first pilot group, curriculum owner, verification/recovery and class-admission rules, teacher provisioning, delegated admin scopes and content/translation permissions before implementing production account/access behavior. Backend planning and teacher/admin prototypes can proceed in parallel now.

1. Introduce Supabase schema/migrations and access rules for the agreed pilot.
2. Connect the existing login/signup/recovery previews through approved service outcomes, using [reference-03](references/reference-03.png) and the [auth flow](auth-onboarding-flow.md). Working authentication methods require configured providers. The owner-requested Google/Apple UI remains explicitly unavailable until configured; its presence is not approval of provider or account-linking policy.
3. Implement class invitations and joining, published lesson access and saved attempts. Replace local data access behind the established feature boundaries.
4. Decide explicitly whether/how sample device-local progress transfers to an account; do not silently upload or merge it. Add truthful loading, offline/session-expiry and retry states.

**Acceptance:** a learner joins the intended class and completes a published lesson; access checks prevent reading another learner's results or another class's restricted data; learner accounts cannot publish lessons; interrupted requests have clear recovery behavior. Required checks must be scheduled with the owner before declaring this phase complete.

## Phase 3 — Teacher publishing

Build a small responsive web dashboard for assigned teachers to draft, preview and publish text/image lessons and quizzes, then view genuine class completion. There is no supplied teacher-dashboard reference; agree that layout using the established visual language before implementation.

Teacher and administrator layout proposals now run ahead of the connected pilot. The administration track covers system oversight and explicitly delegated access; detailed sub-admin capabilities remain proposed. Production publishing and privileged administration still depend on backend contracts and access rules. Prototype review is not production acceptance.

**Acceptance:** a teacher prepares and publishes a weekly lesson without editing code or database records. Drafts stay private, unassigned classes are inaccessible and learners see only published content.

## Phase 4 — Reliability and real-class pilot

Build on local recovery already implemented. Add connected reading-position recovery, cached text lessons, clear network feedback and duplicate-submission protection. Run the app with real class content across several Sundays and use learner/teacher feedback to set priorities.

**Acceptance:** restarts and interrupted connections do not silently discard supported saved work; learners understand their saved state; observed pilot feedback determines the next scope. Full offline quiz synchronisation remains deferred unless separately agreed.

## Phase 5 — Android release

Complete native device coverage, accessibility review, required automated checks, deferred lint cleanup, account lifecycle requirements, app assets and release configuration. Configure appropriate crash reporting and prepare accurate privacy/store information. Release testing belongs to the owner under the current division of work; unperformed checks stay open.

**Acceptance:** a concrete release candidate passes its recorded checks and the owner approves the build and publishing details. iOS follows separate platform validation. No release date is assumed in this plan.

## Deferred reference screens and features

| Design / feature | Reference | Why it is deferred |
| --- | --- | --- |
| Assignments and submission | 09 left/middle | Needs an agreed teacher assignment and learner submission workflow |
| Badges, certificates and learning-history timeline | 10 | Outside the current MVP; needs real earning rules and/or recorded events |
| Forums, private/mentor chat and live sessions | 11 | Outside the MVP; needs a clear class use case and operational ownership |
| Notifications and downloads | 12 middle | Needs actual notification delivery or downloadable content plus storage behavior |
| Extended personalisation, goals, profile fields and avatar uploads | 02, 04, 12 | Add only fields/settings with an agreed purpose and implemented behavior |
| Payments, leaderboards, complex analytics and full offline quiz sync | Various / none | Add only after pilot evidence and explicit scope agreement |

These omissions are deliberate scope decisions, not completed screens. Revisit them after the core learner and teacher workflows work for the pilot.

**15 October priority update — LMS-S1 editorial studio:** the owner moved course creation ahead of LMS-T5 and authorized adapting the reference visual language to new studio features. Source now provides a full-page course brief (audience/outcomes), persistent ordered module/lesson outline, lesson reuse/removal, focused Details/Reading/Reflection/Quiz editing, unsaved preview, saved preview, independent saved-draft duplication, course content review and inline simulated-publication/version review. Confirmed course/module removal keeps independent lesson drafts. Dirty brief/lesson navigation asks before discarding. Explicit validated Save remains required; no autosave or durable service. Course review reports actual draft content, not learner analytics or whole-course release readiness. See decision 0004. Classes/enrollment remain next after studio feedback; backend contracts remain planning. Mobile O1 Welcome proceeds in parallel at the owner's explicit request, with its own task commit. Runtime/visual/build/typecheck/tests remain with the owner.

**15 October O1 source checkpoint:** implemented in parallel with teacher studio at the owner's request. Reference-01's three panels inform the compact introduction, larger bounded imagery, paired pastel stickers with strong outlines/offset shadows, working feature-card arrows, uniform circular indicators and responsive Back/Next/Get started footer. Existing SundaySeeds imagery/copy is retained rather than inventing instructors/certificates. Completion preference, Settings replay, Skip and save-error recovery use unchanged hooks. Footer actions stack below 350 logical pixels or at fontScale >= 1.5. Scoped formatting/source/whitespace checks only; no tests/typecheck/lint/builds/runtime/native checks. Owner: Settings → Replay introduction; inspect all three pages, feature arrows, Back/Next, Skip/Get started, Home return, preference persistence, failure recovery and narrow/larger text. Next mobile task is O2 minimal setup, separate from teacher LMS-T5 and backend planning.
**15 October O2 implementation checkpoint:** references 02/04 were inspected as alternative treatments for one optional display-name step, not two setup flows. First-run Welcome → Get started → optional name → Home reuses the existing profile hook and storage. Initial Skip bypasses setup; setup Skip keeps the existing name untouched; Back returns to the final introduction page. Safe hydration precedes editing, failed reads offer retry/skip, failed saves retain typed content, and welcome-preference failure retains retry/Continue for now. The lavender avatar, outlined shared input, single progress strip and mint purpose note adapt the references without unsupported personal fields. No routes, storage keys, schema or dependencies changed. Existing completed users keep Home; Settings replay now offers optional name setup after Get started, following the owner's inability to reach the first-run-only step. No data reset is required. Owner checks name/blank/skip/Back, Home/Profile persistence, read/save errors, Profile Edit, replay, 360/390 widths, 150%/200% text and keyboard. Scoped source formatting and whitespace checks only; tests/build/typecheck/lint/runtime/native checks remain pending. O1–O2 design source is complete; acceptance is still pending. Topic preferences, accounts and extended profile fields remain deferred.
**15 October LMS-T5 source checkpoint:** Teacher → Classes now provides an initially empty directory, search/status filters, a full-page class brief and class detail with Learning content/Roster/Invitations tabs. Explore example class explicitly loads fictional adult members and pending/expired invitation fixtures. Create/edit, course link/unlink, invitation acceptance/expiry/revoke/reissue, roster removal/restore and class archive/restore change only in-session simulation state; consequential changes use inline confirmations. Course choices use real authoring outlines; linking does not publish or select a released version or grant access. Deleted outlines show unavailable links that can be removed. Opening a course in the studio or switching teacher tabs/admin workspaces retains class state; refresh clears it. Loading/error screens are explicit presentation examples, not network activity or recovery evidence. No emails, join links, accounts, trusted expiry timestamps, real memberships, completion or analytics were added. References 05/07/12 informed pastels, fine screen-specific outlines and responsive surfaces. Owner checks create/edit/blank title/cancel, example directory/filter states, course link→studio→return, missing outline links, invitation duplicate/accept/expire/revoke/reissue, roster remove/restore, archive read-only/restore, retained state, keyboard and narrow/larger text. Scoped source formatting/whitespace only; tests/build/typecheck/lint/runtime/visual checks remain pending. Next teacher UI is LMS-T6 reporting with honest unavailable/sample data; connected data/authority remain LMS-B1–B5 decisions.
**15 October O2 replay correction:** the owner could not confirm the name step because existing completed users skipped first-run setup and replay ended at Home. Settings → Replay the introduction → Next → Next → Get started now opens the same optional name screen. Initial Skip still reaches Home; setup Skip preserves the current name; Back returns to the last intro page; save/read/preference recovery remains shared. The Settings description now advertises this path. No reset, new route, storage key or dependency. This supersedes earlier introduction-only replay notes. Owner should check replay with an existing name, changed name, Skip, Back and error recovery. References/layout remain unchanged; reference-02 re-inspected. Scoped source formatting/whitespace only; runtime/native acceptance and tests remain pending owner.
**15 October owner confirmation:** the owner confirmed the optional name-setup replay is working visually after `7e55e28`. This records acceptance of the reported setup/replay flow only; it does not establish automated tests, build/typecheck coverage, native accessibility/device coverage or acceptance of teacher reporting.

**15 October LMS-T6 source checkpoint:** Teacher → Reports starts with connected results unavailable. Explore example report opens independent, labelled fictional classes/courses/learners and fixed lesson-state records; authoring drafts and class simulations never become analytics. Class/course/lesson filters drive pastel metrics, lesson and learner tables, expandable learner details and an optional lazy Recharts snapshot with an always-visible exact-values table and load/error fallback. Expected states = selected learners × selected lessons. Completion among recorded states = finished checks ÷ known states; known/expected coverage and missing count appear beside it. Missing records are never silently not started or zero; entirely missing summaries use unavailable values. Explicit fixtures demonstrate recorded 0%, all-missing data, completed 0% score and completed-but-score-unavailable. Reading position differs from finishing an automatic knowledge check; no passing threshold/teacher approval is invented. These example measures do not finalize production course/version rules. No history/date filters, hours, answer-level data, real results, exports or backend integration. References 05/09 informed the stats/chart/progress presentation. Report state remains mounted across teacher tabs, studio entry and administration switching. Owner checks default unavailable, Explore example, Sunday mixed/partial records, learner B zero score/D missing score, New group recorded zero, Evening missing states, course/lesson filters, chart/table agreement, close example, retained state, keyboard and narrow/larger text. Scoped source formatting and staged whitespace checks only; tests/build/typecheck/lint/runtime/visual review remain pending. Next dashboard work is LMS-A1 people/organization screen prototypes, with permission/identity/contract decisions still required before connected services.
**15 October LMS-A1 source checkpoint:** Administration now has shared People, Organizations/classes and Invitations screens backed by one feature-owned in-session directory model. It starts empty; Explore example workspace loads fictional organizations, adult learners/teachers, scoped memberships and invitation states, preserving existing edits when reopened. People supports search/role/status filters, details, create/edit name/email and directory-record status. Organizations supports briefs, classes and scoped rosters; add existing people or confirm membership removal/restore. Invitations shows organization/class scope, create, accept, expire, revoke and reissue. Acceptance creates/reuses one person and membership atomically in the simulation and updates all three screens. Names/emails and duplicate enrollment are validated; archived scopes pause child mutations; inactive people cannot be newly enrolled. Archives retain records; restoring an organization keeps individually archived classes archived. Existing roles, class transfers and email changes with relationship history are deferred. Full-page forms protect unsaved Back navigation, and model validation messages remain visible. Counts describe simulated records, not live system activity. Admin state stays mounted across tabs/workspace switching and resets on refresh; teacher class simulations/reporting fixtures remain independent. No account, email delivery, join link, trusted expiry, privileged grant or backend service. See decision 0005. References 05/07/12 inform pastel headers, light detail frames and fine table/form outlines without changing shared defaults. Owner review: Administration → Organizations → Explore example workspace; open Garden Community / Sunday adult group, inspect teacher/learner scope and removed records; Invitations → Robin Lee → Simulate acceptance → People and roster reflect the same record. Try duplicate/role conflicts, archive/restore gates, inactive person restore, create/edit/cancel, repeated examples, filters, tab/workspace retention, narrow/larger text and keyboard. Scoped source formatting and staged whitespace checks only; tests/build/typecheck/lint/runtime/visual checks remain pending. Next is LMS-A2 Access UI proposals; actual delegated capabilities, bootstrap/recovery and grant authority remain LMS-B1 decisions.
**15 October LMS-A2 source checkpoint:** Administration → Access & roles now has full-page Role proposals, Assignment simulations and System safeguards. Proposals select a finite capability set and one active organization/class scope from the admin directory; no system-wide or delegation capability is offered. Existing role edits create revisions. Assignment review chooses an active directory person, shows the exact scope/capabilities and records a copied revision snapshot; stale review and duplicate person/role simulations are blocked. Later edits never change prior snapshots. Confirmed revocation preserves history and remains available when the person/scope becomes inactive/archived; new assignment requires fresh review. Directory classifications and memberships remain unchanged. The isolated safeguard walkthrough covers two/last/no example super-admins, blocks self/last removal, allows backup-only removal and resets examples; recovery/bootstrap remain an explanatory checklist, not a configured service. These are candidate rules, not approved production policy. Mounted Access tabs preserve proposals/reviews across admin tabs/workspace switching, reset on refresh. No real grants, accounts, delegation, audit events or backend; legacy RoleProposalDialog source is superseded and unreferenced. References 05/12 informed the full-page pastel/fine-outline adaptation. See decision 0006. Owner review: load directory examples; Access → Role proposals → Use example brief → save; Assignment simulations → propose/review/record; edit role revision and check old snapshot; reject duplicate/stale review; revoke/review fresh; inactive person and archived scope guards; safeguard scenarios/reset/recovery checklist; dirty Back/cancel, retained tabs, keyboard/narrow/larger text. Source formatting/staged whitespace only; tests/build/typecheck/lint/runtime/visual checks pending owner. Next LMS-A3 system settings requires concrete configuration consumers; actual capability/grant/bootstrap decisions remain LMS-B1.
**16 October LMS-A3 source checkpoint:** Administration → Settings separates workspace defaults from the table-view preference. Default class purpose prefills newly opened admin class forms; default participation and optional active organization/class scope prefill newly opened invitation forms. Existing records and already-open form buffers are unchanged. An archived/missing saved default class stays visible with a warning; new invitations fall back to no selected scope, and settings cannot be saved until a valid class or no default is chosen. The editable guide title/message appears on Admin Overview with working directory/settings actions. Comfortable/compact spacing applies to administrator directory and Access tables only. Independent forms have explicit Save, Cancel and dirty/saved status; Restore defaults loads a draft requiring Save. Values remain session-only and reset on refresh. Auth, email delivery, media storage and live access policies are marked unavailable without fake controls. Reference-12 informed light gray grouped cards and pastel accents; no shared stroke replacement. No backend/account/permission/storage changes. Owner checks Settings save → new class/invitation prefills; preserve an open form while changing defaults; edit existing records; archive default class and update selection; Overview guide; compact tables; independent dirty forms/cancel/restore; tabs/workspace retention and narrow/larger text/keyboard. Scoped source formatting/whitespace only; tests/build/typecheck/lint/runtime/visual checks remain pending owner. Next is LMS-A4 audit/operations UI with explicit examples and unavailable real events. The owner withdrew previously supplied AGENTS instructions on 16 October; direct conversation preferences for reference-based design, per-task commits, documented flow and owner-run runtime/terminal-heavy checks remain unchanged.
**16 October LMS-A4 source checkpoint:** Administration → Audit & operations provides an unavailable live-audit state and an opt-in, fixed fictional audit log. Search, organization/action/outcome filters and inclusive UTC date ranges lead to full event details with actor, scope, target, outcome, example request reference and selected before/after values. Invalid date ranges pause the list; no-match, explicit loading/read-error presentation and Back-to-filtered-list states are included. Denied/failed examples have no acknowledged changes. Fixtures are independent of directory, Access, Settings and teacher actions; no client operation is manufactured into a trusted event. Service availability is Not connected/No check performed for accounts/access, invitations, content/media and audit. Optional recovery examples cover delayed delivery, uncertain publication and unavailable history without running checks/retries/restores or changing records. Mounted tabs retain filters/details/scenarios across navigation; refresh resets view state. Reference-12 informed grouped activity presentation, pastel outcome states and fine light frames. No authorization, operational monitoring, audit producer/storage/retention, new grants or backend connection. Owner review: Audit & operations → Explore example audit log; search/scope/outcome/date combinations and invalid/no-match ranges; succeeded/denied/failed details and Back; loading/error examples; Service availability/recovery scenarios; tab/workspace retention, compact spacing, keyboard and narrow/larger text. Scoped formatting and staged whitespace checks only; tests/build/typecheck/lint/runtime/visual review remain pending owner. Teacher T1–T6 and admin A1–A4 source prototypes are now implemented, not accepted production features. Next is LMS-L1 course-aware learner journey planning/prototyping with stable sample lesson IDs, alongside LMS-B1 content/access decisions before connected work.
