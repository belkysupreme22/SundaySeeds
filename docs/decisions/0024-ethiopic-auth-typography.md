# 0024. Ethiopic typography for the account flow

Date 5 November 2026.

The [selected interface pairing](0025-lexend-noto-interface.md) supersedes the
account heading families recorded in this exploration.

Wäldä Maryam's nineteenth-century prayer book uses black for running text and
red selectively for headings, names and punctuation. The sixteenth-century
Gunda Gunde Gospel book pairs Geʿez text with distinct headpieces. The Walters
catalogue also records Amharic as a secondary language in that volume. These
objects informed the separation between expressive headings and functional
text in SundaySeeds. The interface uses modern Amharic with its own wording and
keeps the forest-led color roles. [Met prayer book](https://www.metmuseum.org/art/collection/search/307602)
[Walters Ethiopian Gospels W.850](https://manuscripts.thedigitalwalters.org/Data/WaltersManuscripts/html/W850/description.html)

- **Short Amharic account headings** use Abyssinica SIL Regular. SIL designed
  the face around Ethiopic calligraphic traditions and distributes a single
  regular weight. The app bundles the unmodified 2.300 release and its OFL.
  [SIL design notes](https://software.sil.org/abyssinica/design/)
- **English account headings** use Source Serif 4 Regular at the same display
  size. Controls and supporting copy retain Poppins and Noto Sans Ethiopic,
  while longer Amharic lessons use Noto Serif Ethiopic. Editable mixed-script
  values use platform fallback and need device review.
- **Language choice** is available in the account flow and shares Settings'
  existing device preference. Changing language keeps the current screen and
  renders existing validation and account notices in the selected language.

Review the modern Amharic copy with a fluent Ethiopian Orthodox reader. Check
line height, wrapping and keyboard reachability on narrow screens with large
text, and switch languages while an existing notice is on screen. Run one
confirmation and one password recovery from the development email links. Native
rendering, accessibility and email content localization are tracked separately.
