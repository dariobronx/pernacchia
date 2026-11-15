const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function createEngine(storage = new Map()) {
  const listeners = {};
  const canvas = {
    getContext: () => ({ imageSmoothingQuality: 'high' }),
    addEventListener() {},
    style: {},
  };
  let reading = false, toggleCount = 0, postedMessage = null;
  const sound = {
    music() {}, unlock() {}, sfx() {}, voice() {}, hush() {},
    speak: () => false,
    isSoundMuted: () => false,
    isReading: () => reading,
    toggleRead() { toggleCount++; reading = !reading; return true; },
  };
  const window = {
    AdvCore: require('../js/core.js'),
    AdvStory: require('../js/story.js'),
    AdvStoryMaya: require('../js/story-maya.js'),
    AdvArt: { rooms: {} },
    AdvAudio: sound,
    AdvVoiceIndex: { first: 1, second: 1 },
    addEventListener() {},
  };
  const serviceWorker = {
    ready: Promise.resolve({ active: { postMessage: (message) => { postedMessage = message; } } }),
    register: async () => ({ active: true }),
    addEventListener(type, listener) { listeners[type] = listener; },
  };
  const context = {
    window,
    document: { getElementById: () => canvas },
    localStorage: {
      getItem: (key) => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    navigator: { serviceWorker },
    location: { protocol: 'https:', href: 'https://game.test/' },
    requestAnimationFrame() {},
    URL,
    Math,
    Promise,
    console,
  };
  vm.runInNewContext(read('js/engine.js'), context, { filename: 'engine.js' });
  return {
    api: window.__adv,
    storage,
    listeners,
    soundState: () => ({ reading, toggleCount }),
    postedMessage: () => postedMessage,
  };
}

test('Maya story stays visible but cannot be selected until the lighthouse is completed', async () => {
  const storage = new Map([['pernacchia-current-story', 'maya']]);
  const locked = createEngine(storage);
  assert.equal(locked.api.currentStoryId(), 'pernacchia');
  locked.api.selectStory('maya');
  assert.equal(locked.api.currentStoryId(), 'pernacchia');
  assert.match(locked.api.S.note.text, /Completa prima l’avventura del Faro/);

  locked.api.fast(true);
  locked.api.start(null, 'pernacchia');
  locked.api.S.game.state.flags.finito = true;
  await locked.api.end();
  assert.equal(storage.get('pernacchia-main-story-complete'), '1');
  const unlocked = createEngine(storage);
  unlocked.api.selectStory('maya');
  assert.equal(unlocked.api.currentStoryId(), 'maya');
});

test('English test mode explains Italian-only speech instead of enabling Italian audio', () => {
  const game = createEngine();
  game.api.toggleLanguage();
  assert.equal(game.api.language(), 'en');
  assert.match(game.api.S.note.text, /English di prova/);
  game.api.toggleRead();
  assert.match(game.api.S.note.text, /voce è disponibile solo in italiano/);
  assert.deepEqual(game.soundState(), { reading: false, toggleCount: 0 });
});

test('asking to hear voices downloads them with progress before enabling speech', async () => {
  const game = createEngine();
  game.api.toggleRead();
  await Promise.resolve();
  assert.equal(game.postedMessage().type, 'download-voices');
  assert.equal(game.postedMessage().ids.length, 2);
  const requestId = game.postedMessage().requestId;
  game.listeners.message({ data: { type: 'voice-download-progress', requestId, completed: 1, total: 2 } });
  assert.equal(game.api.S.voiceDownload.completed, 1);
  game.listeners.message({ data: { type: 'voice-download-complete', requestId, completed: 2, total: 2 } });
  assert.equal(game.api.S.voiceDownload, null);
  assert.deepEqual(game.soundState(), { reading: true, toggleCount: 1 });
});

function createServiceWorker(fetchVoice) {
  const handlers = {};
  const entries = new Map();
  const cache = {
    async match(url) { return entries.get(url); },
    async put(url, response) { entries.set(url, response); },
    async addAll() {},
  };
  const self = {
    location: { origin: 'https://game.test' },
    registration: { scope: 'https://game.test/pernacchia/' },
    clients: { claim() {} },
    addEventListener(type, listener) { handlers[type] = listener; },
    skipWaiting() {},
  };
  vm.runInNewContext(read('service-worker.js'), {
    self,
    caches: { open: async () => cache, keys: async () => [], match: async () => undefined, delete: async () => true },
    fetch: fetchVoice,
    URL,
    encodeURIComponent,
    AbortController,
    Promise,
    Map,
    Array,
    Math,
    Error,
  }, { filename: 'service-worker.js' });
  return { handlers, entries };
}

test('voice service worker skips cached files, reports progress, and preserves downloaded files', async () => {
  const requested = [];
  const worker = createServiceWorker(async (url) => {
    requested.push(url);
    return { ok: true, url };
  });
  const cachedUrl = 'https://game.test/pernacchia/voice/already.mp3';
  worker.entries.set(cachedUrl, { ok: true });
  const messages = [];
  let task;
  worker.handlers.message({
    data: { type: 'download-voices', requestId: 'test-1', ids: ['already', 'new-one', 'new-two'] },
    source: { postMessage: (message) => messages.push(message) },
    waitUntil: (promise) => { task = promise; },
  });
  await task;
  assert.equal(requested.length, 2);
  assert.equal(worker.entries.size, 3);
  assert.equal(messages[messages.length - 1].type, 'voice-download-complete');
  assert.equal(messages[messages.length - 1].completed, 3);
  assert.ok(messages.some((message) => message.type === 'voice-download-progress' && message.completed === 1));
});

test('voice service worker aborts active downloads when requested', async () => {
  const worker = createServiceWorker((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  }));
  const messages = [];
  let task;
  const source = { postMessage: (message) => messages.push(message) };
  worker.handlers.message({
    data: { type: 'download-voices', requestId: 'test-cancel', ids: ['one', 'two'] },
    source,
    waitUntil: (promise) => { task = promise; },
  });
  await new Promise((resolve) => setImmediate(resolve));
  worker.handlers.message({ data: { type: 'cancel-voice-download', requestId: 'test-cancel' }, source });
  await task;
  assert.equal(messages[messages.length - 1].type, 'voice-download-cancelled');
});

test('help stands out and voice download progress has an explicit cancel action', () => {
  const engine = read('js/engine.js');
  assert.match(engine, /'💡 Aiuto',[^\n]+emphasis: 'help'/);
  assert.match(engine, /'Annulla'/);
  assert.match(engine, /voiceCancel: true/);
});
