(function (undefined) {

    var lastCheck = new Date();
    //lastCheck = new Date("2015-04-19T12:00");
    var checkInterval = (1000 * 60 * 60 /* 1 hour*/) * 2;

    function checkForUpdate() {
        if (!window.applicationCache)
            return;

        if (window.applicationCache.status === window.applicationCache.UNCACHED)
            return;

        window.applicationCache.update();
        lastCheck = new Date();
    }

    window.applicationCache.addEventListener('updateready', function (e) {
        window.location.reload();
    }, false);

    window.addEventListener("load", function () {
        checkForUpdate();
    });

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            checkForUpdate();
        }
    });

    setInterval(function () {
        checkForUpdate();
    }, checkInterval)

})(undefined);