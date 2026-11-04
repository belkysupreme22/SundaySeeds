# SundaySeeds app identity

4 November 2026. The owner accepted the unfolding-seed drawing after the earlier
book/tree direction was stopped. The original editable mark has four named paths:
a curved stem, two asymmetrical leaves and an almond-shaped seed with an open seam.
Deep forest (`#173E32`) and warm ivory (`#F7F3E8`) preserve a clear silhouette.
The app's interface palette stays unchanged. The static launcher uses the final
sprout; the native launch asset uses its initial closed-seed pose.

The exact geometry comes from the
[accepted study](../../../../docs/brand-options/2026-11-04/unfolding-seed/README.md).
No generated bitmap imagery or new app dependency is used in the identity.

## Design basis

[Apple's app-icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons/)
emphasizes a memorable central idea, simple forms and consistent identity at small
sizes. It favors graphic symbols over detailed photos. Exported artwork stays
square so the system can shape it; the preview's rounded corners are illustrative.

[Android's adaptive-icon guidance](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)
uses separate 108dp layers with critical artwork inside the centered 66dp safe
area. Our foreground wraps the accepted icon placement in a 0.82 transform about the
canvas center. Its furthest nonzero-alpha pixel is 299.96px from the pixel center,
inside the 312.89px radius equivalent
of the 66dp safe circle on a 1024px canvas. The monochrome layer retains the same
shape for themed launchers. Preview examples account for the 72dp visible viewport.

The [Expo SDK57 configuration reference](https://docs.expo.dev/versions/v57.0.0/config/app/)
and [icon/splash guide](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
inform the asset configuration. A native preview/production build is still needed
to inspect the actual launcher and native splash; Expo Go is not that verification.

## Files

| File | Purpose |
| --- | --- |
| `logo.svg` | Editable vector source, four named paths: seed, curved stem and two leaves |
| `app-icon.svg` / `app-icon.png` | Square, opaque 1024px primary app icon, three-channel PNG |
| `adaptive-foreground.svg` / `.png` | Transparent 1024px Android foreground; forest background configured separately |
| `adaptive-monochrome.svg` / `.png` | Transparent 1024px single-color Android themed layer |
| `favicon.png` | Opaque 64px web icon |
| `logo.png` / `logo-reversed.png` | Transparent 704px final mark for light/dark surfaces |
| `splash-seed.svg` / `splash-seed.png` | Closed seed only; transparent 704px PNG, no seam/stem/leaves |

The final-mark and initial-seed exports use the same square crop,
`192 192 640 640`. The initial seed stays at its position within that full mark
canvas; it is not independently recentered or enlarged. This lets the following
motion scene start at the same authored seed coordinate. Actual native-to-app
layout alignment still requires device review.

The opaque primary icon uses `translate(-28 -20) scale(1.055)`, matching the
accepted concept. Adaptive/themed layers wrap that placement in a centered 0.82
scale. Both transparent layers have nonzero-alpha bounds `[312, 280, 714, 777]`.
These are rendered asset measurements, not a native launcher capture.
No new package was installed. To regenerate PNGs, supply Sharp outside the app:

```sh
SUNDAYSEEDS_SHARP_MODULE=/absolute/path/to/sharp node apps/mobile/scripts/export-brand.cjs
```

Actual verification: SVG/PNG rendering and dimensions/channels, opaque primary
export, transparent bounds and adaptive radial clearance. Visually inspected
24/40/64/144px artwork samples, final mark and initial closed-seed export. The
exporter derives the initial seed from the master seed's outer subpath; no seam,
stem or leaf geometry appears in the initial pose. All final-mark paths remain
exactly those accepted in the study; only placement, crop and color differ.

No app tests, typecheck, lint, build or runtime/native review ran for this asset
increment. Check actual launcher, native handoff, font failure, reduced motion,
keyboard/screen-reader isolation, 320px/short screens and large text on target
platforms when integration is ready. The earlier book/tree film remains stopped;
it is not the current identity or motion direction.
