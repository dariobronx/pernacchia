const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('PWA manifest points only to local install icons', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.strictEqual(manifest.name, 'Le avventure');
  assert.strictEqual(manifest.short_name, 'Avventure');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.orientation, 'landscape');
  assert.strictEqual(manifest.start_url, './');
  assert.strictEqual(manifest.scope, './');
  assert.ok(manifest.icons.length >= 2);
  for (const icon of manifest.icons) {
    assert.ok(!/^https?:/i.test(icon.src), 'icon is local');
    assert.ok(fs.existsSync(path.join(root, icon.src)), 'icon exists: ' + icon.src);
  }
});

test('mobile layout fills the available screen and guides portrait-phone users to rotate', () => {
  const html = read('index.html');
  const css = read('css/style.css');
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /id="rotate-prompt"/);
  assert.match(css, /height: 100dvh/);
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /orientation: portrait/);
  assert.match(css, /aspect-ratio: 16 \/ 9/);
  assert.match(css, /orientation: landscape\) and \(max-height: 600px\)/);
  assert.match(css, /width: 100%;\s+height: 100%;\s+max-height: none;\s+aspect-ratio: auto;/);
});

test('offline app shell contains its local files but does not preload voice recordings', () => {
  const serviceWorker = read('service-worker.js');
  assert.match(serviceWorker, /CACHE_NAME = 'fili-pwa-v14'/);
  const shell = serviceWorker.match(/const APP_FILES = \[([\s\S]*?)\];/);
  assert.ok(shell, 'app shell list exists');
  const files = [...shell[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.ok(files.includes('./index.html'));
  assert.ok(files.includes('./manifest.webmanifest'));
  assert.ok(files.includes('./js/engine.js'));
  assert.ok(files.includes('./js/story-natale.js'));
  assert.ok(files.includes('./js/art-natale.js'));
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), 'cached file exists: ' + file);
  assert.ok(!files.some((file) => file.startsWith('./voice/')), 'voice recordings are cached only as used');
  assert.doesNotMatch(serviceWorker, /https?:\/\//i, 'service worker fetches only same-origin resources');
  const html = read('index.html');
  assert.ok(html.indexOf('js/story-natale.js') < html.indexOf('js/engine.js'));
  assert.ok(html.indexOf('js/art-natale.js') < html.indexOf('js/engine.js'));
});

test('share icon opens options without a duplicate text share button', () => {
  const engine = read('js/engine.js');
  assert.match(engine, /button\(912, 14, 38, 38, '✕'/);
  assert.match(engine, /button\(10, 14, 38, 38, '', \{ fn: \(\) => \{ S\.mode = 'support'; \} \}\)/);
  assert.match(engine, /function drawSupport\(\)/);
  assert.match(engine, /button\(195, 176, 270, 56, 'WhatsApp'/);
  assert.match(engine, /button\(495, 176, 270, 56, 'Email'/);
  assert.match(engine, /drawShareOptionIcon\('message', 227, 204\)/);
  assert.match(engine, /drawShareOptionIcon\('email', 527, 204\)/);
  assert.match(engine, /function drawShareOptionIcon\(type, x, y\)/);
  assert.doesNotMatch(engine, /Condividi…|navigator\.share|button\(205, 166, 250, 48/);
  const winterArt = read('js/art-natale.js');
  assert.match(winterArt, /function shopFloor\(c, kind\)/);
  assert.match(winterArt, /biscotti: \['#b88359', '#8e6045'/);
  assert.match(winterArt, /pattini: \['#9bb2b4', '#718b91'/);
  assert.match(winterArt, /pesca: \['#8e8067', '#6c6252'/);
  assert.match(winterArt, /const rows = \[103, 109, 117, 127, 140\]/);
  assert.match(winterArt, /function skate\(c, x, y, s, color\)/);
  assert.match(winterArt, /c\.strokeStyle = 'rgba\(207,231,224,0\.8\)'/);
  assert.match(winterArt, /const ice = c\.createLinearGradient\(0, 82, 0, 140\)/);
  assert.match(winterArt, /ice\.addColorStop\(0, '#bad9df'\)/);
  assert.match(engine, /function drawStarting\(\)/);
  assert.match(engine, /Per supportare ulteriormente lo sviluppo del gioco/);
  assert.match(engine, /e di altri giochi in futuro/);
  const starting = engine.slice(engine.indexOf('function drawStarting()'), engine.indexOf('function drawExit()'));
  assert.match(starting, /button\(190, 315, 260, 52, '☕ Offrimi un caffè'/);
  assert.match(starting, /button\(474, 315, 296, 52, ''/);
  assert.match(starting, /text\('Guarda pubblicità', 643, 334/);
  assert.match(starting, /text\('per supportarmi', 643, 352/);
  assert.match(starting, /ctx\.beginPath\(\); ctx\.roundRect\(490, 328, 31, 24, 4\)/);
  assert.match(engine, /button\(290, 498, 180, 30, '⬇ Installa'/);
  assert.match(engine, /button\(490, 498, 180, 30, language/);
  assert.match(engine, /button\(250, 438, 220, 56, '▶ Continua'/);
  assert.match(engine, /button\(850, 494, 32, 40, '−'.*adjustMessageDuration\(-1\)/);
  assert.match(engine, /button\(884, 494, 32, 40, '\+'.*adjustMessageDuration\(1\)/);
  const title = engine.slice(engine.indexOf('function drawTitle()'), engine.indexOf('function drawStarting()'));
  assert.doesNotMatch(title, /'🗣 Leggi'|Sound\.isSoundMuted\(\)/);
  assert.match(engine, /Sound\.music\(getStory\(\)\.rooms\[id\]\.music\)/);
  assert.match(engine, /PLAYER_NAME_KEY = 'pernacchia-player-name'/);
  assert.match(engine, /nameForm\.addEventListener\('submit'/);
  assert.match(engine, /value\.replace\(\/\\b\(\?:Filippo\|Fili\)\\b\/gi, playerName\)/);
  assert.doesNotMatch(engine, /drawTooltip|firstPlayTooltips|TOOLTIPS_SEEN_KEY|tooltipsEnabled/);
  const titleWithShare = engine.slice(engine.indexOf('function drawTitle()'), engine.indexOf('function drawNameEntry()'));
  assert.match(titleWithShare, /button\(10, 14, 38, 38, '', \{ fn: \(\) => \{ S\.mode = 'support'; \} \}\)/);
  const controls = engine.slice(engine.indexOf('function drawPanel('), engine.indexOf('function askHint()'));
  assert.doesNotMatch(controls, /\btip:/);
  const art = read('js/art.js');
  assert.match(art, /case 'winter':\s*E\(c, hc, x, cy - 5\.8, 5\.2, 3\.6\); R\(c, '#f5ead9', x - 5, cy - 2\.8, 10, 1\.1\)/);
  assert.match(art, /E\(c, '#fff3d8', x \+ 0\.6, cy - 9\.2, 1\.8\)/);
  assert.match(engine, /if \(LOCAL_TEST_MODE\) \{/);
  assert.match(engine, /NEXT_PUBLIC_STORY = \{ pernacchia: 'maya', maya: 'natale' \}/);
});
