var HighscoreService = function () {

    var scorePrefix = "score:";

    // Returns true only the first time a given minute is recorded, which makes
    // every per-minute side effect (celebration, badges, challenge) idempotent.
    function recordScore(date, points) {

        if (window.testmode || isRecorded(date))
            return false;

        var key = getStorageKey(cleanDate(date));
        try {
            localStorage.setItem(key, points);
        }
        catch (e) {
            return false;
        }

        return true;
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

        return {
            daily: daily,
            weekly: weekly
        }
    }

    return {
        getStorageKey: getStorageKey,
        recordScore: recordScore,
        getScore: getScore,
        isRecorded: isRecorded
    }
}