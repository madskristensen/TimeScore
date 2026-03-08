var CACHE_NAME = "timescore-shell-v2";
var APP_SHELL = [
    "/",
    "/index.html",
    "/assets/css/site.css",
    "/assets/js/badgeService.js",
    "/assets/js/highscoreService.js",
    "/assets/js/timescore.js",
    "/assets/js/dom.js",
    "/assets/js/appcacheHandler.js"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_SHELL);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (cacheName) {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            }));
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET")
        return;

    var requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin)
        return;

    event.respondWith(
        fetch(event.request)
            .then(function (networkResponse) {
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            })
            .catch(function () {
                return caches.match(event.request).then(function (cachedResponse) {
                    if (cachedResponse)
                        return cachedResponse;

                    if (event.request.mode === "navigate")
                        return caches.match("/index.html");
                });
            })
    );
});

self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
