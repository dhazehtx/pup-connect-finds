// Service Worker for caching static assets and API responses
const CACHE_NAME = 'mypup-v1';
const STATIC_CACHE = 'mypup-static-v1';
const API_CACHE = 'mypup-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/breeds',
  '/api/legal-content',
  '/api/education',
  '/api/help-center'
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE)
    ])
  );
});

self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }

  // Cache API responses for static content
  if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Return cached version and update in background
          fetch(request).then(fetchResponse => {
            const responseClone = fetchResponse.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          });
          return response;
        }

        return fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
  }
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, API_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});