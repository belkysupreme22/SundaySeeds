# 0017 — Mobile connected quiz requests and recovery

23 October 2026. Status: implemented in source; owner runtime acceptance pending.

Connected quizzes use their own course/lesson route and feature-owned adapters,
request journal and hooks. Sample quiz routes, answer keys and device progress are
not used to grade or record connected work. The backend remains the authority for
checked answers, scores, edition best scores and distinct course completion.

Before Start, persist an actor/course/lesson-scoped UUID key in AsyncStorage using
the installed Expo Modules Core UUID generator. Before Check or Finish, persist
its pending operation with the acknowledged attempt ID and selection IDs as needed.
Serialize journal reads/writes per scope. This is recovery metadata, not completion
or content storage; no credentials, questions, explanations or scores are stored.
A failed/corrupt journal blocks sending a new mutation rather than discarding its
identity. A new key is created only by explicit retry after acknowledged Finish.
The journal persists across app restart and is separate from sample-learning reset.

On return, replay Start with its original key to recover accepted question state.
An interrupted Check reconciles the existing selection, then fetches the same
attempt and shows its acknowledged feedback. An interrupted Finish retries the
original attempt before Start/Get: an already-recorded result may return a redacted
receipt after withdrawal, while content access still fails correctly. That recovery
result contains no answer review. No fresh key is offered on an uncertain write.
Missing/invalid receipt or failed transport is never displayed as saved completion.

Hooks pin the initiating token and validate the current account generation, route,
request sequence and focus before publishing results or issuing subsequent writes.
Recovered Start must match any already-acknowledged journal attempt ID. A delayed
retry replacement passes the same focus/account fence before updating the live
journal reference. Adapters validate response identities, option membership, count/score consistency
and explicit null availability. Safe feedback and result screens reuse existing
quiz controls and page-wide loading overlays; shared defaults are unchanged.

Connected progress is shown on joined course details, with completion/best-score
captions beside its existing lesson links. Course focus reloads the server summary.
The Progress tab remains the sample-learning dashboard; it does not combine sample
and account histories. Cross-device incomplete-attempt discovery, reading/bookmark
sync, retention/export and consolidated account progress remain separate increments.
No new database schema, dependencies, real attempts or learner results were created
while implementing this mobile source.

Course-return actions dismiss back to an existing course destination, replacing
only when it is absent (deep link). Each new question remounts its page container
to reset scroll position. These are source changes; native/web Back behavior and
scroll/focus acceptance remain pending.
