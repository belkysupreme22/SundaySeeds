# Use the accepted seed paths for static identity and local startup motion

4 November 2026. Implemented in source; owner app/motion/native acceptance pending.

The owner stopped the book-to-tree film, selected a simpler unfolding seed, then
responded positively to the finished drawing. Preserve that exact four-path shape
across the static launcher, final logo and final animation frame. The native
launch image shows its initial closed seed rather than displaying the final
sprout before the unfolding begins. Current native image width is160; all mark
representations share the square `192 192 640 640` crop.

`export-seed-motion.cjs` parses the named master SVG paths, authors compatible
Bezier morph keyframes and generates both local Lottie JSON and static fallback
TypeScript paths. The seed seam opens, the stem extends and curled narrow leaf
buds lengthen/unroll into the final silhouette. No plant photographs, replacement
images, whole-sprout scale reveal, video renderer or external service is involved.
Regenerate these derivatives after editing the master; do not independently edit
the fallback geometry or Lottie final frame.

Reuse the installed platform player approach: Lottie React Native on native and
an after-mount dynamic `lottie-web` SVG renderer on web. Each web instance owns a
JSON copy and destroys its player. This avoids the native package's optional web
peer/WASM path, matching the existing loader architecture. No package is added.

The component loads while native launch is held, with a1200ms static fallback.
A conservative motion decision has a200ms deadline; unknown/late preference
results cannot start animation. Root font-ready-or-failed, actual layout and
artwork readiness precede native hide; playback begins only after that handoff.
The measured wordmark-height balance centers the mark in its group, reducing the
known positional jump caused by centering a mark-plus-text group. Native insets
and responsive short-screen sizing still require device acceptance.

Geometry lasts2300ms, wordmark entrance starts1300ms, then a120ms hold and220ms
fade complete the usual2640ms sequence. A missed playback callback starts exit at
2500ms; a3400ms hard guard completes. Static mode lasts900ms. Live reduced motion
or backgrounding stops/completes once. Player errors use the static mark; unmount
stops/destroys playback and clears timers/subscriptions. The visual is branding,
not a percentage or claim about backend loading. Existing provider hydration,
routes and touch/accessibility/web keyboard fences remain unchanged.

Actual review: asset rendering, static/native-export dimensions/alpha bounds,
vector key poses, independent source review, source formatting and whitespace.
The looping GIF is an authoring study of the exported control points, not an app
capture; runtime plays once. No app tests/typecheck/lint/build/runtime/native
checks ran. Native plugin/icon changes require a new build; Expo Go does not
verify the production launch experience. The old book/tree work remains stopped.
