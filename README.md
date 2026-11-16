# Le avventure di Fili

> [!summary]
> **What:** three original point-and-click adventures: the lighthouse, Maya island and Christmas village.
> **Impact:** all three stories are playable; Christmas shops have distinct perspective floors and clearer displayed goods, with no hover tooltips.
> **Open points:** recorded voice files are not personalized, and the installed Android app label remains generic; the English option is a test only; support and advertising services are unconfigured.
> **Next step:** play-test the Christmas graphics and story on a computer and phone or tablet.

© 2026 Dario Brambilla. Tutti i diritti riservati sui contenuti originali del gioco. Non è consentito copiarli, modificarli, distribuirli o riutilizzarli senza autorizzazione scritta.

## How to play

- Open `index.html` in a browser (or `npm start`, then http://127.0.0.1:8142). On this computer (`file://` or localhost), all three stories can be selected from the title screen for testing. Online, the selector is hidden and the next story starts automatically after each ending.
- On first launch, enter the name you want for the hero. It is stored only in this browser on this device and replaces the hero's name in displayed story text and sharing messages. Recorded voice lines are not personalized, and the installed Android app label stays generic.
- Use **Installa il gioco** in the title menu. On iPhone/iPad, use the browser's **Share → Add to Home Screen** command. The offline app files are cached on installation; voice recordings are downloaded only when requested.
- The coffee and advertising support buttons appear only for the three-second message before a new or continued game starts. They remain inactive until their services are configured; no advertising starts automatically.
- The Christmas village square keeps its original artwork; the other Christmas scenes now have detailed room layouts, props and perspective.
- Each Christmas shop has a floor finish that matches its products, and the bakery goods, skates and fishing gear are drawn with clearer component shapes.
- When a newer offline-app version replaces a cached one, inactive screens refresh automatically; an active game is left undisturbed.
- The share-symbol button opens aligned email/WhatsApp choices with simple, non-branded icons; there is no separate button labelled “Condividi…”.
- During play, the − and + buttons adjust how long every dialogue stays visible, up to 4 seconds shorter or 8 seconds longer than its normal duration. The preference is saved on this device.
- Click on the scene to walk. Click a verb (Guarda, Prendi, Usa, Parla, Apri, Dai) and then a thing.
- Click an object in the inventory to hold it, then click a thing or another object to use them together.
- `💡 Aiuto` (key H) suggests the next step. `👁 Cose` (key C) shows for a few seconds the name of everything that can be touched (handy on a tablet, where there is no mouse hover). `🗣 Voce` (key V) independently turns spoken lines on or off; `🎵` (key M) turns music and game sound effects on or off without stopping speech, so you can listen only to the spoken lines. `F` full screen, `Esc` menu, `Space` skips a line, `1-9` pick a dialogue answer.

## The story

Fili (a boy with a red cap and a striped shirt) has three adventures:

- **Story 1 — "Fili e il Faro di Isola Pernacchia":** two chapters, 13 places and 27 objects. The lighthouse is off and the Admiral's ship arrives tonight. Chapter 1 visits nine places (pier, square, tavern, shop, beach, cave, lighthouse outside,
  inside and top). Goal: light the lighthouse again.
- **Chapter 2 — "La nave nera":** a black ship that steals lights hides in the cove. Four new places
  (cove, deck, captain's cabin, hold). Goal: get on board, take back the stolen lens and stop the cannon.
- **Story 2 — "Fili e l'Isola Maya":** six places (palm beach, jungle, village, Maya house, cenote and pyramid) and nine objects. After a storm shipwrecks Filippo ("Fili") on the island in 800 AD, he helps the villagers calm the rumbling volcano.
- **Story 3 — "Fili e il Natale che rischiava di sciogliersi":** a snowy village, cookie house, skating shop, frozen lake, fishing shop, elf workshop and Santa's home. Fili makes cookies, fishes safely, repairs the sleigh bell and helps deliver the gifts when sudden rain threatens Christmas.

The ending screen shows the play time and how many hints were used.

## Project layout

| File | Role |
|------|------|
| `js/core.js` | game rules without graphics: state, inventory, verbs |
| `js/story.js` | all content: rooms, objects, dialogues, puzzles, hints |
| `js/story-maya.js` | second story: six rooms, characters, objects, puzzles and hints |
| `js/story-natale.js` | third story: Christmas rooms, characters, objects, puzzles and hints |
| `js/art.js` | all drawings, made by code (no image files) |
| `js/art-maya.js` | drawings and inventory icons for the Maya story |
| `js/art-natale.js` | detailed winter scenes, seasonal characters and item icons |
| `assets/fili-isole.ico` | custom desktop shortcut icon for the adventures |
| `js/audio.js` | sounds and music, generated by code; plays the recorded reading voice |
| `voice/` + `js/voice-index.js` | one recorded MP3 per line of the story, and the list of the lines that have one |
| `js/engine.js` | screen, mouse/keyboard, panel, saving |
| `manifest.webmanifest` | install name, icon and app display mode |
| `service-worker.js` | keeps the app shell and already-played voice lines available offline |
| `assets/icon-192.png`, `assets/icon-512.png`, `assets/apple-touch-icon.png` | locally stored phone/tablet app icons |
| `tests/walkthrough.test.js` | plays the whole adventure automatically to prove it can be finished |
| `tests/pwa.test.js` | checks local PWA assets, offline shell and voluntary sharing controls |

## Tests

```bash
npm test
```

## Q&A

- **What is "point-and-click"?** A game type where you play only by pointing and clicking: no reflexes needed, only reasoning.
- **How does the reading voice work?** Every line of the story was recorded once, on this computer, with Kokoro (a voice program that works without internet; Italian voice profiles `if_sara` and `im_nicola`). The recordings are the MP3 files in `voice/`. The `🗣 Voce` button downloads them only after the player asks; no voice is installed on the device and no text is sent anywhere. Each character gets a slightly different pitch and speed.
- **What if I change a line of story text?** The changed line has no recording, so it is shown but not read. Two lines that contain a changing number (the coin counts) are never read.
- **Why are the pictures sharp now?** They are still drawn by code in a 320 x 140 grid, but straight onto a 1920 x 1080 canvas instead of being drawn small and enlarged: curves, slopes and letters come out smooth, and small rectangles get soft corners.
- **Where are the saves?** In the browser's local storage (a small private notebook), separately for each adventure: `pernacchia-save-pernacchia` and `pernacchia-save-maya`. "Nuova partita" erases the save for the selected adventure.
- **What is a PWA?** A website that can be installed from the browser and opened like an app. Installation and offline support require HTTPS; the local development server is not a public download link.
- **How does story selection work?** On this computer, choose any story from the title screen. Online, the selector is hidden: the Lighthouse, Maya and Christmas adventures start one after another.
- **What does English (test) do?** It is a test setting only: the story and menus remain Italian, and spoken audio is available only in Italian.
- **How do I download the spoken voices?** Tap **Leggi** on the title screen or **Voce** during a story to start downloading them (about 23 MB). The game shows progress; choose **Annulla** to stop. Downloaded files are kept, so a later attempt can resume.
- **Why aren't all voice files downloaded on install?** There are 1,005 recordings (about 23 MB). They are downloaded only when the player asks for spoken lines, to keep the initial install small.
- **Why are the coffee and ad options inactive?** No payment link or ad provider has been chosen. They will stay inactive until configured, and the player must always choose to tap them.
- **Can visits, downloads or app installs be counted?** GitHub Pages has no built-in visitor or install counter. GitHub shows limited traffic for the source repository, not reliable game-page visits. A separate analytics service would be needed for more detail; none is enabled.
- **What about voice rights?** The Kokoro model is Apache-licensed, but that does not fully establish rights in its Italian voice profiles or every generated recording. See the [detailed voice-licensing review](docs/voice-licensing.md).
