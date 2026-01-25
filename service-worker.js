const CACHE_NAME = 'cyberprank-v1.0';
const urlsToCache = [
  '/CyberPrank/',
  '/CyberPrank/index.html',
  '/CyberPrank/manifest.json',
  '/CyberPrank/icons/icon-72x72.png',
  '/CyberPrank/icons/icon-96x96.png',
  '/CyberPrank/icons/icon-128x128.png',
  '/CyberPrank/icons/icon-192x192.png',
  '/CyberPrank/icons/icon-512x512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate Event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});