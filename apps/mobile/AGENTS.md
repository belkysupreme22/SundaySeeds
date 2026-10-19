This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Follow the current owner verification agreement in the root `AGENTS.md`: the owner handles tests, builds, terminal-heavy checks and runtime/visual review unless explicitly delegated. Report implementation separately from verification; leave unperformed checks pending.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

EAS can build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and deliver over-the-air updates (`eas update`). These are future workflows that require deliberate project, credentials, build-profile and update configuration. This checkout currently has no `eas.json`, development build profile or EAS Update setup; do not imply these services are configured. Follow the owner verification agreement before setting up or running them. When explicitly requested, run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. A development build is needed when a library requires native code or native configuration unavailable in Expo Go; adding a library already supported by Expo Go does not by itself require one. When explicitly requested, use `npx expo run:ios` or `npx expo run:android` for a local native build, or `eas build --profile development` after deliberately configuring that EAS profile. Local native builds require the corresponding platform tooling.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Use the versioned SDK reference matching the installed `expo` package, as described above; the current SDK 57 reference is https://docs.expo.dev/versions/v57.0.0/ .
