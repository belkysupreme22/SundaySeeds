# SundaySeeds implementation plan

Updated 12 October 2026. This plan turns the reference designs into a sequence of complete learner flows. It separates implemented functionality, remaining design work and owner acceptance; a working screen is not automatically a finished design.

**Next task: D4 — Discovery filters, reference-06.** D1 browse, D2 topic grid and D3 dedicated search/results are implemented and awaiting owner runtime/visual review. Continue through Lessons discovery before another discretionary Home polish pass.

**Owner-requested addition during D3:** shared InputField provides consistent idle/focus treatment. After owner feedback, Search uses its borderless soft variant with lavender focus fill and an unboxed clear icon; Edit Profile retains the outlined variant and Browse's entry retains its keyboard-focus styling. Source inventory found no other editable inputs. Visual review remains pending; D4 remains next.

## Delivery agreement

- Build the React Native + Expo + TypeScript app in `apps/mobile`, following its working agreement and existing feature boundaries.
- Inspect the relevant reference panels before each screen change. Keep the pale lavender, mint, yellow and peach palette, dark fine outlines, modest radii, geometric type and crisp offset shadows. Adapt course content to Sunday school without inventing unavailable services.
- Complete one screen group through small, coherent commits, then move to the next group. Revisit earlier screens for owner feedback, broken interactions or shared-component regressions rather than open-ended polish.
- The owner handles terminal-heavy checks, runtime testing and visual review. Provide a short handoff with affected screens, actions to try and known limitations. Do not run builds, tests or review jobs unless the owner requests them.
- Record implementation and acceptance separately. Pending owner review can remain queued while the next screen is implemented; it must not be reported as a pass. Native verification cannot be inferred from web previews.
- Keep sample content and device-local storage clearly labelled. Every visible control must work; omit controls whose underlying feature is not implemented.
- The two existing lint issues are deferred at the owner's request. They are not the next product task, but remain outstanding before release.
- Maintain `CHANGELOG.md` and document material architecture decisions in `docs/decisions`. No production accounts, class memberships or backend connectivity are assumed.

## Current baseline

The app already contains functional versions of welcome, Home, lesson browsing/topics, lesson detail, reader, quiz/results/answer review, progress, profile editing and settings. Four sample lessons support bookmarks, reading positions and best quiz scores on the device.

Recent increments added lesson outcome tiles, completed-lesson revisiting, explicit storage-recovery retries and Home/lesson-card layout changes. The 12 October Home design increment is implemented but has not completed owner runtime or visual review. Earlier verification records remain in [verification](verification); they do not establish acceptance of later changes.

There is no connected authentication, real class enrolment, teacher dashboard, notifications service or download manager.

## Phase 1 — Complete the learner frontend designs

All tasks below build on the existing app. They are remaining design/interaction work, not a claim that their screens are entirely absent. Their acceptance criteria are targets for the owner's review.

| Order | Screen group | References | Starting point / status |
| --- | --- | --- | --- |
| D1–D4 | Lessons discovery | [06](references/reference-06.png) | D1–D3 implemented, owner review pending; D4 topic/status filter control next |
| L1–L3 | Lesson overview, reader and quiz | [07](references/reference-07.png), [08](references/reference-08.png) | Working local journey; complete remaining reference layouts |
| P1 | Progress dashboard | [05](references/reference-05.png) middle/right, [09](references/reference-09.png) right | Local progress exists; dashboard design remains to be completed |
| S1–S2 | Profile and settings | [12](references/reference-12.png) left/right | Name editor and settings exist; finish visual structure |
| O1–O2 | Welcome and profile setup | [01](references/reference-01.png), [02](references/reference-02.png), [04](references/reference-04.png) | Welcome exists; finish adapted setup flow |

### 1. Lessons discovery — implement next

**D1 implementation checkpoint (12 October):** compact browse header/search, lavender portrait hero with working topic action, sample-lesson heading/count and clear controls are implemented. Existing outlined lesson cards, combined status/topic/query filtering, bookmarks and anchored navigation are retained. Hero stacks below 350 logical pixels or at native font scales of 1.5 and above. Owner testing and visual acceptance are pending; no tests, builds or runtime review were run for this increment.

**D2 implementation checkpoint (12 October):** topic tiles now use compact outlined pastel rows, aligned icons and actual collection counts. The final full-width All lessons tile adapts the reference's last row and opens the complete sample collection. Below 350 logical pixels or at native font scales of 1.5 and above, topics use one column. The four existing topics and navigation remain; no extra categories were invented. Owner testing and visual acceptance are pending; no tests, builds or runtime review were run.

**D3 implementation checkpoint (12 October):** Browse's search entry now opens `/lessons/search`, carrying its topic and status. The dedicated screen has an outlined editable query, matching counts/cards, removable context labels, separate query/filter clearing and empty-result recovery. Both screens share matching logic; query/topic/status live in the search route, with normal stack Back retaining browse context. Direct-entry Back falls back to Lessons. No inactive instructor/course tabs or sorting claims were added. Formatting was applied only to changed source files; tests, typecheck, lint, builds and runtime/visual review remain with the owner. D4 remains open.

**D1. Browse lessons:** implement reference-06's left-panel hierarchy: search entry, compact illustrated hero, section headings, outlined lesson cards and anchored navigation. Use sample lesson groupings, with no fabricated popularity, ratings, teachers or class data.

**D2. Topic grid:** finish the middle-panel tile proportions, icon placement, colours, counts and spacing. Keep the existing Faith, Kindness, Courage and Prayer topics; counts come from the available lessons.

**D3. Dedicated search/results:** add the right-panel search experience, including query editing/clearing, matching results, result count, back navigation and a useful empty state. Search lesson titles, topics and scripture. Do not add inactive instructor or course tabs.

**D4. Filters:** provide a working filter control for topic and All, Saved, In progress or Completed status. Preserve combinations with search; support clear/apply behavior as appropriate to the chosen control. Do not add unsupported rating, price or difficulty filters.

**Owner acceptance:** browse -> topic/search -> results -> matching lesson works; filters and counts agree with the sample collection; back navigation preserves intended context; empty results can be cleared; bookmark state stays consistent across Home and Lessons.

### 2. Learning flow

**L1. Lesson overview:** carry reference-07's overview and curriculum hierarchy through the remaining detail layout. Preserve the learning tiles, scripture, metadata, memory verse, section list, reading-position marker and Start/Continue/Revisit action. Adapt enrolment/payment treatments to the already-available sample lesson; no paid-enrolment controls.

**L2. Reader:** complete reference-08's reading hierarchy, section indicator, reflection/memory-verse treatment and previous/next actions. Reopen the saved section and preserve completed status when revisiting. Use text lessons; video, resource downloads and personal notes are not part of this increment unless their behavior is separately scoped and implemented.

**L3. Quiz and results:** finish the lavender question card, outlined choices, selected/correct/incorrect states, explanations, completion presentation and answer review. Preserve unanswered-question handling, retry behavior, best scores and storage-recovery feedback.

**Owner acceptance:** complete Home -> lesson -> reader -> quiz -> results -> progress; restore reading position and saved results after restart; revisit without losing completion or best score; distinguish reading position from quiz completion; exercise unanswered, incorrect-answer and save-failure states.

### 3. Progress dashboard

**P1. Dashboard:** implement the reference's encouraging summary, completion visualisation, pastel statistics and outlined lesson-progress rows. Show actual completed lessons, in-progress lessons, saved lessons and best quiz scores where useful. Include a useful first-use state and links back into learning.

Do not display learning hours, streaks, weekly graphs, XP or historical activity that the app does not record. Reference-10's history timeline requires an explicit event-history feature and is deferred.

**Owner acceptance:** totals agree with stored learning; a finished quiz updates the dashboard; each lesson opens the correct destination; fresh/reset data does not show invented activity; storage failures remain understandable.

### 4. Profile and settings

**S1. Profile:** finish the reference-12 profile header, personal summary, genuine local-learning statistics and grouped navigation rows. Keep the optional display-name editor and clearly identify the local preview.

**S2. Settings:** finish Personal information, Learning data, introduction replay and About/support presentation using the grouped outlined-row design. Keep the existing confirmed reset behavior and error recovery. Only include support links with real destinations; account settings arrive with authentication.

**Owner acceptance:** profile edits update the greeting and persist; save/cancel return correctly; reset confirmation can be cancelled and clears only learning data when confirmed; rows have real destinations. Notifications/downloads, password changes and sign-out are not presented as working in the local demo.

### 5. Welcome and profile setup

**O1. Welcome:** finish reference-01's three-page composition with Sunday school copy, prominent imagery, pastel feature cards, page indicators and Back/Next/Skip/Get started behavior. Preserve replay and the saved welcome preference.

**O2. Minimal setup:** use references 02 and 04 as alternative treatments for one setup flow, not duplicate flows. Reuse the optional display name. Topic preferences may be introduced only with a concrete local effect, such as ordering suggested lessons; otherwise defer that step. Do not collect email, country, birth date, skill level or study goals merely because the reference includes them.

**Owner acceptance:** first launch and replay behave correctly; skipping optional setup still reaches Home; preferences persist without altering learning progress; no unsupported account or recommendation claims appear.

### Frontend acceptance gate

The owner reviews the screen groups using [design-reference.md](design-reference.md): 360 × 800 and 390 × 844 layouts, 150%/200% text size, touch targets, readable contrast, safe areas, navigation, empty/loading/error states and persistence. Record intentional Sunday school adaptations and outstanding differences.

Phase 1 is accepted only when the complete learner journey and required native checks are recorded and the owner approves the visual result. Implementing the remaining groups can continue while earlier reviews are pending.

## Phase 2 — Connected pilot and authentication

**Dependencies:** confirm the first church/class, learner age group, curriculum owner, learner-versus-parent account ownership, teacher access and content/translation permissions before designing production account behavior.

1. Introduce Supabase schema/migrations and access rules for the agreed pilot.
2. Implement login, signup and appropriate recovery/session states using [reference-03](references/reference-03.png). Offer only configured authentication methods; do not add decorative Google/Apple sign-in controls.
3. Implement class invitations and joining, published lesson access and saved attempts. Replace local data access behind the established feature boundaries.
4. Decide explicitly whether/how sample device-local progress transfers to an account; do not silently upload or merge it. Add truthful loading, offline/session-expiry and retry states.

**Acceptance:** a learner joins the intended class and completes a published lesson; access checks prevent reading another learner's results or another class's restricted data; learner accounts cannot publish lessons; interrupted requests have clear recovery behavior. Required checks must be scheduled with the owner before declaring this phase complete.

## Phase 3 — Teacher publishing

Build a small responsive web dashboard for assigned teachers to draft, preview and publish text/image lessons and quizzes, then view genuine class completion. There is no supplied teacher-dashboard reference; agree that layout using the established visual language before implementation.

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
