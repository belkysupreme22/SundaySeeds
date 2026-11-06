# Standardize the blended forest identity, bilingual type and interaction roles

4 November 2026. Source implemented; owner app/native acceptance pending.

The owner requested a comprehensive design system, including church-app typography
research, micro-interactions, auth, onboarding, navigation backgrounds, Settings and
pastels blended closely with the base palette. `docs/design-system/README.md` is
the canonical standard; reference screenshots continue to govern composition and
screen-specific stroke/shadow hierarchy. Dated purple-led color notes are historical.

Shared roles separate forest actions/current section, cream pages, sage surfaces/
selection and low-saturation related pastel accents. Large Card tones have their
own quieter mapping; content/feedback accents do not redefine page or navigation
identity. Legacy account background literals are removed, Settings selection uses
the same role, and control boundaries have a defined contrast-conscious token.
No route, storage, authorization, quiz rule or preference capability changes.

Keep Poppins for Latin UI. Bundle original SIL-licensed Source Serif4 for English
long reading and Noto Sans/Serif Ethiopic for Amharic. Local assets include license
texts, exact source URLs and SHA-256 provenance; there is no new npm font package
or runtime CDN. A sampled cmap inspection establishes that the Noto assets lack
Latin A/a, so Shared Text preserves separate Latin/Ethiopic runs. Registration
uses the existing font-ready-or-failed launch gate and unavailable faces fall
back rather than holding startup. Reading bodies use the explicit editorial role;
the existing compact UI sizes remain compatibility roles for deliberate migration.

Motion, shape and target-size tokens establish reusable interaction families.
Shared Button adopts the press/disabled values. Other custom transitions remain
explicit migration work. Unknown/reduced motion, background/cleanup, finite
startup and truthful async feedback remain requirements. Haptics, reader settings
and staff-dashboard adoption are not silently added by a visual-system change.

The reference guide is generated from actual theme/type/motion tokens, uses local
font assets, and includes local component specimens and calculated contrast pairs.
It is not the app, a backend simulation or native acceptance proof. The overview
artwork lists font roles; the live guide provides the actual font specimens and
reports whether local loading succeeded. No deployment or external connection is
required to read the documentation.

Actual checks: source review, scoped formatting/whitespace, asset font signatures/
sampled cmap/provenance, token export and seven contrast-pair calculations, plus
static reference artwork inspection. No app tests/typecheck/lint/build/runtime/
native or guide-browser interaction checks ran. The owner retains those checks;
legacy small text, all custom motion and remaining image replacement are documented
follow-ups rather than claims of complete app compliance.

## Navigation and Settings palette follow-up

6 November 2026. The owner requested a closer blend between the bottom
navigation, Settings and the cream page. The bottom safe area uses the page
color with a sage tray, and forest and ivory identify the active
tab. Settings, Profile and Progress use local cream row and card surfaces
with fine strokes and sage focus or selection where appropriate. The shared
white control and card roles still serve fields and other feature surfaces.
Source and contrast checks were performed. Device review is pending.

## Warm neutral surface levels

6 November 2026. The cream-on-cream treatment flattened Settings, and the
sage tray gave navigation too much color. The shared palette now uses raised
paper for grouped content, inset flax for the navigation tray, and a warm
edge for both. Cream remains the page. Sage denotes related content, focus,
and selection. Forest and ivory mark the active tab. These roles apply to
Settings, Profile, and Progress where their surfaces need separation.
