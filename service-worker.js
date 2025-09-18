const CACHE_NAME = 'otrail-cache-v8';
const urlsToCache = ['/', '/index.html?v=8', '/manifest.webmanifest?v=8'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});