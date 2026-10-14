# 0003 — Parallel prototypes and backend planning

Date: 14 October 2026

Status: accepted delivery approach; detailed permissions and connected architecture remain proposed.

## Context

The owner wants teacher, administration and backend work to advance alongside remaining learner designs. The audience is adult learners. Administration means a system-wide super admin and sub-admin roles whose structure will evolve.

## Decision

- Build reviewable teacher and administrator screen prototypes before a connected pilot, alongside backend planning. Continue learner S2, O1 and O2 independently.
- Use exclusive file ownership for parallel agents; one lead integrates commits and maintains the roadmap and ignored handoff.
- The owner selected React + TypeScript directly so prototype screens can be reused. `apps/teacher-web` contains a shared teacher/admin design workspace, using Vite, selected Radix tabs/dialog primitives, Lucide icons, Poppins and on-demand Recharts. Ordinary CSS carries the references' fine outlines and pastel palette. The prototype workspace switcher is not a production permission or routing model. Standalone HTML mockups are superseded.
- Examples and draft-only interactions must be clear, without fabricated operational analytics or claims of backend persistence. Illustrative chart fixtures are labelled and available as tables. Lazy loading and selective imports limit eager dependencies; actual bundle size/performance is unmeasured pending owner builds.
- Backend planning may propose entities, contracts and permission questions now. Production migrations/auth/access rules follow agreement on roles and content. Supabase remains planned, not configured.
- Separate system-wide super-admin authority from delegated sub-admin permissions. Do not give sub-admins universal access by default. Agree scopes, delegation, revocation, initial provisioning and audit requirements before implementing privileged operations.
- Adult learners are confirmed; child/parent-managed identity is outside initial scope. Adult sign-in, teacher provisioning and the first pilot group still need concrete choices.

## Consequences

UI proposals and data contracts can inform each other alongside learner work. A visual role selector does not provide authorization; access control belongs on the server. Owner design review precedes carrying proposals into production UI. Connected work requires recorded permission/integration checks.

The owner continues to handle installation, tests, builds and runtime/visual review unless explicitly delegated. Dependencies are pinned from npm metadata, but installation/lockfile generation and integration checks remain pending. No deployment, production role grant or backend connection is implied. See [parallel delivery plan](../parallel-delivery-plan.md) for tasks and gates.

Library references: [Radix introduction](https://www.radix-ui.com/primitives/docs/overview/introduction), [Radix styling](https://www.radix-ui.com/primitives/docs/guides/styling), [Recharts installation and composition](https://github.com/recharts/recharts), [Lucide React](https://lucide.dev/guide/react), [Vite setup](https://vite.dev/guide/).
