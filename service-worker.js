// Service Worker for CyberPrank
const CACHE_NAME = 'cyberprank-v1.0';
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
  '/CyberPrank/icons/icon-180.png',
  '/CyberPrank/icons/icon-192.png',
  '/CyberPrank/icons/icon-384.png',
  '/CyberPrank/icons/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});