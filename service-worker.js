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