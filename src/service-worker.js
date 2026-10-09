// Bump VERSION on every release: it names the cache and changing this file is
// what makes browsers install the new worker and show the "update available" toast.
var VERSION = "8";
var CACHE_NAME = "timescore-shell-v" + VERSION;

var APP_SHELL = [
    "/",
    "/assets/css/site.css",
    "/assets/js/badgeService.js",
    "/assets/js/highscoreService.js",
    "/assets/js/streakService.js",
    "/assets/js/dailyChallengeService.js",
    "/assets/js/collectionService.js",
    "/assets/js/shareService.js",
    "/assets/js/timescore.js",
    "/assets/js/dom.js",
    "/assets/js/serviceWorkerHandler.js",
    "/manifest.webmanifest",
    "/favicon/favicon.ico",
    "/favicon/favicon-16x16.png",
    "/favicon/favicon-32x32.png",
    "/favicon/android-chrome-192x192.png",
    "/favicon/android-chrome-512x512.png",
    "/favicon/maskable-192x192.png",
    "/favicon/maskable-512x512.png",
    "/favicon/apple-touch-icon-120x120.png",
    "/favicon/apple-touch-icon-152x152.png",
    "/favicon/apple-touch-icon-180x180.png"
];

function isAppShellRequest(url) {
    return APP_SHELL.indexOf(url.pathname) > -1;
}

function putInCache(request, response) {
    if (!response || !response.ok || response.type === "opaque")
        return;

    var copy = response.clone();
    caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, copy);
    });
}

// Revalidate against the server, skipping the HTTP cache so a long max-age
// can never pin an old file inside the service worker cache.
function revalidate(request) {
    return fetch(request, { cache: "no-cache" })
        .then(function (response) {
            putInCache(request, response);
            return response;
        });
}

// Cache first (instant start, works offline), refresh in the background.
function staleWhileRevalidate(event, cacheKey) {
    return caches.match(cacheKey, { ignoreSearch: true }).then(function (cached) {
        var network = revalidate(cacheKey);

        if (cached) {
            event.waitUntil(network.catch(function () { }));
            return cached;
        }

        return network.catch(function () {
            return caches.match("/", { ignoreSearch: true });
        });
    });
}

self.addEventListener("install", function (event) {
    // No skipWaiting() here: an updated worker waits until the page asks it to
    // take over (the "Reload" button on the update toast), so a running game is
    // never swapped out from under the player. A first install activates at once.
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_SHELL.map(function (url) {
                return new Request(url, { cache: "reload" });
            }));
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

    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin)
        return;

    if (event.request.mode === "navigate") {
        // Every navigation (including "/?anything" and "/index.html") gets the shell.
        if (url.pathname === "/" || url.pathname === "/index.html") {
            event.respondWith(staleWhileRevalidate(event, new Request("/")));
        }
        return;
    }

    if (isAppShellRequest(url)) {
        event.respondWith(staleWhileRevalidate(event, event.request));
    }
});

self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    if (event.data && event.data.type === "GET_VERSION" && event.ports && event.ports[0]) {
        event.ports[0].postMessage(VERSION);
    }
});
