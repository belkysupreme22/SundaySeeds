# Configurable learner identity

19 October 2026. First identity/profile source slice authorized; connected
environment and owner acceptance pending. See [setup](../supabase-setup.md).

Supabase Auth manages email/password identity. Feature hooks own requests and
sanitized state; shared infrastructure owns initialization and credential storage.
Screens have no direct SDK/storage access. Missing public configuration produces
unavailable outcomes rather than fake accounts or delivery. Registration remains
optional alongside guest learning. Google/Apple are not configured.

Use explicit-action web confirmation/recovery links with purpose-bound token
hashes. A landing-page GET never exchanges proof. Proof/candidate sessions remain
ephemeral and isolated; they cannot replace an existing primary identity.
Confirmation returns to normal sign-in. Recovery presents the target email,
changes that identity's password, attempts global refresh-session revocation and
requires fresh sign-in. Primary same-account cleanup is actor-bound; another
active account remains intact. JWT expiry limits revocation guarantees.

Account names are optional and independent from guest names, at most 40
characters. Passwords use a minimum of 15 characters without trimming; provider
settings must align. Ordinary sign-out uses local scope. Confirm Email must be
enabled in every connected environment; unexpected auto-confirm sessions from
signup are isolated and rejected as a configuration error.

Native persistence uses small SecureStore chunks and a manifest changed only
after complete writes. Post-commit garbage collection is best-effort; failed
cleanup can leave unreachable encrypted chunks, while durable tombstones prevent
session resurrection after sign-out. Browser sessions use sessionStorage with
page-isolated SDK channels; reload restores this tab, another tab cannot replace
its account via Auth broadcasts. Storage failures do not silently fall back.

Validated session generations bind own-profile requests and reject stale results.
Unavailable validation hides owned data/pauses writes; invalid sessions clear
presentation and attempt cleanup. Profile provisioning is idempotent and separate
from authentication; revision conflicts require reload before another save.
Guest sample learning/name storage is never uploaded or merged automatically.

The owner requested preparation for a new development project and configurable
domain/email sender, then a setup walkthrough. No unrelated project is modified.
HTTPS hosting/templates, SMTP, production policies and runtime/permission checks
remain pending; localhost callbacks support computer-only development. Course
catalog/enrollment, invitations, staff and publication remain distinct slices.
