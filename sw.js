// Service Worker for ifuentes.net
// Version 1.2.0
// Strategy: network-first for pages (fresh content, offline fallback),
// stale-while-revalidate for same-origin static assets (flap.js is content-hashed).
// Security: same-origin GET requests only.

const VERSION = '1.2.0';
const CACHE_NAME = `ifuentes-v${VERSION}`;
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  '/',
  '/index.html',
  '/resume.html',
  '/now.html',
  '/flap.js?v=741e445e',
  '/favicon.svg',
  '/images/inaki.webp',
  '/site.webmanifest',
  OFFLINE_URL
];

const store = (request, response) => {
  if (!response || !response.ok || response.type !== 'basic') return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
};

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          store(request, response);
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          store(request, response);
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
