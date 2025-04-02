const CACHE_NAME = 'my-cache-v1.3';
const urlsToCache = [
  '/aruna-noon/',
  '/aruna-noon/404.html',
  '/aruna-noon/offline.html',
  '/aruna-noon/icon_192x192.png',
  '/aruna-noon/icon_512x512.png',
  '/aruna-noon/index.html',
  '/aruna-noon/service-worker.js',
  '/aruna-noon/manifest.webmanifest',
  '/aruna-noon/registerSW.js',
  '/aruna-noon/sw.js',
  '/aruna-noon/workbox-5ffe50d4.js',
  '/aruna-noon/assets/first-quarter-Bz0yd6Ym.png',
  '/aruna-noon/assets/full-moon-CkY63sja.png',
  '/aruna-noon/assets/html2canvas.esm-CBrSDip1.js',
  '/aruna-noon/assets/index-BlpszIxV.css',
  '/aruna-noon/assets/index-B8t1MXo1.js',
  '/aruna-noon/assets/index.es-DGxSwiE9.js',
  '/aruna-noon/assets/last-quarter-D35LRZyu.png',
  '/aruna-noon/assets/new-moon-B8k05m4x.png',
  '/aruna-noon/assets/purify.es-Ci5xwkH_.js',
];

// Install event - caching static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets...');
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url)
              .then(() => {
                console.log('Cached:', url);
              })
              .catch((error) => {
                console.error('Failed to cache:', url, error);
              });
          })
        );
      })
      .then(() => {
        console.log('All assets cached successfully.');
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Cache the fetched response for future use
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
          })
          .catch(() => {
            // Fallback to the offline page
            return caches.match('/aruna-noon/offline.html');
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});