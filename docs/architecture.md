# Architecture

## Repository boundaries

```text
apps/mobile/                 Expo mobile application
  assets/legacy/             Visual assets retained from the previous app
  src/
    app/                     Navigation and application composition
    features/                Home, lessons, quizzes and progress
    shared/
      ui/                    Reusable presentation components
      theme/                 Colour, type, spacing and shape tokens
docs/                        Decisions and development guidance
  references/                Twelve supplied design screenshots
```

The original Kotlin application and Android build scaffolding were removed at the owner's request; retained assets are not an active native application. This is the intended organisation for the new app. Create feature subfolders only when there is code to put in them; empty architectural layers do not improve clarity.

## Dependency direction

Routes and app composition connect feature screens. Screens compose components and invoke feature hooks. Hooks coordinate state and call data modules. Data modules read sample content, persistence or feature-owned backend adapters. Pure functions own calculations such as quiz scoring.

- **Screens:** layout, navigation callbacks and user interactions; no direct storage or network calls.
- **Components:** reusable pieces of a feature's interface. Promote a component to `shared/ui` only when its purpose is shared.
- **Hooks:** state and actions needed by a screen or related flow.
- **Data:** reading, writing and mapping records; storage implementation stays behind this boundary.
- **Types and pure functions:** explicit contracts and logic that can be checked independently of rendering.
- **Shared theme:** the source of truth for visual tokens. Avoid slightly different copies of the same colour or spacing throughout screens.

The app layer may assemble features. Shared code must not import feature screens. Avoid cross-feature imports into another feature's internal implementation; expose a small public interface when needed. Do not add a generic repository framework or a global state library until an actual requirement justifies it.

## Initial persistence

The first milestone uses bundled sample lessons and AsyncStorage for progress on this device. Sample learning remains device-only and separate from the newly prepared identity/profile source. Signing in does not upload it or create class permissions, learning backup or cross-device sync. Settings explains that boundary once.

Version the stored shape, validate loaded data, and recover sensibly from missing or unreadable values. Persist stable lesson identifiers rather than screen positions. Show write failures honestly instead of reporting a result as saved before the write succeeds.

## Planned backend

Supabase will hold profiles, churches, classes, memberships, published lessons, quiz attempts and progress. Introduce migrations and permission tests alongside these features. Class and church ownership must be enforced in the database, not merely hidden in the UI. Never place privileged service credentials in the mobile app.

Teacher/admin screen prototypes now share a React + TypeScript review workspace in `apps/teacher-web`, built with Vite. Teacher and admin feature folders own their UI state; the shell switches proposals without representing authentication or permission grants. Selected Radix primitives provide tabs/dialogs, Lucide provides icons and Recharts is lazy-loaded only when chart examples are opened. Poppins is bundled through Fontsource. Styling remains in ordinary CSS using the learner reference palette. These are reusable screen proposals, not connected services; deployment and production route/auth separation remain decisions.

Backend entity, capability and access proposals are in [backend-contract-proposal.md](backend-contract-proposal.md). The first Supabase profile migration/RPC and permission-test sources now live in `supabase/`; no shared contract package is needed. The owner approved parallel prototypes and planning before the pilot; see [decision 0003](decisions/0003-parallel-prototypes-and-administration.md). Do not restore standalone HTML mockups as the dashboard implementation.

The [identity/profile slice](auth-onboarding-flow.md) now has source implementation: shared lazy Supabase initialization, native SecureStore/browser tab persistence, feature-owned auth/profile adapters and provider, optional account forms, isolated explicit-action email-proof handlers and Settings local sign-out. Public environment settings and exact callbacks remain configurable; no intended project or email/hosting service is connected. Own-profile responses/writes bind to the initiating actor/session and use expected revisions. Guest profile/progress remain independent. See [decisions 0010](decisions/0010-private-learner-profile-foundation.md) and [0011](decisions/0011-configurable-learner-identity.md), and the [setup walkthrough](supabase-setup.md). Database and runtime verification remain pending.

## Identity direction and remaining decisions

- Adult learners self-register with email/password without a prior invitation, as confirmed on 16 October. Registration does not establish class membership or staff authority. The account screens now invoke configurable identity hooks; unconfigured services show unavailable outcomes; see the current [auth flow](auth-onboarding-flow.md).
- The owner confirmed verified email before connected course start, direct course joining for verified learners and invitation-only classes on 19 October (B1-05c/d). Course enrollment is separate from class membership. Callback hosting/sender setup, invitation lifecycle and staff identity remain open under B1-05b in the [backend decision register](backend-contract-proposal.md). Google/Apple UI options do not establish configured providers or account-linking rules.
- System-wide super admin and sub-admin roles are confirmed in principle. Define delegation, scope, revocation, auditing and initial provisioning before implementing permissions.
- Pilot church, class and curriculum ownership.
- How teachers join and who grants their permissions.
- Content and Bible translation permissions before distributing real material.

The bounded auth/profile source uses explicit-action email links and local sign-out; intended environment, callback hosting and sender configuration precede connected acceptance. Content/release and staff decisions precede their corresponding enrollment/publication/privileged workflows; they do not prevent isolated identity planning. Sample content can support frontend development in the meantime.
