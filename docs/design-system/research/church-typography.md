# Church and Bible-reading typography research

Reviewed 4 November 2026. Primary-source evidence is distinguished from SundaySeeds
design decisions. No claim is made that a website font is automatically the same
as every version of an organization's mobile app.

## Verified references

| Source | What is verified | SundaySeeds implication |
| --- | --- | --- |
| [YouVersion display-Bible guide](https://developers.youversion.com/guides/display-bible-html) | Its web reader exposes family, size, line-height and measure tokens. The documented serif stack has Untitled Serif with Source Serif 4 fallback. | Treat long reading as a deliberate editorial role, separate from navigation. |
| [YouVersion changelog](https://developers.youversion.com/changelog) | The SDK changed its serif identity and documents the fallback stack. | A font name must have a source/version; avoid unsupported claims about all Bible apps. |
| [Hallow Bible-tab help](https://help.hallow.com/en/articles/7885495-hallow-bible-tab) | Readers can adjust Bible text size and light/dark appearance through its text controls. | Reader comfort and user control matter more than decorative religious lettering. Hallow's exact family was not verified. |
| [ChurchApps appearance guide](https://support.churchapps.org/cs/docs/b1-admin/website/appearance/) | Church branding is managed through shared color, font and spacing settings with a preview. | One shared system should govern page families instead of separate palettes for auth, Settings and learning. No exact ChurchApps font family is inferred. |

These sources inform design principles. They do not authorize copying proprietary
fonts, artwork, interface assets or Scripture translations. In particular,
YouVersion's guide restricts downloading/self-hosting its intended proprietary
face; SundaySeeds uses the separately open-licensed Source Serif 4 originals.

## Selected pairing

- **Poppins** stays the Latin interface family. It preserves the established
  geometric, friendly reference language and the existing wordmark.
- **Source Serif 4 Regular** handles long English lessons. Its editorial character
  supplies a reading rhythm without using calligraphy or ornate display faces.
  This is our selection, not a universal claim that serifs improve reading for
  every person. Future reader preferences should offer useful control.
- **Noto Sans Ethiopic Regular/Semibold** handles Amharic controls and headings.
- **Noto Serif Ethiopic Regular** handles Amharic long reading.

Poppins's upstream description covers Latin/Devanagari; it is not an Ethiopic
coverage guarantee. Dedicated Noto families avoid relying on whichever substitute
font a device happens to provide. See [Poppins upstream](https://github.com/itfoundry/Poppins),
[Noto font distribution](https://github.com/notofonts/noto-fonts) and
[current Noto catalogue](https://notofonts.github.io/).

## Assets and actual inspection

Four original static TTF files are bundled with full SIL Open Font License texts
and SHA-256 provenance under `apps/mobile/assets/fonts/`. The existing Poppins
package remains. No new npm font dependency or runtime CDN is introduced.

A direct `cmap` asset inspection found Latin A/a in the Source Serif file and
Ethiopic sample characters in the three Noto files. The Noto files did **not**
include A/a. Shared Text therefore styles Ethiopic runs separately from Latin
runs, including mixed strings. Registration preserves the existing root
font-ready-or-failed startup gate. This asset inspection is not a claim of native
shaping, screen-reader or full-language acceptance.

Noto files come from its official stable legacy static distribution. Newest
upstream-version parity is not claimed. Original fonts were not modified.
[Adobe Source Serif](https://github.com/adobe-fonts/source-serif) and the Noto
repository supply the originals and licensing terms. Actual rendering, mixed
numerals/punctuation and tall Ethiopic line metrics need device review.

## Type hierarchy and migration

New explanatory UI text uses 16/26; new control labels 14/20; metadata 12/18.
Long reading starts 20/32. Existing hero27/35, heading25/34 and title17/25 remain
the established hierarchy. Amharic emphasis uses the actual semibold file, not
synthetic bold; negative Latin tracking is removed for Ethiopic runs and line
height allows its taller forms.

The existing compact 14/23 body,12/19 labels and10/16 captions remain compatibility
roles during screen-by-screen migration. Do not introduce new essential10px text.
The system records this debt rather than claiming every screen already meets the
new density standard. Sample and connected long readings now use the explicit
reading role. Reader font-size/theme preferences remain a separate feature.

## Acceptance

Review actual English, Amharic and mixed-script text at normal,150% and200% scale.
Inspect headings, input values, navigation, long course names, punctuation,
numerals, citations and multi-line buttons. Confirm fonts offline after a cold
start and fallback behavior if registration fails. Ask an Amharic reader to assess
actual type/translation quality. Do not shrink essential text to preserve a mockup.

Research and font-asset/source inspection are complete. App tests, typecheck,
builds, native shaping, runtime and owner typography acceptance were not performed.
