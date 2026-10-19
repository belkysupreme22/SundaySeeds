# Auth onboarding flow

Updated 19 October 2026. This is the current mobile identity UI handoff. Screen source, owner acceptance and connected services are separate states. Earlier account checkpoints in the broader plans remain historical; this document describes the current increment.

**Owner visual approval, 19 October:** The optional account onboarding and learner sample-content increments (`752de75`, `f0b0792`) are visually approved. Platform, viewport/text-size coverage, native/accessibility, error-state/runtime and automated/build results were not supplied. The [learner identity/course-access contract draft](backend-contract-proposal.md#learner-identity-and-course-access-contract) is now ready for review, using the confirmed rules below.

**Planning-only follow-up:** The draft distinguishes pending email confirmation without a session, accepted request versus inbox delivery, and successful authentication versus missing/failed account profile. It recommends purpose-bound explicit-action email links with a PKCE alternative, preserves an existing signed-in identity when auth is canceled, and prevents another account's confirmation/recovery link from silently replacing it. The proposed provider flow requires Confirm Email enabled in each connected environment. Draft ID-01–08 defaults and callback/domain/sender inputs still need review; the current preview routes implement none of this and must not be treated as production callback/proof handlers.

## Confirmed scope

Adult learners self-register with email and password; a prior invitation is not required to create an account. Account creation does not establish class membership or staff permissions. Google and Apple options are requested UI components; provider configuration and account linking remain undecided.

For future connected content, the owner confirmed email verification before course start, direct course joining for signed-in verified learners, and invitation-only class membership (B1-05c/d). Course enrollment does not create a class membership or staff grant. Delivery/callback/recovery and invitation-lifecycle details remain open; these decisions do not connect the current forms.

The owner approved **Welcome → optional account choice**, offering Create account, Sign in and **Skip for now**. Skip opens Home directly and saves the existing welcome-completed preference. **Add a name for your welcome** opens the existing optional display-name setup; its save/skip behavior is preserved and Back returns to account choice. Skipping the introduction still opens Home directly. Existing completed users retain Home and can revisit the new sequence through Settings → Learning → Replay the introduction, without resetting learning data.

The forms are shared between onboarding and Settings → Account → **Sign in or create an account**. Inside onboarding, Skip for now is available from each form/follow-up page; it completes the welcome flow rather than restarting it. These steps are composed within the existing entry/replay routes using destination-only callbacks; they add no route or credential parameters. Standalone account routes remain available from Settings and direct links. Sample courses and lessons remain freely accessible; no authentication or email-verification gate is introduced.

The future connected-course design allows course browsing/details before sign-in and requests identity/verification at a permitted Start/Join action, then returns to that course. Verified learners join available courses directly; classes require invitations. This UI increment implements no gate, enrollment, pending-course storage or authenticated return. The trusted operations, callback behavior and class invitation lifecycle remain B1-05b/service-contract work.

## Current screen flow

| Route | Entry and useful behavior | Outcome at this stage |
| --- | --- | --- |
| Existing `/` entry and `/welcome` replay | Three-page introduction → account choice; Create account/Sign in open the shared form as onboarding steps; Skip opens Home; optional name link preserves setup | Welcome preference saves through its existing hook. Failed saves offer retry/Continue for now; account actions create no session |
| `/sign-in` | Settings account entry or equivalent onboarding step; email/password fields, independent password visibility, forgot-password and signup links, Google/Apple options | Invalid fields show validation. Valid sign-in and provider actions report service unavailable; no session is created |
| `/sign-up` | Sign-in switch link; optional display name, email, password and confirmation; terms/privacy availability information | Valid submission reports registration unavailable. Within that notice, **Preview email verification** opens `/verify-email`; it does not submit registration or send email |
| `/forgot-password` | Sign-in recovery link; email field and mail illustration | Valid request reports recovery unavailable. Within that notice, **Preview password reset** opens `/reset-password`; it does not request or deliver a reset |
| `/verify-email` | Explicit signup preview action or direct route | Neutral mail illustration, **Check verification** and **Resend email** actions. Both report service unavailable; no sent/verified state is simulated. Links allow return to account/signup/sign-in navigation |
| `/reset-password` | Explicit recovery preview action or direct route | New password and confirmation with separate visibility controls. Missing or mismatched input is rejected; valid submission still reports unavailable, never a completed password change. Links allow return to recovery/sign-in |

The follow-up pages show a concise service-availability note and meaningful return links. Recovery and follow-up pages do not show provider rows. Google/Apple remain on sign-in and signup.

In onboarding, the table's account destinations refer to the same page components inside the entry/replay route; changing steps does not change the URL. Settings and direct links use the standalone routes listed above.

Account choice adapts references 01/03 with the existing signup portrait/backdrop, lilac page, mint learning note and stacked Create account/Sign in/Skip actions. All actions scroll with their content for narrow/larger-text layouts. Account forms use concise service-availability language; explicit verification/reset preview actions remain inside the unavailable-service notice so navigation never implies a successful registration or reset request. Android Back is scoped to the focused onboarding route and returns through the current step; leaving optional name setup is blocked while its save is in flight. Browser history does not create an entry per internal step; use the in-app Back controls within onboarding. See [decision 0009](decisions/0009-optional-account-onboarding.md).

Social buttons follow reference 03's secondary proportions: 44px minimum height versus the primary CTA's 52px, white fill, fine charcoal border, 6px corners and medium labels. Equal 22px icon slots align the official Google asset and installed Apple mark. Side-by-side buttons retain narrow/large-text stacking; stacked buttons grow with their content. Provider actions remain unavailable, with no OAuth or session. The 16 October source formatting/whitespace checks passed; that increment's preview tool could not initialize. Current rendered review remains pending owner.

All credentials are component state only. Navigation carries no email or password query parameters; follow-up direct routes do not require an existing registration, email, reset token or session. Account forms do not update Profile or learning data. Optional name setup retains its existing profile save; Skip leaves that name untouched. No new storage keys, dependencies or network requests are introduced. No credential is logged or saved by these screens.

## Reference decisions

- `docs/references/reference-03.png` is the auth reference: Welcome, Login and Sign Up. Preserve its pale lilac page, white outlined fields with internal labels, square back control, small badge, lavender CTA, right arrow, offset shadow and purple text links.
- References 02 and 04 show profile/interests/preferences setup. They contain no recovery, verification or new-password template. The new pages are explicitly reference-informed extensions of 03, not direct reproductions of a missing template.
- Existing signup/sign-in portraits and shaped backgrounds retain their right-screen-edge placement. Recovery/verification use an original code-native envelope, and password reset uses a lock, in the same visual language; no additional portrait or raster asset is needed.
- Password visibility uses a plain eye icon with a 44px touch target inside the shared field, matching reference 03 without an extra outlined icon box. The auth CTA arrows are restored. Other screens' stroke treatment is unchanged.
- Quick input follow-up: auth fields explicitly select the `account` appearance, with a 1px soft charcoal outline, semibold internal label and white fill. The password uses the reference's crossed-eye glyph while masked, keeping its accessible Show/Hide action label. Focus uses a visible 2px violet outline with compensated padding; the reference has no focused-field state, so this is an accessibility adaptation. Default outlined and soft/search fields are unchanged. The source/reference comparison does not establish rendered acceptance; the live-preview tool failed to start.
- Keep per-screen stroke decisions. Auth references use thin dark field/button outlines; do not apply an app-wide gray-border replacement.
- No OTP boxes, token-entry form, mandatory verification sequence or password-complexity instruction is introduced without an agreed service contract.

## Owner review and actual checks

**19 October onboarding increment:** References 01/02/03 and installed-SDK Expo Router/React Native BackHandler docs were inspected. Changed source was formatted and reviewed; runtime, native, keyboard, browser, typecheck, lint, tests, builds and visual acceptance were not run. No dependencies, storage keys or service configuration changed. Earlier checks below apply only to their original increments.

Web SVG correction: both decorative auth SVG roots use `aria-hidden` instead of `accessible={false}`. The installed SVG web renderer forwards `accessible` to React DOM, where a false value causes the non-boolean-attribute warning at `<Svg>`. A focused render-only reproduction confirmed the warning and the warning-free `aria-hidden` alternative. The existing art wrappers still hide decorative content on native. No artwork paths or placement changed. Browser/native rendered acceptance remains pending owner.

**16 October source checks:** The eight changed auth source files were formatted with the installed formatter. Source inspection and whitespace checks passed; these do not establish runtime acceptance. Runtime, build, typecheck, lint, native and visual checks were not run for that increment. The owner retains terminal-heavy checks and rendered review. The existing deferred mobile lint issues are outside this task.

Suggested owner review:

1. Settings → Learning → Replay the introduction → Get started should open account choice. Try both forms and their switches/recovery/follow-up previews, then Skip for now from each to reach Home. Repeat introduction Skip and account-choice Back. Already completed users must keep Home after reload.
2. From account choice, use Add a name for your welcome. Check save/blank/skip/Back, preserved existing name, Home/Profile greeting and learning progress; if saving fails, the typed name stays available. Failed welcome-preference saves offer retry and Continue for now.
3. Check Android hardware Back through forms/follow-ups/name setup and a save in flight, separately from browser in-app Back. No credentials should be saved, passed in URLs or treated as a session.
4. Open Settings → Account, compare sign-in/signup against reference 03, including right-edge portraits, title/form spacing and restored CTA arrows.
5. Try empty/invalid signup fields and mismatched confirmation. Enter matching fields, confirm registration remains unavailable, then open the explicit verification preview.
6. Try both verification actions and return links; neither should announce that email was sent or verified.
7. Open Forgot password, check empty/invalid email handling, then use a valid address to reveal the explicit reset preview.
8. Check empty/mismatched reset fields, independent show/hide controls and the unavailable outcome for matching fields. No success or automatic sign-in should occur.
9. Open both follow-up routes directly. Check back links, keyboard reachability, scrolling, narrow widths and larger text. Confirm recovery/follow-up pages have no Google/Apple row and existing auth pages still do.
10. Confirm optional name save/skip and sample learning/saved progress remain intact.

## Backend considerations and deferred work

The backend contract remains a discussion draft. The owner has now answered the course-access questions in **B1-05c/d**: verified email before connected course start, direct joining for verified learners and invitations for class membership. **B1-05b remains open for the delivery/recovery/session/invitation-lifecycle details**, rather than reopening those confirmed choices.

Before connecting these screens, agree verification/recovery method, destinations and callback behavior; trusted enforcement of verified identity at connected course Start/Join/content access; duplicate-account and unknown-address responses; resend/retry behavior and rate limits; expired or invalid proof handling; password policy and session behavior after a reset. The access direction is selected; these implementation contracts/configurations are not yet agreed.

Provider configuration, Google/Apple callbacks, account linking/email collisions, published terms/privacy, staff sign-in and authority, class discovery, invitation lifecycle and pilot ownership remain separate decisions. No class membership or privileged role should be inferred from self-registration or direct course enrollment.

Connected implementation must use acknowledged identity-service outcomes for delivery, verification, recovery and session state. Production callback/proof handling is outside these plain preview routes. Passwords must not be placed in navigation parameters or persisted by the app. Real pending/error/expired/retry/success states should be designed once the service behavior is agreed; no success state should be inferred merely from valid fields.

## Next implementation sequence

1. Record the owner's visual approval of the onboarding/sample-content increments; keep unreported native/runtime/automated checks separate.
2. Review the prepared identity/course-access contract and ID-01–08 proposals in the existing backend document, using confirmed B1-05c/d. Resolve remaining delivery/recovery/profile/session/invitation choices and environment inputs; keep Google/Apple outside the first slice unless separately selected.
3. Refine course Join/Start and return-to-course designs against those contracts. Existing sample curriculum remains independently available. Real content access still needs pilot/content ownership and approved release rules.
4. Approve the scoped identity contract and implementation start, then connect registration, sign-in, verification/recovery, own profile and Settings session behavior with real service outcomes. This planning step does not close LMS-B1/B3 or authorize production auth configuration.

Keep this document, the tracked roadmap checkpoints, changelog and ignored `docs/AGENT_HANDOFF.local.md` aligned whenever this flow or its decisions change. Commit this bounded auth UI task separately from independent teacher/admin/backend tasks; never force-add the ignored handoff.
