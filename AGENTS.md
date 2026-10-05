# SundaySeeds working agreement

## Product and visual quality
- Build the agreed React Native + Expo + TypeScript app in apps/mobile.
- Use docs/references screenshots as the visual source of truth: pale lavender, mint, yellow and peach; dark fine outlines; modest radii; crisp offset shadows; geometric type.
- Start with a polished Home -> lesson -> quiz -> saved progress journey. Do not invent production accounts, class memberships or backend connectivity.
- Clearly label sample content and device-local persistence. No fabricated analytics or completion history.
- Preserve design fidelity through screenshots and human review. Test small widths and larger text. Never claim native verification from a web preview.

## Code and collaboration
- Follow apps/mobile/AGENTS.md for Expo version-specific guidance.
- Route files compose feature screens. Screens must not access storage or backend clients directly.
- Feature folders own their data, hooks, components, screens and types as needed. Shared UI has no feature business logic.
- Strict TypeScript; no unexplained any or giant screen files. Prefer simple explicit abstractions over speculative frameworks.
- The user authorizes parallel agents. Delegate bounded independent tasks with explicit file ownership; one lead integrates and commits.
- Do not create user-visible Codex tasks for internal delegation.
- Use available MCP integrations when useful, without claiming unconfigured services are connected.

## Verification and history
- Before completing a code change run typecheck, lint and relevant tests. Verify representative screens interactively when possible.
- Commit coherent, working increments with plain, descriptive messages. Do not commit secrets, generated builds or unrelated files.
- Maintain CHANGELOG.md with notable additions, changes and fixes under Unreleased; document architectural decisions in docs/decisions.
- Report implemented scope, actual verification and remaining limitations honestly.
