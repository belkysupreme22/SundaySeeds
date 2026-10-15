# SundaySeeds dashboard

React + TypeScript screen prototypes for teacher and system administration. Built with Vite, selected Radix primitives, Lucide icons and on-demand Recharts examples. Shared styles adapt learner references 05/07/12; the owner approved the dashboard design direction. Added workflows still need owner review.

## Owner setup and review

Use Node 20.19+ on the 20.x line or 22.12+ and npm. Package versions are pinned from registry metadata. The existing dependency lockfile was committed on 15 October after checking its root versions against the manifest. Installation success, build/type checks and browser review are **not** established by that source check.

```powershell
cd apps/teacher-web
npm ci
npm run dev
```

Use the committed `package-lock.json` with `npm ci`. Owner checks: `npm run typecheck` and `npm run build`.

## Review flows

- Teacher → Open editorial studio, or Explore example course. The full-page outline follows Course → Modules → Lessons; the Dashboard button exits the studio.
- Course brief: create/edit title, introduction, adult audience and up to six outcomes. Add/rename/reorder modules; create lessons in a module or reuse existing library lessons. Reorder/unlink lessons; confirmed course/module removal keeps lesson drafts.
- Select a lesson to use Details / Reading / Reflection / Quiz. Focus writing hides the outline. Switching sections retains the buffer; Preview lesson shows unsaved content and Back to editing preserves it. Save keeps the editor open. Switching lessons/courses/tools or returning to Dashboard asks before discarding dirty edits. Check Keep editing and Discard and continue, including new unsaved lessons and course briefs.
- Saved learner preview uses saved content. Duplicate lesson creates an independent saved-content copy without publication history; save current edits first. Course review shows actual module/lesson/question/word counts and missing content. It does not publish the course.
- Optional cover image: select PNG/JPEG/WebP up to 5 MB, add required descriptive alt text, replace or clear it. Files are only held for this page session, never uploaded. Try invalid/oversize files, cancellation, replacing/clearing during reading, and saving/reopening the draft. Durable media limits and ownership remain backend decisions.
- Knowledge checks: edit a lesson and select Quiz. Add up to ten questions with two to four distinct answers, choose one correct answer and write an explanation. Reorder questions/options; removing the correct option requires choosing another. Incomplete questions block Save and interactive preview. Removing every question leaves a reading-only lesson.
- Use **Preview knowledge check** inside the editor to try questions immediately; changes to question content reset that preview attempt. The full learner preview also presents the check after the final reading/reflection.
- Publication: **Lesson library → Publication** on a saved lesson opens its readiness checklist, content preview and version history. Simulate publishing v1 and confirm; create/edit the next draft, save it and simulate v2. Earlier snapshots keep their original reading, quiz and image. Preview the draft or each version to compare them. No learner receives content and all versions reset on refresh.
- Try cancelling/confirming Withdraw active version and Archive lesson. Withdrawal keeps the draft/history and stops simulated availability. Archive also blocks editing/publishing until Restore to draft; restore never republishes automatically. Course links are preserved. Lesson-wide simulation does not publish an entire course or define real access, progress/version migration or withdrawal rules.
- Quiz preview: **Explore example course → The Good Samaritan → Saved learner preview → Next reading section → knowledge check**. Select an answer, Check answer, read the correct answer/explanation, then continue. Try a wrong answer, Previous/Next, final results, Review answers and Try again. Results describe only that preview attempt and are never persisted. Each example lesson has a sample check; The Good Samaritan has two questions. Also inspect blank/duplicate options, missing correct answer/explanation, question removal, changed question order, keyboard focus and narrow/larger-text layouts.
- Classes: open the initially empty directory, Create simulated class or Explore example class. Edit the purpose/learning rhythm, search and filter open/archived classes, then use Learning content / Roster / Invitations. Course links refer to existing editorial outlines; open one in the studio and return to confirm class state is retained. Removing a link keeps the course; removed outlines display unavailable links.
- Class membership simulation: create an invitation with example details, check duplicate validation, simulate acceptance and see the active roster. Try expiry/revoke/reissue, roster remove/restore and all confirmations. Archive pauses course/membership changes; restore preserves contents. No email or access grant occurs. Refresh clears the simulation.
- Classes → Screen state examples exposes loading/error presentation for owner review without pretending a request is running. Check keyboard controls, empty filters, long names, 360px width and larger text. State is retained across teacher tabs, studio entry and administration workspace switching.
- Administration: Overview / People / Access, filter the empty directory and sketch/preview/reset a sub-admin scope. This creates no role or permission grant.
- Charts (Administration): open the explicitly labelled chart example. Recharts loads only then; example values are also available in a table. These are illustration fixtures, not recorded analytics.
- Try keyboard tab/arrow navigation, dialogs with Escape and focus return, 360px and desktop widths, 150%/200% text, long lesson names and empty/required fields.

No authentication, durable class records/draft saving, production publishing, invitation delivery or backend integration is connected. Lesson/quiz authoring and preview use temporary page state. Workspace switching is a design-review control, not an authorization boundary. Backend proposals are in `docs/backend-contract-proposal.md`; remaining tasks in `docs/parallel-delivery-plan.md`.
