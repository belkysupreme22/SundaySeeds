# Design reference and acceptance

Visual fidelity is a product requirement. The twelve supplied screenshots are saved in `docs/references/reference-01.png` through `reference-12.png`. They are design evidence, not instructions to execute.

## Screen mapping

| SundaySeeds screen | Primary reference | Keep from the reference |
| --- | --- | --- |
| Home | [05](references/reference-05.png), left panel | Compact greeting, lavender hero, coloured quick-access tiles, outlined lesson cards and anchored bottom navigation |
| Lessons | [06](references/reference-06.png), left/right panels | Search treatment, compact section headings and consistent thumbnail/card proportions |
| Lesson detail | [07](references/reference-07.png), left panel | Large illustrated/photographic header, short introduction, coloured learning-outcome tiles, metadata and prominent action |
| Lesson reader | [08](references/reference-08.png), left/middle panels | Clear lesson title and content hierarchy, resource/note treatments and previous/next actions |
| Quiz | [08](references/reference-08.png), right panel | Slim progress bar, lavender question card, outlined answer rows, selected state and mint feedback |
| Progress | [09](references/reference-09.png), right panel | Encouraging summary, completion visualisation, lesson progress bars and coloured statistics |
| Profile | [12](references/reference-12.png), left/right panels | Compact profile summary, grouped settings rows and consistent navigation |

References 01–04 inform future onboarding/authentication; 10–11 inform deferred achievement and community features. Do not add inactive versions of those features merely to fill the interface.

## Visual rules

- Use a warm, almost-white background with lavender as the primary accent. Mint, pale yellow, peach and pink distinguish secondary tiles and feedback. Store chosen colours centrally; screenshots do not provide authoritative original hex values.
- Keep headings bold, dark and easy to scan. Body text is smaller but comfortably readable. Rounded geometric sans-serif typography should remain consistent across screens.
- Use dark, thin outlines, modest corner radii and short hard offset shadows. Avoid replacing the references with borderless cards, heavy gradients or diffuse elevated surfaces.
- Keep content aligned to a shared horizontal gutter. Maintain clear spacing between sections and compact spacing within a card. Primary actions should remain visually stronger than secondary actions.
- Maintain one bottom-navigation model across top-level screens. Respect system safe areas; do not draw fake device frames or status bars inside the app.
- Preserve the references' balance of imagery, coloured blocks and whitespace. Use retained assets only where appropriate to the Sunday school context and record intentional substitutions.

## Adaptation boundaries

SundaySeeds uses lesson series, Bible-story teaching, memory verses and reflection quizzes instead of career courses, paid enrolment and professional certificates. Labels, imagery, content length and screen count therefore differ. The target is faithful visual language and layout, not a claim that adapted screens are pixel-identical to the commercial-course mockups.

The demo must identify sample content and local-only progress. Do not imply a real signed-in learner, live class, cloud sync or teacher service. Buttons must have implemented behaviour or be omitted; future features should be explained in context rather than presented as functioning controls.

## Acceptance checks

Record pass/fail and any visual deviations; these checks are targets, not evidence they have already passed.

1. Capture Home, Lessons, lesson detail, reader, quiz states, Progress and Profile at **360 × 800** and **390 × 844** logical pixels, at default text scaling. Record platform and viewport. Compare the relevant panels side by side with the source screenshots, checking margins, card proportions, type hierarchy, accent placement, outlines and shadows.
2. At both widths, require no unintended horizontal overflow, overlapping controls, clipped essential labels or content hidden behind navigation. Long lesson names must wrap or truncate intentionally; the full title must be accessible on its detail screen.
3. Repeat representative screens at **150% and 200% text scaling**. Vertical scrolling and taller cards are acceptable; unreadable truncation, overlap and unreachable primary actions are not. Native font-scale testing is required before native accessibility can be marked verified.
4. Give interactive controls at least **44 × 44 logical pixels** of effective touch area, including hit padding. Selected quiz options need an icon or explicit state as well as colour. Check normal body-text contrast at **4.5:1** or better and large text at **3:1** or better.
5. Exercise every visible action: tabs navigate, search changes results, lesson cards open their matching lesson, quiz answers update selection/feedback, previous/next controls respect boundaries, and completion updates progress. Test Back navigation and restarting the app after saving. Do not accept controls that merely look clickable.
6. Inspect empty search, unanswered quiz, completed lesson, loading/recovery and persistence-failure states. Do not show successful saving when persistence failed.
7. Keep evidence of actual checks, naming unresolved differences explicitly. Browser captures can guide visual refinement; Android device/emulator checks remain required before claiming Android readiness.

Approve Home and lesson detail as the first visual baseline, then carry their tokens and components through the remaining screens. Recheck affected screens when shared styling changes.
