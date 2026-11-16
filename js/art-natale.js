// Original winter scenes and item icons for Fili's Christmas adventure.
(function () {
  'use strict';
  if (!window.AdvArt) return;

  const Art = window.AdvArt, rooms = Art.rooms, H = Art.helpers;
  const R = H.R, E = H.E, P = H.P, L = H.L, glow = H.glow;
  const person = H.person;

  function path(c, fill, draw, stroke, width) {
    c.beginPath(); draw(c); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.lineJoin = 'round'; c.stroke(); }
  }

  function snow(c, e, amount) {
    for (let i = 0; i < amount; i++) {
      const x = (i * 43.7 + Math.sin(e.t * 0.8 + i * 2.2) * 2.5 + 320) % 320;
      const y = (i * 29.1 + e.t * (3 + i % 4) + i * i * 0.7) % 140;
      E(c, i % 5 === 0 ? '#ffffff' : 'rgba(255,255,255,0.78)', x, y, i % 7 === 0 ? 1.25 : 0.65);
    }
  }

  function rain(c, e) {
    c.save(); c.strokeStyle = 'rgba(174,217,239,0.72)'; c.lineWidth = 0.65;
    for (let i = 0; i < 42; i++) {
      const x = (i * 41 + e.t * 17) % 330 - 5, y = (i * 23 + e.t * 37) % 140;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + 5); c.stroke();
    }
    c.restore();
  }

  function isRaining(e) { return !!(e.g && e.g.flag && e.g.flag('pioggia_arrivata')); }

  function actor(x, y, outfit) {
    return (c, e) => person(c, x, y, outfit, e);
  }

  function reindeer(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    E(c, 'rgba(40,56,62,0.22)', 1, -1.2, 10, 1.8);
    L(c, '#5c3a2f', -5, -8, -6, -1, 1.25); L(c, '#5c3a2f', -1, -7, -1, -1, 1.15);
    L(c, '#5c3a2f', 5, -8, 6, -1, 1.2); L(c, '#5c3a2f', 8, -7, 9, -1, 1.1);
    L(c, '#302722', -7, -1, -4, -1, 1.4); L(c, '#302722', -2, -1, 1, -1, 1.4);
    L(c, '#302722', 5, -1, 8, -1, 1.4); L(c, '#302722', 8, -1, 11, -1, 1.4);
    E(c, '#80513a', 0, -9, 8.5, 4.7); E(c, '#aa704c', -1, -11, 5.2, 2.4);
    P(c, '#a66b48', [[3, -12], [5, -18], [9, -17], [9, -12]]);
    E(c, '#a66b48', 7, -16, 4, 3.5); E(c, '#e0b58a', 10, -14.8, 2.2, 1.4);
    P(c, '#a66b48', [[4, -18], [1, -20], [5, -19], [7, -17]]);
    L(c, '#6d4937', 5, -18, 3, -24, 1); L(c, '#6d4937', 3, -22, 0.5, -23.2, 0.8);
    L(c, '#6d4937', 3, -22, 5, -23.7, 0.8); L(c, '#6d4937', 8, -18, 10, -24, 1);
    L(c, '#6d4937', 10, -22, 8, -23.5, 0.8); L(c, '#6d4937', 10, -22, 12.5, -23.4, 0.8);
    E(c, '#302722', 8.2, -16.8, 0.65); E(c, '#fff3d8', 8.4, -17, 0.2);
    L(c, '#d8b15c', -5, -11, 4, -11, 0.9); L(c, '#d8b15c', 4, -11, 6, -16, 0.8);
    E(c, '#d84749', 2, -9.5, 1.35); E(c, '#f2d36e', 2, -8.5, 0.6);
    L(c, '#604437', -8, -12, -11, -14, 0.8);
    c.restore();
  }

  function sky(c, e) {
    const g = c.createLinearGradient(0, 0, 0, 140);
    g.addColorStop(0, '#3a587b');
    g.addColorStop(0.55, '#9bb6c5');
    g.addColorStop(1, '#edf3e6');
    c.fillStyle = g; c.fillRect(0, 0, 320, 140);
    E(c, '#f4e3bf', 258, 24, 10, 9); glow(c, 258, 24, 30, '242,227,191', 0.24);
    path(c, '#71889a', (p) => {
      p.moveTo(0, 83); p.lineTo(22, 38); p.lineTo(38, 62); p.lineTo(72, 22); p.lineTo(104, 69);
      p.lineTo(137, 34); p.lineTo(166, 70); p.lineTo(198, 29); p.lineTo(232, 68); p.lineTo(265, 36);
      p.lineTo(320, 81); p.lineTo(320, 112); p.lineTo(0, 112); p.closePath();
    });
    path(c, '#dce7e6', (p) => {
      p.moveTo(22, 38); p.lineTo(36, 55); p.lineTo(30, 52); p.lineTo(25, 61); p.lineTo(20, 51);
      p.lineTo(16, 57); p.closePath();
      p.moveTo(72, 22); p.lineTo(94, 55); p.lineTo(84, 49); p.lineTo(76, 60); p.lineTo(69, 50);
      p.lineTo(59, 60); p.closePath();
      p.moveTo(137, 34); p.lineTo(156, 58); p.lineTo(148, 54); p.lineTo(141, 63); p.lineTo(136, 55);
      p.lineTo(128, 62); p.closePath();
      p.moveTo(198, 29); p.lineTo(224, 59); p.lineTo(211, 54); p.lineTo(203, 65); p.lineTo(196, 53);
      p.lineTo(188, 62); p.closePath();
      p.moveTo(265, 36); p.lineTo(291, 62); p.lineTo(280, 57); p.lineTo(272, 68); p.lineTo(264, 57);
      p.lineTo(255, 64); p.closePath();
    });
    path(c, '#dce9e7', (p) => {
      p.moveTo(0, 94); p.bezierCurveTo(58, 79, 92, 98, 147, 87);
      p.bezierCurveTo(208, 77, 259, 94, 320, 79); p.lineTo(320, 140); p.lineTo(0, 140); p.closePath();
    });
    snow(c, e, 44);
  }

  function fir(c, x, y, s, lights) {
    R(c, '#684936', x - s * 0.09, y - s * 0.19, s * 0.18, s * 0.2);
    for (let i = 0; i < 4; i++) {
      const yy = y - s * (0.28 + i * 0.19), w = s * (0.55 - i * 0.09);
      path(c, ['#174b3e', '#1b5b48', '#237054', '#2d805c'][i],
        (p) => { p.moveTo(x, yy - s * 0.31); p.lineTo(x - w, yy + s * 0.18); p.quadraticCurveTo(x, yy + s * 0.08, x + w, yy + s * 0.18); p.closePath(); },
        '#a9d6c1', s * 0.018);
      if (i < 3) L(c, 'rgba(255,255,255,0.8)', x - w * 0.76, yy + s * 0.1, x + w * 0.76, yy + s * 0.1, s * 0.055);
    }
    if (lights) {
      for (let i = 0; i < 9; i++) {
        const yy = y - s * 0.66 + (i % 3) * s * 0.2, xx = x + Math.sin(i * 2.1) * s * 0.27;
        const color = ['#ffda62', '#f0827b', '#8bd6ef'][i % 3];
        E(c, color, xx, yy, s * 0.035); glow(c, xx, yy, s * 0.12, i % 3 === 0 ? '255,218,98' : '240,130,123', 0.4);
      }
      P(c, '#ffdc6b', [[x, y - s], [x + s * 0.07, y - s * 0.84], [x + s * 0.22, y - s * 0.83], [x + s * 0.09, y - s * 0.73], [x + s * 0.14, y - s * 0.58], [x, y - s * 0.68], [x - s * 0.14, y - s * 0.58], [x - s * 0.09, y - s * 0.73], [x - s * 0.22, y - s * 0.83], [x - s * 0.07, y - s * 0.84]]);
    }
  }

  function house(c, x, y, w, h, color, gifts) {
    path(c, '#e8e4d9', (p) => { p.moveTo(x, y); p.lineTo(x + w * 0.5, y - h * 0.34); p.lineTo(x + w, y); p.lineTo(x + w, y + h); p.lineTo(x, y + h); p.closePath(); }, '#45566b', 1);
    R(c, color, x + w * 0.06, y + h * 0.08, w * 0.88, h * 0.56);
    path(c, '#713d44', (p) => { p.moveTo(x - w * 0.08, y + h * 0.1); p.lineTo(x + w * 0.5, y - h * 0.42); p.lineTo(x + w * 1.08, y + h * 0.1); p.lineTo(x + w * 0.98, y + h * 0.17); p.lineTo(x + w * 0.5, y - h * 0.2); p.lineTo(x + w * 0.03, y + h * 0.17); p.closePath(); }, '#f6f1e7', 1.3);
    for (const wx of [x + w * 0.2, x + w * 0.65]) {
      R(c, '#543d46', wx, y + h * 0.22, w * 0.2, h * 0.24);
      R(c, '#ffd78c', wx + 1, y + h * 0.23, w * 0.17, h * 0.21);
      L(c, '#7b5960', wx + w * 0.085, y + h * 0.23, wx + w * 0.085, y + h * 0.44, 1);
      if (gifts) {
        R(c, '#df5256', wx + 1.5, y + h * 0.39, w * 0.07, h * 0.05);
        R(c, '#f2cc63', wx + w * 0.1, y + h * 0.37, w * 0.06, h * 0.07);
      }
    }
    R(c, '#58434a', x + w * 0.41, y + h * 0.56, w * 0.2, h * 0.44);
    E(c, '#f3d37b', x + w * 0.57, y + h * 0.79, 1);
    L(c, '#ffffff', x + 2, y + h * 0.13, x + w * 0.45, y - h * 0.18, 2);
    L(c, '#ffffff', x + w * 0.55, y - h * 0.17, x + w - 2, y + h * 0.13, 2);
  }

  function wreath(c, x, y, r) {
    E(c, '#1a5d44', x, y, r, r * 0.82); E(c, '#348454', x, y, r * 0.72, r * 0.58);
    E(c, '#793f42', x, y, r * 0.36, r * 0.32);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4 - 1;
      E(c, i % 2 ? '#f2d164' : '#db5c59', x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.55, r * 0.12);
    }
    P(c, '#d64b55', [[x, y + r * 0.52], [x - r * 0.38, y + r * 0.86], [x - r * 0.24, y + r * 0.88], [x, y + r * 0.7], [x + r * 0.24, y + r * 0.88], [x + r * 0.38, y + r * 0.86]]);
  }

  function piazza(c, e) {
    sky(c, e);
    house(c, 7, 74, 54, 43, '#a84e4e', true);
    house(c, 68, 65, 52, 51, '#d5a35b', true);
    house(c, 130, 71, 57, 45, '#a95b58', true);
    house(c, 195, 66, 55, 50, '#5b7c74', true);
    house(c, 257, 73, 54, 43, '#c07a50', true);
    fir(c, 60, 110, 37, true); fir(c, 248, 111, 42, true);
    R(c, '#e9e5d9', 0, 111, 320, 29);
    path(c, '#bac8c5', (p) => {
      p.moveTo(0, 119); p.bezierCurveTo(55, 107, 89, 127, 142, 116);
      p.bezierCurveTo(208, 104, 259, 125, 320, 113); p.lineTo(320, 140); p.lineTo(0, 140); p.closePath();
    });
    for (let i = 0; i < 6; i++) {
      const x = 25 + i * 52, y = 116 + (i % 2) * 8;
      R(c, i % 2 ? '#d84f55' : '#5c9e8c', x, y, 8, 6);
      L(c, '#f5d378', x + 4, y, x + 4, y + 6, 1);
      L(c, '#f5d378', x, y + 3, x + 8, y + 3, 1);
    }
    for (let i = 0; i < 5; i++) { L(c, '#396359', i * 71, 13 + (i % 2) * 3, i * 71 + 61, 20 + (i % 2) * 3, 0.6); E(c, ['#ffdc6b', '#f1827b', '#86d7ef'][i % 3], i * 71 + 21, 17, 1.4); }
    wreath(c, 156, 92, 8);
    for (let i = 0; i < 22; i++) {
      const x = 9 + i * 14, y = 47 + Math.sin(i * 1.8) * 3;
      E(c, ['#f5d875', '#e95f62', '#78b9d1'][i % 3], x, y, 1.2);
      if (i % 3 === 0) glow(c, x, y, 4, i % 2 ? '233,95,98' : '245,216,117', 0.24);
    }
    for (let i = 0; i < 10; i++) {
      const x = 12 + i * 33, y = 126 + (i % 2) * 5;
      P(c, 'rgba(126,149,151,0.5)', [[x, y], [x + 3, y - 1], [x + 4, y + 1], [x + 1, y + 2]]);
    }
    if (isRaining(e)) rain(c, e);
  }

  function winterWindow(c, x, y, w, h) {
    R(c, '#402f3a', x - 3, y - 3, w + 6, h + 6);
    const glass = c.createLinearGradient(0, y, 0, y + h);
    glass.addColorStop(0, '#28465f'); glass.addColorStop(0.65, '#83aabd'); glass.addColorStop(1, '#e7e5d5');
    R(c, glass, x, y, w, h);
    P(c, '#718b98', [[x, y + h * 0.62], [x + w * 0.26, y + h * 0.36], [x + w * 0.43, y + h * 0.61], [x + w * 0.65, y + h * 0.31], [x + w, y + h * 0.65], [x + w, y + h], [x, y + h]]);
    R(c, '#d7e4df', x, y + h * 0.77, w, h * 0.23);
    E(c, '#f5e6c6', x + w * 0.78, y + h * 0.2, Math.max(2, w * 0.08));
    for (let i = 0; i < 8; i++) E(c, '#fff', x + (i * 17 % w), y + (i * 13 % h), 0.55);
    R(c, 'rgba(255,228,165,0.12)', x, y, w, h);
    R(c, '#d2b58a', x - 2, y + h - 2, w + 4, 3);
    L(c, '#d8c49e', x + w / 2, y, x + w / 2, y + h, 1.4);
    L(c, '#d8c49e', x, y + h * 0.58, x + w, y + h * 0.58, 1.4);
    L(c, 'rgba(255,255,255,0.6)', x + 2, y + 2, x + w * 0.35, y + 2, 0.7);
  }

  function shopDoor(c) {
    R(c, '#573b39', 3, 35, 33, 68);
    R(c, '#9a6249', 7, 39, 25, 62);
    R(c, '#68453d', 10, 43, 18, 56);
    R(c, '#86a8b1', 13, 48, 12, 16);
    L(c, '#d8c49e', 19, 48, 19, 64, 1);
    L(c, '#d8c49e', 13, 56, 25, 56, 1);
    R(c, '#573b39', 16, 70, 11, 29);
    E(c, '#f4d378', 24, 81, 1);
    R(c, '#d7c6a2', 2, 34, 35, 3);
    L(c, '#eee0c2', 5, 37, 5, 100, 1);
  }

  function counter(c, x, y, w, h, top, front) {
    R(c, '#392c32', x - 2, y + 2, w + 4, h);
    R(c, front, x, y + 5, w, h - 5);
    R(c, top, x - 2, y, w + 4, 6);
    L(c, 'rgba(255,245,219,0.42)', x, y + 6, x + w, y + 6, 0.8);
    const count = Math.max(2, Math.floor(w / 38));
    const panelWidth = (w - 10) / count;
    for (let i = 0; i < count; i++) {
      const px = x + 5 + i * panelWidth;
      R(c, 'rgba(35,25,27,0.15)', px, y + 8, panelWidth - 4, h - 11);
      L(c, 'rgba(235,207,162,0.22)', px + 1, y + 8, px + panelWidth - 5, y + 8, 0.55);
      L(c, 'rgba(39,29,30,0.28)', px + panelWidth - 5, y + 9, px + panelWidth - 5, y + h - 3, 0.55);
      E(c, '#d6b77d', px + panelWidth / 2, y + h / 2 + 2, 0.75);
      E(c, 'rgba(255,241,199,0.72)', px + panelWidth / 2 - 0.25, y + h / 2 + 1.7, 0.25);
    }
    L(c, 'rgba(255,230,190,0.18)', x + 3, y + h - 2, x + w - 3, y + h - 2, 0.55);
  }

  function skate(c, x, y, s, color) {
    c.save(); c.translate(x, y); c.scale(s, s);
    E(c, 'rgba(16,30,38,0.22)', 1, 2, 8, 1);
    path(c, '#263744', (p) => { p.moveTo(-7, -1); p.lineTo(7, -1); p.lineTo(8, 1); p.lineTo(-8, 1); p.closePath(); });
    path(c, '#c6d4d7', (p) => { p.moveTo(-6, -1); p.lineTo(6, -1); p.lineTo(5, 0.2); p.lineTo(-5, 0.2); p.closePath(); });
    path(c, color, (p) => { p.moveTo(-7, -3); p.lineTo(4, -3); p.quadraticCurveTo(8, -3, 8, -6); p.lineTo(7, -10); p.lineTo(3, -10); p.lineTo(3, -6); p.lineTo(-6, -6); p.closePath(); }, '#e9e5d8', 0.6);
    P(c, 'rgba(255,255,255,0.26)', [[-5, -5.5], [2, -5.5], [2, -4.7], [-4, -4.7]]);
    P(c, 'rgba(34,48,55,0.3)', [[3.5, -9.5], [6.4, -9.5], [6.9, -6.2], [4, -5.8]]);
    L(c, '#f4e3bf', -2, -9, 3, -9, 0.55); L(c, '#f4e3bf', -2, -7.5, 3, -7.5, 0.55);
    L(c, '#f4e3bf', -2, -9, 2, -7.5, 0.45); L(c, '#f4e3bf', 2, -9, -2, -7.5, 0.45);
    for (const lx of [-2, 2]) E(c, '#e7d5ac', lx, -9, 0.5);
    L(c, '#d6e5e9', -8, 1, 8, 1, 0.8); L(c, '#b9c9cc', -6, 2, 6, 2, 0.45);
    c.restore();
  }

  function gift(c, x, y, w, h, color) {
    R(c, 'rgba(24,28,27,0.2)', x + 1, y + h - 1, w + 2, 2);
    R(c, '#6c4740', x - 1, y, w + 2, 3);
    R(c, color, x, y + 2, w, h - 2);
    R(c, '#f2d474', x + w * 0.43, y + 2, Math.max(2, w * 0.12), h - 2);
    R(c, '#f2d474', x, y + h * 0.48, w, Math.max(1.5, h * 0.13));
    E(c, '#f2d474', x + w * 0.43, y, w * 0.16, h * 0.12);
    E(c, '#f2d474', x + w * 0.57, y, w * 0.16, h * 0.12);
  }

  function shopFloor(c, kind) {
    const palette = {
      biscotti: ['#b88359', '#8e6045'],
      pattini: ['#9bb2b4', '#718b91'],
      pesca: ['#8e8067', '#6c6252'],
      laboratorio: ['#a78e5b', '#806747'],
      casa: ['#a47757', '#805a47'],
    }[kind];
    const rows = [103, 109, 117, 127, 140];
    const floor = c.createLinearGradient(0, 101, 0, 140);
    floor.addColorStop(0, palette[0]); floor.addColorStop(1, palette[1]);
    R(c, floor, 0, 103, 320, 37);
    for (let row = 0; row < rows.length - 1; row++) {
      const y0 = rows[row], y1 = rows[row + 1];
      const shade = row % 2 ? 'rgba(25,20,18,0.035)' : 'rgba(255,239,205,0.035)';
      R(c, shade, 0, y0, 320, y1 - y0);
    }
    for (let row = 1; row < rows.length; row++) {
      const y = rows[row];
      const depth = (y - 101) / 39;
      L(c, 'rgba(45,34,29,0.2)', 160 + (0 - 160) * depth, y, 160 + (320 - 160) * depth, y, 0.65);
      L(c, 'rgba(255,239,205,0.12)', 160 + (0 - 160) * depth, y - 0.8, 160 + (320 - 160) * depth, y - 0.8, 0.45);
    }
    for (let col = 0; col <= 6; col++) {
      const edge = col * (320 / 6);
      L(c, 'rgba(55,43,38,0.2)', 160 + (edge - 160) * (2 / 39), 103, edge, 140, 0.55);
    }
    R(c, 'rgba(255,226,177,0.12)', 0, 103, 320, 1.5);
  }

  function interior(c, e, kind) {
    const palette = {
      biscotti: ['#9a654e', '#b97a56', '#734b42'],
      pattini: ['#47657a', '#648297', '#354c5d'],
      pesca: ['#426d7b', '#668997', '#354f5b'],
      laboratorio: ['#52735f', '#79906b', '#3d5949'],
      casa: ['#784b44', '#a7644d', '#563a39'],
    }[kind];
    const wall = c.createLinearGradient(0, 12, 0, 101);
    wall.addColorStop(0, palette[0]); wall.addColorStop(1, palette[1]);
    R(c, '#342d38', 0, 0, 320, 102);
    R(c, '#5c4a4c', 0, 7, 320, 95);
    R(c, wall, 8, 18, 304, 83);
    R(c, 'rgba(255,232,181,0.08)', 8, 19, 304, 31);
    for (let x = 17; x < 314; x += 30) {
      L(c, 'rgba(42,39,43,0.3)', x, 52, x, 99, 0.65);
      L(c, 'rgba(255,235,197,0.11)', x + 1, 53, x + 1, 97, 0.5);
    }
    R(c, '#493940', 0, 91, 320, 11);
    R(c, palette[2], 0, 94, 320, 7);
    L(c, '#d4ae79', 0, 94, 320, 94, 1);
    for (let x = 8; x < 320; x += 26) {
      R(c, 'rgba(237,211,168,0.08)', x, 76, 24, 15);
      L(c, 'rgba(43,35,38,0.28)', x, 77, x, 90, 0.6);
    }
    R(c, '#41363b', 0, 101, 320, 39);
    shopFloor(c, kind);
    shopDoor(c);
    for (let i = 0; i < 11; i++) {
      const x = 8 + i * 30, y = 12 + Math.sin(i * 0.9) * 2;
      L(c, '#315749', x, 10, x + 15, y + 5, 0.7);
      E(c, ['#ffd86b', '#dc6960', '#8ad4dc'][i % 3], x + 7, y + 4, 1);
      if (i % 2 === 0) glow(c, x + 7, y + 4, 5, '255,216,107', 0.22);
    }
    if (kind === 'biscotti') {
      winterWindow(c, 43, 28, 44, 42);
      R(c, '#6a4239', 94, 32, 96, 4);
      for (let i = 0; i < 5; i++) {
        const x = 101 + i * 17, y = 27 + (i % 2) * 3;
        E(c, 'rgba(42,30,29,0.28)', x + 4, y + 5, 5, 1.2);
        E(c, i % 2 ? '#c8794c' : '#d9ad67', x + 4, y + 3, 4.5, 2.8);
        P(c, i % 2 ? '#e5b278' : '#f0d39a', [[x, y + 3], [x + 1, y], [x + 3, y - 1], [x + 6, y], [x + 8, y + 3], [x + 7, y + 5], [x + 1, y + 5]]);
        L(c, '#fff0d0', x + 2, y + 1, x + 6, y + 1, 0.55);
        L(c, '#9b5942', x + 3, y + 2, x + 5, y + 1, 0.45);
      }
      counter(c, 39, 76, 158, 25, '#d6b183', '#714b3d');
      R(c, '#d9c39d', 48, 80, 23, 16);
      P(c, '#f1e7d4', [[49, 80], [51, 76], [67, 76], [70, 80]]);
      L(c, '#b49b77', 51, 84, 67, 84, 0.65); L(c, '#b49b77', 52, 88, 66, 88, 0.65);
      E(c, '#e6d6bb', 93, 82, 13, 7); E(c, '#c2a883', 93, 80, 10, 4);
      E(c, '#fff4dc', 93, 81, 7.5, 2.7); L(c, '#aa8c69', 82, 84, 85, 88, 0.9);
      R(c, '#876244', 125, 79, 19, 18); R(c, '#e3b751', 128, 77, 13, 3);
      E(c, '#d5903e', 135, 80, 6, 4); L(c, '#e7c780', 133, 80, 137, 82, 0.7);
      L(c, '#9b6641', 158, 84, 184, 82, 2.2); E(c, '#d2ad78', 157, 84, 1.3); E(c, '#d2ad78', 185, 82, 1.3);
      for (let i = 0; i < 4; i++) {
        const x = 83 + i * 22, y = 70 + (i % 2);
        E(c, 'rgba(44,34,29,0.2)', x + 2, y + 5, 5.2, 1);
        P(c, i % 2 ? '#ead5ae' : '#e5bd63', [[x, y - 2], [x + 2, y], [x + 5, y - 1], [x + 4, y + 2], [x + 6, y + 4], [x + 3, y + 4], [x + 1, y + 6], [x, y + 3], [x - 3, y + 2], [x - 1, y]]);
        E(c, '#fff0d0', x + 1.5, y + 1.5, 0.75);
        E(c, '#b46e45', x + 4.4, y + 3.2, 0.55);
      }
      R(c, '#493c3b', 202, 35, 73, 67);
      R(c, '#b88862', 205, 38, 67, 61);
      for (let y = 43; y < 97; y += 9) for (let x = 208; x < 269; x += 10) {
        R(c, (x + y) % 2 ? '#9a654d' : '#c08a63', x, y, 8, 7);
        L(c, 'rgba(255,224,175,0.24)', x, y, x + 7, y, 0.5);
      }
      path(c, '#47343a', (p) => { p.moveTo(214, 75); p.lineTo(214, 62); p.quadraticCurveTo(214, 48, 239, 48); p.quadraticCurveTo(264, 48, 264, 62); p.lineTo(264, 76); p.closePath(); });
      R(c, '#211d24', 218, 63, 42, 30);
      E(c, '#f18248', 239, 85, 13, 7); E(c, '#ffda73', 239, 84, 7, 4);
      P(c, '#e5523e', [[231, 82], [234, 73], [237, 80], [241, 70], [246, 82]]);
      R(c, '#d2b489', 211, 93, 56, 5);
      for (let i = 0; i < 6; i++) P(c, '#f4e5ca', [[214 + i * 8, 40], [217 + i * 8, 37], [220 + i * 8, 40]]);
    } else if (kind === 'pattini') {
      winterWindow(c, 145, 25, 48, 42);
      R(c, '#78533d', 42, 38, 96, 4); R(c, '#a77b51', 40, 40, 100, 2);
      R(c, '#6c4938', 44, 61, 93, 4); R(c, '#a77b51', 42, 63, 97, 2);
      R(c, '#6c4938', 45, 84, 90, 4); R(c, '#a77b51', 43, 86, 94, 2);
      for (let i = 0; i < 5; i++) {
        const x = 52 + i * 17;
        skate(c, x, 53 + (i % 2) * 1.5, 0.9, ['#e7e1d1', '#79b6c4', '#d08063', '#c5b16a', '#8cabc2'][i]);
        if (i < 4) skate(c, x + 8, 76 + (i % 2) * 1.3, 0.74, ['#77aebb', '#d9c994', '#ba6d61', '#aec4c1'][i]);
        R(c, '#e5cc91', x - 4, 40 + (i % 2) * 2, 8, 3);
      }
      R(c, '#31506a', 199, 31, 43, 34);
      R(c, '#b8d7dc', 202, 34, 37, 27);
      L(c, '#7995a2', 220, 34, 220, 61, 1); L(c, '#7995a2', 202, 48, 239, 48, 1);
      P(c, '#f0d7b1', [[201, 60], [208, 54], [214, 59], [222, 52], [239, 61]]);
      counter(c, 179, 84, 105, 18, '#ae845e', '#634840');
      R(c, '#805344', 190, 68, 76, 15);
      R(c, '#d9c39c', 199, 70, 60, 2);
      R(c, '#c7a677', 250, 73, 19, 10); R(c, '#78543e', 253, 69, 13, 4);
      E(c, '#ead8b4', 260, 68, 3, 2);
      L(c, '#dfc796', 183, 85, 283, 85, 1);
      for (let i = 0; i < 4; i++) {
        const x = 191 + i * 20;
        E(c, ['#6fb9c8', '#e2c76f', '#d77f70', '#9eb6c4'][i], x, 80, 2.5);
      }
      P(c, '#d9d4c7', [[45, 96], [137, 96], [131, 100], [50, 100]]);
      for (let i = 0; i < 4; i++) L(c, '#fff', 51 + i * 21, 97, 61 + i * 21, 97, 0.6);
    } else if (kind === 'pesca') {
      winterWindow(c, 146, 26, 42, 40);
      R(c, '#523e38', 45, 31, 91, 50); R(c, '#bf9a65', 47, 33, 87, 2);
      R(c, '#7b6046', 44, 79, 100, 5); R(c, '#d3b17b', 43, 81, 102, 2);
      for (let i = 0; i < 5; i++) {
        const x = 59 + i * 16;
        L(c, '#ae8a5d', x - 3, 35, x + 6, 77, 1.05);
        L(c, '#604934', x + 1, 41, x + 10, 79, 1.2);
        L(c, '#c6a06b', x - 1, 66, x + 4, 76, 2.5);
        E(c, '#d4b77a', x + 5, 68, 3.1, 3.4);
        E(c, '#59473a', x + 5, 68, 1.5, 1.7);
        E(c, '#d4b77a', x + 5, 68, 0.6, 0.7);
        L(c, '#dfc68f', x - 3, 35, x + 1, 41, 0.7);
        E(c, '#eee0c3', x + 8, 45, 2.4);
        L(c, '#b4d5d8', x + 8, 46, x + 12, 55, 0.45);
        L(c, '#d9e8dc', x + 11, 55, x + 13, 61, 0.45);
      }
      for (let i = 0; i < 3; i++) {
        const x = 117 + i * 9;
        E(c, '#b9d7d8', x, 49, 5.5, 7);
        E(c, '#31596a', x, 49, 4.3, 5.5);
        L(c, '#d8e6d8', x - 4, 45, x + 4, 53, 0.45); L(c, '#d8e6d8', x + 4, 45, x - 4, 53, 0.45);
      }
      L(c, '#6c5039', 197, 72, 218, 42, 2.4);
      L(c, '#d3b27d', 198, 71, 219, 41, 0.75);
      c.save(); c.translate(220, 40); c.rotate(-0.55);
      c.strokeStyle = '#dce6db'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = 'rgba(207,231,224,0.8)'; c.lineWidth = 0.45;
      for (let i = -5; i <= 5; i += 3) { c.beginPath(); c.moveTo(i, -4.8); c.lineTo(i * 0.65, 4.8); c.stroke(); }
      c.beginPath(); c.moveTo(-7.3, -1.5); c.lineTo(7.3, 1.5); c.stroke();
      c.beginPath(); c.moveTo(-7.3, 1.5); c.lineTo(7.3, -1.5); c.stroke();
      c.restore();
      R(c, '#d5c7a4', 65, 87, 50, 13); R(c, '#704e3a', 61, 84, 58, 5);
      R(c, '#9a6b45', 69, 82, 44, 5); R(c, '#e3c88e', 71, 83, 39, 2);
      for (let i = 0; i < 6; i++) {
        const x = 73 + i * 6;
        E(c, i % 2 ? '#b77654' : '#d5a176', x, 92 + (i % 2), 1.5, 0.8);
        L(c, '#6d4d3e', x - 1, 91 + (i % 2), x + 1.5, 93 + (i % 2), 0.45);
      }
      R(c, '#3a4b51', 236, 39, 61, 60); R(c, '#b68b5e', 233, 36, 67, 5);
      R(c, '#97bbc1', 241, 45, 51, 38);
      for (let i = 0; i < 5; i++) {
        const x = 247 + i * 9, y = 58 + Math.sin(i * 2) * 6;
        E(c, ['#d6a75e', '#e78a72', '#75b8bd'][i % 3], x, y, 3.3, 1.8);
        P(c, '#f0d8a1', [[x - 3, y], [x - 5, y - 2], [x - 5, y + 2]]);
        E(c, '#263d43', x + 1.4, y - 0.4, 0.35);
      }
      L(c, '#d6c69d', 245, 50, 288, 50, 0.7); L(c, '#d6c69d', 245, 77, 288, 77, 0.7);
      R(c, '#72513c', 241, 86, 50, 9); R(c, '#c2925c', 238, 83, 56, 4);
      R(c, '#f0d88f', 253, 85, 13, 4); E(c, '#d48160', 260, 85, 3, 2);
    } else if (kind === 'laboratorio') {
      winterWindow(c, 43, 26, 37, 35);
      R(c, '#694a38', 94, 29, 165, 4); R(c, '#9c754d', 92, 32, 169, 2);
      R(c, '#694a38', 95, 53, 163, 4); R(c, '#9c754d', 93, 56, 167, 2);
      for (let i = 0; i < 6; i++) {
        const x = 101 + i * 25;
        R(c, '#4b403c', x, 35, 16, 16);
        R(c, ['#d84e56', '#e4c15e', '#4b9d8b'][i % 3], x + 2, 38, 12, 11);
        R(c, '#f5e4c6', x + 1, 36, 14, 2);
        L(c, '#f4d48a', x + 4, 39, x + 11, 39, 0.6);
        if (i % 2 === 0) E(c, '#d8b958', x + 8, 34, 1.5);
      }
      for (let i = 0; i < 4; i++) {
        const x = 105 + i * 37;
        E(c, '#ae884f', x, 66, 9, 9); E(c, '#d6b866', x, 66, 5, 5);
        E(c, '#537258', x, 66, 2, 2);
        for (let a = 0; a < 8; a++) {
          const angle = a * Math.PI / 4;
          R(c, '#b69153', x + Math.cos(angle) * 10 - 1, 65 + Math.sin(angle) * 10, 3, 3);
        }
      }
      counter(c, 47, 83, 117, 18, '#bd9365', '#68483c');
      R(c, '#685044', 60, 73, 90, 9); R(c, '#8f6548', 57, 70, 97, 4);
      R(c, '#b9a16d', 98, 69, 15, 5); E(c, '#e7d690', 105, 67, 7, 5);
      E(c, '#7d6450', 96, 68, 2.5, 2); E(c, '#7d6450', 114, 68, 2.5, 2);
      L(c, '#d9b866', 103, 62, 108, 67, 1.1); E(c, '#e6cf7d', 107, 62, 3, 2);
      R(c, '#9d6a43', 122, 76, 9, 3); R(c, '#caa579', 136, 75, 12, 4);
      R(c, '#54413b', 174, 76, 43, 27); R(c, '#856044', 170, 72, 50, 6);
      E(c, '#a5b7a3', 195, 79, 16, 4); E(c, '#dfd6ae', 195, 78, 11, 2);
      for (let i = 0; i < 4; i++) {
        const x = 191 + Math.sin(e.t * 2 + i) * 2;
        E(c, 'rgba(239,231,205,0.55)', x, 71 - i * 5, 1, 2);
      }
      R(c, '#5b4339', 227, 76, 37, 26);
      P(c, '#ad7951', [[224, 77], [232, 69], [256, 69], [265, 77], [261, 100], [229, 100]]);
      R(c, '#d8bd79', 234, 76, 21, 3); R(c, '#936344', 232, 81, 25, 2);
      for (let i = 0; i < 3; i++) gift(c, 235 + i * 9, 87 - (i % 2) * 5, 8, 10, ['#d95251', '#527b67', '#d8ad4f'][i]);
      L(c, '#a58a5d', 237, 69, 235, 62, 0.7); L(c, '#a58a5d', 251, 69, 255, 62, 0.7);
      R(c, '#b8935b', 265, 38, 25, 21);
      L(c, '#e3c97f', 267, 41, 288, 41, 0.7); L(c, '#e3c97f', 267, 46, 286, 46, 0.7);
      L(c, '#e3c97f', 267, 51, 280, 51, 0.7);
      R(c, '#d8d1bb', 268, 61, 21, 12);
      for (let i = 0; i < 3; i++) E(c, '#8d6650', 272 + i * 6, 66, 1.2);
    }
  }

  function winterSky(c, e) {
    const skyColor = c.createLinearGradient(0, 0, 0, 88);
    skyColor.addColorStop(0, '#14243d'); skyColor.addColorStop(0.58, '#314c6b'); skyColor.addColorStop(1, '#9bb8c2');
    R(c, skyColor, 0, 0, 320, 94);
    c.save(); c.globalAlpha = 0.36; c.strokeStyle = '#7ce0d4'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-12, 35); c.bezierCurveTo(36, 15, 61, 45, 105, 25);
    c.bezierCurveTo(148, 7, 170, 39, 208, 23); c.bezierCurveTo(248, 8, 279, 31, 336, 11); c.stroke();
    c.globalAlpha = 0.18; c.lineWidth = 10;
    c.beginPath(); c.moveTo(-8, 42); c.bezierCurveTo(39, 22, 65, 50, 106, 31);
    c.bezierCurveTo(147, 14, 177, 44, 217, 29); c.bezierCurveTo(265, 11, 285, 39, 331, 19); c.stroke();
    c.restore();
    for (let i = 0; i < 30; i++) {
      const x = (i * 73.1 + 11) % 320, y = (i * 37.7 + 7) % 61;
      E(c, i % 4 === 0 ? '#fff6dc' : '#d6e5ec', x, y, i % 5 === 0 ? 0.8 : 0.45);
    }
    E(c, '#f4e3bf', 258, 22, 8, 7); glow(c, 258, 22, 22, '242,227,191', 0.16);
    path(c, '#34485e', (p) => {
      p.moveTo(0, 77); p.lineTo(30, 48); p.lineTo(52, 65); p.lineTo(92, 35); p.lineTo(127, 67);
      p.lineTo(163, 43); p.lineTo(199, 70); p.lineTo(236, 39); p.lineTo(271, 65); p.lineTo(320, 42);
      p.lineTo(320, 96); p.lineTo(0, 96); p.closePath();
    });
    path(c, '#627b8c', (p) => {
      p.moveTo(0, 81); p.lineTo(43, 61); p.lineTo(68, 76); p.lineTo(113, 48); p.lineTo(148, 80);
      p.lineTo(188, 56); p.lineTo(224, 79); p.lineTo(264, 52); p.lineTo(300, 75); p.lineTo(320, 65);
      p.lineTo(320, 99); p.lineTo(0, 99); p.closePath();
    });
    for (const [x, y, size] of [[15, 90, 18], [36, 89, 11], [283, 92, 17], [306, 89, 11]]) {
      fir(c, x, y, size, false);
    }
    path(c, '#edf3e6', (p) => {
      p.moveTo(0, 82); p.lineTo(30, 48); p.lineTo(42, 63); p.lineTo(52, 65); p.lineTo(92, 35);
      p.lineTo(109, 52); p.lineTo(127, 67); p.lineTo(163, 43); p.lineTo(181, 59); p.lineTo(199, 70);
      p.lineTo(236, 39); p.lineTo(253, 54); p.lineTo(271, 65); p.lineTo(320, 42); p.lineTo(320, 80);
      p.lineTo(300, 75); p.lineTo(264, 52); p.lineTo(224, 79); p.lineTo(188, 56); p.lineTo(148, 80);
      p.lineTo(113, 48); p.lineTo(68, 76); p.lineTo(43, 61); p.closePath();
    });
  }

  function lakeFish(c, x, y, color, scale) {
    c.save(); c.translate(x, y); c.scale(scale, scale);
    E(c, color, 0, 0, 4, 1.8); P(c, color, [[3, 0], [6, -2.3], [6, 2.3]]);
    E(c, '#18333d', -2, -0.5, 0.35); L(c, 'rgba(255,255,255,0.75)', -1, -1.1, 2, -1.1, 0.45);
    c.restore();
  }

  function lake(c, e) {
    winterSky(c, e);
    path(c, '#dce8df', (p) => {
      p.moveTo(0, 75); p.bezierCurveTo(42, 67, 73, 82, 118, 73); p.bezierCurveTo(177, 61, 223, 81, 320, 68);
      p.lineTo(320, 98); p.lineTo(0, 98); p.closePath();
    });
    path(c, '#a7c0c5', (p) => {
      p.moveTo(0, 82); p.bezierCurveTo(55, 74, 84, 86, 139, 77); p.bezierCurveTo(197, 68, 246, 85, 320, 74);
      p.lineTo(320, 96); p.lineTo(0, 96); p.closePath();
    });
    for (let i = 0; i < 17; i++) {
      const x = 4 + i * 19;
      if (x % 3 !== 0) fir(c, x, 94 + (i % 3) * 1.5, 13 + (i % 4) * 2, i % 5 === 0);
    }
    path(c, '#edf3e6', (p) => {
      p.moveTo(0, 88); p.bezierCurveTo(42, 77, 86, 93, 136, 82); p.bezierCurveTo(193, 72, 254, 91, 320, 77);
      p.lineTo(320, 99); p.lineTo(0, 99); p.closePath();
    });
    const ice = c.createLinearGradient(0, 82, 0, 140);
    ice.addColorStop(0, '#bad9df'); ice.addColorStop(0.28, '#a2cbd4'); ice.addColorStop(0.7, '#cce5e5'); ice.addColorStop(1, '#e5eee4');
    path(c, ice, (p) => {
      p.moveTo(0, 91); p.bezierCurveTo(53, 78, 91, 96, 143, 85); p.bezierCurveTo(200, 74, 263, 93, 320, 82);
      p.lineTo(320, 140); p.lineTo(0, 140); p.closePath();
    }, '#f7fbef', 1.4);
    path(c, 'rgba(235,249,245,0.54)', (p) => {
      p.moveTo(0, 99); p.bezierCurveTo(57, 91, 102, 106, 154, 96); p.bezierCurveTo(214, 87, 268, 103, 320, 91);
      p.lineTo(320, 101); p.bezierCurveTo(258, 112, 213, 98, 157, 107); p.bezierCurveTo(103, 116, 49, 101, 0, 111); p.closePath();
    });
    for (let i = 0; i < 10; i++) {
      const x = 9 + i * 34, y = 111 + (i % 4) * 6;
      L(c, 'rgba(255,255,255,0.85)', x, y, x + 14, y - 2, 0.6);
      L(c, 'rgba(89,136,151,0.42)', x + 4, y + 2, x + 18, y + 1, 0.45);
      P(c, 'rgba(255,255,255,0.62)', [[x + 23, y + 4], [x + 26, y + 1], [x + 28, y + 4], [x + 26, y + 6]]);
    }
    for (const [x, y, length] of [[31, 119, 12], [109, 127, 15], [199, 116, 10], [300, 127, 13]]) {
      L(c, 'rgba(76,120,136,0.34)', x, y, x + length * 0.42, y - 2, 0.55);
      L(c, 'rgba(76,120,136,0.27)', x + length * 0.42, y - 2, x + length * 0.63, y + 1, 0.45);
      L(c, 'rgba(76,120,136,0.24)', x + length * 0.42, y - 2, x + length, y - 4, 0.45);
      L(c, 'rgba(255,255,255,0.72)', x + 1, y - 1, x + length * 0.4, y - 3, 0.45);
    }
    c.save(); c.strokeStyle = 'rgba(247,255,246,0.84)'; c.lineWidth = 1.1;
    c.beginPath(); c.ellipse(151, 103, 77, 20, -0.03, Math.PI * 1.05, Math.PI * 1.98); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.42)'; c.lineWidth = 0.65;
    c.beginPath(); c.ellipse(151, 103, 70, 15, -0.03, Math.PI * 1.08, Math.PI * 1.95); c.stroke();
    c.restore();
    L(c, '#5d7881', 17, 93, 34, 86, 0.75); L(c, '#5d7881', 34, 86, 47, 94, 0.75);
    L(c, '#5d7881', 268, 91, 284, 83, 0.75); L(c, '#5d7881', 284, 83, 302, 91, 0.75);
    for (let i = 0; i < 9; i++) {
      const x = 90 + i * 15, y = 97 + Math.sin(i * 1.4) * 2;
      lakeFish(c, x, y, i % 2 ? 'rgba(61,111,125,0.44)' : 'rgba(101,148,151,0.48)', 0.45 + (i % 3) * 0.08);
    }
    P(c, '#fff2a1', [[149, 88], [152, 78], [155, 88], [162, 85], [155, 91], [153, 98], [150, 91], [144, 88]]);
    E(c, '#fffbe1', 152, 88, 1.9); glow(c, 152, 88, 14, '234,247,237', 0.62);
    L(c, 'rgba(255,255,255,0.9)', 143, 80, 148, 78, 0.7); L(c, 'rgba(255,255,255,0.8)', 157, 96, 162, 94, 0.7);
    for (let i = 0; i < 4; i++) {
      const x = 235 + (i * 13) % 56, y = 87 + (i % 3) * 4;
      lakeFish(c, x, y, ['#78b6b7', '#df987b', '#d2c36e'][i % 3], 0.52);
    }
    E(c, '#385d66', 265, 96, 25, 10); E(c, '#1b3039', 265, 95, 21, 7);
    E(c, '#15262e', 265, 94, 16, 5);
    for (let i = 0; i < 3; i++) {
      lakeFish(c, 257 + i * 8, 95 + Math.sin(e.t * 2 + i) * 1.1, ['#f2b26e', '#86c6c5', '#d8a1b3'][i], 0.73);
    }
    E(c, 'rgba(255,255,255,0.5)', 255, 91, 5, 1); E(c, 'rgba(255,255,255,0.35)', 274, 99, 6, 1);
    fir(c, 20, 125, 39, false); fir(c, 307, 124, 38, true);
    R(c, '#674638', 224, 90, 3, 12); R(c, '#cdb37b', 221, 88, 9, 3);
    E(c, '#ffdc77', 225.5, 85, 2.2); glow(c, 225.5, 85, 9, '255,220,119', 0.25);
    if (isRaining(e)) rain(c, e);
  }

  function santaHouse(c, e) {
    const night = c.createLinearGradient(0, 0, 0, 140);
    night.addColorStop(0, '#24334d'); night.addColorStop(0.58, '#607c8b'); night.addColorStop(1, '#e3ece4');
    R(c, night, 0, 0, 320, 140);
    for (let i = 0; i < 25; i++) E(c, i % 5 ? '#e5edf0' : '#fff', (i * 61 + 17) % 320, (i * 29 + 7) % 70, i % 6 === 0 ? 0.75 : 0.45);
    E(c, '#f3e4c4', 37, 25, 7, 6); glow(c, 37, 25, 18, '243,228,196', 0.16);
    path(c, '#25383c', (p) => { p.moveTo(0, 75); p.lineTo(28, 48); p.lineTo(51, 70); p.lineTo(88, 39); p.lineTo(124, 73); p.lineTo(171, 45); p.lineTo(208, 74); p.lineTo(251, 41); p.lineTo(286, 68); p.lineTo(320, 52); p.lineTo(320, 108); p.lineTo(0, 108); p.closePath(); });
    path(c, '#dce7df', (p) => { p.moveTo(0, 76); p.lineTo(28, 48); p.lineTo(39, 62); p.lineTo(51, 70); p.lineTo(88, 39); p.lineTo(104, 55); p.lineTo(124, 73); p.lineTo(171, 45); p.lineTo(188, 61); p.lineTo(208, 74); p.lineTo(251, 41); p.lineTo(267, 55); p.lineTo(286, 68); p.lineTo(320, 52); p.lineTo(320, 82); p.lineTo(286, 68); p.lineTo(251, 41); p.lineTo(208, 74); p.lineTo(171, 45); p.lineTo(124, 73); p.lineTo(88, 39); p.lineTo(51, 70); p.lineTo(28, 48); p.closePath(); });
    for (let x = 7; x < 320; x += 28) {
      E(c, ['#f5d875', '#e95f62', '#78b9d1'][Math.floor(x / 28) % 3], x, 17 + Math.sin(x) * 2, 0.9);
    }
    R(c, '#563944', 0, 54, 320, 53);
    P(c, '#88433f', [[28, 64], [78, 25], [247, 25], [298, 64], [289, 73], [244, 36], [81, 36], [36, 74]]);
    P(c, '#e7ddd0', [[32, 63], [78, 29], [245, 29], [293, 63], [287, 67], [242, 35], [82, 35], [37, 68]]);
    R(c, '#b24c45', 38, 58, 244, 39);
    R(c, '#713d3d', 44, 63, 232, 34);
    for (let x = 47; x < 274; x += 19) {
      L(c, 'rgba(255,222,174,0.12)', x, 64, x, 94, 0.6);
      L(c, 'rgba(46,34,37,0.18)', x + 1, 64, x + 1, 94, 0.45);
    }
    for (const x of [51, 81, 238, 268]) {
      R(c, '#3c3438', x, 66, 20, 23); R(c, '#e8b76a', x + 3, 69, 14, 17);
      L(c, '#8a5542', x + 10, 69, x + 10, 86, 0.8); L(c, '#8a5542', x + 3, 77, x + 17, 77, 0.8);
      glow(c, x + 10, 76, 8, '255,195,99', 0.2);
    }
    R(c, '#a9c5c6', 3, 53, 30, 50); R(c, '#d6c6a5', 0, 51, 35, 4);
    R(c, '#5a3938', 7, 58, 22, 44); R(c, '#b07c59', 10, 61, 16, 41);
    E(c, '#f3d37b', 24, 82, 1);
    R(c, '#c9ae80', 11, 99, 24, 4);
    wreath(c, 160, 49, 8);
    for (let x = 43; x < 283; x += 31) {
      L(c, '#294f43', x, 57, x + 13, 61, 0.6);
      E(c, ['#f5d875', '#e95f62', '#79bfd0'][Math.floor(x / 31) % 3], x + 7, 59, 0.95);
    }
    R(c, '#4b3838', 102, 52, 43, 47); R(c, '#d8cbb1', 106, 55, 35, 42);
    R(c, '#714a42', 111, 59, 25, 38); E(c, '#f0ce84', 132, 79, 1.2);
    R(c, '#382f33', 151, 58, 3, 39); R(c, '#d5ba89', 147, 57, 11, 3);
    R(c, '#513a35', 42, 91, 41, 15); R(c, '#96704e', 38, 88, 48, 5);
    R(c, '#8c4a3e', 47, 87, 33, 5);
    gift(c, 46, 79, 15, 13, '#d84f55'); gift(c, 62, 82, 17, 10, '#477a67');
    gift(c, 54, 70, 12, 10, '#dfb94e');
    R(c, '#b54843', 87, 91, 76, 10);
    P(c, '#a93838', [[92, 91], [99, 81], [153, 81], [160, 91]]);
    R(c, '#e2c283', 103, 84, 38, 2);
    for (let i = 0; i < 3; i++) {
      const x = 101 + i * 15;
      R(c, i % 2 ? '#486c72' : '#e8dcc2', x, 84, 9, 7);
      L(c, '#b39161', x + 1, 86, x + 8, 86, 0.55);
      L(c, '#b39161', x + 2, 88, x + 7, 88, 0.55);
    }
    R(c, '#563b35', 158, 85, 106, 13);
    P(c, '#b7383d', [[163, 86], [173, 75], [246, 75], [259, 87], [252, 94], [166, 94]]);
    R(c, '#d9544d', 174, 76, 65, 10);
    E(c, '#823d37', 179, 91, 3, 2); E(c, '#823d37', 241, 91, 3, 2);
    L(c, '#d3b86e', 171, 94, 247, 94, 1.2); L(c, '#d3b86e', 179, 96, 240, 96, 0.8);
    P(c, '#f0d7b1', [[181, 75], [189, 70], [227, 70], [237, 75]]);
    R(c, '#e7d9bb', 204, 74, 7, 2); R(c, '#e7d9bb', 215, 74, 7, 2);
    for (let i = 0; i < 3; i++) {
      const x = 248 + i * 10;
      L(c, '#d8b15c', x, 83, x + 7, 75, 0.8); L(c, '#d8b15c', x + 7, 75, x + 12, 82, 0.8);
      E(c, '#d84749', x + 8, 83, 1.1);
    }
    R(c, '#dce7df', 0, 105, 320, 35);
    path(c, '#edf2e8', (p) => { p.moveTo(0, 108); p.bezierCurveTo(74, 99, 131, 112, 194, 104); p.bezierCurveTo(245, 97, 281, 107, 320, 101); p.lineTo(320, 140); p.lineTo(0, 140); p.closePath(); });
    for (let i = 0; i < 9; i++) {
      const x = 6 + i * 38, y = 119 + (i % 3) * 5;
      L(c, 'rgba(255,255,255,0.76)', x, y, x + 11, y - 2, 0.6);
      P(c, 'rgba(153,177,177,0.45)', [[x + 17, y + 2], [x + 19, y], [x + 21, y + 2], [x + 19, y + 4]]);
    }
    R(c, '#4c4d48', 292, 63, 5, 45); R(c, '#5d564b', 285, 62, 19, 5);
    E(c, '#efb95f', 294.5, 74, 2.5); glow(c, 294.5, 74, 12, '255,188,92', 0.26);
    for (let i = 0; i < 3; i++) {
      const x = 15 + i * 28;
      L(c, 'rgba(90,113,116,0.55)', x, 110, x + 5, 113, 0.7);
      L(c, 'rgba(90,113,116,0.45)', x + 5, 113, x + 1, 116, 0.65);
    }
    if (isRaining(e)) rain(c, e);
  }

  rooms.natale_piazza = { draw: piazza, sprites: [] };
  rooms.natale_pasticceria = {
    draw(c, e) { interior(c, e, 'biscotti'); },
    sprites: [[124, actor(292, 125, { id: 'pasticcera', shirt: '#f0d7b4', pants: '#705b4c', hair: '#9b5b40', hat: 'chef', apron: '#b84b49', skirt: true, w: 11, bh: 13, lh: 6 })]],
  };
  rooms.natale_pattini = {
    draw(c, e) { interior(c, e, 'pattini'); },
    sprites: [[124, actor(214, 125, { id: 'negoziante_pattini', shirt: '#367a62', stripes: '#f0d5aa', pants: '#76513d', hair: '#5d3b2e', hat: 'winter', hatc: '#b84b49', w: 11, bh: 13, lh: 6 })]],
  };
  rooms.natale_pesca = {
    draw(c, e) { interior(c, e, 'pesca'); },
    sprites: [[124, actor(211, 125, { id: 'pescatore', shirt: '#4e7890', pants: '#59483e', hair: '#574032', beard: '#b5aa91', hat: 'winter', hatc: '#426a80', w: 12, bh: 13, lh: 6 })]],
  };
  rooms.natale_lago = {
    draw: lake,
    sprites: [[122, (c) => { reindeer(c, 59, 123, 0.8); reindeer(c, 82, 124, 0.75); }]],
  };
  rooms.natale_laboratorio = {
    draw(c, e) { interior(c, e, 'laboratorio'); },
    sprites: [
      [125, actor(180, 125, { id: 'cuoco_elfo', shirt: '#9d5548', stripes: '#ead7ab', pants: '#37614b', hair: '#6b5539', hat: 'winter', hatc: '#438254', w: 11, bh: 13, lh: 6 })],
      [125, actor(287, 125, { id: 'elfo_aiutante', shirt: '#4e7955', stripes: '#f4e3bb', pants: '#395646', hair: '#754e34', hat: 'winter', hatc: '#b84b49', w: 10, bh: 13, lh: 6 })],
    ],
  };
  rooms.natale_casa_babbo = {
    draw: santaHouse,
    sprites: [
      [125, actor(116, 125, { id: 'babbo_natale', shirt: '#b83943', pants: '#563a38', hair: '#eee8dc', beard: '#eee8dc', hat: 'winter', hatc: '#b83943', w: 14, bh: 14, lh: 6 })],
      [125, (c) => { reindeer(c, 282, 124, 0.85); }],
    ],
  };

  const icon = {
    farina(c) { E(c, '#eadfc8', 8, 8, 5, 7); R(c, '#fff8e9', 4, 3, 8, 9); L(c, '#c5a77f', 5, 12, 11, 12, 0.8); },
    burro(c) { P(c, '#f6dc83', [[2, 6], [12, 4], [14, 10], [4, 13]]); P(c, '#fff0b0', [[3, 6], [12, 5], [12, 8], [4, 10]]); },
    miele(c) { E(c, '#e1a943', 8, 8, 5, 7); R(c, '#ffe4a1', 5, 5, 6, 5); R(c, '#a35f37', 6, 3, 4, 2); },
    cannella(c) { L(c, '#a86b40', 4, 13, 12, 3, 2); L(c, '#d29961', 5, 14, 13, 4, 1.3); },
    impasto(c) { E(c, '#e7c89b', 8, 9, 7, 5); E(c, '#f2ddb9', 8, 7, 5, 3); },
    impasto_dolce(c) { E(c, '#e1b458', 8, 9, 7, 5); E(c, '#f5d879', 8, 7, 5, 3); },
    impasto_speziato(c) { E(c, '#bb8150', 8, 9, 7, 5); E(c, '#e6b876', 8, 7, 5, 3); },
    biscotti(c) { P(c, '#e3b15b', [[8, 1], [10, 6], [15, 6], [11, 9], [13, 14], [8, 11], [3, 14], [5, 9], [1, 6], [6, 6]]); E(c, '#fff0cc', 8, 7, 1.2); },
    pattini(c) { P(c, '#d9e7e8', [[3, 4], [12, 4], [13, 9], [5, 10], [3, 8]]); L(c, '#698d9e', 3, 12, 14, 12, 1.5); L(c, '#fff', 5, 5, 10, 5, 0.7); },
    canna_pesca(c) { L(c, '#9e7145', 4, 14, 12, 1, 1.3); L(c, '#94cdd1', 12, 1, 15, 7, 0.5); P(c, '#d5b67b', [[3, 12], [5, 13], [4, 15], [2, 14]]); },
    retino(c) { L(c, '#aa7b51', 5, 13, 11, 6, 1.2); E(c, '#96c8cf', 11, 5, 4, 4); L(c, '#d8edf0', 8, 5, 11, 9, 0.4); },
    esca(c) { E(c, '#d78b73', 8, 8, 6, 3); E(c, '#f4bd96', 12, 7, 2); },
    telo_cerato(c) { P(c, '#c9464d', [[2, 4], [12, 2], [15, 10], [6, 14]]); L(c, '#f4c778', 5, 5, 12, 11, 0.7); },
    pesce_argento(c) { E(c, '#9fcbd1', 7, 8, 6, 4); P(c, '#6c9ca8', [[12, 8], [15, 5], [15, 11]]); E(c, '#203941', 4, 7, 0.6); L(c, '#e8f4ec', 6, 7, 10, 7, 0.5); },
    stella_nord(c) { P(c, '#c4f4f4', [[8, 1], [9, 6], [14, 3], [11, 8], [15, 10], [10, 10], [8, 15], [6, 10], [1, 10], [5, 8], [2, 4], [7, 6]]); E(c, '#fff', 8, 8, 1.3); },
    campanella_magica(c) { E(c, '#ebd27c', 8, 8, 5, 5); R(c, '#f7eab4', 5, 4, 6, 2); E(c, '#b79147', 8, 14, 1.5); P(c, '#ffe8a0', [[8, 2], [9, 4], [7, 4]]); },
    sacco_regali(c) { P(c, '#9a6249', [[5, 4], [11, 4], [14, 14], [3, 14]]); R(c, '#d95357', 5, 7, 5, 4); R(c, '#eccd73', 10, 9, 4, 4); L(c, '#e8ca76', 5, 6, 12, 6, 1); },
  };
  for (const [id, draw] of Object.entries(icon)) Art.registerIcon(id, draw);
})();
