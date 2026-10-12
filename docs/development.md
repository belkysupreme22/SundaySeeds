# Development workflow

## Run the mobile app

The application is in `apps/mobile`. The previous Kotlin project and its Gradle/build files have been removed; use the Expo workflow for this app.

Commands below reflect the initial Expo scaffold and are provisional until the implementation's dependency installation and runtime checks are complete. Use the committed lockfile's package manager once available.

```powershell
cd apps/mobile
npm install
npm run start
```

Use `npm run android` with an Android emulator or device ready. A web preview is useful for quick layout feedback when its dependencies are configured; it does not replace native testing. Local iOS simulator testing requires macOS.

## Work in reviewable increments

Current owner preference: keep each increment small. The owner runs builds, tests and intensive terminal checks; provide the relevant commands instead of running them unless explicitly requested. Report unverified behaviour clearly.

### Input stroke consistency checkpoint (2026-10-12)

**Later owner correction:** the dark frame on Search was unwanted. Search now uses InputField's borderless `soft` appearance, with a pale idle background and lavender focused background; its clear icon also has no enclosing dark box. Profile retains the outlined appearance described below. This intentionally adapts reference-06 based on direct feedback. Check Search idle/focused/with text and keyboard access to Clear search; runtime/visual review remains pending.

During D3 the owner requested consistent focused/unfocused input strokes across screens. Source inventory found two editable fields: Lesson Search and Edit Profile. Both now use `shared/ui/InputField`: one 1-point dark outer stroke when idle, a 2-point dark stroke with pale focus fill when focused, and compensating padding to keep dimensions stable. The input's inner border, browser outline and Android underline are suppressed; the wrapper supplies visible focus. Disabled profile saving uses the muted stroke. Browse's search entry is a button, with the same visible keyboard-focus treatment. References 03, 06 and 12 informed the outlined treatment; no authentication screens were added.

Owner checks: focus/blur both editable fields with touch and keyboard, type and clear values, use search's clear button, and inspect disabled profile saving. Confirm one outer stroke, a visible focus change, no positional jump and no platform underline/inner rectangle at normal and larger text sizes on web and native. The browse search entry should show focus when reached with Tab. Source inventory/formatting only; no runtime, native or visual pass is claimed.

### Dedicated search D3 checkpoint (2026-10-12)

Reference-06 right panel was inspected before implementation. Browse's search-looking control now opens `/lessons/search` with the current topic and status. The dedicated screen uses an outlined query field, lavender Lessons label, removable topic/status labels, actual matching count and shared outlined lesson cards. Query matching remains case-insensitive, ignores outer whitespace and covers title/topic/scripture through `useLessonResults`, shared with Browse. Blank queries show all lessons within the selected context. Clear search preserves filters; Clear filters/Search all lessons preserves the query. The full topic/status selection control remains D4.

Owner checks: enter from All lessons, a topic and Saved/In progress/Completed. Search `love`, `prayer` or `Luke`, mixed case and outer spaces; try an unmatched phrase and recover with query/filter clearing. Remove a context label and confirm the count changes correctly. Toggle a bookmark in Saved search and confirm the list updates. Open a result and return, confirming query/context retention; Back from Search should restore the originating Browse view. Direct-entry Search with no history should return to Lessons. Check the keyboard, 360/390 widths, large native text, clear controls and bottom navigation. New routes may require restarting the owner's Expo session to refresh generated route types.

Only changed source files were formatted, including the subsequent shared-input fix requested during this increment. No tests, typecheck, lint, builds or runtime/visual review were run. No new dependency, storage key or backend service was added; the two known lint issues remain deferred. D3 and the input-stroke fix are implemented, acceptance pending; D4 is next.

### Topic grid D2 checkpoint (2026-10-12)

Reference-06 middle panel was inspected before implementation. Topic tiles now have compact proportions, aligned icons, tighter spacing, fine outlines and offset shadows. Counts derive from sample lessons. The reference's full-width final row is adapted into All lessons with the actual collection count, replacing the separate outline button. The four existing topics remain; no filler categories were added. Topics switch to one column below 350 logical pixels or at native font scales of 1.5 and above.

Owner checks: open Topics from Lessons, compare the grid against reference-06 at 360/390 widths, below 350, and at 150%/200% native text. Check that each topic opens its matching lessons/count, All lessons removes topic/status restrictions, Back returns sensibly and bottom navigation remains usable. No typecheck, lint, tests, builds or runtime/visual review were run for this increment. D2 is implemented, acceptance pending; D3 dedicated search/results is next.

### Lessons browse D1 checkpoint (2026-10-12)

Reference-06 left panel was inspected before implementation. Lessons now groups a compact heading and outlined search field above a lavender portrait hero and dark topic action. The retained artwork substitutes for the reference portrait; sample lessons replace popularity/teacher claims. Topic views use their existing colour, description and an All topics action. The hero separates copy from artwork and stacks below 350 logical pixels or at native font scales of 1.5 and above.

The list has a sample/topic heading, actual result count and Clear all action when narrowed. Search can be cleared independently; combined topic/status/search filtering, empty-state recovery, outlined lesson cards, independent bookmarks and anchored bottom navigation are retained. Dedicated search and filter redesign remain D3/D4.

Owner checks: compare Lessons with reference-06 at 360/390 widths and 150%/200% native text. Open topics from the header and hero; choose a topic and clear it. Search a title/scripture, combine with Saved/In progress/Completed, clear the query or all filters, and try no results. Open a lesson and toggle its bookmark independently. Check bottom navigation and large-text hero flow. No typecheck, lint, tests, builds or runtime/visual review were run, per the owner's instruction. D1 is implemented, acceptance pending; D2 topic grid is next.

### Home design implementation checkpoint (2026-10-12)

Reference-05's left panel informs this increment: compact lavender hero, adjacent portrait, quick-access tiles immediately below, then lesson cards. Hero text and artwork now occupy separate layout columns rather than overlap; they stack below 350 logical pixels or at native font scales of 1.5 and above. Quick-access tiles are shorter at default text size. Continue learning follows the shortcuts so returning learners keep the same entry layout.

Lesson cards keep the outlined thumbnail-and-copy layout. Bookmarks now have an independent 44-point column instead of floating over the text; at narrow widths or larger native text, artwork stacks above the copy.

The owner explicitly requested implementation only and will handle terminal-heavy checks and visual review. No build, typecheck, lint, tests or completed runtime checks were performed for this design increment. Check Home at 360/390 widths, 150%/200% native text size, and with both fresh and existing learning progress. Compare with reference-05; confirm hero and shortcut actions and independent lesson-card/bookmark actions remain usable.

### Saved-progress recovery checkpoint (2026-10-10)

If saved learning cannot load, use Try loading again. Until loading succeeds, learning mutations remain paused and stored bytes are preserved. If saving fails, keep the app open and use Try saving again; this writes current reading positions, quiz scores and bookmarks without repeating the original action. The card stays visible after another failure and disables its retry button while the retry is running. A successful retry must retain the active quiz result and reading screen.

Use an isolated preview profile to simulate storage errors; do not corrupt personal data for a test. Check the recovery control at both target widths and larger text sizes. The card scrolls within a limited height so the current screen stays reachable. See [verification/2026-10-10-progress-recovery.md](verification/2026-10-10-progress-recovery.md) for actual checks and [decision 0002](decisions/0002-local-progress-recovery.md) for persistence behavior.

### Lesson-detail checkpoint (2026-10-10)

Open each of the four sample lessons. Check the coloured “What you’ll learn” tiles, actual reading/question counts and the prominent Start this lesson action. Saving an unopened lesson must not create reading progress. Start a lesson, move to reading two and return to its detail: the summary and Resume here marker should identify reading two. Reload and Continue learning to restore that position. Jump directly to reading three; this must not mark earlier sections as read or the quiz as completed.

After finishing a quiz, the detail screen should say Lesson completed and offer Revisit lesson. Revisit starts at reading one, retaining completed status, best quiz score and bookmark after reload. A device-storage error must remain visible without claiming that current progress was saved.

Compare detail screens with reference-07 at 360 × 800 and 390 × 844, and check 150%/200% text size. Learning tiles switch to a single column at native font scales of 1.5 or greater; browser text enlargement is only a layout approximation. Native device checks and owner visual approval remain required.

Verification results are recorded in [verification/2026-10-10-lesson-detail.md](verification/2026-10-10-lesson-detail.md).

### Reading progress, quiz feedback and readability checkpoint

Open a lesson and visit each reading. The reader, lesson cards, Continue learning and Progress should agree on Reading position (1 of 3, 2 of 3, 3 of 3). The full reading-position bar on reading three still says Quiz not finished. Only finishing the quiz changes the label to Lesson completed and updates the overall completed-lesson count. Reopening a completed lesson should keep its completed status.

Choose a wrong quiz answer: before checking it uses a neutral selection icon; after checking, your answer has a peach background, an X and an Incorrect label, while the correct answer has a mint background, checkmark and Correct answer label. Check a correct selection too, and verify the next question clears the feedback.

On Home, inspect the larger shortcut and hero labels at normal text size, then at 150% and 200% system text size. Shortcut tiles should wrap into fewer columns without clipping. Check the hero button remains reachable. Launch with `start.cmd`; runtime and native layout checks remain with the owner. No stored progress is changed by this display update.

### Settings checkpoint

Open Profile -> Settings using either the gear icon or Settings button. Open Display name, save or cancel, and check that you return to Settings; opening the editor directly from Profile should still return there. Under Learning data, open Reset preview progress and first choose Keep my progress. If you want to test deletion with sample data, confirm the reset and check scores, reading positions and bookmarks are cleared while your name and introduction preference remain. Reload to check the reset persists. Read the About section and return to Profile using Back.

No new dependencies or storage keys. Launch with `start.cmd`; runtime checks remain with the owner.

### Profile name checkpoint

Open Profile -> Edit profile, enter a first name or nickname and save. Check both the Profile and Home greetings, then reload to confirm persistence. Try Cancel, a name containing spaces, a long name and saving a blank field (restores “learner”). Reset preview progress should keep the display name. Names use `sundayseeds.profile.v1`, separate from lesson progress and welcome preferences. Storage failures keep the editor open; failed profile reads must be retried before editing.

No new dependencies. Launch with `start.cmd`; runtime and keyboard/layout checks remain with the owner.

### Topic browsing checkpoint

Open Lessons -> Browse topics. Check the four pastel cards and their sample-lesson counts. Pick a topic and confirm only its lessons appear; combine it with search, Saved or In progress. All topics clears just the topic, while Clear filters on an empty result clears topic, search and status. An unknown topic URL should show all topics. On the topic screen, the Lessons tab stays highlighted and returns to the full lesson list.

No dependencies or storage changes. Launch with `start.cmd`; runtime and visual checks remain with the owner.

### Quiz answer review checkpoint

Finish a quiz with a mix of correct and incorrect answers, then tap Review answers. Check the question order, your chosen answers, the correct answers for missed questions and each explanation. Hide the review, retry the quiz and confirm the new attempt starts with no choices selected and a fresh review. A lower retry score should not replace the saved best score in Progress. The answer review belongs to the current attempt and is not stored after closing the quiz.

No new dependencies or storage changes. Runtime checks are left to the owner; launch with `start.cmd`.

### Continue learning checkpoint

Start a lesson, return Home and tap its Continue learning card: it should reopen the same reading, including reading one. Move to reading two, reload and check that position is restored. Home shows up to two unfinished lessons in collection order; View all opens the In progress filter. Complete a quiz and verify that lesson moves out of In progress into Completed. Saving an unopened lesson should only add it to Saved. Search works within each filter and gives a search-specific empty message.

No new dependencies or storage migration. Runtime checks are left to the owner; use `start.cmd` from the project root.

### Welcome flow checkpoint

On the next fresh app launch, the introduction appears before Home. Try Next, Back and Get started, then reload: Home should open directly. Profile -> View introduction replays the three pages; Skip returns to Home. Existing lesson progress and bookmarks use a separate storage key and are retained.

If verification is wanted, run these from `apps/mobile` after starting Expo once to refresh its generated route types:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

The new flow uses existing dependencies, so there is no installation step.

1. Choose one user-visible outcome and identify the affected files.
2. Reuse existing visual tokens and components before adding alternatives.
3. Keep screen layout, interaction logic and persistence separate.
4. Run the available type, lint and relevant test checks.
5. Exercise the changed flow and inspect rendered output.
6. Review the diff for unintended changes, secrets and generated files.
7. Commit a coherent change and update the changelog when it affects behaviour or delivery.

Document which checks actually ran. A successful type check is not evidence of a successful device launch. Tests should protect meaningful behaviour—scoring, persistence and later permissions—rather than repeat component implementation details.

## Visual acceptance

Start with Home and lesson detail as representative screens. Compare captures with the supplied references at a consistent viewport, refining spacing, typography, borders, shadows and card proportions. Adapt copy for Sunday school without losing the agreed visual style.

Check navigation, loading, empty and error states alongside the happy path. Follow the viewport, text-scaling and action checks in [design-reference.md](design-reference.md). Exact original fonts and photography may be unavailable; record substitutions instead of claiming an exact asset match.

## Parallel work

Assign independent tasks with explicit file ownership. Establish shared component contracts before agents implement dependent screens. One integration owner reviews changes and runs combined checks; agents should not overwrite shared files or commit unrelated work. Use MCP tools where they provide useful inspection or integration, and record their actual results.

## Git history and changelog

Commit small, complete outcomes with plain descriptions such as `Add weekly lesson cards to home` or `Restore saved quiz progress`. Avoid combining dependency changes, unrelated UI work and broad refactors into one commit.

Keep notable additions, changes and fixes under `Unreleased` in `CHANGELOG.md`. Move them into a versioned release when shipping. Record architecture decisions in `docs/decisions/`, including the reason and practical trade-offs. Never commit tokens, `.env` secrets, machine-specific SDK paths or build output.
