# SundaySeeds app identity

3 November 2026. One original, hand-authored vector mark: an open book’s centre
crease becomes the trunk of a fruit-bearing tree.
The connected silhouette represents Scripture and growth. Three negative-space
fruit openings keep the canopy readable at launcher size.
Deep forest (`#173E32`) and warm ivory (`#F7F3E8`) keep the icon legible without
photographic detail, ornament or words. The app's existing interface palette stays
unchanged. This is the implemented design; owner visual acceptance is pending.

## Design basis

[Apple's app-icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons/)
emphasizes a memorable central idea, simple forms and consistent identity at small
sizes. It favors graphic symbols over detailed photos. Exported artwork stays
square so the system can shape it; the preview's rounded corners are illustrative.

[Android's adaptive-icon guidance](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)
uses separate 108dp layers with critical artwork inside the centered 66dp safe
area. Our foreground uses a 0.76 transform about the canvas center. Its furthest
nonzero-alpha pixel is 305.61px from center, inside the 312.89px radius equivalent
of the 66dp safe circle on a 1024px canvas. The monochrome layer retains the same
shape for themed launchers. Preview examples account for the 72dp visible viewport.

The [Expo SDK57 configuration reference](https://docs.expo.dev/versions/v57.0.0/config/app/)
and [icon/splash guide](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
inform the asset configuration. A native preview/production build is still needed
to inspect the actual launcher and native splash; Expo Go is not that verification.

## Files

| File | Purpose |
| --- | --- |
| `logo.svg` | Editable vector source, three filled paths: book, connected trunk and fruit-bearing canopy |
| `app-icon.svg` / `app-icon.png` | Square, opaque 1024px primary app icon, three-channel PNG |
| `adaptive-foreground.svg` / `.png` | Transparent 1024px Android foreground; forest background configured separately |
| `adaptive-monochrome.svg` / `.png` | Transparent 1024px single-color Android themed layer |
| `favicon.png` | Opaque 64px web icon |
| `logo.png` / `logo-reversed.png` | Transparent 704px tightly framed mark for light/dark surfaces |

The temporary shared splash transition uses the same three vector paths and
`112 80 800 800` crop as `logo.png`. The requested continuous naturalistic 3D
book-opening/page-turning/growth film is still in production; see the
[motion brief](../../../../docs/splash-motion-direction.md). The rejected
layered-PNG attempt is no longer used at startup.
No new package was installed. To regenerate PNGs, supply Sharp outside the app:

```sh
SUNDAYSEEDS_SHARP_MODULE=/absolute/path/to/sharp node apps/mobile/scripts/export-brand.cjs
```

Actual verification: SVG/PNG rendering and dimensions, opaque primary export,
adaptive alpha bounds, small-size/mask asset previews, and lead source review.
No app tests, typecheck, lint, build or runtime/native review ran. Check cold launch,
font failure, reduced motion, keyboard/screen-reader isolation, 320px/short screens
and large text on the target platforms. The temporary transition has a static mark
with a short entrance/fade; it does
not depict the requested continuous seed-to-tree animation. The mature-tree icon
and the future film still need owner visual acceptance.

Design exploration and illustrative previews:
[brand record](../../../../docs/brand-options/2026-11-03/README.md).
