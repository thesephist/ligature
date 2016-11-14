// Ligature ServiceWorker

const cacheName = 'lig-cache';

// caching static assets
// -> Images
// -> Fonts
// -> Styles (main.min.css)
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cacheName)
        .then(function(cache) {
            return cache.addAll([
              '/ligature/app',
              '/ligature/css/main.min.css',
              '/ligature/css/contents.min.css',
              '/ligature/assets/logo.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(cacheName)
        .then(function(cache) {
            return cache.match(event.request)
            .then(function (response) {
                return response || fetch(event.request)
                .then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
