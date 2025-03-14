const CACHE_NAME = 'my-cache-v1.3';
const urlsToCache = [
  '/Aruna-Noon/',
  '/Aruna-Noon/404.html',
  '/Aruna-Noon/offline.html',
  '/Aruna-Noon/icon_192x192.png',
  '/Aruna-Noon/icon_512x512.png',
  '/Aruna-Noon/index.html',
  '/Aruna-Noon/service-worker.js',
  '/Aruna-Noon/manifest.webmanifest',
  '/Aruna-Noon/registerSW.js',
  '/Aruna-Noon/sw.js',
  '/Aruna-Noon/workbox-5ffe50d4.js',
  '/Aruna-Noon/assets/first-quarter-BDV1XYf_.png',
  '/Aruna-Noon/assets/full-moon-CkY63sja.png',
  '/Aruna-Noon/assets/html2canvas.esm-CBrSDip1.js',
  '/Aruna-Noon/assets/index.es-CidEbc2t.js',
  '/Aruna-Noon/assets/index-CaRmMB6x.js',
  '/Aruna-Noon/assets/index-BlyHCSMr.css',
  '/Aruna-Noon/assets/last-quarter-i3ORQntx.png',
  '/Aruna-Noon/assets/new-moon-B8k05m4x.png',
  '/Aruna-Noon/assets/purify.es-Ci5xwkH_.js',
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
            return caches.match('/Aruna-Noon/offline.html');
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