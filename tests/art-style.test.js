const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('shared drawing primitives add the same soft light and contour finish', () => {
  const calls = { overlays: 0, strokes: 0 };
  const context = {
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, rect() {}, roundRect() {},
    ellipse() {}, fill() {}, fillRect() { calls.overlays++; }, clip() {}, save() {}, restore() {}, scale() {},
    stroke() { calls.strokes++; },
    createLinearGradient: () => ({ addColorStop() {} }),
  };
  const window = { AdvArt: { rooms: {} } };
  const document = { createElement: () => ({ getContext: () => context }) };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/art.js'), 'utf8'), { window, document });

  const { R, B, E, P } = window.AdvArt.helpers;
  for (const draw of [
    () => R(context, '#a76b42', 1, 1, 10, 8),
    () => B(context, '#7896a3', 1, 1, 12, 8),
    () => E(context, '#d6bb78', 7, 5, 6, 4),
    () => P(context, '#557b56', [[0, 0], [12, 1], [9, 9], [2, 8]]),
  ]) {
    const before = calls.strokes;
    const overlayBefore = calls.overlays;
    draw();
    assert.ok(calls.strokes > before, 'shape receives a consistent soft contour');
    assert.ok(calls.overlays > overlayBefore, 'shape receives a consistent soft-light overlay');
  }
});
