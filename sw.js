const CACHE = 'go-interview-v38';
const ASSETS = [
  './',
  './index.html',
  './go-interview-bank.html',
  './go-interview-konspekty.html',
  './go-interview-tasks.html',
  './go-interview-mocks.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('/');
  if (isPage) {
    // network-first: свежий контент онлайн, кэш офлайн
    e.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./go-interview-bank.html')))
    );
  } else {
    // cache-first для иконок/статики
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
