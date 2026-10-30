# 0021 — Staff RBAC, Publication, Class Communities, and Scoped Reporting

30 October 2026. Status: Implemented across backend migrations, Teacher Web and Admin Web.

## Context

Following Decision 0019 (teacher drafts, admin reviews and publishes) and Decision 0020 (scoped staff course drafts), SundaySeeds required:
1. Server-verified role-based access control (RBAC) separating Teacher and Administration workspaces.
2. A formal review snapshot and atomic publication pipeline for course editions.
3. Invitation-only class communities and teacher-scoped progress reporting that safeguard learner privacy.
4. Administrative tooling to inspect staff members, assign roles, and allocate course authoring rights.

## Architecture

### 1. Staff RBAC and Workspace Gating (S1)
- Private table `staff_authoring_private.staff_roles` with verified actor resolution.
- `get_my_staff_session` returns verified roles (`teacher`, `admin`) and active course assignments.
- `apps/teacher-web` gates the Teacher workspace to authenticated users with `teacher` roles or course assignments, and the Administration workspace strictly to `admin` roles. Unauthenticated sessions are directed to an email/password sign-in screen; unauthorized sessions see clear role boundary disclosures.

### 2. Review Snapshots & Atomic Course Publication (S3 & S4)
- `course_library_private.course_reviews` captures frozen course draft aggregates (`schemaVersion: "1"`), submission timestamps, lifecycle status (`submitted`, `returned`, `published`), and structured admin review notes.
- Draft submission validates module/lesson completeness and enforces that every released lesson includes at least one verified knowledge check.
- Atomic publication RPC (`publish_course_review`) operates under course serialization:
  - Increments `edition_number` under course serialization.
  - Inserts the immutable release into `course_releases`.
  - Unpacks reading sections into `course_lesson_readings`.
  - Registers the assessment set into `course_assessment_sets`.
  - Repoints `course_offerings` to the new release atomically.
  - Preserves existing learner enrollments and historical progress on prior editions.

### 3. Class Community and Invitation-Only Memberships (S5)
- Private schema `class_community_private` provides `classes`, `class_courses`, `class_members`, and `class_invitations`.
- Classes are owned by authenticated teachers. Members join exclusively via unique invitation tokens (`join_class_by_token`) with 14-day expiry.
- Teachers manage rosters (`active`, `removed`) and invitations (`pending`, `accepted`, `revoked`, `expired`).

### 4. Teacher-Scoped Learning Reporting (S5)
- RPC `get_class_learning_summary` enforces caller authorization (the class's teacher or an admin).
- Aggregates reading completions and quiz attempts across active class members for courses assigned to that class.
- Learner privacy boundary: returns only aggregate lesson completion counts and average quiz scores. Never exposes private reflections, full answer keys, or learner activity outside the class.

### 5. Staff Administration & Grants (S5)
- RPCs `list_staff_members`, `set_staff_role`, and `set_course_author_assignment` allow administrators to inspect staff users, grant/revoke roles, and assign course authoring rights without direct database or service-role credential access.
- Implemented `StaffDirectoryPanel` in the Admin Access workspace with real-time feedback and guardrails preventing the removal of the last administrator.

## Consequences & Verification
- Bounded separate Git commits created for migrations, teacher UI, admin UI, and documentation.
- Mobile unit tests (17/17 passing) and TypeScript typechecks remain green.
- Runtime acceptance of native mobile apps and hosted database migration deployment remain pending owner review.
