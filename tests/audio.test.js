const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('background music and spoken lines have independent controls', () => {
  const values = new Map([['pernacchia-voce', '1']]);
  const gains = [];
  const audios = [];
  class MockAudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createGain() {
      const gain = { gain: { value: 0 }, connect() {} };
      gains.push(gain);
      return gain;
    }
    resume() { return Promise.resolve(); }
  }
  class MockAudio {
    constructor(src) { this.src = src; this.paused = false; audios.push(this); }
    play() { return Promise.resolve(); }
    pause() { this.paused = true; }
  }

  const window = {
    AudioContext: MockAudioContext,
    AdvVoiceIndex: { line: 1 },
    AdvVoiceKey: { voiceKey: () => 'line' },
  };
  const context = {
    window,
    Audio: MockAudio,
    localStorage: {
      getItem: (key) => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, value),
    },
    setInterval: () => 1,
    clearInterval: () => {},
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/audio.js'), 'utf8'), context);
  const audio = window.AdvAudio;

  audio.music('mare');
  audio.unlock();
  assert.strictEqual(gains[1].gain.value, 0.32);
  assert.strictEqual(audio.isReading(), true);

  assert.strictEqual(audio.toggleSoundMute(), true);
  assert.strictEqual(gains[0].gain.value, 0);
  assert.strictEqual(audio.isReading(), true);
  assert.strictEqual(audio.speak('fili', 'Ciao!'), true);
  assert.strictEqual(audios.length, 1);
  assert.strictEqual(values.get('pernacchia-sound-muted'), '1');

  assert.strictEqual(audio.toggleSoundMute(), false);
  assert.strictEqual(gains[0].gain.value, 0.5);
  assert.strictEqual(gains[1].gain.value, 0.09);
  assert.strictEqual(audios[0].paused, false);
  audio.toggleRead();
  assert.strictEqual(audio.isReading(), false);
  assert.strictEqual(audios[0].paused, true);
  assert.strictEqual(gains[1].gain.value, 0.32);
});
