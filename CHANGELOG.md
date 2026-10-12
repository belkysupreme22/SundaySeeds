# Changelog

Notable changes are recorded here. Unreleased entries describe development milestones, not a production release.

## Unreleased

### Added
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
