/// <reference path="badgeService.js" />

var HighscoreService = function () {

    var _score,
        badgeService = new BadgeService(),
        scorePrefix = "score:";

    function recordScore(date, points) {

        if (isRecorded(date) || window.testmode)
            return;

        var key = getStorageKey(cleanDate(date));
        localStorage.setItem(key, points);
    }

    function cleanDate(date) {
        var clean = new Date(date);
        clean.setSeconds(0, 0);
        return clean;
    }

    function isRecorded(date) {
        var clean = cleanDate(date);

        return localStorage.getItem(getStorageKey(clean)) != null || localStorage.getItem(clean) != null;
    }

    function getStorageKey(date) {
        return scorePrefix + Math.floor(date.getTime() / 60000);
    }

    function isLegacyScoreKey(key) {
        return /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s/.test(key);
    }

    function getScore(date) {

        date = cleanDate(date);
        var currentMinute = Math.floor(date.getTime() / 60000);
        var daily = 0;
        var weekly = 0;

        Object.keys(localStorage).forEach(function (hash) {

            if (hash.indexOf("badge:") === 0)
                return;

            if (hash.indexOf(scorePrefix) !== 0 && !isLegacyScoreKey(hash))
                return;

            var minuteKey = 0;
            var scoreKey = hash;

            if (hash.indexOf(scorePrefix) === 0) {
                minuteKey = parseInt(hash.substring(scorePrefix.length), 10);
                if (isNaN(minuteKey)) {
                    localStorage.removeItem(hash);
                    return;
                }
            }
            else {
                var legacyTimestamp = Date.parse(hash);
                if (isNaN(legacyTimestamp))
                    return;

                minuteKey = Math.floor(legacyTimestamp / 60000);
                scoreKey = getStorageKey(new Date(legacyTimestamp));

                if (localStorage.getItem(scoreKey) == null) {
                    localStorage.setItem(scoreKey, localStorage.getItem(hash));
                }

                localStorage.removeItem(hash);
            }

            var diffMinutes = Math.abs(currentMinute - minuteKey);
            var points = parseInt(localStorage.getItem(scoreKey), 10);

            if (isNaN(points))
                return;

            if (diffMinutes <= 60 * 24) {
                daily += points;
                weekly += points;
            }
            else if (diffMinutes <= 60 * 24 * 7) {
                weekly += points;
            }
            else {
                localStorage.removeItem(scoreKey);
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