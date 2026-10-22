# Learner screen audit checklist

Date: 21 October 2026. Scope: the mobile learner app, from first launch through logout and return. Teacher/admin dashboards are separate audits. This is an audit record, not approval of a redesign.

## Working rule

Audit one screen at a time. Preserve its established composition and the reference’s visual language. Do not remove Home sections, change the tab model, or alter shared components as a side effect of fixing another screen. Record the smallest proposed correction, affected callers and regression cases before implementation. Give each eventual fix a bounded commit and review its affected screen before moving on.

The unreviewed multi-screen rewrite from this audit was fully reverted, including the Home rewrite. The audit baseline was committed source `d6d3beb`; subsequent bounded fixes are recorded below. The standalone Browse courses row from that baseline was reviewed and replaced within the existing shortcut structure during the A20 pass below.

## Checklist used on every screen

- [ ] Establish the reference panel or document that this is an intentional adaptation with no exact reference.
- [ ] State the screen’s one primary purpose, content scope and primary action.
- [ ] Compare composition: header, artwork, section order, spacing, type, colors, strokes, radii and offset shadows.
- [ ] Check repeated content/actions against both this screen and the preceding/following screen. Preserve useful contextual navigation and learning feedback.
- [ ] Trace entry, primary action, Back, Cancel/Skip, deep link, exit and re-entry; check active navigation state.
- [ ] Check guest, signed-in, unverified and verified behavior where relevant; preserve sample/account isolation.
- [ ] Check initial, loading, empty, error, retry, success, stale/conflict and disabled states; do not invent records or success.
- [ ] Check keyboard, scroll, focus, touch targets, screen-reader labels, reduced motion, narrow width and larger text.
- [ ] Inspect the actual rendered screen against the reference; record platform, viewport/text size and evidence.
- [ ] Verify runtime transitions and downstream callers; distinguish web evidence from native evidence.

A source finding does not pass a visual or runtime checkbox. References are evidence of hierarchy/style, not permission to copy unsupported certificates, analytics, grading, community or account features.

## Pass 1: first launch and introduction — 22 October 2026

A01–A04 browser evidence is now available at 390×844 and 320×568 using isolated
guest contexts against Expo. Reference01’s composition, artwork, feature-card
arrow, pagination and footer controls are preserved. No Home, tab, storage or
shared-style implementation changed.

- [x] Fresh entry renders the introduction; acknowledged completion reloads to Home.
- [x] Three pages, footer Next/Back, feature-card advancement, Get started and account-choice Back were exercised in the browser.
- [x] Welcome read/write failure warnings and Continue for now were exercised using disposable browser-only storage faults.
- [x] Shared introduction replay’s visible Back path was exercised; this is caller coverage, not full A42 acceptance.
- [x] Standard and narrow screenshots were inspected; at 320px, longer content remains scrollable above the footer.
- [x] Added focused **Android-only** Back handling inside WelcomeScreen: previous slide after page 1, consume during saving, leave normal OS behavior on the first idle page. This changes no layout.
- [ ] Actual Android hardware Back, native text scaling, screen readers and keyboard acceptance.
- [ ] A04 wording review about sample versus connected progress remains open; this pass did not rewrite approved introduction copy.

Local ignored evidence: `.artifacts/onboarding-audit-2026-10-22/results.json` and
`A02-intro-1-{390,320}.png`, `A03-intro-2-390.png`, `A04-intro-3-390.png`.
The flow cases also cover the optional-name/Skip boundary; no account form was
submitted, email sent or server record mutated. Six browser case groups completed
with zero page errors. Browser evidence does not establish native acceptance.

## A05 account-choice correction — 22 October 2026

Replaced only the false “Account services are not available yet” caption with
“An account is optional. You can explore sample lessons first.” Buttons, portrait,
note card, Skip and optional-name entry keep their positions and styling. This
copy does not introduce state-dependent account logic or promise learning sync.
The visible caption and guest Skip/name boundaries were checked in the browser.

A06 optional-name entry, Back, save, Skip and completion reload also passed the
basic guest browser cases. Its layout and both existing Skip positions were left
intact. Native keyboard, text scaling, slow-save/error and account-name variants
still need acceptance; this does not complete every optional-name state.

## A05 narrow hero correction and caller checks — 22 October 2026

The actual 320px account-choice screenshot exposed text overlapping the portrait:
AccountHero’s stacked copy used `flex: 0`, which collapsed its text box. Replaced
the shorthand with explicit grow/shrink/basis values, reserving natural text height
in the stacked layout and preserving the existing 390px horizontal layout. No
portrait, backdrop, typography, spacing token or form structure was replaced.

Because AccountHero is shared, **all three callers** were rendered and inspected
at 320×568 and 390×844: account choice, Sign in and Sign up. Narrow description text
clears the portrait on each; regular layouts retain the existing reference03
composition. This is layout caller coverage for A07/A08, not completion of their
form/error/submission audit. No account form was submitted or email sent.

- [x] Reproduced the 320px text/portrait overlap before changing the component.
- [x] Checked copy-box and visible-text bounds after the fix on all three callers.
- [x] Inspected six final browser screenshots after image decoding and paint settled.
- [x] Preserved Home, tabs, other screen compositions, shared UI defaults and all image assets.
- [ ] Native keyboard, Android Back and larger system-text acceptance.

An earlier image-only loading snapshot initially appeared to have no portrait.
Waiting for decode and painting showed the existing image correctly; no asset fix
was needed. Evidence is local/ignored in `.artifacts/onboarding-audit-2026-10-22/`:
`A05-account-choice-{320,390}-after.png`, `A07-sign-up-{320,390}-after.png`,
`A08-sign-in-{320,390}-after.png` and `responsive-results.json`.

The whole-project typecheck was repeated after this bounded change. It still
reports only the same two baseline errors in LearningProfileScreen and
PageLoadingOverlay; those screens were not modified incidentally. The previous
16/17 existing-test baseline was not rerun or claimed passing in this slice.

## A07–A08 form-state audit — 22 October 2026

Reference03 artwork, fields, optional account name, primary actions and social-button
composition are preserved. The sole implementation change is upfront Google/Apple
availability copy and accessible labels describing their informational actions.
Both existing provider buttons still explain their unavailable status when tapped.
Email authentication, request guards, validation and navigation logic are unchanged.

- [x] At 320×568 and 390×844: empty/malformed email, short signup password and mismatched confirmation show inline feedback without an Auth request.
- [x] Password and confirmation visibility controls independently toggle masking.
- [x] Optional-name field and unpublished-policy information retain their existing roles; no new required consent or personal fields.
- [x] Both providers disclose unavailable status before activation; their information actions make no Auth request. Stacked and horizontal layouts inspected.
- [x] Sign-in accepts a short existing password for submission; an intercepted invalid-credentials response displays the existing safe error.
- [x] Pending sign-in displays the centered loading label and disables submit. Switching to signup before the intercepted response finishes leaves signup active with no stale error/navigation.
- [x] Embedded introduction → account choice → signup → Back, and sign-in → recovery → Back → account choice work at both widths. Standalone form switching and Return to learning were exercised.
- [ ] Real signup/sign-in success, duplicate signup, email-unconfirmed branch, active-account replacement, unconfigured settings, native keyboard/Back, system text scaling and screen-reader error/focus acceptance remain outside this browser pass.

Two isolated Chromium contexts completed with zero page errors. All Supabase-domain
requests were intercepted and returned fabricated failures inside the test browser;
no account, email, session or server record was created. These results verify UI
behavior under a simulated failure, not Supabase connectivity or service acceptance.
Evidence: ignored `.artifacts/auth-form-audit-2026-10-22/results.json` and screenshots.
The screenshots capture the current scroll position; they are not whole-scroll-view
exports. Source review was independent/read-only. No tests/typecheck/lint/build were
rerun for the copy-only change; the previously recorded baseline failures remain.
Next ordered pass: A09 recovery request, then verification/proof states A10–A13.

## A09–A13 recovery and proof boundary checks — 22 October 2026

Isolated Chromium checks at 320×568 and 390×844 covered recovery-request validation,
simulated accepted/error responses and pending exit to sign-in. Without an account
or pending address, verification Check directs the learner to sign in and Resend
requests an address without sending a request. Those existing layouts are preserved;
signed-in/unverified/verified and pending-signup action hierarchy still need review.

A11/A13 direct links exposed a functional defect: clearing route parameters in the
initial child effect happened before parent linking listeners were mounted, leaving
the synthetic proof in the browser URL. Schedule parameter clearing for the next
task, cancel on effect cleanup and skip when unfocused. Captured proof remains in
memory; no consumption occurs before explicit Continue. Independent source review
found no blocker. Browser checks cover both routes, removal of token values before
Continue, simulated expired-proof errors, reload requiring a fresh email link and
leaving a pending proof request without late navigation. No password form appears
for invalid or failed proofs. No screen composition changed.

All Supabase requests were intercepted; no real proof, email, account, password or
server data was used/changed. Two viewport cases completed with zero page errors.
Evidence: ignored `.artifacts/recovery-audit-2026-10-22/` screenshots/results. Native,
same-path in-app fresh-link timing, actual successful confirmation/recovery,
cross-account isolation and revocation uncertainty remain pending. Existing generic
same-password feedback remains deferred to the owner-requested polish sprint.
The reset-guidance copy and invalid-confirmation action label are separate scoped
corrections; this proof cleanup does not change those screens' wording.
Whole-project typecheck after the hook change still reports only the two recorded
baseline errors in LearningProfileScreen and PageLoadingOverlay; it is not passing.

## A12 guidance copy correction — 22 October 2026

The guidance-only `/reset-password` screen now says “Open your recovery email to
continue.” Its existing hero has an explicit guidance mode with the same title,
lock artwork, styles and layout. The actual recovery-proof route keeps “Choose a
new password for your account.” No password fields or new actions were added to
guidance. Both routes' copy was checked at 320px/390px; guidance screenshots were
inspected. No speculative shared sizing fix was made from source alone. Native
larger-text/keyboard acceptance remains pending.

## A11/A13 invalid-link action labels — 22 October 2026

Invalid confirmation now labels its existing signup destination “Back to sign up,”
rather than claiming the button requests an email. Recovery labels its existing
request form “Request a recovery email.” Routes, button styling and proof logic
are unchanged. Both invalid/expired presentations and destination clicks were checked
at 320px/390px alongside the preceding recovery/proof regression; zero page errors,
all Auth requests intercepted. The signup destination is not a new resend service.
Pending-account/verified states, actual successful proof/password operations and
native acceptance remain open; do not mark the whole identity flow accepted.
Next screen group is A14–A19 optional learning-profile setup, retaining the listed
identity-state follow-ups rather than treating them as passed.

## A14–A18 question-control audit — 22 October 2026

Isolated Chromium at 320×568 and 390×844 exercised guest gating, a synthetic verified
identity, all four questions, selection/deselection, the three-topic cap, Back retaining
answers, optional unanswered familiarity, time/It varies switching, acknowledged save
and edit Cancel preserving saved values. Requests were intercepted; synthetic account
and preference rows exist only in the test browser, with no server mutations.

The selected cards rendered correctly but lacked `aria-checked` in the actual web
DOM. Added explicit checked/disabled ARIA properties to the feature's choice cards,
retaining native accessibilityState and every style. Web role/state assertions now
pass on all four pages. Corrected the existing missing callback dependency argument
in this screen's focused Back listener using `[back]`; it retains the current
per-render closure instead of inventing a stale empty dependency list. Native
hardware Back and actual assistive-technology announcements remain pending.

Reference02/04 comparison preserves the approved four optional questions, pastel
cards, symbols, progress segments and footer. No country, birth date, required
answers or fabricated catalog matching was added. Evidence: ignored
`.artifacts/learning-profile-audit-2026-10-22/` screenshots/results. Native larger
text and broader load/save/conflict/slow-exit cases are recorded separately below.

## A18 session-time wording — 22 October 2026

The time question now suggests pausing between readings rather than implying that
a whole lesson fits one session. Sample suggestions label their authored estimate
as “minutes of reading.” Choices, values, ordering/ranking, artwork and layout are
unchanged. Both copy contexts and the four-question flow were browser checked at
320px/390px. “It varies” and unanswered time still save the same null value; the
summary correctly calls that “No fixed time.” No new backend distinction or
promise about full study/quiz duration was introduced.

After the preceding scoped Back dependency fix, whole-project typecheck now reports
one remaining baseline error in PageLoadingOverlay; the learning-profile error is
resolved. No lint/build or existing unit-suite rerun in this pass.

## A19 Settings edit result and recovery states — 22 October 2026

Reproduced Settings edit saving into the first-setup discovery result. In editing
mode only, the result now retains the saved summary and Edit preferences, omits
course suggestions and uses the existing exit action to return to Settings. Initial
setup's course suggestions and Home exit remain unchanged. No shared styles,
question layouts, Home/navigation model or preference API changed. Independent
source review found no blocker; standard/narrow result screenshots were inspected.

At both widths, browser checks also passed load failure/retry, failed save staying
on the question, revision conflict disabling save, reload preserving the draft and
saving against the newly loaded revision, slow-save exit without late navigation,
entirely unanswered save, Skip preserving saved answers and Home remaining on reload.
Result Back reopens the last question; Edit preferences reopens the first. Edit
Cancel does not save. All role/state and flow checks completed with zero page errors.
Auth/profile/preferences endpoints were intercepted with synthetic responses;
this establishes UI behavior, not real persistence, RLS or session security.

The final whole-project typecheck still has one baseline error in PageLoadingOverlay.
Native Back/text scaling/screen readers, real preference persistence, cross-account
and revoked-session acceptance remain pending. First-setup result's competing sample
course/catalog/Home destinations remain a separate finding; this change deliberately
addresses Settings' return purpose only. Next ordered screen is A20 Home, where the
original overlapping course-entry report must be resolved without redesigning tabs.

## A20 narrow featured-hero correction — 22 October 2026

Actual 320×568 Home screenshot reproduced the portrait covering the featured
headline, description and Explore lesson button. WeeklyHero's stacked text container
collapsed through `flex: 0`. Explicit grow/shrink/basis sizing now reserves its natural
height before the existing clipped artwork. Regular 390×844 composition, typography,
assets, colors and strokes are preserved. Both final screenshots were inspected and
the visible artwork container clears the action at 320px. No shared UI or other
screen changed. Evidence: ignored `.artifacts/home-audit-2026-10-22/` before/hero-after
screenshots, baseline.json and hero-results.json. Isolated guest contexts had zero
page errors. Native text scaling/screen readers remain pending.

Home entry-point and recommendation corrections are a separate bounded increment:
restore greeting → hero → four shortcuts, use the first shortcut for the catalog,
preserve sample curriculum and remove repeated featured/resume lesson promotions.

## A20–A21 Home hierarchy, distinct actions and responsive portrait — 22 October 2026

Owner then reported the narrow portrait still looked poor. The final Home hero
measures its own card width, scales the existing portrait proportionally, uses a
compact headline when space requires it and keeps the reference's side-by-side
composition at ordinary phone widths. Artwork has its own clipped column; the CTA
is constrained to the copy width. Stacking is reserved for cards below 250px or
system fontScale ≥1.5; that layout fills a 3:2 artwork frame without the earlier
offset image panel. This supersedes the earlier normal-narrow stacked layout.
No new asset, shared style, other portrait or screen was changed.

Reference05 hierarchy is restored: greeting → featured lesson → four quick-access
cards. Removed only the added standalone Browse row. The existing first shortcut
now reads Courses / Browse library, with accessible Browse courses → `/courses`.
Saved, Practice, My growth, sample curriculum, lesson suggestions and verse remain.
The Lessons tab and all destination screens are unchanged. Dynamic shortcut counts
remain in their spoken labels; unavailable saved data shows Unavailable, not zero.

A Home feature selector shares the two visible unfinished lessons with Continue
learning and excludes those IDs plus the featured lesson from the two suggestion
slots. Small inventory can produce one suggestion; no replacement content is
invented. Resume cards keep their saved section and existing reader destination.
Their support copy makes sample-learning scope clear. The sample curriculum card
is preserved: its course outline and resume links have a distinct contextual role.

- [x] Inspected portrait/composition at 280, 320, 350, 360, 375, 390 and 430px; checked action/art bounds at each breakpoint.
- [x] Ten isolated browser cases at 320px/390px: new, partial, all started, all complete, storage read failure; all existing Home sections retained and no featured/visible-resume duplicate in suggestions.
- [x] Courses → catalog → Back, featured → lesson overview, sample course → curriculum, Saved/Practice/My growth destinations, suggestion opening and bookmark/reload.
- [x] Continue → actual saved reading index, with existing progress retained; generic signed-out greeting despite retained guest name.
- [x] Zero page errors, no external Supabase calls. Any course-library requests were intercepted; this is not catalog-service acceptance.
- [x] Independent source review found no blocker. Whole-project typecheck still reports only the existing PageLoadingOverlay error; no lint/build/unit-suite rerun.
- [ ] Native font scaling/Back, screen-reader announcements and verified/unverified Home variants remain pending.
- [ ] Shared LessonCard can still show default not-started metadata after a storage read failure. Review it with all callers in the lesson/shared audit; no global component patch was bundled here.

Evidence: ignored `.artifacts/home-audit-2026-10-22/results.json`,
`responsive-results.json`, `browser-audit.cjs`, before/final screenshots. Browser
contexts contained disposable sample progress only; no owner session/storage/env or
server record changed. Final native/owner visual acceptance is still pending.
Next A22–A26: course library, detail/join and authorized reading, preserving layouts.

## A22 course library — 22 October 2026

Reference06 comparison preserves the current catalog cards, pastel sample callout,
header and navigation. The development import and bundled sample previously repeated
the same course title in adjacent promotions. The sample callout now says “Explore
before joining” and explains its account-free lessons/checks, keeping its existing
sample-course destination, yellow card, position and styling. It does not invent a
second course or remove guest access.

At 320px/390px, isolated browser checks passed ready/empty/error/retry and leaving
through the sample path while a library request was pending, without late navigation.
The connected title appears once in the ready list. Both contexts had zero page
errors; all Supabase responses were intercepted. Evidence: ignored
`.artifacts/catalog-audit-2026-10-22/library-results.json` and screenshots. Native,
unconfigured settings and actual catalog-service acceptance remain pending. Shared
tab selection remains the separate A45 finding; no tab model was changed here.

## A23–A26 joined editions, joining and reading — 22 October 2026

Reproduced the same-edition curriculum twice and the “course unavailable” banner
above a usable older joined edition at both widths. Course details now show the
actionable joined curriculum once when it matches the current offering. A different
offered edition keeps its separate read-only outline and existing edition explanation;
lesson links still target the joined edition. Missing-offering banners wait for
access checks and are omitted when an active available joined edition is confirmed.
Offering-fetch failures name current course details rather than implying all joined
content is unavailable.

The enrollment panel no longer invites registration/joining without an offering or
claims missing courses will open soon. Existing enrollment, revoked/unavailable and
access-recovery panels remain. A closed offering says “Enrollment is closed” without
promising a reopening date. No Join hook, actor/focus fence, request adapter, SQL,
stored edition or authorization rule changed. No Home/shared UI/tab change.

At 320×568 and 390×844, isolated browser checks passed:

- [x] Guest and synthetic unverified course/reader gates; neither requested private lesson bodies.
- [x] Verified explicit Join, pending action removal, late response after leaving without navigation, and re-entry to existing enrollment.
- [x] Same-edition outline once; older joined edition/current-offering comparison; accessible pin without a current offering and during offering-fetch failure.
- [x] Revoked/unavailable enrollment has no lesson actions; missing course has no enrollment promise/Join action.
- [x] Stale offering requires refresh and explicit Join; uncertain response requires checking enrollment and does not silently repeat Join.
- [x] Connected reading title/outcomes/body/verse/reflection, denial without body, retry and Back to course. No quiz/completion/progress action fabricated.

Reference07's public detail versus actionable curriculum roles and reference08's
reading/outcome/verse language remain intentional adaptations. Screenshots were
inspected; zero page errors and no unexpected service endpoints. All Auth/catalog/
enrollment/reading responses were intercepted with synthetic records, so these
checks establish UI transitions only. No real enrollment, email, session, password,
server policy or data changed. Evidence: ignored `.artifacts/catalog-audit-2026-10-22/`
baseline/results JSON, screenshots and browser-audit.cjs.

Independent source review found no blocker. Typecheck still reports only the existing
PageLoadingOverlay error; no lint/build/unit-suite rerun. Native/system text/screen
readers, real service/RLS/concurrency, account switching/revocation timing, malformed
payload variants and unconfigured service settings remain pending. Courses still
has no selected tab (A45); manual auth return remains the existing scope. Next:
A27–A33 sample discovery, curriculum, overview and reader, followed by quizzes.

## A27–A30 sample discovery — 22 October 2026

Reference06 roles are preserved: search and discovery hero, topics, filtered results
and a separate filter sheet. Filtered list views now omit the full course promotion
and name Saved/Completed/In progress when no topic overrides the heading. The
unfiltered list keeps its existing course context. No Home/tab/connected screen
changed. Discovery artwork now follows measured card width, retains a compact
side-by-side crop at ordinary phone sizes and uses a 3:2 frame only at very small
widths or large system text. Assets and shared styles remain unchanged.

Filter choices now expose explicit web checked state/plain labels; the trigger
exposes expanded state. Opening copies applied values, Cancel/X discards drafts,
Clear modifies the draft and Apply commits. These are intentionally distinct actions.
320px/390px isolated browser checks passed selection/deselection on reopening,
Cancel/Apply, narrowed results without the promotion, search/query clearing and
topic return. Zero page errors; no external services or owner storage used. Evidence:
ignored `.artifacts/sample-audit-2026-10-22/discovery-results.json` and screenshots.
Storage-failure states and overview/reader corrections follow separately; native
text scaling/Back/assistive technology remain pending.

## A32 responsive overview — 22 October 2026

Reference07 overview structure remains: portrait/title, introduction, facts, course
context, outcomes, section access and primary footer. Measured card width keeps
ordinary narrow phones side by side; tiny cards or large fontScale stack naturally.
Explicit flex sizing fixes collapsed stacked copy/facts. Reading min describes the
existing duration estimate. The large Good Samaritan and Prayer crops keep faces
visible; small artwork callers and other assets retain their styling.

All four overviews passed rendered bounds/fact-height checks at 280, 320, 350, 390
and 430px with zero page errors. Final screenshots inspected, including the corrected
Prayer crop. The contextual course card is retained as useful curriculum navigation;
no global deduplication or shared-style replacement. Evidence: ignored
`.artifacts/sample-audit-2026-10-22/overview-results.json` and A32 screenshots.
Native text scaling and assistive technology remain pending.

## A27–A33 progress states and reading journey — 22 October 2026

Unknown saved learning now displays unavailable status, rather than zero results,
Not started or an unearned quiz status. This covers status-filter list/search,
filter previews and every LessonCard caller (Home, list and search). Metadata-only
browsing remains accessible. A load failure permits first-reading access but disables
section jumps, Previous/Next and Up next while the existing store pauses writes.
The existing recovery notice restores the saved reading position after successful
retry. Save failures retain usable in-memory reading; storage behavior is unchanged.

Eight disposable browser cases (new/partial/completed/load-failure at 320px/390px)
passed filters, search, topic return, curriculum entry, start/resume/revisit, reading
advance/Previous/reload and quiz-route entry. Curriculum Start correctly opens Prayer,
the actual first lesson. Completed revisits preserve completion and best score.
Fault recovery preserved the stored second reading before restoring it on retry.
Zero page errors and external requests; Supabase intercepted, no real account,
owner storage or environment files touched. Independent source review found no
blocker. No quiz answers submitted or invented completion records.

Reference07 curriculum requires no layout correction. Retained overview course
context and reference08's footer plus contextual Up next; repeated destinations
serve distinct navigation roles. Home layout and connected reader are unchanged.
Evidence: ignored `.artifacts/sample-audit-2026-10-22/` results, script and screenshots.
Typecheck reports only the existing PageLoadingOverlay absoluteFillObject error;
no lint/build/unit-suite rerun. Native Back/text scaling/keyboard/screen readers,
malformed-storage/reset and explicit save-failure runtime cases remain pending.
Bookmark controls still appear actionable during a load failure despite paused
writes; caller-aware disabled/unknown semantics remain a recorded follow-up.
Next ordered pass: A34–A37 quiz, results and retry/exit behavior.

## Ordered screen inventory

Work through IDs in this order. Each row includes a screen or a distinct state that can regress independently. “Pending” below means rendered/runtime acceptance, not that its source is necessarily unread.

| ID | Screen / state | Route or host | Reference | Source audit | Visual/runtime |
| --- | --- | --- | --- | --- | --- |
| A01 | Startup and first-launch routing | `/`, root layout | 01/03 adaptation | Reviewed / scoped fix | Web checked; native pending |
| A02 | Introduction page 1 | Welcome flow | 01 left | Reviewed / scoped fix | Web checked; native pending |
| A03 | Introduction page 2 | Welcome flow | 01 middle | Reviewed / scoped fix | Web checked; native pending |
| A04 | Introduction page 3 / Get started | Welcome flow | 01 right | Reviewed / scoped fix | Web checked; native pending |
| A05 | Create account / Sign in / Skip choice | Welcome flow | 03 adaptation | Reviewed | Basic guest web checked; native/other states pending |
| A06 | Optional guest name setup | Welcome flow | 02/04 adaptation | Reviewed | Basic guest web checked; native/other states pending |
| A07 | Create account | `/sign-up` and welcome step | 03 right | Reviewed / availability copy fixed | Web validation/navigation checked; real submission/native pending |
| A08 | Sign in | `/sign-in` and welcome step | 03 middle | Reviewed / availability copy fixed | Web validation/simulated failure/navigation checked; real submission/native pending |
| A09 | Forgot password / request accepted | `/forgot-password` | 03 adaptation | Reviewed | Web validation/simulated responses/pending exit checked; real/native pending |
| A10 | Email verification guidance/resend/check | `/verify-email` | 03 adaptation | Reviewed | No-account web checked; other identities/native pending |
| A11 | Confirmation link: initial/pending/success/invalid | `/auth/confirm` | 03 adaptation | Reviewed / URL cleanup fixed | Web invalid/simulated expiry/exit checked; success/native pending |
| A12 | Reset-link guidance | `/reset-password` | 03 adaptation | Reviewed / stage copy fixed | Web copy/layout checked; native pending |
| A13 | Recovery proof / new password / success/failure | `/auth/recover` | 03 adaptation | Reviewed / URL cleanup fixed | Web invalid/simulated expiry/exit checked; password/success/native pending |
| A14 | Learning-profile initial load/error/exit | `/learning-profile` | 02/04 adaptation | Reviewed | Web guest/load retry/exit checked; real/native pending |
| A15 | Intention question | Learning-profile step 1 | 02/04 adaptation | Reviewed / web state fixed | Web selection/deselection/Back checked; native pending |
| A16 | Interests question | Learning-profile step 2 | 02/04 adaptation | Reviewed / web state fixed | Web three-topic cap/draft checked; native pending |
| A17 | Familiarity question | Learning-profile step 3 | 02/04 adaptation | Reviewed / web state fixed | Web optional selection/deselection checked; native pending |
| A18 | Study-time question / save | Learning-profile step 4 | 02/04 adaptation | Reviewed / estimate copy fixed | Web time/save/error/conflict checked; real/native pending |
| A19 | Preference result / edit / Skip and return | Learning-profile variants | 02/04 adaptation | Reviewed / Settings return fixed | Web result/edit/Skip/slow exit checked; setup hierarchy/real/native pending |
| A20 | Home: new / returning / guest / verified | `/home` | 05 left | Reviewed / Home-scoped fixes | Guest/state web checked; portrait 280–430px checked; identity/native pending |
| A21 | Home: Continue learning states | Home continuation | 05 middle adaptation | Reviewed / suggestion deduplication | Web progress/resume states checked; real/native pending |
| A22 | Course library: available/empty/error | `/courses` | 06 left | Reviewed / sample callout clarified | Web ready/empty/error/retry/pending exit checked; real/native pending |
| A23 | Course details: guest/unverified/not joined | `/courses/[id]` | 07 left | Reviewed / missing-offering prompts fixed | Web identity/availability states checked; real/native pending |
| A24 | Join: pending/stale/uncertain/retry | Course details enrollment panel | 07 adaptation | Reviewed / neutral closed copy | Web simulated Join/reconciliation/pending exit checked; real/native pending |
| A25 | Joined curriculum: same/older/unavailable edition | Course details enrollment panel | 07 middle | Reviewed / same-edition duplication fixed | Web pinned/older/revoked/unavailable checked; real/native pending |
| A26 | Connected lesson: authorized/denied/retry | `/courses/[id]/lessons/[lessonId]` | 08 left/middle adaptation | Reviewed / layout preserved | Web synthetic reading/gates/denial/retry/Back checked; real/native pending |
| A27 | Sample lesson list and saved/completed views | `/lessons` | 06 left | Reviewed / scoped corrections | Web checked; native pending |
| A28 | Sample topics and selection return | `/lessons/topics` | 06 middle | Reviewed / scoped corrections | Web checked; native pending |
| A29 | Sample search and result/empty states | `/lessons/search` | 06 right | Reviewed / scoped corrections | Web checked; native pending |
| A30 | Topic/status filter sheet | List/search overlay | 06 controls adaptation | Reviewed / scoped corrections | Web checked; native pending |
| A31 | Sample course curriculum | `/lessons/course` | 07 middle adaptation | Reviewed / scoped corrections | Web checked; native pending |
| A32 | Sample lesson overview: new/started/completed | `/lessons/[id]` | 07 left adaptation | Reviewed / scoped corrections | Web checked; native pending |
| A33 | Sample reader: first/middle/last reading | `/read/[id]` | 08 left/middle adaptation | Reviewed / scoped corrections | Web checked; native pending |
| A34 | Quiz: unanswered/selected/checked/final | `/quiz/[id]` | 08 right | Reviewed | Pending |
| A35 | Quiz result / saved-or-unsaved score | Quiz result state | 07 finish adaptation | Reviewed | Pending |
| A36 | Answer review / retry | Quiz result variant | 08 feedback adaptation | Reviewed | Pending |
| A37 | Post-quiz next lesson / all finished | Course quiz next steps | 07 curriculum/finish adaptation | Reviewed | Pending |
| A38 | Progress: loading/failure/empty/partial/complete | `/progress` | 05 right / 09 right | Reviewed | Pending |
| A39 | Profile: guest/account/profile failure | `/profile` | 12 left | Reviewed | Pending |
| A40 | Edit profile / save / revision conflict | `/edit-profile` | 12 left adaptation | Reviewed | Pending |
| A41 | Settings and its sheets | `/settings` | 12 right | Reviewed | Pending |
| A42 | Introduction replay and exit | `/welcome` from Settings | 01 | Reviewed | Pending |
| A43 | Logout and signed-out return | Settings → Home | 12 right adaptation | Reviewed | Pending |
| A44 | Unknown route / missing lesson | Not-found variants | Existing shared UI | Reviewed | Pending |
| A45 | Shared tab selection, Back and page loaders | All callers | 05–08 / 12 | Reviewed | Pending |

## Findings: onboarding and identity (A01–A19)

Reference01’s card arrow and footer Next are both intentional in the supplied design. References02/04 provide visual language; the approved four optional questions intentionally differ from their three-step forms. Do not add country/DOB or make fields required to copy those references.

| ID | Source finding / exact state to inspect | Preserve | Smallest proposed correction to assess |
| --- | --- | --- | --- |
| A01 | Welcome-storage routing and loading are separate from introduction. Source has recovery instead of an automatic empty reset. | First-launch versus returning-user routing and recovery. | No layout change from source alone. Check cold start, saved preference and load failure. |
| A02 | Intro page 1 has artwork, feature card, pagination and footer, matching reference01’s role. | Composition and both reference navigation affordances. | Inspect narrow/large text and Skip; do not delete the card arrow merely because Next exists. |
| A03 | Intro page 2 has visible previous navigation, while WelcomeFlow does not register its Android Back handler during introduction. | Artwork and visible slide controls. | Trace native Back versus visible Back before deciding whether this is a runtime defect. |
| A04 | Final introduction explains saved learning, then Get started enters account choice. Copy can imply broader account progress than sample storage currently supports. | Page composition, final action and ability to go back. | Review wording/scope independently from the welcome layout. |
| A05 | AccountChoiceScreen hardcodes “Account services are not available yet” despite configured development Auth. | Reference03 artwork, existing buttons and optional Skip. | Correct state-aware availability wording within this screen only; check configured/unconfigured and signed-in replay. |
| A06 | Optional name can be collected here, on signup and later in Profile. Top and footer Skip repeat the same action. | Optionality, guest/account name separation and existing layout. | Review the purpose/name context and Skip positions on this screen; do not automatically remove the stage. |
| A07 | Sign up collects an optional name; Google/Apple look operational until clicked. | Existing reference03 fields/artwork, password rule and safe request messages. | Review unavailable-provider status and repeated-name context without rebuilding the form. Check keyboard, validation, pending exit and error announcement. |
| A08 | Standalone sign-in returns through `/`, not an originating course. Manual course return is the documented current scope. | Sign-in validation, actor isolation and explicit enrollment. | Keep return guidance consistent; do not invent ID-07 persistence or automatic joining during a visual fix. |
| A09 | Recovery email request has its own coherent purpose and safe accepted-request response. | Non-enumerating response and single submit action. | No layout change from source alone; check malformed input, failure and return to sign-in. |
| A10 | Resend, Check verification, Sign in and Back to signup have different eligibility states but can compete. Verified Settings entry also reaches this screen. | Trusted verification and normal sign-in after confirmation. | Review state-dependent primary action, preserving link security. Test pending signup, unverified account and already verified account separately. |
| A11 | Confirmation requires explicit proof consumption and ordinary sign-in; invalid-link Request a new email leads to signup. | Current-account isolation, explicit proof handling and parameter cleanup. | Review invalid/reused/new-device resend destination and copy only; do not change token behavior with a layout fix. |
| A12 | Reset guidance hero says choose a new password, but this route only explains opening a recovery email. | Requirement for proof before showing a password form. | Align guidance copy with this stage; no new password form here. |
| A13 | Recovery proof, identified-email password form, same-password failure, success and revocation uncertainty are distinct states. The reused-password error is still generic. | Explicit action, target email, isolated account and fresh sign-in. | Audit each stage’s next action and later improve actionable failure copy; do not auto-login/enroll. |
| A14 | Initial profile load/error must not be mistaken for a missing row. | Retry/exit, draft preservation and optional setup. | Check load failure, continue without setup, verified eligibility and Settings edit entry independently. |
| A15 | Intention is optional; optional/edit-later support copy repeats on every question. | Approved cards, gentle purpose and deselection. | Review repetitive support text without changing question layout. |
| A16 | Topic copy says topics come from the sample course, but the result can lead into the connected library. | Actual available topics and up-to-three cap. | Align what catalog this step promises; do not invent matching or inventory. Test fourth selection and Back retention. |
| A17 | Familiarity is a preference, not qualification or faith scoring. | Approved question and optional/unsure answers. | No source-based redesign; check deselect, none, Back and Skip. |
| A18 | Session-time wording can imply a whole lesson fits an authored reading estimate. It varies and unset both store null. | Optional duration choices and truthful time basis. | Review estimate wording and null-state explanation, not card composition. |
| A19 | First setup result has summary, sample View course, connected View all courses, Edit preferences and Go Home. Settings edit uses the same result even though its entry/exit purpose differs. | Saved summary, answered questions and secondary editing. | Establish one primary next destination for first setup, and a separate edit-success return. Do not redesign the four approved questions as a side effect. |

Every optional question still requires Back, deselect, Skip, save/error and later-edit acceptance. Reviewing one completed path does not review all variants.

## Findings: Home and connected courses (A20–A26)

| ID | Source-confirmed finding | Preserve | Smallest proposed correction to assess |
| --- | --- | --- | --- |
| A20 | Standalone Browse courses was added above the reference-style hero. Home also has a featured sample lesson, sample course card and sample lesson recommendations; the featured lesson occurs again below. Their scopes compete. | Existing hero artwork, section composition, four shortcuts, greeting, card styles and verse until their individual audit is reviewed. | Review the added button and action labels in context first. Do not remove Home blocks or replace four shortcuts with two as an incidental navigation fix. |
| A21 | Continue learning reads sample storage, although its heading can imply connected account learning. Its lessons may also appear in recommendations. | Actual saved section, progress-unavailable honesty and resume action. | Clarify scope and review recommendation exclusion without changing the whole Home layout. |
| A22 | Connected development course and sample course card share the same Faith for everyday life title and outline, appearing as duplicate inventory. | Honest connected catalog states and guest sample access. | Identify a sample preview separately without repeating a full identical course presentation. |
| A23/A24 | Course overview, public outline and Join have useful distinct roles. Pending, stale and uncertain Join states must not be collapsed into “not joined.” | JWT/session/request fencing, explicit Join, verification and edition pinning. | Resolve discovery/curriculum duplication within this screen only; preserve authentication/access behavior. |
| A25 | After enrollment, actionable pinned lessons and the public outline both show the same curriculum. With an older available pin, a missing current offering can also show “This course is unavailable” above functioning enrolled content. | Old-edition reachability and current withdrawal/revocation checks. | Show the same-edition curriculum once; scope offered-edition availability correctly. Any edition comparison needs an explicit distinct purpose. |
| A26 | Connected reading combines overview and all sections; sample learning uses overview → reader. These currently look like two implementations of the same material with different progress/quiz capabilities. | Actual authorized text and honest absence of synced assessment/progress. | Define this screen’s consumption role and return behavior first. Do not redesign the sample reader as a side effect. |

## Findings: sample learning and assessment (A27–A38)

| ID | Source-confirmed finding | Preserve | Smallest proposed correction to assess |
| --- | --- | --- | --- |
| A27 | Topic hero, full sample-course promotion and lesson list are stacked in one discovery page; that course promotion appears elsewhere too. | Search, topics, status filters, bookmarks, counts and list/card style. | Review the repeated course promotion within this screen; identify sample scope once. |
| A28 | Topic selection replaces the topic route with another list route. Its resulting Back history needs runtime tracing. | Pastel grid, actual counts and All lessons behavior. | Check history before changing push/replace globally. |
| A29 | The closing search encouragement repeats the subtitle, and sample scope is mostly in empty states. | InputField focus, query/filter distinction, clear actions and results. | Remove repeated copy or clarify scope in this screen only. |
| A30 | Draft/applied filters, X/Cancel and clear/apply have different state roles; no source evidence of redundant data. | Draft cancellation and query preservation. | No redesign from source alone. Verify all dismissal/application paths. |
| A31 | Sample course overview includes course description, start/resume/status and full curriculum; reference07 separates overview from curriculum. | Actual two-module/four-lesson outline and saved progress. | Establish this page’s sample-curriculum role rather than creating more pages or promoting it everywhere. |
| A32 | A large “part of a sample course” card repeats the same course identity and curriculum CTA before the lesson outcomes. | Artwork, outcomes, bookmark, chosen-section access and primary footer. | Consider compact contextual attribution; do not remove distinct section access just because Start also exists. |
| A33 | Footer Next reading/Take quiz and one Up next card call the same advance action. | Reading position, Previous, Scripture, text and footer. | Review one advancement control or a noninteractive next-title preview. Reference08 itself has footer navigation plus an Up Next list, so do not ban the pattern globally. |
| A34 | Choose → Check answer → explanation → Next/Finish is coherent. Sample scope is not prominent in Quiz time. | Correct/incorrect teaching feedback, locked checked answers and checked-count basis. | Review a small scope label; keep pedagogically useful feedback repetition. |
| A35 | Course next steps plus a separate What’s next group, review/retry and progress footer create several competing next actions. | Attempt versus best score, actual persistence warning and reflective finish. | Agree one primary next-study action; group supporting review/retry actions without redesigning every result card. |
| A36 | Chosen/correct answer and explanation deliberately repeat teaching for review. | All answer evidence and transient-review lifetime notice. | Simplify heading hierarchy only if rendered review shows a problem. |
| A37 | “Your course journey” plus the same course title can imply connected course completion even though this is sample progress. | Next-unfinished logic, module context and saved/unavailable distinction. | Clarify sample scope without merging enrollment/progress records. |
| A38 | Main Your progress/Overall progress labels cover only bundled sample data. Some repeated counts are useful summaries, as in reference09. | Unavailable versus zero, correct denominator, best-score basis and per-lesson evidence. | Clarify scope visibly; audit density before deleting valid metrics. |

## Findings: profile, settings and return (A39–A43)

| ID | Source-confirmed finding / risk | Preserve | Smallest proposed correction to assess |
| --- | --- | --- | --- |
| A39 | Generic Completed/In progress/Saved stats come only from sample storage. Settings appears as both a top gear and lower row. | Reference12 layout/light strokes, actual counts, guest/account names and profile failure state. | Clarify learning scope; inspect whether the two Settings entries add useful access before removing either. |
| A40 | After awaited save, EditProfileScreen calls closeEditor without a screen-focus/request fence. Back remains usable while save is pending, so late navigation needs verification. | Display-name editor, InputField focus, revision-conflict reload and draft. | Fence late navigation without changing the editor layout. Test slow Save→Back and account change independently. |
| A41 account | Verified account row still routes to verification while claiming Manage your signed-in account. | Grouping, email and verified status. | Make row action match its stated role and current verification state. |
| A41 email | Email-preferences row/sheet says all email delivery is unconnected. Development Auth confirmation/recovery is configured; learning-email preferences remain unavailable. | Honest unavailable preference service, sheet layout and no promised public production delivery. | Distinguish learning-email preferences from operational development Auth emails. |
| A41 app | Appearance/language/playback/download/data rows are separate informational sheets; some features are unavailable. | Existing lighter strokes and truthful capability status. | Audit each sheet’s usefulness and state; reference12 alone does not require a working control. |
| A41 support | Help describes sample learning but omits connected catalog/enrollment/reading. An obsolete password detail definition may be unreachable from the current password row. | Help/sheet presentation, privacy/terms unpublished status and About attribution. | Update reachable factual guidance after navigation is settled; trace reachability before changing unused copy. |
| A41 reset | Reset says your progress but resets only sample positions/scores/bookmarks; account enrollment stays. | Explicit confirmation, Cancel and no account/name deletion. | Make the reset scope unmistakable without changing underlying storage behavior. |
| A42 | Replaying introduction while already signed in still presents signup/sign-in paths that cannot replace the current account. | Shared introduction, replay persistence and optional exit. | Audit state-aware account-choice treatment inside replay, preserving original introduction composition. |
| A43 | Source fences late logout navigation and goes Home on acknowledged success. Generic signed-out Home greeting versus retained guest Profile name is an intentional owner choice. | Existing logout behavior, error state and name separation. | No source-based redesign. Check slow logout→navigate away, failure, account data hidden and Home greeting. |

Audit each Settings surface separately, rather than checking only the parent list:

- [ ] A41.1 Account entry: guest, unverified, verified, loading, sign-in return.
- [ ] A41.2 Personal information → editor → Save/Cancel/error return.
- [ ] A41.3 Change password → recovery request → guidance return.
- [ ] A41.4 Email preferences sheet: status, wording, close/Done/Android Back.
- [ ] A41.5 Appearance sheet: current supported mode and dismiss paths.
- [ ] A41.6 Language sheet: current supported language and dismiss paths.
- [ ] A41.7 Video playback sheet: unavailable status, no implied saved setting.
- [ ] A41.8 Download quality sheet: unavailable status, no fake download control.
- [ ] A41.9 Data usage sheet: actual sample/account distinction and scroll/dismiss.
- [ ] A41.10 Learning-profile edit: eligibility, save, cancel, conflict and return.
- [ ] A41.11 Introduction replay: all slides, account options, Skip and finish.
- [ ] A41.12 Help Center sheet: current factual course/sample guidance.
- [ ] A41.13 Privacy Policy sheet: clearly unpublished; no fake document.
- [ ] A41.14 Terms of Service sheet: clearly unpublished; no fake acceptance.
- [ ] A41.15 About sheet: version, credits, loader attribution and dismiss.
- [ ] A41.16 Reset-sample-learning confirmation: Cancel, confirm, failure, preserved enrollment/name.
- [ ] A41.17 Logout: acknowledged success, failure, pending exit and signed-out Home.

These are separate rendered/runtime acceptance items; all remain unchecked. Source review of the parent and reachable sheet definitions is complete.

## Cross-screen rules and acceptance (A44–A45)

- Primary navigation is currently Home / Lessons / Progress / Profile. `/courses` and its descendants match no selected tab. Audit the canonical learning destination as its own shared-navigation task; changing it affects every screen.
- Preserve the existing light navigation/Profile/Settings strokes and stronger discovery/lesson strokes. Do not change shared Card/Button/Text defaults to fix one screen.
- Do not assume all repeated labels or Back buttons are defects. Global navigation, a local return action, chosen/correct answer feedback, and draft Cancel/X controls can have distinct roles.
- Inspect shared loaders across startup/account/profile/enrollment/reading. Pending visibility, transparency, original Lottie colors, reduced motion and immediate completion need actual rendered checks.
- Review unknown lesson/route, direct links, account switches, expired sessions, storage recovery and unavailable content. Source guards do not prove these runtime scenarios pass.
- References09 assignments, 10 badges/certificates/history, 11 community/live/chat and 12 notifications/downloads do not establish implemented features. Do not fabricate those screens or statistics during this regression.

## Original verification baseline — 21 October 2026

This is the baseline before the bounded 22 October corrections recorded above.

- [x] Reverted only that turn’s unreviewed source/test changes to committed contents; no layout fixes remain applied from this audit.
- [x] Inspected reference images01–12 and source journeys; screen-group reviews are recorded above.
- [x] Ran mobile typecheck against restored source: **fails with two errors**, `LearningProfileScreen.tsx` missing useCallback dependency argument and `PageLoadingOverlay.tsx` using StyleSheet.absoluteFillObject absent from installed types.
- [x] Ran existing regression suite against restored source: **16 passed, 1 failed**. The failing assertion requires “Sample lesson” in every introduction; current approved teaching copy does not contain that phrase. Review the assertion against the policy of clear sample identification without repeated disclaimers.
- [ ] Rendered comparison of current app against the references.
- [ ] Narrow-width, larger-text, keyboard, touch/accessibility and reduced-motion checks.
- [ ] Browser runtime route/state transitions and connected permission/concurrency checks.
- [ ] Native device verification. A web screenshot would not establish this.

The initial test invocation was blocked by the sandbox’s IPC-socket restriction; the authorized retry ran. Temporary fixes made while diagnosing the checks were also reverted when the owner requested audit-only preservation. The passing temporary run is not acceptance of the current restored tree. The two separately deferred lint issues were not run or resolved.

## Next work order

Source review is complete for the ordered inventory; rendered/runtime acceptance remains pending. Begin the per-screen acceptance pass at A01 and proceed in order, then take one bounded screen correction at a time. For each: record the before/reference, identify the actual defect, implement the smallest correction, check all affected states/callers, capture the rendered result and update this checklist. Do not batch another Home redesign into navigation, catalog or auth work. Connected quiz/progress implementation waits behind this owner-prioritized audit.
