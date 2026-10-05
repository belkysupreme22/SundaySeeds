# Implementation plan

This document describes intended scope. A milestone is complete only when its acceptance checks have been performed and recorded; its presence here does not mean it has shipped.

## 1. Frontend foundation and visual prototype

Build the Expo app, visual tokens and shared controls. The previous Kotlin project is removed with the owner's authorisation; its retained assets and the supplied screenshots support the new implementation. Implement Home, lesson browsing, lesson detail, a short quiz and progress using sample Sunday school content. Save progress locally. Clearly identify the experience as a demo.

**Acceptance:** the app launches; a learner can open a lesson, answer a quiz and restore saved results after restarting. Screens pass the checks in [design-reference.md](design-reference.md), including 360/390-width captures and increased text size. Storage errors and unanswered questions are handled deliberately.

## 2. Pilot scope and connected learning flow

Confirm the first church, class and age group. Decide learner/parent account ownership, then introduce Supabase migrations, authentication, class invitations, published lessons and saved attempts. Replace local data access behind feature boundaries.

**Acceptance:** a learner can join the intended class and complete a lesson. Database checks prevent access to another learner's results, another class's restricted data and teacher-only actions. Interrupted requests have clear recovery behaviour.

## 3. Teacher publishing

Create a small responsive web dashboard for assigned teachers to draft, preview and publish text/image lessons and quizzes, then view class completion.

**Acceptance:** a teacher prepares a weekly lesson without editing code or database records. Draft content remains private and teachers cannot manage unassigned classes.

## 4. Reliability and pilot

Refine reading-position recovery, cached text lessons, network feedback and duplicate-submission protection. Test with real class content across several Sundays. Observe learner completion and the teacher's preparation process.

**Acceptance:** learners understand their saved state; restarts and interrupted connections do not silently discard work. Pilot feedback identifies the next changes before expanding the feature set.

## 5. Android release

Complete native device checks, accessibility review, relevant automated checks, account lifecycle requirements, app assets and release configuration. Set up appropriate crash reporting and prepare accurate store and privacy information.

**Acceptance:** the release candidate passes the recorded checks and the user approves the concrete release build and publishing details. iOS release work follows its own platform validation.

## Deferred scope

Private chat, forums, payments, leaderboards, certificates, live streaming, complex analytics, extensive personalisation and full offline quiz synchronisation are outside the MVP. Add them only when pilot evidence and a clear use case justify the work.
