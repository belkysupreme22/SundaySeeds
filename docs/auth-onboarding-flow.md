# Auth onboarding flow

Updated 16 October 2026. This is the current mobile identity UI handoff. Screen source, owner acceptance and connected services are separate states. Earlier account checkpoints in the broader plans remain historical; this document describes the current increment.

## Confirmed scope

Adult learners self-register with email and password; a prior invitation is not required to create an account. Account creation does not establish class membership or staff permissions. Google and Apple options are requested UI components; provider configuration and account linking remain undecided.

The existing first-run path remains **Welcome → optional display-name setup → Home**. Its saved welcome/name behavior is unchanged. Settings → Account → **Sign in or create an account** opens the account UI. Sample learning stays accessible through the existing app flow; these previews do not impose an authentication or email-verification gate.

## Current screen flow

| Route | Entry and useful behavior | Outcome at this stage |
| --- | --- | --- |
| `/sign-in` | Settings account entry; email/password fields, independent password visibility, forgot-password and signup links, Google/Apple options | Invalid fields show validation. Valid sign-in and provider actions report service unavailable; no session is created |
| `/sign-up` | Sign-in switch link; optional display name, email, password and confirmation; terms/privacy availability information | Valid submission reports registration unavailable. Within that notice, **Preview email verification** opens `/verify-email`; it does not submit registration or send email |
| `/forgot-password` | Sign-in recovery link; email field and mail illustration | Valid request reports recovery unavailable. Within that notice, **Preview password reset** opens `/reset-password`; it does not request or deliver a reset |
| `/verify-email` | Explicit signup preview action or direct route | Neutral mail illustration, **Check verification** and **Resend email** actions. Both report service unavailable; no sent/verified state is simulated. Links allow return to account/signup/sign-in navigation |
| `/reset-password` | Explicit recovery preview action or direct route | New password and confirmation with separate visibility controls. Missing or mismatched input is rejected; valid submission still reports unavailable, never a completed password change. Links allow return to recovery/sign-in |

The follow-up pages show a concise service-availability note and meaningful return links. Recovery and follow-up pages do not show provider rows. Google/Apple remain on sign-in and signup.

Social buttons follow reference 03's secondary proportions: 44px minimum height versus the primary CTA's 52px, white fill, fine charcoal border, 6px corners and medium labels. Equal 22px icon slots align the official Google asset and installed Apple mark. Side-by-side buttons retain narrow/large-text stacking; stacked buttons grow with their content. Provider actions remain unavailable, with no OAuth or session. Source formatting/whitespace passed; rendered review remains pending because the preview tool could not initialize.

All credentials are component state only. Navigation carries no email or password query parameters; follow-up direct routes do not require an existing registration, email, reset token or session. No new storage keys, profile updates, learning mutations, dependencies or network requests are part of this increment. No credential is logged or saved by these screens.

## Reference decisions

- `docs/references/reference-03.png` is the auth reference: Welcome, Login and Sign Up. Preserve its pale lilac page, white outlined fields with internal labels, square back control, small badge, lavender CTA, right arrow, offset shadow and purple text links.
- References 02 and 04 show profile/interests/preferences setup. They contain no recovery, verification or new-password template. The new pages are explicitly reference-informed extensions of 03, not direct reproductions of a missing template.
- Existing signup/sign-in portraits and shaped backgrounds retain their right-screen-edge placement. Recovery/verification use an original code-native envelope, and password reset uses a lock, in the same visual language; no additional portrait or raster asset is needed.
- Password visibility uses a plain eye icon with a 44px touch target inside the shared field, matching reference 03 without an extra outlined icon box. The auth CTA arrows are restored. Other screens' stroke treatment is unchanged.
- Quick input follow-up: auth fields explicitly select the `account` appearance, with a 1px soft charcoal outline, semibold internal label and white fill. The password uses the reference's crossed-eye glyph while masked, keeping its accessible Show/Hide action label. Focus uses a visible 2px violet outline with compensated padding; the reference has no focused-field state, so this is an accessibility adaptation. Default outlined and soft/search fields are unchanged. The source/reference comparison does not establish rendered acceptance; the live-preview tool failed to start.
- Keep per-screen stroke decisions. Auth references use thin dark field/button outlines; do not apply an app-wide gray-border replacement.
- No OTP boxes, token-entry form, mandatory verification sequence or password-complexity instruction is introduced without an agreed service contract.

## Owner review and actual checks

Web SVG correction: both decorative auth SVG roots use `aria-hidden` instead of `accessible={false}`. The installed SVG web renderer forwards `accessible` to React DOM, where a false value causes the non-boolean-attribute warning at `<Svg>`. A focused render-only reproduction confirmed the warning and the warning-free `aria-hidden` alternative. The existing art wrappers still hide decorative content on native. No artwork paths or placement changed. Browser/native rendered acceptance remains pending owner.

The eight changed auth source files were formatted with the installed formatter. Source inspection and whitespace checks passed; these do not establish runtime acceptance. Runtime, build, typecheck, lint, native and visual checks have not been run for this increment. The owner retains terminal-heavy checks and rendered review. The existing deferred mobile lint issues are outside this task.

Suggested owner review:

1. Open Settings → Account, compare sign-in/signup against reference 03, including right-edge portraits, title/form spacing and restored CTA arrows.
2. Try empty/invalid signup fields and mismatched confirmation. Enter matching fields, confirm registration remains unavailable, then open the explicit verification preview.
3. Try both verification actions and return links; neither should announce that email was sent or verified.
4. Open Forgot password, check empty/invalid email handling, then use a valid address to reveal the explicit reset preview.
5. Check empty/mismatched reset fields, independent show/hide controls and the unavailable outcome for matching fields. No success or automatic sign-in should occur.
6. Open both follow-up routes directly. Check back links, keyboard reachability, scrolling, narrow widths and larger text. Confirm recovery/follow-up pages have no Google/Apple row and existing auth pages still do.
7. Confirm Welcome/name setup, sample learning and saved progress remain unchanged.

## Backend considerations and deferred work

The backend contract remains a discussion draft. **B1-05b is open**, including the unanswered question: should learners verify their email before accessing courses? Implementing a preview screen is not approval of that policy.

Before connecting these screens, agree verification/recovery method, destinations and callback behavior; whether and where verified identity is required; duplicate-account and unknown-address responses; resend/retry behavior and rate limits; expired or invalid proof handling; password policy and session behavior after a reset. These are required design/contract considerations, not configuration choices already made.

Provider configuration, Google/Apple callbacks, account linking/email collisions, published terms/privacy, staff sign-in and authority, class discovery/admission, invitation rules and pilot ownership remain separate decisions. No class membership or privileged role should be inferred from self-registration.

Connected implementation must use acknowledged identity-service outcomes for delivery, verification, recovery and session state. Production callback/proof handling is outside these plain preview routes. Passwords must not be placed in navigation parameters or persisted by the app. Real pending/error/expired/retry/success states should be designed once the service behavior is agreed; no success state should be inferred merely from valid fields.

## Next implementation sequence

1. Owner reviews this bounded UI increment; record acceptance separately from source completion and automated checks.
2. Resolve verification/recovery and class-admission decisions in B1-05b alongside pilot ownership/staff-authority decisions. Keep the Google/Apple UI request distinct from configured providers.
3. Refine course discovery/joining designs against their own references once class-admission behavior is agreed. Existing sample curriculum can remain available independently.
4. Approve the connected identity contract and backend implementation scope, then connect registration, sign-in, verification and recovery with real service outcomes and appropriate validation. This UI task does not close LMS-B1/B3 or authorize production auth configuration.

Keep this document, the tracked roadmap checkpoints, changelog and ignored `docs/AGENT_HANDOFF.local.md` aligned whenever this flow or its decisions change. Commit this bounded auth UI task separately from independent teacher/admin/backend tasks; never force-add the ignored handoff.
