# Auth onboarding flow

Updated 20 October 2026. The owner authorized the first identity/profile source
slice after contract draft v1, requested preparation for a new development project
with configurable domain/sender, and explicitly delegated the three dependency
installs. Source implementation is separate from service setup and acceptance.
Use the [Supabase setup walkthrough](supabase-setup.md) for the owner setup steps.

The earlier optional onboarding/content visuals (`752de75`, `f0b0792`) were approved.
The owner has since configured development environment values, Mailtrap sandbox
SMTP and both templates, and reports signup/email confirmation/sign-in reaching
Verified status. MCP catalog inspection found the expected profile table, policy,
functions and access grants in `sundayseeds-dev`; permission and runtime tests were
not run by the agent. The owner subsequently confirmed own-profile persistence and password recovery.
Broader platform/accessibility/security acceptance remains unreported. Missing environment
values still produce honest unavailable outcomes.

## Audit checkpoint — 21 October 2026

The owner requires screen-by-screen preservation and an audit checklist starting
at first launch. Follow [learner-screen audit](learner-screen-audit.md) before new
screen fixes. The unreviewed broad rewrite was reverted. Existing routes and
onboarding/auth behavior below remain the baseline; source-review findings include
stale account-choice availability copy, competing post-preference destinations,
verified Settings routing and pending edit-profile navigation review. Rendered/native
checks have not established visual acceptance. Do not redesign Home or shared UI
while fixing an individual identity screen.

## Verified course joining and reading — 21 October 2026

`/courses/[id]` now loads the verified actor’s own enrollment, offers explicit Join
for an open course and shows the learner’s pinned edition. Guest/unverified users
can open the existing sign-in/registration/verification routes, then return manually
through Browse courses. No stored return intent or automatic enrollment was added.
`/courses/[id]/lessons/[lessonId]` reads real teaching text only with current verified
session, active enrollment and exact available edition membership. Actor/session
changes discard old results and hide owned content. Sample learning stays separate;
connected quiz/learning-progress services remain next. Owner checks are pending.

## Course discovery checkpoint — 21 October 2026

Home → Browse courses (`/courses`) now loads public connected metadata; selecting
View course opens `/courses/[id]` with its real outline. The development course is
labelled and joining remains closed. The separate Sample course action preserves
the guest journey. These new screens do not create enrollment or connected progress.
Optional profile suggestions still describe sample content; account preferences
are not yet used to rank this connected catalog. Owner runtime/native checks pending.

## Product boundaries

Adults self-register with email/password without invitations. Registration, course
enrollment, class membership and staff authority are separate. The confirmed
future connected-course rules are verified email before Start, direct joining by
verified learners, and invitations for classes. This identity slice adds no
connected course gate/enrollment or class service. Existing sample lessons remain
available to guests; sample progress is not uploaded or merged into an account.

Welcome → optional account choice retains Create account, Sign in and Skip for
now. Skip opens Home through the existing welcome preference; Add a name retains
optional name setup. First launch and Settings introduction replay share internal
steps. Standalone account routes remain reachable from Settings. The signup name
is an independent optional account name, up to 40 characters; no guest-name copy
happens automatically. Signed-in Home uses the account name; signed-out Home uses
“Hello, learner!” regardless of a retained guest name (owner choice, 20 October).
Profile still uses the preserved guest name while signed out. Logout from Settings
returns to `/home` after acknowledged current-device sign-out. The dedicated Home
route avoids replaying incomplete onboarding on logout; the Home tab also targets
this route while recognizing `/` as Home when rendered after onboarding. Failed sign-out stays
in Settings with feedback; leaving Settings while a request is pending prevents a
late navigation from pulling the learner back.

## Current source flow

| Route | Behavior once configured |
| --- | --- |
| `/` first launch and `/welcome` replay | Introduction → optional account choice → shared forms. Skip remains available; no sample learning reset |
| `/sign-in` | Email/password submission; returned session required for success. Existing accounts must sign out before replacement. Failed email-confirmation sign-in offers verification options |
| `/sign-up` | Optional name, email, password (minimum 15 characters, preserved spaces), confirmation. Isolated signup never replaces the primary session; accepted requests lead to verification guidance, without claiming email delivery or login |
| `/forgot-password` | Requests a recovery email with a safe accepted/eligibility message. No reset token or password in ordinary navigation |
| `/verify-email` | Requests another confirmation email for the in-memory pending address or current account. Check verification validates an active account with Auth; without a session it requests normal sign-in after email confirmation, never a public email-status lookup |
| `/reset-password` | Explains that the latest recovery email is required; no unproven password form |
| `/auth/confirm?token_hash=…&type=email` | Explicit-action confirmation landing page. Captures proof in memory and strips parameters; only Continue exchanges it in an isolated client, clears the candidate and offers normal sign-in |
| `/auth/recover?token_hash=…&type=recovery` | Explicit-action recovery. Continue verifies the proof in an isolated client; shows the target email before password submission. Password success and session-revocation uncertainty are distinct. Fresh sign-in follows |
| `/settings` | Account email/verification status, verification entry, recovery entry and current-device sign-out to Home; unavailable social/email-preference features remain honest |
| `/profile` and `/edit-profile` | Own account name through feature hooks/RPCs while signed in; guest name through existing device storage otherwise. Profile provisioning/load failures are separate from authentication and support retry |

Proof routes are source-prepared for web hosting, not deployed endpoints. Standard
provider `ConfirmationURL`, implicit access-token URLs and PKCE-code callbacks
are not interchangeable with this token-hash contract. Custom email templates,
exact destination allowlists and hosting configuration are required. The HTTPS
landing page can be used on another device; the mobile app then signs in normally.
Localhost callbacks are for the same computer only. Follow the setup walkthrough.

## Session and data behavior

Feature hooks own SDK/storage operations; screens invoke their actions. The shared
client reads public environment settings, disables automatic URL session detection
and initializes lazily. Native credentials use chunked SecureStore writes with an
atomic manifest; browser credentials use tab-scoped sessionStorage. Browser SDK
channels are isolated per page so another tab cannot silently replace its actor.
Storage failures propagate safely. Post-commit native cleanup is best-effort:
unreachable encrypted chunks can remain after a cleanup failure, while the active
manifest/tombstone determines the acknowledged session state. Runtime durability
and failure-injection verification remain pending.

Restored identities are checked with Auth before profile operations; uncertainty
hides owned data and pauses writes. Confirmed invalid/expired identities clear
presentation and attempt current-device cleanup. Account-scoped requests pin the
initiating credential and discard responses after account/session changes. Profile
updates use expected revisions; conflicts require explicit reload before another
save, preserving the editor draft. Authentication/profile success are separate.

Confirmation and recovery candidates never become the primary account. Canceling
preserves any existing identity. A same-account password reset attempts actor-bound
local sign-out; a different active account remains intact. Password reset requests
provider-wide refresh-session revocation, reported separately if uncertain; access
JWTs can remain valid until expiry. Ordinary sign-out explicitly uses local scope
and leaves guest learning/name storage untouched.

Credentials stay in form state until submitted to Auth. Proofs/candidate sessions
remain in memory only. No credential/proof logging, analytics, query-param emails,
ordinary-navigation tokens, fabricated delivery or automatic sample transfer is
introduced. Google/Apple remain unavailable UI options. Terms/privacy remain
unpublished; they must be completed before public registration.

## Visual scope and owner review

Reference 03 remains the source for account portraits, pastel backdrops, inside-label
shared inputs, violet focus, primary arrows and shorter social buttons. Follow-up
and proof pages are intentional adaptations of this language; no full original
verification/reset reference exists. Preserve per-screen strokes and the unchanged
Home/discovery/lesson/Welcome defaults. Asset provenance:
`apps/mobile/assets/auth/ARTWORK.md`.

Owner actions before configuration: replay introduction → account forms → Skip,
standalone Settings entry, optional name setup, malformed/direct proof routes and
unconfigured submit messages. Existing guest name/progress/bookmarks must remain.
After configuration: run signup/duplicate signup, confirmation/resend, normal login,
profile provisioning/save/revision conflict, logout, recovery, expired/reused proof,
same-path fresh link, account A with account B's link, offline/storage failure and
slow request plus Back/Skip. Review narrow 360/390 widths, 150%/200% text, keyboard,
focus/error announcements and Android Back. Browser review does not verify native.

## Actual verification and next work

The approved dependency installation succeeded: `@supabase/supabase-js` 2.118.0,
Expo-compatible `expo-secure-store` ~57.0.4 and `react-native-url-polyfill` 4.0.0;
Expo added the SecureStore config plugin. Current official Supabase/Expo docs,
installed SDK source and reference 03 informed implementation. Independent source
review identified storage, browser-channel, focus and account-binding issues that
were corrected in source. Source formatting and whitespace review are separate
from execution evidence. Tests, typecheck/lint, builds, SQL application/permission
checks, runtime/native/security failure injection and rendered acceptance have not
been run for this increment. The two previously deferred lint issues remain.

Next: follow the new-project walkthrough, configure intended development settings,
perform owner acceptance, then scope authentic catalog/course joining. Class
invitation lifecycle and staff/publishing services retain their own decisions.

## Logout follow-up — 20 October

Owner requested logout → Home and chose a generic signed-out greeting after seeing
“Hello test.” Source review showed account state already clears on sign-out; Home
then restored the independent guest name. Home now reserves personalization for
signed-in accounts, preserving guest name/progress storage. Name setup/editor copy
points to Profile to match this behavior. No layout/stroke defaults changed.
Reference artwork and official SDK57/Router docs were inspected; scoped formatting
and source/whitespace review only. Owner checks: log out → Home → generic greeting,
refresh while signed out, sign in → own greeting, retained guest Profile name and
sample progress, and failed/slow logout after navigating away. Runtime/native and
automated checks remain pending.

## Password recovery acceptance and deferred polish — 20 October

Owner reports recovery passed. Requested read-only Auth logs confirm recovery and
proof exchange 200, password update 200, logout 204 and subsequent sign-in 200.
An earlier reset submission returned 422 `same_password`, correctly rejecting a
new password identical to the current one. Current reset source shows generic
feedback for that provider error. Owner explicitly deferred this copy correction
and other feedback polish to one consolidated app-wide sprint. No code/UI changes
were made; pending security/failure/native/automated checks remain separate.

## Next slice: optional learning profile — 20 October 2026

The owner requested onboarding that includes Bible-study familiarity, intended
study time and other preferences suitable for SundaySeeds. They selected placement
**after the first verified sign-in**, editable later in **Settings**, and confirmed
that learners can skip setup and return later. The approved flow is now implemented in source before connected course enrollment.
Its separate preference table/RPC migration is applied to the development project;
the existing signup and account-name profile contract are unchanged. Runtime and
permission/concurrency acceptance remain pending.

### Implementation checkpoint

Owner update: the onboarding flow has been reviewed. No detailed platform, failure,
accessibility or automated coverage was supplied, so the remaining checks below
stay open. The next priority is [real-world course-model research and scenarios](course-model-research.md),
then a course blueprint and focused catalog contract. This review does not select
the sample course for connected publication or accept the proposed edition policy.

- `/learning-profile` composes a feature-owned four-step editor. Verified Home
  entry opens it when the preference load succeeds with no saved row. Existing
  verified accounts also receive this one-time setup. Email-proof pages are never
  intercepted; unavailable loads never masquerade as a new account.
- `/learning-profile?mode=edit` is reachable from Settings → Learning profile.
  Back retains the draft; Cancel exits without starting a save. After Save has
  started, exit labels say Return/Continue and explain that navigation does not
  cancel the already submitted request. Session refresh retains the form draft;
  identity changes remount the form and mask the previous account's data.
- Skip exits to Home immediately and attempts answer-preserving dismissal. Local
  session suppression works even if persistence fails; only an acknowledged saved
  dismissal prevents prompting after another login/reload. Initial load failure
  offers retry/exit instead of writing guessed empty preferences.
- Final Save shows the acknowledged preference summary plus the actual sample
  course, with an optional topic/time-based lesson hint. `/courses` is a browsable
  course directory reachable from the result or Home → Browse courses. It contains
  the one bundled sample course; there is no connected content/enrollment service.
- Native/browser clients use actor-pinned requests, response validation and explicit
  revision conflicts. Screens use feature hooks, never storage/backend clients.
  Auth's validated-actor helper carries the existing session-generation guard.
- `20261020114334_learner_learning_preferences.sql` was applied to `sundayseeds-dev`
  through Supabase MCP; migration-list metadata confirms that actual version/name.
  The CLI is absent, so the remote-generated migration version was mirrored into
  source without a CLI install or invented timestamp. The original profile table
  was not replayed; its earlier manual-application history remains unreconciled.

Source/reference review, scoped formatting and whitespace review completed.
Independent reviews covered catalog truthfulness, actor isolation, revisions,
optional exits and navigation. MCP DDL success/history is deployment evidence only.
No tests, typecheck/lint, builds, advisors, SQL permission/concurrency probes,
browser/native runtime or rendered review ran for this increment. The owner owns
those checks; `.env.local` was neither read nor changed and no dependencies added.

Owner review:

1. Reload the running app; sign in with a verified account with no preferences.
   Check intention → topics (at most three) → familiarity → session time; Continue
   works unanswered, selected choices clear, Back preserves answers.
2. Save and inspect the summary, sample course and relevant lesson hint. View course
   opens the curriculum; View all courses opens the one-course directory. No course
   or class enrollment is created. Reopen Settings → Learning profile and check the
   saved answers, change/save, Cancel and reload/sign-out/sign-in persistence.
3. On an account without setup, Skip should return Home and, when acknowledged by
   the service, remain dismissed after reload/sign-in. Set up later in Settings.
   Simulate offline/failed loading/saving and ensure retry/exit retains the draft;
   session-only dismissal must not be mistaken for durable success.
4. Review session refresh while drafting, account switch isolation, slow Save then
   Back/exit, two-client revision conflicts and explicit reload/retry. Check Android
   Back, 360/390 widths, 150%/200% text, keyboard/focus and native/web separately.
   Database permissions/verification/concurrency acceptance follows the README.

### Research basis and limits

The owner requested more varied, purposeful questions and a course-list result,
then specifically asked for LMS platforms such as Udemy and Sunday school apps.
Official product/help documentation was reviewed on 20 October 2026; no live signup
flows were exercised and no private recommendation algorithms were inspected.
These are documented patterns, followed by a SundaySeeds design proposal:

| Product | Documented behavior | Transfer to SundaySeeds |
| --- | --- | --- |
| [Udemy learner onboarding](https://support.udemy.com/hc/en-us/articles/17015232224023-Personalize-Your-Learning-Experience-on-Udemy) | Questions about field, skills and professional goals lead to recommendations based on role/interests; Save and Exit and later editing are supported | Ask intent and interests, deliver a useful course choice, allow exit and revision. Career/occupation questions do not fit this learner flow |
| [Coursera course discovery](https://blog.coursera.org/from-catalog-to-compass/) | Career aspirations guide content recommendations | Connect a stated outcome to relevant available content; do not copy career labels or imply our app has an AI recommendation service |
| [BibleProject Classroom](https://bibleproject.com/classroom/) and [app getting started](https://help.bibleproject.com/hc/en-us/articles/4478975400727-I-m-new-to-the-app-How-do-I-get-started) | A foundational class is suggested for new Bible students; self-paced course and session lengths are distinct; app Home/Search support discovery and continuation | Offer a gentle starting suggestion, explain expected session time and preserve independent browsing |
| [Bible Engagement Project FAQ](https://bibleengagementproject.com/faq) | Adult/youth curriculum supports Sunday school; accounts access the library, Listen → Learn → Live is suggested but any order is possible, and groups require invitations | Give an understandable suggested progression while keeping course choice separate from joining a class |
| [Lifeway Bible Studies for Life](https://www.lifeway.com/en/shop/bible-studies-for-life) | Sunday school curriculum separates age audiences and emphasizes discussion and daily application | Show audience and practical outcomes on course details. This is church curriculum, not evidence of a learner onboarding questionnaire |

Other learning-app examples informed earlier exploration, but these LMS and
Sunday-school sources are the primary basis for this revision. Public descriptions
do not establish exact screen ordering, conversion improvements or scoring rules.
Disciplr's old fit-assessment marketing is excluded from current-product examples:
its [official FAQ](https://disciplr.com/faq/) says the platform closed in August 2025.

### Proposed questions and their immediate purpose

Use four short optional pages followed by actual course choices. Adapt reference
02's pastel choice cards, fine outlines, progress indicator and accessible controls.
Do not repeat the signup name/email. These wording/options are the approved proposal now implemented in source;
placement, skipping and later Settings editing remain owner-confirmed.

| Order | Question and proposed choices | How the answer changes the experience |
| --- | --- | --- |
| 1. Intention — choose one | **What would you like help with first?** Explore Christian faith; understand the Bible; build a prayer habit; put faith into everyday practice; deepen my Bible study; just browsing | Prioritizes courses whose authored outcomes address the chosen goal. Just browsing uses the ordinary catalog |
| 2. Interests — choose up to three | **What would you like to explore?** Show topics actually represented by available content. Current sample: Faith, Prayer, Kindness and Courage | Narrows the suggested subject matter without hiding the complete catalog. Future Bible overview, Jesus/Gospels or other topics appear only when supported by real available content |
| 3. Starting point — choose one | **How familiar are you with studying the Bible?** I'm new to it; I know some stories and ideas; I study it regularly; I'm not sure | Adds a foundational or deeper-study suggestion only where course metadata supports it. This is a self-description, not a placement test or a measure of faith |
| 4. Session time — choose one | **How much time would you like for a study session?** About 5, 10, 15 or 20 minutes; it varies | Helps choose a manageable first lesson/session. It does not filter out an entire course, promise a finish date or claim time already studied |

Intent asks *why*, interests ask *what*, familiarity asks *where to begin*, and time
asks *what fits now*. Keep those purposes distinct rather than asking the same goal
in several forms. Returning after a break is context, not automatically low knowledge.
Avoid denomination, church membership, demographics, spiritual scores and sensitive
personal disclosures. Do not add video/audio preferences or reminders before those
capabilities exist.

A later conditional question, **What would make getting started easier?**, could
offer help choosing a starting point, understanding passages or finding a short
session. Include it only when each answer has a real guidance action; defer it for
the first increment instead of lengthening the survey with unused data. Learning
alone versus with a group is likewise deferred until a real invitation journey can
act on it; an answer can never create membership or staff authority.

### Result: available courses and a clear next action

- Finish with **A few places to start**: up to three genuinely available course
  cards, each with its actual title, concise outcome and a truthful reason such as
  “Matches your interest in prayer.” Show level, lesson count and duration only when
  those values exist; distinguish session estimates from total course length.
- Include **View all courses** and **Edit preferences**. Open course details before
  an explicit Join/Start action; never auto-enroll or grant a class membership.
  Existing email verification/course-admission rules still apply independently.
- Recommendations are an explicit proposed rule set, not a claim about competitor
  internals: first apply trusted availability/access rules; then prioritize authored
  goal match, topic overlap and known starting-level fit, with stable editorial
  ordering for ties. Session time guides the first lesson, not course eligibility.
  Missing answers or metadata contribute no assumed match.
- With no answers, show the ordinary catalog. With weak matches, offer available
  alternatives without claiming a perfect fit. One course means one card; no
  available courses means an honest empty state, never invented stock.
- The current mobile catalog contains **one bundled sample course**, *Faith for
  everyday life*, with four lessons and two modules. It has lesson topics/time
  estimates but no authored course-level goal/level classification. Do not present
  it as a connected catalog or fabricate several available courses. A prayer
  interest can point to *A moment with God* (6-minute estimate) **within that sample
  course**, clearly distinguishing a lesson suggestion from another course.
- Couple the next design with the catalog projection/metadata contract so answers
  produce an actual discovery benefit. Broader personalized course ranking awaits
  genuine authored metadata and an available course source; an editable preference
  summary alone does not fulfill the requested course-list result.

### Optionality, persistence and implementation boundary

- Every answer is optional; Continue allows an unanswered page. Back preserves the
  draft. Skip for now exits to Home without overwriting saved answers and remembers
  dismissal, so it does not reopen full-screen on each login. Home retains access
  to the ordinary course list. No confirmation modal is required simply to skip.
- Settings → Learning profile opens the same editor. Explicit Save persists edits;
  Cancel leaves saved values intact. In first-run setup, the final course-choice
  action saves answered preferences; Skip leaves the draft unsaved. Explain save
  failure and allow retry or continuing without setup. Do not silently discard
  existing saved answers or report unsaved preferences as saved.
- Store optional preferences and completion/dismissal independently of introduction
  completion, with account ownership and existing concurrency/session-isolation
  practices. Guest data never silently moves into account preferences. Failed or
  missing loads cannot overwrite stored values. A persistence outage must not trap
  a learner in setup; keep a session-local dismissal when durable dismissal fails.
- Editing preferences may update suggestions, never existing enrollment, class
  membership, course ordering, completion or saved progress. Knowledge/time choices
  never authorize access. Do not show fake analysis/loading activity.

Next: owner reviews this implemented slice and its deployed preference contract,
then scope authentic course content/catalog/admission. The current lesson hint
uses authored sample topic/time data; broader goal/level ranking still needs real
course metadata. Broad error/copy polishing remains in the consolidated sprint;
existing identity proof/failure/native/permission acceptance remains pending.
