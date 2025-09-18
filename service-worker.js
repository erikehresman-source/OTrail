// Service Worker — OTrail Welcome Overlay Build v7
const CACHE = 'otrail-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/images/icon-152.png',-
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/shopkeeper.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
