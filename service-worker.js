// Update this version number with every release
const CACHE = 'otrail-cache-v15';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/styles/game.css?v=9.2',
  './assets/scripts/game.js?v=9.2',
  './assets/images/icon-152.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/shopkeeper.png',
  './assets/images/wood-texture.png',
  './assets/images/nail.png'
];

// Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Activate event: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim(); // claim control immediately
});

// Fetch event: serve cached or fetch fresh
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});