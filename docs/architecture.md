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

A future teacher web dashboard may share contracts and validation with mobile. Its screens will remain separate. Add `packages/contracts`, `apps/teacher-web` and `supabase/` only when those implementations begin.

## Decisions still required

- First learner age group and whether accounts are learner-owned or parent-managed.
- Pilot church, class and curriculum ownership.
- How teachers join and who grants their permissions.
- Content and Bible translation permissions before distributing real material.

These decisions precede production authentication and enrolment. Sample content can support frontend development in the meantime.
