/// <reference path="badgeService.js" />

var HighscoreService = function () {

    var _score,
        badgeService = new BadgeService();

    function recordScore(date, points) {

        if (isRecorded(date) || window.testmode)
            return;

        var key = cleanDate(date);
        localStorage.setItem(key, points);
    }

    function cleanDate(date) {
        var clean = new Date(date);
        clean.setSeconds(0, 0);
        return clean;
    }

    function isRecorded(date) {
        var clean = cleanDate(date);

        return localStorage.getItem(clean) != null;
    }

    function getScore(date) {

        date = cleanDate(date);
        var daily = 0;
        var weekly = 0;

        Object.keys(localStorage).forEach(function (hash) {

            if (hash.indexOf("badge:") === 0)
                return;

            var timestamp = new Date(hash);
            var timeDiff = Math.abs(date.getTime() - timestamp.getTime());
            var diffDays = timeDiff / (1000 * 3600 * 24);
            var points = parseInt(localStorage.getItem(hash), 10);

            if (isNaN(points))
                return;

            if (diffDays <= 1) {
                daily += points;
                weekly += points;
            }
            else if (diffDays <= 7) {
                weekly += points;
            }
            else {
                localStorage.removeItem(hash);
            }
        });

        if (weekly >= 1000)
            badgeService.addBadge(badgeService.badges.timegamer)
        else if (weekly >= 500)
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