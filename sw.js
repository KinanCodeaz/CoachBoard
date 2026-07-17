// CoachBoard Pro - Service Worker
// Offline caching for assets

var CACHE_NAME = 'coachboard-v2';
var ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './sw.js',
  './js/export.js',
  './js/teams.js',
  './assets/soccer.png',
  './assets/futsal.png',
  './assets/beach.png',
  './assets/basketball.png',
  './assets/volleyball.png',
  './assets/handball.png'
];

// Install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Clone the response
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
