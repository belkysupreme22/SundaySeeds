# SundaySeeds

A Sunday school learning app built around a weekly lesson, memory verse, short quiz and personal progress.

The mobile app lives in [`apps/mobile`](apps/mobile). The previous Kotlin project has been removed at the owner's request. Its retained visual assets live in `apps/mobile/assets/legacy`; the supplied design screenshots live in `docs/references`.

## First milestone

We are building a frontend demo with sample lessons and progress stored on the device. Its scope is Home, lesson browsing and reading, quizzes, and progress. It does not represent a connected church service: authentication, class enrolment, teacher publishing and cloud sync are future work.

The visual direction follows the supplied references: a pale background, lavender, mint and yellow accents, dark outlines, rounded cards and subtle offset shadows. Sunday school content replaces the reference's commercial course content.

## Stack

- React Native, Expo and TypeScript for the mobile app.
- AsyncStorage for local demo progress.
- Planned: Supabase for authentication, PostgreSQL and storage.
- Planned: a small React teacher dashboard for lesson publishing.

Android is the first release target. Shared implementation should remain compatible with iOS; iOS compatibility is not a claim that an iOS build has been tested.

## Development

On Windows, double-click `start.cmd` in the SundaySeeds folder to start Expo. From a terminal in that folder, run `./start.cmd`. The launcher opens the mobile app directory for you. Node.js and the app dependencies must already be installed.

See [development](docs/development.md) for setup and validation, [architecture](docs/architecture.md) for code boundaries, the [design reference](docs/design-reference.md) for visual acceptance, and the [implementation plan](docs/implementation-plan.md) for milestones and open decisions.

Use the repository's `AGENTS.md` instructions when present, and keep changes small enough to review and explain. Notable changes belong in [`CHANGELOG.md`](CHANGELOG.md).
