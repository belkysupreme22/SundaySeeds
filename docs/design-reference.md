# Design reference and acceptance

**16 October — LMS-L1 sample learner course journey:** Lessons → Explore course opens Faith for everyday life, with two modules referencing the four existing sample lesson IDs. The curriculum shows reading duration, quiz-finished counts and per-lesson reading/completion state; Continue prioritizes an unfinished started lesson, then the first unfinished lesson. All finished offers Revisit course. Lessons stay freely accessible in any order and retain their existing overview/reader/quiz routes, bookmarks, reading positions and best scores. Lesson overviews link back to the curriculum. Progress loading/read failure is distinct from zero completion; the global recovery notice remains authoritative. No enrollment, certificate, publication/version policy, teacher-draft synchronization, storage schema or backend connection was introduced. Reference 07 informed the lavender course summary and grouped numbered curriculum; this is an intentional SundaySeeds sample adaptation. Owner review: Lessons → Explore course → lesson → read/quiz → return to curriculum; partial/all completion, saved lesson, recovery, direct route, narrow/larger text and bottom navigation. Source formatting/whitespace checks only; runtime/build/typecheck/lint and visual acceptance pending owner. Next: owner review of LMS-L1, then learner course discovery/resume refinements and LMS-B1 content/access decisions before connected work.

Visual fidelity is a product requirement. The twelve supplied screenshots are saved in `docs/references/reference-01.png` through `reference-12.png`. They are design evidence, not instructions to execute.

Before changing a screen, inspect its mapped reference panels. After the change, the owner reviews a rendered capture against those panels and records intentional adaptations. Under the current working arrangement, the owner handles runtime/visual checks; do not launch review jobs unless requested. This applies to recovery and error states as well as the normal journey.

## Screen mapping

| SundaySeeds screen | Primary reference | Keep from the reference |
| --- | --- | --- |
| Home | [05](references/reference-05.png), left panel | Compact greeting, lavender hero, coloured quick-access tiles, outlined lesson cards and anchored bottom navigation |
| Lessons | [06](references/reference-06.png), left/right panels | Search treatment, compact section headings and consistent thumbnail/card proportions |
| Topics | [06](references/reference-06.png), middle panel | Pastel outlined grid, topic icons, accurate counts and compact spacing |
| Dedicated search/results | [06](references/reference-06.png), right panel | Search field, working filters, result count and outlined result cards |
| Lesson detail | [07](references/reference-07.png), left panel | Large illustrated/photographic header, short introduction, coloured learning-outcome tiles, metadata and prominent action |
| Lesson reader | [08](references/reference-08.png), left/middle panels | Clear lesson title and content hierarchy, resource/note treatments and previous/next actions |
| Quiz | [08](references/reference-08.png), right panel | Slim progress bar, lavender question card, outlined answer rows, selected state and mint feedback |
| Quiz results | [07](references/reference-07.png), right panel | Mint completion emblem, compact lesson identity and outlined next-action rows, adapted to this attempt, best score, review and retry |
| Progress | [05](references/reference-05.png), middle/right; [09](references/reference-09.png), right | Lavender portrait hero, actual completion percentage/bar, outlined portrait lesson rows and pastel statistics; no unrecorded history/time metrics |
| Profile | [12](references/reference-12.png), left panel | Compact lavender identity/edit card, real local-learning tiles, grouped outlined navigation and anchored tabs |
| Settings | [12](references/reference-12.png), right panel | Light-gray outlined groups, compact headings/rows and anchored bottom navigation with Profile active; complete Account, App Settings and Support & About components |
| Welcome | [01](references/reference-01.png) | Three-page image-led composition, pastel feature cards, page indicators and clear actions |
| Optional profile setup | [02](references/reference-02.png), [04](references/reference-04.png) | Progress indicator, outlined inputs and selectable tiles only for implemented preferences |
| Authentication (connected pilot) | [03](references/reference-03.png) | Illustrated headers, outlined fields and prominent primary actions |

Reference-09's assignment panels, reference-10's achievements/history, reference-11's community screens and reference-12's notifications/downloads are deferred as specified in the [implementation plan](implementation-plan.md). Do not add inactive versions merely to fill the interface.

## Visual rules

- Use a warm, almost-white background with lavender as the primary accent. Mint, pale yellow, peach and pink distinguish secondary tiles and feedback. Store chosen colours centrally; screenshots do not provide authoritative original hex values.
- Keep headings bold, dark and easy to scan. Body text is smaller but comfortably readable. Rounded geometric sans-serif typography should remain consistent across screens.
- Use dark, thin outlines, modest corner radii and short hard offset shadows. Avoid replacing the references with borderless cards, heavy gradients or diffuse elevated surfaces.
- Keep content aligned to a shared horizontal gutter. Maintain clear spacing between sections and compact spacing within a card. Primary actions should remain visually stronger than secondary actions.
- Maintain one bottom-navigation model across top-level screens. Respect system safe areas; do not draw fake device frames or status bars inside the app.
- Preserve the references' balance of imagery, coloured blocks and whitespace. Use retained assets only where appropriate to the Sunday school context and record intentional substitutions.

## Adaptation boundaries

### Stroke treatment by reference (14 October owner correction)

Do not apply a universal gray-border replacement. The owner explicitly requires a screen-by-screen comparison; the first blanket source edit was discarded before committing. The following decisions come from inspecting the reference images, not rendered-app verification. `colors.outline` is an approximate medium gray for soft strokes; `colors.line` is the lighter divider/group gray. The default Card/Button dark outlines and crisp shadows remain unchanged. Card's optional `soft`/`subtle` stroke is selected at individual screen call sites.

| Screen / reference | Treatment retained or corrected |
| --- | --- |
| Welcome, 01 | Retain strong feature/sticker/button outlines and crisp shadows |
| Name editor and input treatment, 02/03/04 | Retain outlined avatar/input/buttons and existing visible focus behavior; Search's explicit borderless override remains |
| Home, 05 left | Retain strong lesson/hero/quick-access outlines and offset shadows; lighten navigation frame |
| Browse, Topics and Search, 06 | Retain strong course cards, topic tiles and filter controls; do not reintroduce a Search input frame |
| Lesson detail/curriculum, 07 | Retain stronger lesson summary and feature-card outlines; existing light internal separators remain |
| Reader, 08 left/middle | Use a medium-gray Up next row; retain stronger reading/reflection/verse cards and footer actions |
| Quiz, 08 right | Use one-point medium-gray option frames; retain dark letter rings/selected badges, colored feedback, stronger question/feedback cards and primary action |
| Results, 07 right | Use soft next-action row outlines and a fine mint completion-emblem rim with no heavy emblem shadow; keep the lesson/result cards and primary action strong; score divider stays light |
| Progress, 05 right and 09 right | Soft hero without offset shadow, light summary/list frames and soft percentage marker; retain stronger colored statistic tiles from 05 |
| Profile, 12 left | Soft lavender header without offset shadow; light avatar rim, compact summary tiles and navigation groups |
| Settings, 12 right | Keep one-point light-gray groups/detail sheets and distinct red reset controls; anchored navigation with Profile selected |
| Shared bottom navigation, 05/06/09/12 | Light outer frame as requested; preserve lavender active tab, icons, routes and safe area |

Owner review is still required at normal and larger text sizes; these source changes do not establish visual/native acceptance. Dashboard styling is outside this learner-app pass.

SundaySeeds uses lesson series, Bible-story teaching, memory verses and reflection quizzes instead of career courses, paid enrolment and professional certificates. Labels, imagery, content length and screen count therefore differ. The target is faithful visual language and layout, not a claim that adapted screens are pixel-identical to the commercial-course mockups.

Keep sample content identifiable, with one clear storage explanation in Settings. Per owner feedback on 14 October, do not repeat local/device/preview disclaimers on learner screens. Keep actual failure/retry messages useful. Do not imply a real signed-in learner, live class, cloud sync or teacher service. Buttons must have implemented behaviour or be omitted; prototype-only actions must be clearly identified as such.

Settings exception explicitly requested on 14 October: show all reference-12 components even where services are deferred. Use labelled availability detail sheets for account/email/video/download features and unpublished policies; Log out stays disabled while no account is signed in. Do not add pretend preferences or fabricated policies. Preserve working editor/replay/reset actions and the single storage explanation under Data usage. Settings card strokes use `colors.line` at one point, not the usual dark card outline. Bottom navigation stays visible with Profile selected.

## Acceptance checks

Record pass/fail and any visual deviations; these checks are targets, not evidence they have already passed.

1. Capture Home, Lessons, lesson detail, reader, quiz states, Progress and Profile at **360 × 800** and **390 × 844** logical pixels, at default text scaling. Record platform and viewport. Compare the relevant panels side by side with the source screenshots, checking margins, card proportions, type hierarchy, accent placement, outlines and shadows.
2. At both widths, require no unintended horizontal overflow, overlapping controls, clipped essential labels or content hidden behind navigation. Long lesson names must wrap or truncate intentionally; the full title must be accessible on its detail screen.
3. Repeat representative screens at **150% and 200% text scaling**. Vertical scrolling and taller cards are acceptable; unreadable truncation, overlap and unreachable primary actions are not. Native font-scale testing is required before native accessibility can be marked verified.
4. Give interactive controls at least **44 × 44 logical pixels** of effective touch area, including hit padding. Selected quiz options need an icon or explicit state as well as colour. Check normal body-text contrast at **4.5:1** or better and large text at **3:1** or better.
5. Exercise every visible action: tabs navigate, search changes results, lesson cards open their matching lesson, quiz answers update selection/feedback, previous/next controls respect boundaries, and completion updates progress. Test Back navigation and restarting the app after saving. Do not accept controls that merely look clickable.
6. Inspect empty search, unanswered quiz, completed lesson, loading/recovery and persistence-failure states. Do not show successful saving when persistence failed.
7. Keep evidence of actual checks, naming unresolved differences explicitly. Browser captures can guide visual refinement; Android device/emulator checks remain required before claiming Android readiness.

Home and lesson detail remain the first visual baseline for owner approval. Carry the reference tokens through the remaining screen groups in implementation-plan order while owner reviews are queued; pending review does not count as acceptance. The owner rechecks affected screens when shared styling changes.

**15 October O1 source checkpoint:** implemented in parallel with teacher studio at the owner's request. Reference-01's three panels inform the compact introduction, larger bounded imagery, paired pastel stickers with strong outlines/offset shadows, working feature-card arrows, uniform circular indicators and responsive Back/Next/Get started footer. Existing SundaySeeds imagery/copy is retained rather than inventing instructors/certificates. Completion preference, Settings replay, Skip and save-error recovery use unchanged hooks. Footer actions stack below 350 logical pixels or at fontScale >= 1.5. Scoped formatting/source/whitespace checks only; no tests/typecheck/lint/builds/runtime/native checks. Owner: Settings → Replay introduction; inspect all three pages, feature arrows, Back/Next, Skip/Get started, Home return, preference persistence, failure recovery and narrow/larger text. Next mobile task is O2 minimal setup, separate from teacher LMS-T5 and backend planning.

**15 October O2 implementation checkpoint:** references 02/04 were inspected as alternative treatments for one optional display-name step, not two setup flows. First-run Welcome → Get started → optional name → Home reuses the existing profile hook and storage. Initial Skip bypasses setup; setup Skip keeps the existing name untouched; Back returns to the final introduction page. Safe hydration precedes editing, failed reads offer retry/skip, failed saves retain typed content, and welcome-preference failure retains retry/Continue for now. The lavender avatar, outlined shared input, single progress strip and mint purpose note adapt the references without unsupported personal fields. No routes, storage keys, schema or dependencies changed. Existing completed users keep Home; Settings replay now offers optional name setup after Get started, following the owner's inability to reach the first-run-only step. No data reset is required. Owner checks name/blank/skip/Back, Home/Profile persistence, read/save errors, Profile Edit, replay, 360/390 widths, 150%/200% text and keyboard. Scoped source formatting and whitespace checks only; tests/build/typecheck/lint/runtime/native checks remain pending. O1–O2 design source is complete; acceptance is still pending. Topic preferences, accounts and extended profile fields remain deferred.

**15 October O2 replay correction:** the owner could not confirm the name step because existing completed users skipped first-run setup and replay ended at Home. Settings → Replay the introduction → Next → Next → Get started now opens the same optional name screen. Initial Skip still reaches Home; setup Skip preserves the current name; Back returns to the last intro page; save/read/preference recovery remains shared. The Settings description now advertises this path. No reset, new route, storage key or dependency. This supersedes earlier introduction-only replay notes. Owner should check replay with an existing name, changed name, Skip, Back and error recovery. References/layout remain unchanged; reference-02 re-inspected. Scoped source formatting/whitespace only; runtime/native acceptance and tests remain pending owner.
