'use strict';

const CACHE_NAME = 'fili-pwa-v10';
const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/core.js',
  './js/story.js',
  './js/story-maya.js',
  './js/story-natale.js',
  './js/voicekey.js',
  './js/voice-index.js',
  './js/audio.js',
  './js/art.js',
  './js/art-maya.js',
  './js/art-natale.js',
  './js/engine.js',
  './assets/fili-isole.ico',
  './assets/apple-touch-icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
];
const voiceDownloads = new Map();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('fili-pwa-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message.requestId !== 'string') return;

  if (message.type === 'cancel-voice-download') {
    const active = voiceDownloads.get(message.requestId);
    if (active) active.abort();
    return;
  }
  if (message.type !== 'download-voices' || !Array.isArray(message.ids) || !event.source) return;

  const source = event.source;
  const controller = new AbortController();
  voiceDownloads.set(message.requestId, controller);
  event.waitUntil((async () => {
    let completed = 0;
    try {
      const cache = await caches.open(CACHE_NAME);
      const urls = message.ids.map((id) => new URL('./voice/' + encodeURIComponent(id) + '.mp3', self.registration.scope).href);
      const cached = await Promise.all(urls.map((url) => cache.match(url)));
      const missing = urls.filter((url, index) => !cached[index]);
      completed = urls.length - missing.length;
      source.postMessage({ type: 'voice-download-progress', requestId: message.requestId, completed, total: urls.length });

      let next = 0, failure = null;
      const workers = Array.from({ length: Math.min(4, missing.length) }, async () => {
        while (!controller.signal.aborted) {
          const index = next++;
          if (index >= missing.length) return;
          try {
            const response = await fetch(missing[index], { signal: controller.signal });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            await cache.put(missing[index], response);
            completed++;
            source.postMessage({ type: 'voice-download-progress', requestId: message.requestId, completed, total: urls.length });
          } catch (error) {
            if (!controller.signal.aborted) {
              failure = error;
              controller.abort();
            }
            return;
          }
        }
      });
      await Promise.all(workers);
      if (failure) {
        source.postMessage({ type: 'voice-download-error', requestId: message.requestId, completed });
      } else if (controller.signal.aborted) {
        source.postMessage({ type: 'voice-download-cancelled', requestId: message.requestId, completed });
      } else {
        source.postMessage({ type: 'voice-download-complete', requestId: message.requestId, completed, total: urls.length });
      }
    } catch (error) {
      source.postMessage({ type: 'voice-download-error', requestId: message.requestId, completed });
    } finally {
      voiceDownloads.delete(message.requestId);
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy)));
        return response;
      }).catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
    }),
  );
});
