// Professional PWA Service Worker v2.1 - Cache First Strategy [web:11][page:1]
const CACHE_NAME = 'cyberprank-v2.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request).catch(() => {
                // Offline fallback
                return new Response('🔌 Offline Mode Active - CyberPrank Loaded from Cache', {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                });
            }))
    );
});