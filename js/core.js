// Adventure logic with no graphics: state, inventory, flags and the "verb + thing" dispatcher.
// The same file runs in the browser (window.AdvCore) and in the node tests (module.exports).
// Everything visible (speech, walking, menus) goes through the `io` object given by the caller.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.AdvCore = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERBS = [
    { id: 'look', label: 'Guarda' }, { id: 'take', label: 'Prendi' }, { id: 'use', label: 'Usa' },
    { id: 'talk', label: 'Parla' }, { id: 'open', label: 'Apri' }, { id: 'give', label: 'Dai' },
  ];

  // Lines used when the story has no specific answer for an action.
  const FALLBACK = {
    look: ['Niente di speciale.', 'Sì, è proprio quello che sembra.', "L'ho guardato bene. Lui non ha guardato me."],
    take: ['Non posso prenderlo.', 'Non mi entra nelle tasche.', 'Meglio di no. Ho già abbastanza cianfrusaglie.'],
    use: ['Non saprei come usarlo.', 'Non funziona.', 'Ci ho provato. Nella mia testa. Non funziona.'],
    talk: ['Non credo che mi risponderebbe.', 'Ciao! ...Niente. Lo sapevo.'],
    open: ['Non si apre.', "Non c'è niente da aprire."],
    give: ['Non credo che lo voglia.', 'Meglio che me lo tenga.'],
    useWith: ['Non funzionano insieme.', 'Bella idea. Ma no.', 'Così non combino niente.'],
  };

  // ---------- geometry of the walkable area (a polygon as [[x, y], ...]) ----------
  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function nearestInPoly(x, y, poly) {
    if (pointInPoly(x, y, poly)) return [x, y];
    let best = null, bestD = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, ay] = poly[j], [bx, by] = poly[i];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      const px = ax + t * dx, py = ay + t * dy, d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bestD) { bestD = d; best = [px, py]; }
    }
    // nudge one pixel towards the centre so the point is safely inside
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const len = Math.hypot(cx - best[0], cy - best[1]) || 1;
    return [best[0] + (cx - best[0]) / len, best[1] + (cy - best[1]) / len];
  }

  // ---------- game ----------
  function createGame(story, io, saved) {
    const state = saved ? JSON.parse(JSON.stringify(saved))
      : { room: story.start.room, x: story.start.x, y: story.start.y, flags: {}, inv: [] };
    let busy = false, fallbackCount = 0;
    const changed = () => { if (io.changed) io.changed(); };

    const g = {
      state,
      flag: (k) => state.flags[k],
      set(k, v) { state.flags[k] = v === undefined ? true : v; changed(); },
      has: (item) => state.inv.includes(item),
      add(item) { if (!state.inv.includes(item)) { state.inv.push(item); io.sfx('pick'); changed(); } },
      remove(item) { const i = state.inv.indexOf(item); if (i >= 0) { state.inv.splice(i, 1); changed(); } },
      swap(from, to) { const i = state.inv.indexOf(from); if (i >= 0) state.inv[i] = to; else state.inv.push(to); changed(); },
      say: (text) => io.say('fili', text),
      npc: (who, text) => io.say(who, text),
      narrate: (text) => io.say('narr', text),
      walk: (x, y) => io.walkTo(x, y),
      wait: (seconds) => io.wait(seconds),
      sfx: (name) => io.sfx(name),
      ending: () => (io.ending ? io.ending() : undefined),
      chapter: (n, title) => (io.chapter ? io.chapter(n, title) : undefined), // title card between chapters
      async goto(room, x, y) {
        state.room = room; state.x = x; state.y = y;
        await io.enterRoom(room, x, y);
        changed();
        const r = story.rooms[room];
        if (r.enter) await r.enter(g);
      },
      // One question: returns the id of the chosen option.
      choose: (options) => io.choose(options.filter((o) => !o.if || o.if(g))),
      // A whole conversation: keeps asking until an option with `end` is chosen.
      // Options with `once` disappear for good after being used (remembered in the flags).
      async dialog(options) {
        for (;;) {
          const list = options.filter((o) => (!o.if || o.if(g)) && !(o.once && state.flags['detto_' + o.id]));
          if (!list.length) return;
          const id = await io.choose(list);
          const o = list.find((x) => x.id === id) || list[list.length - 1];
          if (o.once) state.flags['detto_' + o.id] = true;
          if (!o.silent) await g.say(o.text);
          if (o.run) await o.run(g);
          if (o.end) return;
        }
      },
    };

    const room = () => story.rooms[state.room];
    const hotspots = () => room().hotspots.filter((h) => !h.show || h.show(g));
    const findHotspot = (id) => hotspots().find((h) => h.id === id);
    const itemName = (id) => { const n = story.items[id].name; return typeof n === 'function' ? n(g) : n; };
    const fallback = (kind) => { const list = FALLBACK[kind]; return list[fallbackCount++ % list.length]; };

    async function run(handler) {
      if (typeof handler === 'function') return handler(g);
      if (Array.isArray(handler)) { for (const line of handler) await g.say(line); return undefined; }
      return g.say(handler);
    }
    async function useExit(h) {
      if (h.canExit && !(await h.canExit(g))) return;
      io.sfx('door');
      await g.goto(h.exit.to, h.exit.x, h.exit.y);
    }
    async function onHotspot(verb, id, item) {
      const h = findHotspot(id);
      if (!h) return;
      if (verb !== 'look') await io.walkTo(h.at[0], h.at[1]);
      if (io.face) io.face(h);
      if (verb === 'walk') { if (h.exit) await useExit(h); return; }
      if (item) {
        const fn = h.useWith && h.useWith[item];
        await (fn ? run(fn) : g.say(h.npc ? fallback('give') : fallback('useWith')));
        return;
      }
      if (h[verb] !== undefined) { await run(h[verb]); return; }
      if (h.exit && (verb === 'use' || verb === 'open')) { await useExit(h); return; }
      await g.say(fallback(verb === 'talk' && h.npc ? 'use' : verb));
    }
    async function onItem(verb, id, other) {
      const it = story.items[id];
      if (other) {
        const fn = story.combos[[id, other].sort().join('+')];
        await (fn ? run(fn) : g.say(fallback('useWith')));
        return;
      }
      if (verb === 'take') { await g.say("Ce l'ho già in tasca."); return; }
      const handler = it[verb] !== undefined ? it[verb] : (verb === 'open' ? it.use : undefined);
      await (handler !== undefined ? run(handler) : g.say(fallback(verb)));
    }
    async function locked(fn) {
      if (busy) return false;
      busy = true;
      if (io.lock) io.lock(true);
      try { await fn(); } finally { busy = false; if (io.lock) io.lock(false); changed(); }
      return true;
    }

    return {
      g, state, story, hotspots, findHotspot, itemName,
      isBusy: () => busy,
      begin: () => locked(() => g.goto(state.room, state.x, state.y)),
      // verb on something in the room; `item` = inventory item used on / given to it
      act: (verb, hotspotId, item) => locked(() => onHotspot(verb, hotspotId, item)),
      // verb on an inventory item; `other` = second inventory item to combine with
      actItem: (verb, itemId, other) => locked(() => onItem(verb, itemId, other)),
      hint: () => locked(() => io.say('narr', '💡 ' + story.hint(g))),
      // What a plain click does on a hotspot when no verb is selected.
      defaultVerb(h) {
        if (h.exit) return 'walk';
        if (h.npc) return 'talk';
        if (h.take !== undefined && h.pick) return 'take';
        return 'look';
      },
    };
  }

  return { VERBS, createGame, pointInPoly, nearestInPoly };
});
