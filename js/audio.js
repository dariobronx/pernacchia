// Sounds and music made by code (Web Audio): no audio files.
// Usage: AdvAudio.unlock() on the first click, then AdvAudio.sfx('door'), AdvAudio.music('mare').
(function () {
  'use strict';
  const SOUND_MUTE_KEY = 'pernacchia-sound-muted';
  let ctx = null, master = null, musicGain = null, soundMuted = false, mood = null, timer = null, nextTime = 0, stepNo = 0;
  try {
    const savedSoundMute = localStorage.getItem(SOUND_MUTE_KEY);
    soundMuted = savedSoundMute === null
      ? localStorage.getItem('pernacchia-muted') === '1'
      : savedSoundMute === '1';
  } catch (err) { soundMuted = false; }

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = soundMuted ? 0 : 0.5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    if (mood) startMusic();
  }

  function tone(freq, dur, o) {
    if (!ctx) return;
    o = o || {};
    const t = (o.at || ctx.currentTime) + (o.delay || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.out || master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  function noise(dur, o) {
    if (!ctx) return;
    o = o || {};
    const t = ctx.currentTime + (o.delay || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = o.filter || 'lowpass'; f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(o.vol || 0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }

  const SFX = {
    pick: () => { tone(660, 0.08); tone(990, 0.12, { delay: 0.07 }); },
    click: () => tone(320, 0.05, { type: 'triangle', vol: 0.3 }),
    ui: () => tone(520, 0.04, { type: 'triangle', vol: 0.15 }),
    snore: () => { noise(0.5, { freq: 260, to: 140, vol: 0.35 }); tone(90, 0.5, { type: 'sawtooth', to: 70, vol: 0.12 }); tone(700, 0.35, { type: 'sine', to: 900, vol: 0.08, delay: 0.6 }); },
    door: () => { noise(0.18, { freq: 500, vol: 0.3 }); tone(110, 0.2, { type: 'sawtooth', to: 70, vol: 0.15 }); },
    coin: () => { tone(1320, 0.07, { vol: 0.15 }); tone(1760, 0.2, { delay: 0.06, vol: 0.15 }); },
    wrong: () => { tone(200, 0.18, { type: 'sawtooth', vol: 0.15 }); tone(150, 0.3, { type: 'sawtooth', delay: 0.16, vol: 0.15 }); },
    rumble: () => { noise(1.0, { freq: 180, to: 60, vol: 0.6 }); tone(55, 0.9, { type: 'sawtooth', to: 40, vol: 0.2 }); },
    match: () => { noise(0.25, { filter: 'highpass', freq: 3000, vol: 0.2 }); noise(0.4, { freq: 900, vol: 0.12, delay: 0.2 }); },
    boss: () => { [196, 185, 174, 147].forEach((f, i) => tone(f, 0.28, { type: 'sawtooth', delay: i * 0.22, vol: 0.2 })); },
    fanfare: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.6 : 0.14, { delay: i * 0.13, vol: 0.18 })); },
    fart: () => { tone(140, 1.3, { type: 'sawtooth', to: 45, vol: 0.35 }); noise(1.3, { freq: 300, to: 90, vol: 0.4 }); tone(900, 0.9, { type: 'sine', to: 2400, delay: 0.5, vol: 0.12 }); },
    pop: () => tone(300, 0.1, { type: 'sine', to: 1200, vol: 0.35 }),
    splash: () => noise(0.4, { freq: 2500, to: 400, vol: 0.3 }),
    gull: () => { tone(900, 0.15, { type: 'sawtooth', to: 1300, vol: 0.12 }); tone(1200, 0.25, { type: 'sawtooth', to: 800, delay: 0.16, vol: 0.12 }); },
    fry: () => { for (let i = 0; i < 6; i++) noise(0.12, { filter: 'highpass', freq: 4000, vol: 0.12, delay: i * 0.12 }); },
    crunch: () => { for (let i = 0; i < 3; i++) noise(0.07, { freq: 1800, vol: 0.35, delay: i * 0.16 }); },
    bonk: () => { tone(220, 0.12, { type: 'sine', to: 90, vol: 0.5 }); tone(700, 0.3, { type: 'sine', to: 500, delay: 0.25, vol: 0.2 }); },
    dig: () => noise(0.22, { freq: 700, to: 250, vol: 0.4 }),
    clack: () => { for (let i = 0; i < 3; i++) tone(800, 0.04, { delay: i * 0.18, vol: 0.2 }); },
    pour: () => { for (let i = 0; i < 4; i++) tone(300 + i * 60, 0.1, { type: 'sine', to: 500 + i * 60, delay: i * 0.12, vol: 0.2 }); },
    gears: () => { for (let i = 0; i < 6; i++) { tone(90, 0.06, { type: 'square', delay: i * 0.2, vol: 0.25 }); noise(0.05, { freq: 2500, delay: i * 0.2 + 0.1, vol: 0.15 }); } },
    step: () => noise(0.04, { freq: 500, vol: 0.06 }),
    conch: () => { tone(220, 1.2, { type: 'sawtooth', to: 196, vol: 0.3 }); tone(440, 1.1, { type: 'triangle', to: 392, vol: 0.25, delay: 0.05 }); },
    flute: () => { tone(587, 0.4, { type: 'sine', to: 659, vol: 0.2 }); tone(880, 0.5, { type: 'sine', delay: 0.3, vol: 0.18 }); },
    drum: () => { noise(0.08, { freq: 400, to: 80, vol: 0.45 }); tone(85, 0.15, { type: 'triangle', to: 45, vol: 0.3 }); },
  };
  // every character "speaks" with a short beep of a different pitch
  const VOICES = {
    fili: 520, narr: 0, baccala: 190, gabbiano: 900, sindaca: 600, ammiraglio: 130, cuoca: 680, pirati: 160,
    madama: 440, pappagallo: 1100, sbadiglio: 150, scheletro: 300, finestra: 130, tricheco: 110, cabina: 130,
    topo: 1300, vedetta: 480, capitano: 130, ciurma: 160,
    pescatore: 220, scimmia: 1200, capo: 140, nonna: 640, sacerdote: 170, rana: 110, vulcano: 80,
  };

  function sfx(name) { if (ctx && !soundMuted && SFX[name]) SFX[name](); }
  function voice(who) { const f = VOICES[who]; if (ctx && !soundMuted && f) { tone(f, 0.05, { type: 'triangle', vol: 0.12 }); tone(f * 1.2, 0.05, { type: 'triangle', vol: 0.12, delay: 0.07 }); tone(f * 0.9, 0.06, { type: 'triangle', vol: 0.12, delay: 0.14 }); } }

  // ---------- music: four short original loops ----------
  // Notes are steps of a scale above a base note; null = silence. Eight notes per bar.
  const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15], major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16], penta: [0, 3, 5, 7, 10, 12, 15, 17] };
  const TUNES = {
    mare: { tempo: 0.26, base: 220, scale: 'minor', wave: 'triangle',
      lead: [0, null, 2, 4, null, 2, 0, null, 3, null, 4, 5, null, 4, 2, null, 4, null, 5, 7, null, 5, 4, 2, 3, null, 2, 0, null, null, null, null],
      bass: [0, null, null, 0, null, null, 4, null, 3, null, null, 3, null, null, 4, null, 0, null, null, 0, null, null, 4, null, 3, null, 4, null, 0, null, null, null] },
    taverna: { tempo: 0.19, base: 262, scale: 'major', wave: 'square',
      lead: [0, 2, 4, 2, 0, 2, 4, null, 5, 4, 2, 4, 0, null, null, null, 4, 5, 7, 5, 4, 5, 7, null, 5, 4, 2, 1, 0, null, null, null],
      bass: [0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 4, null, 0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 0, null] },
    grotta: { tempo: 0.42, base: 147, scale: 'penta', wave: 'sine',
      lead: [0, null, null, 3, null, null, 2, null, null, null, 4, null, null, 1, null, null, 0, null, null, 5, null, null, 3, null, null, null, 2, null, null, null, null, null],
      bass: [0, null, null, null, null, null, null, null, 2, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null, 1, null, null, null, null, null, null, null] },
    nave: { tempo: 0.24, base: 165, scale: 'minor', wave: 'sawtooth',
      lead: [0, null, 0, 2, 3, null, 2, 0, 4, null, 3, 2, 0, null, null, null, 0, null, 0, 2, 3, null, 4, 5, 4, null, 2, 3, 0, null, null, null],
      bass: [0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 4, null, 0, null, 4, null, 0, null, 4, null, 5, null, 4, null, 0, null, null, null] },
    faro: { tempo: 0.3, base: 196, scale: 'minor', wave: 'triangle',
      lead: [0, null, 4, null, 2, null, 4, 5, 4, null, 2, null, 0, null, null, null, 2, null, 5, null, 4, null, 5, 7, 5, null, 4, null, 2, null, null, null],
      bass: [0, null, null, null, 0, null, null, null, 3, null, null, null, 4, null, null, null, 0, null, null, null, 0, null, null, null, 3, null, null, null, 4, null, null, null] },
    maya_spiaggia: { tempo: 0.22, base: 262, scale: 'major', wave: 'triangle',
      lead: [0, 4, 7, 4, 9, 7, 4, 2, 0, 4, 7, 9, 11, 9, 7, 4, 5, 7, 9, 7, 5, 4, 2, 0, 4, 2, 0, null, 0, null, null, null],
      bass: [0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 4, null, 1, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 0, null] },
    maya_giungla: { tempo: 0.32, base: 196, scale: 'penta', wave: 'sine',
      lead: [0, 2, 3, null, 5, null, 3, 2, 0, null, 3, 5, null, 3, 0, null, 2, 3, 5, 7, null, 5, 3, 0, 3, null, 2, null, 0, null, null, null],
      bass: [0, null, null, 0, null, null, 2, null, 3, null, null, 3, null, null, 0, null, 0, null, null, 0, null, null, 3, null, 2, null, null, 2, null, null, 0, null] },
    maya_villaggio: { tempo: 0.20, base: 294, scale: 'major', wave: 'square',
      lead: [0, 2, 4, 5, 7, 5, 4, 2, 4, 2, 0, 2, 4, null, null, null, 7, 5, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 0, null, null, null],
      bass: [0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 0, null, 4, null, 0, null, 4, null, 3, null, 4, null, 3, null, 4, null, 0, null, 0, null] },
    natale: { tempo: 0.2, base: 330, scale: 'major', wave: 'sine',
      lead: [0, 4, 7, null, 7, 5, 4, null, 2, 5, 9, null, 9, 7, 5, null, 4, 7, 11, null, 11, 9, 7, null, 5, 9, 12, 9, 7, 4, 2, null],
      bass: [0, null, 4, null, 0, null, 4, null, 2, null, 5, null, 2, null, 5, null, 4, null, 7, null, 4, null, 7, null, 2, null, 5, null, 0, null, 4, null] },
  };
  const pitch = (tune, step, octave) => tune.base * octave * Math.pow(2, SCALES[tune.scale][step] / 12);
  function schedule() {
    const tune = TUNES[mood];
    if (!ctx || !tune) return;
    while (nextTime < ctx.currentTime + 0.3) {
      const i = stepNo % tune.lead.length, lead = tune.lead[i], bass = tune.bass[i];
      if (lead !== null) tone(pitch(tune, lead, 1), tune.tempo * 1.6, { type: tune.wave, vol: 0.16, at: nextTime, out: musicGain });
      if (bass !== null) tone(pitch(tune, bass, 0.5), tune.tempo * 2.4, { type: 'triangle', vol: 0.2, at: nextTime, out: musicGain });
      nextTime += tune.tempo; stepNo++;
    }
  }
  function startMusic() {
    clearInterval(timer);
    if (!ctx || soundMuted || !mood) return;
    nextTime = ctx.currentTime + 0.1; stepNo = 0;
    timer = setInterval(schedule, 100);
  }
  function music(name) { if (name === mood) return; mood = name; startMusic(); }
  function stopMusic() { mood = null; clearInterval(timer); }
  function toggleSoundMute() {
    soundMuted = !soundMuted;
    try { localStorage.setItem(SOUND_MUTE_KEY, soundMuted ? '1' : '0'); } catch (err) { /* private mode: just not remembered */ }
    if (master) master.gain.value = soundMuted ? 0 : 0.5;
    if (soundMuted) clearInterval(timer); else startMusic();
    return soundMuted;
  }

  // ---------- reading the lines aloud ----------
  // Every line of the story has its own recorded file in voice/ (made once, on this computer, by
  // scripts/make-voice.js with the Kokoro neural voice). The game only plays those files: nothing is
  // sent anywhere and no robotic browser voice is used. A line without a file gets the usual beep.
  const READ_KEY = 'pernacchia-voce';
  const index = window.AdvVoiceIndex || {}, hasVoice = Object.keys(index).length > 0;
  // same two voices for everybody, played a little faster/higher or slower/lower to tell characters apart
  const SPEED = { fili: 1.12, narr: 1, sindaca: 0.97, cuoca: 1.05, madama: 0.9, gabbiano: 1.3, pappagallo: 1.38, topo: 1.5,
    baccala: 0.93, ammiraglio: 0.86, pirati: 1.04, sbadiglio: 0.9, scheletro: 1.15, finestra: 0.95, tricheco: 0.82, cabina: 0.95, vedetta: 1.12, capitano: 0.88, ciurma: 1 };
  let reading = false, current = null;
  try { reading = localStorage.getItem(READ_KEY) === '1'; } catch (err) { reading = false; }
  const duck = (on) => { if (musicGain) musicGain.gain.value = on ? 0.09 : 0.32; };
  // Plays the recorded voice of `text`. Returns false when nothing will be heard.
  function speak(who, text, onEnd) {
    if (!reading || !hasVoice) return false;
    const id = window.AdvVoiceKey.voiceKey(text);
    if (!index[id]) return false;
    hush();
    const au = new Audio('voice/' + id + '.mp3');
    au.preservesPitch = false; au.playbackRate = SPEED[who] || 1;
    const done = () => { if (current !== au) return; current = null; duck(false); if (onEnd) onEnd(); };
    au.onended = au.onerror = done;
    current = au; duck(true);
    const p = au.play(); if (p && p.catch) p.catch(done);
    return true;
  }
  function hush() { const au = current; current = null; duck(false); if (au) au.pause(); }
  function toggleRead() {
    if (!reading && !hasVoice) return false;
    reading = !reading;
    try { localStorage.setItem(READ_KEY, reading ? '1' : '0'); } catch (err) { /* private mode: just not remembered */ }
    if (!reading) hush();
    return true;
  }

  window.AdvAudio = { unlock, sfx, voice, music, stopMusic, toggleSoundMute, isSoundMuted: () => soundMuted, speak, hush, toggleRead, isReading: () => reading && hasVoice };
})();
