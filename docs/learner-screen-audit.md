# Learner screen audit checklist

Date: 21 October 2026. Scope: the mobile learner app, from first launch through logout and return. Teacher/admin dashboards are separate audits. This is an audit record, not approval of a redesign.

## Working rule

Audit one screen at a time. Preserve its established composition and the reference’s visual language. Do not remove Home sections, change the tab model, or alter shared components as a side effect of fixing another screen. Record the smallest proposed correction, affected callers and regression cases before implementation. Give each eventual fix a bounded commit and review its affected screen before moving on.

The unreviewed multi-screen rewrite from this audit was fully reverted, including the Home rewrite. Current app source is the committed baseline `d6d3beb`. The older standalone Browse courses button from that commit remains an audit finding; restoring baseline does not certify that layout as accepted.

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

## Ordered screen inventory

Work through IDs in this order. Each row includes a screen or a distinct state that can regress independently. “Pending” below means rendered/runtime acceptance, not that its source is necessarily unread.

| ID | Screen / state | Route or host | Reference | Source audit | Visual/runtime |
| --- | --- | --- | --- | --- | --- |
| A01 | Startup and first-launch routing | `/`, root layout | 01/03 adaptation | Reviewed | Pending |
| A02 | Introduction page 1 | Welcome flow | 01 left | Reviewed | Pending |
| A03 | Introduction page 2 | Welcome flow | 01 middle | Reviewed | Pending |
| A04 | Introduction page 3 / Get started | Welcome flow | 01 right | Reviewed | Pending |
| A05 | Create account / Sign in / Skip choice | Welcome flow | 03 adaptation | Reviewed | Pending |
| A06 | Optional guest name setup | Welcome flow | 02/04 adaptation | Reviewed | Pending |
| A07 | Create account | `/sign-up` and welcome step | 03 right | Reviewed | Pending |
| A08 | Sign in | `/sign-in` and welcome step | 03 middle | Reviewed | Pending |
| A09 | Forgot password / request accepted | `/forgot-password` | 03 adaptation | Reviewed | Pending |
| A10 | Email verification guidance/resend/check | `/verify-email` | 03 adaptation | Reviewed | Pending |
| A11 | Confirmation link: initial/pending/success/invalid | `/auth/confirm` | 03 adaptation | Reviewed | Pending |
| A12 | Reset-link guidance | `/reset-password` | 03 adaptation | Reviewed | Pending |
| A13 | Recovery proof / new password / success/failure | `/auth/recover` | 03 adaptation | Reviewed | Pending |
| A14 | Learning-profile initial load/error/exit | `/learning-profile` | 02/04 adaptation | Reviewed | Pending |
| A15 | Intention question | Learning-profile step 1 | 02/04 adaptation | Reviewed | Pending |
| A16 | Interests question | Learning-profile step 2 | 02/04 adaptation | Reviewed | Pending |
| A17 | Familiarity question | Learning-profile step 3 | 02/04 adaptation | Reviewed | Pending |
| A18 | Study-time question / save | Learning-profile step 4 | 02/04 adaptation | Reviewed | Pending |
| A19 | Preference result / edit / Skip and return | Learning-profile variants | 02/04 adaptation | Reviewed | Pending |
| A20 | Home: new / returning / guest / verified | `/home` | 05 left | Reviewed | Pending |
| A21 | Home: Continue learning states | Home continuation | 05 middle adaptation | Reviewed | Pending |
| A22 | Course library: available/empty/error | `/courses` | 06 left | Reviewed | Pending |
| A23 | Course details: guest/unverified/not joined | `/courses/[id]` | 07 left | Reviewed | Pending |
| A24 | Join: pending/stale/uncertain/retry | Course details enrollment panel | 07 adaptation | Reviewed | Pending |
| A25 | Joined curriculum: same/older/unavailable edition | Course details enrollment panel | 07 middle | Reviewed | Pending |
| A26 | Connected lesson: authorized/denied/retry | `/courses/[id]/lessons/[lessonId]` | 08 left/middle adaptation | Reviewed | Pending |
| A27 | Sample lesson list and saved/completed views | `/lessons` | 06 left | Reviewed | Pending |
| A28 | Sample topics and selection return | `/lessons/topics` | 06 middle | Reviewed | Pending |
| A29 | Sample search and result/empty states | `/lessons/search` | 06 right | Reviewed | Pending |
| A30 | Topic/status filter sheet | List/search overlay | 06 controls adaptation | Reviewed | Pending |
| A31 | Sample course curriculum | `/lessons/course` | 07 middle adaptation | Reviewed | Pending |
| A32 | Sample lesson overview: new/started/completed | `/lessons/[id]` | 07 left adaptation | Reviewed | Pending |
| A33 | Sample reader: first/middle/last reading | `/read/[id]` | 08 left/middle adaptation | Reviewed | Pending |
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

## Actual verification baseline

- [x] Reverted only this turn’s unreviewed source/test changes to committed contents; no layout fixes remain applied from this audit.
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
