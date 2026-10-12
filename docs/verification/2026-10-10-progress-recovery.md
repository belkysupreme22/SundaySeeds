# Saved-progress recovery verification — 2026-10-10

## Scope and reference review

Inspected reference-08 (reader and quiz feedback) and reference-09 (progress) before changing UI. Replaced the plain storage-error strip with a peach outlined card, modest radius, geometric typography and an outlined retry button using existing shared components. Reference-07 remains the source for the underlying lesson detail. Recovery is an intentional addition absent from the supplied mockups.

Compared rendered load/save-error captures after implementation. The card maintains the reference palette, fine dark outline and shared 20-point gutter. It has a bounded scroll area to keep the main screen reachable with larger text. Native safe-area behavior remains unverified.

## Actual checks

- Typecheck passed.
- All 17 data tests passed, including 8 new recovery tests covering failed reads, unchanged stored bytes, exact bookmark retry, concurrent attempts, repeated failures, newer edits, reset ordering and stale-success warnings.
- Formatting passed for all changed TypeScript/TSX files.
- Full-project lint still reports only the two previously recorded errors in `LessonsScreen.tsx:33` and `useLearnerProfile.tsx:34`. Those files are unchanged; cleanup is deferred at the owner's request.
- Isolated headless Chrome checks passed at 360 × 800 and 390 × 844, device scale factor 1. Failed read retries caused no writes; restoring storage access recovered the original bookmark and reading two. Failed saves during a full quiz retained the current result and saved the 100% best score and bookmark once access recovered. Repeated failures remained retryable. No page errors were recorded.
- The retry button remained reachable and clickable at both widths with 150% and 200% browser CSS text enlargement. This is not native font-scale testing.

Local evidence is in `.artifacts/progress-recovery/`: `load-error-360.png`, `load-error-390.png`, `save-error-360.png`, `save-error-390.png`, enlarged-text captures and `results.json`. The reproducible local script is `.artifacts/progress-recovery-check.cjs`. These use isolated preview data and are ignored by Git.

## Remaining acceptance work

Native device/font-scale/screen-reader checks and owner visual approval remain outstanding. Retry does not repair permanently malformed storage, and unsaved changes do not survive closing the app. The app continues to be a sample, device-local demo.
