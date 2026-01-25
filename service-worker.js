// Service Worker for CyberPrank PWA
const CACHE_NAME = 'cyberprank-v1.0';
const urlsToCache = [
  '/CyberPrank/',
  '/CyberPrank/index.html',
  '/CyberPrank/manifest.json',
  '/CyberPrank/service-worker.js',
  '/CyberPrank/icons/icon-72x72.png',
  '/CyberPrank/icons/icon-96x96.png',
  '/CyberPrank/icons/icon-128x128.png',
  '/CyberPrank/icons/icon-144x144.png',
  '/CyberPrank/icons/icon-152x152.png',
  '/CyberPrank/icons/icon-192x192.png',
  '/CyberPrank/icons/icon-384x384.png',
  '/CyberPrank/icons/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new resources
            if (event.request.url.startsWith('http') && 
                event.request.method === 'GET' &&
                !event.request.url.includes('chrome-extension')) {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('[Service Worker] Network fetch failed:', error);
            // Return offline page or cached response
            if (event.request.mode === 'navigate') {
              return caches.match('/CyberPrank/index.html');
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Background sync logic here
  console.log('[Service Worker] Syncing data...');
}

// Push Notification (optional)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received');
  const options = {
    body: event.data.text(),
    icon: '/CyberPrank/icons/icon-192x192.png',
    badge: '/CyberPrank/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('CyberPrank Alert', options)
  );
});