/* =============================================
   Service Worker — Krutidev to Unicode Converter
   Version: 2026.1
============================================= */

const CACHE_NAME = 'kd-converter-v2026-1';

const STATIC_ASSETS = [
  '/Kruthidev-to-Unicode-Converter/',
  '/Kruthidev-to-Unicode-Converter/index.html',
  '/Kruthidev-to-Unicode-Converter/manifest.json',
];

/* Install: cache static assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

/* Activate: remove old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: cache-first for static, network-first for others */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache-first for our own assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        }).catch(() => caches.match('/Kruthidev-to-Unicode-Converter/'));
      })
    );
    return;
  }

  // Network-first for external (fonts, CDN)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
