# Session log

> [!summary]
> **What:** diary of the work sessions on both adventures.
> **Impact:** the lighthouse adventure has two chapters (13 rooms, 27 objects); the Maya adventure has six rooms and can be finished from start to end (proved by the automatic test).
> **Open points:** GitHub Pages is not enabled yet; no real play-test by a child or tablet/touch check.
> **Next step:** enable Pages for the public repository, then play-test on a phone or tablet.

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

- Added the PWA manifest, local phone/tablet icons and a same-origin service worker. It caches the app shell for offline use and caches voice recordings only after they are played.
- Added title-menu actions to install, close, share through the system chooser, email or WhatsApp. External sharing apps open only after the player selects that option; a public HTTPS address is required.
- Added a support page with the requested wording: “Per supportare ulteriormente lo sviluppo del gioco e di altri giochi in futuro.” Coffee support and rewarded ads are visibly inactive until their destination/service is chosen; no ad or external payment starts automatically.
- Added automatic checks for PWA assets and the sharing/support controls. Publishing the source does not activate the Pages website; that still needs to be enabled in repository settings.

## Q&A

### Can the graphics be improved further?

Yes. The biggest next step is replacing the simple shape-built backdrops with six original, locally stored illustrations made for the game's full display size. Keep characters, animation and click targets in the current code, and build each background with consistent perspective, light and texture.

### Can the characters and interface match the Maya backgrounds, and what were the unclear shapes?

The jungle used clusters of overlapping oval shapes as shorthand for leaves; they looked like unexplained bubbles. They are now leafy plant shapes. Filippo and the Maya villagers have a shared palette and woven details, the Maya title and controls use a matching warm stone-and-jade style, and the jungle light and cenote water move gently.

### What is needed before friends can install and share the game?

The source can be public on GitHub while the Pages website is still inactive. Enable Pages in the repository settings to get the permanent HTTPS address. The app shell works offline after it is cached, while voice recordings are saved one by one as they are played. Sharing opens only after the player taps a sharing option.

### Why are coffee support and ads not active yet?

The coffee button needs the chosen payment-page link, and rewarded ads need an approved provider. Both remain inactive until those are configured. The interface says support helps further the development of this game and future games, and ads never start automatically.

### What does the close button do in a browser?

Browsers often prevent a website from closing a tab it did not open. The button attempts to close the game; if the browser blocks it, the screen explains how to close the tab or app on the device.

### Can GitHub Pages count page visits, downloads or installs?

GitHub Pages does not provide built-in visitor, download or app-install counts. GitHub's repository traffic page has limited counts for visits and clones of the source repository, not reliable counts for the Pages game itself. More detailed measurement would require a separate analytics service; none has been added.
