# Motion and accessibility standards

4 November 2026. Numbers below are SundaySeeds component standards unless an
external criterion is explicitly cited. They are not evidence that every existing
component has been migrated or that the app is certified accessible.

## Evidence and boundaries

- W3C [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html):
  normal text 4.5:1; qualifying large text 3:1. Calculate against actual adjacent
  fills, not a presumed white canvas.
- W3C [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html):
  relevant control/state indicators need 3:1 against adjacent colors, with stated
  exceptions. Not every decorative card edge is a control-boundary requirement.
- W3C [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html):
  web text must support enlargement to 200% without lost content/function under
  the criterion's conditions. Native dynamic-type review is separate.
- W3C [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
  is **Level AAA**. SundaySeeds nevertheless treats reduced motion as a core
  product rule; do not misreport this criterion as AA.
- W3C [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  sets a24CSS-pixel minimum with exceptions. Our44logical-point minimum and
  preferred48target are a stronger product standard, not that web criterion's number.
- [React Native Animated0.86](https://reactnative.dev/docs/0.86/animated) documents
  animation start/stop ownership and supported drivers. Use native transform/
  opacity where appropriate; do not mix one value between incompatible drivers.
- [React Native AccessibilityInfo0.86](https://reactnative.dev/docs/0.86/accessibilityinfo)
  supplies motion preference and change notifications. Unknown preference must
  not opt users into decorative movement.

## Component interaction matrix

| Component | Default → action | Timing / distance | Required alternative |
| --- | --- | --- | --- |
| Filled/outline button | Available → pressed | Immediate state;opacity.88,1dp | Disabled/busy semantics remain clear; no bounce |
| Input | Idle → focus → error | Stationary2px forest focus stroke; inline error | Label stays; no color-only validation |
| Choice/filter | Unselected → selected | Sage + check/marker; optional160ms | Immediate state under reduced motion |
| Navigation | Inactive → selected section | Shared forest/ivory active background | Route/state semantics and labels; no per-tab color identity |
| Card disclosure | Closed → expanded |180ms,up to 4dp; exit140ms | Instant reveal with focus/read order intact |
| Modal/sheet | Page → modal |260ms target with bounded movement | Focus, dismissal and reduced-motion behavior |
| Page transition | Route → destination |240ms target; preserve direction | Native/platform alternative; no custom zoom sequence |
| Async operation | Submitted → pending → result | Immediate honest status; never wait to complete a flourish | Cancel/exit/retry behavior; static indicator if needed |
| Save/bookmark | Pending → acknowledged | Quiet160ms feedback target | No saved claim before acknowledgement |
| Quiz feedback | Checked → explanation |160ms optional reveal | Locked answer and words/icons identify correctness |
| Progress | Recorded value changes | True values only; optional short interpolation | No fabricated count-up/percent; static target value |
| Brand splash | Seed → final mark → app |2300ms +120hold +220fade |900ms final still; finite load/playback guards |

Standard easing families: enter `cubic-bezier(.16,1,.3,1)`, exit `(.4,0,1,1)`,
general `(.2,0,0,1)`. Small UI should feel responsive rather than floaty. These
are art-direction values, not externally mandated timings. A press state may be
immediate; the100ms token is for implementations that animate that feedback.

## Lifecycle and truthfulness

Start decorative motion only with explicit allowed preference, focus/visibility
and the required asset loaded. Stop owned animations, listeners and timers on
blur/unmount/background or live preference changes. Never leave a page waiting
for an animation callback without a finite fallback. A failed player uses a still
mark or clear status, not a permanent spinner.

Original loading dots keep their selected colors and speed. They appear during
real pending work in the existing centered, blurred overlay. They do not add a
minimum network delay or synthetic percent. The splash is branding rather than a
progress estimate and does not replay on ordinary navigation.

Use existing native focus/keyboard and accessible state APIs. Unsupported Settings
or provider actions stay unavailable; specimen controls in the reference guide
are explicitly local demonstrations. Do not infer backend success from UI motion.
Haptic/sound feedback is optional future scope, never essential information or a
dependency added silently as part of a color pass.

## Adoption and acceptance

Named tokens and Shared Button press values are implemented. Existing branded
splash/loader lifecycle guards remain. Other feature Pressables and platform
transitions still have legacy timings/state values; migrate each with its screen
review. The interactive guide demonstrates targets and honors OS reduced motion;
it is not an app capture or proof of native playback.

Owner acceptance: keyboard and screen reader order, focus visibility, all error/
pending/empty/recovery states, real device reduced motion, background/return,
switching accounts mid-request, text scale and safe areas. No app test/build/
typecheck/lint/runtime/native checks were run for this standards work.
