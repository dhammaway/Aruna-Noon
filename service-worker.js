const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/public/manifest.webmanifest',
  '/public/icon_192x192.png',
  '/public/icon_512x512.png',
  '/src/app.css',
  '/src/app.jsx',
  '/src/index.css',
  '/src/main.jsx',
  '/src/registerSW.js',
  '/src/styles.css',
  '/src/assets/icon_192x192.png',
  '/src/assets/icon_512x512.png',
  '/src/components/InputForm.jsx',
  '/src/components/PDFGenerator.jsx',
  '/src/components/TableDisplay.jsx',
  '/src/icons/first-quarter.png',
  '/src/icons/full-moon.png',
  '/src/icons/last-quarter.png',
  '/src/icons/new-moon.png',
  '/src/utils/dateUtils.js',
  '/src/utils/locationUtils.js',
  '/src/utils/UposathaFunction.js',
  '/src/utils/uposathaUtils.js',
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