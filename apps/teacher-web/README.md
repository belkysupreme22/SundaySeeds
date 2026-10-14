# SundaySeeds dashboard

React + TypeScript screen prototypes for teacher and system administration. Built with Vite, selected Radix primitives, Lucide icons and on-demand Recharts examples. Shared styles adapt learner references 05/07/12; the owner has not yet accepted these dashboard layouts.

## Owner setup and review

Use Node 20.19+ on the 20.x line or 22.12+ and npm. Package versions are pinned from registry metadata. Dependency installation, lockfile generation, build/type checks and browser review have **not** been run under the owner's verification preference.

```powershell
cd apps/teacher-web
npm install
npm run dev
```

The first install creates `package-lock.json`; review and commit it. Subsequent installations should use `npm ci`. Owner checks: `npm run typecheck` and `npm run build`.

## Review flows

- Teacher: Overview / Lessons / Classes, create a lesson, edit the draft and preview the learner reading/reflection. Title and reading are required. Drafts persist only while the page stays open; switching dashboard workspaces retains mounted state, refresh clears it.
- Administration: Overview / People / Access, filter the empty directory and sketch/preview/reset a sub-admin scope. This creates no role or permission grant.
- Charts: open the explicitly labelled chart example. Recharts loads only then; example values are also available in a table. These are illustration fixtures, not recorded analytics.
- Try keyboard tab/arrow navigation, dialogs with Escape and focus return, 360px and desktop widths, 150%/200% text, long lesson names and empty/required fields.

No authentication, class records, durable draft saving, publishing, quiz authoring or backend integration is connected. Workspace switching is a design-review control, not an authorization boundary. Backend proposals are in `docs/backend-contract-proposal.md`; remaining tasks in `docs/parallel-delivery-plan.md`.
