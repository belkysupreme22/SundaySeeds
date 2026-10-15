# Dashboard working agreement

- Follow root AGENTS and the ignored agent handoff. The app is the approved React + TypeScript prototype direction, not a connected service.
- Teacher and administration share a design workspace for review. Keep feature state under `src/features/teacher` or `src/features/admin`; shared UI must not decide roles or permissions.
- Use references 05/07/12 for visual language. The owner approved the dashboard design direction; each added workflow still needs review. Check strokes against the relevant screen reference rather than replacing dark outlines globally. Preserve pastel accents, modest corners, reference-specific shadows and Poppins type.
- Use installed Radix primitives for accessible tabs/dialogs and Lucide named icon imports. Chart modules must stay behind the shared lazy import; do not import Recharts into the shell or feature screens.
- Use `src/shared/ui/InputField` for editable text controls, including its `TextAreaField` export for multiline content. Preserve the shared focus stroke without a second browser outline.
- Commit each bounded task separately: shared foundation, teacher screens, admin screens and backend planning must not be bundled into one commit.
- Keep examples identifiable. Empty/unavailable data is not zero activity. No production grants, publishing or fake analytics. Avoid repetitive local/device/preview copy; retain one clear workspace prototype notice.
- The owner handles dependency installation, lockfile generation, builds, tests, typecheck and runtime/visual review unless explicitly requested. Do not claim verified performance, accessibility or bundle sizes without evidence.
- Consult current official docs before introducing unfamiliar library APIs. Coordinate dependency/config/shared contract edits through the lead. No secrets or backend clients in screens.
