# Connected quiz mobile acceptance

23 October 2026. **Pending owner execution.** Source review and formatting are the
only checks performed for the mobile increment. No mobile typecheck, unit tests,
build, browser/native screenshots or real account/quiz requests were run.
Previous SQL/local verification is documented separately and does not establish
mobile acceptance.

## Normal journey

1. Run the mobile typecheck (`npm run typecheck` in apps/mobile). Start/restart Expo
   so its generated route types include `/courses/[id]/quiz/[lessonId]`.
2. Sign in to a verified development account, open Course library → Faith for
   everyday life → Join (if not already enrolled) → one joined reading.
3. Choose Open knowledge check. Select/check each answer; feedback must appear
   only after the server responds, and checked choices cannot change.
4. Finish all three questions. The result must show recorded counts, this attempt
   and the highest score in the joined edition. Review uses server feedback.
5. Choose See course progress. Confirm one finished check, its best score beside
   the existing lesson link, and no duplicate course/lesson listings. Back should
   return to the previous library destination, without another reader/course loop.
   Repeat a journey, and check direct quiz links fall back to the course correctly.
6. Open the same check again: it should recover the same completed attempt. Choose
   Try the quiz again to deliberately create a new attempt. A lower score must not
   reduce the best score or increase distinct course completion. A zero score is
   valid recorded completion. Finishing all four distinct checks completes course.
7. Confirm the sample quiz and Progress tab retain their existing sample data;
   connected results must not appear as sample completion. Settings sample reset
   must not remove connected results or enrollments.

## Recovery and account boundaries

- Slow Start/Check/Finish: one centered original-color loader with blurred page;
  double taps cannot send another intentional attempt. Navigate away during each
  request; no delayed result may navigate or populate another account's screen.
- Drop a response after Start/Check/Finish, then use Check again or reopen/restart
  the app. Recovery must use the original key/attempt, preserve first checked
  selection and show Finish success only after receipt reconciliation.
- If Finish committed before withdrawal but its response was lost, recover only
  the redacted receipt; no protected question review. If access was withdrawn
  first, block unfinished submission until access is restored. Use disposable
  development fixtures/trusted administration for this scenario, not real users.
- Sign out or switch accounts mid-request. Prior questions/results must disappear;
  the next account loads its own attempt/progress. Anonymous/unverified accounts
  cannot start checks through a deep link.
- Delay retry preparation, then switch account or leave/reopen the route. Its late
  storage response must not replace the new screen’s recovery state.
- Fail journal storage before a mutation: request remains blocked with recovery
  guidance. No automatic replacement key. Corrupt journal recovery requires a
  deliberate support/storage decision; there is no destructive reset UI here.
- Error/null/unavailable progress must not appear as fabricated zero completion.
  Re-focus course details after completing a check to refresh acknowledged progress.

## Visual/native regression

Check joined course details, reading, quiz, feedback, error/recovery and result at
320px/390px and larger text; score columns stack on narrow screens. Scroll through
feedback, choose Next question, and confirm the next prompt opens from the top. Keep the existing
Home, sample lesson/quiz, Settings layout and navigation unchanged. Check native
Back/gestures, screen readers, focus and loaders separately; web screenshots do not
establish native acceptance.
