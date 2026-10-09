# Changelog

Notable changes are recorded here. Unreleased entries describe development milestones, not a production release.

## Unreleased

### Added
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
- Unified reading-position labels across lesson cards, the reader, Continue learning and Progress; quiz completion is stated separately.
- Quiz choices now distinguish selected, correct and incorrect states with text and icons. Home labels are larger, shortcut tiles wrap for narrower screens/larger text, and the hero action has a 44-point minimum height.
- Moved reset confirmation and device-storage information from Profile into Settings; the name editor now returns to its originating screen after save or cancel.
- Removed unused, untracked Claude Expo plugin settings from the mobile folder.
- Replaced the discontinued Kotlin app with the agreed React Native direction; preserved reusable artwork.
