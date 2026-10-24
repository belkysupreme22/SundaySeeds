# 0019 — Teachers draft; admins review and publish

Date: 24 October 2026. Status: accepted owner workflow; authority implementation
and remaining lifecycle rules are not approved by this decision alone.

## Decision

The owner explicitly selected **Teacher drafts; admin reviews and publishes** for
the first connected staff workflow. Teachers prepare course content and submit it
for review. An authorized admin reviews the content and performs publication.
Teacher authoring alone does not grant publication authority.

## Implementation direction

The [staff workflow plan](../staff-workflow-plan.md) maps existing prototype screens
to durable drafts, fixed review snapshots and atomic whole-course publication.
This follows the existing learner architecture: immutable course editions contain
the exact outline, readings and complete knowledge-check set. Existing learners
keep their joined edition, as accepted in decision0014.

First prepare verified staff authority and revisioned durable drafts, then admin
review and publication as separate backend/UI increments. Keep examples isolated.
The current dashboard workspace switch and simulated publication controls are
not authorization or actual publishing.

## Limits

The owner has not named staff identities, a bootstrap/recovery administrator,
teaching/rights reviewers or a permitted production publisher. Course scopes,
delegation, review separation when one person has multiple roles, promotion,
withdrawal/restoration, audit readership/retention and production staff session/MFA
policy remain proposals. Do not convert this choice into a real grant, deployment
or production content approval. Classes, reporting and media remain separate.

## Verification

This records an explicit owner answer. Source inspection and independent prototype
inventory inform the plan; no staff implementation, SQL, grant, test or runtime
acceptance is established. Mobile quiz/reading acceptance also remains pending.
