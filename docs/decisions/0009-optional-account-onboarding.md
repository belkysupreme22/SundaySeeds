# 0009 — Optional account onboarding

Date: 19 October 2026

## Context and decision

The owner approved optional sign-in/signup during onboarding, continued access through Settings and a more finished learner presentation. Welcome now leads to account choice with Create account, Sign in and Skip for now. Skip opens Home directly. The existing optional name flow remains available through Add a name for your welcome; it is not an account or a required second skip step.

First launch and introduction replay share a feature-owned WelcomeFlow. Existing auth screens accept destination-only navigation callbacks so the same forms can appear as onboarding steps or standalone Expo Router screens. Step changes never carry credentials. Leaving onboarding uses the existing welcome hook and save recovery; name setup uses its existing profile hook. Screens do not access storage directly. Android Back is registered only while the onboarding route is focused; browser history does not represent each internal step.

## Consequences and boundaries

- Existing welcome/name keys and learning records are unchanged. Completed users keep Home; Settings replay exposes the new choice without resetting data.
- All forms keep validation, visibility and honest unavailable-service outcomes. A valid form does not create a session, account, email or password change. Explicit follow-up previews stay inside those outcomes.
- Sample courses and lessons remain accessible after skipping. No course-auth gate, enrollment, return-course storage or class/verified-access policy is introduced.
- The future connected design can request sign-in at a permitted course Start/Join action and return to that course. Service contracts, B1-05b admission/verification and other backend gates precede implementation.
- Production-like sample editorial content is a separate task; it must retain identifiable samples and actual progress rather than invent activity or services.

## Verification

References 01/02/03 and current SDK 57/React Native documentation were inspected. Changed source was formatted and reviewed. Tests, builds, typecheck/lint, browser/runtime/native, keyboard and rendered visual acceptance remain pending owner; this source milestone is not authentication readiness.
