/// <reference path="badges.js" />

var Highscore = function () {

    var _score
    badgeService = new Badges();

    function recordScore(date, points) {

        if (isRecorded(date) || window.testmode)
            return;

        var key = cleanDate(date);
        localStorage[key] = points;
    }

    function cleanDate(date) {
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    function isRecorded(date) {
        var clean = cleanDate(date);

        return localStorage[clean] != undefined;
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

        if (weekly >= 500)
            badgeService.addBadge(badgeService.badges.timelord)
        else if (weekly >= 100)
            badgeService.addBadge(badgeService.badges.timebandit)
        else if (weekly >= 50)
            badgeService.addBadge(badgeService.badges.timetraveller)
        else if (weekly >= 10)
            badgeService.addBadge(badgeService.badges.adventurer)
        else if (weekly > 0)
            badgeService.addBadge(badgeService.badges.newbie)

        return {
            daily: daily,
            weekly: weekly
        }
    }

    return {
        recordScore: recordScore,
        getScore: getScore,
        isRecorded: isRecorded
    }
}