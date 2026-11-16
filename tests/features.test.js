const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function createEngine(storage = new Map(), hostname = 'game.test', protocol = 'https:') {
  const listeners = {};
  const windowListeners = {};
  const nameForm = { hidden: true, addEventListener(type, listener) { listeners['name-' + type] = listener; } };
  const nameInput = { value: '', focus() {} };
  const appTitle = { content: '' };
  const canvas = {
    getContext: () => ({ imageSmoothingQuality: 'high' }),
    addEventListener() {},
    style: {},
  };
  let reading = false, toggleCount = 0, postedMessage = null, reloadCount = 0;
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
    AdvStoryNatale: require('../js/story-natale.js'),
    AdvArt: { rooms: {} },
    AdvAudio: sound,
    AdvVoiceIndex: { first: 1, second: 1 },
    addEventListener(type, listener) { windowListeners[type] = listener; },
  };
  const serviceWorker = {
    controller: {},
    ready: Promise.resolve({ active: { postMessage: (message) => { postedMessage = message; } } }),
    register: async () => ({ active: true }),
    addEventListener(type, listener) { listeners[type] = listener; },
  };
  const context = {
    window,
    document: {
      getElementById: (id) => id === 'game' ? canvas : id === 'name-entry' ? nameForm : nameInput,
      querySelector: () => appTitle,
      title: 'Le avventure',
    },
    localStorage: {
      getItem: (key) => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    navigator: { serviceWorker },
    location: { protocol, href: protocol + '//game.test/', hostname, reload() { reloadCount++; } },
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
    windowListeners,
    soundState: () => ({ reading, toggleCount }),
    postedMessage: () => postedMessage,
    reloadCount: () => reloadCount,
    nameForm,
    nameInput,
    appTitle,
  };
}

test('install button reports the browser prompt, cancellation and completion', async () => {
  const game = createEngine();
  game.windowListeners.beforeinstallprompt({
    preventDefault() {},
    prompt: () => Promise.resolve(),
    userChoice: Promise.resolve({ outcome: 'accepted' }),
  });
  game.api.installGame();
  assert.match(game.api.S.note.text, /Completa l’installazione dalla finestra del browser/);
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(game.api.S.note.text, /attendo la fine dell’installazione/);
  game.windowListeners.appinstalled();
  assert.match(game.api.S.note.text, /Gioco installato/);

  const cancelled = createEngine();
  cancelled.windowListeners.beforeinstallprompt({
    preventDefault() {},
    prompt: () => Promise.resolve(),
    userChoice: Promise.resolve({ outcome: 'dismissed' }),
  });
  cancelled.api.installGame();
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(cancelled.api.S.note.text, /Installazione annullata/);
});

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

test('Christmas story can be selected independently of the lighthouse unlock', () => {
  const game = createEngine();
  game.api.selectStory('natale');
  assert.equal(game.api.currentStoryId(), 'natale');
  game.api.fast(true);
  game.api.start(null, 'natale');
  assert.equal(game.api.S.game.state.room, 'natale_piazza');
});

test('all stories can be selected for local testing, without changing the public Maya lock', () => {
  const local = createEngine(new Map(), 'localhost');
  local.api.selectStory('maya');
  assert.equal(local.api.currentStoryId(), 'maya');
  assert.equal(local.api.storySelectorVisible(), true);

  const publicSite = createEngine();
  publicSite.api.selectStory('maya');
  assert.equal(publicSite.api.currentStoryId(), 'pernacchia');
  assert.equal(publicSite.api.storySelectorVisible(), false);
  assert.match(publicSite.api.S.note.text, /Completa prima l’avventura del Faro/);

  const fileGame = createEngine(new Map(), '', 'file:');
  assert.equal(fileGame.api.localTestMode(), true);
});

test('public stories start one after another, while local testing stays independent', async () => {
  const game = createEngine();
  game.api.fast(true);
  game.api.start(null, 'pernacchia');
  game.api.S.game.state.flags.finito = true;
  await game.api.end();
  assert.equal(game.api.S.nextStory.id, 'maya');
  game.api.advance(8.1);
  assert.equal(game.api.currentStoryId(), 'maya');
  assert.equal(game.api.S.mode, 'play');

  await game.api.end();
  assert.equal(game.api.S.nextStory.id, 'natale');
  game.api.advance(8.1);
  assert.equal(game.api.currentStoryId(), 'natale');

  await game.api.end();
  assert.equal(game.api.S.nextStory, null);

  const local = createEngine(new Map(), 'localhost');
  local.api.fast(true);
  local.api.start(null, 'pernacchia');
  local.api.S.game.state.flags.finito = true;
  await local.api.end();
  assert.equal(local.api.S.nextStory, null);
});

test('new game waits exactly three seconds on the support message before starting', () => {
  const game = createEngine();
  game.api.beginStarting(null, 'pernacchia', true);
  assert.equal(game.api.S.mode, 'starting');
  assert.equal(game.api.S.pendingStart.left, 3);
  game.api.advance(2.99);
  assert.equal(game.api.S.mode, 'starting');
  game.api.advance(0.02);
  assert.equal(game.api.S.mode, 'play');
  assert.equal(game.api.S.game.state.room, 'molo');
});

test('first launch asks for a name, saves it locally, and personalizes story text', async () => {
  const first = createEngine();
  assert.equal(first.api.S.mode, 'name');
  assert.equal(first.nameForm.hidden, true);
  assert.equal(first.api.setPlayerName(null), false);
  assert.equal(first.api.setPlayerName('   '), false);
  assert.equal(first.api.setPlayerName('Arianna'), true);
  assert.equal(first.storage.get('pernacchia-player-name'), 'Arianna');
  assert.equal(first.api.playerName(), 'Arianna');
  assert.equal(first.api.personalize('Fili e Filippo'), 'Arianna e Arianna');
  assert.equal(first.api.personalize('filigrana'), 'filigrana');
  assert.equal(first.appTitle.content, 'Le avventure di Arianna');

  const returning = createEngine(first.storage);
  assert.equal(returning.api.S.mode, 'title');
  assert.equal(returning.api.playerName(), 'Arianna');
});

test('tooltips are removed from the game', () => {
  const engine = read('js/engine.js');
  assert.doesNotMatch(engine, /drawTooltip|firstPlayTooltips|TOOLTIPS_SEEN_KEY|tooltipsEnabled/);
  assert.doesNotMatch(engine, /\btip:/);
});

test('message duration can be adjusted, applies to current dialogue, and persists locally', () => {
  const game = createEngine();
  assert.equal(game.api.messageDurationOffset(), 0);
  const defaultDuration = game.api.speechDuration('Una frase di prova.', false);
  game.api.S.mode = 'play';
  game.api.S.speech = { left: 3, age: 1 };
  game.api.S.zones = [{ x: 850, y: 494, w: 32, h: 40, always: true, fn: () => game.api.adjustMessageDuration(1) }];
  game.api.click(860, 500, false);
  assert.equal(game.api.messageDurationOffset(), 1);
  assert.equal(game.api.S.speech.left, 4);
  assert.equal(game.api.speechDuration('Una frase di prova.', false), defaultDuration + 1);
  assert.equal(game.storage.get('pernacchia-message-duration'), '1');

  const returning = createEngine(game.storage);
  assert.equal(returning.api.messageDurationOffset(), 1);
  for (let i = 0; i < 10; i++) returning.api.adjustMessageDuration(1);
  assert.equal(returning.api.messageDurationOffset(), 8);
  for (let i = 0; i < 20; i++) returning.api.adjustMessageDuration(-1);
  assert.equal(returning.api.messageDurationOffset(), -4);
});

test('service worker updates reload inactive screens but do not interrupt a running game', () => {
  const game = createEngine();
  assert.equal(typeof game.listeners.controllerchange, 'function');
  game.listeners.controllerchange();
  assert.equal(game.reloadCount(), 1);
  game.api.fast(true);
  game.api.start(null, 'pernacchia');
  game.listeners.controllerchange();
  assert.equal(game.reloadCount(), 1);
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
