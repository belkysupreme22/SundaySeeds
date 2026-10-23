# Connected reading-state acceptance

23 October 2026. Pending owner execution. The additive backend is applied to
sundayseeds-dev; see [deployment metadata/advisors](../supabase/course-reading-state.md). Source review and scoped formatting are
separate from typecheck, database permission/concurrency tests, runtime behavior,
visual review and native acceptance. Do not treat migration acknowledgement or
metadata inspection as a passing behavior test.

## Normal journey

1. Run `npm run typecheck` in apps/mobile, then start Expo. Sign in with a verified
   development account and open a joined-course reading.
2. The full text, outcomes, verse and knowledge-check entry should remain visible.
   Saved state loads separately; a failed load must not become an empty bookmark.
3. Choose Save my place here on a section. Its saved marker and top summary should
   update only after server acknowledgement. Bookmark this lesson independently.
4. Reopen the same joined lesson on another signed-in device or refreshed session.
   The same saved section ID/title and bookmark should load. No auto-scroll is
   promised; the saved section is identified in the full reading.
5. Change position and bookmark independently across devices. No unrelated state
   should be reset. Clearing a bookmark should survive reopening.
6. Reading/bookmark changes must not increase quiz/course completion or appear as
   sample progress. Sample reset must preserve account reading state.

## Conflicts and recovery

- Keep both devices on an old revision. Save a different section on one, then
  choose a different section on the other: show a conflict and last-confirmed
  state. Reload before another explicit choice; never silently overwrite.
- Lose a save response after acceptance. Retry same change must reconcile current
  desired state without another revision increment. If a newer opposite change
  intervened, retry must conflict. Retain original target/revision while focused.
- Navigate away, restart or reload after an unknown result: GET reconciles saved
  state. There is no automatic queue; an unacknowledged choice may need reselecting.
- Slow requests/double taps: one mutation at a time, centered existing loader and
  blurred background. Sign out/change accounts or leave during a request: no old
  result may populate a new account/route or trigger a follow-up write.
- Deleted/expired Auth session, unverified account, revoked enrollment, withdrawn
  release, invalid section and wrong actor/course/release must fail closed. Use
  disposable development fixtures for these cases, never real learner records.
- Verify direct private-table access and internal-helper execution are denied to
  client roles. Exercise both first-write orders, independent-field concurrent
  writes, stale same-field writes, safe revision bounds and Auth-delete cascade.

## Visual/native regression

Review connected reading at 320px/390px and larger text: no clipped labels, full
section text retained, saved-place controls distinct from lesson bookmark, no
button loader or restyled shared defaults. Check Home, sample reader/quiz and
course progress remain intact. Native Back/gestures, focus, screen readers and
loader behavior need separate native acceptance.
