# Changelog

Notable changes are recorded here. Unreleased entries describe development milestones, not a production release.

## Unreleased

### Added
- Teacher dashboard proposal with Overview/Lessons/Classes tabs, in-memory lesson draft create/edit/preview, a labelled example reading and optional chart illustration. No publishing or class service is connected; owner runtime/visual acceptance is pending.
- React + TypeScript dashboard foundation in `apps/teacher-web`, with a responsive shared shell, Radix primitives, Lucide icons, Poppins, shared text fields and lazy-loaded Recharts examples. Installation, lockfile generation and runtime checks remain with the owner.
- Shared topic/status filter panel for Browse and Search, with draft selection, live matching count, Apply/Clear/Cancel behavior and active-filter summaries; search text is retained. Owner runtime and visual review are pending.
- Dedicated lesson search/results with title/topic/scripture matching, inherited topic/status context, removable filters, query clearing, actual counts and empty-result recovery. Browse and Search share matching logic; owner runtime and visual review are pending.
- In-app retries for failed progress loads and saves, with an outlined peach recovery card and a busy state while retrying.
- Lesson-detail learning tiles for each sample lesson, a reading-position summary and resume marker, and a Revisit lesson action that keeps completion and best quiz scores.
- Settings screen with personal information, learning-data controls and About SundaySeeds, accessible from Profile.
- Optional device-local display name, a Profile editor and personalised Home/Profile greetings, with storage kept separate from learning progress.
- Pastel topic browsing for Faith, Kindness, Courage and Prayer, with sample-lesson counts, combined topic/search/status filtering and a clear-filters action.
- Quiz results now offer an answer review with selected choices, correct answers and explanations; result and review UI live in separate feature files.
- Home Continue learning cards and an In progress lesson filter; opening the first reading now saves its starting position.
- Windows startup launcher: double-click `start.cmd` to start the mobile development server.
- Three-page welcome flow with Skip, Back, Next and Get started controls, a saved completion preference and replay from Profile.
- First runnable mobile preview: Home, lesson browsing, reading, quizzes, progress and profile.
- Four sample lessons, bookmarks and device-local progress with saved best quiz scores.
- Shared pastel UI components, feature-based organisation and eight passing data tests.
- TypeScript, linting and formatting configuration.
- Expo and TypeScript mobile project for SundaySeeds.
- Project working agreement covering design fidelity, feature boundaries, verification and collaborative development.

### Changed
- Aligned the Profile avatar/name/edit row and replaced tall summary cards with compact white icon/count tiles from reference-12. Removed repetitive local/device/preview wording across learner screens, keeping one storage explanation in Settings and actionable save warnings. Owner runtime/visual review is pending.
- Profile follows reference-12 with a compact local identity card, edit icon, three real learning counts and grouped outlined navigation. Added distinct name/learning loading and recovery presentation plus narrow/large-text stacking; owner runtime and visual review are pending.
- Progress follows references 05/09 with a portrait hero, actual completion summary, four pastel local-learning statistics and outlined lesson rows. Added distinct first-use/loading/recovery presentation and narrow/large-text stacking; owner runtime and visual review are pending.
- Quiz and results follow references 08/07 with compact checked-answer progress, outlined answer states, a mint completion emblem, lesson summary, separate attempt/best scores and review/retry rows. Large-text layout and storage-warning copy are included; owner runtime and visual review are pending.
- Reader follows reference-08 with a compact section header, explicit reading position, section-specific reflection cards, memory verse, Up next navigation and adaptive footer actions. Reading position remains separate from quiz completion; owner runtime and visual review are pending.
- Lesson overview follows reference-07 with a compact portrait header, outlined metadata, icon-and-copy learning tiles and grouped reading/quiz curriculum. Existing progress, bookmark and revisit behavior is preserved; owner runtime and visual review are pending.
- Simplified Browse/Search filters to icon-only controls without adjacent summaries or chips. Topic/status options can be deselected, and applying with no selections removes all filter restrictions while retaining the query.
- Explicitly reset the inner web text input's outline style, colour and shadow across shared inputs after the owner identified a remaining browser focus rectangle in Search.
- Removed the dark frame from the Search lessons field and its clear icon at the owner's request; Search now uses a soft borderless background with lavender focus feedback.
- Standardised every current editable field (lesson search and profile name) with one shared idle/focus stroke, no inner browser outline or Android underline, and no border-induced layout shift. The browse search entry uses the same keyboard-focus treatment; visual verification remains pending.
- Topic browsing follows reference-06's compact pastel grid with aligned icons, actual counts, a full-width All lessons tile and a single-column layout for narrow screens or larger text. Owner runtime and visual review are pending.
- Lessons browse now follows reference-06 with a compact header/search, responsive lavender portrait hero, topic action, result count and clear controls; existing filters, bookmarks and lesson navigation are retained. Owner runtime and visual review are pending.
- Added discovery and maintenance instructions for an ignored local agent handoff; aligned agent verification guidance with the owner's implementation-focused workflow.
- Replaced the broad frontend roadmap with an ordered screen-by-screen plan, starting with Lessons discovery; recorded reference mappings, owner acceptance criteria, backend dependencies and deferred designs.
- Lesson cards give bookmarks their own control column and stack artwork above copy for narrow screens or larger native text.
- Home follows the reference's hero-to-quick-access order, with more compact shortcut tiles and separate hero text/artwork columns that stack for narrow screens or larger native text.
- Progress recovery preserves stored data after read failures and retries the current snapshot without repeating quiz or bookmark actions. Older queued saves no longer clear a warning before the latest changes are saved.
- Lesson metadata now uses the actual reading/question counts; the detail hero and learning tiles adapt to narrow layouts and larger native text settings.
- Unified reading-position labels across lesson cards, the reader, Continue learning and Progress; quiz completion is stated separately.
- Quiz choices now distinguish selected, correct and incorrect states with text and icons. Home labels are larger, shortcut tiles wrap for narrower screens/larger text, and the hero action has a 44-point minimum height.
- Moved reset confirmation and device-storage information from Profile into Settings; the name editor now returns to its originating screen after save or cancel.
- Removed unused, untracked Claude Expo plugin settings from the mobile folder.
- Replaced the discontinued Kotlin app with the agreed React Native direction; preserved reusable artwork.
