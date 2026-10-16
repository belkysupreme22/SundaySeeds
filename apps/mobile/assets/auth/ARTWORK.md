# Account artwork

## Final selected assets — reference correction

Layout: the artwork header extends through the 20px right content inset so portrait and backdrop meet the screen edge; fields retain their own inset. The portrait Image itself is shifted an additional 20px right to compensate its cutout padding, separately from the SVG. Both are clipped at the viewport edge. Confirm this placement on actual rendered screens.

The owner requested the actual reference subjects and closer artwork, rather than the earlier SundaySeeds subjects. Final `sign-in-cutout.png` and `sign-up-cutout.png` are built-in imagegen reconstructions directly from reference-03's centre and right panels. They approximate the screenshot; the original stock files were not recovered. Final generated originals: `exec-8be7d568-6c7e-4136-b3c7-c40fd58d5a57.png` and `exec-6402d70f-ac3e-41eb-9f60-05fb67cf2bf2.png` in the tool's generated-images directory. Only project copies are imported.

Final backgrounds are editable `Path` elements in `src/features/auth/components/AccountBackdrop.tsx`, rendered through `react-native-svg` 15.15.4 (the version recommended by Expo SDK 57). The man's irregular zigzag contour and woman's rounded yellow contour use separate paths, thin dark outlines and separate ink/cross accents. AccountHero layers them behind the portraits. Earlier raster backdrop and block-shape experiments were discarded; no obsolete backdrop PNG or drawing script is imported or retained. Geometry is reconstructed from the visible screenshot, not recovered source SVG data. Exact composited fidelity still needs owner review.

`google-g.png` was downloaded unchanged from https://developers.google.com/static/identity/images/g-logo.png, linked by Google's official https://developers.google.com/identity/branding-guidelines. Google is not a recoloured font glyph. The Apple mark uses the installed FontAwesome font. Provider buttons are unavailable UI actions, not configured identity providers. SVG version source: https://docs.expo.dev/versions/v57.0.0/sdk/svg/.

Page tint is #F8F5FC on account screens only. Typography uses the app's installed Poppins weights; exact font identity cannot be established from the screenshot alone. Inside labels, tighter spacing and link placement adapt reference-03. Original legacy assets remain unchanged. No pixel-exact or composited runtime acceptance is claimed.

### Final portrait prompt set (built-in tool)

Male — reference-03 screenshot as edit target:

> Use case: background-extraction. Edit target: supplied THREE-PANEL mobile UI design screenshot. Extract ONLY the male model from the CENTRE LOGIN PANEL: light-skinned young adult man with short dark brown side-swept hair, black rectangular glasses, wearing a lavender-purple button-down shirt over white T-shirt, looking down smiling at the dark smartphone held with both hands. Match THIS exact visible man, facial proportions, hairstyle, pose, shirt and framing from the centre panel; do NOT use another model, do not add curly hair. Reconstruct a clean higher-resolution photographic cutout faithful to the screenshot, top of hair through lower torso, tightly framed with minimal transparent margins. Entire background genuinely transparent alpha zero, no purple graphic behind him, no text, no UI, no badge, no border, no drop shadow. The purple jagged background and ink marks will be recreated separately in UI code.

Female — reference-03 screenshot as edit target:

> Use case: background-extraction. Edit target: THREE PANEL mobile UI reference screenshot. Extract ONLY the WOMAN from RIGHT SIGN UP PANEL. Faithfully reconstruct this specific model: light-skinned young adult woman with medium brown hair in a high bun, looking left smiling, wearing plain light lavender sweatshirt with black backpack strap over right shoulder, hugging a light-gray slim tablet/notebook diagonally against torso in both hands. Match the screenshot woman's face/hairstyle/pose/outfit, not another portrait. High-resolution clean photographic cutout, top of bun through waist, minimal transparent margins, entire head and shoulders. Background fully transparent alpha zero. No yellow shapes, no photo scene, no dark haze, no glow, no shadows, text, UI, border or extra objects. Yellow angular background and ink doodles are separate UI layers. Keep gray tablet rather than dark green books.

## Superseded draft history (not final artwork)

Created 16 October 2026 using the built-in imagegen tool (not CLI). Reference: `docs/references/reference-03.png`, centre sign-in and right sign-up panels. These are adaptations using the existing SundaySeeds portrait subjects, not extracted people from the reference screenshot.

Final project assets: `sign-in-cutout.png` and `sign-up-cutout.png`. Original legacy assets are preserved. Both generated PNGs carry alpha; final composited screen appearance still needs owner visual review. AccountHero draws the geometric background and doodles with native Views; no UI lettering is baked into the assets. AccountProviders uses installed FontAwesome Google/Apple marks, with explicit unavailable-provider feedback and no OAuth operation.

### Earlier draft prompts

Sign-in edit target: `assets/legacy/auth_login_user.png`.

> Use case: background-extraction. Asset type: mobile sign-in hero cutout. Edit target: the supplied man holding a phone. Preserve his face, curly hair, glasses, expression, phone and hand anatomy. Remove the entire photographic background to genuine transparent alpha. Recolor only the green overshirt to soft lavender purple (#B8A3DE), retain white undershirt. Tightly frame the subject from top of hair to waist, with minimal transparent padding, keep all hair and both shoulders inside image, centered. Clean photoreal editorial cutout, natural edges without halos. No backdrop, geometric shapes, text, border, shadow or extra objects. UI shapes will be layered separately in code.

Sign-up edit target: `assets/legacy/auth_signup_user.png`.

> Use case: background-extraction. Asset type: mobile sign-up hero cutout. Edit target: supplied woman with bun, backpack and books. Preserve her face, hairstyle, friendly expression, book-holding pose and hand anatomy. Remove entire photographic background to genuine transparent alpha. Recolor beige overshirt to a plain light lavender-purple sweatshirt (#B8A3DE) for the pastel reference art direction; keep backpack strap and books. Tightly frame from above bun to waist, entire head and shoulders visible with minimal transparent margins, centered. Clean photoreal editorial cutout, natural hair edges, no halos. No backdrop, geometric shapes, typography, border, shadows or extra objects. UI graphics will be separately layered in code.

Final sign-up refinement, using the first generated sign-up portrait as edit target:

> Use case: background-extraction. Edit only the background/alpha of this sign-up portrait. Preserve the woman, face, hair, lavender sweatshirt, backpack and books exactly. Remove ALL diffuse brown/purple glow or haze outside her silhouette. Outside hair and clothing must be fully transparent alpha 0, including the dark brown region above and left of her head and purple halo beside body. Clean tightly cut out photoreal person only, no drop shadow, no environmental pixels. Preserve natural fine hair edge. No text, no other changes.

Original generated outputs remain under the image tool's generated-images directory; the app references only these project copies. No other screens' artwork was replaced.
