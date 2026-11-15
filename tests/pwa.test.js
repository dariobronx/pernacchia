const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('PWA manifest points only to local install icons', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.strictEqual(manifest.name, 'Fili: Isola Pernacchia e Isola Maya');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.start_url, './');
  assert.strictEqual(manifest.scope, './');
  assert.ok(manifest.icons.length >= 2);
  for (const icon of manifest.icons) {
    assert.ok(!/^https?:/i.test(icon.src), 'icon is local');
    assert.ok(fs.existsSync(path.join(root, icon.src)), 'icon exists: ' + icon.src);
  }
});

test('offline app shell contains its local files but does not preload voice recordings', () => {
  const serviceWorker = read('service-worker.js');
  const shell = serviceWorker.match(/const APP_FILES = \[([\s\S]*?)\];/);
  assert.ok(shell, 'app shell list exists');
  const files = [...shell[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.ok(files.includes('./index.html'));
  assert.ok(files.includes('./manifest.webmanifest'));
  assert.ok(files.includes('./js/engine.js'));
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), 'cached file exists: ' + file);
  assert.ok(!files.some((file) => file.startsWith('./voice/')), 'voice recordings are cached only as used');
  assert.doesNotMatch(serviceWorker, /https?:\/\//i, 'service worker fetches only same-origin resources');
});

test('sharing and support actions are explicit and use the requested wording', () => {
  const engine = read('js/engine.js');
  assert.match(engine, /button\(190, 400, 220, 38, '↗ Condividi \/ sostieni'/);
  assert.match(engine, /Per supportare ulteriormente lo sviluppo del gioco/);
  assert.match(engine, /e di altri giochi in futuro:/);
  assert.match(engine, /La pubblicità non partirà mai automaticamente/);
  assert.match(engine, /fn: \(\) => \{ S\.mode = 'support'; \}/);
  assert.match(engine, /if \(destination === 'email'\)/);
  assert.match(engine, /if \(destination === 'whatsapp'\)/);
});
