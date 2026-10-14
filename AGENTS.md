# SundaySeeds working agreement

## Product and visual quality
- Build the agreed React Native + Expo + TypeScript app in apps/mobile.
- Teacher/admin screen prototypes use React + TypeScript in apps/teacher-web, with Radix primitives, Lucide icons and lazy-loaded Recharts examples. Follow that workspace's AGENTS.md; keep backend planning separate from connected implementation.
- Use docs/references screenshots as the visual source of truth: pale lavender, mint, yellow and peach; dark fine outlines; modest radii; crisp offset shadows; geometric type.
- Choose strokes per screen and element from its reference. Do not replace every dark border or shadow globally: Settings/Profile/navigation use lighter strokes, while several Home/discovery/lesson/Welcome elements retain strong outlines and offset shadows. Record intentional adaptations and keep shared defaults stable.
- Start with a polished Home -> lesson -> quiz -> saved progress journey. Do not invent production accounts, class memberships or backend connectivity.
- Keep sample content identifiable and explain device-only storage once in Settings. Do not repeat local/device/preview disclaimers across learner screens. No fabricated analytics or completion history.
- Preserve design fidelity through screenshots and human review. Test small widths and larger text. Never claim native verification from a web preview.

## Code and collaboration
- Read `docs/AGENT_HANDOFF.local.md` when present before continuing work. It contains the current flow, next tasks, deferrals and backend considerations. It is intentionally ignored by Git; when absent, use the tracked implementation plan, architecture and development docs rather than assuming the handoff was shared.
- Update that local handoff whenever priorities, scope, task order, implementation status, deferrals or backend decisions change. Record the reason, next action and actual verification status in the same increment. Keep `docs/implementation-plan.md` aligned for shared roadmap changes; do not force-add the local handoff.
- Follow apps/mobile/AGENTS.md for Expo version-specific guidance.
- Route files compose feature screens. Screens must not access storage or backend clients directly.
- Feature folders own their data, hooks, components, screens and types as needed. Shared UI has no feature business logic.
- Use `shared/ui/InputField` for editable text fields so idle/focus strokes stay consistent; preserve its visible focus treatment rather than adding platform-default inner outlines or underlines.
- Strict TypeScript; no unexplained any or giant screen files. Prefer simple explicit abstractions over speculative frameworks.
- The user authorizes parallel agents. Delegate bounded independent tasks with explicit file ownership; one lead integrates and commits.
- Do not create user-visible Codex tasks for internal delegation.
- Use available MCP integrations when useful, without claiming unconfigured services are connected.

## Verification and history
- Current owner preference: focus on design implementation against the reference screenshots. The owner handles tests, builds, terminal-heavy checks and runtime/visual review; run these only when explicitly requested. Supply affected screens and actions to check, and mark unperformed checks as pending. The two known lint issues remain deferred until requested or scheduled for release readiness.
- Commit each bounded task separately with a plain, descriptive message. Keep shared foundations, teacher screens, admin screens and backend planning in distinct commits; do not bundle independent tasks. Do not commit secrets, generated builds or unrelated files.
- Maintain CHANGELOG.md with notable additions, changes and fixes under Unreleased; document architectural decisions in docs/decisions.
- Report implemented scope, actual verification and remaining limitations honestly.
