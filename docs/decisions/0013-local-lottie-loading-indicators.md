# Bundle Lottie loading indicators with separate native and web players

20 October 2026. Implemented in source; owner runtime/native/visual acceptance pending.

The owner requested LottieFiles loaders wherever appropriate. Use the freely
published **Loading dots** by **Kyle McGahey**, adapted to SundaySeeds' lavender,
mint, yellow and peach with fine ink outlines. The owner subsequently requested a clearly visible page-centered loader rather
than a button animation, plus slower/smoother motion. Use a 208×68 animation in
a centered screen overlay or the centered startup status. Source, download URL, modifications
and full Lottie Simple License are in `apps/mobile/assets/animations/`; metadata
inside the JSON also carries its license. Settings → About exposes creator credit.

Bundle the JSON with no external images/fonts/assets. Native playback uses Expo
SDK57's installed compatibility map version `lottie-react-native~7.3.8`. Web uses
`lottie-web5.13.0` SVG through a platform file, dynamically imported after mount.
This avoids the native package's optional dotLottie React web peer and remote WASM
loading. No LottieFiles subscription, login or hosted player URL is used at runtime.
The loader owns and destroys its web player; each instance clones mutable JSON.

Shared LoadingState and LoadingIndicator own presentation only. Button loading now retains its icon/label, disables repeat presses and reports
busy to accessibility; it renders no animation. Screen accepts a loadingMessage
for an absolute centered overlay outside scrolling content and footers. It renders
only while focused, dismisses the keyboard and allows existing exit actions to
receive input. This is a nonmodal presentation, not a new request or navigation gate.
NativeText is used before Poppins loads. Real font/progress/welcome/profile waits
and submitted account/profile actions drive visibility; errors, verification
instructions and unavailable data stay static. A shared playback speed of 0.65 gives an approximately 2.08-second loop; a 180 ms
opacity ease introduces the page overlay when motion is allowed. Completion
unmounts immediately. No artificial wait, fake percent, completion event, modal,
enrollment or backend behavior is added.

Reduced-motion preference starts conservatively still until known and updates
with the system setting. Background/inactive apps stop animated playback. Player
failure falls back to static pastel dots; status/action text stays visible. Revisit
screen-focus pausing if longer-lived background operations are introduced.

Install used the Expo resolver with scripts disabled, adding only the native and
web players and updating the lockfile. The sandbox attempt was stopped before a
successful authorized network install. npm reported29 existing-tree audit findings
(11moderate/18high); no audit remediation or forced upgrade was run. The Expo CLI
loaded environment variable names automatically but no credential values were
printed or manually inspected/changed.

Current official Expo57, React Native AccessibilityInfo, version-matched Lottie RN,
lottie-web usage/source and LottieFiles asset/license documentation informed source
review. Independent source review, formatting and whitespace review completed.
No tests/typecheck/lint/builds/runtime/native/rendered checks were run under the
owner verification agreement. Review restart/startup, real account/profile requests,
failed requests, reduced motion, background/tab changes and narrow/larger text.
