# Component and screen standard inventory

4 November 2026. Source inventory; app/native visual acceptance remains pending.
Paths below are relative to `apps/mobile/src/`. Shared color changes do not
authorize route, content, storage, session or backend behavior changes.

## Canonical components

| Owner | Component | Required variants/states | Current adoption |
| --- | --- | --- | --- |
| `shared/ui/Text.tsx` | Text | UI hierarchy, editorial reading, mixed-script runs, muted text, system scaling | Lexend and Noto interface fonts with separate editorial and accent roles; compatibility small roles remain |
| `shared/ui/Button.tsx` | Button/IconButton | Primary, dark, outline; focus/press/disabled/busy; accessible name | Forest/ivory, shared press tokens; target geometry preserved |
| `shared/ui/InputField.tsx` | Editable fields | Idle, focused, disabled, error; visible label, selection/cursor | Sage/forest; stationary focus stroke; account variant retained |
| `shared/ui/Card.tsx` | Card | Neutral/toned; strong, soft, subtle stroke; optional crisp shadow | Muted card palette; reference stroke differences preserved |
| `shared/ui/BottomNav.tsx` | Bottom navigation | Exactly one selected section, inactive, focus, press, semantic label, current route ownership | Forest/ivory selected, flax tray and cream safe area |
| `shared/ui/ProgressBar.tsx` | Progress | Actual amount; unavailable handled by caller; accessible value | Forest fill/sage track; no fabricated completion |
| `shared/ui/Screen.tsx` | Screen shell | Scroll, footer, tabs, safe areas, pending overlay | Cream via shared canvas; keyboard/loading behavior retained |
| `shared/ui/PageHeader.tsx` | Header | Title/subtitle/back; long title and larger text | Existing responsive composition; density review pending |
| `shared/ui/SectionHeading.tsx` | Section header | Heading, optional real action | Existing hierarchy; shared token typography adoption continues |
| `shared/ui/PageLoadingOverlay.tsx` | Pending work | Focused pending, reduced motion, blur/tint fallback, failure | Centered green dots use the shared palette |
| `features/courses/components/CourseJourneyCard.tsx` | Home course preview | Loading, loaded, empty, unavailable, retry | Sage placeholder follows the card layout and stays still with reduced motion. |
| `shared/ui/AnimatedSplash.tsx` | Brand startup | Loaded/fallback, motion/static, finite completion, background | One-shot vector mark; font/layout handoff and input fences retained |
| `features/learning-profile/components/LearningChoiceCards.tsx` | Profile choices | Unselected, selected, disabled, selection limit, text/marker | Neutral/sage, forest check; underlying selection rules unchanged |
| `features/profile/components/ProfileAvatarPicker.tsx` | Profile images | Selected marker, keyboard focus, press | Cartoon portraits sit on the cream page with sage fill and a checkmark for selection. The neutral silhouette is the fallback for unset avatars. |
| `features/quizzes/components/QuizChoice.tsx` | Quiz choice | Selected, checked/locked, correct, incorrect | Sage selection; correctness still has explicit text/icons |
| `features/settings/components/SettingsDetailSheet.tsx` | Settings detail | Available/unavailable, language selected, dismiss/scroll | Cream/sage, forest selected marker; no new preference capability |

## Screen-by-screen coverage

| Journey | Palette/type/state standard | Preserve and review |
| --- | --- | --- |
| Native launch → splash | Initial ivory seed/forest; same final identity; light launch status icons | Fonts ready **or failed**, layout/asset readiness, finite fallback, OS insets |
| Welcome1–3 | Seed tile, cream canvas, sage feature, shared wheat details, forest CTA | Next/Back/Skip/Get started, image motion cleanup, save/recovery, small text scale |
| Account choice/minimal setup | Same neutral/brand roles and progress | Guest/skip/name persistence, exit destinations and unavailable state |
| Sign in/sign up | Cream page, sage hero, consistent fields and actions | Password visibility, errors, pending, provider availability, keyboard/Back |
| Verification/recovery/reset | Same account surfaces and text hierarchy | Invalid/expired/used proofs, resend/request outcomes, retry and account boundaries |
| Learning profile | Neutral choice cards, sage selected, forest check/progress | Optional answers, selection limits, Skip, save/conflict/reload; no new data rules |
| Home | Forest seed header with the saved Profile portrait, sage course preview and memory verse | Profile shortcut, nonblocking course placeholder, name wrapping and content artwork stacking |
| Course discovery | Shared forest CTA and muted cards | Catalog availability, guest browse, verified joining and empty state |
| Lesson reading | Editorial20/32; Latin/Ethiopic runs; existing UI headings | Content/section IDs, saved place, bookmarks, reflection privacy and scrolling |
| Quiz/results | Sage selected, labelled correctness, real recorded progress | Joined-edition retries, drafts, completion and access rules |
| Progress | Raised paper guidance card and forest action | Guest, unverified and verified paths to progress in joined courses |
| Profile | Fine warm edges, raised paper navigation, sage portrait card | Name and portrait editing, account/guest differences, larger text, logout Home return |
| Settings/detail/data | Raised paper groups, warm edges, sage selection, forest current-section marker | Actual availability, verified status, language save, destructive intent and recovery |
| Unknown/empty/failure | Shared roles, useful message and real next action | Back/Home/retry reachability; no stranded navigation |

The bottom-nav route classifier makes course routes part of Courses and Settings
part of Profile. All selected sections share the same forest background; section
identity never changes the primary palette. Review direct and nested routes.

## Screen review standard

- Capture default plus relevant focused/pressed/selected/disabled/pending/error/
  empty/unavailable/success states. Do not review only the happy path.
- Check320/390px, a wider viewport,150%/200% text, keyboard-up and safe areas.
  Existing wrapping/stacking thresholds remain until deliberately reviewed.
- Review English, Amharic and mixed-script labels/names, numerals and punctuation.
  Local font asset coverage is not proof of native rendering or translation quality.
- Preserve distinctions between strong Home/discovery outlines and lighter
  Settings/Profile/navigation strokes. Focus thickness must not move input text.
- Check real operation acknowledgement, exit/cancel/retry and motion cleanup.
  No source or specimen review is a substitute for account/session/native behavior.

## Migration status

Implemented in source: shared palette, first-run/auth/Home/discovery selection
surfaces, quiz/progress roles, Settings selected colors, local font registry,
mixed-script Shared Text and editorial lesson-body roles. Four earlier bounded
palette commits separate foundation, first-run, Home and quiz/progress adoption.

Pending: rendered app/native review; legacy caption 10/16 and compact body density
migration; all feature-local Pressable/sheet/navigation motion values; reader
preferences; complete icon/spacing/radius-token adoption; staff dashboard styling;
remaining original learner-image replacement. Existing staff prototypes keep their
own source until separately migrated using their workspace agreement.

No app tests, builds, typecheck, lint or runtime/native acceptance were run during
this source/standards work. The interactive guide is a design reference only.
