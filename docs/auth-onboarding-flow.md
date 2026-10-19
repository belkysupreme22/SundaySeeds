# Auth onboarding flow

Updated 19 October 2026. The owner authorized the first identity/profile source
slice after contract draft v1, requested preparation for a new development project
with configurable domain/sender, and explicitly delegated the three dependency
installs. Source implementation is separate from service setup and acceptance.
Use the [Supabase setup walkthrough](supabase-setup.md) for the owner setup steps.

The earlier optional onboarding/content visuals (`752de75`, `f0b0792`) were approved.
The new identity behavior and changed follow-up screens have not been reviewed at
runtime. No intended Supabase project, schema, email service or hosting is yet
configured. Missing environment values produce honest unavailable outcomes.

## Product boundaries

Adults self-register with email/password without invitations. Registration, course
enrollment, class membership and staff authority are separate. The confirmed
future connected-course rules are verified email before Start, direct joining by
verified learners, and invitations for classes. This identity slice adds no
connected course gate/enrollment or class service. Existing sample lessons remain
available to guests; sample progress is not uploaded or merged into an account.

Welcome → optional account choice retains Create account, Sign in and Skip for
now. Skip opens Home through the existing welcome preference; Add a name retains
optional name setup. First launch and Settings introduction replay share internal
steps. Standalone account routes remain reachable from Settings. The signup name
is an independent optional account name, up to 40 characters; no guest-name copy
happens automatically. Profile/Home use the account name while signed in and the
preserved guest name after sign-out.

## Current source flow

| Route | Behavior once configured |
| --- | --- |
| `/` first launch and `/welcome` replay | Introduction → optional account choice → shared forms. Skip remains available; no sample learning reset |
| `/sign-in` | Email/password submission; returned session required for success. Existing accounts must sign out before replacement. Failed email-confirmation sign-in offers verification options |
| `/sign-up` | Optional name, email, password (minimum 15 characters, preserved spaces), confirmation. Isolated signup never replaces the primary session; accepted requests lead to verification guidance, without claiming email delivery or login |
| `/forgot-password` | Requests a recovery email with a safe accepted/eligibility message. No reset token or password in ordinary navigation |
| `/verify-email` | Requests another confirmation email for the in-memory pending address or current account. Check verification validates an active account with Auth; without a session it requests normal sign-in after email confirmation, never a public email-status lookup |
| `/reset-password` | Explains that the latest recovery email is required; no unproven password form |
| `/auth/confirm?token_hash=…&type=email` | Explicit-action confirmation landing page. Captures proof in memory and strips parameters; only Continue exchanges it in an isolated client, clears the candidate and offers normal sign-in |
| `/auth/recover?token_hash=…&type=recovery` | Explicit-action recovery. Continue verifies the proof in an isolated client; shows the target email before password submission. Password success and session-revocation uncertainty are distinct. Fresh sign-in follows |
| `/settings` | Account email/verification status, verification entry, recovery entry and current-device sign-out; unavailable social/email-preference features remain honest |
| `/profile` and `/edit-profile` | Own account name through feature hooks/RPCs while signed in; guest name through existing device storage otherwise. Profile provisioning/load failures are separate from authentication and support retry |

Proof routes are source-prepared for web hosting, not deployed endpoints. Standard
provider `ConfirmationURL`, implicit access-token URLs and PKCE-code callbacks
are not interchangeable with this token-hash contract. Custom email templates,
exact destination allowlists and hosting configuration are required. The HTTPS
landing page can be used on another device; the mobile app then signs in normally.
Localhost callbacks are for the same computer only. Follow the setup walkthrough.

## Session and data behavior

Feature hooks own SDK/storage operations; screens invoke their actions. The shared
client reads public environment settings, disables automatic URL session detection
and initializes lazily. Native credentials use chunked SecureStore writes with an
atomic manifest; browser credentials use tab-scoped sessionStorage. Browser SDK
channels are isolated per page so another tab cannot silently replace its actor.
Storage failures propagate safely. Post-commit native cleanup is best-effort:
unreachable encrypted chunks can remain after a cleanup failure, while the active
manifest/tombstone determines the acknowledged session state. Runtime durability
and failure-injection verification remain pending.

Restored identities are checked with Auth before profile operations; uncertainty
hides owned data and pauses writes. Confirmed invalid/expired identities clear
presentation and attempt current-device cleanup. Account-scoped requests pin the
initiating credential and discard responses after account/session changes. Profile
updates use expected revisions; conflicts require explicit reload before another
save, preserving the editor draft. Authentication/profile success are separate.

Confirmation and recovery candidates never become the primary account. Canceling
preserves any existing identity. A same-account password reset attempts actor-bound
local sign-out; a different active account remains intact. Password reset requests
provider-wide refresh-session revocation, reported separately if uncertain; access
JWTs can remain valid until expiry. Ordinary sign-out explicitly uses local scope
and leaves guest learning/name storage untouched.

Credentials stay in form state until submitted to Auth. Proofs/candidate sessions
remain in memory only. No credential/proof logging, analytics, query-param emails,
ordinary-navigation tokens, fabricated delivery or automatic sample transfer is
introduced. Google/Apple remain unavailable UI options. Terms/privacy remain
unpublished; they must be completed before public registration.

## Visual scope and owner review

Reference 03 remains the source for account portraits, pastel backdrops, inside-label
shared inputs, violet focus, primary arrows and shorter social buttons. Follow-up
and proof pages are intentional adaptations of this language; no full original
verification/reset reference exists. Preserve per-screen strokes and the unchanged
Home/discovery/lesson/Welcome defaults. Asset provenance:
`apps/mobile/assets/auth/ARTWORK.md`.

Owner actions before configuration: replay introduction → account forms → Skip,
standalone Settings entry, optional name setup, malformed/direct proof routes and
unconfigured submit messages. Existing guest name/progress/bookmarks must remain.
After configuration: run signup/duplicate signup, confirmation/resend, normal login,
profile provisioning/save/revision conflict, logout, recovery, expired/reused proof,
same-path fresh link, account A with account B's link, offline/storage failure and
slow request plus Back/Skip. Review narrow 360/390 widths, 150%/200% text, keyboard,
focus/error announcements and Android Back. Browser review does not verify native.

## Actual verification and next work

The approved dependency installation succeeded: `@supabase/supabase-js` 2.118.0,
Expo-compatible `expo-secure-store` ~57.0.4 and `react-native-url-polyfill` 4.0.0;
Expo added the SecureStore config plugin. Current official Supabase/Expo docs,
installed SDK source and reference 03 informed implementation. Independent source
review identified storage, browser-channel, focus and account-binding issues that
were corrected in source. Source formatting and whitespace review are separate
from execution evidence. Tests, typecheck/lint, builds, SQL application/permission
checks, runtime/native/security failure injection and rendered acceptance have not
been run for this increment. The two previously deferred lint issues remain.

Next: follow the new-project walkthrough, configure intended development settings,
perform owner acceptance, then scope authentic catalog/course joining. Class
invitation lifecycle and staff/publishing services retain their own decisions.
