# Loading dots

Adapted from **Loading dots** by **Kyle McGahey** on LottieFiles:
https://lottiefiles.com/free-animation/loading-dots-G6T99FPyOo

Downloaded 20 October 2026 from the public asset offered by that page:
https://assets-v2.lottiefiles.com/a/096b9aa8-1179-11ee-a3c5-375343765598/gpbtxJWScY.lottie

The source page identifies this free animation as licensed under the Lottie Simple
License (FL 9.13.21), https://lottiefiles.com/page/license. See LICENSE.txt in this
folder. The derivative animation remains under that license. The JSON metadata
also embeds the license so bundled app distributions retain its terms.

Changes: cropped unused canvas margins; recolored four dots lavender/mint/yellow/
peach; added fine ink outlines and raised minimum opacity. Original bounce/scale
keyframes remain. JSON contains no external images/fonts/assets. It is bundled
with the app; neither a LottieFiles account nor a runtime asset/CDN request is used.
Native rendering uses Expo's compatible lottie-react-native. Browser rendering uses
lottie-web SVG with the same bundled JSON, avoiding remote WASM dependencies.

Animation renders only during actual pending work. Reduced-motion preference uses
static dots; no minimum wait, synthetic percent or delayed completion is added.
Runtime, accessibility and native/web visual review remain owner-run.

Current placement: centered page/startup status; no button animation. Playback
speed 0.65 produces a roughly 2.08-second cycle. Screen overlays ease in over 180 ms
when motion is allowed and disappear immediately when the operation finishes.
