# Session log

> [!summary]
> **What:** diary of the work sessions on all three adventures.
> **Impact:** the public game reports install status and fills landscape phone screens.
> **Open points:** the Kokoro voice-profile permissions are not fully documented; review the new Christmas scenes on a phone or tablet.
> **Next step:** check touch layout on a phone or tablet.

## 2026-11-13

- Built the whole game: rules (`core.js`), story with 9 rooms / 19 objects (`story.js`), code-made drawings (`art.js`), code-made sound (`audio.js`), screen and input (`engine.js`).
- Automatic walkthrough test: 5/5 pass (full solution, refused moves, money, data consistency, walkable areas).
- Browser check (muted): all 9 rooms, dialogue menu, inventory, ending screen.
- Bug found and fixed during the browser check: the coin counter in the inventory stopped the drawing as soon as the coins were collected.
- No remote resources: no CDN, fonts, images or network calls.
- Second pass: new test "random clicking" (25 random games: before each step of the solution, 6 random actions; no crash, the game can always still be finished) — 6/6 tests pass.
- New `👁 Cose` button (key C): name tags over everything touchable, for small players and tablets. Pointer leaving the game no longer leaves a button highlighted.

## 2026-11-13 (third pass: longer story, better graphics)

- Story: new chapter 2 "La nave nera" with 4 new rooms (cove, deck, cabin, hold), 8 new objects, 6 new characters; now 13 rooms / 27 objects. Lighting the lamp no longer ends the game: it opens chapter 2.
- Graphics: drifting clouds, shooting stars, deeper sea with sparkles, fireflies outdoors and dust indoors, soft dark frame, blinking eyes and shadows for people, lit lighthouse with beam in every outdoor room once it is on, Fili wears the wig, dark backdrop behind speech, nicer bottom panel.
- Extras: chapter title cards (click or Space to skip), ending screen with play time and hints used, new ship tune, snoring sound, voices for the new characters.
- Tests: walkthrough extended to the new ending, 6/6 pass. Browser check (muted): the 4 new rooms, chapter card, ending screen; no console errors.

## 2026-11-13 (fourth pass: reading voice, high resolution)

- New `🗣 Voce` button (panel, title screen, pause menu, key V): every line is read aloud with a local Italian voice, a different pitch per character; the line stays on screen until the voice ends; music gets quieter meanwhile. Only voices installed on the computer are used (`localService`), never online ones.
- Resolution: the canvas is now 1920 x 1080 (was 960 x 540) and the scene is drawn directly at 6 real pixels per unit instead of being drawn at 320 x 140 and enlarged. Fili's sprite and the inventory icons are drawn at high resolution too. Small rectangles have soft corners.
- Not done: replacing Fili with a well-known cartoon character (someone else's property).
- Tests: 6/6 pass. Browser check (muted, voice call replaced by a stand-in): five rooms, voice button, line held until the voice ends; no console errors. Not heard with real ears yet.

## 2026-11-13 (fifth pass: new hero)

- Fili is now an invented little sea creature ("lumino"): teal body, cream belly, coral frills, a glowing lantern on a stalk. Drawn with smooth shapes in `js/art.js` (`lumino`); it walks, blinks, talks and can wear the wig. Not a copy of any existing character.
- Story lines adapted: "ragazzo / ragazzino" became "piccoletto"; the Tricheco line about the cap now mentions the little light.
- Tests: 6/6 pass. Browser check (muted): hero on the pier, no console errors.

## 2026-11-13 (sixth pass: drawing quality, boy hero back, recorded voice)

- Hero: the invented creature was rejected; Fili the boy (red cap, striped shirt) is back, texts restored.
- Drawing quality: every person redrawn with smooth shapes (rounded body, round head, eyes with highlights, cheeks, new hats); small blocks now have rounded corners and a light/shadow shading.
- Voice: the computer voice was not good enough. All lines are now recorded with Kokoro (offline neural voice already installed and checked; female voice for Fili, narrator and the women, male voice for the others) into `voice/*.mp3`; the game plays the files. No new program installed, nothing sent online.
- `scripts/make-voice.js` records only the missing lines; run it again when texts change.
- Checks: 6/6 tests pass; browser check (muted) of the rooms, no errors.

## 2026-11-15 (second adventure: the Maya island)

- Added the second story, set in 800 AD: six illustrated places, nine inventory objects, villagers and puzzles that lead to the volcano finale.
- The title screen lets the player choose either story; each keeps its own saved progress.
- Added a complete automatic walkthrough and data checks for both stories.
- Voice generation now includes Maya story lines and the new character voices; recordings are generated locally with Kokoro.
- Checks: both adventures finish in the automatic walkthrough; no browser play-test yet.
- Added a Windows Desktop shortcut that opens the game in the default browser, with a custom Maya-island icon.
- Split spoken-voice control from music and sound effects: the music button (or M) now silences game sounds without stopping spoken lines.
- Reworked the Maya beach opening: Filippo is shipwrecked after a storm; the stranded boat, fisherman, palm, coconut and shells match their clickable positions.
- Redesigned the five remaining Maya scenes: jungle, village, hut interior, cenote and pyramid. Improved the Maya house details, object readability, scene layers and routes; moved the hut grandmother's stand point out from under her work surface and corrected the golden-mask click area.
- Reviewed all six Maya scenes in a local Edge preview, including the final beach and hut-roof adjustments, and checked visible landmarks against their click areas. All 11 automated tests pass; the original lighthouse-story art is unchanged.

## 2026-11-15 (new Maya art direction)

- Reworked the jungle around a winding, sunlit trail and a large ceiba; reshaped the village plaza, hut interior, cenote and pyramid around clearer focal points, depth and directional light.
- Updated the shared palm fronds and added a local preview of all six Maya scenes; verified visible landmarks still match their clickable areas.
- Checks: all 11 automated tests pass; the lighthouse story is unchanged.

## 2026-11-15 (background detail pass)

- Focused the graphics work on scenery, not characters: added layered wave highlights, irregular stone paving, beveled brickwork, wood grain and grass tufts to shared background drawing helpers.
- These details carry across the lighthouse story's outdoor scenes and interiors; the Maya backgrounds remain unchanged.
- Checks: all 11 automated tests pass. A browser visual review of this pass is still needed.

## 2026-11-15 (temple disc feedback)

- Pressing each of the first two pyramid discs now gives an immediate "CLAC!" confirmation and states which symbol number was pressed.
- Pressed discs stay visibly highlighted while solving the sequence; the third press keeps the existing correct/wrong result feedback.
- Added an automatic test for the per-disc confirmations and the successful sequence.

## 2026-11-15 (PWA and voluntary support)

- Added the PWA manifest, local phone/tablet icons and a same-origin service worker. It caches the app shell for offline use and caches voice recordings only after the player asks to hear or download them.
- Added title-menu actions to install, close, share through the system chooser, email or WhatsApp. External sharing apps open only after the player selects that option; a public HTTPS address is required.
- Added a support page with the requested wording: “Per supportare ulteriormente lo sviluppo del gioco e di altri giochi in futuro.” Coffee support and rewarded ads are visibly inactive until their destination/service is chosen; no ad or external payment starts automatically.
- Added automatic checks for PWA assets and the sharing/support controls. GitHub Pages is enabled at https://dariobronx.github.io/pernacchia/.

## 2026-11-15 (public source repository)

- Published the reviewed game source to https://github.com/dariobronx/pernacchia on the `main` branch.
- The 15 automatic tests passed before publication. Private IDE files and the local voice-generation tool were excluded.
- Enabled GitHub Pages from branch `main` and folder `/(root)`; verified the public game page responds over HTTPS.

## 2026-11-15 (Christmas adventure)

- Added a third, independently selectable story: Fili helps the village through sudden rain, makes cookies, skates, fishes, repairs Santa's sleigh bell and delivers the gifts with the reindeer.
- Added original winter scenes, decorated shops and houses, animated snow, fish under the lake ice, reindeer, elves, Santa and Fili's winter coat and pom-pom hat.
- On this computer, all three adventures can be selected from the title screen for testing. Online, the selector is hidden and stories progress in order: Lighthouse, Maya, Christmas.
- Added the Christmas files to the offline app shell and a separate original music loop. No remote assets or services are used.
- The full Christmas walkthrough, story data, local story selection and offline file list are covered by automatic tests.
- First launch asks for a player name, saves it locally and uses it in displayed story text and sharing messages. The recorded voice library has no personalized versions, so those lines are not spoken aloud with a custom name.
- Centered the equal-sized install and language controls on the bottom row and added clear vertical gaps between menu rows.
- Replaced the incorrect arrow with the standard three-node share icon. The installed Android app label is generic because its manifest is static.
- Coffee and advertising buttons now appear only with the three-second pre-game support message; the ad button has a fitted two-line label and a locally drawn TV/play icon.
- Added in-game −/+ controls to shorten or extend every dialogue by one second per tap (up to 4 seconds shorter or 8 seconds longer), including the current line; the preference is saved locally.
- Raised the offline cache version so devices cannot keep serving the previous game files. A detected update refreshes inactive screens, without interrupting an active game.
- Tested the name → title → three-second support screen → game transition in local Edge; it reached play without freezing. Repositioned Fili's winter hat above the eyes.
- Temporarily removed the title-screen share button and its sharing-options screen at the player's request.
- Clarified the request: restored the share-symbol button at the top left and its options screen, while removing only the separate text button “Condividi…”. Added hover descriptions to icon-only controls.
- Bumped the offline cache again so installed copies pick up the restored icon and tooltip changes.
- Reproduced the empty winter-lake screen: its gradient helper received two color strings instead of a color-stop list and threw during every frame. Corrected the argument and bumped the offline cache to v5.
- Aligned the email and WhatsApp choices on one row and added simple, non-branded icons.
- Rebuilt the Christmas interiors, frozen lake and Santa's sleigh yard with stronger perspective, room-specific construction, layered lighting and hand-placed story props. Kept the village square's original artwork.
- Limited hover descriptions to the first game session on this device and recorded that first play locally.
- Removed hover descriptions entirely; bumped the offline cache so installed copies receive the change.
- Gave each Christmas shop its own perspective floor finish and added clearer, multi-part shapes to the bakery goods, skates and fishing gear.
- Simplified the shop floors into a quieter one-point tile grid; removed the high-contrast checkerboard that obscured the perspective and bumped the offline cache to v8.
- Added two subtle geometric facets to the shared rectangle, ellipse and polygon drawing helpers, enriching the main forms across all three adventures; bumped the offline cache to v9.

## 2026-11-16 (install feedback)

- Added visible messages when installation starts, is accepted, is cancelled or completes. Browsers do not expose a numeric installation-progress percentage to the game; refreshed the offline cache.
- Added automatic coverage for accepted, cancelled and completed installation flows.
- Made the game use the available landscape screen area, respect device safe areas, ask portrait-phone users to rotate, and request landscape for installed apps; refreshed the offline cache.
- Removed side bars on short landscape phone screens by filling the full available area; refreshed the offline cache to v12.

## Q&A

### Can the graphics be improved further?

Yes. The biggest next step is replacing the simple shape-built backdrops with six original, locally stored illustrations made for the game's full display size. Keep characters, animation and click targets in the current code, and build each background with consistent perspective, light and texture.

### Is the published game clear of copyright and licensing risks?

The game now states that all rights are reserved. A detailed source-based review of Kokoro's Apache license, its Italian voice profiles, generated MP3s and the Italian Copyright Act is in `docs/voice-licensing.md`. The voice profiles are not explicitly linked to named speakers in the reviewed materials, so those sources do not guarantee every right in the recordings.

### Can the characters and interface match the Maya backgrounds, and what were the unclear shapes?

The jungle used clusters of overlapping oval shapes as shorthand for leaves; they looked like unexplained bubbles. They are now leafy plant shapes. Filippo and the Maya villagers have a shared palette and woven details, the Maya title and controls use a matching warm stone-and-jade style, and the jungle light and cenote water move gently.

### What is needed before friends can install and share the game?

The source and game are public at https://dariobronx.github.io/pernacchia/. The app shell works offline after it is cached; voice recordings are downloaded only after the player asks, with visible progress and a cancel option. Sharing opens only after the player taps a sharing option.

### Can the second story be played immediately?

No. The Maya adventure stays visible but locked until the lighthouse story is completed. Completion is remembered in the same browser and device.

### Can I use my own name instead of Fili?

Yes. The game asks once on first launch and stores the name only in the current browser on this device. It appears in story text and sharing messages; recorded voice files are not personalized, so those lines are not spoken aloud.

### When do the coffee and advertising buttons appear?

Only during the three-second support message before a game starts. The advertising button uses a small TV/play symbol and a two-line label so the wording fits.

### Why might an old installed game appear stuck after an update?

The offline cache can keep older game files. The cache version is now updated, and inactive screens reload automatically when the new files take control; an active game is not interrupted.

### How do I change how long dialogue stays visible?

Use the − and + controls at the bottom of the game: each tap shortens or extends dialogue by one second, up to four seconds shorter or eight seconds longer than normal. The setting is saved on this device.

### What does the English test option translate?

Nothing yet. It is a test selection only: menus and story stay Italian, and the voice button explains that spoken audio is currently Italian-only.

### Why are coffee support and ads not active yet?

The coffee button needs the chosen payment-page link, and rewarded ads need an approved provider. Both remain inactive until those are configured. The interface says support helps further the development of this game and future games, and ads never start automatically.

### How can I choose stories to test on this computer?

Open the game locally (`file://` or `localhost`); the title screen has a button for each story. Online, the selector is hidden and the stories start one after another.

### What does the close button do in a browser?

Browsers often prevent a website from closing a tab it did not open. The button attempts to close the game; if the browser blocks it, the screen explains how to close the tab or app on the device.

### Can GitHub Pages count page visits, downloads or installs?

GitHub Pages does not provide built-in visitor, download or app-install counts. GitHub's repository traffic page has limited counts for visits and clones of the source repository, not reliable counts for the Pages game itself. More detailed measurement would require a separate analytics service; none has been added.

### Can the game show installation progress?

It can show the browser prompt, whether the player accepts or cancels, and the final installed confirmation. The browser does not share a percentage or detailed installation steps with the game.

### Does the game fit a phone screen?

The game is designed for landscape. Installed apps request landscape where the device supports it; in portrait, a phone shows a rotate prompt. The page scales to the available area and keeps clear of notches and rounded screen edges.

On short landscape screens, the game fills the full width and height instead of leaving side bars; this slightly widens the picture to keep all scene and controls visible.
