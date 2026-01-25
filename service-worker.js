const CACHE_NAME = 'cyberprank-v1';
const urlsToCache = [
  '/CyberPrank/',
  '/CyberPrank/index.html',
  '/CyberPrank/manifest.json',
  '/CyberPrank/service-worker.js',
  '/CyberPrank/icons/icon-72.png',
  '/CyberPrank/icons/icon-96.png',
  '/CyberPrank/icons/icon-128.png',
  '/CyberPrank/icons/icon-144.png',
  '/CyberPrank/icons/icon-152.png',
  '/CyberPrank/icons/icon-192.png',
  '/CyberPrank/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});