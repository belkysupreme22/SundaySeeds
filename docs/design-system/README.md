# SundaySeeds design system · 1.0

4 November 2026. This is the canonical visual and interaction standard. The owner
selected a forest-led identity with a **blended pastel palette**, and explicitly
included auth, onboarding, bottom navigation, Profile and Settings. Existing
reference screenshots still govern composition, proportions, stroke hierarchy
and responsive behavior. Their earlier purple-led color assignment is superseded.

[Open the interactive reference](guide.html) · [Machine-readable tokens](tokens.json)
· [Church typography research](research/church-typography.md)
· [Motion/accessibility sources](research/motion-accessibility.md)
· [Component and screen inventory](component-inventory.md)

## 1. Product character

Warm, grounded, thoughtful and approachable. SundaySeeds supports adult learning,
reflection and a return to study without pressure. Church context informs the
care given to reading, language and imagery; it does not require ornate lettering,
decorative crosses on every screen, or a separate visual style for each feature.

The seed is the identity. Forest is the recognizable action color. Cream and sage
carry the experience after launch. Pastels are related supporting colors, rather
than a collection of competing page themes. These are product design choices,
not claims about universal color psychology or theological meanings.

## 2. Color philosophy and fixed roles

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Brand / action | `brandColors.forest` | `#173E32` | Filled actions, active navigation, identity, important headings |
| On brand | `brandColors.onForest` | `#F7F3E8` | Text and icons on forest |
| Page | `brandColors.canvas` / `colors.paper` | `#F7F3E8` | Shared page and footer canvas, including auth |
| Supporting surface | `brandColors.surface` | `#E6EDDF` | Leading lesson surfaces, information, quiet learning areas |
| Selected surface | `brandColors.surfaceStrong` | `#D9E5D2` | Selected answers, choices, language rows and focused soft inputs |
| Secondary text | `brandColors.muted` | `#647261` | Legible supporting information |
| Control boundary | `brandColors.controlBorder` | `#788672` | Relevant input/choice boundaries; preserve reference stroke width |
| Body text | `colors.ink` | `#19171D` | Normal reading and structural fine outlines |
| Card / field | `colors.white` | `#FFFFFF` | Quiet raised content and input surfaces on cream |

Cream/white occupy the largest areas, sage groups content, and forest identifies
actions and the current section. Do not create a new large background color for
each page. Keep text on forest ivory; changing a fill also requires reviewing its
text, icons, focus, disabled and pending states.

### Related pastels

| Family | Accent fill | Softer card fill | Purpose |
| --- | --- | --- | --- |
| Mint | `#E0ECE2` | `#E6EDDF` | Supporting growth/learning detail |
| Wheat | `#F2E8C9` | `#F7F0D7` | Reflection, warmth and limited highlights |
| Peach | `#F1E2D4` | `#F5EBDF` | Gentle attention and recovery support |
| Rose | `#EEDDDC` | `#F5E8E5` | Warm detail for stories and other content |

The families share low saturation and a light, cream-related base. Use
`accentColors` for compact accents and `cardColors` for larger toned cards. Use
white or sage for routine notices, and wheat for practice questions. Use
`brandColors.forest` for primary buttons and active navigation.

Correct/incorrect, warning and error have semantic meaning. Keep their text,
icons and labels; do not communicate state through a green or peach fill alone.
Original illustration colors and the selected blue/purple loading animation are
authored media exceptions, not new UI palette tokens.

### Contrast

The exporter calculates actual foreground/background token ratios in
`tokens.json`. Normal text targets at least 4.5:1; relevant large text and non-text
control indicators target3:1. This follows the W3C criteria for
[text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
A passing token pair does not certify a screen: opacity, imagery, overlays,
disabled treatment and actual placement still need review.

## 3. Typography with separate interface and reading roles

| Role / script | Family | Weight |
| --- | --- | --- |
| Latin interface | Poppins | 400 body; 500 supporting; 600 controls/titles; 700 headings |
| Latin long reading | Source Serif 4 | 400 |
| Amharic interface | Noto Sans Ethiopic | 400 normal; 600 emphasis |
| Amharic long reading | Noto Serif Ethiopic | 400 |
| Short account headings | Source Serif 4 (English), Abyssinica SIL (Amharic) | 400 |

Poppins retains the established geometric interface. A serif reading role creates
a quieter editorial rhythm for long lessons without applying decorative church
lettering to controls. Noto is an explicit Amharic choice. Asset inspection found
that these Ethiopic files do not include Latin letters; Shared Text therefore
keeps mixed-script runs in their corresponding families. Do not apply Latin
negative tracking to Ethiopic text or simulate missing font weights.

This choice is informed by verified faith-app patterns, not copied proprietary
branding. YouVersion's public reader guide specifies a serif stack and reader
tokens; Hallow documents reader-size controls. Their exact app fonts must not be
guessed. See the [research and licensing record](research/church-typography.md).

The account heading role draws on the distinction between headings and running
text in Ethiopian Orthodox manuscripts. The forms pair a short display title
with Noto Sans Ethiopic or Poppins for controls and feedback.
[Manuscript research and font choice](../decisions/0024-ethiopic-auth-typography.md)

The [guide](guide.html#auth-type-options) compares ten Amharic heading faces
and an English Lexend account specimen alongside the current typography.
See the [comparison sources and licensing](specimen-fonts/README.md).

| Semantic role | Size / line height | Usage |
| --- | --- | --- |
| Hero | 27 / 35 | Short first-run or featured heading |
| Heading | 25 / 34 | Screen or section-level statement |
| `authHeading` | 26 / 37 | Account display title; Ethiopic uses 26 / 45 |
| Title | 17 / 25 | Card/section title, semibold |
| New prose `bodyLarge` | 16 / 26 | New interface explanatory content |
| New action `control` | 14 / 20 | New control labels |
| New metadata `meta` | 12 / 18 | Secondary facts that remain readable |
| Editorial `reading` | 20 / 32 | Long lesson body and reflection text; Amharic uses20/34 |

Existing compact `body 14/23`, `small 12/19`, `label 12/19` and `caption 10/16` are
compatibility roles. They are not permission to add new essential 10px copy.
Their density migration must happen screen by screen; globally resizing every
existing label would risk the earlier narrow-screen fixes. The new reading role
is applied to sample and connected long-form lesson bodies. The existing title
scale stays stable while the new system is reviewed.

Use actual text, never text baked into images. Preserve system text scaling;
wrap/stack and scroll instead of shrinking essential text. Keep reading lines
around 45–70Latin characters on wide screens; mobile uses the available width with
20px page margins. Ethiopic requires optical review rather than a Latin-only
character-count rule. Reader size/theme preferences are a documented next feature,
not a claim that the current app already implements them.

## 4. Layout, shape and hierarchy

- Spacing follows the existing4/8/12/16/20/24/28 family. Page margin20; normal
  section separation22–28; component gap8–12. Optical exceptions stay local.
- Radius roles: chip6, field8, button9, card12, round999. These are families,
  not a mandate to make every screen equally rounded.
- Strong reference elements retain1.2px ink outlines and crisp2×3offset shadows.
  Profile/Settings/navigation retain their lighter1px/subtle framing. Focus2px
  compensates padding so input content does not jump.
- Keep screen-specific reference proportions and existing compact/stacked
  thresholds. Review320/390px and larger widths,150%/200% text, safe areas and
  keyboard-up layouts. Do not squeeze portraits or make tap targets tiny.
- Minimum touch target44logical points; prefer 48 for new controls. Primary
  actions stay at least 52high. Visible glyphs may be smaller inside those targets.

## 5. Components and state standards

Canonical components own repeated behavior. Routes compose feature screens;
screens do not reach into storage/backend clients. Use Shared Text, InputField,
Button, Card, ProgressBar and BottomNav. Component behavior and required variants
are specified in the [inventory](component-inventory.md).

Every interactive component needs default, focus, pressed, selected where
applicable, disabled, pending and error behavior. Success, empty, unavailable,
interrupted and recovery states must be designed at feature level. A disabled
control retains a useful label/reason. Do not fabricate a feature behind an
enabled-looking setting or social-provider button.

### Navigation backgrounds

The bottom area uses cream; the navigation bar is neutral white with a light
stroke. Exactly one selected section uses forest with ivory icon and label.
Inactive items use dark ink on the neutral bar. Do not assign each section its
own active hue. Selection follows route ownership: course routes belong to
Lessons and Settings belongs to Profile. Deeper action-only pages may omit tabs.

### Auth, onboarding and Settings are first-class

All account pages use the cream canvas, sage hero shapes, forest actions and
visible field focus. Offer English and Amharic together with a labelled selected
state, using the same saved choice as Settings. Include sign-in/sign-up/recovery, invalid/expired links,
verification, pending/failure/retry and unavailable providers. Preserve Back,
Skip, password visibility and truthful request outcomes.

Onboarding uses the seed identity, the same type/CTA roles, sage feature areas
and restrained wheat details. Optional profile questions use neutral cards with
one consistent sage selected treatment and a labelled/check-mark state.

Settings/Profile use fine strokes, quiet rows and sage selected language/status
surfaces. A status label is informational unless an actual action exists.
Unsupported preferences stay honestly unavailable. Destructive learning-data
actions keep clear labels, intent and existing confirmation/recovery behavior.

## 6. Micro-interactions

| Interaction | Standard | Reduced motion / cancellation |
| --- | --- | --- |
| Press | Immediate state,1dp depression,opacity.88 | Keep immediate feedback; no animated bounce |
| Field focus | Visible forest ring, stationary geometry | Same ring; no motion needed |
| Selection | Sage surface + marker/label;160ms target for optional transition | Immediate selected state |
| Small reveal | 180ms enter,140ms exit,up to 4dp | Static or opacity-only when appropriate |
| Page / sheet | 240 / 260ms target, clear direction | Native reduced-motion alternative; focus stays correct |
| Save/bookmark | Acknowledge confirmed state; quiet160ms feedback | Immediate truthful state; retain retry/conflict guidance |
| Quiz check | Locked response, labelled explanation, optional160ms reveal | Immediate explanation; no reward delay |
| Progress | Actual recorded amount only | Immediate true value; no synthetic count-up |
| Loader | Actual pending work, centered original-color animation and existing blur | Static dots plus useful status |
| Brand splash | Existing2300ms mark, short hold/fade, one-shot | Final still; finite startup guard |

`motion.ts` supplies named durations, cubic-bezier families, distances and state
values. Shared Button consumes the press/disabled values now. Not every existing
sheet, card and navigation transition has been migrated; the inventory marks
that work explicitly. Never delay an operation to finish an animation. Do not
loop decorative reveals, celebrate every tap, add unsolicited sounds or make
haptics mandatory. Haptics require a separate deliberate implementation; no new
dependency was added here. Unknown motion preference starts conservatively.
Backgrounding, unmount, cancellation and failure stop owned animation resources.

## 7. Icons, imagery and content

Use the installed Feather/Lucide visual family at consistent sizes. Give
icon-only actions an accessible name and full touch target. Keep the custom seed
for brand identity; decorative icons do not replace labels. Use natural image
colors, consistent cropping and aspect ratios. Do not tint every photograph to
the palette. The older learner-image replacement request remains a separate
content/artwork task.

Voice is clear, warm and adult-respectful. Say what happened and the next useful
action. Avoid guilt, invented streaks/analytics, claims of spiritual achievement,
or fake completion. Scripture translation attribution and rights are content
requirements; typography does not authorize copying a translation.

## 8. Accessibility and responsive acceptance

State is communicated with words/shape as well as color. Preserve labels,
checked/selected/disabled/busy semantics, logical focus and reading order, and
field-level errors. Treat dynamic type and Amharic as core paths. W3C's
[text-resizing criterion](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
is relevant to web; native large-text testing is still required separately.
Reduced motion is a product standard; W3C's
[interaction-animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
is Level AAA and should not be mislabelled an AA requirement.

Owner acceptance must cover every row in the screen inventory, including keyboard,
error, pending and empty states. Source inspection and calculated token contrast
are useful evidence but do not replace screen-reader, native or rendered review.

## 9. Adoption status and governance

Implemented: forest-led shared controls/navigation, cream pages including auth,
blended accent tokens/card tones, sage onboarding/Home/filter/profile/quiz/progress
surfaces, Settings language/status colors, local font registration and mixed-script
Shared Text, editorial reading variants, and initial motion/shape/target tokens.

Still pending: owner app/native/font and screen-reader review; density migration
of legacy small text; migration of every bespoke press/sheet/page animation;
reader preferences; staff-dashboard adoption; remaining image replacement. The
teacher/admin code was not recolored as an unreviewed side effect of mobile work.

New UI must reference this system and shared tokens. A new color/font/interaction
role needs a reason, state coverage and a token update. Version changes that alter
hierarchy or flow require screen review. Reference deviations are recorded in
`docs/design-reference.md`. Do not change route/data behavior while applying
visual roles. The owner continues to handle app tests/builds/typecheck/lint and
runtime/native checks unless explicitly delegated.

## 10. Reproduce the reference

From the repository root, after existing dependencies are present:

```sh
apps/mobile/node_modules/.bin/tsx apps/mobile/scripts/export-design-system.ts
```

This exports the guide, local-font CSS, machine-readable tokens and color-pair
report. It does not start or test the app. If file-URL font loading is blocked,
serve the repository root and open `/docs/design-system/guide.html`; the guide
reports font availability instead of silently claiming the intended fonts loaded.
Its controls are local specimens and never change account or learning data.
