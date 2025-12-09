// Service Worker for Progressive Web App
// Version 1.0.2
// Security: Cache-first strategy with network fallback
// Last security audit: December 2025

const VERSION = '1.0.2';
const CACHE_NAME = `ifuentes-v${VERSION}`;
const OFFLINE_URL = '/offline.html';

// Only cache same-origin resources for security
const urlsToCache = [
  '/',
  '/index.html',
  '/if.png',
  '/site.webmanifest',
  OFFLINE_URL
];

// Security: Validate URLs before caching
function isValidCacheUrl(url) {
  try {
    const parsed = new URL(url, self.location.origin);
    // Only cache same-origin and HTTPS resources
    return parsed.origin === self.location.origin || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch with cache-first strategy
// Security: Only handle GET requests and validate origins
self.addEventListener('fetch', event => {
  // Security: Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Security: Only handle same-origin or HTTPS requests
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin && requestUrl.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request, {
        // Security: Don't send credentials to third parties
        credentials: requestUrl.origin === self.location.origin ? 'same-origin' : 'omit'
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// Activate and clean old caches
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
  
  return self.clients.claim();
});
