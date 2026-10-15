# 0005 — Shared administrator directory simulation

Date: 15 October 2026

Status: accepted prototype composition; production identity, tenancy and authorization remain undecided.

The administrator People, Organizations/classes and Invitations screens need a consistent flow. Independent fixtures in each screen would hide whether invitation acceptance and membership changes agree across the workspace.

One feature-owned `useAdminDirectory` model supplies all three screens. It starts empty; loading examples explicitly adds fictional records. Forms and state transitions validate their input and return a result to the UI. Invitation acceptance creates or reuses one person and class membership in a single in-memory change. Stable IDs connect people, organizations, classes, memberships and invitations. Reopening examples preserves existing edits and lifecycle states.

The administrator directory remains independent of teacher class simulations, reporting fixtures and learner storage. Names and email strings are not a safe integration contract. A future service adapter must supply authorized identities and acknowledged state before those workspaces share live records. There are no email deliveries, sign-in accounts, real memberships or permission grants here.

Adult learner and teacher classifications describe sample participation. Administrator capabilities and delegated grants are outside this task. Existing classifications cannot be changed, class transfers are deferred, and email changes with relationship history are blocked. Organization/class archives preserve records and pause child mutations; restoring an organization does not silently unarchive its classes. These prototype rules do not finalize production revocation or retention policy.

`AdminDashboard` owns the model and keeps the three screens mounted across tabs; App already retains administration across workspace switches. Refresh clears this state. Full-page forms/details use the approved palette, fine per-element outlines and shared text fields. Scoped CSS does not alter global stroke defaults. Backend contracts, identity matching, staff-as-learner behavior and production access rules require separate agreement.

Owner runtime, visual, accessibility, typecheck, test and build checks remain pending. Source formatting and whitespace checks alone do not establish those results.
