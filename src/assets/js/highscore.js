var Highscore = function () {

    var _score;

    function recordScore(date, points) {

        var key = cleanDate(date);

        localStorage[key] = points;
    }

    function cleanDate(date) {
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    function getScore(date) {

        date = cleanDate(date);
        var daily = 0;
        var weekly = 0;

        for (var hash in localStorage) {

            if (hash.indexOf("badge:") === 0)
                continue;

            var timestamp = new Date(hash);
            var timeDiff = Math.abs(date.getTime() - timestamp.getTime());
            var diffDays = timeDiff / (1000 * 3600 * 24);

            if (diffDays <= 1) {
                daily += parseInt(localStorage[hash], 10);
                weekly += parseInt(localStorage[hash], 10);
            }
            else if (diffDays <= 7) {
                weekly += parseInt(localStorage[hash], 10);
            }
            else {
                localStorage.removeItem(hash);
            }
        }

        return {
            daily: daily,
            weekly: weekly,
            total: 0
        }
    }

    return {
        recordScore: recordScore,
        getScore: getScore
    }
}