# 0002 — Retry local progress without repeating learner actions

**Status:** Accepted

## Context

A temporary storage read failure previously required reopening the app. The save-error message asked the learner to repeat an action, which could undo a bookmark or force them to repeat a quiz. Concurrent local saves also allowed an older success to clear a warning while newer changes were still waiting to save.

## Decision

Keep recovery in the existing learning store and expose `retryStorage` through its feature hook. A failed read can be retried; writes stay paused until data loads successfully or the learner explicitly resets progress. A failed save retries the current in-memory snapshot through the same serialized queue as ordinary changes and resets. Concurrent retry requests share one attempt. Only the newest queued write can clear a save warning.

The recovery card is owned by the progress feature and composed in the app layout. It does not replace the navigator during retries, preserving current quiz answers and reading screens. Errors remain visible during retries; another failure keeps the card actionable. Read-error messaging explicitly states that learning changes are paused.

## Consequences

- Retries preserve lesson completion, best scores and bookmarks without repeating their actions.
- New edits and explicit resets retain queue ordering and cannot be overwritten by stale retry data.
- Failed read/parse attempts preserve the original stored bytes. Retry cannot repair permanently malformed data; the existing confirmed reset remains available in Settings.
- Unsaved in-memory changes can still be lost if the app closes before a successful write. The message asks the learner to keep the app open.
- No schema, storage key, dependency, backend or cloud-sync changes are introduced.
