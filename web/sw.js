const CACHE_NAME = 'luangin-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=5',
  './app.js?v=5',
  './manifest.json?v=5',
  './icon.svg?v=5',
  './icon-192.png?v=5',
  './icon-512.png?v=5',
  './apple-touch-icon.png?v=5'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  const isNetworkFirst =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.json') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg');

  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      });
    })
  );
});
