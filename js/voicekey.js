// The name of the voice file of a line: the same rule for the game (browser) and for scripts/make-voice.js (node).
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.AdvVoiceKey = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // only what a voice can read: letters, numbers, punctuation (no emoji), single spaces
  const cleanLine = (text) => String(text).replace(/[^\p{L}\p{N}\p{P}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  function voiceKey(text) { // short fingerprint of the text (FNV-1a, twice with different seeds)
    const s = cleanLine(text);
    let a = 0x811c9dc5, b = 0x1b873593;
    for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); a = Math.imul(a ^ ch, 0x01000193); b = Math.imul(b ^ ch, 0x85ebca6b) + i; }
    return ((a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0'));
  }
  return { cleanLine, voiceKey };
});
