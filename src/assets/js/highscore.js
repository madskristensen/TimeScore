var Highscore = function () {

    var _score;

    function recordScore(date, points) {

        var key = cleanDate(date);// date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        console.log(key)
        localStorage[key] = points;
    }

    function cleanDate(date) {
        return new Date(date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes());
    }

    function getScore(date) {

        date = cleanDate(date);
        var daily = 0;
        var weekly = 0;

        for (var hash in localStorage) {

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