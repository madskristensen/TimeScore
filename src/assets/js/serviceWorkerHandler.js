(function () {

    if (!("serviceWorker" in navigator))
        return;

    var reloadRequested = false,
        promptedWorker = null;

    function promptForRefresh(worker) {
        if (!worker || worker === promptedWorker)
            return;

        promptedWorker = worker;

        var activate = function () {
            reloadRequested = true;
            worker.postMessage({ type: "SKIP_WAITING" });
        };

        if (typeof window.showToast === "function") {
            window.showToast({
                id: "updateToast",
                icon: "✨",
                title: "Update available",
                text: "A new version of Game The Time is ready.",
                actionLabel: "Reload",
                onAction: activate,
                duration: 0
            });
        }
    }

    function watchForUpdate(registration) {
        if (registration.waiting && navigator.serviceWorker.controller) {
            promptForRefresh(registration.waiting);
        }

        registration.addEventListener("updatefound", function () {
            var newWorker = registration.installing;
            if (!newWorker)
                return;

            newWorker.addEventListener("statechange", function () {
                // Only an *update* (a page already controlled) gets the prompt;
                // the very first install just starts caching silently.
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    promptForRefresh(newWorker);
                }
            });
        });
    }

    // Only reload when the player tapped "Reload". On a first visit the new worker
    // claims the page too, and that must not trigger a surprise reload.
    navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!reloadRequested)
            return;

        reloadRequested = false;
        window.location.reload();
    });

    function register() {
        navigator.serviceWorker.register("/service-worker.js").then(function (registration) {
            watchForUpdate(registration);

            // Installed PWAs are often resumed instead of relaunched; check for
            // updates whenever the app comes back to the foreground.
            document.addEventListener("visibilitychange", function () {
                if (document.visibilityState === "visible") {
                    registration.update().catch(function () { });
                }
            });
        }).catch(function () { });
    }

    // Registering (and the update check it implies) never competes with first paint.
    function whenIdle(fn) {
        if ("requestIdleCallback" in window)
            window.requestIdleCallback(fn, { timeout: 3000 });
        else
            window.setTimeout(fn, 1000);
    }

    if (document.readyState === "complete")
        whenIdle(register);
    else
        window.addEventListener("load", function () { whenIdle(register); });

})();
