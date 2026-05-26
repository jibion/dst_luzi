const CACHE_NAME = 'hausi-v19';

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/js/icons.jsx',
  '/js/onboarding.jsx',
  '/js/home.jsx',
  '/js/results.jsx',
  '/js/settings.jsx',
  '/js/app.jsx',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ detail: 'Sin conexión' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Cache-first for shell assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
