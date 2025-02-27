const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/Aruna-Noon/',
  '/Aruna-Noon/index.html',
  '/Aruna-Noon/public/manifest.webmanifest',
  '/Aruna-Noon/public/icon_192x192.png',
  '/Aruna-Noon/public/icon_512x512.png',
  '/Aruna-Noon/src/app.css',
  '/Aruna-Noon/src/app.jsx',
  '/Aruna-Noon/src/index.css',
  '/Aruna-Noon/src/main.jsx',
  '/Aruna-Noon/src/registerSW.js',
  '/Aruna-Noon/src/styles.css',
  '/Aruna-Noon/src/assets/icon_192x192.png',
  '/Aruna-Noon/src/assets/icon_512x512.png',
  '/Aruna-Noon/src/components/InputForm.jsx',
  '/Aruna-Noon/src/components/PDFGenerator.jsx',
  '/Aruna-Noon/src/components/TableDisplay.jsx',
  '/Aruna-Noon/src/icons/first-quarter.png',
  '/Aruna-Noon/src/icons/full-moon.png',
  '/Aruna-Noon/src/icons/last-quarter.png',
  '/Aruna-Noon/src/icons/new-moon.png',
  '/Aruna-Noon/src/utils/dateUtils.js',
  '/Aruna-Noon/src/utils/locationUtils.js',
  '/Aruna-Noon/src/utils/UposathaFunction.js',
  '/Aruna-Noon/src/utils/uposathaUtils.js',
];

// Install event - caching static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available, otherwise fetch from network
        return cachedResponse || fetch(event.request)
          .then((response) => {
            // Optionally cache the fetched response for future use
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
          })
          .catch(() => {
            // Fallback to a custom offline page or response
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});