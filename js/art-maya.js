// All the artwork and drawings for Story 2: "Fili e l'Isola Maya".
// Drawn by code on a 320 x 140 canvas grid.
(function () {
  'use strict';
  if (!window.AdvArt) return;

  const Art = window.AdvArt, rooms = Art.rooms;
  const H = Art.helpers;
  const R = H.R, B = H.B, E = H.E, P = H.P, L = H.L, grad = H.grad, glow = H.glow;
  const seeded = H.seeded, blink = H.blink, stars = H.stars, clouds = H.clouds;
  const person = H.person, crab = H.crab;

  function mayaPerson(c, x, y, options, e) {
    person(c, x, y, options, e);
    const width = options.w || 10, bodyHeight = options.bh || 12;
    const legs = options.sit ? 0 : (options.lh === undefined ? 9 : options.lh);
    const bodyTop = y - legs - bodyHeight;
    const left = x - width / 2 + 1, right = x + width / 2 - 1;
    strokedPath(c, '#d7b26e', 0.8, (p) => {
      p.moveTo(left, bodyTop + bodyHeight - 3);
      p.quadraticCurveTo(x, bodyTop + bodyHeight - 2, right, bodyTop + bodyHeight - 3);
    });
    strokedPath(c, '#4e7160', 0.65, (p) => {
      p.moveTo(left + 1, bodyTop + bodyHeight - 1.2);
      p.quadraticCurveTo(x, bodyTop + bodyHeight, right - 1, bodyTop + bodyHeight - 1.2);
    });
    P(c, '#e2bd71', [[x - 1.7, bodyTop + bodyHeight - 2.6], [x, bodyTop + bodyHeight - 4.1], [x + 1.7, bodyTop + bodyHeight - 2.6], [x, bodyTop + bodyHeight - 1.1]]);
    E(c, '#3e987e', x, bodyTop + 1, 0.9, 1.2);
    E(c, '#b8e3ad', x - 0.2, bodyTop + 0.7, 0.3, 0.45);
  }

  function filledPath(c, color, draw) {
    c.beginPath();
    draw(c);
    c.fillStyle = color;
    c.fill();
  }

  function strokedPath(c, color, width, draw) {
    c.beginPath();
    draw(c);
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
  }

  function foliageCluster(c, x, y, scale, colors) {
    filledPath(c, colors[0], (p) => {
      p.moveTo(x - scale * 0.58, y + scale * 0.05);
      p.bezierCurveTo(x - scale * 0.72, y - scale * 0.2, x - scale * 0.43, y - scale * 0.45, x - scale * 0.2, y - scale * 0.32);
      p.bezierCurveTo(x - scale * 0.08, y - scale * 0.62, x + scale * 0.23, y - scale * 0.52, x + scale * 0.29, y - scale * 0.29);
      p.bezierCurveTo(x + scale * 0.62, y - scale * 0.38, x + scale * 0.72, y - scale * 0.05, x + scale * 0.52, y + scale * 0.1);
      p.bezierCurveTo(x + scale * 0.45, y + scale * 0.38, x + scale * 0.07, y + scale * 0.39, x - scale * 0.12, y + scale * 0.26);
      p.bezierCurveTo(x - scale * 0.4, y + scale * 0.42, x - scale * 0.68, y + scale * 0.27, x - scale * 0.58, y + scale * 0.05);
      p.closePath();
    });
    const leaves = [
      [-0.42, 0.12, -0.2, -0.48], [-0.24, 0.15, 0.22, -0.62],
      [-0.05, 0.14, -0.08, -0.66], [0.12, 0.15, 0.34, -0.5],
      [0.29, 0.12, 0.62, -0.31], [-0.12, 0.2, -0.46, -0.24],
    ];
    for (let i = 0; i < leaves.length; i++) {
      const [bx, by, dx, dy] = leaves[i];
      const startX = x + bx * scale, startY = y + by * scale;
      const endX = x + dx * scale, endY = y + dy * scale;
      const length = Math.hypot(endX - startX, endY - startY);
      const angle = Math.atan2(endY - startY, endX - startX);
      const width = scale * 0.105;
      c.save();
      c.translate(startX, startY);
      c.rotate(angle);
      filledPath(c, colors[(i + 1) % colors.length], (p) => {
        p.moveTo(0, 0);
        p.bezierCurveTo(length * 0.28, -width, length * 0.77, -width * 0.88, length, 0);
        p.bezierCurveTo(length * 0.7, width * 0.66, length * 0.25, width * 0.88, 0, 0);
        p.closePath();
      });
      strokedPath(c, 'rgba(217,222,151,0.3)', Math.max(0.3, scale * 0.014), (p) => {
        p.moveTo(1, 0); p.quadraticCurveTo(length * 0.48, -width * 0.02, length * 0.9, 0);
      });
      c.restore();
    }
  }

  function groundHaze(c, color, y) {
    const shade = c.createLinearGradient(0, y - 10, 0, y + 32);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, color);
    c.fillStyle = shade;
    c.fillRect(0, y - 10, 320, 42);
  }

  // Soft, feathered palm fronds replace the old pointed polygon fan.
  function tropicalSky(c, e, maxH) {
    grad(c, 0, 0, 320, maxH, ['#2193b0', '#6dd5ed', '#b7f8db']);
    // Bright tropical sun with gentle pulse
    const sr = 12 + Math.sin(e.t * 2) * 1;
    E(c, '#fff4a3', 270, 24, sr);
    glow(c, 270, 24, 38, '255,244,163', 0.45);
    // Fluffy white clouds
    clouds(c, e, 33, 10, maxH - 12, 4, '255,255,255', 0.65);
  }

  // Turquoise Caribbean ocean with wave lines and reef shades
  function caribbeanSea(c, e, y, h) {
    grad(c, 0, y, 320, h, ['#00b4db', '#0083b0', '#005c8a']);
    const r = seeded(89);
    for (let i = 0; i < 28; i++) {
      const yy = y + 2 + r() * (h - 4), w = 6 + r() * 14;
      const x = (r() * 340 + Math.sin(e.t * 1.1 + i) * 6) % 330 - 5;
      R(c, 'rgba(255,255,255,' + (0.2 + r() * 0.25) + ')', x, yy, w, 1);
    }
    // Turquoise reef glow
    for (let i = 0; i < 4; i++) {
      const yy = y + 5 + i * (h / 4);
      R(c, 'rgba(0,255,210,0.12)', 0, yy, 320, 2);
    }
  }

  // Volcano in the background with rising smoke puffs
  function volcano(c, e, x, y, w, h) {
    P(c, '#3e4a3d', [[x, y + h], [x + w * 0.38, y], [x + w * 0.62, y], [x + w, y + h]]);
    P(c, '#2d382c', [[x + w * 0.5, y], [x + w * 0.62, y], [x + w, y + h], [x + w * 0.55, y + h]]);
    // Crater
    E(c, '#1f261e', x + w / 2, y + 2, w * 0.14, 2);
    // Smoke puffs
    for (let i = 0; i < 3; i++) {
      const p = (e.t * 0.4 + i * 0.35) % 1;
      const sx = x + w / 2 + Math.sin(e.t * 1.5 + i) * 6 + p * 12;
      const sy = y - p * 24 - 4;
      E(c, 'rgba(60,60,70,' + (0.45 * (1 - p)) + ')', sx, sy, 3 + p * 6);
    }
  }

  // Palm tree with curved trunk and wide tropical fronds
  function palmTree(c, e, x, y, h, frondColor) {
    const bend = Math.sin(e.t * 0.7 + x) * 1.5;
    const top = [x + 7 + bend, y - h];
    strokedPath(c, '#49382f', 6, (p) => {
      p.moveTo(x, y);
      p.bezierCurveTo(x + 10, y - h * 0.3, x - 8, y - h * 0.68, top[0], top[1]);
    });
    strokedPath(c, '#a47652', 2, (p) => {
      p.moveTo(x - 1, y - 2);
      p.bezierCurveTo(x + 5, y - h * 0.3, x - 7, y - h * 0.68, top[0] - 0.5, top[1] + 2);
    });
    for (let i = 1; i < 8; i++) {
      const t = i / 8, px = x + 10 * t + Math.sin(t * 2.5) * 5, py = y - h * t;
      strokedPath(c, '#604734', 1.6 - t * 0.7, (p) => {
        p.moveTo(px - 1.5, py);
        p.quadraticCurveTo(px + 2, py + 1, px + 1, py + 3);
      });
    }
    const sway = Math.sin(e.t * 0.9 + x) * 2;
    const fronds = [
      [-35, 10], [-31, -1], [-23, -12], [-11, -18], [5, -20],
      [20, -15], [32, -5], [37, 7], [15, 8], [-15, 9],
    ];
    fronds.forEach((f, idx) => {
      const endX = top[0] + f[0] + sway * (idx < 5 ? -1 : 1);
      const endY = top[1] + f[1];
      const base = idx % 2 ? '#285841' : (frondColor || '#35694a');
      const midX = (top[0] + endX) / 2, midY = (top[1] + endY) / 2;
      filledPath(c, base, (p) => {
        p.moveTo(top[0], top[1]);
        p.quadraticCurveTo(midX, midY - 2, endX, endY);
        p.quadraticCurveTo(midX, midY + 2.6, top[0], top[1]);
      });
      strokedPath(c, 'rgba(207,221,145,0.68)', 0.55, (p) => {
        p.moveTo(top[0], top[1]);
        p.quadraticCurveTo(midX, midY, endX, endY);
      });
      for (let leaf = 1; leaf <= 6; leaf++) {
        const t = leaf / 7;
        const curveT = t * t * (3 - 2 * t);
        const cx = top[0] + (endX - top[0]) * curveT;
        const cy = top[1] + (endY - top[1]) * curveT - Math.sin(t * Math.PI) * 2;
        const dx = endX - top[0], dy = endY - top[1], length = Math.hypot(dx, dy) || 1;
        const sideX = -dy / length, sideY = dx / length;
        const leafLength = 8 + Math.sin(t * Math.PI) * 7, leafWidth = 3.4 - t * 1.1;
        for (const side of [-1, 1]) {
          const lx = cx + sideX * side * leafLength + dx / length * 2;
          const ly = cy + sideY * side * leafLength + dy / length * 2;
          filledPath(c, idx % 2 ? '#39754b' : (frondColor || '#35694a'), (p) => {
            p.moveTo(cx, cy);
            p.quadraticCurveTo(cx + sideX * side * leafLength * 0.48 - sideY * side * leafWidth, cy + sideY * side * leafLength * 0.48 + sideX * side * leafWidth, lx, ly);
            p.quadraticCurveTo(cx + sideX * side * leafLength * 0.36 + sideY * side * leafWidth, cy + sideY * side * leafLength * 0.36 - sideX * side * leafWidth, cx, cy);
            p.closePath();
          });
        }
      }
    });
    E(c, '#714a35', top[0], top[1] + 1, 3.8, 2.5);
    return top;
  }

  // A rounded, hand-built Maya home rather than a hard-edged geometric hut.
  function mayaHut(c, x, y, w, h, doorOpen) {
    const wallY = y + h * 0.45, wallH = h * 0.55;
    E(c, 'rgba(25,21,17,0.25)', x + w / 2, y + h + 1, w * 0.58, 2);
    grad(c, x + 2, wallY, w - 4, wallH, ['#c5a77c', '#9c7658', '#785743']);
    filledPath(c, '#604734', (p) => {
      p.moveTo(x + 4, wallY + 2);
      p.quadraticCurveTo(x + w * 0.5, wallY - 2, x + w - 4, wallY + 2);
      p.lineTo(x + w - 4, y + h - 2);
      p.quadraticCurveTo(x + w * 0.5, y + h + 2, x + 4, y + h - 2);
      p.closePath();
    });
    grad(c, x + 4, wallY + 3, w - 8, wallH - 5, ['#d3b88a', '#a88560', '#806147']);
    for (let xx = x + 4; xx < x + w - 3; xx += Math.max(3, w / 18)) {
      strokedPath(c, 'rgba(88,61,42,0.6)', 0.75, (p) => {
        p.moveTo(xx + 1, wallY + 4);
        p.quadraticCurveTo(xx - 1, wallY + wallH * 0.55, xx + 1.4, y + h - 2);
      });
      L(c, 'rgba(236,211,167,0.35)', xx - 0.4, wallY + 5, xx + 0.2, y + h - 3, 0.45);
    }
    for (let yy = wallY + 7; yy < y + h - 2; yy += Math.max(5, h / 8)) {
      L(c, 'rgba(78,55,39,0.55)', x + 4, yy, x + w - 4, yy, 0.65);
    }
    filledPath(c, '#694a36', (p) => {
      p.moveTo(x - 5, y + h * 0.48);
      p.quadraticCurveTo(x + w * 0.2, y + h * 0.36, x + w * 0.34, y + h * 0.23);
      p.quadraticCurveTo(x + w * 0.5, y - 2, x + w * 0.66, y + h * 0.23);
      p.quadraticCurveTo(x + w * 0.82, y + h * 0.36, x + w + 5, y + h * 0.48);
      p.lineTo(x + w + 3, y + h * 0.54);
      p.quadraticCurveTo(x + w * 0.5, y + h * 0.39, x - 3, y + h * 0.54);
      p.closePath();
    });
    filledPath(c, '#c5a36d', (p) => {
      p.moveTo(x - 3, y + h * 0.47);
      p.quadraticCurveTo(x + w * 0.24, y + h * 0.36, x + w * 0.5, y + 2);
      p.quadraticCurveTo(x + w * 0.76, y + h * 0.36, x + w + 3, y + h * 0.47);
      p.quadraticCurveTo(x + w * 0.5, y + h * 0.3, x - 3, y + h * 0.47);
      p.closePath();
    });
    filledPath(c, 'rgba(95,65,43,0.34)', (p) => {
      p.moveTo(x + w * 0.5, y + 2);
      p.quadraticCurveTo(x + w * 0.76, y + h * 0.36, x + w + 3, y + h * 0.47);
      p.quadraticCurveTo(x + w * 0.72, y + h * 0.39, x + w * 0.5, y + h * 0.3);
      p.closePath();
    });
    for (let i = 1; i < 7; i++) {
      const t = i / 7, spread = (w / 2 + 3) * t, yy = y + 2 + (h * 0.47 - 2) * t;
      L(c, i % 2 ? '#dfc18a' : '#a9875c', x + w / 2, y + 2, x + w / 2 - spread, yy, 0.7);
      L(c, i % 2 ? '#c29d68' : '#e1c58f', x + w / 2, y + 2, x + w / 2 + spread, yy, 0.7);
    }
    L(c, '#ead3a3', x + 3, y + h * 0.48, x + w - 3, y + h * 0.48, 1.2);
    const dw = Math.min(14, w * 0.28), dh = wallH * 0.78;
    const dx = x + w / 2 - dw / 2, dy = y + h - dh;
    filledPath(c, '#4e382a', (p) => {
      p.moveTo(dx - 1, dy + dh);
      p.lineTo(dx - 1, dy + 3);
      p.quadraticCurveTo(dx - 1, dy - 2, dx + dw / 2, dy - 2);
      p.quadraticCurveTo(dx + dw + 1, dy - 2, dx + dw + 1, dy + 3);
      p.lineTo(dx + dw + 1, dy + dh);
      p.closePath();
    });
    grad(c, dx, dy, dw, dh, doorOpen ? ['#181814', '#35291d'] : ['#744a32', '#472f24']);
    if (!doorOpen) {
      for (let py = dy + 3; py < dy + dh - 1; py += Math.max(2, h / 12)) {
        L(c, '#3d2a20', dx + 1, py, dx + dw - 1, py, 0.65);
      }
    }
    R(c, '#d4b77e', dx - 1.5, dy - 1.5, 1.3, dh + 2);
    R(c, '#d4b77e', dx + dw + 0.2, dy - 1.5, 1.3, dh + 2);
    E(c, '#d8b56e', dx + dw - 2, dy + dh * 0.55, 0.8, 0.8);
    const mark = Math.min(2.5, w / 26);
    E(c, '#a84532', x + w * 0.17, wallY + wallH * 0.35, mark, mark * 1.5);
    E(c, '#e1bc78', x + w * 0.17, wallY + wallH * 0.35, mark * 0.42, mark * 0.65);
  }

  // ---------- ROOM 1: MAYA_SPIAGGIA ----------
  rooms.maya_spiaggia = {
    draw(c, e) {
      const sky = c.createLinearGradient(0, 0, 0, 88);
      sky.addColorStop(0, '#536d82'); sky.addColorStop(0.52, '#a2a99c'); sky.addColorStop(1, '#f1bf83');
      c.fillStyle = sky; c.fillRect(0, 0, 320, 88);
      // The squall is receding left while sunrise breaks through on the right.
      filledPath(c, 'rgba(35,51,65,0.75)', (p) => {
        p.moveTo(0, 0); p.lineTo(133, 0);
        p.bezierCurveTo(126, 10, 113, 15, 99, 14);
        p.bezierCurveTo(91, 25, 74, 27, 58, 23);
        p.bezierCurveTo(43, 34, 22, 31, 11, 25);
        p.lineTo(0, 28); p.closePath();
      });
      E(c, 'rgba(57,72,82,0.74)', 65, 17, 44, 8);
      E(c, 'rgba(57,72,82,0.52)', 101, 15, 30, 6);
      filledPath(c, 'rgba(255,225,183,0.73)', (p) => {
        p.moveTo(177, 24); p.bezierCurveTo(183, 15, 195, 15, 203, 18);
        p.bezierCurveTo(212, 9, 231, 12, 237, 18);
        p.bezierCurveTo(250, 12, 267, 17, 270, 24);
        p.bezierCurveTo(262, 29, 246, 30, 234, 27);
        p.bezierCurveTo(222, 33, 206, 29, 197, 28);
        p.bezierCurveTo(188, 31, 179, 29, 177, 24); p.closePath();
      });
      const sunX = 270, sunY = 37;
      glow(c, sunX, sunY, 37, '255,222,165', 0.3);
      E(c, '#ffe2ad', sunX, sunY, 11, 10);
      filledPath(c, 'rgba(255,220,168,0.12)', (p) => {
        p.moveTo(264, 44); p.lineTo(276, 43); p.lineTo(218, 91); p.lineTo(180, 91); p.closePath();
      });
      // Distant island silhouettes soften into the haze at the horizon.
      const ridge = c.createLinearGradient(0, 48, 0, 79);
      ridge.addColorStop(0, '#55756e'); ridge.addColorStop(1, '#375951');
      filledPath(c, ridge, (p) => {
        p.moveTo(0, 66); p.bezierCurveTo(26, 57, 37, 61, 57, 59);
        p.bezierCurveTo(83, 52, 97, 62, 119, 57);
        p.bezierCurveTo(146, 50, 165, 61, 184, 57);
        p.bezierCurveTo(206, 50, 224, 59, 243, 54);
        p.bezierCurveTo(270, 48, 295, 57, 320, 51);
        p.lineTo(320, 82); p.lineTo(0, 82); p.closePath();
      });
      filledPath(c, 'rgba(31,75,64,0.75)', (p) => {
        p.moveTo(184, 67); p.bezierCurveTo(203, 57, 219, 59, 231, 66);
        p.bezierCurveTo(241, 53, 259, 52, 270, 64);
        p.bezierCurveTo(286, 51, 303, 52, 320, 62);
        p.lineTo(320, 82); p.lineTo(184, 82); p.closePath();
      });
      volcano(c, e, 275, 37, 34, 39);
      const sea = c.createLinearGradient(0, 73, 0, 103);
      sea.addColorStop(0, '#4aa8aa'); sea.addColorStop(0.28, '#208d9a');
      sea.addColorStop(0.7, '#136b7d'); sea.addColorStop(1, '#174e61');
      filledPath(c, sea, (p) => {
        p.moveTo(0, 70); p.bezierCurveTo(72, 68, 115, 73, 158, 70);
        p.bezierCurveTo(210, 67, 264, 72, 320, 68);
        p.lineTo(320, 103); p.lineTo(0, 103); p.closePath();
      });
      // Long, calm wave bands echo the storm's retreat.
      for (let i = 0; i < 9; i++) {
        const x = (i * 47 + Math.sin(e.t * 0.3 + i) * 5) % 350 - 16;
        const y = 75 + i * 2.5;
        strokedPath(c, i % 3 ? 'rgba(200,241,222,0.26)' : 'rgba(244,229,199,0.36)', i % 3 ? 0.65 : 0.85, (p) => {
          p.moveTo(x, y); p.quadraticCurveTo(x + 10, y - 1.4, x + 23, y);
          p.quadraticCurveTo(x + 31, y + 1, x + 40, y - 0.1);
        });
      }
      // Wet sand, foam and dry beach form one continuous receding shoreline.
      const wet = c.createLinearGradient(0, 91, 0, 113);
      wet.addColorStop(0, '#8eaa91'); wet.addColorStop(0.35, '#d8c49a'); wet.addColorStop(1, '#c7a77d');
      filledPath(c, wet, (p) => {
        p.moveTo(0, 89); p.bezierCurveTo(39, 91, 62, 86, 100, 91);
        p.bezierCurveTo(140, 96, 175, 88, 207, 92);
        p.bezierCurveTo(247, 96, 284, 88, 320, 90);
        p.lineTo(320, 113); p.bezierCurveTo(270, 116, 233, 109, 191, 114);
        p.bezierCurveTo(151, 118, 110, 109, 74, 115);
        p.bezierCurveTo(43, 118, 20, 111, 0, 115); p.closePath();
      });
      strokedPath(c, 'rgba(255,247,222,0.88)', 1.5, (p) => {
        p.moveTo(-2, 91); p.bezierCurveTo(36, 93, 64, 89, 99, 93);
        p.bezierCurveTo(141, 98, 171, 90, 206, 94);
        p.bezierCurveTo(249, 98, 286, 91, 322, 92);
      });
      strokedPath(c, 'rgba(255,255,239,0.54)', 0.75, (p) => {
        p.moveTo(4, 95); p.quadraticCurveTo(34, 98, 68, 95);
        p.moveTo(222, 98); p.quadraticCurveTo(270, 102, 317, 97);
      });
      const sand = c.createLinearGradient(0, 108, 0, 140);
      sand.addColorStop(0, '#d1b188'); sand.addColorStop(0.38, '#ebc993'); sand.addColorStop(1, '#c99f70');
      c.fillStyle = sand; c.fillRect(0, 107, 320, 33);
      // The village is small and hazy on the far shore, not a second focal point.
      foliageCluster(c, 211, 72, 9, ['#37665a', '#467567', '#315b51']);
      foliageCluster(c, 238, 71, 11, ['#31594e', '#426b5c', '#294e48']);
      mayaHut(c, 211, 61, 25, 23, false);
      // Broken palms frame the view; their overlapping canopy makes a natural vignette.
      foliageCluster(c, 9, 105, 18, ['#725b3c', '#56674b', '#405a45']);
      foliageCluster(c, 310, 104, 21, ['#65523b', '#526448', '#375545']);
      palmTree(c, e, 15, 113, 57, '#3f7251');
      palmTree(c, e, 309, 116, 66, '#3d704d');
      palmTree(c, e, 276, 120, 45, '#527a53');
      // The stranded vessel is deliberately the largest foreground shape.
      E(c, 'rgba(52,37,29,0.25)', 67, 108, 54, 4);
      filledPath(c, '#49362f', (p) => {
        p.moveTo(19, 93); p.quadraticCurveTo(48, 98, 84, 92);
        p.quadraticCurveTo(104, 89, 117, 87); p.quadraticCurveTo(106, 103, 95, 107);
        p.quadraticCurveTo(59, 112, 34, 105); p.quadraticCurveTo(23, 101, 19, 93); p.closePath();
      });
      filledPath(c, '#8c5940', (p) => {
        p.moveTo(25, 94); p.quadraticCurveTo(56, 99, 92, 93);
        p.quadraticCurveTo(103, 91, 111, 89); p.quadraticCurveTo(100, 100, 93, 102);
        p.quadraticCurveTo(55, 107, 34, 101); p.closePath();
      });
      strokedPath(c, '#c28a5d', 1.3, (p) => {
        p.moveTo(29, 96); p.quadraticCurveTo(61, 101, 95, 96);
        p.moveTo(36, 101); p.quadraticCurveTo(63, 105, 91, 100);
      });
      for (let i = 0; i < 7; i++) {
        const x = 38 + i * 9, y = 96 + Math.sin(i * 0.7) * 1.3;
        strokedPath(c, 'rgba(63,41,33,0.7)', 0.55, (p) => {
          p.moveTo(x, y); p.quadraticCurveTo(x + 2, y + 2, x + 4, y + 4);
        });
      }
      // A snapped mast and wind-torn sail tell the shipwreck story at a glance.
      strokedPath(c, '#6c4938', 3.4, (p) => { p.moveTo(49, 96); p.quadraticCurveTo(59, 77, 68, 62); p.lineTo(75, 48); });
      strokedPath(c, '#d4ae78', 1.1, (p) => { p.moveTo(49, 94); p.quadraticCurveTo(59, 77, 68, 62); });
      strokedPath(c, '#72503b', 1.7, (p) => { p.moveTo(74, 48); p.lineTo(69, 42); p.lineTo(77, 39); });
      filledPath(c, 'rgba(223,211,183,0.78)', (p) => {
        p.moveTo(57, 78); p.quadraticCurveTo(47, 68, 48, 61);
        p.lineTo(57, 68); p.lineTo(61, 65); p.lineTo(62, 79); p.closePath();
      });
      filledPath(c, 'rgba(203,194,166,0.83)', (p) => {
        p.moveTo(65, 70); p.lineTo(72, 64); p.quadraticCurveTo(78, 66, 76, 70);
        p.lineTo(72, 73); p.lineTo(70, 78); p.lineTo(66, 75); p.closePath();
      });
      strokedPath(c, '#433b33', 0.75, (p) => {
        p.moveTo(40, 92); p.lineTo(72, 71); p.moveTo(55, 83); p.lineTo(84, 95);
      });
      // Gentle tide pools and diagonal footprints guide the eye toward the inland path.
      const grain = seeded(45);
      for (let i = 0; i < 28; i++) {
        const x = 8 + grain() * 304, y = 112 + grain() * 25;
        E(c, i % 3 ? 'rgba(255,239,205,0.45)' : 'rgba(133,95,61,0.22)', x, y, 0.65 + grain() * 0.6, 0.35);
      }
      strokedPath(c, 'rgba(115,89,61,0.24)', 0.7, (p) => {
        p.moveTo(299, 140); p.quadraticCurveTo(287, 127, 301, 115);
        p.quadraticCurveTo(311, 106, 310, 97);
      });
      filledPath(c, 'rgba(255,230,187,0.22)', (p) => {
        p.moveTo(298, 140); p.quadraticCurveTo(285, 127, 299, 114);
        p.quadraticCurveTo(307, 106, 307, 98); p.lineTo(311, 98);
        p.quadraticCurveTo(313, 111, 304, 119); p.quadraticCurveTo(293, 129, 304, 140); p.closePath();
      });
      groundHaze(c, 'rgba(90,63,43,0.09)', 112);
    },
    sprites: [
      // Chaac sits beside his fishing net, away from the wreck.
      [113, (c, e) => {
        R(c, '#6b5140', 184, 104, 24, 7);
        L(c, '#49382f', 186, 111, 185, 115, 1.4);
        L(c, '#49382f', 205, 111, 207, 115, 1.4);
        mayaPerson(c, 196, 106, {
          id: 'pescatore', sit: true, dir: 1,
          shirt: '#99603f', stripes: '#d8b879', pants: '#6f5842',
          hair: '#29251f', hat: 'straw', skin: '#bd815c',
        }, e);
        E(c, '#b0bec5', 211, 109, 6, 3);
        L(c, '#607d8b', 207, 105, 215, 111, 0.6);
        L(c, '#607d8b', 215, 105, 207, 111, 0.6);
      }],
      [117, (c, e) => {
        const top = palmTree(c, e, 270, 118, 86, '#388e3c');
        if (!e.g.flag('cocco_caduto')) {
          E(c, '#4e342e', top[0] - 3, top[1] + 6, 3.5, 3.5);
          E(c, '#5d4037', top[0] + 3, top[1] + 7, 3, 3);
        }
      }],
      [121, (c, e) => {
        if (e.g.flag('cocco_caduto') && !e.g.flag('cocco_preso')) {
          E(c, '#4e342e', 257, 123, 4, 3.5);
          E(c, '#6d4c41', 255, 121, 2, 1.3);
        }
      }],
      [120, (c, e) => {
        if (!e.g.flag('conchiglia_presa')) {
          E(c, '#f48fb1', 154, 121, 5, 3);
          P(c, '#f06292', [[156, 118], [161, 121], [156, 124]]);
          for (let i = 0; i < 3; i++) L(c, '#ffe4ed', 151 + i * 2, 119, 152 + i * 2, 122, 0.6);
        }
      }],
      [123, (c, e) => {
        crab(c, e, 178 + Math.round(Math.sin(e.t * 0.9) * 4), 124);
      }],
    ],
  };

  // ---------- ROOM 2: MAYA_GIUNGLA ----------
  rooms.maya_giungla = {
    name: 'La Giungla Tropicale', music: 'maya_giungla',
    walk: [[10, 112], [310, 112], [310, 136], [10, 136]], scale: [112, 0.85, 136, 1.0],
    draw(c, e) {
      const canopy = c.createLinearGradient(0, 0, 0, 112);
      canopy.addColorStop(0, '#17372f'); canopy.addColorStop(0.55, '#285244'); canopy.addColorStop(1, '#567154');
      c.fillStyle = canopy; c.fillRect(0, 0, 320, 112);
      // Soft overhead canopy and far trees keep the playable clearing readable.
      filledPath(c, '#193d33', (p) => {
        p.moveTo(0, 0); p.lineTo(320, 0); p.lineTo(320, 27);
        p.bezierCurveTo(295, 17, 283, 32, 258, 25);
        p.bezierCurveTo(232, 15, 215, 32, 190, 24);
        p.bezierCurveTo(160, 12, 144, 30, 116, 22);
        p.bezierCurveTo(89, 11, 72, 29, 45, 22);
        p.bezierCurveTo(26, 16, 13, 28, 0, 23); p.closePath();
      });
      for (const [x, y, size] of [[15, 15, 20], [56, 22, 24], [102, 14, 18], [148, 23, 21], [203, 15, 22], [249, 21, 24], [302, 14, 23]]) {
        foliageCluster(c, x, y, size, ['#23503b', '#2c6045', '#386a49']);
      }
      // Three receding walls of jungle frame a single pool of warm sunlight.
      for (const [x, y, size] of [[4, 51, 27], [42, 58, 21], [92, 48, 25], [145, 58, 21], [193, 49, 25], [247, 57, 22], [304, 50, 27]]) {
        foliageCluster(c, x, y, size, ['#315a40', '#416c49', '#52794e']);
      }
      filledPath(c, 'rgba(229,212,155,0.18)', (p) => {
        p.moveTo(150, 0); p.lineTo(187, 0); p.lineTo(227, 105); p.lineTo(101, 105); p.closePath();
      });
      filledPath(c, '#425c43', (p) => {
        p.moveTo(0, 79); p.bezierCurveTo(41, 58, 63, 72, 96, 65);
        p.bezierCurveTo(128, 58, 149, 74, 179, 66);
        p.bezierCurveTo(217, 56, 253, 71, 279, 62);
        p.bezierCurveTo(298, 57, 308, 66, 320, 60);
        p.lineTo(320, 112); p.lineTo(0, 112); p.closePath();
      });
      foliageCluster(c, 35, 83, 24, ['#3b704a', '#4a7c50', '#5a8554']);
      foliageCluster(c, 83, 78, 20, ['#346844', '#44784b', '#56814f']);
      foliageCluster(c, 232, 78, 23, ['#366747', '#46774d', '#567e4e']);
      foliageCluster(c, 294, 80, 26, ['#315d42', '#43724a', '#527c50']);
      // A soft earthen floor; its winding ochre trail links all four exits.
      const earth = c.createLinearGradient(0, 88, 0, 140);
      earth.addColorStop(0, '#675942'); earth.addColorStop(0.42, '#756044'); earth.addColorStop(1, '#493e31');
      c.fillStyle = earth; c.fillRect(0, 88, 320, 52);
      filledPath(c, '#b19564', (p) => {
        p.moveTo(0, 112); p.bezierCurveTo(42, 106, 86, 115, 123, 108);
        p.bezierCurveTo(144, 104, 151, 98, 151, 91);
        p.lineTo(171, 91); p.bezierCurveTo(171, 103, 180, 108, 200, 108);
        p.bezierCurveTo(229, 109, 242, 104, 248, 98);
        p.bezierCurveTo(269, 90, 284, 95, 320, 107);
        p.lineTo(320, 123); p.bezierCurveTo(284, 111, 269, 107, 258, 112);
        p.bezierCurveTo(245, 126, 222, 126, 198, 122);
        p.bezierCurveTo(177, 119, 160, 110, 160, 101);
        p.bezierCurveTo(151, 116, 134, 125, 111, 125);
        p.bezierCurveTo(70, 130, 39, 121, 0, 127); p.closePath();
      });
      strokedPath(c, 'rgba(231,207,151,0.55)', 1.1, (p) => {
        p.moveTo(-3, 114); p.bezierCurveTo(50, 110, 86, 119, 126, 112);
        p.bezierCurveTo(151, 107, 156, 100, 160, 94);
        p.bezierCurveTo(163, 109, 185, 114, 205, 114);
        p.bezierCurveTo(237, 116, 254, 105, 267, 101);
        p.bezierCurveTo(284, 98, 302, 106, 323, 113);
      });
      const dirt = seeded(23);
      for (let i = 0; i < 34; i++) {
        const x = dirt() * 320, y = 120 + dirt() * 18;
        E(c, i % 2 ? 'rgba(37,34,25,0.24)' : 'rgba(234,207,153,0.28)', x, y, 0.8 + dirt() * 1.5, 0.45);
      }
      // Massive ceiba roots and a hollow of light make the old tree feel grounded.
      filledPath(c, '#352f28', (p) => {
        p.moveTo(18, 0); p.bezierCurveTo(21, 24, 14, 64, 13, 94);
        p.bezierCurveTo(2, 101, -5, 108, -7, 119);
        p.bezierCurveTo(9, 115, 19, 110, 27, 107);
        p.bezierCurveTo(37, 114, 48, 117, 61, 116);
        p.bezierCurveTo(54, 104, 49, 99, 43, 95);
        p.bezierCurveTo(45, 62, 38, 22, 43, 0); p.closePath();
      });
      strokedPath(c, 'rgba(173,128,78,0.75)', 2, (p) => {
        p.moveTo(33, 3); p.bezierCurveTo(30, 33, 37, 61, 34, 91);
        p.quadraticCurveTo(34, 100, 42, 108);
      });
      strokedPath(c, 'rgba(26,32,28,0.65)', 1, (p) => {
        p.moveTo(20, 12); p.quadraticCurveTo(27, 17, 22, 24);
        p.moveTo(39, 29); p.quadraticCurveTo(32, 34, 38, 40);
        p.moveTo(22, 58); p.quadraticCurveTo(29, 62, 23, 70);
      });
      foliageCluster(c, 26, 10, 23, ['#2d6042', '#39734a', '#4c8051']);
      foliageCluster(c, 58, 8, 18, ['#2d5e41', '#3d7249', '#4c8051']);
      // A real hanging vine, lit along one edge and easy to click.
      strokedPath(c, '#443b2d', 3, (p) => {
        p.moveTo(73, 4); p.bezierCurveTo(67, 25, 78, 49, 70, 70);
        p.quadraticCurveTo(67, 79, 72, 88);
      });
      strokedPath(c, '#b39b60', 0.8, (p) => {
        p.moveTo(72, 6); p.bezierCurveTo(69, 26, 76, 47, 69, 68);
      });
      for (const [x, y] of [[72, 19], [73, 42], [69, 61], [70, 77]]) {
        E(c, '#547a45', x, y, 2.2, 1.2);
      }
      // The stela is weathered limestone set upright at the center of the trail.
      const sx = 112, sy = 53;
      E(c, 'rgba(25,27,21,0.34)', sx + 14, 111, 20, 3);
      filledPath(c, '#4a5144', (p) => {
        p.moveTo(sx + 1, sy + 54); p.quadraticCurveTo(sx - 1, sy + 26, sx + 1, sy + 8);
        p.quadraticCurveTo(sx + 4, sy - 1, sx + 13, sy);
        p.quadraticCurveTo(sx + 24, sy - 1, sx + 26, sy + 8);
        p.lineTo(sx + 25, sy + 54); p.closePath();
      });
      filledPath(c, '#b1a47d', (p) => {
        p.moveTo(sx + 4, sy + 52); p.quadraticCurveTo(sx + 3, sy + 22, sx + 5, sy + 8);
        p.quadraticCurveTo(sx + 7, sy + 3, sx + 13, sy + 3);
        p.quadraticCurveTo(sx + 21, sy + 3, sx + 23, sy + 9);
        p.lineTo(sx + 22, sy + 52); p.closePath();
      });
      strokedPath(c, 'rgba(238,222,174,0.72)', 0.75, (p) => {
        p.moveTo(sx + 6, sy + 47); p.lineTo(sx + 7, sy + 10);
      });
      E(c, '#524c3a', sx + 13, sy + 14, 7, 6);
      E(c, '#c3b586', sx + 13, sy + 13, 5, 4);
      E(c, '#403b30', sx + 11, sy + 12, 1.2, 1.5);
      E(c, '#403b30', sx + 15, sy + 12, 1.2, 1.5);
      E(c, '#b68140', sx + 13, sy + 29, 6, 6);
      E(c, '#efd07a', sx + 13, sy + 29, 3.2, 3.2);
      for (let a = 0; a < 8; a++) {
        const angle = a * Math.PI / 4;
        L(c, '#b68140', sx + 13, sy + 29, sx + 13 + Math.cos(angle) * 8, sy + 29 + Math.sin(angle) * 8, 0.8);
      }
      P(c, '#4d714b', [[sx + 8, sy + 47], [sx + 13, sy + 38], [sx + 18, sy + 47], [sx + 13, sy + 51]]);
      for (let i = 0; i < 5; i++) E(c, '#738252', sx + i * 5, sy + 51, 2, 1.5);
      // Village roof, mountain stairs and cenote trail recede into the canopy.
      mayaHut(c, 238, 64, 29, 39, false);
      P(c, '#4e4c39', [[298, 104], [320, 98], [320, 117], [295, 119]]);
      for (let y = 104; y < 118; y += 5) L(c, '#c6b584', 301, y, 318, y - 4, 0.7);
      P(c, '#8f8564', [[147, 111], [152, 94], [168, 94], [176, 111]]);
      for (let y = 97; y < 110; y += 3) L(c, '#d1c292', 153 + (110 - y) * 0.25, y, 169 - (110 - y) * 0.25, y, 0.8);
      // Branch and shaded canopy create a sheltered perch for Balamito.
      strokedPath(c, '#49382d', 4, (p) => { p.moveTo(181, 50); p.quadraticCurveTo(204, 39, 230, 46); });
      strokedPath(c, '#9b7952', 0.8, (p) => { p.moveTo(187, 48); p.quadraticCurveTo(205, 42, 224, 46); });
      strokedPath(c, '#5b452f', 1.5, (p) => { p.moveTo(228, 0); p.quadraticCurveTo(221, 19, 216, 38); });
      for (const [x, y, size] of [[181, 13, 17], [210, 9, 20], [243, 14, 17], [272, 10, 18], [303, 18, 21], [188, 37, 16], [236, 36, 20], [278, 39, 19]]) {
        foliageCluster(c, x, y, size, ['#286141', '#35724a', '#468054']);
      }
      // Ferns soften the foreground frame but leave every exit lane open.
      for (const x of [27, 50, 88, 218, 283]) {
        const y = 111 + (x % 3);
        for (let k = -2; k <= 2; k++) {
          strokedPath(c, '#386746', 0.9, (p) => {
            p.moveTo(x, y + 7); p.quadraticCurveTo(x + k * 3, y + 1, x + k * 6, y - 6 + Math.abs(k) * 2);
          });
          E(c, k % 2 ? '#61905b' : '#4b8050', x + k * 6, y - 6 + Math.abs(k) * 2, 2.8, 1.3);
        }
      }
      glow(c, 164, 54, 44, '255,224,164', 0.045 + Math.sin(e.t * 0.8) * 0.018);
      const motes = seeded(52);
      for (let i = 0; i < 9; i++) {
        const x = 89 + motes() * 145 + Math.sin(e.t * 0.55 + i) * 1.8;
        const y = 47 + motes() * 47 + Math.cos(e.t * 0.7 + i * 2) * 1.2;
        const alpha = 0.22 + (Math.sin(e.t * 1.3 + i * 2.1) + 1) * 0.18;
        E(c, 'rgba(255,235,174,' + alpha + ')', x, y, 0.65);
      }
      groundHaze(c, 'rgba(32,38,28,0.13)', 115);
    },
    sprites: [
      // Spider monkey Balamito in the tree branch
      [55, (c, e) => {
        const mx = 200, my = 47;
        L(c, '#49352a', mx - 3, my + 5, mx - 13, my - 1, 2);
        L(c, '#49352a', mx - 13, my - 1, mx - 12, my - 9, 1.6);
        L(c, '#76523c', mx - 12, my - 9, mx - 9, my - 11, 1.1);
        L(c, '#604331', mx - 3, my + 3, mx - 7, my + 8, 1.5);
        L(c, '#604331', mx + 2, my + 3, mx + 7, my + 8, 1.5);
        E(c, 'rgba(0,0,0,0.24)', mx, my + 9, 7, 1.4);
        E(c, '#65452f', mx, my + 1, 6, 7);
        E(c, '#80583d', mx, my - 6, 6.5, 5.5);
        E(c, '#d6b486', mx + 1.5, my - 5, 4.2, 3.5);
        E(c, '#e4c69a', mx + 2, my - 4, 2.8, 2.3);
        E(c, '#171711', mx + 1, my - 6, 0.8, 0.9);
        E(c, '#171711', mx + 4, my - 6, 0.8, 0.9);
        E(c, '#f0d7ac', mx - 5.5, my - 6, 2, 2.5);
        E(c, '#f0d7ac', mx + 5.5, my - 6, 2, 2.5);
        L(c, '#3f2d24', mx + 3, my - 1, mx + 7, my + 3, 1.2);
        if (!e.g.flag('scimmia_sazia')) {
          L(c, '#65452f', mx + 4, my, mx + 8, my - 3, 1.2);
          P(c, '#087c66', [[mx + 7, my - 7], [mx + 11, my - 4], [mx + 8, my]]);
          E(c, '#66e0a7', mx + 9, my - 4, 2.1, 2.8);
          E(c, '#d6ffe8', mx + 8.5, my - 5, 0.6, 0.8);
          glow(c, mx + 9, my - 4, 7, '0,230,118', 0.28);
        }
      }],
      // Exotic tropical flowers
      [116, (c) => {
        for (const [x, y, color] of [[88, 116, '#d9798e'], [285, 114, '#a98bb6']]) {
          L(c, '#52754a', x, y + 2, x - 1, y + 7, 0.8);
          L(c, '#52754a', x, y + 5, x + 3, y + 4, 0.7);
          E(c, '#62854d', x + 1, y + 4, 1.7, 0.7);
          for (let i = 0; i < 5; i++) {
            const a = i * Math.PI * 2 / 5;
            E(c, color, x + Math.cos(a) * 1.5, y + Math.sin(a) * 1.5, 1.05, 0.9);
          }
          E(c, '#f2d189', x, y, 0.7, 0.7);
        }
      }],
    ],
  };

  // ---------- ROOM 3: MAYA_VILLAGGIO ----------
  rooms.maya_villaggio = {
    name: 'Il Villaggio Maya', music: 'maya_villaggio',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    draw(c, e) {
      const sky = c.createLinearGradient(0, 0, 0, 92);
      sky.addColorStop(0, '#588b9a'); sky.addColorStop(0.58, '#b8c2a0'); sky.addColorStop(1, '#e8be80');
      c.fillStyle = sky; c.fillRect(0, 0, 320, 92);
      glow(c, 248, 28, 54, '255,224,164', 0.2);
      E(c, 'rgba(255,232,185,0.78)', 248, 28, 9);
      // Distant green ridges dissolve into the late-afternoon haze.
      filledPath(c, '#536f54', (p) => {
        p.moveTo(0, 69); p.bezierCurveTo(32, 54, 51, 63, 76, 52);
        p.bezierCurveTo(108, 41, 126, 62, 153, 55);
        p.bezierCurveTo(190, 43, 210, 63, 240, 50);
        p.bezierCurveTo(267, 43, 294, 58, 320, 48);
        p.lineTo(320, 98); p.lineTo(0, 98); p.closePath();
      });
      filledPath(c, 'rgba(205,197,143,0.2)', (p) => {
        p.moveTo(145, 0); p.lineTo(193, 0); p.lineTo(252, 102); p.lineTo(93, 102); p.closePath();
      });
      for (const [x, y, size] of [[11, 72, 18], [39, 68, 16], [151, 72, 18], [173, 68, 16], [300, 70, 20]]) {
        foliageCluster(c, x, y, size, ['#355e43', '#47754b', '#5a8050']);
      }
      const earth = c.createLinearGradient(0, 85, 0, 140);
      earth.addColorStop(0, '#997451'); earth.addColorStop(0.42, '#b18a5e'); earth.addColorStop(1, '#75583e');
      c.fillStyle = earth; c.fillRect(0, 85, 320, 55);
      // The curved central plaza gathers the house, cacao tree and common hearth.
      filledPath(c, '#cfb17a', (p) => {
        p.moveTo(-4, 97); p.bezierCurveTo(46, 90, 74, 94, 111, 92);
        p.bezierCurveTo(145, 88, 174, 91, 205, 91);
        p.bezierCurveTo(249, 89, 282, 91, 324, 84);
        p.lineTo(324, 104); p.bezierCurveTo(281, 111, 244, 109, 207, 108);
        p.bezierCurveTo(174, 108, 145, 105, 113, 111);
        p.bezierCurveTo(72, 116, 35, 108, -4, 116); p.closePath();
      });
      strokedPath(c, 'rgba(244,220,170,0.55)', 1, (p) => {
        p.moveTo(-2, 98); p.bezierCurveTo(48, 91, 78, 96, 114, 94);
        p.bezierCurveTo(148, 90, 175, 93, 207, 93);
        p.bezierCurveTo(250, 91, 285, 93, 322, 87);
      });
      filledPath(c, 'rgba(94,68,43,0.23)', (p) => {
        p.moveTo(0, 109); p.bezierCurveTo(44, 104, 78, 111, 112, 105);
        p.bezierCurveTo(145, 100, 177, 104, 210, 103);
        p.bezierCurveTo(251, 102, 284, 104, 320, 98);
        p.lineTo(320, 113); p.bezierCurveTo(280, 119, 251, 116, 211, 117);
        p.bezierCurveTo(176, 118, 144, 113, 113, 120);
        p.bezierCurveTo(76, 126, 39, 117, 0, 124); p.closePath();
      });
      // The entrance and house door open onto the sunlit, uncluttered plaza.
      filledPath(c, '#c39d64', (p) => {
        p.moveTo(0, 106); p.quadraticCurveTo(17, 103, 26, 113); p.lineTo(43, 140);
        p.lineTo(0, 140); p.closePath();
      });
      filledPath(c, 'rgba(239,211,154,0.48)', (p) => {
        p.moveTo(72, 103); p.lineTo(90, 102); p.quadraticCurveTo(101, 117, 111, 140);
        p.lineTo(72, 140); p.closePath();
      });
      const r = seeded(67);
      for (let i = 0; i < 30; i++) {
        const x = 18 + r() * 282, y = 115 + r() * 23;
        E(c, i % 3 ? 'rgba(224,195,142,0.7)' : 'rgba(92,65,41,0.28)', x, y, 1.1 + r() * 2, 0.55);
        if (i % 3 === 0) L(c, 'rgba(89,64,43,0.34)', x - 1.5, y + 1, x + 1.5, y + 0.7, 0.45);
      }
      // Main home and the smaller family house share one warm, legible style.
      mayaHut(c, 42, 38, 90, 68, true);
      mayaHut(c, 210, 48, 50, 42, false);
      // A small woven mat and water jar identify the main doorway.
      P(c, '#704934', [[68, 105], [92, 105], [99, 110], [64, 110]]);
      for (let i = 0; i < 5; i++) L(c, '#c6a575', 68 + i * 5, 106, 65 + i * 6, 109, 0.6);
      E(c, '#a95b3d', 100, 101, 3.4, 5);
      E(c, '#e1a071', 100, 98, 2, 1.3);
      L(c, '#6a4d39', 100, 106, 98, 110, 0.7);
      L(c, '#6a4d39', 102, 106, 104, 110, 0.7);
      // Communal fire ring with a safe, clearly separate cooking area.
      E(c, 'rgba(38,27,19,0.3)', 142, 109, 17, 3);
      E(c, '#4b4d3e', 142, 103, 17, 7);
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        E(c, i % 2 ? '#9a8b6a' : '#c1aa7a', 142 + Math.cos(a) * 12, 103 + Math.sin(a) * 4, 3.5, 2.4);
      }
      E(c, '#372d25', 142, 103, 8.5, 3.2);
      H.flame(c, e, 142, 100, 3);
      // Cacao tree with individual leaves and pods plainly visible at its trunk.
      const tx = 282, ty = 109;
      E(c, 'rgba(40,29,20,0.25)', tx, ty + 1, 15, 2);
      P(c, '#614631', [[tx - 5, ty], [tx - 3, ty - 43], [tx + 3, ty - 43], [tx + 7, ty]]);
      P(c, '#9a7049', [[tx - 1, ty - 42], [tx + 2, ty - 42], [tx + 5, ty - 2], [tx + 1, ty - 2]]);
      for (let i = 0; i < 13; i++) {
        const x = tx - 18 + (i * 17 % 38), y = ty - 63 + (i * 13 % 27);
        E(c, i % 3 ? '#347449' : '#4b8a52', x, y, 8 + (i % 2), 5 + (i % 3));
        L(c, '#a2ad62', x - 4, y, x + 4, y - 1, 0.45);
      }
      P(c, '#315f3d', [[tx - 20, ty - 49], [tx - 11, ty - 70], [tx - 4, ty - 53], [tx + 5, ty - 73], [tx + 12, ty - 52], [tx + 20, ty - 64], [tx + 22, ty - 44]]);
      if (!e.g.flag('cacao_preso')) {
        for (const [x, y, col] of [[tx - 5, ty - 32, '#aa4937'], [tx + 4, ty - 40, '#bb5136'], [tx + 3, ty - 23, '#8e3f31']]) {
          E(c, '#573c2b', x, y + 1, 3.3, 5);
          E(c, col, x, y, 2.7, 4.4);
          L(c, '#e39a65', x - 1, y - 2, x, y + 2, 0.5);
          L(c, '#70402e', x + 1, y - 3, x + 2, y + 2, 0.45);
        }
      }
      // Basket of dry palm leaves under the tree; no props obstruct the exits.
      P(c, '#7b5636', [[269, 109], [284, 109], [282, 116], [271, 116]]);
      for (let i = 0; i < 4; i++) L(c, '#d4b077', 270, 110 + i, 283, 110 + i, 0.5);
      groundHaze(c, 'rgba(76,53,35,0.08)', 117);
    },
    sprites: [
      // Chieftain Naso di Giaguaro
      [114, (c, e) => {
        mayaPerson(c, 188, 110, {
          id: 'capo', dir: -1,
          shirt: '#376955', stripes: '#cda55d', pants: '#44382e',
          hair: '#29251f', hat: 'feather', skin: '#b97852',
        }, e);
        // Quetzal feather headdress highlights (emerald green)
        P(c, '#23795d', [[186, 86], [188, 70], [191, 86]]);
        P(c, '#318b68', [[182, 88], [184, 74], [186, 88]]);
        P(c, '#62a877', [[191, 88], [194, 73], [193, 88]]);
        // Jade pendant necklace
        E(c, '#3e987e', 188, 98, 1.8);
        E(c, '#b8e3ad', 187.6, 97.5, 0.45);
      }],
    ],
  };

  // ---------- ROOM 4: MAYA_CAPANNA ----------
  rooms.maya_capanna = {
    name: 'Interno Casa Maya', music: 'maya_villaggio',
    walk: [[10, 108], [306, 108], [306, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    draw(c, e) {
      // A low thatched roof frames an open-plaster wall with a warm central glow.
      const interior = c.createLinearGradient(0, 0, 0, 110);
      interior.addColorStop(0, '#45342b'); interior.addColorStop(0.42, '#80583d'); interior.addColorStop(1, '#a3774c');
      c.fillStyle = interior; c.fillRect(0, 0, 320, 110);
      filledPath(c, '#342a25', (p) => {
        p.moveTo(0, 0); p.lineTo(320, 0); p.lineTo(267, 26);
        p.quadraticCurveTo(160, 38, 53, 26); p.closePath();
      });
      filledPath(c, '#60432f', (p) => {
        p.moveTo(0, 0); p.lineTo(54, 26); p.lineTo(57, 101);
        p.quadraticCurveTo(28, 105, 0, 109); p.closePath();
      });
      filledPath(c, '#684831', (p) => {
        p.moveTo(320, 0); p.lineTo(267, 26); p.lineTo(263, 101);
        p.quadraticCurveTo(292, 105, 320, 109); p.closePath();
      });
      filledPath(c, '#b88755', (p) => {
        p.moveTo(54, 26); p.quadraticCurveTo(160, 20, 267, 26);
        p.lineTo(263, 103); p.quadraticCurveTo(160, 97, 57, 103); p.closePath();
      });
      const plaster = c.createLinearGradient(64, 30, 250, 90);
      plaster.addColorStop(0, '#d7b77e'); plaster.addColorStop(0.55, '#c69a62'); plaster.addColorStop(1, '#aa7950');
      filledPath(c, plaster, (p) => {
        p.moveTo(63, 31); p.quadraticCurveTo(159, 27, 257, 31);
        p.lineTo(254, 97); p.quadraticCurveTo(160, 93, 65, 98); p.closePath();
      });
      // Clay wall texture follows the wall's gentle perspective.
      for (let x = 70; x < 254; x += 13) {
        L(c, '#8a6343', x, 30, x - 2, 97, 0.8);
        L(c, 'rgba(242,205,147,0.42)', x + 3, 32, x + 2, 95, 0.45);
      }
      for (let y = 36; y < 97; y += 12) {
        L(c, 'rgba(108,76,51,0.55)', 64, y, 256, y + 1, 0.65);
      }
      // Carved lintel and a small sun motif give the room a clear focal wall.
      filledPath(c, '#654633', (p) => {
        p.moveTo(72, 34); p.quadraticCurveTo(160, 31, 254, 34);
        p.lineTo(253, 40); p.quadraticCurveTo(160, 37, 73, 40); p.closePath();
      });
      L(c, '#e0bd7d', 76, 35, 250, 35, 0.8);
      E(c, '#9d5137', 158, 53, 7, 7);
      E(c, '#edc77d', 158, 53, 4.4, 4.4);
      E(c, '#8a4c34', 158, 53, 1.7, 1.7);
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        L(c, '#b77642', 158, 53, 158 + Math.cos(a) * 10, 53 + Math.sin(a) * 10, 0.8);
      }
      // Heavy rafters meet at the ridge; short cross-pieces read as a real roof frame.
      for (const x of [18, 60, 104, 160, 216, 260, 302]) {
        const ridgeX = x < 160 ? 160 : 160;
        L(c, '#4b3428', x, 0, ridgeX + (x - 160) * 0.17, 35, 4);
        L(c, '#ba8753', x + 1, 1, ridgeX + (x - 160) * 0.17 + 1, 34, 0.8);
      }
      for (let y = 8; y < 29; y += 7) {
        L(c, '#775237', 12, y, 308, y, 1);
      }
      R(c, '#4a3428', 56, 97, 208, 5);
      R(c, '#ba8753', 59, 98, 202, 1);
      // The doorway on the left has a bright view outside and an open floor approach.
      P(c, '#283d31', [[0, 40], [16, 43], [18, 99], [0, 103]]);
      P(c, '#83a76e', [[1, 52], [13, 54], [13, 90], [1, 94]]);
      E(c, '#e8c981', 7, 61, 3, 3);
      P(c, '#5e4932', [[0, 96], [20, 92], [35, 110], [0, 110]]);
      L(c, '#3e2d25', 16, 43, 18, 99, 2);
      L(c, '#c1955c', 19, 47, 20, 96, 0.8);
      // Hammock, anchored high and kept within its clickable rectangle.
      const hx = 37, hy = 69;
      L(c, '#543a29', 10, 45, hx - 9, hy, 1.8);
      L(c, '#543a29', 70, 43, hx + 19, hy, 1.8);
      L(c, '#d4bd87', 10, 45, hx - 9, hy, 0.55);
      L(c, '#d4bd87', 70, 43, hx + 19, hy, 0.55);
      P(c, '#77513a', [[hx - 18, hy - 2], [hx + 18, hy - 2], [hx + 9, hy + 19], [hx, hy + 23], [hx - 9, hy + 19]]);
      P(c, '#e6d09b', [[hx - 15, hy], [hx + 15, hy], [hx + 8, hy + 17], [hx, hy + 20], [hx - 8, hy + 17]]);
      for (let i = -3; i <= 3; i++) {
        L(c, i % 2 ? '#399b9a' : '#bd8754', hx + i * 4, hy + 1, hx + i * 2.5, hy + 18, 1.5);
      }
      L(c, '#d9c18a', hx - 17, hy + 1, hx - 23, hy + 5, 0.8);
      L(c, '#d9c18a', hx + 17, hy + 1, hx + 23, hy + 5, 0.8);
      // Petate floor with a woven border and a broad, clear walking strip.
      grad(c, 0, 101, 320, 39, ['#9a7350', '#76553d', '#503b2e']);
      P(c, '#cfb27a', [[57, 108], [260, 108], [283, 140], [35, 140]]);
      P(c, '#8c6845', [[64, 112], [253, 112], [270, 136], [48, 136]]);
      P(c, '#d4bb85', [[67, 113], [250, 113], [265, 133], [53, 133]]);
      for (let y = 115; y < 134; y += 3) L(c, '#9b7a50', 58, y, 260, y + 1, 0.65);
      for (let x = 61; x < 258; x += 10) L(c, 'rgba(104,76,47,0.5)', x, 113, x + 15, 134, 0.45);
      P(c, '#c3a16a', [[0, 107], [18, 103], [46, 111], [37, 136], [0, 136]]);
      for (let i = 0; i < 7; i++) L(c, '#e4ca91', 1, 111 + i * 3, 31, 108 + i * 3, 0.55);
      // Painted jars on the right, each with a rim, neck and simple geometric bands.
      for (const [ux, uy, rx, ry, col] of [[266, 96, 8, 11, '#b65c39'], [283, 100, 6, 8, '#d08a50']]) {
        E(c, 'rgba(0,0,0,0.22)', ux, uy + ry + 1, rx + 2, 1.4);
        E(c, '#693e2f', ux, uy - ry + 2, rx * 0.48, 2);
        E(c, col, ux, uy, rx, ry);
        E(c, '#e0ad6a', ux, uy - 1, rx - 1.5, 1.6);
        E(c, '#704130', ux, uy - ry + 2, rx * 0.36, 1);
        L(c, '#f0d093', ux - rx * 0.55, uy, ux + rx * 0.55, uy, 0.7);
        E(c, '#724431', ux, uy + 4, rx * 0.34, 1.6);
      }
      // Low stone metate and roller stay left of Nonna, leaving room for the player.
      E(c, 'rgba(0,0,0,0.24)', 169, 112, 19, 2);
      P(c, '#4c4a3e', [[151, 99], [184, 99], [188, 106], [147, 106]]);
      P(c, '#9b9577', [[153, 99], [182, 99], [184, 103], [151, 103]]);
      L(c, '#48463b', 153, 106, 151, 112, 1.6);
      L(c, '#48463b', 183, 106, 185, 112, 1.6);
      R(c, '#5e5a48', 158, 97, 19, 3);
      R(c, '#b7a681', 160, 97, 15, 1);
      // Late sun falls through the doorway and a small cooking fire warms the floor.
      filledPath(c, 'rgba(240,198,120,0.13)', (p) => {
        p.moveTo(5, 54); p.lineTo(16, 54); p.lineTo(111, 137); p.lineTo(8, 137); p.closePath();
      });
      glow(c, 178, 110, 38, '255,145,54', 0.12);
      const shade = c.createLinearGradient(0, 0, 0, 140);
      shade.addColorStop(0, 'rgba(23,18,16,0.12)'); shade.addColorStop(0.7, 'rgba(23,18,16,0)');
      shade.addColorStop(1, 'rgba(23,18,16,0.2)');
      c.fillStyle = shade; c.fillRect(0, 0, 320, 140);
    },
    sprites: [
      // Basket of sweet corn (cesto)
      [112, (c, e) => {
        // Woven basket
        P(c, '#8d6e63', [[92, 94], [116, 94], [112, 110], [96, 110]]);
        if (!e.g.flag('mais_preso')) {
          // Yellow corn cobs in basket
          E(c, '#fdd835', 100, 92, 3, 6);
          E(c, '#fbc02d', 106, 90, 3, 7);
          E(c, '#ffee58', 111, 93, 2.5, 5);
        }
      }],
      // Nonna Ixchel grinding at the metate
      [114, (c, e) => {
        mayaPerson(c, 196, 104, {
          id: 'nonna', sit: true, dir: -1,
          shirt: '#a65b43', stripes: '#dfc58e', pants: '#756450',
          hair: '#c7b89a', hat: 'bun', skin: '#c18e68',
        }, e);
        // Metate stone roller (mano)
        R(c, '#263238', 166, 98, 12, 3);
      }],
    ],
  };

  // ---------- ROOM 5: MAYA_CENOTE ----------
  rooms.maya_cenote = {
    name: 'Il Cenote Sacro', music: 'grotta',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    draw(c, e) {
      const cave = c.createLinearGradient(0, 0, 0, 112);
      cave.addColorStop(0, '#172733'); cave.addColorStop(0.52, '#243c42'); cave.addColorStop(1, '#48594b');
      c.fillStyle = cave; c.fillRect(0, 0, 320, 112);
      // The roof opens to a small patch of jungle sky; its beam lands on the pool.
      filledPath(c, '#101e26', (p) => {
        p.moveTo(94, 0); p.lineTo(226, 0); p.quadraticCurveTo(213, 11, 198, 17);
        p.lineTo(121, 17); p.quadraticCurveTo(105, 11, 94, 0); p.closePath();
      });
      filledPath(c, 'rgba(247,220,151,0.16)', (p) => {
        p.moveTo(124, 0); p.lineTo(196, 0); p.bezierCurveTo(208, 31, 232, 63, 250, 109);
        p.lineTo(70, 109); p.bezierCurveTo(94, 65, 113, 29, 124, 0); p.closePath();
      });
      filledPath(c, 'rgba(198,239,211,0.12)', (p) => {
        p.moveTo(145, 0); p.lineTo(175, 0); p.bezierCurveTo(184, 35, 198, 71, 210, 108);
        p.lineTo(112, 108); p.bezierCurveTo(126, 67, 137, 31, 145, 0); p.closePath();
      });
      // The limestone walls curve around the water instead of forming a flat backdrop.
      filledPath(c, '#27383d', (p) => {
        p.moveTo(0, 0); p.lineTo(100, 0); p.quadraticCurveTo(112, 14, 105, 25);
        p.bezierCurveTo(91, 40, 102, 53, 96, 67);
        p.bezierCurveTo(88, 82, 77, 95, 56, 106);
        p.lineTo(0, 108); p.closePath();
      });
      filledPath(c, '#34443f', (p) => {
        p.moveTo(320, 0); p.lineTo(220, 0); p.quadraticCurveTo(208, 14, 215, 25);
        p.bezierCurveTo(229, 40, 218, 53, 224, 67);
        p.bezierCurveTo(232, 82, 243, 95, 264, 106);
        p.lineTo(320, 108); p.closePath();
      });
      strokedPath(c, 'rgba(155,164,125,0.48)', 1, (p) => {
        p.moveTo(6, 58); p.quadraticCurveTo(37, 49, 64, 65);
        p.moveTo(6, 80); p.quadraticCurveTo(37, 73, 71, 89);
        p.moveTo(314, 54); p.quadraticCurveTo(284, 48, 257, 65);
        p.moveTo(314, 81); p.quadraticCurveTo(282, 73, 249, 90);
      });
      // Fine roots hang from cracks and disappear into the mossy rock.
      for (let i = 0; i < 8; i++) {
        const x = 14 + i * 42, h = 14 + (i % 3) * 7;
        strokedPath(c, i % 2 ? '#65745a' : '#806f4c', 0.8, (p) => {
          p.moveTo(x, 0); p.quadraticCurveTo(x + 2, h * 0.55, x - 2, h);
        });
        if (i % 2 === 0) E(c, '#657858', x - 2, h + 1, 2, 1.2);
      }
      for (const [x, y, size] of [[15, 58, 15], [37, 83, 13], [286, 57, 14], [305, 83, 15]]) {
        foliageCluster(c, x, y, size, ['#3b644b', '#4d7450', '#66805a']);
      }
      // A low rocky path comes in from the left and stays clear of the pool.
      grad(c, 0, 101, 320, 39, ['#4d5245', '#343e3b', '#202c32']);
      P(c, '#74725a', [[0, 101], [21, 97], [40, 103], [61, 110], [0, 114]]);
      P(c, '#8e896b', [[0, 106], [19, 102], [36, 107], [54, 113], [0, 117]]);
      for (let i = 0; i < 8; i++) {
        const x = i * 7, y = 111 + (i % 3) * 4;
        P(c, i % 2 ? '#766d55' : '#999070', [[x, y], [x + 5, y - 2], [x + 9, y + 1], [x + 4, y + 4]]);
      }
      // A wide, deep cenote has a crisp limestone rim and layered turquoise water.
      filledPath(c, '#89876d', (p) => {
        p.moveTo(49, 99); p.quadraticCurveTo(51, 82, 70, 75);
        p.bezierCurveTo(102, 63, 216, 66, 245, 76);
        p.quadraticCurveTo(267, 85, 267, 99); p.quadraticCurveTo(265, 109, 251, 111);
        p.lineTo(60, 111); p.quadraticCurveTo(48, 108, 49, 99); p.closePath();
      });
      c.beginPath();
      c.moveTo(56, 98); c.quadraticCurveTo(58, 85, 75, 79);
      c.bezierCurveTo(108, 69, 213, 71, 239, 80);
      c.quadraticCurveTo(258, 87, 259, 98); c.quadraticCurveTo(256, 106, 246, 107);
      c.lineTo(67, 107); c.quadraticCurveTo(56, 105, 56, 98); c.closePath();
      c.fillStyle = '#395855'; c.fill();
      c.save();
      c.clip();
      grad(c, 63, 77, 188, 32, ['#4ad2c6', '#078a9a', '#07556c']);
      c.fillRect(50, 70, 220, 42);
      c.restore();
      filledPath(c, 'rgba(174,245,219,0.48)', (p) => {
        p.moveTo(72, 84); p.quadraticCurveTo(99, 75, 129, 79);
        p.bezierCurveTo(166, 82, 201, 77, 229, 87);
        p.quadraticCurveTo(196, 85, 168, 87);
        p.bezierCurveTo(128, 89, 99, 83, 72, 89); p.closePath();
      });
      for (let i = 0; i < 8; i++) {
        const x = 78 + (i * 37 % 155) + Math.sin(e.t * 0.65 + i) * 1.8, y = 86 + (i * 11 % 17);
        L(c, i % 2 ? 'rgba(194,248,232,0.48)' : 'rgba(40,215,196,0.55)', x, y, x + 12 + i % 4 * 3, y + 0.4, 0.65);
        E(c, 'rgba(223,255,233,0.42)', x + 4, y + 2, 0.65, 0.65);
      }
      glow(c, 159, 83, 52, '91,244,218', 0.055 + Math.sin(e.t * 1.2) * 0.02);
      for (let i = 0; i < 7; i++) {
        const x = 68 + i * 28;
        P(c, i % 2 ? '#b9a67c' : '#d4c195', [[x, 101], [x + 8, 98], [x + 19, 102], [x + 24, 107], [x - 2, 107]]);
      }
      // Stepped entry at the far left remains visible and clickable.
      P(c, '#827b62', [[0, 78], [19, 78], [34, 109], [0, 109]]);
      for (let y = 83; y < 108; y += 5) {
        L(c, '#c2b58b', 0, y, 22 - (y - 83) * 0.45, y + 1, 1.1);
        L(c, '#514f43', 0, y + 2, 21 - (y - 83) * 0.42, y + 3, 0.6);
      }
      // Altar on the right, with a sculpted water spirit and a fitted sun socket.
      const ax = 242, ay = 58;
      E(c, 'rgba(0,0,0,0.32)', ax + 21, 110, 26, 3);
      P(c, '#3e4b47', [[ax + 2, ay + 48], [ax + 4, ay + 5], [ax + 10, ay], [ax + 32, ay], [ax + 38, ay + 6], [ax + 40, ay + 48]]);
      P(c, '#9e9a7c', [[ax + 5, ay + 45], [ax + 7, ay + 7], [ax + 11, ay + 3], [ax + 31, ay + 3], [ax + 35, ay + 8], [ax + 37, ay + 45]]);
      P(c, '#767863', [[ax + 8, ay + 43], [ax + 10, ay + 9], [ax + 30, ay + 7], [ax + 32, ay + 43]]);
      R(c, '#b8aa82', ax + 10, ay + 7, 20, 1);
      E(c, '#c5b88f', ax + 20, ay + 17, 11, 8);
      E(c, '#716d56', ax + 20, ay + 17, 8, 6);
      E(c, '#d6c69a', ax + 20, ay + 15, 5, 4);
      E(c, '#3c4038', ax + 17, ay + 15, 1.1, 1.2);
      E(c, '#3c4038', ax + 23, ay + 15, 1.1, 1.2);
      P(c, '#c3b68b', [[ax + 12, ay + 23], [ax + 20, ay + 21], [ax + 28, ay + 23], [ax + 26, ay + 27], [ax + 20, ay + 26], [ax + 14, ay + 28]]);
      if (!e.g.flag('altare_aperto')) {
        E(c, '#30342f', ax + 20, ay + 34, 7.5, 7.5);
        E(c, '#b59a62', ax + 20, ay + 34, 5.3, 5.3);
        E(c, '#313c37', ax + 20, ay + 34, 3.8, 3.8);
      } else {
        R(c, '#292c28', ax + 10, ay + 26, 20, 20);
        E(c, '#4e3e1f', ax + 20, ay + 37, 8, 8);
        glow(c, ax + 20, ay + 35, 18, '255,215,0', 0.4);
      }
      for (let i = 0; i < 5; i++) {
        R(c, i % 2 ? '#60765a' : '#83906a', ax + 5 + i * 7, ay + 42, 3, 1.4);
      }
    },
    sprites: [
      // Giant bullfrog wearing a lilypad hat
      [92, (c, e) => {
        if (!e.g.flag('rana_fuggita')) {
          const fx = 142, fy = 84;
          // Frog body
          E(c, '#2e7d32', fx, fy, 10, 7);
          // Big frog eyes
          E(c, '#388e3c', fx - 5, fy - 7, 4, 4);
          E(c, '#388e3c', fx + 5, fy - 7, 4, 4);
          E(c, '#ffeb3b', fx - 5, fy - 7, 2, 2);
          E(c, '#ffeb3b', fx + 5, fy - 7, 2, 2);
          R(c, '#111', fx - 5, fy - 7, 1, 2);
          R(c, '#111', fx + 5, fy - 7, 1, 2);
          // Lilypad hat on head
          E(c, '#66bb6a', fx, fy - 10, 8, 2.5);
        }
      }],
      // Sacred Water Lily
      [88, (c, e) => {
        if (!e.g.flag('ninfea_raccolta')) {
          const lx = 178, ly = 86;
          // Floating green pad
          E(c, '#1b5e20', lx, ly, 10, 4);
          // Glowing blue/white flower
          E(c, '#e0f7fa', lx, ly - 3, 5, 4);
          E(c, '#00e5ff', lx, ly - 2, 3, 3);
          E(c, '#ffd600', lx, ly - 3, 1.5, 1.5);
          glow(c, lx, ly - 3, 12, '0,229,255', 0.45 + Math.sin(e.t * 3) * 0.15);
        }
      }],
      // Golden Serpent Mask inside opened altar
      [100, (c, e) => {
        if (e.g.flag('altare_aperto') && !e.g.flag('maschera_presa')) {
          const mx = 262, my = 94;
          P(c, '#93612e', [[mx - 8, my - 4], [mx - 5, my - 8], [mx + 5, my - 8], [mx + 8, my - 4], [mx + 7, my + 3], [mx + 2, my + 7], [mx - 3, my + 6], [mx - 7, my + 2]]);
          P(c, '#e1ae48', [[mx - 7, my - 4], [mx - 4, my - 7], [mx + 4, my - 7], [mx + 7, my - 4], [mx + 6, my + 2], [mx + 2, my + 5], [mx - 3, my + 5], [mx - 6, my + 1]]);
          P(c, '#ffd978', [[mx - 4, my - 6], [mx + 1, my - 6], [mx + 1, my + 4], [mx - 3, my + 4]]);
          for (let i = 0; i < 3; i++) {
            const fx = mx - 4 + i * 4;
            P(c, i % 2 ? '#338b70' : '#45a680', [[fx - 1, my - 6], [fx, my - 12 + i % 2], [fx + 2, my - 7], [fx + 1, my - 4]]);
            L(c, '#a7d6a5', fx, my - 10 + i % 2, fx, my - 6, 0.45);
          }
          P(c, '#6d482c', [[mx - 6, my - 3], [mx - 1, my - 3], [mx - 2, my], [mx - 5, my]]);
          P(c, '#6d482c', [[mx + 1, my - 3], [mx + 6, my - 3], [mx + 5, my], [mx + 2, my]]);
          E(c, '#61d6a1', mx - 3.5, my - 1.5, 1.1, 1.1);
          E(c, '#61d6a1', mx + 3.5, my - 1.5, 1.1, 1.1);
          P(c, '#be8035', [[mx - 1, my - 2], [mx + 2, my - 1], [mx + 1, my + 2], [mx - 1, my + 1]]);
          L(c, '#73482c', mx - 3, my + 2, mx + 2, my + 2, 0.7);
          L(c, '#4b8567', mx - 5, my + 1, mx - 7, my + 4, 0.7);
          glow(c, mx, my, 12, '255,215,0', 0.32);
        }
      }],
    ],
  };

  // ---------- ROOM 6: MAYA_TEMPIO ----------
  rooms.maya_tempio = {
    name: 'La Piramide Maya', music: 'faro',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    draw(c, e) {
      const dusk = c.createLinearGradient(0, 0, 0, 104);
      dusk.addColorStop(0, '#405c72'); dusk.addColorStop(0.55, '#9a9277'); dusk.addColorStop(1, '#e5a56e');
      c.fillStyle = dusk; c.fillRect(0, 0, 320, 108);
      glow(c, 246, 31, 48, '255,207,136', 0.24);
      E(c, '#ffdda0', 246, 31, 8);
      // The temple rises above hazy, overlapping ridges at the edge of the jungle.
      filledPath(c, '#435847', (p) => {
        p.moveTo(0, 75); p.bezierCurveTo(32, 54, 55, 66, 83, 53);
        p.bezierCurveTo(115, 42, 139, 65, 169, 54);
        p.bezierCurveTo(199, 44, 219, 64, 250, 51);
        p.bezierCurveTo(280, 44, 299, 60, 320, 49);
        p.lineTo(320, 104); p.lineTo(0, 104); p.closePath();
      });
      filledPath(c, '#61704e', (p) => {
        p.moveTo(0, 86); p.bezierCurveTo(38, 72, 67, 82, 97, 70);
        p.bezierCurveTo(127, 60, 149, 80, 177, 69);
        p.bezierCurveTo(210, 59, 238, 79, 265, 68);
        p.bezierCurveTo(289, 61, 305, 76, 320, 69);
        p.lineTo(320, 108); p.lineTo(0, 108); p.closePath();
      });
      // The restless volcano is distant, so its smoke never hides the temple.
      volcano(c, e, 18, 22, 56, 44);
      filledPath(c, 'rgba(230,194,127,0.12)', (p) => {
        p.moveTo(150, 0); p.lineTo(181, 0); p.lineTo(227, 108); p.lineTo(103, 108); p.closePath();
      });
      grad(c, 0, 101, 320, 39, ['#85704c', '#62533a', '#40372e']);
      filledPath(c, '#bf9e64', (p) => {
        p.moveTo(0, 110); p.bezierCurveTo(45, 106, 72, 111, 112, 108);
        p.bezierCurveTo(153, 104, 183, 109, 217, 107);
        p.bezierCurveTo(260, 104, 287, 109, 320, 108);
        p.lineTo(320, 140); p.lineTo(0, 140); p.closePath();
      });
      strokedPath(c, 'rgba(239,210,153,0.42)', 1.2, (p) => {
        p.moveTo(0, 112); p.bezierCurveTo(45, 108, 72, 113, 112, 110);
        p.bezierCurveTo(153, 106, 183, 111, 217, 109);
        p.bezierCurveTo(260, 106, 287, 111, 320, 110);
      });
      const soil = seeded(91);
      for (let i = 0; i < 23; i++) {
        E(c, i % 2 ? 'rgba(52,42,30,0.32)' : 'rgba(244,214,156,0.3)', soil() * 320, 121 + soil() * 17, 1 + soil() * 2, 0.6);
      }
      // Ancient stepped pyramid: every terrace has a sunlit lip and a shaded face.
      const px = 160, py = 110, tiers = [[150, 14], [130, 14], [110, 14], [90, 14], [70, 14], [52, 16]];
      let curY = py;
      tiers.forEach((t, i) => {
        curY -= t[1];
        const left = px - t[0] / 2, right = px + t[0] / 2;
        const stone = c.createLinearGradient(left, curY, right, curY + t[1]);
        stone.addColorStop(0, i % 2 ? '#c1b58b' : '#d0bf91');
        stone.addColorStop(0.56, i % 2 ? '#a39c79' : '#b2a57d');
        stone.addColorStop(1, '#6d7565');
        c.fillStyle = '#46534d'; c.fillRect(left, curY, t[0], t[1]);
        P(c, i % 2 ? '#c2b58b' : '#d0bf91', [[left + 1, curY + 1], [right - 1, curY + 1], [right - 1, curY + 3], [left + 1, curY + 3]]);
        P(c, stone, [[left + 1, curY + 3], [px, curY + 3], [px, curY + t[1] - 1], [left + 1, curY + t[1] - 1]]);
        P(c, '#707765', [[px, curY + 3], [right - 1, curY + 3], [right - 1, curY + t[1] - 1], [px, curY + t[1] - 1]]);
        L(c, '#e7d5a5', left + 2, curY + 1.4, right - 2, curY + 1.4, 0.8);
        L(c, '#576357', left + 1, curY + t[1] - 1, right - 1, curY + t[1] - 1, 0.8);
        for (let bx = left + 11; bx < right - 5; bx += 16) {
          L(c, '#777963', bx, curY + 3, bx, curY + t[1] - 2, 0.65);
          L(c, 'rgba(240,222,174,0.65)', bx + 1, curY + 4, bx + 1, curY + t[1] - 3, 0.4);
        }
        if (i < 5) {
          for (let by = curY + 5; by < curY + t[1] - 2; by += 6) L(c, '#8e8d70', left + 3, by, right - 3, by, 0.45);
        }
      });
      // Top sanctuary, deep doorway and a broad landing for the priest.
      P(c, '#414d47', [[px - 29, curY + 1], [px - 25, curY - 13], [px + 25, curY - 13], [px + 29, curY + 1]]);
      P(c, '#b6ad87', [[px - 25, curY - 12], [px + 25, curY - 12], [px + 22, curY - 3], [px - 22, curY - 3]]);
      P(c, '#776e56', [[px - 22, curY - 3], [px + 22, curY - 3], [px + 23, curY + 1], [px - 23, curY + 1]]);
      for (let x = px - 20; x <= px + 20; x += 8) L(c, '#e0cf9b', x, curY - 11, x - 1, curY - 4, 0.8);
      P(c, '#372f29', [[px - 8, curY - 10], [px + 8, curY - 10], [px + 7, curY + 1], [px - 7, curY + 1]]);
      R(c, '#c8b98a', px - 30, curY + 1, 60, 2);
      // A clearly stepped central staircase with paired serpent balustrades.
      P(c, '#555b51', [[px - 23, py], [px - 17, curY + 1], [px + 17, curY + 1], [px + 23, py]]);
      P(c, '#d0c293', [[px - 18, py], [px - 14, curY + 3], [px + 13, curY + 3], [px + 18, py]]);
      P(c, '#a69d76', [[px + 1, py], [px + 13, curY + 3], [px + 13, py]]);
      for (let sy = curY + 6; sy < py - 1; sy += 4) {
        const t = (sy - curY) / (py - curY);
        L(c, '#797c64', px - 14 - t * 3, sy, px + 14 + t * 3, sy, 0.9);
        L(c, 'rgba(246,227,178,0.75)', px - 13 - t * 3, sy + 0.8, px + 13 + t * 3, sy + 0.8, 0.45);
      }
      // Serpent heads at the foot of the stairs flank, rather than cover, the entrance.
      E(c, '#5b654e', px - 23, py - 4, 5.2, 4.2);
      E(c, '#7e825d', px + 23, py - 4, 5.2, 4.2);
      P(c, '#a39265', [[px - 28, py - 5], [px - 24, py - 9], [px - 19, py - 6], [px - 21, py - 2]]);
      P(c, '#b5a06a', [[px + 18, py - 6], [px + 23, py - 9], [px + 28, py - 5], [px + 21, py - 2]]);
      E(c, '#f2cb68', px - 24, py - 5, 1.1, 1.2);
      E(c, '#f2cb68', px + 22, py - 5, 1.1, 1.2);
      // Three large, separated calendar discs align exactly with their clickable areas.
      const disc = (dx, col, glyph) => {
        const order = (e.g.flag('combo_maya') || '').indexOf(glyph), pressed = order !== -1;
        if (pressed) glow(c, dx, 97, 17, '255,214,119', 0.26);
        E(c, 'rgba(0,0,0,0.3)', dx + 1, 101, 12, 3.4);
        E(c, '#484f48', dx, 98, 12, 12);
        E(c, pressed ? '#f0d48a' : '#c6b789', dx, 97, pressed ? 10.8 : 10, pressed ? 10.8 : 10);
        E(c, pressed ? '#a4864f' : '#6d6c57', dx, 97, 7.3, 7.3);
        E(c, pressed ? '#f4c85e' : col, dx, 97, 5.4, 5.4);
        if (pressed) {
          const angle = order * Math.PI * 0.7 - Math.PI / 2;
          L(c, '#fff0bd', dx + Math.cos(angle) * 8.6, 97 + Math.sin(angle) * 8.6,
            dx + Math.cos(angle) * 10, 97 + Math.sin(angle) * 10, 1);
        }
        if (glyph === 'G') {
          E(c, pressed ? '#684322' : '#4c3a2a', dx, 97, 3.5, 3.5);
          E(c, '#dec68c', dx - 1.2, 96, 0.8, 0.8);
          E(c, '#dec68c', dx + 1.2, 96, 0.8, 0.8);
        } else if (glyph === 'S') {
          E(c, '#fff0a1', dx, 97, 2.2, 2.2);
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            L(c, '#ffe082', dx, 97, dx + Math.cos(a) * 4.4, 97 + Math.sin(a) * 4.4, 0.55);
          }
        } else {
          P(c, '#8ed078', [[dx - 2, 97], [dx + 1, 94], [dx + 3, 97], [dx, 100]]);
          E(c, '#f0d286', dx + 2, 95, 0.7, 0.7);
        }
      };
      disc(96, '#bd7340', 'G');
      disc(158, '#d8a93f', 'S');
      disc(220, '#4c8b55', 'P');
      if (!e.g.flag('tempio_sbloccato')) {
        P(c, 'rgba(38,43,39,0.35)', [[px - 17, 62], [px + 17, 62], [px + 17, 98], [px - 17, 98]]);
        for (let gx = px - 15; gx <= px + 15; gx += 5) {
          L(c, '#333d38', gx, 62, gx, 97, 2);
          L(c, '#a4a184', gx + 0.7, 63, gx + 0.7, 96, 0.45);
        }
        for (const y of [64, 77, 90]) L(c, '#39443d', px - 17, y, px + 17, y, 2.2);
        E(c, '#c6b789', px, 77, 2, 2);
      }
    },
    sprites: [
      // Sommo Sacerdote Kukul-Pop and Brazier (at top of pyramid)
      [39, (c, e) => {
        if (e.g.flag('tempio_sbloccato')) {
          // Sacerdote
          mayaPerson(c, 150, 36, {
            id: 'sacerdote', dir: 1,
            shirt: '#375e4d', stripes: '#c8a55e', pants: '#354536',
            hair: '#29251f', hat: e.g.flag('sacerdote_mascherato') ? 'turban' : 'bun', skin: '#b97852',
          }, e);
          if (e.g.flag('sacerdote_mascherato')) {
            // Golden mask over face!
            E(c, '#ffd700', 151, 26, 4, 4);
            glow(c, 151, 26, 8, '255,215,0', 0.45);
          }
          // Grand Brazier (braciere)
          R(c, '#37474f', 174, 30, 14, 10);
          E(c, '#ff5722', 181, 28, 6, 2);
          H.flame(c, e, 181, 26, 4);
        }
      }],
    ],
  };

  // ---------- MAYA TITLE BACKDROP ----------
  Art.maya_backdrop = function (c, e, lit) {
    // Sunset Caribbean sky
    grad(c, 0, 0, 320, 85, ['#ff512f', '#dd2476', '#f09819']);
    E(c, '#fff4a3', 160, 50, 16);
    glow(c, 160, 50, 45, '255,244,163', 0.5);
    volcano(c, e, 230, 30, 60, 48);
    caribbeanSea(c, e, 80, 28);
    // Sand beach
    grad(c, 0, 108, 320, 32, ['#ffcc80', '#e6a15c']);
    // Silhouette palm trees
    palmTree(c, e, 30, 116, 75, '#2e7d32');
    palmTree(c, e, 290, 118, 85, '#388e3c');
    // Mayan Pyramid silhouette in background
    P(c, '#37474f', [
      [110, 80], [130, 55], [190, 55], [210, 80]
    ]);
    R(c, '#263238', 145, 48, 30, 8);
    // Small Mayan hut
    mayaHut(c, 70, 78, 45, 34, false);
    // Fili sitting on the beach
    person(c, 150, 122, {
      id: 'fili', sit: true, dir: 1,
      shirt: '#a85d3e', stripes: '#e0bd79', pants: '#5e4936', hair: '#443022', hat: 'cap'
    }, e);
    // Celebratory fireworks / sparkles if lit (ending)
    if (lit) {
      for (let i = 0; i < 3; i++) {
        const p = (e.t * 0.5 + i * 0.37) % 1;
        const fx = 70 + i * 90, fy = 25 + (i % 2) * 15;
        const col = ['#00e676', '#ffd700', '#ff4081'][i];
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * 6.283;
          R(c, col, fx + Math.cos(a) * p * 24, fy + Math.sin(a) * p * 24 + p * p * 10, 1.5, 1.5);
        }
      }
    }
  };

  // ---------- INVENTORY ICONS FOR MAYA ITEMS (16 x 16) ----------
  Art.registerIcon('conchiglia_rosa', (c) => {
    E(c, '#f48fb1', 8, 8, 6, 4);
    P(c, '#ec407a', [[11, 6], [15, 8], [11, 11]]);
    E(c, '#fce4ec', 6, 8, 3, 2);
  });
  Art.registerIcon('cocco', (c) => {
    E(c, '#4e342e', 8, 8, 6, 6);
    E(c, '#6d4c41', 6, 6, 3, 3);
    R(c, '#212121', 7, 9, 1.5, 1.5);
    R(c, '#212121', 10, 8, 1.5, 1.5);
    R(c, '#212121', 9, 11, 1.5, 1.5);
  });
  Art.registerIcon('bastone_selce', (c) => {
    L(c, '#8d6e63', 3, 13, 12, 4, 2);
    P(c, '#78909c', [[11, 5], [14, 2], [15, 6]]);
    R(c, '#cfd8dc', 13, 3, 1, 1);
  });
  Art.registerIcon('fave_cacao', (c) => {
    P(c, '#b71c1c', [[3, 6], [13, 3], [14, 11], [5, 13]]);
    E(c, '#4e342e', 7, 8, 2.5, 2);
    E(c, '#4e342e', 10, 7, 2, 2.5);
    E(c, '#4e342e', 9, 10, 2, 2);
  });
  Art.registerIcon('mais', (c) => {
    E(c, '#ffd600', 8, 7, 4, 6);
    P(c, '#388e3c', [[4, 14], [8, 11], [7, 7]]);
    P(c, '#2e7d32', [[12, 14], [8, 11], [9, 7]]);
    for (let y = 3; y <= 9; y += 2) R(c, '#ffab00', 7, y, 2, 1);
  });
  Art.registerIcon('amuleto_giada', (c) => {
    E(c, '#00c853', 8, 8, 6, 6);
    E(c, '#69f0ae', 8, 8, 4, 4);
    E(c, '#00e676', 8, 8, 2, 2);
    R(c, '#ffd700', 7, 1, 2, 2);
  });
  Art.registerIcon('ninfea_sacra', (c) => {
    E(c, '#00bcd4', 8, 11, 7, 3);
    E(c, '#e0f7fa', 8, 8, 5, 4);
    E(c, '#00e5ff', 8, 7, 3, 3);
    E(c, '#ffd600', 8, 6, 1.5, 1.5);
  });
  Art.registerIcon('maschera_oro', (c) => {
    E(c, '#ffd700', 8, 8, 6, 7);
    E(c, '#00e676', 6, 6, 1.5, 1.5);
    E(c, '#00e676', 10, 6, 1.5, 1.5);
    P(c, '#ffab00', [[8, 9], [6, 12], [10, 12]]);
  });
  Art.registerIcon('cioccolata_sacra', (c) => {
    P(c, '#d84315', [[3, 7], [13, 7], [11, 14], [5, 14]]);
    E(c, '#3e2723', 8, 7, 5, 2);
    E(c, '#8d6e63', 8, 6, 3, 1.5);
    R(c, '#ffffff', 6, 3, 1, 2);
    R(c, '#ffffff', 9, 2, 1, 2);
  });
})();
