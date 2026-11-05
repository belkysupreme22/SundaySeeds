# SundaySeeds reading and Ethiopic typography

Selected 4 November 2026 for the comprehensive design system.

| Role | Family | Weight |
| --- | --- | --- |
| Latin interface | Existing installed Poppins | 400 / 500 / 600 / 700 |
| Latin lesson reading | Source Serif 4 | 400 |
| Amharic interface | Noto Sans Ethiopic | 400 / 600 |
| Amharic lesson reading | Noto Serif Ethiopic | 400 |
| Account display headings | Source Serif 4 (English), Abyssinica SIL (Amharic) | 400 |
| Selected Amharic metadata labels | Geez Gofa Mono C | 400 |

The serif is an editorial reading face; controls and navigation remain geometric
sans. Noto gives Amharic an explicitly selected family instead of relying on
platform fallback. Semibold supplies Amharic label/heading emphasis; do not apply
synthetic font weights. This does not claim that every faith app uses these fonts.

Official YouVersion reader documentation specifies Untitled Serif with Source
Serif 4 as a fallback, plus reader size/line-height controls. Untitled Serif is not
downloaded or copied. Hallow's official Bible-tab help documents user text-size
and theme controls; it does not establish Hallow's font family.

`scripts/fetch-design-fonts.py` fetches original static TTF files and full SIL Open
Font License texts from Adobe, Noto, SIL and Debessay’s Gofa project. `SOURCES.json` records source URLs,
archive members where relevant, sizes and SHA-256 hashes. Noto files are stable static
builds from its official legacy distribution; no latest-release claim is made.
Poppins remains supplied by the existing Expo Google Fonts package and its license.

These are font assets, not a package install. Download/registration and actual
English/Amharic rendering are separate from typography research; see the current
design-system status before claiming app/native verification. Preserve all
license files in distributions. The original font binaries are unmodified. The
Abyssinica and Gofa licenses use LF line endings and trim trailing spaces in this repository.

Sources: [YouVersion reader](https://developers.youversion.com/guides/display-bible-html),
[Hallow Bible controls](https://help.hallow.com/en/articles/7885495-hallow-bible-tab),
[Adobe Source Serif](https://github.com/adobe-fonts/source-serif),
[Noto distribution](https://github.com/notofonts/noto-fonts).
