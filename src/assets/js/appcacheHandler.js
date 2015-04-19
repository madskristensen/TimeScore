(function (window, undefined) {

    if (!window.applicationCache)
        return;

    var lastCheck = new Date();
    //lastCheck = new Date("2015-04-19T12:00");
    var checkInterval = (1000 * 60 * 60 /* 1 hour*/) * 2;

    window.applicationCache.addEventListener('updateready', function (e) {
        window.location.reload();
    }, false);

    setInterval(function () {
        window.applicationCache.update();
        lastCheck = new Date();
    }, checkInterval)

})(window, undefined);