(function (undefined) {

    if (!("serviceWorker" in navigator))
        return;

    var refreshing = false;

    function promptForRefresh(worker) {
        if (!worker)
            return;

        if (confirm("A new version is available. Reload now?")) {
            worker.postMessage({ type: "SKIP_WAITING" });
        }
    }

    function watchForUpdate(registration) {
        if (!registration)
            return;

        if (registration.waiting) {
            promptForRefresh(registration.waiting);
        }

        registration.addEventListener("updatefound", function () {
            var newWorker = registration.installing;
            if (!newWorker)
                return;

            newWorker.addEventListener("statechange", function () {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    promptForRefresh(newWorker);
                }
            });
        });
    }

    window.addEventListener("load", function () {
        navigator.serviceWorker.register("/service-worker.js").then(function (registration) {
            watchForUpdate(registration);
            registration.update();
        });
    });

    navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing)
            return;

        refreshing = true;
        window.location.reload();
    });

})(undefined);
