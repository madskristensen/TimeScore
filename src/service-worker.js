var CACHE_NAME = "timescore-shell-v6";
var APP_SHELL = [
    "/",
    "/index.html",
    "/assets/css/site.css",
    "/assets/js/badgeService.js",
    "/assets/js/highscoreService.js",
    "/assets/js/streakService.js",
    "/assets/js/dailyChallengeService.js",
    "/assets/js/timescore.js",
    "/assets/js/dom.js",
    "/assets/js/serviceWorkerHandler.js"
];

function isAppShellRequest(request) {
    var requestUrl = new URL(request.url);
    var pathname = requestUrl.pathname;

    return APP_SHELL.indexOf(pathname) > -1 || pathname === "/";
}

function updateCache(request, response) {
    if (!response || !response.ok)
        return response;

    var responseToCache = response.clone();
    caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, responseToCache);
    });

    return response;
}

function refreshCache(request) {
    return fetch(request)
        .then(function (response) {
            return updateCache(request, response);
        })
        .catch(function () { });
}

function staleWhileRevalidate(request, fallbackUrl, event) {
    return caches.match(request).then(function (cachedResponse) {
        var cachedResponsePromise = cachedResponse
            ? Promise.resolve(cachedResponse)
            : fallbackUrl ? caches.match(fallbackUrl) : Promise.resolve();

        return cachedResponsePromise.then(function (response) {
            if (response) {
                event.waitUntil(refreshCache(request));
                return response;
            }

            return fetch(request)
                .then(function (response) {
                    return updateCache(request, response);
                })
                .catch(function () {
                    if (fallbackUrl)
                        return caches.match(fallbackUrl);
                });
        });
    });
}

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

    if (event.request.mode === "navigate") {
        event.respondWith(staleWhileRevalidate(event.request, "/index.html", event));
        return;
    }

    if (!isAppShellRequest(event.request))
        return;

    event.respondWith(staleWhileRevalidate(event.request, null, event));
});

self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
