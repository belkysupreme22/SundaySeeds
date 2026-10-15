# 0006 — Access proposals and saved assignment reviews

Date: 15 October 2026

Status: accepted prototype composition; capabilities, grant authority and production safeguards remain proposals.

Access & roles uses a full-page feature workspace. Its role proposals refer to an explicit active organization or class in the administrator directory. Four candidate responsibilities cover people, enrollment, content preparation and summary reports. System-wide scopes, permission delegation and real account operations are excluded from the proposal editor.

`useAccessProposals` owns session-only roles and assignment simulations. Saving a role increments its revision. Recording an assignment requires an active directory person, an available scope and the reviewed role revision; a duplicate unrevoked simulation for the same person/role is rejected. A copied snapshot preserves role name, scope, capabilities and revision. Later role edits never rewrite earlier assignment reviews. Revocation keeps the snapshot, including when the directory person or scope is now unavailable. A new assignment requires a fresh review.

Directory classifications and memberships are not changed. These records are neither effective grants nor evidence that the user can delegate authority. No permission engine, privileged API, account creation, audit events, expiry dates or backend service is implemented. Refresh clears the proposals. Administration and Access sub-tabs stay mounted to retain draft forms and review state during navigation.

A separate walkthrough demonstrates candidate last-super-admin and self-removal protection with isolated examples. It also illustrates an unconfigured bootstrap state and explains recovery decisions. It does not read or mutate directory records or assignment simulations. Actual bootstrap, backup, recovery, delegation and concurrent grant/revoke enforcement require trusted operations after LMS-B1 agreement.

The previous dialog is no longer imported by AdminDashboard; its source remains as a superseded prototype. Runtime, visual, typecheck, build and test checks remain pending owner. Scoped source formatting/whitespace checks do not establish production authorization or runtime readiness.
