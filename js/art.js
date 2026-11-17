// All the pictures of the game, drawn by code in a 320 x 140 grid of units.
// The engine draws them straight at full resolution (6 real pixels per unit), so shapes stay smooth.
// No image files: every scene, character and inventory icon is made of rectangles and shapes.
// `e` = { g: game api (flags / inventory), t: seconds, speaker: who is talking now }.
(function () {
  'use strict';

  // ---------- drawing helpers ----------
  function polygon(c, pts, color) {
    c.fillStyle = color; c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath(); c.fill();
  }
  function facets(c, x, y, w, h, rounded) {
    const size = Math.min(4, Math.min(w, h) * 0.42);
    if (size < 1.25 || w * h < 16) return;
    c.save(); c.beginPath();
    if (rounded && c.roundRect) c.roundRect(x, y, w, h, Math.min(1.5, Math.min(w, h) * 0.3));
    else c.rect(x, y, w, h);
    c.clip();
    polygon(c, [[x, y], [x + size, y], [x, y + size]], 'rgba(255,255,255,0.12)');
    polygon(c, [[x + w, y + h], [x + w - size, y + h], [x + w, y + h - size]], 'rgba(0,0,20,0.12)');
    c.restore();
  }
  function finishShape(c, trace, x, y, w, h) {
    if (w < 2 || h < 2 || w * h < 20 || w * h > 5000) return;
    c.save(); c.beginPath(); trace(); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(x, y, w, h);
    c.restore();
    c.save(); c.beginPath(); trace();
    c.strokeStyle = 'rgba(12,16,24,0.14)';
    c.lineWidth = Math.min(0.35, Math.min(w, h) * 0.025);
    c.stroke(); c.restore();
  }
  // Rectangle. Small ones get soft corners (people, objects); big surfaces (walls, floors, sea) stay square.
  const R = (c, col, x, y, w, h) => {
    c.fillStyle = col; x = Math.round(x); y = Math.round(y);
    const m = Math.min(w, h);
    if (m > 0 && Math.max(w, h) <= 24 && c.roundRect) {
      const radius = Math.min(1.5, m * 0.3);
      c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
      if (m >= 3) { // light from the top left, shade at the bottom right
        const g = c.createLinearGradient(x, y, x + w * 0.35, y + h);
        g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,20,0.20)');
        c.fillStyle = g; c.fill();
      }
    } else c.fillRect(x, y, w, h);
    facets(c, x, y, w, h, m > 0 && Math.max(w, h) <= 24);
    finishShape(c, () => {
      if (m > 0 && Math.max(w, h) <= 24 && c.roundRect) c.roundRect(x, y, w, h, Math.min(1.5, m * 0.3));
      else c.rect(x, y, w, h);
    }, x, y, w, h);
  };
  const B = (c, col, x, y, w, h) => {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = col; c.fillRect(x, y, w, h);
    facets(c, x, y, w, h, false);
    finishShape(c, () => c.rect(x, y, w, h), x, y, w, h);
  }; // always square: pieces stacked into one shape
  const E = (c, col, x, y, rx, ry) => {
    ry = ry === undefined ? rx : ry;
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
    finishShape(c, () => { c.ellipse(x, y, rx, ry, 0, 0, 7); }, x - rx, y - ry, rx * 2, ry * 2);
    const size = Math.min(2.5, rx * 0.55, ry * 0.55);
    if (size < 1.2) return;
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.clip();
    polygon(c, [[x - size, y - size], [x + size, y - size], [x, y - ry * 0.72]], 'rgba(255,255,255,0.12)');
    polygon(c, [[x - size, y + size], [x + size, y + size], [x, y + ry * 0.72]], 'rgba(0,0,20,0.10)');
    c.restore();
  };
  const P = (c, col, pts) => {
    polygon(c, pts, col);
    if (pts.length < 3) return;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    pts.forEach(([x, y]) => {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    });
    finishShape(c, () => {
      pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.closePath();
    }, left, top, right - left, bottom - top);
    let area = 0, centerX = 0, centerY = 0;
    pts.forEach((p, i) => {
      const next = pts[(i + 1) % pts.length];
      area += p[0] * next[1] - next[0] * p[1];
      centerX += p[0]; centerY += p[1];
    });
    if (Math.abs(area) < 10) return;
    centerX /= pts.length; centerY /= pts.length;
    c.save(); c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath(); c.clip();
    polygon(c, [[centerX, centerY], pts[0], pts[1]], 'rgba(255,255,255,0.1)');
    polygon(c, [[centerX, centerY], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]], 'rgba(0,0,20,0.09)');
    c.restore();
  };
  const L = (c, col, x1, y1, x2, y2, w) => { c.strokeStyle = col; c.lineWidth = w || 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const grad = (c, x, y, w, h, stops) => { const g = c.createLinearGradient(0, y, 0, y + h); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(x, y, w, h); };
  function glow(c, x, y, r, rgb, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + (a === undefined ? 0.5 : a) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // repeatable "random" numbers, so a scene looks the same at every frame
  function seeded(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const blink = (e, speed, phase) => Math.floor(e.t * (speed || 2) + (phase || 0)) % 2 === 0;

  function stars(c, e, seed, maxY, n) {
    const r = seeded(seed);
    for (let i = 0; i < (n || 40); i++) {
      const x = r() * 320, y = r() * maxY, tw = Math.sin(e.t * (1 + r() * 2) + i) > 0.6;
      R(c, tw ? '#ffffff' : '#b9b5e0', x, y, 1, 1);
    }
  }
  // soft clouds that drift slowly and wrap around the screen
  function clouds(c, e, seed, y0, y1, n, rgb, a) {
    const r = seeded(seed);
    for (let i = 0; i < n; i++) {
      const w = 16 + r() * 22, y = y0 + r() * (y1 - y0), x = ((r() * 400 + e.t * (1 + r() * 2.5)) % 400) - 40;
      c.fillStyle = 'rgba(' + rgb + ',' + a + ')';
      c.beginPath(); c.ellipse(x, y, w, 3, 0, 0, 7); c.ellipse(x - w * 0.3, y - 2, w * 0.45, 3, 0, 0, 7); c.ellipse(x + w * 0.25, y - 3, w * 0.4, 3.5, 0, 0, 7); c.fill();
    }
  }
  function shootingStar(c, e, maxY) {
    const cycle = 11, p = (e.t % cycle) / 0.7;
    if (p > 1) return;
    const k = Math.floor(e.t / cycle), x = 40 + ((k * 97) % 220) + p * 46, y = 4 + ((k * 31) % Math.max(4, maxY - 20)) + p * 14;
    L(c, 'rgba(255,255,255,' + (1 - p) + ')', x, y, x - 10, y - 3, 1);
  }
  function moon(c, x, y) { E(c, '#fff6c8', x, y, 8); E(c, '#e8dca0', x - 2, y - 2, 1.5); E(c, '#e8dca0', x + 3, y + 2, 2); glow(c, x, y, 26, '255,246,200', 0.25); }
  function sea(c, e, y, h, top, bottom, seed) {
    grad(c, 0, y, 320, h, [top, bottom]);
    const r = seeded(seed || 7);
    for (let i = 0; i < 36; i++) {
      const yy = y + 2 + r() * (h - 3), w = 4 + r() * 10, x = (r() * 340 + Math.sin(e.t * 0.8 + i) * 4) % 330 - 5;
      R(c, 'rgba(255,255,255,' + (0.12 + r() * 0.2) + ')', x, yy, w, 1);
    }
    for (let i = 0; i < 5; i++) { // slow darker swells give the water some depth
      const yy = y + 4 + i * (h / 5), sh = Math.sin(e.t * 0.5 + i * 1.7) * 6;
      R(c, 'rgba(0,0,30,0.10)', -10 + sh, yy, 340, 2);
    }
    for (let i = 0; i < 6; i++) { // sparkles
      const k = Math.floor(e.t * 1.5 + i * 3.3), rr = seeded((seed || 7) * 31 + k * 7 + i);
      R(c, 'rgba(255,255,255,0.75)', rr() * 320, y + 2 + rr() * (h - 4), 1, 1);
    }
    for (let i = 0; i < 12; i++) {
      const x = ((i * 37 + e.t * (3 + i % 3)) % 360) - 20;
      const yy = y + 3 + ((i * 17) % Math.max(4, h - 5));
      c.strokeStyle = i % 3 ? 'rgba(205,235,255,0.17)' : 'rgba(255,224,174,0.25)';
      c.lineWidth = i % 3 ? 0.55 : 0.8;
      c.beginPath(); c.moveTo(x, yy);
      c.quadraticCurveTo(x + 5, yy - 1.2, x + 10, yy);
      c.quadraticCurveTo(x + 15, yy + 1, x + 21, yy - 0.2); c.stroke();
    }
  }
  function planks(c, y, h, base, line, step) {
    R(c, base, 0, y, 320, h);
    const r = seeded(11);
    for (let yy = y + step; yy < y + h; yy += step) {
      R(c, 'rgba(255,220,168,0.14)', 0, yy - 1, 320, 0.7);
      R(c, line, 0, yy, 320, 1);
      step += 1;
    }
    for (let i = 0; i < 26; i++) {
      const x = r() * 320, yy = y + r() * h;
      R(c, line, x, yy, 1, 5);
      R(c, 'rgba(255,220,168,0.12)', x + 1, yy, 0.6, 4);
    }
    for (let i = 0; i < 8; i++) {
      const x = 12 + r() * 296, yy = y + 3 + r() * Math.max(1, h - 6);
      E(c, 'rgba(35,22,14,0.28)', x, yy, 2.2, 0.9);
      E(c, 'rgba(230,190,130,0.24)', x - 0.4, yy - 0.35, 1.4, 0.35);
      L(c, 'rgba(35,22,14,0.18)', x - 6, yy + 1.3, x + 6, yy + 1.3, 0.35);
    }
  }
  function bricks(c, x, y, w, h, base, line) {
    R(c, base, x, y, w, h);
    for (let yy = y, row = 0; yy < y + h; yy += 8, row++) {
      R(c, line, x, yy, w, 1);
      for (let xx = x + (row % 2 ? 8 : 0); xx < x + w; xx += 16) R(c, line, xx, yy, 1, 8);
      for (let xx = x + (row % 2 ? 8 : 0) + 1; xx < x + w; xx += 16) {
        R(c, 'rgba(255,255,255,0.07)', xx, yy + 1, Math.min(14, x + w - xx), 0.65);
        R(c, 'rgba(0,0,0,0.12)', xx, yy + 7, Math.min(14, x + w - xx), 0.7);
      }
    }
    const r = seeded(Math.round(x + y + w + h));
    for (let i = 0; i < Math.floor(w * h / 180); i++) {
      const px = x + 2 + r() * Math.max(1, w - 4), py = y + 2 + r() * Math.max(1, h - 4);
      E(c, r() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', px, py, 1.4, 0.65);
    }
  }
  function flame(c, e, x, y, s) {
    const f = Math.sin(e.t * 13 + x) * s * 0.25;
    P(c, '#ff7b1c', [[x - s, y], [x - s * 0.5, y - s * 1.2 - f], [x, y - s * 2.2 + f], [x + s * 0.6, y - s * 1.1 - f], [x + s, y]]);
    P(c, '#ffd23f', [[x - s * 0.5, y], [x, y - s * 1.3 + f], [x + s * 0.5, y]]);
  }
  function zzz(c, e, x, y) {
    const p = (e.t * 0.5) % 1;
    c.fillStyle = 'rgba(255,255,255,' + (1 - p) + ')';
    c.font = 'bold 7px monospace';
    c.fillText('z', x + p * 6, y - p * 12);
    c.fillText('Z', x + 5 + p * 8, y - 6 - p * 12);
  }
  function door(c, x, y, w, h, col, open) {
    R(c, '#2a1a12', x - 1, y - 1, w + 2, h + 1);
    R(c, open ? '#0c0a14' : col, x, y, w, h);
    if (!open) { R(c, 'rgba(0,0,0,0.25)', x + w / 2, y, 1, h); R(c, '#e8c15a', x + w - 4, y + h / 2, 2, 2); }
  }
  function exitDoor(c, night) { // the way out of an interior, on the left wall
    R(c, '#2a1a12', 0, 48, 12, 58); grad(c, 0, 50, 10, 54, night ? ['#141433', '#3a2f6b'] : ['#3a2f6b', '#c9566a']);
    R(c, '#fff', 4, 58, 1, 1); R(c, '#fff', 7, 70, 1, 1);
  }

  // ---------- people ----------
  // x = centre, y = feet. Options: skin, shirt, pants, hair, hat, beard, w (body width), lh/bh (leg/body height) ...
  const limb = (c, col, x1, y1, x2, y2, w) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.lineCap = 'butt'; };
  const half = (c, col, x, y, rx, ry, top) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, top ? Math.PI : 0, top ? Math.PI * 2 : Math.PI); c.closePath(); c.fill(); };
  function person(c, x, y, o, e) {
    const sk = o.skin || '#f2c9a0', w = o.w || 10, bh = o.bh || 12, lh = o.sit ? 0 : (o.lh === undefined ? 9 : o.lh);
    const talk = !!(e && o.id && e.speaker === o.id && blink(e, 8));
    const d = o.dir || 0, step = o.walk === undefined ? -1 : Math.floor(o.walk * 4) % 4;
    const bob = step === 1 || step === 3 ? 1 : 0;
    const bodyTop = y - lh - bh - bob, hx = x - 4, hy = bodyTop - 8 - (talk ? 0.6 : 0), cy = hy + 4, tl = x - w / 2;
    if (lh && !o.noShadow) E(c, 'rgba(0,0,0,0.22)', x, y, w * 0.75, 1.8);
    const shut = o.closed || (!!e && ((e.t * 0.9 + x * 0.173) % 3.7) < 0.12);
    const shoes = o.shoes || '#3a2a2a';
    if (lh) {
      if (o.skirt) {
        P(c, o.pants, [[tl, y - lh - bob - 1], [tl + w, y - lh - bob - 1], [tl + w + 1.5, y - 2], [tl - 1.5, y - 2]]);
        E(c, shoes, x - 2.2, y - 1, 1.9, 1.2); E(c, shoes, x + 2.2, y - 1, 1.9, 1.2);
      } else {
        const l1 = step === 1 ? 2 : 0, l2 = step === 3 ? 2 : 0;
        limb(c, o.pants, x - 2.3, y - lh - bob, x - 2.3, y - 2.6 - l1, 3.3); limb(c, o.pants, x + 2.3, y - lh - bob, x + 2.3, y - 2.6 - l2, 3.3);
        E(c, shoes, x - 2.3 + d * 0.8, y - 1.2 - l1, 2.7, 1.5); E(c, shoes, x + 2.3 + d * 0.8, y - 1.2 - l2, 2.7, 1.5);
      }
    }
    // body: everything on the shirt is cut to its round shape, then a soft shade on one side
    const rr = Math.min(3.2, w * 0.32);
    c.save();
    c.beginPath(); c.roundRect(tl, bodyTop, w, bh + (lh ? 1 : 0), [rr, rr, 1.2, 1.2]); c.fillStyle = o.shirt; c.fill(); c.clip();
    if (o.stripes) for (let i = 1; i < bh; i += 3) B(c, o.stripes, tl, bodyTop + i, w, 1.2);
    if (o.sash) ['#3aa655', '#fff', '#d33'].forEach((col, k) => P(c, col, [[tl + k - 1.5, bodyTop], [tl + k - 0.4, bodyTop], [tl + w + k - 0.4, bodyTop + bh], [tl + w + k - 1.5, bodyTop + bh]]));
    if (o.apron) { c.fillStyle = o.apron; c.beginPath(); c.roundRect(tl + 2, bodyTop + 3, w - 4, bh, 1.2); c.fill(); }
    const sh = c.createLinearGradient(tl, 0, tl + w, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.55, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,20,0.22)');
    c.fillStyle = sh; c.fillRect(tl, bodyTop, w, bh + 2);
    c.restore();
    if (o.buttons) for (let i = 2; i < bh; i += 3) { E(c, o.buttons, x - 1.5, bodyTop + i + 0.5, 0.6); E(c, o.buttons, x + 1.5, bodyTop + i + 0.5, 0.6); }
    const swing = step === 1 ? 1 : step === 3 ? -1 : 0, ax = w / 2 + 0.7, sleeve = o.sleeve || o.shirt;
    limb(c, sleeve, x - ax, bodyTop + 2.2, x - ax - 0.6, bodyTop + 7 + swing, 2.5); E(c, sk, x - ax - 0.7, bodyTop + 8.6 + swing, 1.35);
    limb(c, sleeve, x + ax, bodyTop + 2.2, x + ax + 0.6, bodyTop + 7 - swing, 2.5); E(c, sk, x + ax + 0.7, bodyTop + 8.6 - swing, 1.35);
    B(c, sk, x - 1.4, bodyTop - 1.2, 2.8, 2); B(c, 'rgba(0,0,20,0.16)', x - 1.4, bodyTop - 0.3, 2.8, 0.9);
    // head
    if (o.hair && o.longhair) { limb(c, o.hair, x - 4.3, cy - 1, x - 4.7, cy + 6, 2.4); limb(c, o.hair, x + 4.3, cy - 1, x + 4.7, cy + 6, 2.4); }
    if (d <= 0) E(c, sk, x + 4.4, cy + 0.6, 1.1, 1.4);
    if (d >= 0) E(c, sk, x - 4.4, cy + 0.6, 1.1, 1.4);
    E(c, sk, x, cy, 4.6, 4.7);
    E(c, 'rgba(0,0,20,0.07)', x + 1.6, cy + 1.4, 3.2, 3.4);
    const ex = x + d * 1.1, ey = cy - 0.3;
    E(c, 'rgba(235,110,90,0.30)', ex - 3, cy + 1.9, 1.1, 0.8); E(c, 'rgba(235,110,90,0.30)', ex + 3, cy + 1.9, 1.1, 0.8);
    if (o.hair) { half(c, o.hair, x, cy - 2, 4.9, 3.5, true); if (!o.longhair) { E(c, o.hair, x - 4.4, cy - 1.2, 0.9, 1.6); E(c, o.hair, x + 4.4, cy - 1.2, 0.9, 1.6); } }
    if (o.beard) half(c, o.beard, x, cy + 1.3, 4.7, o.longbeard ? 8.5 : 4.6, false);
    if (shut) { L(c, '#222', ex - 2.9, ey + 0.3, ex - 1.1, ey + 0.3, 0.6); L(c, '#222', ex + 1.1, ey + 0.3, ex + 2.9, ey + 0.3, 0.6); }
    else {
      E(c, '#fff', ex - 2, ey, 1.25, 1.45); E(c, '#fff', ex + 2, ey, 1.25, 1.45);
      E(c, '#222', ex - 2 + d * 0.35, ey + 0.1, 0.72, 0.95); E(c, '#222', ex + 2 + d * 0.35, ey + 0.1, 0.72, 0.95);
      E(c, '#fff', ex - 2.25 + d * 0.35, ey - 0.3, 0.28); E(c, '#fff', ex + 1.75 + d * 0.35, ey - 0.3, 0.28);
    }
    if (o.patch) { L(c, '#111', x - 4.5, cy - 2.4, x + 4.5, cy - 1.2, 0.6); E(c, '#111', ex + 2, ey, 1.7, 1.8); }
    E(c, 'rgba(150,70,40,0.35)', ex + d * 0.4, cy + 1.5, 0.6, 0.5);
    if (talk) E(c, '#7a2a2a', ex, cy + 3, 1.15, 1.05);
    else { c.strokeStyle = '#7a2a2a'; c.lineWidth = 0.55; c.lineCap = 'round'; c.beginPath(); c.arc(ex, cy + 2, 1.5, 0.5, Math.PI - 0.5); c.stroke(); c.lineCap = 'butt'; }
    const hc = o.hatc || '#d33';
    switch (o.hat) {
      case 'cap': half(c, hc, x, cy - 2.3, 5, 3.9, true); E(c, hc, x, cy - 6.1, 0.7);
        c.fillStyle = hc; c.beginPath(); if (d) c.roundRect(d < 0 ? x - 8.4 : x + 3.9, cy - 3.5, 4.5, 1.4, 0.7); else c.roundRect(x - 3.2, cy - 3.2, 6.4, 1.2, 0.6); c.fill();
        B(c, 'rgba(0,0,20,0.18)', x - 4.8, cy - 2.9, 9.6, 0.6); break;
      case 'winter':
        E(c, hc, x, cy - 5.8, 5.2, 3.6); R(c, '#f5ead9', x - 5, cy - 2.8, 10, 1.1);
        R(c, 'rgba(255,255,255,0.35)', x - 4, cy - 7.3, 8, 0.8); E(c, '#fff3d8', x + 0.6, cy - 9.2, 1.8);
        E(c, '#fff', x - 2.7, cy - 3, 0.45); E(c, '#fff', x + 1.5, cy - 3, 0.45); break;
      case 'bandana': half(c, hc, x, cy - 2.2, 4.9, 3.8, true); E(c, hc, x + 5.2, cy - 2, 1.3, 1); limb(c, hc, x + 5.6, cy - 1.6, x + 6.4, cy + 1.2, 1.1);
        E(c, '#fff', x - 2, cy - 4, 0.5); E(c, '#fff', x + 1.2, cy - 4.4, 0.5); E(c, '#fff', x + 3, cy - 3.2, 0.5); break;
      case 'tricorn': P(c, '#1c1c28', [[x - 7.5, cy - 2.8], [x + 7.5, cy - 2.8], [x + 4.5, cy - 5.4], [x, cy - 8.6], [x - 4.5, cy - 5.4]]); limb(c, '#1c1c28', x - 7, cy - 3, x + 7, cy - 3, 1.5); E(c, '#e8c15a', x, cy - 5.4, 1); break;
      case 'chef': E(c, '#fff', x - 2.7, cy - 8.2, 2.8, 2.5); E(c, '#fff', x + 2.7, cy - 8.2, 2.8, 2.5); E(c, '#fff', x, cy - 9, 3, 2.7);
        c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x - 4, cy - 6.8, 8, 4.2, 0.8); c.fill(); B(c, 'rgba(0,0,20,0.12)', x - 4, cy - 3.6, 8, 0.7); break;
      case 'wig': E(c, '#f4f1e8', x, cy - 3.7, 6.8, 3.7); E(c, '#f4f1e8', x - 6.3, cy + 0.8, 2.4, 4.3); E(c, '#f4f1e8', x + 6.3, cy + 0.8, 2.4, 4.3);
        E(c, '#dcd8c8', x - 3, cy - 4.6, 1.7, 1.3); E(c, '#dcd8c8', x + 3, cy - 4, 1.7, 1.3); E(c, '#dcd8c8', x - 6.3, cy + 2.6, 1.3, 1.1); E(c, '#dcd8c8', x + 6.3, cy + 2.6, 1.3, 1.1);
        R(c, '#1c2a5a', hx - 2, hy - 4.5, 12, 2); R(c, '#1c2a5a', hx + 1, hy - 7.5, 6, 3); E(c, '#e8c15a', x, hy - 6, 1); break;
      case 'turban': E(c, hc === '#d33' ? '#8a4fd0' : hc, x, cy - 3.6, 5.6, 3.4); E(c, 'rgba(255,255,255,0.18)', x - 1.5, cy - 4.6, 3, 1.4); E(c, '#ffd23f', x, cy - 3.2, 1.1); break;
      case 'straw': half(c, '#d9b65a', x, cy - 3.4, 4.3, 3.7, true); limb(c, '#d9b65a', x - 7, cy - 3.3, x + 7, cy - 3.3, 1.6); limb(c, '#a8452a', x - 4, cy - 4.5, x + 4, cy - 4.5, 0.9); break;
      case 'bun': E(c, o.hair, x, cy - 5.6, 2.6); break;
      default: break;
    }
    if (o.earrings) { E(c, '#ffd23f', x - 4.7, cy + 2.6, 0.75); E(c, '#ffd23f', x + 4.7, cy + 2.6, 0.75); }
  }

  const FILI = { id: 'fili', shirt: '#3a7bd5', stripes: '#ffffff', pants: '#7a4a2a', hair: '#6a3a1a', hat: 'cap', lh: 6, bh: 9, w: 8 };
  const SPR = 12; // Fili's own canvas has 12 real pixels per unit: sharp even when he walks close to the screen
  const spr = document.createElement('canvas'); spr.width = 28 * SPR; spr.height = 40 * SPR;
  const sprCtx = spr.getContext('2d'); sprCtx.scale(SPR, SPR);
  // Fili is drawn on a separate canvas, then copied at the size the room asks for.
  function fili(c, x, y, scale, dir, walk, e) {
    sprCtx.clearRect(0, 0, 28, 40);
    const maya = e.g.state && e.g.state.room.indexOf('maya_') === 0;
    const winter = e.g.state && e.g.state.room.indexOf('natale_') === 0;
    const outfit = maya
      ? Object.assign({}, FILI, { shirt: '#a85d3e', stripes: '#e0bd79', pants: '#5e4936', hair: '#443022' })
      : winter
        ? Object.assign({}, FILI, { shirt: '#b83f48', stripes: '#f4e4cb', pants: '#344454', hat: 'winter', hatc: '#b83f48', buttons: '#f5d477', shoes: '#392d31' })
        : FILI;
    person(sprCtx, 14, 39, Object.assign({}, outfit, { dir, walk, noShadow: true, hat: e.g.flag('parrucca_indossata') ? 'wig' : outfit.hat }), e);
    if (winter) {
      R(sprCtx, '#287c87', 9.5, 23.8, 9, 2.3);
      R(sprCtx, '#f4d28a', 10, 23.5, 1, 7);
      P(sprCtx, '#287c87', [[9.5, 25], [11.5, 25], [11, 31], [9, 30]]);
    }
    if (maya) {
      L(sprCtx, '#77543a', 10.5, 33, 17.5, 33, 1.1);
      L(sprCtx, '#d7b26e', 10.5, 31.7, 17.5, 31.7, 0.8);
      P(sprCtx, '#3e987e', [[14, 24.7], [15.2, 26], [14, 27.3], [12.8, 26]]);
      L(sprCtx, '#d7b26e', 12, 24.8, 14, 27, 0.7);
    }
    if (e.g.has('lanterna_accesa')) { R(sprCtx, '#5a3a22', 14 + dir * 7, 24, 3, 1); R(sprCtx, '#ffd23f', 14 + dir * 7, 25, 3, 4); R(sprCtx, '#5a3a22', 14 + dir * 7, 29, 3, 1); }
    const w = 28 * scale, h = 40 * scale;
    E(c, 'rgba(0,0,0,0.25)', x, y, 7 * scale, 2 * scale);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(spr, x - w / 2, y - h + scale, w, h);
  }

  // ---------- animals and special characters ----------
  function gull(c, e, x, y) {
    const talk = e.speaker === 'gabbiano' && blink(e, 8);
    E(c, '#f4f4f4', x, y, 6, 4); E(c, '#b9bcc8', x - 2, y, 4, 2); E(c, '#f4f4f4', x + 5, y - 4, 3);
    R(c, '#111', x + 5, y - 5, 1, 1); R(c, '#f39c12', x + 8, y - 4, 3, 1); if (talk) R(c, '#f39c12', x + 8, y - 2, 2, 1);
    R(c, '#f39c12', x - 1, y + 4, 1, 2); R(c, '#f39c12', x + 2, y + 4, 1, 2);
  }
  function parrot(c, e, x, y) {
    const talk = e.speaker === 'pappagallo' && blink(e, 8);
    E(c, '#2fae4a', x, y, 5, 7); E(c, '#1f8a3a', x - 2, y + 1, 3, 5); R(c, '#d33', x - 3, y + 6, 2, 6);
    E(c, '#d33', x + 1, y - 7, 4); R(c, '#fff', x + 2, y - 8, 2, 2); R(c, '#111', x + 3, y - 8, 1, 1);
    R(c, '#ffd23f', x + 4, y - 6, 3, 2); R(c, '#e0a800', x + 5, y - 4 + (talk ? 1 : 0), 2, 1);
    R(c, '#888', x - 1, y + 7, 1, 2); R(c, '#888', x + 2, y + 7, 1, 2);
  }
  function crab(c, e, x, y) {
    const s = blink(e, 6) ? 1 : 0;
    E(c, '#e2533a', x, y, 6, 3); R(c, '#e2533a', x - 9, y - 4 + s, 3, 3); R(c, '#e2533a', x + 6, y - 3 - s, 3, 3);
    R(c, '#111', x - 2, y - 5, 1, 2); R(c, '#111', x + 2, y - 5, 1, 2);
    for (let i = -1; i <= 1; i++) { R(c, '#b8402c', x - 7 + i, y + 2 + (i + s) % 2, 2, 1); R(c, '#b8402c', x + 5 + i, y + 2 + (i + s + 1) % 2, 2, 1); }
  }
  function skeleton(c, e, x, y, teeth) {
    const talk = e.speaker === 'scheletro' && blink(e, 10);
    const bone = '#e8e4d0';
    R(c, bone, x - 6, y - 4, 12, 3); R(c, bone, x + 4, y - 4, 3, 4); // crossed legs
    R(c, bone, x - 1, y - 22, 2, 18); for (let i = 0; i < 4; i++) R(c, bone, x - 5, y - 21 + i * 3, 10, 1); // spine + ribs
    L(c, bone, x + 5, y - 20, x + 14, y - 14, 2); R(c, bone, x + 13, y - 15, 4, 2); // arm resting on the chest
    R(c, bone, x - 7, y - 20, 2, 10);
    R(c, bone, x - 5, y - 34, 10, 9); R(c, bone, x - 3, y - 25, 6, 2 + (talk ? 1 : 0));
    R(c, '#1a1626', x - 3, y - 31, 2, 3); R(c, '#1a1626', x + 1, y - 31, 2, 3); R(c, '#1a1626', x - 1, y - 28, 1, 1);
    if (teeth) R(c, '#ffd23f', x - 3, y - 26 + (talk ? 1 : 0), 6, 2);
    const socks = ['#d33', '#3a7bd5', '#ffd23f', '#3aa655', '#d16ad1'];
    for (let i = 0; i < 5; i++) { R(c, socks[i], x - 5 + i * 2, y - 23, 2, 5 + (i % 2) * 2); R(c, socks[i], x - 5 + i * 2 + (i % 2 ? 1 : -1), y - 18 + (i % 2) * 2, 2, 2); }
    R(c, '#1c1c28', x - 8, y - 36, 16, 2); R(c, '#1c1c28', x - 5, y - 40, 10, 4); R(c, '#fff', x - 1, y - 39, 2, 2);
  }
  const ADMIRAL = { id: 'ammiraglio', shirt: '#1c2a5a', sleeve: '#1c2a5a', buttons: '#ffd23f', pants: '#f4f1e8', hat: 'wig', w: 16, bh: 15, lh: 10, skin: '#f0b89a' };

  // ---------- rooms ----------
  const rooms = {};
  const duskSky = (c, e, h) => { grad(c, 0, 0, 320, h, ['#2b2350', '#6b3a6e', '#c9566a', '#f6a65a']); stars(c, e, 3, h * 0.4, 18); clouds(c, e, 91, h * 0.35, h * 0.8, 5, '255,170,150', 0.28); };
  const nightSky = (c, e, h) => { grad(c, 0, 0, 320, h, ['#101030', '#2a2560', '#45387a']); stars(c, e, 5, h * 0.8, 46); shootingStar(c, e, h * 0.6); clouds(c, e, 93, h * 0.15, h * 0.6, 4, '150,150,210', 0.16); };
  function lighthouse(c, x, top, w, h, lit, e) { // small far-away tower
    for (let i = 0; i < h; i += 6) B(c, (i / 6) % 2 ? '#b8404a' : '#d9d4d0', x, top + 5 + i, w, Math.min(6, h - i));
    R(c, '#2a2438', x - 1, top + 3, w + 2, 3); R(c, lit ? '#fff3a0' : '#3a3550', x + 1, top, w - 2, 4); R(c, '#2a2438', x, top - 2, w, 2);
    if (lit) { glow(c, x + w / 2, top + 2, 30, '255,243,160', 0.7); const a = e.t * 1.2; P(c, 'rgba(255,243,160,0.35)', [[x + w / 2, top + 2], [x + w / 2 + Math.cos(a) * 200, top - 30 + Math.sin(a) * 30], [x + w / 2 + Math.cos(a) * 200, top + 30 + Math.sin(a) * 30]]); }
  }

  rooms.molo = {
    draw(c, e) {
      duskSky(c, e, 64);
      E(c, '#ffd27a', 92, 64, 12); glow(c, 92, 62, 40, '255,210,122', 0.35);
      P(c, '#3a2f55', [[226, 64], [240, 52], [258, 47], [288, 49], [302, 57], [320, 54], [320, 64]]);
      lighthouse(c, 267, 24, 9, 20, !!e.g.flag('faro_acceso'), e);
      sea(c, e, 64, 42, '#e88a5a', '#3b4a8a', 7);
      R(c, 'rgba(255,210,122,0.35)', 84, 66, 16, 1); R(c, 'rgba(255,210,122,0.25)', 80, 70, 24, 1); R(c, 'rgba(255,210,122,0.18)', 86, 75, 14, 1);
      const bob = Math.round(Math.sin(e.t * 1.5));
      P(c, '#6a3f22', [[26, 91 + bob], [72, 91 + bob], [67, 102 + bob], [31, 102 + bob]]); R(c, '#8a5a36', 26, 90 + bob, 46, 2); R(c, '#4a2a16', 40, 92 + bob, 1, 9); R(c, '#4a2a16', 56, 92 + bob, 1, 9);
      L(c, '#b98a5a', 46, 88 + bob, 64, 99 + bob, 1);
      planks(c, 104, 36, '#8a5a36', '#6a4226', 5); R(c, '#5a3a22', 0, 104, 320, 3);
      for (let x = 14; x < 320; x += 52) R(c, '#5a3a22', x, 100, 4, 6);
    },
    sprites: [
      [106, (c, e) => { R(c, '#5a3a22', 122, 72, 3, 36); R(c, '#5a3a22', 118, 74, 8, 2);
        if (!e.g.flag('lanterna_presa')) { R(c, '#3a3a44', 120, 76, 1, 3); R(c, '#3a3a44', 119, 79, 8, 2); R(c, '#9fb8c8', 120, 81, 6, 7); R(c, '#3a3a44', 119, 88, 8, 2); R(c, '#6a8a98', 122, 82, 1, 5); } }],
      [114, (c, e) => { // old Baccalà, sitting on a crate, and his fishing rod
        R(c, '#7a5230', 158, 102, 16, 12); R(c, '#5a3a22', 158, 106, 16, 1); R(c, '#5a3a22', 165, 102, 1, 12);
        person(c, 165, 102, { id: 'baccala', sit: true, shirt: '#3a6a8a', stripes: '#2a4a6a', pants: '#444', beard: '#eee', longbeard: true, hat: 'straw', dir: -1 }, e);
        R(c, '#444', 158, 102, 5, 3); R(c, '#444', 156, 104, 3, 8); R(c, '#3a2a2a', 154, 111, 5, 2);
        L(c, '#c9a36a', 160, 96, 140, 72, 1); const fy = 96 + Math.round(Math.sin(e.t * 2)); L(c, 'rgba(255,255,255,0.6)', 140, 72, 140, fy, 0.5); R(c, '#d33', 139, fy, 2, 2); }],
      [115, (c) => { R(c, '#7a5230', 204, 92, 20, 22); R(c, '#8a623a', 206, 91, 16, 2); R(c, '#3a3a44', 204, 96, 20, 2); R(c, '#3a3a44', 204, 108, 20, 2); R(c, '#5a3a22', 210, 92, 1, 22); R(c, '#5a3a22', 217, 92, 1, 22); }],
      [108, (c, e) => { R(c, '#5a3a22', 252, 60, 3, 48); E(c, '#7a5a30', 253, 60, 9, 3); R(c, '#9a7a40', 246, 59, 4, 1); R(c, '#9a7a40', 256, 61, 4, 1);
        R(c, '#cfd8dc', 247, 57, 2, 2); if (!e.g.flag('chiave_avuta')) { R(c, '#ffd23f', 258, 56, 2, 2); R(c, '#ffd23f', 260, 57, 3, 1); }
        gull(c, e, 252, 51 + (e.speaker === 'gabbiano' && blink(e, 8) ? -1 : 0)); }],
    ],
  };

  function cobbles(c, y) {
    R(c, '#54506c', 0, y, 320, 140 - y);
    const r = seeded(21);
    for (let i = 0; i < 130; i++) {
      const px = r() * 320, py = y + 2 + r() * (138 - y), rx = 2.5 + r() * 2.5, ry = 1.1 + r() * 0.8;
      const col = r() > 0.5 ? '#625e7c' : '#48445e';
      P(c, col, [[px - rx, py], [px - rx * 0.62, py - ry], [px + rx * 0.55, py - ry * 0.9], [px + rx, py - ry * 0.1], [px + rx * 0.7, py + ry * 0.8], [px - rx * 0.5, py + ry]]);
      L(c, 'rgba(255,255,255,0.12)', px - rx * 0.55, py - ry * 0.45, px + rx * 0.35, py - ry * 0.55, 0.45);
    }
  }
  rooms.piazza = {
    draw(c, e) {
      nightSky(c, e, 104); moon(c, 40, 18);
      P(c, '#23204a', [[110, 104], [146, 72], [188, 48], [214, 36], [242, 36], [272, 52], [320, 72], [320, 104]]);
      P(c, '#5a4f78', [[150, 104], [178, 104], [184, 70], [200, 52], [224, 38], [216, 38], [192, 50], [176, 68]]);
      lighthouse(c, 221, 6, 12, 26, !!e.g.flag('faro_acceso'), e);
      // tavern
      R(c, '#7a4a3a', 28, 44, 74, 60); P(c, '#4a2a3a', [[22, 46], [65, 24], [108, 46]]); R(c, '#5a3528', 28, 96, 74, 8);
      R(c, '#ffd27a', 34, 60, 12, 12); R(c, '#5a3528', 39, 60, 1, 12); R(c, '#5a3528', 34, 65, 12, 1);
      R(c, '#ffd27a', 86, 60, 12, 12); R(c, '#5a3528', 91, 60, 1, 12); R(c, '#5a3528', 86, 65, 12, 1);
      door(c, 54, 72, 18, 32, '#6a3f22'); R(c, '#ffd27a', 59, 77, 8, 6); glow(c, 63, 80, 14, '255,210,122', 0.3);
      R(c, '#2a1a12', 74, 36, 20, 1); R(c, '#2a1a12', 78, 36, 1, 3); R(c, '#2a1a12', 91, 36, 1, 3);
      R(c, '#c9a36a', 77, 39, 16, 12); E(c, '#7a3a22', 85, 45, 4); R(c, '#fff', 83, 43, 1, 1); L(c, '#eee', 86, 41, 88, 38, 1);
      // shop
      R(c, '#4a5a7a', 238, 46, 66, 58); R(c, '#2f3a55', 234, 42, 74, 5); R(c, '#3a4660', 238, 96, 66, 8);
      for (let i = 0; i < 9; i++) R(c, i % 2 ? '#d16ad1' : '#f4f1e8', 242 + i * 7, 58, 7, 6);
      door(c, 248, 72, 18, 32, '#3a2a55'); R(c, '#d7b0ff', 253, 77, 8, 6);
      R(c, '#ffe9a8', 272, 68, 26, 22); R(c, '#2f3a55', 284, 68, 1, 22); R(c, '#6a3a8a', 275, 80, 4, 10); E(c, '#3aa0d0', 291, 84, 4); R(c, '#a8452a', 280, 84, 3, 6); glow(c, 285, 79, 20, '255,233,168', 0.25);
      cobbles(c, 104);
    },
    sprites: [
      [108, (c, e) => { // fountain with the statue of Capitan Barbacalzino
        E(c, '#8a8aa0', 128, 104, 15, 4); R(c, '#8a8aa0', 113, 98, 30, 6); E(c, '#5ab0e0', 128, 98, 13, 3); R(c, '#9a9ab0', 113, 97, 30, 2);
        R(c, '#8a8aa0', 125, 84, 6, 14); R(c, '#9a9ab0', 123, 84, 10, 2);
        R(c, '#9a9ab0', 125, 74, 6, 10); R(c, '#9a9ab0', 126, 68, 5, 6); R(c, '#77778a', 123, 67, 11, 2); R(c, '#77778a', 126, 64, 5, 3);
        ['#d33', '#3a7bd5', '#ffd23f'].forEach((col, i) => R(c, col, 126 + i * 2, 73, 1, 4 + i % 2));
        const p = (e.t * 1.5) % 1; R(c, '#bfe6ff', 121 - p * 4, 84 + p * 13, 1, 2); R(c, '#bfe6ff', 134 + p * 4, 84 + p * 13, 1, 2); }],
      [104, (c) => { R(c, '#5a3a22', 188, 74, 2, 30); R(c, '#5a3a22', 198, 74, 2, 30); R(c, '#8a623a', 187, 74, 14, 15); R(c, '#f4f1e8', 189, 76, 4, 5); R(c, '#ffe9a8', 194, 77, 5, 4); R(c, '#f4f1e8', 190, 83, 8, 4); R(c, '#d33', 191, 76, 1, 1); }],
      [120, (c, e) => person(c, 95, 120, { id: 'sindaca', shirt: '#c2548a', pants: '#8a3a66', skirt: true, hair: '#b8b8c8', hat: 'bun', sash: true, dir: 1 }, e)],
      [120, (c, e) => { if (!e.g.flag('cristallo_preso')) person(c, 225, 120, Object.assign({ dir: -1 }, ADMIRAL), e); }],
    ],
  };

  function interior(c, wall, line, floor, floorLine) {
    R(c, wall, 0, 0, 320, 104);
    for (let x = 0; x < 320; x += 16) {
      R(c, line, x, 0, 1, 104);
      R(c, 'rgba(255,220,168,0.045)', x + 1, 7, 2, 94);
      L(c, 'rgba(0,0,0,0.12)', x + 12, 12, x + 12, 96, 0.45);
    }
    L(c, 'rgba(0,0,0,0.2)', 0, 38, 320, 38, 1);
    L(c, 'rgba(255,220,168,0.08)', 0, 40, 320, 40, 0.6);
    for (let i = 0; i < 7; i++) {
      const x = 24 + i * 43, yy = 15 + (i % 3) * 25;
      E(c, 'rgba(0,0,0,0.14)', x, yy, 2.3, 0.8);
      E(c, 'rgba(255,220,168,0.08)', x - 0.4, yy - 0.3, 1.3, 0.35);
    }
    R(c, '#2a1a12', 0, 0, 320, 7); for (let x = 20; x < 320; x += 60) R(c, '#2a1a12', x, 0, 6, 12);
    planks(c, 104, 36, floor, floorLine, 5); R(c, 'rgba(0,0,0,0.3)', 0, 104, 320, 2);
  }
  function pirate(c, e, x, o) { person(c, x, 100, Object.assign({ id: 'pirati', closed: e.speaker !== 'pirati', pants: '#333' }, o), e); }
  rooms.taverna = {
    draw(c, e) {
      interior(c, '#5a3520', '#4a2a18', '#7a4a28', '#5a3418');
      exitDoor(c, true);
      // round window and a hanging lamp
      E(c, '#2a1a12', 150, 30, 11); E(c, '#1a1a40', 150, 30, 9); E(c, '#fff6c8', 153, 27, 3); R(c, '#2a1a12', 149, 21, 2, 18); R(c, '#2a1a12', 141, 29, 18, 2);
      R(c, '#2a1a12', 205, 7, 1, 10); R(c, '#ffd23f', 202, 17, 7, 6); glow(c, 205, 20, 34, '255,210,90', 0.35);
      // fireplace
      R(c, '#77707a', 16, 44, 48, 60); R(c, '#8a838c', 12, 58, 56, 5); R(c, '#77707a', 22, 30, 36, 14);
      for (let i = 0; i < 12; i++) R(c, '#5f5964', 18 + (i * 13) % 44, 46 + ((i * 7) % 5) * 11, 6, 1);
      R(c, '#14101a', 26, 68, 28, 34); glow(c, 40, 92, 40, '255,140,40', 0.45);
      R(c, '#4a2a16', 30, 99, 20, 3); flame(c, e, 36, 99, 4); flame(c, e, 44, 99, 5);
      R(c, '#222', 39, 68, 1, 14); R(c, '#2a2a30', 32, 82, 16, 3); R(c, '#2a2a30', 48, 83, 7, 1);
      // portrait
      R(c, '#c9a13a', 87, 29, 24, 28); R(c, '#3a4a6a', 89, 31, 20, 24); R(c, '#f2c9a0', 95, 36, 8, 8); R(c, '#1c1c28', 92, 33, 14, 2); R(c, '#1c1c28', 95, 30, 8, 3);
      R(c, '#222', 97, 39, 1, 1); R(c, '#222', 100, 39, 1, 1);
      ['#d33', '#3a7bd5', '#ffd23f', '#3aa655'].forEach((col, i) => R(c, col, 95 + i * 2, 43, 2, 6 + (i % 2) * 2));
      // the three lazy pirates
      pirate(c, e, 136, { shirt: '#b8404a', hat: 'bandana', beard: '#4a2a16' });
      pirate(c, e, 157, { shirt: '#3a6a4a', hat: 'tricorn', patch: true, skin: '#d9a87a' });
      pirate(c, e, 178, { shirt: '#6a5a8a', hat: 'bandana', hatc: '#2a6ad0', skin: '#f0b89a', beard: '#888' });
      R(c, '#8a5a36', 124, 82, 66, 4); R(c, '#6a4226', 124, 86, 66, 2); R(c, '#6a4226', 130, 88, 4, 14); R(c, '#6a4226', 180, 88, 4, 14);
      R(c, '#f4f1e8', 140, 80, 3, 2); R(c, '#f4f1e8', 144, 80, 3, 2); R(c, '#f4f1e8', 164, 80, 3, 2); R(c, '#c9a36a', 150, 77, 4, 5); R(c, '#c9a36a', 172, 77, 4, 5); R(c, '#fff', 150, 76, 4, 1);
      if (e.speaker !== 'pirati') zzz(c, e, 160, 58);
      // shelf, crank, cook and counter
      R(c, '#3a2212', 226, 34, 60, 2); ['#3aa655', '#d33', '#ffd23f', '#3a7bd5', '#d16ad1', '#f4f1e8'].forEach((col, i) => R(c, col, 230 + i * 9, 26 + (i % 2) * 2, 4, 8 - (i % 2) * 2));
      if (!e.g.flag('manovella_avuta')) { R(c, '#2a1a12', 295, 32, 2, 2); R(c, '#9aa0a8', 295, 34, 2, 12); R(c, '#9aa0a8', 295, 46, 7, 2); R(c, '#6a4226', 300, 46, 2, 6); R(c, '#b8404a', 294, 38, 4, 2); }
      person(c, 262, 90, { id: 'cuoca', shirt: '#f4f1e8', apron: '#f4f1e8', sleeve: '#d98a8a', pants: '#333', hair: '#e2422a', longhair: true, hat: 'chef', dir: -1 }, e);
      R(c, '#2a2a30', 229, 68, 22, 12); R(c, '#3a3a44', 227, 66, 26, 3); E(c, '#7a5a2a', 240, 68, 10, 2);
      const b = (e.t * 1.3) % 1; E(c, '#a8803a', 236 + b * 6, 68 - b * 2, 1 + b * 1.5); E(c, '#a8803a', 245 - b * 3, 68, 1.5 - b);
      R(c, 'rgba(255,255,255,0.25)', 238, 60 - b * 6, 2, 3); R(c, 'rgba(255,255,255,0.18)', 244, 58 - b * 5, 2, 3);
      R(c, '#8a5a36', 220, 78, 86, 4); R(c, '#6a4226', 222, 82, 82, 22); for (let x = 232; x < 304; x += 14) R(c, '#5a3418', x, 82, 1, 22);
    },
    sprites: [],
  };

  rooms.bottega = {
    draw(c, e) {
      interior(c, '#3f2f55', '#33254a', '#6a4a3a', '#4f3528');
      exitDoor(c, true);
      R(c, '#2a1a12', 250, 7, 1, 8); R(c, '#d7b0ff', 247, 15, 7, 6); glow(c, 250, 18, 38, '215,176,255', 0.3);
      // shelves full of junk
      const r = seeded(33), cols = ['#d33', '#3a7bd5', '#ffd23f', '#3aa655', '#d16ad1', '#f4f1e8', '#c9a36a', '#5ab0e0'];
      [22, 38, 54].forEach((sy) => {
        R(c, '#2a1a30', 62, sy, 248, 2);
        for (let x = 66; x < 304; x += 5 + Math.floor(r() * 6)) {
          if (sy === 54 && x > 168 && x < 190) continue;
          const h = 4 + Math.floor(r() * 9), w = 3 + Math.floor(r() * 4), col = cols[Math.floor(r() * cols.length)];
          if (r() > 0.75) E(c, col, x + 2, sy - 3, 3); else R(c, col, x, sy - h, w, h);
          x += w;
        }
      });
      R(c, '#9aa0a8', 280, 9, 2, 10); R(c, '#9aa0a8', 276, 17, 10, 2); R(c, '#9aa0a8', 276, 14, 2, 4); R(c, '#9aa0a8', 284, 14, 2, 4); // anchor
      if (!e.g.flag('olio_comprato')) { R(c, '#e0a030', 175, 43, 8, 11); R(c, '#e0a030', 177, 40, 4, 3); R(c, '#6a4226', 177, 38, 4, 2); R(c, '#f4f1e8', 176, 46, 6, 4); R(c, '#d33', 178, 47, 2, 2); }
      // puffer fish hanging from the ceiling
      R(c, '#ccc', 61, 7, 1, 8); E(c, '#d9c27a', 61, 21, 6, 5); R(c, '#111', 64, 19, 1, 1); R(c, '#a8803a', 66, 22, 2, 1);
      [[55, 16], [61, 14], [67, 17], [54, 22], [57, 26], [65, 26]].forEach((p) => R(c, '#a8803a', p[0], p[1], 1, 2));
      // parrot on its perch
      R(c, '#6a4226', 108, 66, 2, 38); R(c, '#6a4226', 100, 64, 18, 2); R(c, '#6a4226', 102, 102, 14, 2);
      parrot(c, e, 109, 55 + (e.speaker === 'pappagallo' && blink(e, 8) ? -1 : 0));
      // shopkeeper and counter
      person(c, 231, 92, { id: 'madama', shirt: '#7a3fb0', sleeve: '#9a5fd0', pants: '#333', hair: '#2a1a12', longhair: true, hat: 'turban', earrings: true, dir: -1, skin: '#d9a87a' }, e);
      R(c, '#8a623a', 170, 78, 136, 4); R(c, '#5f4130', 172, 82, 132, 22); for (let x = 184; x < 304; x += 16) R(c, '#4f3528', x, 82, 1, 22);
      R(c, '#c9a13a', 188, 76, 6, 2); E(c, '#bfe6ff', 191, 71, 6); E(c, '#ffffff', 189, 69, 1.5); glow(c, 191, 71, 12, '190,230,255', 0.35 + Math.sin(e.t * 2) * 0.1);
      if (!e.g.flag('fiammiferi_comprati')) { R(c, '#d33', 268, 73, 10, 5); R(c, '#ffd23f', 270, 74, 6, 3); R(c, '#3a2a2a', 268, 77, 10, 1); }
    },
    sprites: [],
  };

  function symbolTile(c, e, y, letter, kind) {
    const open = e.g.flag('grotta_aperta'), on = open || (e.g.flag('combo') || '').includes(letter);
    R(c, '#3a3040', 58, y, 12, 12); R(c, on ? '#c9b98a' : '#8a7f8a', 59, y + 1, 10, 10);
    const col = open ? '#3aa0a0' : on ? '#a8452a' : '#4a4252';
    if (kind === 'fish') { E(c, col, 63, y + 6, 3, 2); P(c, col, [[66, y + 6], [68, y + 3], [68, y + 9]]); }
    else if (kind === 'moon') { E(c, col, 64, y + 6, 3.5); E(c, on ? '#c9b98a' : '#8a7f8a', 66, y + 5, 3); }
    else { R(c, col, 61, y + 2, 6, 5); R(c, col, 62, y + 7, 4, 2); R(c, on ? '#c9b98a' : '#8a7f8a', 62, y + 4, 1, 2); R(c, on ? '#c9b98a' : '#8a7f8a', 65, y + 4, 1, 2); }
  }
  rooms.spiaggia = {
    draw(c, e) {
      grad(c, 0, 0, 320, 62, ['#231d48', '#5a3468', '#b8506a', '#f09a5a']); stars(c, e, 9, 26, 20);
      E(c, '#ffd27a', 200, 62, 10); glow(c, 200, 60, 36, '255,210,122', 0.3);
      sea(c, e, 62, 30, '#e0825a', '#3b4a8a', 13);
      // wreck on the rocks
      P(c, '#2f2a44', [[98, 66], [104, 58], [118, 55], [134, 58], [146, 66]]);
      P(c, '#5a3a22', [[104, 58], [136, 50], [140, 56], [112, 62]]); R(c, '#3a2212', 110, 57, 20, 1); L(c, '#5a3a22', 120, 55, 112, 42, 2); P(c, '#d9d4c0', [[113, 44], [121, 48], [117, 54]]);
      // sand
      grad(c, 0, 88, 320, 52, ['#d9b47e', '#b8935e']);
      const w = Math.sin(e.t * 0.9) * 2; P(c, 'rgba(255,255,255,0.5)', [[76, 89 + w], [140, 91 + w], [220, 89 + w], [320, 92 + w], [320, 94 + w], [220, 91 + w], [140, 93 + w], [76, 91 + w]]);
      const r = seeded(17); for (let i = 0; i < 60; i++) R(c, r() > 0.5 ? '#c9a46e' : '#e2c48e', 30 + r() * 290, 96 + r() * 42, 2, 1);
      // cliff with the stone door and the three symbols
      P(c, '#5a4a5c', [[0, 0], [70, 0], [82, 28], [74, 62], [80, 98], [62, 108], [0, 114]]);
      P(c, '#4a3c4e', [[0, 0], [30, 0], [22, 40], [10, 60], [0, 70]]); for (let i = 0; i < 14; i++) R(c, '#6a5a6c', 6 + (i * 23) % 62, 6 + (i * 17) % 96, 5, 1);
      R(c, '#3a3040', 20, 56, 34, 50); E(c, '#3a3040', 37, 58, 17, 6);
      if (e.g.flag('grotta_aperta')) { R(c, '#08060e', 23, 58, 28, 48); E(c, '#08060e', 37, 59, 14, 4); }
      else { R(c, '#8a7f8a', 23, 58, 28, 48); E(c, '#8a7f8a', 37, 59, 14, 4); R(c, '#6a606c', 37, 56, 1, 50); R(c, '#6a606c', 26, 70, 22, 1); R(c, '#6a606c', 26, 90, 22, 1); }
      symbolTile(c, e, 58, 'P', 'fish'); symbolTile(c, e, 71, 'L', 'moon'); symbolTile(c, e, 84, 'T', 'skull');
      if (!e.g.flag('bottiglia_presa')) { const b = Math.round(Math.sin(e.t * 2)); R(c, '#3aa655', 177, 92 + b, 9, 5); R(c, '#3aa655', 186, 93 + b, 3, 3); R(c, '#c9a36a', 189, 93 + b, 2, 3); R(c, '#f4f1e8', 179, 93 + b, 5, 3); }
      // shadow of the palm, crossing itself: the X of the treasure map
      L(c, 'rgba(60,40,30,0.35)', 240, 122, 282, 130, 2);
      if (e.g.flag('scavato')) { E(c, '#5a4226', 271, 126, 8, 4); E(c, '#3a2a16', 271, 127, 6, 2.5); E(c, '#c9a46e', 284, 128, 6, 3); }
      else if (e.g.flag('mappa_letta')) { L(c, '#a8452a', 264, 121, 278, 131, 2); L(c, '#a8452a', 278, 121, 264, 131, 2); }
      else L(c, 'rgba(60,40,30,0.35)', 278, 121, 264, 131, 2);
    },
    sprites: [
      [118, (c, e) => { const moved = e.g.flag('sasso_spostato'), x = moved ? 145 : 139;
        if (moved) E(c, '#a8835a', 133, 113, 6, 2);
        else { const wv = Math.round(Math.sin(e.t * 5)); R(c, '#e88ab0', 126 + wv, 114, 3, 2); R(c, '#e88ab0', 125, 116, 2, 1); }
        E(c, '#8a8690', x, 111, 12, 6); E(c, '#a09ca8', x - 2, 109, 8, 3); }],
      [121, (c, e) => { // crooked palm
        const pts = [[232, 120], [234, 106], [237, 92], [241, 78], [245, 66], [248, 58]];
        for (let i = 0; i < pts.length - 1; i++) { L(c, '#7a5230', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 5 - i * 0.5); R(c, '#5a3a22', pts[i][0] - 2, pts[i][1] - 6, 5, 1); }
        const sway = Math.sin(e.t * 0.8) * 1.5;
        [[-26, 4], [-20, -8], [-6, -12], [10, -10], [14, 2], [-12, 8], [4, 10]].forEach((d, i) => {
          P(c, i % 2 ? '#2f8a3a' : '#3aa64a', [[248, 58], [248 + d[0] * 0.5, 56 + d[1] * 0.9 - 3], [248 + d[0] + sway, 58 + d[1] + 4], [248 + d[0] * 0.5, 58 + d[1] * 0.5 + 2]]);
        });
        if (!e.g.flag('cocco_caduto')) { E(c, '#5a3a22', 245, 62, 3); R(c, '#7a5230', 244, 60, 1, 1); } }],
      [134, (c, e) => crab(c, e, 108 + Math.round(Math.sin(e.t * 0.7) * 11), 129)],
    ],
  };

  rooms.grotta = {
    draw(c, e) {
      grad(c, 0, 0, 320, 104, ['#14101e', '#2a2238']);
      const r = seeded(41);
      for (let i = 0; i < 26; i++) { const x = r() * 320, h = 8 + r() * 24; P(c, i % 2 ? '#1e1a2c' : '#322a44', [[x - 6, 0], [x + 6, 0], [x, h]]); }
      P(c, '#221c30', [[0, 104], [0, 40], [20, 44], [16, 104]]); P(c, '#221c30', [[320, 104], [320, 30], [296, 50], [304, 104]]);
      grad(c, 0, 104, 320, 36, ['#3a3046', '#2a2236']); for (let i = 0; i < 40; i++) R(c, '#463a54', r() * 320, 106 + r() * 32, 3, 1);
      grad(c, 0, 50, 13, 58, ['#5a3468', '#f09a5a']); R(c, '#14101e', 13, 46, 3, 64); glow(c, 6, 90, 40, '240,154,90', 0.25);
      // clothes line of odd socks, coins, blue crystals
      L(c, '#8a7a5a', 70, 40, 150, 46, 0.5); ['#d33', '#3a7bd5', '#ffd23f', '#3aa655', '#d16ad1'].forEach((col, i) => { R(c, col, 82 + i * 14, 42 + i * 0.8, 3, 7); R(c, col, 84 + i * 14, 47 + i * 0.8, 3, 2); });
      for (let i = 0; i < 9; i++) E(c, '#ffd23f', 150 + r() * 120, 108 + r() * 6, 1.5, 1);
      for (let i = 0; i < 7; i++) { const x = 270 + r() * 28, y = 64 + r() * 26, h = 5 + r() * 9; P(c, '#5ad0e8', [[x - 2, y + h], [x, y], [x + 3, y + h]]); P(c, '#b8f0ff', [[x, y + h], [x, y], [x + 1, y + h]]); }
      glow(c, 284, 76, 26, '90,208,232', 0.25 + Math.sin(e.t * 2) * 0.08);
      P(c, '#2e2640', [[176, 106], [182, 70], [200, 62], [216, 72], [220, 106]]);
      skeleton(c, e, 200, 106, e.g.flag('scrigno_aperto'));
      // treasure chest
      const open = e.g.flag('scrigno_aperto');
      R(c, '#7a5230', 217, 90, 36, 16); R(c, '#c9a13a', 217, 96, 36, 2); R(c, '#c9a13a', 222, 90, 2, 16); R(c, '#c9a13a', 246, 90, 2, 16);
      if (open) {
        P(c, '#6a4226', [[217, 90], [221, 74], [257, 74], [253, 90]]); R(c, '#c9a13a', 221, 74, 36, 2); R(c, '#14101e', 219, 88, 32, 3);
        if (!e.g.flag('cristallo_preso')) { P(c, '#7af0ff', [[226, 89], [229, 79], [236, 77], [241, 82], [240, 89]]); P(c, '#d8fbff', [[230, 88], [231, 81], [235, 79], [234, 88]]); glow(c, 233, 83, 24, '122,240,255', 0.5 + Math.sin(e.t * 3) * 0.15); }
      } else { R(c, '#8a623a', 217, 84, 36, 7); R(c, '#c9a13a', 217, 84, 36, 2); R(c, '#c9a13a', 233, 89, 4, 4); }
    },
    sprites: [],
    // darkness everywhere except around the lantern Fili carries
    overlay(c, e, px, py) {
      const g = c.createRadialGradient(px, py - 14, 12, px, py - 14, 120 + Math.sin(e.t * 6) * 2);
      g.addColorStop(0, 'rgba(255,200,100,0.10)'); g.addColorStop(0.35, 'rgba(10,6,20,0.25)'); g.addColorStop(1, 'rgba(6,4,14,0.9)');
      c.fillStyle = g; c.fillRect(0, 0, 320, 140);
    },
  };

  function grass(c, y) {
    grad(c, 0, y, 320, 140 - y, ['#2f5a3a', '#234a30']);
    const r = seeded(51);
    for (let i = 0; i < 90; i++) {
      const x = r() * 320, yy = y + 2 + r() * (138 - y);
      R(c, r() > 0.5 ? '#3a6a44' : '#1f4028', x, yy, 1, 2);
    }
    for (let i = 0; i < 42; i++) {
      const x = r() * 320, yy = y + 3 + r() * (138 - y), height = 1.5 + r() * 3;
      P(c, i % 2 ? 'rgba(77,139,73,0.65)' : 'rgba(27,65,41,0.7)', [
        [x - 3, yy], [x - 1, yy - height], [x - 0.4, yy], [x + 1.2, yy - height * 0.7],
        [x + 2, yy], [x + 4, yy - height * 0.55], [x + 4, yy + 0.5],
      ]);
    }
  }
  rooms.faro_esterno = {
    draw(c, e) {
      nightSky(c, e, 100); moon(c, 290, 20);
      sea(c, e, 70, 30, '#2a2f6a', '#1c2050', 19);
      if (e.g.flag('faro_acceso')) { const a = e.t * 0.9; P(c, 'rgba(255,243,160,0.22)', [[231, 2], [231 + Math.cos(a) * 320, -20 + Math.sin(a * 0.7) * 30], [231 + Math.cos(a) * 320, 40 + Math.sin(a * 0.7) * 30]]); glow(c, 231, 2, 46, '255,243,160', 0.55); }
      // the village down below
      P(c, '#1c1a3a', [[0, 100], [0, 84], [30, 78], [70, 82], [100, 100]]);
      [[8, 82, 12], [24, 78, 14], [42, 80, 12], [58, 84, 12], [76, 88, 10]].forEach((h, i) => { R(c, '#2f2a50', h[0], h[1], h[2], 14); P(c, '#3a2a48', [[h[0] - 1, h[1]], [h[0] + h[2] / 2, h[1] - 5], [h[0] + h[2] + 1, h[1]]]); R(c, blink(e, 0.3, i * 1.7) ? '#ffd27a' : '#e0b860', h[0] + 3, h[1] + 4, 3, 3); });
      grass(c, 98); P(c, '#6a5f58', [[0, 140], [0, 118], [120, 112], [222, 106], [240, 106], [150, 122], [40, 140]]);
      if (e.g.flag('cap2')) { P(c, '#6a5f58', [[240, 106], [270, 110], [320, 118], [320, 132], [280, 124], [236, 112]]); E(c, '#1f4028', 300, 106, 12, 6); E(c, '#2f5a3a', 312, 110, 10, 5); }
      // tower
      P(c, '#d9d4d0', [[204, 104], [212, 0], [250, 0], [258, 104]]);
      for (let y = 12; y < 104; y += 36) P(c, '#b8404a', [[211 - y * 0.077 + 0.9, y], [251 + y * 0.077 - 0.9, y], [252.4 + y * 0.077, y + 18], [209.6 - y * 0.077, y + 18]]);
      P(c, 'rgba(0,0,0,0.18)', [[240, 0], [250, 0], [258, 104], [244, 104]]);
      R(c, '#2a2438', 228, 30, 6, 9); R(c, '#3a3550', 229, 31, 4, 7);
      const open = e.g.flag('porta_faro_aperta');
      R(c, '#2a2438', 219, 72, 22, 32); E(c, '#2a2438', 230, 73, 11, 5);
      R(c, open ? '#0c0a14' : '#6a3f22', 221, 74, 18, 30); E(c, open ? '#0c0a14' : '#6a3f22', 230, 75, 9, 4);
      if (open) { P(c, '#6a3f22', [[221, 72], [226, 76], [226, 104], [221, 104]]); R(c, '#ffd23f', 224, 90, 1, 2); }
      else { R(c, '#3a2212', 230, 72, 1, 32); R(c, '#e8c15a', 234, 88, 2, 3); R(c, '#111', 234, 89, 1, 1); }
      // flower bed
      E(c, '#4a3220', 80, 111, 22, 6); const r = seeded(61); for (let i = 0; i < 9; i++) { const x = 62 + r() * 36, y = 108 + r() * 6; R(c, '#3aa64a', x, y, 1, 3); R(c, ['#ffd23f', '#e88ab0', '#f4f1e8'][i % 3], x - 1, y - 2, 3, 2); }
      // hammock and the sleepy keeper
      R(c, '#5a3a22', 139, 70, 3, 36); R(c, '#5a3a22', 184, 70, 3, 36);
      const awake = e.speaker === 'sbadiglio';
      c.strokeStyle = '#d9c8a0'; c.lineWidth = 1; c.beginPath(); c.moveTo(141, 76); c.quadraticCurveTo(163, 104, 185, 76); c.stroke();
      P(c, '#c9b88a', [[144, 80], [152, 89], [163, 92], [174, 89], [182, 80], [176, 94], [163, 98], [150, 94]]);
      E(c, '#3a6a8a', 166, 87, 11, 4); R(c, '#f2c9a0', 147, 80, 7, 7); R(c, '#1c2a5a', 146, 78, 9, 3); R(c, '#1c2a5a', 150, 80, 6, 1);
      R(c, '#222', 149, 83, 2, 1); R(c, '#7a2a2a', 150, 85, 2, awake && blink(e, 8) ? 2 : 1); R(c, '#bcaaa4', 147, 86, 6, 2); R(c, '#3a2a2a', 177, 83, 4, 3);
      if (!awake) zzz(c, e, 152, 76);
    },
    sprites: [
      [114, (c, e) => { if (!e.g.flag('pala_presa')) { R(c, '#8a623a', 84, 90, 2, 18); R(c, '#8a623a', 82, 90, 6, 2); R(c, '#9aa0a8', 82, 106, 6, 7); L(c, '#ddd', 86, 94, 90, 99, 0.5); } }],
    ],
  };

  function gear(c, x, y, r, a, col, teeth) {
    c.save(); c.translate(x, y); c.rotate(a);
    for (let i = 0; i < teeth; i++) { c.rotate((Math.PI * 2) / teeth); R(c, col, -2, -r - 3, 4, 5); }
    E(c, col, 0, 0, r); E(c, '#2a2630', 0, 0, r * 0.55); R(c, col, -r, -1, r * 2, 2); R(c, col, -1, -r, 2, r * 2); E(c, col, 0, 0, r * 0.22);
    c.restore();
  }
  rooms.faro_interno = {
    draw(c, e) {
      bricks(c, 0, 0, 320, 104, '#55505e', '#454050'); grad(c, 0, 0, 320, 30, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']);
      planks(c, 104, 36, '#6a5a50', '#4f433c', 5);
      exitDoor(c, true);
      R(c, '#2a1a12', 78, 26, 1, 8); R(c, '#ffd23f', 75, 34, 7, 6); glow(c, 78, 37, 44, '255,210,90', 0.3);
      // empty oil barrels
      [[27, 84], [42, 88]].forEach((b) => { R(c, '#7a5230', b[0], b[1], 16, 20); R(c, '#3a3a44', b[0], b[1] + 3, 16, 2); R(c, '#3a3a44', b[0], b[1] + 15, 16, 2); P(c, '#e0a030', [[b[0] + 8, b[1] + 6], [b[0] + 11, b[1] + 11], [b[0] + 8, b[1] + 13], [b[0] + 5, b[1] + 11]]); });
      // gears
      const on = e.g.flag('botola_aperta'), a = on ? e.t * 0.6 : 0.3;
      R(c, '#3a3640', 100, 42, 74, 62); R(c, '#2a2630', 103, 45, 68, 56);
      gear(c, 126, 72, 18, a, '#b08a3a', 10); gear(c, 155, 58, 10, -a * 1.8 + 0.3, '#9aa0a8', 8); gear(c, 153, 88, 9, a * 2, '#8a623a', 7);
      R(c, '#14101a', 124, 70, 5, 5);
      if (on) { R(c, '#9aa0a8', 125, 71, 3, 3); L(c, '#9aa0a8', 126, 72, 126 + Math.cos(a) * 14, 72 + Math.sin(a) * 14, 2); E(c, '#6a4226', 126 + Math.cos(a) * 14, 72 + Math.sin(a) * 14, 2); }
      L(c, '#777', 160, 45, 160, 0, 1); L(c, '#777', 164, 45, 164, 0, 1);
      // spiral staircase and the trapdoor above it
      R(c, '#2a2630', 228, 0, 70, 10); R(c, on ? '#101030' : '#6a4226', 240, 0, 46, 8); if (on) { R(c, '#fff', 250, 3, 1, 1); R(c, '#fff', 270, 5, 1, 1); } else { R(c, '#3a2212', 262, 0, 1, 8); R(c, '#c9a13a', 258, 5, 3, 2); }
      R(c, '#3a3640', 261, 8, 4, 98);
      for (let i = 0; i < 12; i++) { const y = 100 - i * 8, left = i % 2 === 0, w = 30 - (i % 3) * 3; R(c, '#8a623a', left ? 263 - w : 263, y, w, 3); R(c, '#5a3a22', left ? 263 - w : 263, y + 3, w, 1); R(c, '#3a3640', left ? 263 - w : 262 + w, y - 10, 1, 10); }
    },
    sprites: [],
  };

  rooms.faro_cima = {
    draw(c, e) {
      const lit = e.g.flag('faro_acceso');
      nightSky(c, e, 62); moon(c, 60, 22); sea(c, e, 60, 24, '#2a2f6a', '#151840', 23);
      const r = seeded(71); for (let i = 0; i < 10; i++) { const x = r() * 320; P(c, '#0e0e24', [[x - 5, 84], [x, 76 + r() * 5], [x + 6, 84]]); }
      if (lit) { const a = e.t * 0.9; P(c, 'rgba(255,243,160,0.3)', [[160, 54], [160 + Math.cos(a) * 300, 20 + Math.sin(a * 0.7) * 30], [160 + Math.cos(a) * 300, 80 + Math.sin(a * 0.7) * 30]]); }
      if (e.g.flag('ammiraglio_volato')) { // hole with the shape of the Admiral
        E(c, '#05050f', 282, 34, 12, 9); R(c, '#05050f', 272, 38, 20, 30); R(c, '#05050f', 266, 44, 32, 6);
        [[262, 30, 256, 22], [300, 34, 308, 28], [270, 70, 262, 78], [296, 66, 304, 74]].forEach((k) => L(c, 'rgba(255,255,255,0.7)', k[0], k[1], k[2], k[3], 0.5));
      }
      for (let x = 0; x <= 320; x += 40) R(c, '#3a3040', x - 2, 0, 4, 84);
      R(c, '#3a3040', 0, 0, 320, 4); R(c, 'rgba(180,220,255,0.06)', 0, 4, 320, 78);
      bricks(c, 0, 82, 320, 22, '#55505e', '#454050'); R(c, '#6a6474', 0, 82, 320, 2);
      planks(c, 104, 36, '#6a5a50', '#4f433c', 5);
      R(c, '#14101a', 20, 113, 32, 12); R(c, '#3a2a20', 18, 111, 36, 2); R(c, '#8a623a', 26, 113, 2, 12); R(c, '#8a623a', 42, 113, 2, 12); R(c, '#8a623a', 26, 117, 18, 2);
      if (lit) glow(c, 160, 56, 150, '255,243,160', 0.5);
    },
    sprites: [
      [106, (c, e) => { // the great lamp
        const lit = e.g.flag('faro_acceso');
        R(c, '#3a3640', 148, 86, 24, 20); R(c, '#55505e', 144, 84, 32, 4); R(c, '#55505e', 146, 102, 28, 4);
        R(c, '#2a2630', 152, 90, 16, 10); if (e.g.flag('olio_versato')) R(c, '#e0a030', 153, 92, 14, 7);
        R(c, '#b08a3a', 142, 28, 36, 3); R(c, '#b08a3a', 142, 81, 36, 3); P(c, '#8a6a2a', [[146, 28], [160, 20], [174, 28]]);
        [142, 154, 164, 176].forEach((x) => R(c, '#b08a3a', x, 28, 2, 56));
        if (e.g.flag('lente_montata')) {
          P(c, lit ? '#fffbe0' : '#7af0ff', [[160, 36], [172, 50], [168, 72], [152, 72], [148, 50]]); P(c, lit ? '#ffffff' : '#d8fbff', [[160, 38], [165, 50], [160, 70], [156, 50]]);
          glow(c, 160, 54, lit ? 60 : 26, lit ? '255,243,160' : '122,240,255', lit ? 0.9 : 0.35 + Math.sin(e.t * 3) * 0.1);
        } else { R(c, '#55505e', 156, 72, 8, 9); R(c, '#3a3640', 154, 70, 12, 2); }
        if (lit) flame(c, e, 160, 80, 3); }],
      [108, (c, e) => { if (e.g.flag('ammiraglio_arrivato') && !e.g.flag('ammiraglio_volato')) person(c, 200, 108, Object.assign({ dir: 1 }, ADMIRAL), e); }],
    ],
  };

  // ================= CHAPTER 2: the black ship =================
  function crate(c, x, y, w, h) { R(c, '#7a5230', x, y, w, h); R(c, '#5a3a22', x, y, w, 1); R(c, '#5a3a22', x, y + h - 1, w, 1); R(c, '#5a3a22', x, y, 1, h); R(c, '#5a3a22', x + w - 1, y, 1, h); L(c, '#5a3a22', x, y, x + w, y + h, 1); }
  function barrel(c, x, y, mark) { R(c, '#7a5230', x, y, 16, 20); R(c, '#8a623a', x + 2, y, 3, 20); R(c, '#3a3a44', x, y + 3, 16, 2); R(c, '#3a3a44', x, y + 15, 16, 2); if (mark) P(c, '#e0a030', [[x + 8, y + 6], [x + 11, y + 11], [x + 8, y + 13], [x + 5, y + 11]]); }
  function kraken(c, e, x, y, warm) { // the lens of the lighthouse
    P(c, warm ? '#ffe9a8' : '#7af0ff', [[x - 7, y + 10], [x - 4, y - 1], [x + 3, y - 4], [x + 8, y + 2], [x + 7, y + 10]]); P(c, '#ffffff', [[x - 3, y + 9], [x - 2, y + 1], [x + 2, y - 2], [x + 1, y + 9]]);
    glow(c, x, y + 3, 24, warm ? '255,233,168' : '122,240,255', 0.5 + Math.sin(e.t * 3) * 0.15);
  }
  const TRICHECO = { id: 'tricheco', shirt: '#2a3a6a', stripes: '#f4f1e8', pants: '#33333f', w: 18, bh: 16, lh: 10, skin: '#e8b090', dir: -1 };

  rooms.cala = {
    draw(c, e) {
      nightSky(c, e, 96); moon(c, 122, 16);
      sea(c, e, 68, 36, '#2a2f6a', '#151840', 29);
      R(c, 'rgba(255,246,200,0.22)', 112, 70, 20, 1); R(c, 'rgba(255,246,200,0.16)', 108, 75, 28, 1); R(c, 'rgba(255,246,200,0.10)', 114, 81, 16, 1);
      // the cliff with the lit lighthouse
      P(c, '#1c1a3a', [[0, 104], [0, 40], [18, 34], [44, 42], [58, 66], [72, 104]]); P(c, '#26234a', [[0, 104], [0, 62], [20, 56], [40, 70], [52, 104]]);
      lighthouse(c, 26, 8, 10, 26, true, e);
      // the black ship
      const b = Math.round(Math.sin(e.t * 1.1)), wv = Math.sin(e.t * 3) * 2;
      R(c, '#1c1a26', 214, 2 + b, 3, 58); R(c, '#1c1a26', 281, 8 + b, 3, 48);
      P(c, '#24222e', [[194, 12 + b], [236, 12 + b], [240, 42 + b], [190, 42 + b]]); P(c, '#24222e', [[266, 16 + b], [298, 16 + b], [301, 40 + b], [263, 40 + b]]);
      E(c, '#dcd8c8', 214, 27 + b, 5, 3); E(c, '#dcd8c8', 283, 28 + b, 4, 3); R(c, '#1c1a26', 188, 11 + b, 54, 2); R(c, '#1c1a26', 261, 15 + b, 42, 2);
      P(c, '#b8404a', [[217, 2 + b], [231, 5 + b + wv], [217, 9 + b]]);
      L(c, '#3a3640', 215, 6 + b, 160, 58 + b, 0.5); L(c, '#3a3640', 283, 12 + b, 318, 54 + b, 0.5);
      P(c, '#14121e', [[150, 60 + b], [320, 52 + b], [320, 100], [170, 100]]); P(c, '#1e1c2a', [[150, 60 + b], [320, 52 + b], [320, 58 + b], [153, 66 + b]]);
      R(c, '#b08a3a', 160, 70 + b, 160, 1); for (let x = 184; x < 320; x += 28) { E(c, '#2a2636', x, 82 + b, 4); E(c, '#ffd27a', x, 82 + b, 2.5); }
      P(c, '#b08a3a', [[150, 60 + b], [140, 56 + b], [150, 64 + b]]);
      R(c, '#3a3a44', 160, 51 + b, 18, 5); E(c, '#3a3a44', 177, 53 + b, 4); R(c, '#55505e', 156, 52 + b, 5, 3); // the cannon, aimed at the lighthouse
      // beach
      grad(c, 0, 100, 320, 40, ['#8a7c74', '#5f544e']);
      const w = Math.sin(e.t * 0.9) * 2; P(c, 'rgba(255,255,255,0.4)', [[70, 101 + w], [150, 103 + w], [240, 101 + w], [320, 103 + w], [320, 105 + w], [240, 103 + w], [150, 105 + w], [70, 103 + w]]);
      const r = seeded(77); for (let i = 0; i < 60; i++) R(c, r() > 0.5 ? '#6f6258' : '#a09288', r() * 320, 108 + r() * 30, 2, 1);
      P(c, '#6a5f58', [[0, 140], [0, 112], [26, 114], [44, 124], [30, 140]]);
      // gangplank
      P(c, '#6a4226', [[250, 110], [262, 110], [294, 84 + b], [284, 84 + b]]); for (let i = 0; i < 5; i++) L(c, '#4a2a16', 254 + i * 7, 107 - i * 5, 261 + i * 7, 107 - i * 5, 1);
      // sign
      R(c, '#5a3a22', 123, 92, 2, 16); R(c, '#e8d8a8', 116, 84, 16, 10); R(c, '#8a623a', 116, 84, 16, 1); E(c, '#f4f1e8', 124, 88, 3, 2); L(c, '#d33', 118, 86, 130, 92, 1);
    },
    sprites: [
      [110, (c) => { crate(c, 58, 96, 20, 14); crate(c, 80, 94, 22, 16); crate(c, 68, 86, 16, 10); R(c, '#e8d8a8', 84, 99, 12, 4); E(c, '#c9a13a', 76, 85, 4, 2); }],
      [112, (c, e) => { person(c, 231, 112, TRICHECO, e); R(c, '#f4f1e8', 226, 83, 10, 2); R(c, '#f4f1e8', 225, 84, 2, 3); R(c, '#f4f1e8', 235, 84, 2, 3); E(c, '#f4f1e8', 231, 77, 4, 2); E(c, '#dcd8c8', 230, 76, 1.5); }],
      [122, (c, e) => { if (!e.g.flag('pirati_arrivati')) return;
        person(c, 40, 122, { id: 'ciurma', shirt: '#b8404a', pants: '#333', hat: 'bandana', beard: '#4a2a16' }, e);
        person(c, 58, 124, { id: 'ciurma', shirt: '#3a6a4a', pants: '#333', hat: 'tricorn', patch: true, skin: '#d9a87a' }, e);
        person(c, 76, 122, { id: 'ciurma', shirt: '#6a5a8a', pants: '#333', hat: 'bandana', hatc: '#2a6ad0', skin: '#f0b89a', beard: '#888' }, e); }],
    ],
  };

  rooms.ponte = {
    draw(c, e) {
      nightSky(c, e, 84); moon(c, 244, 16);
      sea(c, e, 66, 22, '#2a2f6a', '#151840', 31);
      P(c, '#1c1a3a', [[0, 70], [8, 56], [30, 46], [54, 54], [72, 70]]); lighthouse(c, 31, 18, 9, 26, true, e);
      // sails and ropes
      P(c, '#1c1a26', [[96, 0], [152, 0], [152, 34], [108, 28]]); P(c, '#1c1a26', [[166, 0], [232, 0], [224, 30], [166, 36]]); E(c, '#dcd8c8', 128, 14, 6, 4); E(c, '#dcd8c8', 198, 18, 5, 3);
      L(c, '#4a4252', 158, 4, 20, 86, 0.5); L(c, '#4a4252', 158, 4, 262, 44, 0.5); L(c, '#4a4252', 158, 30, 110, 86, 0.5);
      // rail and deck
      R(c, '#2a2030', 0, 84, 320, 3); for (let x = 6; x < 320; x += 14) R(c, '#2a2030', x, 86, 2, 18);
      planks(c, 104, 36, '#5a4636', '#3f3026', 5); R(c, 'rgba(0,0,0,0.3)', 0, 104, 320, 2);
      R(c, '#6a4226', 0, 98, 14, 8); R(c, '#4a2a16', 0, 98, 14, 1);
      // mast with the crow's nest and the lookout
      R(c, '#3a2a1e', 155, 0, 7, 106); R(c, '#2a1c14', 160, 0, 2, 106);
      const talk = e.speaker === 'vedetta' && blink(e, 8);
      R(c, '#f2c9a0', 155, 6, 7, 7); E(c, '#f4f1e8', 158, 5, 5, 2); R(c, '#222', 157, 9, 1, 1); R(c, '#222', 160, 9, 1, 1); R(c, '#7a2a2a', 158, 11, 2, talk ? 2 : 1);
      R(c, '#2a3a6a', 153, 13, 11, 6); L(c, '#b08a3a', 163, 10, 172, 7, 2);
      R(c, '#4a3626', 144, 17, 30, 9); R(c, '#3a2a1e', 142, 16, 34, 2); for (let x = 148; x < 174; x += 6) R(c, '#3a2a1e', x, 18, 1, 8);
      // cabin
      R(c, '#3a2a22', 262, 40, 58, 66); for (let x = 268; x < 320; x += 10) R(c, '#2e2019', x, 44, 1, 62); R(c, '#2a1c16', 258, 36, 62, 5);
      R(c, '#2a1c16', 271, 55, 28, 51); R(c, '#5a3520', 273, 57, 24, 49); R(c, '#e8d8a8', 276, 61, 18, 7); R(c, '#8a623a', 278, 63, 14, 1); R(c, '#8a623a', 278, 65, 10, 1);
      E(c, '#b08a3a', 285, 76, 5); E(c, e.g.flag('ammiraglio_dorme') ? '#1a1a40' : '#ffd27a', 285, 76, 3.5); R(c, '#2a1c16', 279, 90, 12, 7); R(c, '#e8c15a', 294, 84, 2, 3);
      R(c, '#2a1a12', 308, 46, 1, 6); R(c, '#ffd23f', 305, 52, 7, 6); glow(c, 308, 55, 30, '255,210,90', 0.35);
      if (e.g.flag('ammiraglio_dorme')) zzz(c, e, 286, 54);
      // stove and soup pot
      R(c, '#2a2a30', 186, 96, 30, 10); R(c, '#14101a', 190, 99, 22, 6); flame(c, e, 197, 105, 2); flame(c, e, 205, 105, 2.5); glow(c, 201, 100, 22, '255,140,40', 0.35);
      R(c, '#4a4a56', 190, 84, 22, 12); R(c, '#5a5a66', 188, 83, 26, 3); E(c, '#c9a13a', 201, 84, 10, 2);
      const st = (e.t * 1.2) % 1; R(c, 'rgba(255,255,255,0.3)', 196, 78 - st * 8, 2, 3); R(c, 'rgba(255,255,255,0.22)', 204, 76 - st * 6, 2, 3); E(c, '#e0c060', 198 + st * 5, 84 - st * 2, 1 + st);
      // trapdoor to the hold
      R(c, '#14101a', 222, 113, 34, 12); R(c, '#3a2a20', 220, 111, 38, 2); R(c, '#8a623a', 230, 113, 2, 12); R(c, '#8a623a', 246, 113, 2, 12); R(c, '#8a623a', 230, 118, 18, 2);
    },
    sprites: [
      [108, (c, e) => { // the cannon
        const wet = e.g.flag('cannone_bagnato');
        P(c, '#2a2a34', [[36, 86], [44, 84], [76, 94], [74, 102], [40, 96]]); E(c, '#3a3a46', 40, 89, 5, 6); E(c, '#0c0a14', 39, 89, 3, 4);
        R(c, '#3a3a46', 54, 90, 3, 9); E(c, '#5a3a22', 52, 104, 6); E(c, '#3a2212', 52, 104, 2); E(c, '#5a3a22', 70, 104, 6); E(c, '#3a2212', 70, 104, 2); R(c, '#5a3a22', 50, 98, 24, 4);
        if (wet) { P(c, '#f39c12', [[37, 88], [33, 85], [33, 92]]); const d = (e.t * 1.4) % 1; R(c, '#5ab0e0', 46, 98 + d * 8, 1, 2); R(c, '#5ab0e0', 62, 100 + d * 6, 1, 2); E(c, 'rgba(90,176,224,0.5)', 56, 108, 12, 2); }
        else { L(c, '#c9a36a', 74, 95, 80, 90, 1); R(c, '#d33', 80, 89, 1, 1); } }],
      [110, (c, e) => { if (!e.g.flag('secchio_preso')) { P(c, '#8a8f98', [[93, 98], [104, 98], [102, 108], [95, 108]]); E(c, '#5ab0e0', 98.5, 98, 5.5, 1.5); R(c, '#6a6f78', 94, 102, 9, 1); c.strokeStyle = '#55505e'; c.lineWidth = 0.8; c.beginPath(); c.arc(98.5, 98, 5, Math.PI, 0); c.stroke(); } }],
    ],
  };

  rooms.cabina = {
    draw(c, e) {
      interior(c, '#4a2a3a', '#3c2030', '#6a4a3a', '#4f3528');
      exitDoor(c, true);
      R(c, '#2a1a12', 120, 7, 1, 8); R(c, '#ffd23f', 117, 15, 7, 6); glow(c, 120, 18, 40, '255,210,90', 0.3);
      // portrait of himself
      R(c, '#c9a13a', 58, 22, 32, 38); R(c, '#3a4a6a', 61, 25, 26, 32); R(c, '#f0b89a', 70, 34, 8, 8); E(c, '#f4f1e8', 74, 32, 8, 5); E(c, '#f4f1e8', 66, 39, 2, 4); E(c, '#f4f1e8', 82, 39, 2, 4);
      R(c, '#222', 72, 37, 1, 2); R(c, '#222', 75, 37, 1, 2); R(c, '#7a2a2a', 73, 40, 2, 1); R(c, '#1c2a5a', 66, 43, 16, 14); R(c, '#ffd23f', 73, 46, 1, 1); R(c, '#ffd23f', 73, 50, 1, 1);
      // the map of the wrecks
      R(c, '#e8d8a8', 150, 20, 46, 32); R(c, '#c9b888', 150, 20, 46, 2); R(c, '#c9b888', 150, 50, 46, 2); E(c, '#7fb8d8', 172, 36, 16, 10); E(c, '#3aa655', 170, 35, 5, 3);
      [[158, 30], [184, 28], [162, 44], [186, 42], [176, 26]].forEach((p) => { L(c, '#d33', p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2, 1); L(c, '#d33', p[0] + 2, p[1] - 2, p[0] - 2, p[1] + 2, 1); });
      // round window
      E(c, '#2a1a12', 252, 34, 11); E(c, '#1a1a40', 252, 34, 9); E(c, '#fff6c8', 255, 31, 3); R(c, '#2a1a12', 251, 25, 2, 18); R(c, '#2a1a12', 243, 33, 18, 2);
      // the chest of "not wigs"
      R(c, '#7a5230', 104, 90, 36, 16); R(c, '#c9a13a', 104, 96, 36, 2); R(c, '#c9a13a', 109, 90, 2, 16); R(c, '#c9a13a', 133, 90, 2, 16); R(c, '#8a623a', 104, 85, 36, 6); R(c, '#c9a13a', 104, 85, 36, 2);
      E(c, '#f4f1e8', 126, 88, 5, 3); E(c, '#dcd8c8', 124, 87, 2); R(c, '#e8d8a8', 112, 98, 16, 5);
      // bed with the sleeping Admiral
      const br = Math.round(Math.sin(e.t * 1.6));
      R(c, '#5a3520', 206, 70, 5, 36); R(c, '#5a3520', 291, 78, 5, 28); R(c, '#5a3520', 208, 92, 86, 12); R(c, '#d9d4d0', 211, 85, 80, 8); E(c, '#f4f1e8', 221, 85, 9, 4);
      E(c, '#1c2a5a', 262, 84 - br, 30, 9); R(c, '#1c2a5a', 234, 84, 58, 9); R(c, '#ffd23f', 240, 88, 50, 1);
      E(c, '#f0b89a', 223, 79, 7, 6); R(c, 'rgba(255,255,255,0.5)', 220, 75, 2, 1); R(c, '#222', 219, 79, 3, 1); R(c, '#222', 225, 79, 3, 1); E(c, '#7a2a2a', 223, 83, 2, 1 + (br > 0 ? 1 : 0));
      if (!e.g.flag('chiavetta_presa')) { L(c, '#ffd23f', 230, 82, 240, 80 - br, 0.5); E(c, '#ffd23f', 241, 79 - br, 2); R(c, '#ffd23f', 242, 79 - br, 5, 1); R(c, '#ffd23f', 245, 80 - br, 1, 2); glow(c, 242, 79, 8, '255,220,90', 0.4 + Math.sin(e.t * 4) * 0.15); }
      P(c, '#d9d4d0', [[270, 78 - br], [282, 78 - br], [279, 83 - br], [273, 83 - br]]);
      zzz(c, e, 226, 70);
      // empty wig stand
      R(c, '#6a4226', 301, 82, 2, 22); E(c, '#8a623a', 302, 80, 4, 5); R(c, '#6a4226', 297, 103, 10, 2);
    },
    sprites: [],
  };

  rooms.stiva = {
    draw(c, e) {
      R(c, '#2e2019', 0, 0, 320, 104); for (let y = 12; y < 104; y += 13) R(c, '#241812', 0, y, 320, 1);
      for (let x = 50; x < 320; x += 64) { R(c, '#1c120e', x, 0, 6, 104); R(c, '#3a2a20', x + 1, 0, 1, 104); }
      R(c, '#1c120e', 0, 0, 320, 8);
      planks(c, 104, 36, '#4a3626', '#33251a', 5); R(c, 'rgba(0,0,0,0.35)', 0, 104, 320, 2);
      // ladder under the open hatch
      grad(c, 14, 0, 30, 22, ['#2a2560', '#45387a']); R(c, '#fff', 22, 6, 1, 1); R(c, '#fff', 36, 12, 1, 1); glow(c, 29, 20, 40, '120,130,220', 0.3);
      R(c, '#8a623a', 17, 8, 3, 98); R(c, '#8a623a', 38, 8, 3, 98); for (let y = 18; y < 104; y += 11) R(c, '#6a4226', 17, y, 24, 2);
      // all the lamp oil of the island
      barrel(c, 56, 86, true); barrel(c, 74, 86, true); barrel(c, 90, 86, true); barrel(c, 65, 68, true); barrel(c, 82, 68, true);
      // the pile of stolen things
      P(c, '#c9a13a', [[116, 106], [124, 92], [146, 82], [168, 92], [178, 106]]);
      const r = seeded(87); for (let i = 0; i < 30; i++) E(c, r() > 0.5 ? '#ffd23f' : '#e0a030', 122 + r() * 50, 94 + r() * 11, 1.6, 1);
      P(c, '#e0a030', [[126, 96], [130, 84], [138, 84], [142, 96]]); R(c, '#8a623a', 132, 80, 4, 4); E(c, '#8a5a1a', 134, 97, 2); // bell
      R(c, '#1c1c28', 150, 86, 24, 12); for (let i = 0; i < 8; i++) R(c, i % 2 ? '#111' : '#f4f1e8', 151 + i * 3, 94, 2, 4); // piano
      R(c, '#b08a3a', 144, 76, 1, 8); E(c, '#ffd23f', 144, 78, 5, 2); R(c, '#fff', 140, 75, 1, 2); R(c, '#fff', 148, 75, 1, 2); // chandelier
      for (let i = 0; i < 5; i++) E(c, ['#d33', '#3a7bd5', '#3aa655', '#d16ad1', '#f4f1e8'][i], 160 + i * 4, 103, 1.5, 1); // the mayor's bottle caps
      // ship rat
      const talk = e.speaker === 'topo', hop = talk && blink(e, 8) ? 1 : 0;
      E(c, '#8a8690', 189, 102 - hop, 5, 3); E(c, '#8a8690', 184, 100 - hop, 3, 2.5); E(c, '#d9a0a8', 183, 97 - hop, 1.5); R(c, '#111', 183, 100 - hop, 1, 1); R(c, '#e88ab0', 181, 101 - hop, 1, 1);
      L(c, '#d9a0a8', 194, 103, 199, 100 + Math.sin(e.t * 3) * 1.5, 0.6); R(c, '#2a3a6a', 183, 96 - hop, 4, 1); R(c, '#fff', 184, 95 - hop, 2, 1);
      // cage with the stolen lens
      const open = e.g.flag('gabbia_aperta');
      R(c, '#3a3640', 222, 56, 52, 4); R(c, '#3a3640', 222, 102, 52, 4); R(c, '#14101a', 224, 60, 48, 42);
      if (!e.g.flag('occhio_preso')) kraken(c, e, 248, 82, true);
      for (let x = 224; x <= 270; x += 6) { if (open && x > 232 && x < 262) continue; R(c, '#6a6474', x, 60, 2, 42); }
      if (open) { P(c, '#6a6474', [[262, 60], [278, 64], [278, 100], [262, 102]]); for (let i = 0; i < 3; i++) R(c, '#14101a', 265 + i * 4, 66, 2, 32); }
      else { R(c, '#ffd23f', 244, 78, 8, 7); R(c, '#e0a030', 246, 74, 4, 4); R(c, '#14101a', 247, 76, 2, 2); R(c, '#3a2a12', 247, 80, 2, 3); }
    },
    sprites: [],
    overlay(c, e, px, py) { // a hold is dark: only the lantern and the lens give light
      const g = c.createRadialGradient(px, py - 14, 14, px, py - 14, 150 + Math.sin(e.t * 6) * 2);
      g.addColorStop(0, 'rgba(255,200,100,0.10)'); g.addColorStop(0.45, 'rgba(10,6,20,0.2)'); g.addColorStop(1, 'rgba(6,4,14,0.78)');
      c.fillStyle = g; c.fillRect(0, 0, 320, 140);
      if (!e.g.flag('occhio_preso')) glow(c, 248, 84, 34, '255,233,168', 0.35);
    },
  };

  // ---------- title and ending picture ----------
  function island(c, e, lit) {
    nightSky(c, e, 100); moon(c, 262, 26);
    sea(c, e, 96, 44, '#2a2f6a', '#10123a', 81);
    P(c, '#16142e', [[40, 98], [70, 80], [110, 66], [150, 56], [176, 58], [210, 76], [250, 90], [280, 98]]);
    [[78, 84], [92, 80], [108, 82], [196, 84], [212, 88]].forEach((h, i) => { R(c, '#26224a', h[0], h[1], 10, 12); R(c, lit || i % 2 ? '#ffd27a' : '#3a3560', h[0] + 3, h[1] + 4, 3, 3); });
    lighthouse(c, 152, 18, 14, 36, lit, e);
    R(c, 'rgba(255,246,200,0.2)', 240, 100, 44, 1); R(c, 'rgba(255,246,200,0.14)', 246, 106, 32, 1);
    if (lit) for (let i = 0; i < 3; i++) { // fireworks
      const p = (e.t * 0.5 + i * 0.37) % 1, fx = 60 + i * 95, fy = 30 + (i % 2) * 14, col = ['#ff7b7b', '#7dff8a', '#ffe066'][i];
      for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; R(c, col, fx + Math.cos(a) * p * 22, fy + Math.sin(a) * p * 22 + p * p * 8, 1, 1); }
    }
    const b = Math.round(Math.sin(e.t * 1.5)); P(c, '#6a3f22', [[18, 112 + b], [46, 112 + b], [42, 119 + b], [22, 119 + b]]);
    if (!lit) person(c, 32, 114 + b, Object.assign({}, FILI, { sit: true, dir: 1 }), e);
  }

  // ---------- inventory icons (16 x 16) ----------
  const lantern = (c, fill, lit) => { R(c, '#3a3a44', 7, 1, 2, 2); R(c, '#3a3a44', 4, 3, 8, 2); R(c, '#9fb8c8', 5, 5, 6, 8); if (fill) R(c, '#e0a030', 5, 9, 6, 4); if (lit) { R(c, '#ffd23f', 7, 6, 2, 5); R(c, '#fff', 7, 8, 2, 2); } R(c, '#3a3a44', 4, 13, 8, 2); };
  const fish = (c, body, dark) => { E(c, body, 7, 8, 5, 3); P(c, body, [[11, 8], [15, 4], [15, 12]]); R(c, dark, 4, 7, 1, 1); R(c, dark, 7, 6, 1, 4); R(c, dark, 9, 7, 1, 2); };
  const ICONS = {
    lanterna: (c) => lantern(c, false, false),
    lanterna_piena: (c) => lantern(c, true, false),
    lanterna_accesa: (c) => lantern(c, true, true),
    galletta: (c) => { E(c, '#d9b06a', 8, 8, 6, 5); [[5, 6], [8, 5], [11, 7], [6, 9], [9, 10], [11, 10]].forEach((p) => R(c, '#8a623a', p[0], p[1], 1, 1)); },
    verme: (c) => { R(c, '#e88ab0', 3, 9, 4, 3); R(c, '#e88ab0', 6, 6, 3, 4); R(c, '#e88ab0', 8, 8, 4, 3); R(c, '#e88ab0', 11, 5, 3, 4); R(c, '#111', 12, 6, 1, 1); R(c, '#c96a90', 5, 9, 1, 3); R(c, '#c96a90', 9, 8, 1, 3); },
    pesce: (c) => fish(c, '#7fb8d8', '#2a4a6a'),
    pesce_fritto: (c) => { fish(c, '#e0a030', '#8a5a1a'); R(c, '#fff', 3, 3, 1, 2); R(c, '#fff', 7, 2, 1, 2); },
    chiave: (c) => { E(c, '#9aa0a8', 5, 5, 4); E(c, '#2a2630', 5, 5, 1.5); R(c, '#9aa0a8', 7, 7, 2, 2); L(c, '#9aa0a8', 7, 7, 13, 13, 2); R(c, '#9aa0a8', 10, 12, 2, 3); R(c, '#9aa0a8', 13, 10, 2, 2); },
    bottiglia: (c) => { R(c, '#3aa655', 5, 6, 6, 9); R(c, '#3aa655', 7, 3, 2, 3); R(c, '#c9a36a', 7, 1, 2, 2); R(c, '#f4f1e8', 6, 8, 4, 5); R(c, '#8a623a', 7, 9, 2, 1); R(c, '#8a623a', 7, 11, 2, 1); },
    mappa: (c) => { R(c, '#e8d8a8', 2, 3, 12, 10); R(c, '#c9b888', 2, 3, 2, 10); R(c, '#c9b888', 12, 3, 2, 10); L(c, '#8a623a', 5, 10, 8, 6, 0.6); L(c, '#8a623a', 8, 6, 10, 8, 0.6); R(c, '#d33', 10, 9, 1, 1); R(c, '#d33', 12, 11, 1, 1); R(c, '#d33', 12, 9, 1, 1); R(c, '#d33', 10, 11, 1, 1); R(c, '#d33', 11, 10, 1, 1); },
    pala: (c) => { L(c, '#8a623a', 3, 3, 10, 10, 2); R(c, '#8a623a', 1, 2, 4, 2); P(c, '#9aa0a8', [[9, 8], [13, 9], [15, 14], [12, 15], [8, 12]]); },
    dobloni: (c) => { E(c, '#c9a13a', 6, 11, 4, 2); E(c, '#ffd23f', 6, 10, 4, 2); E(c, '#c9a13a', 10, 7, 4, 2); E(c, '#ffd23f', 10, 6, 4, 2); E(c, '#ffd23f', 5, 5, 3, 2); R(c, '#fff', 9, 5, 1, 1); },
    dentiera: (c) => { R(c, '#d06a7a', 3, 4, 10, 3); R(c, '#d06a7a', 3, 10, 10, 3); for (let i = 0; i < 5; i++) { R(c, '#ffd23f', 3 + i * 2, 6, 2, 2); R(c, '#ffd23f', 3 + i * 2, 9, 2, 2); R(c, '#c9a13a', 4 + i * 2, 6, 1, 2); } R(c, '#fff', 4, 6, 1, 1); },
    olio: (c) => { R(c, '#e0a030', 4, 6, 8, 9); R(c, '#e0a030', 6, 3, 4, 3); R(c, '#6a4226', 6, 1, 4, 2); R(c, '#f4f1e8', 5, 8, 6, 4); P(c, '#d33', [[8, 8], [10, 10], [8, 12], [6, 10]]); },
    fiammiferi: (c) => { R(c, '#d33', 2, 6, 12, 7); R(c, '#ffd23f', 4, 7, 8, 5); R(c, '#3a2a2a', 2, 12, 12, 1); P(c, '#ff7b1c', [[8, 8], [10, 10], [8, 12], [6, 10]]); L(c, '#c9a36a', 9, 5, 13, 1, 1); R(c, '#7a2a2a', 13, 0, 2, 2); },
    cocco: (c) => { E(c, '#6a4226', 8, 8, 6); E(c, '#8a5a36', 6, 6, 3); R(c, '#2a1a12', 7, 9, 1, 1); R(c, '#2a1a12', 10, 8, 1, 1); R(c, '#2a1a12', 9, 11, 1, 1); },
    manovella: (c) => { R(c, '#9aa0a8', 3, 2, 2, 9); R(c, '#9aa0a8', 3, 10, 9, 2); R(c, '#6a4226', 11, 9, 3, 6); R(c, '#55505e', 2, 1, 4, 2); },
    fagioli: (c) => { P(c, '#b8404a', [[2, 8], [14, 8], [12, 14], [4, 14]]); E(c, '#7a5a2a', 8, 8, 6, 2); [[5, 7], [8, 6], [11, 7], [7, 8], [10, 8]].forEach((p) => E(c, '#a8452a', p[0], p[1], 1.4, 1)); R(c, '#fff', 6, 2, 1, 3); R(c, '#fff', 10, 1, 1, 3); },
    parrucca_bagnata: (c) => { E(c, '#b9c4c8', 8, 7, 6, 4); E(c, '#b9c4c8', 3, 11, 2, 3); E(c, '#b9c4c8', 13, 11, 2, 3); E(c, '#96a4aa', 6, 6, 2); R(c, '#5ab0e0', 5, 13, 1, 2); R(c, '#5ab0e0', 10, 14, 1, 2); R(c, '#3aa655', 9, 4, 3, 1); },
    parrucca: (c) => { E(c, '#f4f1e8', 8, 7, 7, 5); E(c, '#f4f1e8', 2, 11, 2, 3); E(c, '#f4f1e8', 14, 11, 2, 3); E(c, '#dcd8c8', 5, 6, 2); E(c, '#dcd8c8', 10, 5, 2); E(c, '#dcd8c8', 8, 9, 2); },
    secchio: (c) => { P(c, '#8a8f98', [[3, 6], [13, 6], [11, 14], [5, 14]]); E(c, '#5ab0e0', 8, 6, 5, 1.5); R(c, '#6a6f78', 4, 9, 8, 1); L(c, '#55505e', 3, 6, 8, 1, 0.8); L(c, '#55505e', 13, 6, 8, 1, 0.8); R(c, '#f39c12', 8, 5, 2, 1); },
    zuppa: (c) => { P(c, '#d9d4d0', [[2, 8], [14, 8], [11, 13], [5, 13]]); E(c, '#c9a13a', 8, 8, 6, 2); R(c, '#fff', 5, 3, 1, 3); R(c, '#fff', 8, 2, 1, 3); R(c, '#fff', 11, 3, 1, 3); },
    zuppa_sonno: (c) => { P(c, '#d9d4d0', [[2, 8], [14, 8], [11, 13], [5, 13]]); E(c, '#8a6ad0', 8, 8, 6, 2); c.fillStyle = '#fff'; c.font = 'bold 6px monospace'; c.fillText('z', 5, 6); c.fillText('Z', 9, 5); },
    tisana: (c) => { R(c, '#8a6ad0', 5, 6, 6, 9); R(c, '#8a6ad0', 7, 3, 2, 3); R(c, '#6a4226', 7, 1, 2, 2); R(c, '#f4f1e8', 6, 8, 4, 5); E(c, '#ffd23f', 8, 10, 1.5); R(c, '#f4f1e8', 8, 9, 2, 2); },
    chiavetta: (c) => { E(c, '#ffd23f', 5, 5, 4); E(c, '#3a2a12', 5, 5, 1.5); L(c, '#ffd23f', 7, 7, 13, 13, 2); R(c, '#ffd23f', 10, 12, 2, 3); R(c, '#ffd23f', 13, 10, 2, 2); R(c, '#fff', 3, 3, 1, 1); },
    occhio: (c) => { P(c, '#ffe9a8', [[8, 1], [14, 6], [12, 14], [4, 14], [2, 6]]); P(c, '#ffffff', [[8, 2], [10, 6], [8, 13], [6, 6]]); L(c, '#e0a030', 2, 6, 14, 6, 0.5); R(c, '#fff', 12, 2, 1, 3); R(c, '#fff', 11, 3, 3, 1); },
    cristallo: (c) => { P(c, '#7af0ff', [[8, 1], [14, 6], [12, 14], [4, 14], [2, 6]]); P(c, '#d8fbff', [[8, 2], [10, 6], [8, 13], [6, 6]]); L(c, '#3aa0c0', 2, 6, 14, 6, 0.5); },
  };
  const iconCache = {};
  function icon(id) {
    if (!iconCache[id]) {
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; // 16 x 16 units, 8 real pixels each
      const ic = cv.getContext('2d'); ic.scale(8, 8);
      if (ICONS[id]) ICONS[id](ic);
      iconCache[id] = cv;
    }
    return iconCache[id];
  }

  const OUTDOOR = { molo: 1, piazza: 1, spiaggia: 1, faro_esterno: 1, cala: 1, ponte: 1 }, DARK = { grotta: 1, stiva: 1 };
  let vignette = null;
  function finish(c, e, id) {
    const r = seeded(id.length * 13 + 5);
    if (OUTDOOR[id]) { // fireflies
      for (let i = 0; i < 9; i++) {
        const x = r() * 320 + Math.sin(e.t * (0.3 + r() * 0.4) + i) * 12, y = 74 + r() * 56 + Math.cos(e.t * (0.4 + r() * 0.3) + i * 2) * 5;
        if (Math.sin(e.t * (1 + r()) + i * 1.9) > 0.1) { R(c, '#f4ffb0', x, y, 1, 1); glow(c, x, y, 4, '230,255,150', 0.35); }
      }
    } else if (!DARK[id]) { // dust in the lamp light
      for (let i = 0; i < 12; i++) R(c, 'rgba(255,240,200,0.35)', (r() * 320 + e.t * (2 + r() * 3)) % 320, 14 + ((r() * 90 + e.t * (1 + r() * 2)) % 88), 1, 1);
    }
    if (!vignette) { vignette = c.createRadialGradient(160, 66, 80, 160, 66, 210); vignette.addColorStop(0, 'rgba(8,4,20,0)'); vignette.addColorStop(1, 'rgba(8,4,20,0.5)'); }
    c.fillStyle = vignette; c.fillRect(0, 0, 320, 140);
  }

  function registerIcon(id, fn) { ICONS[id] = fn; }

  window.AdvArt = { rooms, fili, island, icon, registerIcon, finish, helpers: { R, B, E, P, L, grad, glow, seeded, blink, stars, clouds, shootingStar, moon, sea, planks, bricks, flame, zzz, door, person, crab, ICONS } };
})();
