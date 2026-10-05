# 0001 — Build the new app with React Native and Expo

**Status:** Accepted

## Context

SundaySeeds needs a faithful implementation of the supplied mobile designs, maintainable feature boundaries and a practical path to both Android and iOS. The developer has professional Java Android experience and prior React Native experience. The owner explicitly authorised removing the earlier Kotlin implementation after preserving useful visual assets.

## Decision

Use React Native, Expo and TypeScript for the new app in `apps/mobile`. Begin with bundled sample content and local progress persistence. Add Supabase when connecting authentication, classes, lessons and results. Build teacher publishing as a small web dashboard in a later milestone.

## Consequences

- Android and iOS can share application and presentation code, with native validation required for each platform.
- Expo reduces initial setup work, but native integrations and dependency upgrades still need deliberate maintenance.
- TypeScript contracts, feature-based folders and shared visual tokens support understandable changes.
- Local demo progress is not a substitute for authenticated backend data or tested permissions.
- The previous Kotlin app and Android build scaffolding are removed. Retained assets live under `apps/mobile/assets/legacy`, and the user's screenshots under `docs/references`.

Revisit this choice only if a concrete platform requirement exposes a limitation. Visual card styling alone is not a reason to change frameworks.
