# SundaySeeds Supabase development setup

Updated 20 October 2026. Follow this in a **new development project**. The app
source and profile migration are prepared; no SundaySeeds project, migration,
sender or callback hosting has been configured by the agent. Tests and runtime
review remain owner-run. PostgreSQL stores profiles; Supabase Auth manages
credentials, email confirmation and sessions. Courses/classes come later.

## 1. Create the development project

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and sign in.
2. Select your intended organization, then **New project**. Use a clear name such
   as `sundayseeds-dev`. Keep development separate from production.
3. Generate a strong database password and save it in your password manager.
   The mobile app does not need that password; do not paste it into chat or Git.
4. Choose a region near the intended learners and review the plan/cost shown by
   Supabase before creating. Wait until the project is ready.
5. Check the project name/reference in the dashboard before each setup action.
   An unrelated existing project is not the SundaySeeds development environment.

## 2. Add the profile database structure

Open **SQL Editor** in this new development project. Review and run the entire
[learner-profile migration](../supabase/migrations/20261019000000_learner_profiles.sql)
once. It creates `public.learner_profiles`, an own-row read policy and two narrow
profile RPCs. It does not create example accounts or enrollment records.

In **Table Editor**, confirm the table exists and RLS is enabled. Its columns
should be `user_id`, `display_name`, `revision`, `updated_at`. An empty table is
expected until a learner signs in and the app provisions their profile. Do not
add a permissive “allow all” policy or turn RLS off to make an error disappear.

The SQL file includes a transaction. If it fails, keep the error for diagnosis
and resolve it before retrying; do not run arbitrary fragments. If you already
applied it successfully, do not apply it again. This dashboard path applies SQL
without recording CLI migration history. Record the applied filename/date;
before adopting a CLI deployment workflow, reconcile its migration history
deliberately rather than replaying the file against an existing table.

The [database README](../supabase/README.md) explains the RPC and permission
contract. Its rollback-only pgTAP tests are supplied for a disposable development
environment, have not been run, and are not a production SQL script.

## 3. Configure email/password authentication

Under **Authentication → Sign In / Providers → Email** (dashboard labels can
change), enable email/password sign-in and **Confirm Email**. Allow new user
signup. Leave anonymous sign-ins and unused social providers disabled for this
slice. Guest learning uses the app's existing sample storage, not Supabase
anonymous accounts.

Set the minimum password length to **15** in the password settings. The app
preserves spaces and does not trim passwords. If you add stronger provider
requirements, align the form guidance before inviting learners. Keep Confirm
Email on in every connected environment: disabling it implicitly confirms users
and defeats the agreed proof requirement. [Supabase auth configuration](https://supabase.com/docs/guides/auth/general-configuration)

## 4. Pick the email-link destination

For the first computer-only walkthrough, start the existing web preview:

```sh
cd /Users/beamlak/dev/SundaySeeds/apps/mobile
npm run web
```

Use the localhost origin printed by Expo. If it is `http://localhost:8081`, the
two destinations are:

```text
http://localhost:8081/auth/confirm
http://localhost:8081/auth/recover
```

In **Authentication → URL Configuration**, set Site URL to that origin and add
both exact destinations to Redirect URLs. If Expo uses another port, change all
three places: dashboard, app environment and browser URL. Use a consistent
hostname (`localhost` and `127.0.0.1` are different browser origins).

Open these development emails on the **same computer** while Expo is running.
`localhost` on a phone points to the phone, not your computer. For phone email
links, cross-device review and a real pilot, deploy these web routes on an owned
HTTPS origin, configure exact URLs there and replace the localhost values. A
new Supabase project does not itself host this Expo website. Hosting/deployment
is a separate step; no domain is invented here.

These are explicit-action landing pages: loading a link shows a Continue button;
it does not consume the proof automatically. Confirmation completes on the web,
then the learner signs in normally in the mobile app. Recovery similarly changes
the password on the landing page, followed by normal sign-in. Native app tokens
are not passed through a custom-scheme URL. [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)

## 5. Configure a sender, then set the two email templates

**Prerequisite for new Free projects:** Supabase projects created from 3 June
2026 using the default SMTP service cannot customize authentication templates.
If the editor says “Set up custom SMTP,” this is expected. Configure your own
SMTP provider first to unlock the subject/body editor. Paid plans are exempt
from this particular restriction; upgrading is not required if you configure
custom SMTP. [Supabase template restriction](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier)

Our explicit-action confirmation/recovery pages require the custom token-hash
links below. The default templates do not implement this callback contract; do
not treat them as an equivalent fallback or turn Confirm Email off to bypass the
setup. Localhost changes the destination only, not this mail-provider restriction.

### Development without a domain: Mailtrap Email Sandbox

You do not need to purchase a domain to develop this email flow. A hosted SMTP
sandbox captures messages in its own private test inbox instead of delivering
them to learners. It can serve as the custom SMTP transport for this development
project while retaining the token-hash templates and Confirm Email requirement.
This integration is recommended from the documented SMTP interfaces; it has not
yet been configured or tested for SundaySeeds.

1. Create a Mailtrap account and select **Email Testing / Email Sandbox**. Open
   **My Sandbox → Integration → SMTP**. This is the sandbox product, separate
   from Mailtrap's live email delivery/domain setup.
2. Copy that sandbox's SMTP host, port, username and password into Supabase's
   custom SMTP settings. The documented host is `sandbox.smtp.mailtrap.io`;
   port `587` is supported. Use the credentials shown for your actual sandbox.
3. Use sender name `SundaySeeds` and an address you control as the sender for
   this development configuration. Keep SMTP credentials in Supabase only.
4. Save, then edit both templates below. Keep Confirm Email enabled.
5. Trigger signup/recovery from the app for your controlled test accounts. Open
   captured messages in Mailtrap's private sandbox inbox and follow the link on
   the same computer while Expo runs at the configured localhost origin.

Mailtrap captures the message regardless of the recipient's real inbox, so this
checks the technical auth flow, not delivery or ownership of that recipient's real
mailbox. Sandbox access exposes the captured auth links; limit access to the
project's developers. Do not use this transport for real learner onboarding.
[Mailtrap sandbox SMTP setup](https://docs.mailtrap.io/email-sandbox/setup/sandbox-smtp-integration)

### Diagnose a domain rejection during sandbox setup

If signup shows a generic email-request failure and Supabase Auth logs contain
`550 5.7.1 Sending from domain gmail.com is not allowed`, the app reached Auth
and the SMTP service rejected the From domain. This is not evidence of a browser
network outage. Mailtrap documents this error for its live delivery service when
the From domain is not the verified sending domain.

For the no-domain development path, confirm the Supabase SMTP host is
`sandbox.smtp.mailtrap.io` and replace **all** credentials with those from
**Email Sandbox → My Sandbox → Integration → SMTP**. Live delivery uses
`live.smtp.mailtrap.io` and separate credentials/domain requirements. Changing
only the host while keeping live credentials is insufficient. A personal Gmail
From address is not suitable for Mailtrap live delivery; earlier personal-address
advice applies only to the captured-mail sandbox setup. Keep Confirm Email on.
[Mailtrap domain rejection](https://docs.mailtrap.io/email-api-smtp/help/troubleshooting/sending-from-domain-not-allowed)

### Real learner delivery: provider and verified sender

To configure custom SMTP:

1. Choose an email delivery service supporting SMTP and create its account.
2. Verify a sender/domain according to that provider's requirements. Domain and
   sender are still undecided for SundaySeeds; do not invent them.
3. Open **Authentication → SMTP Settings** (or the **Set up custom SMTP** button).
   Enter the provider's SMTP host, port, username and SMTP password, plus the
   verified sender address and sender name `SundaySeeds`.
4. Use the provider's SMTP credential, not your Supabase/database password. Keep
   it out of chat, Git and Expo public variables. Disable email click tracking.
5. Save the SMTP settings, return to **Email Templates**, and edit both templates
   below. Check delivery only after saving the templates and app settings.

If neither a sandbox nor a real sender is configured yet, continue with Step 6's public app settings.
Email confirmation/reset acceptance remains pending until this prerequisite is
complete. Guest learning is still available. No provider account, domain purchase
or SMTP configuration is performed by this guide.

In **Authentication → Email Templates**, update the relevant link in **Confirm
signup** to:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Confirm email</a>
```

In **Reset password**, use:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=recovery">Reset password</a>
```

Save both templates. The app supplies the exact configured destination in
`emailRedirectTo` / `redirectTo`. Keep it free of existing query parameters.
These custom templates intentionally use `TokenHash`, rather than a default
`ConfirmationURL` that verifies before reaching our explicit-action page.
Use signup/recovery **from this app** when checking these templates; dashboard
email actions without the expected RedirectTo are a separate flow.
[Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)

For hosted callbacks, configure HTTPS, a `Referrer-Policy: no-referrer` response
header and no analytics or access-log query-string collection on these routes.
The app removes proof parameters after capturing them in memory, but the host
must protect the initial request too. Disable email click tracking/rewriting.
Reloading or leaving a consumed link requires a new email; proofs are not saved
to device storage. Do not share complete confirmation/recovery links in chat.

## 6. Connect the app with public settings

From the project's **Connect** dialog or **Settings → API Keys**, copy the project
URL and **publishable key** (`sb_publishable_…`). The app deliberately accepts
publishable keys. Never put a database password, `sb_secret_…` key or legacy
`service_role` key in an Expo public variable. Public keys identify the project;
RLS/RPC rules protect private data. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

Copy `apps/mobile/.env.example` to `apps/mobile/.env.local` and fill:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
EXPO_PUBLIC_AUTH_CONFIRMATION_URL=http://localhost:8081/auth/confirm
EXPO_PUBLIC_AUTH_RECOVERY_URL=http://localhost:8081/auth/recover
```

The two localhost values are examples for the computer-only setup above. Use your
actual port or owned HTTPS destinations. `.env.local` is ignored by Git. Stop and
restart Expo after changing it. The three required packages are already installed
in this checkout; a fresh clone uses `npm ci` in `apps/mobile`.

## 7. Test email delivery with your own address

Complete Step 5's SMTP and custom-template setup first for this app's callback
flow. With Mailtrap Email Sandbox, read messages in the private sandbox inbox;
with a real delivery provider, read them in your controlled recipient inbox.
Test with an address allowed by your chosen provider's sandbox/domain rules
and check its delivery logs if an accepted request does not arrive. Do not assume
an accepted request proves inbox delivery. Check your provider's rate limits and
review the delivered confirmation/recovery links before inviting learners.

For context, Supabase's default SMTP restricts recipients to organization-team
addresses and currently limits the project to two messages per hour, with no
SLA. These developer-recipient allowances do **not** unlock custom templates on
new Free projects, so they do not complete our token-hash flow. [Default SMTP
limitations](https://supabase.com/docs/guides/auth/auth-smtp)

Domain/sender selection and SMTP setup remain owner actions; credentials belong
only in the service settings, not the mobile app.

## 8. Walk through the app

1. Settings → Account → Create account. Enter your own email, an optional account
   name and a password of at least 15 characters. The guest name is not copied.
2. You should reach confirmation guidance, without being signed in. Inspect
   Authentication → Users for the new pending identity; no staff/class/course
   grants should appear.
3. Open the email on the computer. Press Continue on the landing page. Return to
   the app and sign in with the same email/password.
4. Settings should show the account and verified state. The first validated
   session provisions its private profile. Edit the name, save, reload and check
   that the account name returns. Profile failure must offer retry without asking
   you to register again.
5. Log out. Your guest name and sample bookmarks/progress should remain. Sign in
   to another test account when delivery setup permits; profiles must remain
   separate. Browser sessions last for the tab; native sessions use SecureStore.
6. Request a password reset, open the latest email, press Continue and verify the
   target email before choosing a new password. Sign in again afterward. Opening
   another person's link must not replace your active account.

Also review invalid/expired/reused links, duplicate signup and unknown recovery
messages, offline requests, profile revision conflicts, blocked browser storage,
sign-out failure, same-path new email links and Back/Skip during slow requests.
Check 360/390 widths, larger text, keyboard and Android hardware Back. Browser
review is separate from native verification. Existing access tokens can remain
valid until expiry even after refresh sessions are revoked.

## What this setup does not finish

Authentic course catalog/enrollment, class invitations, connected learning
progress, staff authority, publication, Google/Apple sign-in and published
terms/privacy remain separate work. Current sample lessons stay accessible
without an account; sample progress is not uploaded. Before inviting real users,
complete the pending SQL permission/concurrency checks, app checks and policy/
delivery/hosting review. Dependency installation reported 29 audit findings in
the workspace dependency tree; remediation review is pending, and no forced
dependency upgrades were applied.
