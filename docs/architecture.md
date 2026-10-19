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

Routes and app composition connect feature screens. Screens compose components and invoke feature hooks. Hooks coordinate state and call data modules. Data modules read sample content or persistence. Pure functions own calculations such as quiz scoring.

- **Screens:** layout, navigation callbacks and user interactions; no direct storage or network calls.
- **Components:** reusable pieces of a feature's interface. Promote a component to `shared/ui` only when its purpose is shared.
- **Hooks:** state and actions needed by a screen or related flow.
- **Data:** reading, writing and mapping records; storage implementation stays behind this boundary.
- **Types and pure functions:** explicit contracts and logic that can be checked independently of rendering.
- **Shared theme:** the source of truth for visual tokens. Avoid slightly different copies of the same colour or spacing throughout screens.

The app layer may assemble features. Shared code must not import feature screens. Avoid cross-feature imports into another feature's internal implementation; expose a small public interface when needed. Do not add a generic repository framework or a global state library until an actual requirement justifies it.

## Initial persistence

The first milestone uses bundled sample lessons and AsyncStorage for progress on this device. It is a demo, with no authenticated identity, class permissions, cloud backup or cross-device sync. The UI and documentation must say so clearly.

Version the stored shape, validate loaded data, and recover sensibly from missing or unreadable values. Persist stable lesson identifiers rather than screen positions. Show write failures honestly instead of reporting a result as saved before the write succeeds.

## Planned backend

Supabase will hold profiles, churches, classes, memberships, published lessons, quiz attempts and progress. Introduce migrations and permission tests alongside these features. Class and church ownership must be enforced in the database, not merely hidden in the UI. Never place privileged service credentials in the mobile app.

Teacher/admin screen prototypes now share a React + TypeScript review workspace in `apps/teacher-web`, built with Vite. Teacher and admin feature folders own their UI state; the shell switches proposals without representing authentication or permission grants. Selected Radix primitives provide tabs/dialogs, Lucide provides icons and Recharts is lazy-loaded only when chart examples are opened. Poppins is bundled through Fontsource. Styling remains in ordinary CSS using the learner reference palette. These are reusable screen proposals, not connected services; deployment and production route/auth separation remain decisions.

Backend entity, capability and access proposals are in [backend-contract-proposal.md](backend-contract-proposal.md). Add shared contract and Supabase implementation directories only when that work begins. The owner approved parallel prototypes and planning before the pilot; see [decision 0003](decisions/0003-parallel-prototypes-and-administration.md). Do not restore standalone HTML mockups as the dashboard implementation.

The focused [learner identity/course-access contract draft](backend-contract-proposal.md#learner-identity-and-course-access-contract) now defines provider-managed identity, own presentation profile, independent course enrollment and invitation-only class membership as separate boundaries. Proposed HTTPS email-proof handling, credential persistence, callback hosting and session policies are review items, not configured architecture. Screens continue to invoke feature hooks/data adapters; one infrastructure client owns provider initialization only when the identity slice starts. No empty contract package or backend scaffold is required for the draft.

## Identity direction and remaining decisions

- Adult learners self-register with email/password without a prior invitation, as confirmed on 16 October. Registration does not establish class membership or staff authority. The five account screens are unavailable-service UI previews; see the current [auth flow](auth-onboarding-flow.md).
- The owner confirmed verified email before connected course start, direct course joining for verified learners and invitation-only classes on 19 October (B1-05c/d). Course enrollment is separate from class membership. Delivery/recovery/callback behavior, invitation lifecycle and staff identity remain open under B1-05b in the [backend decision register](backend-contract-proposal.md). Google/Apple UI options do not establish configured providers or account-linking rules.
- System-wide super admin and sub-admin roles are confirmed in principle. Define delegation, scope, revocation, auditing and initial provisioning before implementing permissions.
- Pilot church, class and curriculum ownership.
- How teachers join and who grants their permissions.
- Content and Bible translation permissions before distributing real material.

The applicable identity/callback/session and environment choices precede the bounded auth/profile implementation. Content/release and staff decisions precede their corresponding enrollment/publication/privileged workflows; they do not prevent isolated identity planning. Sample content can support frontend development in the meantime.
