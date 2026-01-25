const CACHE_NAME = 'cyberprank-pwa-v3';
const OFFLINE_URL = '/CyberPrank/offline.html';

// Files to cache
const PRECACHE_URLS = [
  '/CyberPrank/',
  '/CyberPrank/index.html',
  '/CyberPrank/manifest.json',
  '/CyberPrank/sw.js',
  '/CyberPrank/icons/icon-72.png',
  '/CyberPrank/icons/icon-96.png',
  '/CyberPrank/icons/icon-128.png',
  '/CyberPrank/icons/icon-144.png',
  '/CyberPrank/icons/icon-152.png',
  '/CyberPrank/icons/icon-180.png',
  '/CyberPrank/icons/icon-192.png',
  '/CyberPrank/icons/icon-512.png',
  '/CyberPrank/robots.txt',
  '/CyberPrank/sitemap.xml'
];

// Install event
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and we're looking for HTML, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncData());
  }
});

function syncData() {
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'CyberPrank simulation update',
    icon: '/CyberPrank/icons/icon-192.png',
    badge: '/CyberPrank/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'cyberprank-notification'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/CyberPrank/icons/icon-72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/CyberPrank/icons/icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('CyberPrank Alert', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/CyberPrank/');
        }
      })
  );
});