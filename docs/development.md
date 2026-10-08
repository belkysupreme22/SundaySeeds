# Development workflow

## Run the mobile app

The application is in `apps/mobile`. The previous Kotlin project and its Gradle/build files have been removed; use the Expo workflow for this app.

Commands below reflect the initial Expo scaffold and are provisional until the implementation's dependency installation and runtime checks are complete. Use the committed lockfile's package manager once available.

```powershell
cd apps/mobile
npm install
npm run start
```

Use `npm run android` with an Android emulator or device ready. A web preview is useful for quick layout feedback when its dependencies are configured; it does not replace native testing. Local iOS simulator testing requires macOS.

## Work in reviewable increments

Current owner preference: keep each increment small. The owner runs builds, tests and intensive terminal checks; provide the relevant commands instead of running them unless explicitly requested. Report unverified behaviour clearly.

### Continue learning checkpoint

Start a lesson, return Home and tap its Continue learning card: it should reopen the same reading, including reading one. Move to reading two, reload and check that position is restored. Home shows up to two unfinished lessons in collection order; View all opens the In progress filter. Complete a quiz and verify that lesson moves out of In progress into Completed. Saving an unopened lesson should only add it to Saved. Search works within each filter and gives a search-specific empty message.

No new dependencies or storage migration. Runtime checks are left to the owner; use `start.cmd` from the project root.

### Welcome flow checkpoint

On the next fresh app launch, the introduction appears before Home. Try Next, Back and Get started, then reload: Home should open directly. Profile -> View introduction replays the three pages; Skip returns to Home. Existing lesson progress and bookmarks use a separate storage key and are retained.

If verification is wanted, run these from `apps/mobile` after starting Expo once to refresh its generated route types:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

The new flow uses existing dependencies, so there is no installation step.

1. Choose one user-visible outcome and identify the affected files.
2. Reuse existing visual tokens and components before adding alternatives.
3. Keep screen layout, interaction logic and persistence separate.
4. Run the available type, lint and relevant test checks.
5. Exercise the changed flow and inspect rendered output.
6. Review the diff for unintended changes, secrets and generated files.
7. Commit a coherent change and update the changelog when it affects behaviour or delivery.

Document which checks actually ran. A successful type check is not evidence of a successful device launch. Tests should protect meaningful behaviour—scoring, persistence and later permissions—rather than repeat component implementation details.

## Visual acceptance

Start with Home and lesson detail as representative screens. Compare captures with the supplied references at a consistent viewport, refining spacing, typography, borders, shadows and card proportions. Adapt copy for Sunday school without losing the agreed visual style.

Check navigation, loading, empty and error states alongside the happy path. Follow the viewport, text-scaling and action checks in [design-reference.md](design-reference.md). Exact original fonts and photography may be unavailable; record substitutions instead of claiming an exact asset match.

## Parallel work

Assign independent tasks with explicit file ownership. Establish shared component contracts before agents implement dependent screens. One integration owner reviews changes and runs combined checks; agents should not overwrite shared files or commit unrelated work. Use MCP tools where they provide useful inspection or integration, and record their actual results.

## Git history and changelog

Commit small, complete outcomes with plain descriptions such as `Add weekly lesson cards to home` or `Restore saved quiz progress`. Avoid combining dependency changes, unrelated UI work and broad refactors into one commit.

Keep notable additions, changes and fixes under `Unreleased` in `CHANGELOG.md`. Move them into a versioned release when shipping. Record architecture decisions in `docs/decisions/`, including the reason and practical trade-offs. Never commit tokens, `.env` secrets, machine-specific SDK paths or build output.
