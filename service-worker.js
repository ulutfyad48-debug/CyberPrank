// CyberPrank Advanced Service Worker
const APP_VERSION = '3.0.0';
const CACHE_NAME = `cyberprank-cache-${APP_VERSION}`;

// Core app files
const CORE_FILES = [
  '/CyberPrank/',
  '/CyberPrank/index.html',
  '/CyberPrank/manifest.json'
];

// Asset files
const ASSET_FILES = [
  '/CyberPrank/icons/icon-72.png',
  '/CyberPrank/icons/icon-96.png',
  '/CyberPrank/icons/icon-128.png',
  '/CyberPrank/icons/icon-144.png',
  '/CyberPrank/icons/icon-152.png',
  '/CyberPrank/icons/icon-180.png',
  '/CyberPrank/icons/icon-192.png',
  '/CyberPrank/icons/icon-512.png'
];

// Static files
const STATIC_FILES = [
  '/CyberPrank/robots.txt',
  '/CyberPrank/sitemap.xml',
  '/CyberPrank/README.md'
];

// All files to cache
const ALL_FILES = [...CORE_FILES, ...ASSET_FILES, ...STATIC_FILES];

// Install - cache all essential files
self.addEventListener('install', event => {
  console.log(`[Service Worker ${APP_VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app files');
        return cache.addAll(ALL_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache error:', error);
      })
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  console.log(`[Service Worker ${APP_VERSION}] Activating...`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName);
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

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Handle different strategies based on request
  if (event.request.url.includes('/CyberPrank/')) {
    // App files - cache first
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Update cache in background
            fetchAndCache(event.request);
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
          return fetchAndCache(event.request);
        })
        .catch(() => {
          // If both cache and network fail
          if (event.request.destination === 'document') {
            return caches.match('/CyberPrank/');
          }
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  } else {
    // External resources - network first
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Network failed, check cache
          return caches.match(event.request);
        })
    );
  }
});

// Helper function to fetch and cache
function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      // Check if valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone response for cache
      const responseToCache = response.clone();

      caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(request, responseToCache);
        });

      return response;
    });
}

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-attack-data') {
    console.log('[Service Worker] Background sync: sync-attack-data');
    event.waitUntil(syncAttackData());
  }
});

function syncAttackData() {
  // Simulate data sync
  return Promise.resolve()
    .then(() => {
      console.log('[Service Worker] Attack data synced');
    });
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-simulation') {
    console.log('[Service Worker] Periodic sync: update-simulation');
    event.waitUntil(updateSimulationData());
  }
});

function updateSimulationData() {
  // Update simulation data periodically
  return fetch('/CyberPrank/api/update')
    .catch(() => {
      console.log('[Service Worker] Update failed (offline)');
    });
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');

  let data = {
    title: 'CyberPrank Alert',
    body: 'Security breach detected!',
    icon: '/CyberPrank/icons/icon-192.png',
    badge: '/CyberPrank/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/CyberPrank/'
    }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.log('[Service Worker] Push data parse error:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      data: data.data,
      tag: 'cyberprank-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url.includes('/CyberPrank/') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/CyberPrank/');
          }
        })
    );
  } else if (event.action === 'dismiss') {
    console.log('[Service Worker] Notification dismissed');
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow('/CyberPrank/')
    );
  }
});

// Message handler for communication with pages
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'GET_CACHE_STATUS') {
    event.ports[0].postMessage({
      cacheName: CACHE_NAME,
      version: APP_VERSION,
      isOnline: navigator.onLine
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Offline fallback
const OFFLINE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CyberPrank - Offline</title>
    <style>
        body { background: #000; color: #0f0; font-family: monospace; padding: 20px; }
        h1 { color: #f00; }
    </style>
</head>
<body>
    <h1>⚠️ OFFLINE MODE</h1>
    <p>You are currently offline.</p>
    <p>CyberPrank simulation will resume when connection is restored.</p>
</body>
</html>
`;

// Cache offline page
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.put(
        '/CyberPrank/offline.html',
        new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        })
      ))
  );
});