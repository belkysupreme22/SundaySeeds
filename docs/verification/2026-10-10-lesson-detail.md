# Lesson-detail polish verification — 2026-10-10

## Scope

Added lesson-specific learning outcomes in mint, yellow, lavender and peach tiles; actual reading/question counts; a reading-position summary and Resume here marker; and Revisit lesson for completed lessons. Revisit opens reading one while preserving completion, best score and bookmarks. Existing feature hooks own persistence; no storage keys, dependencies or backend integrations changed.

## Automated checks

- TypeScript: `npm.cmd run typecheck` passed.
- Data tests: `npm.cmd test` passed, 9/9. The new regression checks completed-lesson revisit through a fresh store hydration, including retained best score and bookmark.
- Full-project lint: `npm.cmd run lint` failed on two existing `react-hooks/set-state-in-effect` errors in unchanged files: `LessonsScreen.tsx:33` and `useLearnerProfile.tsx:34`. Direct ESLint confirms the same errors. These need a separate cleanup increment.
- Scoped ESLint: all five changed TypeScript/TSX files, including the regression test, passed.
- `git diff --check` passed.

## Web preview

Headless Chrome on Windows, Expo web preview, fresh isolated browser contexts. Viewports: 360 × 800 and 390 × 844, device scale factor 1. Tested through real controls with reloads; no production data or existing browser profile used.

- Fresh lesson detail, learning tiles, bookmark without starting, and Start this lesson passed.
- Reading two -> detail -> reload -> Continue learning restored reading two and its Resume here marker.
- Completing the three-question quiz changed the detail action to Revisit lesson.
- Revisit opened reading one; reload retained reading one, completed status, 100% best score and bookmark.
- Browser text enlargement at 150% and 200% produced no horizontal overflow in the inspected detail layout; the footer action stayed usable. This is CSS text enlargement, not native font-scale verification.
- No page errors were recorded during the main journey.
- Jumping directly to reading three on a second lesson kept Quiz not finished and marked only the current reading position. A simulated storage write failure displayed the global alert and the detail warning that latest progress may not be saved (`storage-error-360.png`).

Local screenshots and the browser-check script are under `.artifacts/lesson-detail/` and `.artifacts/lesson-detail-check.cjs` (ignored, not release artifacts). Captures include `new-360.png`, `new-390.png`, `resume-360.png`, `resume-390.png`, `completed-360.png`, `completed-390.png` and enlarged-text variants. The machine-readable result is `results.json`.

## Visual review and limits

Compared the default-size detail captures with reference-07's left panel: pastel learning tiles, outlined hero, geometric type and offset primary-action shadow match the intended visual language. Original retained portrait artwork substitutes for the reference's course photography; Sunday school outcomes replace professional course topics. Content is taller and scrollable, with the action fixed below it.

Native Android/iOS launch, native 150%/200% font scaling, screen-reader behavior and owner visual approval have not been verified. Milestone 1 is not declared complete. The next step is owner review of Home and lesson detail plus the remaining native acceptance checks.
