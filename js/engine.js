// What the player sees and touches: drawing, mouse/touch, the verb panel, speech, saving.
// The rules of the adventure live in core.js + story.js; this file is their "screen" (the io object).
(function () {
  'use strict';
  const Core = window.AdvCore, Art = window.AdvArt, Sound = window.AdvAudio;
  const STORIES = {
    pernacchia: window.AdvStory,
    maya: window.AdvStoryMaya,
    natale: window.AdvStoryNatale,
  };
  const MAIN_STORY_COMPLETE_KEY = 'pernacchia-main-story-complete';
  const LANGUAGE_KEY = 'pernacchia-language';
  const PLAYER_NAME_KEY = 'pernacchia-player-name';
  const MESSAGE_DURATION_KEY = 'pernacchia-message-duration';
  const LOCAL_TEST_MODE = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const NEXT_PUBLIC_STORY = { pernacchia: 'maya', maya: 'natale' };
  let currentStoryId = 'pernacchia';
  let mainStoryComplete = false;
  let language = 'it';
  let playerName = '';
  let messageDurationOffset = 0;
  try {
    const sId = localStorage.getItem('pernacchia-current-story');
    if (sId && STORIES[sId]) currentStoryId = sId;
    mainStoryComplete = localStorage.getItem(MAIN_STORY_COMPLETE_KEY) === '1';
    language = localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'it';
    playerName = localStorage.getItem(PLAYER_NAME_KEY) || '';
    const savedDuration = Number(localStorage.getItem(MESSAGE_DURATION_KEY));
    if (Number.isInteger(savedDuration) && savedDuration >= -4 && savedDuration <= 8) messageDurationOffset = savedDuration;
  } catch (err) { playerName = ''; }
  if (!/^[\p{L}\p{M}][\p{L}\p{M} '-]{0,19}$/u.test(playerName.trim())) playerName = '';
  if (currentStoryId === 'maya' && !mainStoryComplete && !LOCAL_TEST_MODE) currentStoryId = 'pernacchia';
  const getStory = () => STORIES[currentStoryId] || window.AdvStory;

  const W = 960, H = 540, SCENE_H = 420, Z = 3; // layout units; the scene is 320 x 140 units, 3 layout units each
  const HD = 2; // real pixels per layout unit: the canvas is 1920 x 1080 and nothing is enlarged afterwards
  const FONT = '"Trebuchet MS", Verdana, sans-serif';
  const mayaTheme = () => currentStoryId === 'maya';
  const winterTheme = () => currentStoryId === 'natale';
  const VERB_TEXT = { look: 'Guarda', take: 'Prendi', use: 'Usa', talk: 'Parla con', open: 'Apri', give: 'Dai', walk: 'Vai verso' };
  const SUPPORT_URL = '';
  let installPrompt = null;

  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  canvas.width = W * HD; canvas.height = H * HD;
  ctx.imageSmoothingQuality = 'high';

  const S = {
    mode: playerName ? 'title' : 'name', t: 0, game: null, fast: false, log: [],
    player: { x: 0, y: 0, dir: 1, walk: 0, target: null, done: null },
    speech: null, choices: null, timers: [], locked: false, hurry: false,
    fade: 1, fadeTarget: 1, fadeDone: null,
    verb: null, held: null, mouse: { x: -1, y: -1 }, invRow: 0, zones: [], confirmNew: false,
    autoChoose: null, reveal: 0, card: null, note: null,
    voiceDownload: null,
    nextStory: null,
    pendingStart: null,
  };
  const NO_GAME = { flag: () => false, has: () => false };
  const nameForm = document.getElementById('name-entry');
  const nameInput = document.getElementById('player-name-input');

  function personalize(value) {
    return playerName ? value.replace(/\b(?:Filippo|Fili)\b/gi, playerName) : value;
  }
  function speechDuration(text, spoken) {
    const base = spoken ? 6 + text.length * 0.13 : Math.min(8, 1.5 + text.length * 0.065);
    return Math.max(1.5, base + messageDurationOffset);
  }
  function adjustMessageDuration(change) {
    const next = Math.max(-4, Math.min(8, messageDurationOffset + change));
    if (next === messageDurationOffset) {
      S.note = { text: next < 0 ? 'Durata minima dei messaggi raggiunta.' : 'Durata massima dei messaggi raggiunta.', left: 3 };
      return;
    }
    messageDurationOffset = next;
    let saved = true;
    try {
      localStorage.setItem(MESSAGE_DURATION_KEY, String(messageDurationOffset));
    } catch (err) {
      saved = false;
    }
    if (S.speech) S.speech.left = Math.max(1.5, S.speech.left + change);
    S.note = saved
      ? { text: 'Durata dei messaggi: ' + (messageDurationOffset > 0 ? '+' : '') + messageDurationOffset + ' secondi.', left: 3 }
      : { text: 'Durata aggiornata, ma non salvata su questo dispositivo.', left: 5 };
  }
  if (playerName) {
    document.title = personalize('Le avventure di Fili');
    const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appTitle) appTitle.content = personalize('Le avventure di Fili');
  }
  function setPlayerName(value) {
    if (typeof value !== 'string') {
      S.note = { text: 'Inserisci un nome valido.', left: 5 };
      return false;
    }
    const name = value.normalize('NFC').trim().replace(/\s+/g, ' ');
    if (!/^[\p{L}\p{M}][\p{L}\p{M} '-]{0,19}$/u.test(name)) {
      S.note = { text: 'Inserisci un nome di 1–20 lettere; puoi usare spazi e trattini.', left: 5 };
      return false;
    }
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name);
    } catch (err) {
      S.note = { text: 'Non riesco a salvare il nome su questo dispositivo.', left: 5 };
      return false;
    }
    playerName = name;
    document.title = personalize('Le avventure di Fili');
    const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appTitle) appTitle.content = personalize('Le avventure di Fili');
    S.mode = 'title';
    nameForm.hidden = true;
    return true;
  }
  nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setPlayerName(nameInput.value);
  });
  if (!playerName) requestAnimationFrame(() => nameInput.focus());

  // ---------- saving ----------
  function getSaveKey(id) {
    return 'pernacchia-save-' + (id || currentStoryId);
  }
  function loadSave(id) {
    const sId = id || currentStoryId;
    const st = STORIES[sId] || window.AdvStory;
    try {
      let raw = localStorage.getItem(getSaveKey(sId));
      if (!raw && sId === 'pernacchia') raw = localStorage.getItem('pernacchia-save');
      const s = JSON.parse(raw);
      return s && s.v === 1 && st && st.rooms[s.state.room] ? s.state : null;
    } catch (err) { return null; }
  }
  function save() {
    if (S.mode !== 'play' || !S.game) return;
    S.game.state.x = Math.round(S.player.x); S.game.state.y = Math.round(S.player.y);
    try {
      localStorage.setItem(getSaveKey(), JSON.stringify({ v: 1, state: S.game.state, storyId: currentStoryId }));
      localStorage.setItem('pernacchia-current-story', currentStoryId);
    } catch (err) { /* private mode: no saving */ }
  }
  function clearSave(id) {
    const sId = id || currentStoryId;
    try {
      localStorage.removeItem(getSaveKey(sId));
      if (sId === 'pernacchia') localStorage.removeItem('pernacchia-save');
    } catch (err) { /* nothing to clear */ }
  }

  // ---------- io: how the story shows things ----------
  const room = () => getStory().rooms[S.game.state.room];
  const hotName = (h) => (typeof h.name === 'function' ? h.name(S.game.g) : h.name);
  function speechSpot(who) {
    const p = S.player;
    if (who === 'fili') return [p.x * Z, (p.y - 36 * playerScale()) * Z];
    if (who === 'narr') return [W / 2, 74];
    const actor = getStory().actors[who] || {};
    const h = S.game.findHotspot(who);
    if (h) return [(h.rect[0] + h.rect[2] / 2) * Z, h.rect[1] * Z - 10];
    if (actor.at) return [actor.at[0] * Z, actor.at[1] * Z];
    return [W / 2, 74];
  }
  function wrap(text, maxW, font) {
    ctx.font = font;
    const lines = []; let line = '';
    for (const word of text.split(' ')) {
      const probe = line ? line + ' ' + word : word;
      if (ctx.measureText(probe).width > maxW && line) { lines.push(line); line = word; } else line = probe;
    }
    if (line) lines.push(line);
    return lines;
  }
  const io = {
    say(who, text) {
      text = personalize(text);
      S.log.push(who + ': ' + text); if (S.log.length > 300) S.log.shift();
      if (S.fast) return Promise.resolve();
      return new Promise((done) => {
        const [x, y] = speechSpot(who);
        const sp = { who, x, y, lines: wrap(text, 460, 'bold 22px ' + FONT), color: (getStory().actors[who] || {}).color || '#fff', left: speechDuration(text, false), age: 0, done };
        S.speech = sp;
        // read aloud: the line stays until the voice has finished (plus a safety limit), else the usual beep and timer
        if (!Sound.speak(who, text, () => {})) Sound.voice(who);
        else sp.left = speechDuration(text, true);
      });
    },
    walkTo(x, y) {
      const [tx, ty] = Core.nearestInPoly(x, y, room().walk);
      if (S.fast) { S.player.x = tx; S.player.y = ty; return Promise.resolve(); }
      return new Promise((done) => { if (S.player.done) S.player.done(); S.player.target = [tx, ty]; S.player.done = done; });
    },
    wait(seconds) { return S.fast ? Promise.resolve() : new Promise((done) => S.timers.push({ left: seconds, done })); },
    choose(list) {
      if (S.fast) return Promise.resolve(S.autoChoose ? S.autoChoose(list) : list[list.length - 1].id);
      return new Promise((done) => { S.choices = { list, done }; });
    },
    async enterRoom(id, x, y) {
      if (!S.fast) await fadeTo(1);
      S.player.x = x; S.player.y = y; S.player.target = null; S.hurry = false;
      Sound.music(getStory().rooms[id].music);
      if (!S.fast) await fadeTo(0); else S.fade = S.fadeTarget = 0;
    },
    sfx: (name) => { if (!S.fast) Sound.sfx(name); },
    changed() { if (S.game && !S.game.isBusy()) save(); },
    lock(on) { S.locked = on; if (!on) { S.verb = null; S.held = null; S.hurry = false; } },
    face(h) { const cx = h.rect[0] + h.rect[2] / 2; if (Math.abs(cx - S.player.x) > 2) S.player.dir = cx > S.player.x ? 1 : -1; },
    // Title card between chapters: goes away by itself or with a click.
    chapter(n, title) {
      if (S.fast) return Promise.resolve();
      Sound.sfx('fanfare');
      return new Promise((done) => { S.card = { n, title, age: 0, done }; });
    },
    async ending() {
      if (currentStoryId === 'pernacchia' && S.game.g.flag('finito')) {
        mainStoryComplete = true;
        try { localStorage.setItem(MAIN_STORY_COMPLETE_KEY, '1'); } catch (err) {}
      }
      if (!S.fast) await fadeTo(1);
      S.mode = 'ending'; clearSave(); Sound.music('taverna'); S.fade = 1; S.fadeTarget = 0;
      const next = !LOCAL_TEST_MODE && NEXT_PUBLIC_STORY[currentStoryId];
      S.nextStory = next ? { id: next, left: 8 } : null;
      if (next) {
        try { localStorage.setItem('pernacchia-current-story', next); } catch (err) {}
      }
    },
  };
  function fadeTo(v) { return new Promise((done) => { if (S.fadeDone) S.fadeDone(); S.fadeTarget = v; S.fadeDone = done; }); }

  function startGame(saved, storyId) {
    if (storyId && STORIES[storyId]) currentStoryId = storyId;
    if (currentStoryId === 'maya' && !mainStoryComplete && !LOCAL_TEST_MODE) {
      currentStoryId = 'pernacchia';
      S.note = { text: 'Completa prima l’avventura del Faro: poi si sbloccherà l’Isola Maya!', left: 5 };
    }
    try { localStorage.setItem('pernacchia-current-story', currentStoryId); } catch (e) {}
    const curStory = getStory();
    S.game = Core.createGame(curStory, io, saved || undefined);
    S.mode = 'play'; S.fade = 1; S.fadeTarget = 1; S.verb = S.held = S.speech = S.choices = S.card = null; S.invRow = 0; S.timers = []; S.nextStory = null; S.pendingStart = null;
    S.player.x = S.game.state.x; S.player.y = S.game.state.y;
    S.game.begin();
  }

  function beginStarting(saved, storyId, clearExisting) {
    const id = storyId || currentStoryId;
    if (!STORIES[id]) return;
    S.pendingStart = { saved, storyId: id, clearExisting, left: 3 };
    S.mode = 'starting';
    Sound.unlock();
  }

  // ---------- update ----------
  function playerScale() { const [y0, s0, y1, s1] = room().scale; const k = Math.max(0, Math.min(1, (S.player.y - y0) / (y1 - y0))); return s0 + (s1 - s0) * k; }
  function update(dt) {
    S.t += dt;
    if (S.fade !== S.fadeTarget) {
      const d = dt * 4; S.fade = S.fade < S.fadeTarget ? Math.min(S.fadeTarget, S.fade + d) : Math.max(S.fadeTarget, S.fade - d);
    }
    if (S.fade === S.fadeTarget && S.fadeDone) { const f = S.fadeDone; S.fadeDone = null; f(); }
    if (S.mode === 'ending' && S.nextStory) {
      S.nextStory.left -= dt;
      if (S.nextStory.left <= 0) {
        const next = S.nextStory.id;
        S.nextStory = null;
        startGame(null, next);
        return;
      }
    }
    if (S.mode === 'starting' && S.pendingStart) {
      S.pendingStart.left -= dt;
      if (S.pendingStart.left <= 0) {
        const pending = S.pendingStart;
        if (pending.clearExisting) clearSave(pending.storyId);
        startGame(pending.saved, pending.storyId);
      }
      return;
    }
    if (S.mode !== 'play') return;
    if (S.reveal > 0) S.reveal -= dt;
    const fl = S.game.state.flags; fl.tempo = (fl.tempo || 0) + dt; // play time, shown at the end
    if (S.card) { S.card.age += dt; if (S.card.age > CARD_TIME) endCard(); }
    const p = S.player;
    if (p.target) {
      const dx = p.target[0] - p.x, dy = p.target[1] - p.y, dist = Math.hypot(dx, dy), stepLen = (S.hurry ? 260 : 95) * playerScale() * dt;
      if (Math.abs(dx) > 0.5) p.dir = dx > 0 ? 1 : -1;
      if (dist <= stepLen) { p.x = p.target[0]; p.y = p.target[1]; p.target = null; p.walk = 0; if (p.done) { const f = p.done; p.done = null; f(); } }
      else { p.x += (dx / dist) * stepLen; p.y += (dy / dist) * stepLen; const before = Math.floor(p.walk * 2); p.walk += dt * 2.2; if (Math.floor(p.walk * 2) !== before) Sound.sfx('step'); }
    }
    if (S.speech) { S.speech.age += dt; S.speech.left -= dt; if (S.speech.left <= 0) endSpeech(); }
    for (const tm of S.timers) tm.left -= dt * (S.hurry ? 3 : 1);
    const due = S.timers.filter((tm) => tm.left <= 0); S.timers = S.timers.filter((tm) => tm.left > 0); due.forEach((tm) => tm.done());
  }
  const CARD_TIME = 4.2;
  function endCard() { const cd = S.card; S.card = null; if (cd) cd.done(); }
  function endSpeech() { const sp = S.speech; S.speech = null; Sound.hush(); if (sp) sp.done(); }
  function toggleRead() {
    Sound.unlock();
    if (language === 'en') {
      S.note = { text: 'Per ora la voce è disponibile solo in italiano.', left: 5 };
      return;
    }
    if (Sound.isReading()) {
      Sound.toggleRead();
      S.note = { text: 'Voce disattivata.', left: 3 };
      return;
    }
    startVoiceDownload();
  }
  function startVoiceDownload() {
    if (S.voiceDownload) return;
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
      S.note = { text: 'Questo browser non permette di preparare le voci per l’ascolto offline.', left: 5 };
      return;
    }
    const ids = Object.keys(window.AdvVoiceIndex || {});
    if (!ids.length) {
      S.note = { text: 'I file della voce non sono disponibili in questa versione.', left: 5 };
      return;
    }
    const requestId = 'voices-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    S.voiceDownload = { requestId, status: 'checking', completed: 0, total: ids.length };
    navigator.serviceWorker.ready.then((registration) => {
      if (!S.voiceDownload || S.voiceDownload.requestId !== requestId) return;
      if (!registration.active) throw new Error('Il servizio offline non è pronto.');
      registration.active.postMessage({
        type: 'download-voices',
        requestId,
        ids,
      });
      S.voiceDownload.status = 'downloading';
    }).catch((err) => {
      if (S.voiceDownload && S.voiceDownload.requestId === requestId) {
        S.voiceDownload.status = 'error';
        S.voiceDownload.message = 'Scaricamento non disponibile. Controlla la connessione e riprova.';
        console.error('Download delle voci non riuscito:', err);
      }
    });
  }
  function cancelVoiceDownload() {
    const download = S.voiceDownload;
    if (!download || download.status === 'cancelled' || download.status === 'error') {
      S.voiceDownload = null;
      return;
    }
    download.status = 'cancelling';
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) registration.active.postMessage({ type: 'cancel-voice-download', requestId: download.requestId });
    }).catch((err) => {
      console.error('Annullamento del download delle voci non riuscito:', err);
    });
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data;
      const download = S.voiceDownload;
      if (!download || !message || message.requestId !== download.requestId) return;
      if (message.type === 'voice-download-progress') {
        download.status = 'downloading';
        download.completed = message.completed;
        download.total = message.total;
      } else if (message.type === 'voice-download-complete') {
        S.voiceDownload = null;
        Sound.toggleRead();
        S.note = { text: 'Voci scaricate: ora posso leggere le frasi.', left: 5 };
      } else if (message.type === 'voice-download-cancelled') {
        download.status = 'cancelled';
        download.completed = message.completed;
      } else if (message.type === 'voice-download-error') {
        download.status = 'error';
        download.message = 'Scaricamento interrotto. Le voci già scaricate sono conservate; puoi riprovare.';
        download.completed = message.completed;
      }
    });
  }
  function toggleLanguage() {
    language = language === 'it' ? 'en' : 'it';
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch (err) {}
    if (language === 'en' && Sound.isReading()) Sound.toggleRead();
    S.note = language === 'en'
      ? { text: 'Modalità English di prova: storia e menu sono ancora in italiano.', left: 5 }
      : { text: 'Lingua italiana selezionata.', left: 3 };
  }
  function drawVoiceDownload() {
    const download = S.voiceDownload;
    if (!download) return;
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mayaTheme() ? '#26352b' : '#241c3e';
    ctx.beginPath(); ctx.roundRect(170, 142, 620, 250, 16); ctx.fill();
    ctx.strokeStyle = mayaTheme() ? '#f0d99c' : '#ffd95a'; ctx.lineWidth = 3; ctx.stroke();
    text('Scaricamento delle voci', W / 2, 184, { size: 30, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 6 });
    const total = download.total || Object.keys(window.AdvVoiceIndex || {}).length;
    const completed = Math.min(download.completed || 0, total);
    const progress = total ? completed / total : 0;
    text('Circa 23 MB · puoi annullare quando vuoi', W / 2, 224, { size: 18, color: '#f5ead1', lw: 4 });
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.roundRect(245, 253, 470, 24, 10); ctx.fill();
    ctx.fillStyle = mayaTheme() ? '#d5b36f' : '#f2c64f';
    if (progress > 0) { ctx.beginPath(); ctx.roundRect(245, 253, Math.max(12, 470 * progress), 24, 10); ctx.fill(); }
    const status = download.status === 'checking' ? 'Controllo dei file già presenti…'
      : download.status === 'cancelling' ? 'Annullamento in corso…'
        : download.status === 'cancelled' ? 'Annullato: i file già scaricati restano disponibili.'
          : download.status === 'error' ? download.message
            : completed + ' di ' + total + ' file (' + Math.round(progress * 100) + '%)';
    text(status, W / 2, 307, { size: 17, color: '#f5ead1', lw: 4 });
    button(365, 337, 230, 42,
      download.status === 'cancelled' || download.status === 'error' ? 'Chiudi' : 'Annulla',
      { fn: cancelVoiceDownload, voiceCancel: true },
      { size: 20 });
  }
  function toggleGameSound() { Sound.unlock(); Sound.toggleSoundMute(); }
  function drawNote() {
    if (!S.note) return;
    ctx.globalAlpha = Math.min(1, S.note.left * 2);
    ctx.font = 'bold 20px ' + FONT;
    const w = ctx.measureText(S.note.text).width + 36;
    ctx.fillStyle = 'rgba(10,6,24,0.85)'; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 22, w, 40, 10); ctx.fill();
    text(S.note.text, W / 2, 43, { size: 20, color: '#ffe066', lw: 4 });
    ctx.globalAlpha = 1;
  }

  // ---------- what is under the pointer ----------
  function hotspotAt(mx, my) {
    if (my >= SCENE_H) return null;
    const x = mx / Z, y = my / Z, list = S.game.hotspots();
    for (let i = list.length - 1; i >= 0; i--) { const r = list[i].rect; if (x >= r[0] - 1 && x <= r[0] + r[2] + 1 && y >= r[1] - 1 && y <= r[1] + r[3] + 1) return list[i]; }
    return null;
  }
  const zoneAt = (mx, my) => { for (let i = S.zones.length - 1; i >= 0; i--) { const z = S.zones[i]; if (mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= z.y + z.h) return z; } return null; };
  const canAct = () => S.mode === 'play' && !S.locked && !S.speech && !S.choices;

  function sentence(hot, zone) {
    const g = S.game, target = hot ? hotName(hot) : zone && zone.item ? g.itemName(zone.item) : '';
    if (S.held) return (S.verb === 'give' ? 'Dai ' : 'Usa ') + g.itemName(S.held) + (S.verb === 'give' ? ' a ' : ' con ') + (target && !(zone && zone.item === S.held) ? target : '...');
    if (S.verb) return VERB_TEXT[S.verb] + ' ' + (target || '...');
    if (hot) return VERB_TEXT[g.defaultVerb(hot)] + ' ' + target;
    if (zone && zone.item) return target;
    return '';
  }

  // ---------- clicks ----------
  function clickItem(id, right) {
    const g = S.game;
    if (right) { g.actItem('look', id); return; }
    if (S.held && S.held !== id) { g.actItem('use', S.held, id); return; }
    if (S.held === id) { g.actItem('use', id); return; }
    if (S.verb && S.verb !== 'use' && S.verb !== 'give') { g.actItem(S.verb, id); return; }
    S.held = id; if (S.verb !== 'give') S.verb = 'use';
  }
  function click(mx, my, right) {
    Sound.unlock();
    const zone = zoneAt(mx, my);
    if (S.voiceDownload) {
      if (zone && zone.voiceCancel) { Sound.sfx('ui'); zone.fn(); }
      return;
    }
    if (S.mode !== 'play') { if (zone && zone.fn) { Sound.sfx('ui'); zone.fn(); } return; }
    if (zone && zone.always) { Sound.sfx('ui'); zone.fn(); return; }
    if (S.card) { if (S.card.age > 0.6) endCard(); return; }
    if (S.speech) { if (S.speech.age > 0.25) endSpeech(); return; }
    if (S.choices) { if (zone && zone.choice) { const ch = S.choices; S.choices = null; Sound.sfx('ui'); ch.done(zone.choice); } return; }
    if (S.locked) { S.hurry = true; return; }
    if (zone) { Sound.sfx('ui'); if (zone.item) clickItem(zone.item, right); else if (zone.fn) zone.fn(); return; }
    if (my >= SCENE_H) return;
    const hot = hotspotAt(mx, my), g = S.game;
    if (hot) {
      if (right) g.act('look', hot.id);
      else if (S.held) g.act(S.verb === 'give' ? 'give' : 'use', hot.id, S.held);
      else if (S.verb) g.act(S.verb, hot.id);
      else g.act(g.defaultVerb(hot), hot.id);
      return;
    }
    if (S.verb || S.held) { S.verb = null; S.held = null; return; }
    const [tx, ty] = Core.nearestInPoly(mx / Z, my / Z, room().walk);
    S.player.target = [tx, ty];
  }

  // ---------- drawing ----------
  function text(str, x, y, o) {
    o = o || {};
    str = personalize(str);
    const font = mayaTheme() ? 'Georgia, "Times New Roman", serif' : FONT;
    ctx.font = (o.bold === false ? '' : 'bold ') + (o.size || 18) + 'px ' + font;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    if (o.outline !== false) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || 5; ctx.strokeStyle = o.stroke || '#000'; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.color || '#fff'; ctx.fillText(str, x, y);
  }
  function button(x, y, w, h, label, zone, o) {
    o = o || {};
    const over = S.mouse.x >= x && S.mouse.x <= x + w && S.mouse.y >= y && S.mouse.y <= y + h;
    const maya = mayaTheme(), winter = winterTheme();
    const help = o.emphasis === 'help';
    ctx.save();
    if (o.disabled) ctx.globalAlpha = 0.55;
    if (help) { ctx.shadowColor = '#ffd95a'; ctx.shadowBlur = over ? 16 : 9; }
    if (maya) {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 7);
      ctx.fillStyle = help ? (over ? '#f3d37e' : '#d5b36f') : o.active ? '#d5b36f' : over ? '#55745a' : '#354b3c'; ctx.fill();
      ctx.strokeStyle = help ? '#fff0b0' : o.active ? '#f0d99c' : '#b99a61'; ctx.lineWidth = help ? 3 : 1.5; ctx.stroke();
      ctx.beginPath(); ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 5);
      ctx.strokeStyle = help ? 'rgba(255,255,255,0.75)' : 'rgba(248,225,171,0.2)'; ctx.lineWidth = help ? 1.25 : 0.75; ctx.stroke();
    } else if (winter) {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8);
      ctx.fillStyle = help ? (over ? '#ffe4a0' : '#f2c64f') : o.active ? '#bd4547' : over ? '#28664e' : '#194a3b'; ctx.fill();
      ctx.strokeStyle = help || o.active ? '#ffe4a0' : '#c79a54'; ctx.lineWidth = help ? 3 : 1.5; ctx.stroke();
    } else {
      ctx.fillStyle = help ? (over ? '#ffe48a' : '#f2c64f') : o.active ? '#e0a030' : over ? '#5a4a7a' : '#3a2f55'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = help ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)'; ctx.fillRect(x, y, w, help ? 4 : 3);
      ctx.fillStyle = help ? '#805c16' : 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + h - (help ? 4 : 3), w, help ? 4 : 3);
      if (help) {
        ctx.strokeStyle = '#fff0ad'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      }
    }
    if (label) text(label, x + w / 2, y + h / 2 + 1, {
      size: o.size || 19, color: help || maya && o.active ? '#342d20' : maya ? '#f3e5c4' : winter && (help || o.active) ? '#fff5db' : o.active ? '#2a1a12' : '#ffe9a8', outline: false,
    });
    ctx.restore();
    S.zones.push(Object.assign({ x, y, w, h }, zone));
  }
  // The pictures use 320 x 140 units: draw them directly at full resolution, cut at the panel edge.
  function inScene(draw) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, SCENE_H); ctx.clip();
    ctx.scale(Z, Z);
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'miter'; ctx.globalAlpha = 1;
    draw(ctx);
    ctx.restore();
  }

  function drawScene() {
    const e = { g: S.game.g, t: S.t, speaker: S.speech ? S.speech.who : null };
    const art = Art.rooms[S.game.state.room], p = S.player;
    const sprites = art.sprites.map((s) => ({ y: s[0], fn: s[1] }));
    sprites.push({ y: p.y, fn: (c) => Art.fili(c, p.x, p.y, playerScale(), p.dir, p.target ? p.walk : undefined, e) });
    sprites.sort((a, b) => a.y - b.y);
    inScene((c) => {
      art.draw(c, e);
      sprites.forEach((s) => s.fn(c, e));
      if (art.overlay) art.overlay(c, e, p.x, p.y);
      Art.finish(c, e, S.game.state.room);
    });
  }
  function drawSpeech() {
    const sp = S.speech; if (!sp) return;
    const lh = 26, hh = sp.lines.length * lh;
    ctx.font = 'bold 22px ' + (mayaTheme() ? 'Georgia, "Times New Roman", serif' : FONT);
    const maxW = Math.max.apply(null, sp.lines.map((l) => ctx.measureText(l).width));
    const x = Math.max(maxW / 2 + 12, Math.min(W - maxW / 2 - 12, sp.x)), y = Math.max(14, Math.min(SCENE_H - hh - 8, sp.y - hh));
    ctx.fillStyle = mayaTheme()
      ? 'rgba(37,48,37,' + (0.8 * Math.min(1, sp.age * 6)) + ')'
      : winterTheme()
        ? 'rgba(20,54,45,' + (0.78 * Math.min(1, sp.age * 6)) + ')'
        : 'rgba(10,6,24,' + (0.5 * Math.min(1, sp.age * 6)) + ')';
    ctx.beginPath(); ctx.roundRect(x - maxW / 2 - 12, y - 5, maxW + 24, hh + 10, 10); ctx.fill();
    if (mayaTheme()) {
      ctx.strokeStyle = 'rgba(213,179,111,0.85)'; ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    sp.lines.forEach((l, i) => text(l, x, y + i * lh + lh / 2, { size: 22, color: sp.color, lw: 6 }));
  }
  function drawCard() {
    const cd = S.card; if (!cd) return;
    const a = Math.min(1, cd.age * 2.5, (CARD_TIME - cd.age) * 2.5);
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = mayaTheme() ? 'rgba(31,43,34,0.88)' : 'rgba(10,6,24,0.86)'; ctx.fillRect(0, 0, W, SCENE_H);
    ctx.fillStyle = mayaTheme() ? '#c8a667' : '#e0a030'; ctx.fillRect(W / 2 - 170, 236, 340, 3);
    text('Capitolo ' + cd.n, W / 2, 196, { size: 30, color: mayaTheme() ? '#d8bd83' : '#ff9e7a', lw: 6 });
    text(cd.title, W / 2, 284, { size: 54, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 10 });
    ctx.globalAlpha = 1;
  }
  // Name tags over everything that can be touched: for small players and for tablets (no mouse hover).
  function drawReveal() {
    if (S.reveal <= 0 || !canAct()) return;
    ctx.globalAlpha = Math.min(1, S.reveal * 2);
    for (const h of S.game.hotspots()) {
      const x = (h.rect[0] + h.rect[2] / 2) * Z, y = Math.max(16, Math.min(SCENE_H - 16, (h.rect[1] + h.rect[3] / 2) * Z));
      text(hotName(h), Math.max(70, Math.min(W - 70, x)), y, { size: 15, color: '#ffe066', lw: 5 });
    }
    ctx.globalAlpha = 1;
  }
  function drawPanel(hot, zone) {
    const g = S.game;
    const pg = ctx.createLinearGradient(0, SCENE_H, 0, H);
    if (mayaTheme()) { pg.addColorStop(0, '#344538'); pg.addColorStop(1, '#202d25'); }
    else if (winterTheme()) { pg.addColorStop(0, '#1d5545'); pg.addColorStop(1, '#102f2d'); }
    else { pg.addColorStop(0, '#241c3e'); pg.addColorStop(1, '#151026'); }
    ctx.fillStyle = pg; ctx.fillRect(0, SCENE_H, W, H - SCENE_H);
    ctx.fillStyle = mayaTheme() ? '#c5a367' : winterTheme() ? '#d9b866' : '#e0a030'; ctx.fillRect(0, SCENE_H, W, 2);
    ctx.fillStyle = mayaTheme() ? '#72805d' : winterTheme() ? '#a4474c' : '#5a4a7a'; ctx.fillRect(0, SCENE_H + 2, W, 1);
    if (S.choices) {
      const n = S.choices.list.length, lh = Math.min(24, 112 / n);
      S.choices.list.forEach((o, i) => {
        const y = SCENE_H + 5 + i * lh, over = S.mouse.y >= y && S.mouse.y < y + lh && S.mouse.y >= SCENE_H;
        text((i + 1) + '.  ' + o.text, 24, y + lh / 2, { size: n > 5 ? 16 : 18, align: 'left', color: over ? '#ffffff' : (mayaTheme() ? '#ead9b5' : '#c9a8ff'), outline: false });
        S.zones.push({ x: 0, y, w: W, h: lh, choice: o.id });
      });
      return;
    }
    const busy = S.locked || S.speech;
    text(busy ? '' : sentence(hot, zone), W / 2, SCENE_H + 15, { size: 18, color: mayaTheme() ? '#e3ca91' : '#ffe066', outline: false });
    ctx.globalAlpha = busy ? 0.45 : 1;
    Core.VERBS.forEach((v, i) => button(10 + (i % 3) * 108, 450 + Math.floor(i / 3) * 44, 104, 40, v.label, { fn: () => { S.verb = S.verb === v.id && !S.held ? null : v.id; S.held = null; } }, { active: S.verb === v.id }));
    const inv = g.state.inv, rows = Math.max(1, Math.ceil(inv.length / 6));
    S.invRow = Math.max(0, Math.min(S.invRow, Math.max(0, rows - 2)));
    for (let i = 0; i < 12; i++) {
      const x = 346 + (i % 6) * 58, y = 450 + Math.floor(i / 6) * 44, id = inv[S.invRow * 6 + i];
      if (mayaTheme()) {
        ctx.beginPath(); ctx.roundRect(x, y, 54, 40, 5);
        ctx.fillStyle = id && S.held === id ? '#c9a55f' : '#42513f'; ctx.fill();
        ctx.strokeStyle = '#88784d'; ctx.lineWidth = 1; ctx.stroke();
      } else {
        ctx.fillStyle = id && S.held === id ? (winterTheme() ? '#bf5650' : '#e0a030') : winterTheme() ? '#174538' : '#2a2244'; ctx.fillRect(x, y, 54, 40);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y, 54, 2);
      }
      if (!id) continue;
      ctx.drawImage(Art.icon(id), x + 11, y + 4, 32, 32);
      if (id === 'dobloni') text(String(g.g.flag('dobloni') || 0), x + 45, y + 30, { size: 14, lw: 3 });
      S.zones.push({ x, y, w: 54, h: 40, item: id });
    }
    if (rows > 2) {
      button(696, 450, 30, 40, '▲', { fn: () => { S.invRow--; } }, { size: 14 });
      button(696, 494, 30, 40, '▼', { fn: () => { S.invRow++; } }, { size: 14 });
    }
    button(736, 450, 105, 40, '💡 Aiuto', { fn: askHint }, { emphasis: 'help' });
    button(845, 450, 105, 40, '👁 Cose', { fn: () => { S.reveal = 4; } });
    ctx.globalAlpha = 1;
    button(736, 494, 42, 40, Sound.isSoundMuted() ? '🔇' : '🎵', { fn: toggleGameSound, always: true });
    button(780, 494, 68, 40, '🗣 Voce', { fn: toggleRead, always: true }, { active: Sound.isReading(), size: 15 });
    button(850, 494, 32, 40, '−', { fn: () => adjustMessageDuration(-1), always: true }, { size: 23 });
    button(884, 494, 32, 40, '+', { fn: () => adjustMessageDuration(1), always: true }, { size: 22 });
    button(918, 494, 34, 40, '☰', { fn: () => { S.mode = 'menu'; }, always: true }, { size: 16 });
  }
  function askHint() { const fl = S.game.state.flags; fl.aiuti = (fl.aiuti || 0) + 1; S.game.hint(); }
  function drawBackdrop(lit) {
    if (currentStoryId === 'maya' && Art.maya_backdrop) {
      inScene((c) => Art.maya_backdrop(c, { g: NO_GAME, t: S.t, speaker: null }, lit));
    } else if (currentStoryId === 'natale' && Art.rooms.natale_piazza) {
      inScene((c) => Art.rooms.natale_piazza.draw(c, { g: NO_GAME, t: S.t, speaker: null }));
    } else {
      inScene((c) => Art.island(c, { g: NO_GAME, t: S.t, speaker: null }, lit));
    }
    ctx.fillStyle = mayaTheme() ? '#202d25' : winterTheme() ? '#10372e' : '#1c1630'; ctx.fillRect(0, SCENE_H, W, H - SCENE_H);
    ctx.fillStyle = mayaTheme() ? '#c5a367' : winterTheme() ? '#d9b866' : '#5a4a7a'; ctx.fillRect(0, SCENE_H, W, 2);
  }

  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else if (canvas.parentElement.requestFullscreen) canvas.parentElement.requestFullscreen(); }

  function selectStory(id) {
    if (!STORIES[id]) return;
    if (currentStoryId === id) return;
    if (id === 'maya' && !mainStoryComplete && !LOCAL_TEST_MODE) {
      S.note = { text: 'Completa prima l’avventura del Faro: poi si sbloccherà l’Isola Maya!', left: 5 };
      return;
    }
    currentStoryId = id;
    S.confirmNew = false;
    try { localStorage.setItem('pernacchia-current-story', currentStoryId); } catch (e) {}
  }

  function publicGameUrl() {
    return location.protocol === 'https:' ? new URL('./', location.href).href : null;
  }
  function shareMessage(url) {
    return personalize('Ti consiglio questo gioco gratuito: Fili e le sue avventure! ') + url;
  }
  function shareGame(destination) {
    const url = publicGameUrl();
    if (!url) {
      S.note = { text: 'Condivisione disponibile dopo la pubblicazione su un sito sicuro.', left: 5 };
      return;
    }
    const title = personalize('Fili: Isola Pernacchia e Isola Maya');
    const message = shareMessage(url);
    if (destination === 'email') {
      location.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(message);
    } else if (destination === 'whatsapp') {
      window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    }
  }

  function installGame() {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      S.note = { text: 'Completa l’installazione dalla finestra del browser.', left: 30 };
      prompt.prompt().then(() => prompt.userChoice).then((choice) => {
        if (choice.outcome === 'dismissed') S.note = { text: 'Installazione annullata; puoi farla quando vuoi.', left: 4 };
        else S.note = { text: 'Richiesta confermata: attendo la fine dell’installazione.', left: 8 };
      }).catch(() => {
        S.note = { text: 'Non riesco ad avviare l’installazione da questo browser.', left: 5 };
      });
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const text = standalone ? 'Il gioco è già installato su questo dispositivo.'
      : isIos ? 'Su iPhone/iPad: Condividi, poi “Aggiungi alla schermata Home”.'
        : 'Usa il menu del browser e scegli “Installa app” o “Aggiungi a schermata Home”.';
    S.note = { text, left: 6 };
  }
  function closeGame() {
    S.mode = 'exit';
    window.close();
  }

  function drawTitle() {
    nameForm.hidden = true;
    drawBackdrop(false);
    // Story Selector Tabs
    if (LOCAL_TEST_MODE) {
      button(116, 24, 230, 44, '🏝️ Faro di Pernacchia', { fn: () => selectStory('pernacchia') }, { active: currentStoryId === 'pernacchia', size: 17 });
      button(365, 24, 230, 44, '🌴 Isola Maya', { fn: () => selectStory('maya') }, { active: currentStoryId === 'maya', disabled: !mainStoryComplete, size: 17 });
      button(614, 24, 230, 44, '🎄 Natale che nevica', { fn: () => selectStory('natale') }, { active: currentStoryId === 'natale', size: 17 });
    }

    if (currentStoryId === 'maya') {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(100, 112, 760, 282, 20);
      ctx.fillStyle = 'rgba(32,47,37,0.68)'; ctx.fill();
      ctx.strokeStyle = 'rgba(213,179,111,0.82)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.roundRect(108, 120, 744, 266, 15);
      ctx.strokeStyle = 'rgba(243,225,177,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#d5b36f';
      for (const x of [126, 834]) {
        ctx.beginPath(); ctx.moveTo(x, 136); ctx.lineTo(x + 5, 141); ctx.lineTo(x, 146); ctx.lineTo(x - 5, 141); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, 361); ctx.lineTo(x + 5, 366); ctx.lineTo(x, 371); ctx.lineTo(x - 5, 366); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      text('Fili e l\'Isola Maya', W / 2, 224, { size: 60, color: '#f0d99c', lw: 8, stroke: '#27362c' });
      text('Il Mistero del Vulcano Pernacchione', W / 2, 294, { size: 34, color: '#dbb77a', lw: 6, stroke: '#27362c' });
      text('Un’avventura comica ai tempi dei Maya', W / 2, 350, { size: 21, color: '#f0e2c1', lw: 4, stroke: '#27362c' });
    } else if (winterTheme()) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(100, 112, 760, 282, 20);
      ctx.fillStyle = 'rgba(17,63,50,0.78)'; ctx.fill();
      ctx.strokeStyle = 'rgba(246,215,144,0.9)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.roundRect(108, 120, 744, 266, 15);
      ctx.strokeStyle = 'rgba(255,255,255,0.26)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      text('Fili e il Natale', W / 2, 218, { size: 62, color: '#fff0bd', lw: 9, stroke: '#174538' });
      text('che rischiava di sciogliersi', W / 2, 287, { size: 39, color: '#ffcf73', lw: 7, stroke: '#174538' });
      text('Una Vigilia tra neve, biscotti e stelle', W / 2, 350, { size: 22, color: '#f6f0de', lw: 4, stroke: '#174538' });
    } else {
      text('Fili e il Faro', W / 2, 230, { size: 64, color: '#ffe066', lw: 10 });
      text('di Isola Pernacchia', W / 2, 296, { size: 40, color: '#ff9e7a', lw: 8 });
      text('Clicca per camminare, guardare e parlare. Tasto destro: guarda.', W / 2, 356, { size: 17, color: '#d8d0ff', lw: 4 });
    }

    const saved = loadSave();
    if (saved) button(250, 438, 220, 56, '▶ Continua', { fn: () => beginStarting(saved, currentStoryId, false) }, { size: 24 });
    button(saved ? 490 : 370, 438, 220, 56, S.confirmNew ? 'Sicuro? Da capo!' : 'Nuova partita', {
      fn: () => {
        if (saved && !S.confirmNew) S.confirmNew = true;
        else { S.confirmNew = false; beginStarting(null, currentStoryId, true); }
      },
    }, { size: 22 });
    button(290, 498, 180, 30, '⬇ Installa', { fn: installGame }, { size: 14 });
    button(490, 498, 180, 30, language === 'it' ? '🌐 Lingua: IT' : '🌐 English (test)', { fn: toggleLanguage }, { size: 14 });
    button(10, 14, 38, 38, '', { fn: () => { S.mode = 'support'; } });
    ctx.save();
    ctx.strokeStyle = '#fff0bd'; ctx.fillStyle = '#fff0bd';
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(24, 33); ctx.lineTo(35, 25);
    ctx.moveTo(24, 33); ctx.lineTo(35, 41);
    ctx.stroke();
    for (const [x, y] of [[23, 33], [36, 24], [36, 42]]) {
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    button(912, 14, 38, 38, '✕', { fn: closeGame }, { size: 22 });
    if (!mainStoryComplete && !LOCAL_TEST_MODE && !winterTheme()) text('Completa il Faro per sbloccare l’Isola Maya', W / 2, 370, { size: 16, color: '#ffe9a8', lw: 4 });
  }

  function drawNameEntry() {
    nameForm.hidden = false;
    drawBackdrop(false);
    ctx.fillStyle = 'rgba(17,63,50,0.82)';
    ctx.beginPath(); ctx.roundRect(110, 150, 740, 238, 18); ctx.fill();
    ctx.strokeStyle = '#f6d790'; ctx.lineWidth = 2; ctx.stroke();
    text('Benvenuto nelle avventure!', W / 2, 205, { size: 37, color: '#fff0bd', lw: 7, stroke: '#174538' });
    text('Prima di iniziare, scegli il nome del protagonista.', W / 2, 248, { size: 21, color: '#f6f0de', lw: 5, stroke: '#174538' });
  }

  function drawStarting() {
    nameForm.hidden = true;
    drawBackdrop(false);
    ctx.fillStyle = winterTheme() ? 'rgba(17,63,50,0.82)' : mayaTheme() ? 'rgba(32,47,37,0.82)' : 'rgba(10,6,24,0.78)';
    ctx.beginPath(); ctx.roundRect(110, 130, 740, 286, 18); ctx.fill();
    ctx.strokeStyle = winterTheme() ? '#f6d790' : mayaTheme() ? '#d5b36f' : '#ffd95a'; ctx.lineWidth = 2; ctx.stroke();
    text('Per supportare ulteriormente lo sviluppo del gioco', W / 2, 192, { size: 25, color: winterTheme() ? '#fff0bd' : '#ffcc80', lw: 5 });
    text('e di altri giochi in futuro', W / 2, 232, { size: 25, color: winterTheme() ? '#fff0bd' : '#ffcc80', lw: 5 });
    button(190, 315, 260, 52, '☕ Offrimi un caffè', { fn: () => {
      if (SUPPORT_URL) window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer');
      else S.note = { text: 'Il link per offrire un caffè sarà aggiunto più avanti.', left: 5 };
    } }, { size: 17, disabled: !SUPPORT_URL });
    button(474, 315, 296, 52, '', { fn: () => { S.note = { text: 'La pubblicità sarà disponibile solo dopo aver scelto un servizio.', left: 5 }; } }, { disabled: true });
    ctx.save();
    ctx.strokeStyle = winterTheme() ? '#fff0bd' : mayaTheme() ? '#f3e5c4' : '#ffe9a8';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(490, 328, 31, 24, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(500, 324); ctx.lineTo(511, 324); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(501, 335); ctx.lineTo(501, 345); ctx.lineTo(510, 340); ctx.closePath(); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    ctx.restore();
    text('Guarda pubblicità', 643, 334, { size: 15, color: winterTheme() ? '#fff5db' : '#ffe9a8', lw: 3 });
    text('per supportarmi', 643, 352, { size: 15, color: winterTheme() ? '#fff5db' : '#ffe9a8', lw: 3 });
  }

  function drawSupport() {
    drawBackdrop(false);
    ctx.fillStyle = mayaTheme() ? 'rgba(24,36,28,0.9)' : 'rgba(10,6,24,0.9)';
    ctx.beginPath(); ctx.roundRect(120, 55, 720, 425, 18); ctx.fill();
    ctx.strokeStyle = mayaTheme() ? '#c5a367' : '#8874a8'; ctx.lineWidth = 2; ctx.stroke();
    text('Condividi', W / 2, 94, { size: 38, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 7 });
    text('Scegli tu se e come condividere: nulla parte da solo.', W / 2, 137, { size: 19, color: '#f5ead1', lw: 4 });
    button(195, 176, 270, 56, 'WhatsApp', { fn: () => shareGame('whatsapp') }, { size: 20 });
    drawShareOptionIcon('message', 227, 204);
    button(495, 176, 270, 56, 'Email', { fn: () => shareGame('email') }, { size: 20 });
    drawShareOptionIcon('email', 527, 204);
    button(370, 354, 220, 48, '← Torna al gioco', { fn: () => { S.mode = 'title'; } }, { size: 19 });
  }

  function drawShareOptionIcon(type, x, y) {
    ctx.save();
    ctx.strokeStyle = '#fff0bd';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    if (type === 'email') {
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 9, 26, 18, 3);
      ctx.moveTo(x - 12, y - 8); ctx.lineTo(x, y + 1); ctx.lineTo(x + 12, y - 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 10, 26, 18, 6);
      ctx.moveTo(x - 7, y + 8); ctx.lineTo(x - 10, y + 12); ctx.lineTo(x, y + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 4); ctx.lineTo(x - 1, y + 1); ctx.lineTo(x + 4, y + 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawExit() {
    drawBackdrop(false);
    text('Gioco chiuso', W / 2, 220, { size: 52, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 9 });
    text('Se questa finestra è ancora aperta, chiudi la scheda o l’app dal dispositivo.', W / 2, 290, { size: 20, color: '#f5ead1', lw: 5 });
    button(370, 390, 220, 54, 'Torna al gioco', { fn: () => { S.mode = 'title'; } }, { size: 21 });
  }

  function drawEnding() {
    drawBackdrop(true);
    const fl = S.game ? S.game.state.flags : {}, sec = Math.round(fl.tempo || 0), help = fl.aiuti || 0;
    text('FINE', W / 2, 140, { size: 96, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 12 });
    if (currentStoryId === 'maya') {
      text('Il Vulcano Pernacchione ha fatto la sua titanica pernacchia!', W / 2, 220, { size: 25, color: '#f5ead1', lw: 6, stroke: '#27362c' });
      text('Bravissimo Fili, Nobile Signore del Cacao e Amico della Giungla Maya!', W / 2, 260, { size: 22, color: '#d8bd83', lw: 5, stroke: '#27362c' });
    } else if (currentStoryId === 'natale') {
      text('La pioggia è finita: i regali sono in viaggio con Babbo Natale!', W / 2, 220, { size: 25, color: '#f5ead1', lw: 6, stroke: '#174538' });
      text('Buon Natale, Fili: hai salvato la Vigilia!', W / 2, 260, { size: 22, color: '#ffcf73', lw: 5, stroke: '#174538' });
    } else {
      text('Il faro è acceso e la nave nera non ruberà più nessuna luce!', W / 2, 220, { size: 25, color: '#ffffff', lw: 6 });
      text('Bravissimo, Guardiano Onorario del Faro.', W / 2, 260, { size: 22, color: '#ff9e7a', lw: 5 });
    }
    text('⏱ ' + Math.floor(sec / 60) + ' min ' + (sec % 60) + ' s     💡 ' + (help === 0 ? 'nessun aiuto: che testa!' : help === 1 ? '1 aiuto' : help + ' aiuti') + '     🎒 ' + Object.keys(getStory().items).length + ' oggetti nella storia', W / 2, 314, { size: 19, color: mayaTheme() ? '#f0e2c1' : '#ffe9a8', lw: 5 });
    text('Storia, disegni e musica: tutti fatti di codice, nessun file scaricato.', W / 2, 374, { size: 16, color: mayaTheme() ? '#ead9b5' : '#d8d0ff', lw: 4 });
    if (S.nextStory) {
      text('La prossima avventura inizia tra ' + Math.ceil(S.nextStory.left) + ' secondi', W / 2, 414, { size: 17, color: '#f5ead1', lw: 4 });
      button(370, 452, 220, 56, 'Prosegui subito', { fn: () => { const next = S.nextStory.id; S.nextStory = null; startGame(null, next); } }, { size: 21 });
    } else {
      button(370, 452, 220, 56, 'Torna al titolo', { fn: () => { S.mode = 'title'; } }, { size: 22 });
    }
  }

  function drawMenu() {
    ctx.fillStyle = mayaTheme() ? 'rgba(24,36,28,0.84)' : 'rgba(10,6,24,0.8)'; ctx.fillRect(0, 0, W, H);
    text('Pausa', W / 2, 76, { size: 44, color: mayaTheme() ? '#f0d99c' : '#ffe066', lw: 8 });
    const items = [
      ['▶ Riprendi', () => { S.mode = 'play'; S.confirmNew = false; }],
      [Sound.isSoundMuted() ? '🔇 Musica ed effetti spenti' : '🎵 Musica ed effetti accesi', toggleGameSound],
      [Sound.isReading() ? '🗣 Frasi lette: sì' : '🗣 Frasi lette: no', toggleRead],
      ['⛶ Schermo intero', toggleFull],
      [language === 'it' ? '🌐 Lingua: Italiano' : '🌐 Language: English (test)', toggleLanguage],
      ['🌴 Cambia storia (salva ed esci)', () => { S.mode = 'title'; }],
      ['Torna al titolo (salva)', () => location.reload()],
      [S.confirmNew ? 'Sicuro? Cancella tutto!' : 'Ricomincia da capo', () => { if (!S.confirmNew) S.confirmNew = true; else { clearSave(); location.reload(); } }],
    ];
    items.forEach((it, i) => button(310, 114 + i * 50, 340, 42, it[0], { fn: it[1] }, { size: 20 }));
    text('Verbo + cosa = azione.  Oggetto + oggetto = combinazione.  💡 = consiglio.', W / 2, 495, { size: 17, color: mayaTheme() ? '#ead9b5' : '#d8d0ff', lw: 4 });
  }
  function render() {
    ctx.setTransform(HD, 0, 0, HD, 0, 0);
    S.zones = [];
    if (S.mode === 'name') drawNameEntry();
    else if (S.mode === 'title') drawTitle();
    else if (S.mode === 'support') drawSupport();
    else if (S.mode === 'exit') drawExit();
    else if (S.mode === 'starting') drawStarting();
    else if (S.mode === 'ending') drawEnding();
    else {
      drawScene();
      const hot = canAct() ? hotspotAt(S.mouse.x, S.mouse.y) : null;
      drawReveal();
      drawSpeech();
      drawCard();
      S.zones = [];
      drawPanel(hot, null);
      const zone = zoneAt(S.mouse.x, S.mouse.y);
      if (zone && !S.choices && canAct()) { // repaint the sentence line with what is under the pointer
        ctx.fillStyle = mayaTheme() ? '#2b3a2f' : '#231b3c'; ctx.fillRect(0, SCENE_H + 3, W, 25);
        text(sentence(hot, zone), W / 2, SCENE_H + 15, { size: 18, color: mayaTheme() ? '#e3ca91' : '#ffe066', outline: false });
      }
      canvas.style.cursor = hot || zone ? 'pointer' : 'crosshair';
      if (S.mode === 'menu') { S.zones = []; drawMenu(); }
    }
    if (S.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + S.fade + ')'; ctx.fillRect(0, 0, W, S.mode === 'play' ? SCENE_H : H); }
    drawVoiceDownload();
    drawNote();
  }

  // ---------- input ----------
  function toCanvas(ev) { const r = canvas.getBoundingClientRect(); return [((ev.clientX - r.left) * W) / r.width, ((ev.clientY - r.top) * H) / r.height]; }
  canvas.addEventListener('pointermove', (ev) => { const [x, y] = toCanvas(ev); S.mouse.x = x; S.mouse.y = y; });
  canvas.addEventListener('pointerdown', (ev) => { const [x, y] = toCanvas(ev); S.mouse.x = x; S.mouse.y = y; click(x, y, ev.button === 2); ev.preventDefault(); });
  canvas.addEventListener('pointerleave', () => { S.mouse.x = S.mouse.y = -1; });
  canvas.addEventListener('contextmenu',(ev) => ev.preventDefault());
  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    if (S.voiceDownload) {
      if (k === 'escape') { cancelVoiceDownload(); ev.preventDefault(); }
      return;
    }
    if (k === 'm') toggleGameSound();
    else if (k === 'v') toggleRead();
    else if (k === 'f') toggleFull();
    else if (k === 'escape') {
      if (S.mode === 'play') S.mode = 'menu';
      else if (S.mode === 'menu') S.mode = 'play';
      else if (S.mode === 'support' || S.mode === 'exit') S.mode = 'title';
    }
    else if (S.mode !== 'play') return;
    else if ((k === ' ' || k === 'enter') && S.card) { endCard(); ev.preventDefault(); }
    else if ((k === ' ' || k === 'enter') && S.speech) { endSpeech(); ev.preventDefault(); }
    else if (S.choices && k >= '1' && k <= '9') { const o = S.choices.list[Number(k) - 1]; if (o) { const ch = S.choices; S.choices = null; ch.done(o.id); } }
    else if (k === 'h' && canAct()) askHint();
    else if (k === 'c') S.reveal = 4;
  });
  window.addEventListener('beforeunload', () => { if (S.game && !S.game.isBusy()) save(); });

  // ---------- main loop ----------
  let last = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0); last = now;
    if (S.note && (S.note.left -= dt) <= 0) S.note = null;
    if (S.mode !== 'menu') update(dt);
    render();
    requestAnimationFrame(frame);
  }
  S.fade = 0; S.fadeTarget = 0;
  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    installPrompt = ev;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    S.note = { text: 'Gioco installato! Lo trovi tra le app del dispositivo.', left: 5 };
  });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && S.mode !== 'play' && S.mode !== 'menu') location.reload();
    });
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.error('Registrazione della modalità offline non riuscita:', err);
    });
  }
  requestAnimationFrame(frame);

  // Handle for automatic tests: advance time by hand, skip waits, act without the mouse.
  window.__adv = {
    S, getStory, selectStory, start: startGame, beginStarting, clearSave, loadSave, click, installGame,
    setPlayerName, playerName: () => playerName, personalize, adjustMessageDuration,
    messageDurationOffset: () => messageDurationOffset, speechDuration,
    toggleLanguage, toggleRead, end: io.ending, language: () => language, mainStoryComplete: () => mainStoryComplete,
    currentStoryId: () => currentStoryId,
    localTestMode: () => LOCAL_TEST_MODE,
    storySelectorVisible: () => LOCAL_TEST_MODE,
    advance(dt) { update(dt); },
    step(dt, times) { for (let i = 0; i < (times || 1); i++) update(dt); render(); },
    fast(on) { S.fast = on; },
    act: (verb, id, item) => S.game.act(verb, id, item),
    actItem: (verb, id, other) => S.game.actItem(verb, id, other),
  };
})();
