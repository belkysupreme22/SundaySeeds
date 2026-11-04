# Bundled animations

## Unfolding seed

4 November 2026. `unfolding-seed.json` is original project-authored vector motion
from the accepted four-path identity, independent of the loading-dots asset and
its license below. It has no images, fonts, audio or external assets.
`scripts/export-seed-motion.cjs` derives Bezier geometry from `brand/logo.svg` and
generates static TypeScript definitions for the same fallback mark. At60fps,
frames0–138 take2.3seconds: the seam opens, the stem extends, two narrow buds
lengthen/unroll and a gentle bend settles into the exact final leaves. The last
14frames hold the final mark. All representations use crop `192 192 640 640`.

Native uses the installed Lottie player; web imports installed `lottie-web` after
mount, with SVG rendering and a separate JSON copy per instance. No optional WASM
peer, hosted player, account or CDN request is added. The app plays once with a
late wordmark and short fade; reduced motion uses the static final mark. Loading,
playback, background and failure paths have bounded completion safeguards.

```sh
node apps/mobile/scripts/export-seed-motion.cjs
# Also export ignored SVG authoring frames:
node apps/mobile/scripts/export-seed-motion.cjs --preview
```

The [motion study](../../../../docs/brand-options/2026-11-04/unfolding-seed/motion-study.gif)
loops for inspection; the actual app plays once. The study and key-pose sheet are
asset-authoring output, not app captures. Asset rendering/source review only;
app tests/typecheck/lint/builds/runtime/native acceptance remain owner-run pending.

## Loading dots

Adapted from **Loading dots** by **Kyle McGahey** on LottieFiles:
https://lottiefiles.com/free-animation/loading-dots-G6T99FPyOo

Downloaded 20 October 2026 from the public asset offered by that page:
https://assets-v2.lottiefiles.com/a/096b9aa8-1179-11ee-a3c5-375343765598/gpbtxJWScY.lottie

The source page identifies this free animation as licensed under the Lottie Simple
License (FL 9.13.21), https://lottiefiles.com/page/license. See LICENSE.txt in this
folder. The derivative animation remains under that license. The JSON metadata
also embeds the license so bundled app distributions retain its terms.

Changes: cropped unused canvas margins only; original blue-to-purple fills,
opacity, shapes and bounce/scale keyframes are preserved. The page overlay is
transparent, with no background panel, border, shadow or page wash. JSON contains no external images/fonts/assets. It is bundled
with the app; neither a LottieFiles account nor a runtime asset/CDN request is used.
Native rendering uses Expo's compatible lottie-react-native. Browser rendering uses
lottie-web SVG with the same bundled JSON, avoiding remote WASM dependencies.

Animation renders only during actual pending work. Reduced-motion preference uses
static dots; no minimum wait, synthetic percent or delayed completion is added.
Runtime, accessibility and native/web visual review remain owner-run.

Current placement: centered page/startup status; no button animation. Playback
speed 0.65 produces a roughly 2.08-second cycle. Screen overlays ease in over 180 ms
when motion is allowed and disappear immediately when the operation finishes.
