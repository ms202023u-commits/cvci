// Service Worker for Civic Lens Solutions PWA
const CACHE_NAME = 'civic-lens-solutions-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chatbot.html',
  '/report.html',
  '/map.html',
  '/static/style.css',
  '/static/style-professional.css',
  '/static/style-enhanced.css',
  '/static/style-boost.css',
  '/static/style-2025.css',
  '/static/style-3d-chatbot.css',
  '/static/script.js',
  '/static/mobile-2025.js',
  '/static/chatbot-3d.js',
  'https://i.ibb.co/DP6QRJLS/Untitled-design-29.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
