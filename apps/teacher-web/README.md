# SundaySeeds dashboard

React + TypeScript screen prototypes for teacher and system administration. Built with Vite, selected Radix primitives, Lucide icons and on-demand Recharts examples. Shared styles adapt learner references 05/07/12; the owner approved the dashboard design direction. Added workflows still need owner review.

## Owner setup and review

Use Node 20.19+ on the 20.x line or 22.12+ and npm. Package versions are pinned from registry metadata. Dependency installation, lockfile generation, build/type checks and browser review have **not** been run under the owner's verification preference.

```powershell
cd apps/teacher-web
npm install
npm run dev
```

The first install creates `package-lock.json`; review and commit it. Subsequent installations should use `npm ci`. Owner checks: `npm run typecheck` and `npm run build`.

## Review flows

- Teacher: Overview / Courses / Lessons / Classes, create a lesson, edit the draft and preview the learner reading/reflection. Title and reading are required. Drafts persist only while the page stays open; switching dashboard workspaces retains mounted state, refresh clears it.
- Courses: create/edit a course title and summary; add, rename and reorder modules; attach existing lesson drafts, reorder/preview/unlink them. A lesson appears once per course and can be reused in another course. Removing a course or module asks for confirmation and keeps the lesson drafts. Try blank/whitespace titles, long names, cancel/Escape, and switching tabs/workspaces. Course outlines also reset on refresh; nothing is published or saved to a service.
- Start with **Courses → Try an example course**: Faith in Everyday Life contains Loving Others (The Good Samaritan, Practising forgiveness) and Growing in Faith (A daily rhythm of prayer). Samples are labelled and editable; reopening the example preserves your edits instead of adding duplicates. The three-step guide explains Course → Modules → Lessons. Inside any module, **Create lesson → Save and add to module** places a new draft automatically; **Choose an existing lesson** reuses a library draft.
- Structured lessons: edit a lesson directly in its module or from Lessons. Add up to six outcomes, add/reorder/remove reading sections (one to twelve), and write a reflection. Preview lesson shows unsaved content with outcome tiles and Previous/Next reading controls; Back to editing preserves it. Closing a changed editor asks before discarding. Existing example readings now have two sections and learning outcomes.
- Optional cover image: select PNG/JPEG/WebP up to 5 MB, add required descriptive alt text, replace or clear it. Files are only held for this page session, never uploaded. Try invalid/oversize files, cancellation, replacing/clearing during reading, and saving/reopening the draft. Durable media limits and ownership remain backend decisions.
- Knowledge checks: edit a lesson and scroll to the optional quiz builder. Add up to ten questions with two to four distinct answers, choose one correct answer and write an explanation. Reorder questions/options; removing the correct option requires choosing another. Incomplete questions block Save and interactive preview. Removing every question leaves a reading-only lesson.
- Use **Preview knowledge check** inside the editor to try questions immediately; changes to question content reset that preview attempt. The full learner preview also presents the check after the final reading/reflection.
- Quiz preview: **Courses → Try an example course → preview The Good Samaritan → Next reading section → knowledge check**. Select an answer, Check answer, read the correct answer/explanation, then continue. Try a wrong answer, Previous/Next, final results, Review answers and Try again. Results describe only that preview attempt and are never persisted. Each example lesson has a sample check; The Good Samaritan has two questions. Also inspect blank/duplicate options, missing correct answer/explanation, question removal, changed question order, keyboard focus and narrow/larger-text layouts.
- Administration: Overview / People / Access, filter the empty directory and sketch/preview/reset a sub-admin scope. This creates no role or permission grant.
- Charts: open the explicitly labelled chart example. Recharts loads only then; example values are also available in a table. These are illustration fixtures, not recorded analytics.
- Try keyboard tab/arrow navigation, dialogs with Escape and focus return, 360px and desktop widths, 150%/200% text, long lesson names and empty/required fields.

No authentication, class records, durable draft saving, publishing or backend integration is connected. Lesson/quiz authoring and preview use temporary page state. Workspace switching is a design-review control, not an authorization boundary. Backend proposals are in `docs/backend-contract-proposal.md`; remaining tasks in `docs/parallel-delivery-plan.md`.
