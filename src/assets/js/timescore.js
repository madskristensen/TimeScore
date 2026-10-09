/// <reference path="badgeService.js" />

/*
 * TimeScore rules engine. Pure: it never writes to storage.
 *
 * Pattern rules are judged on the 12-hour clock face (h:mm, hour 1-12), so
 * most patterns score twice a day (AM and PM). Special moments listed in the
 * 24-hour table score once a day; the 12-hour table scores AM and PM.
 */
var TimeScore = (function () {

    var badgeService = new BadgeService();

    function normalize(date) {
        var minute = date.getMinutes();
        var hour = date.getHours();
        var imperial = hour % 12;

        return {
            minute: String(minute).padStart(2, "0"),
            hour: String(imperial === 0 ? 12 : imperial),
            hour24: hour
        };
    }

    function getMinuteKey(date) {
        return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
    }

    function getScore(date) {
        var normalizedTime = normalize(date);
        var hits = runRules(date, normalizedTime);
        var points = 0;

        for (var i = 0; i < hits.length; i++) {
            points += hits[i].points;
        }

        return {
            time: normalizedTime.hour + ":" + normalizedTime.minute,
            minuteKey: getMinuteKey(date),
            isPM: normalizedTime.hour24 >= 12,
            points: points,
            score: hits
        };
    }

    // Length of the longest run of consecutive digits (all ascending or all descending)
    // covering every digit of the clock face, or 0 when the face is not a straight.
    function straightLength(digits) {
        if (digits.length < 3)
            return 0;

        var step = digits[1] - digits[0];
        if (step !== 1 && step !== -1)
            return 0;

        for (var i = 2; i < digits.length; i++) {
            if (digits[i] - digits[i - 1] !== step)
                return 0;
        }

        return digits.length;
    }

    function runRules(date, normalizedTime) {
        var hits = [];
        var hour = normalizedTime.hour;
        var minute = normalizedTime.minute;
        var intHour = parseInt(hour, 10);
        var all = hour + minute;
        var digits = all.split("").map(function (d) { return parseInt(d, 10); });

        // Straights: 4 digits (only 12:34) is the Royal Straight Flush, 3 digits is a run.
        var straight = straightLength(digits);
        if (straight === 4) {
            hits.push(rules.royalstraightflush);
        }
        else if (straight === 3) {
            hits.push(rules.runs);
        }

        ruleMomentInTime(date, normalizedTime, hits);

        if (date.getMonth() + 1 === intHour && date.getDate() === date.getMinutes()) {
            hits.push(rules.today);
        }

        if (hour + hour === minute) {
            hits.push(rules.threeofakind);
        }

        if (hour === minute) {
            hits.push(rules.equals);
        }

        if (hour.length === 2 && hour[0] === hour[1] && minute[0] === minute[1]) {
            hits.push(rules.twopairs);
        }

        if (minute === "00") {
            hits.push(rules.tophour);
        }

        if (hour.length === 2 && date.getMinutes() > 0 && date.getMinutes() % intHour === 0) {
            hits.push(rules.divide);
        }

        var primeDigits = ["2", "3", "5", "7"];
        if (all.split("").every(function (digit) { return primeDigits.indexOf(digit) > -1; })) {
            hits.push(rules.prime);
        }

        if (digits[digits.length - 2] + digits[digits.length - 1] === intHour) {
            hits.push(rules.minutesum);
        }

        if (all === all.split("").reverse().join("")) {
            hits.push(rules.mirrormirror);
        }

        return hits;
    }

    function getMomentBadge(date, normalizedTime) {
        var year = date.getFullYear().toString();
        var currentYearKey = String(parseInt(year.substring(0, 2), 10)) + ":" + year.substring(2, 4);
        var badges = badgeService.badges;
        var key12 = normalizedTime.hour + ":" + normalizedTime.minute;
        var key24 = normalizedTime.hour24 + ":" + normalizedTime.minute;

        // 12-hour moments score at AM and PM.
        var badgeBy12Hour = {
            "7:11": badges.seveneleven,
            "1:23": badges.counting,
            "3:14": badges.pi,
            "8:08": badges.lucky,
            "9:11": badges.emergency,
            "9:41": badges.keynote,
            "10:10": badges.watchface,
            "11:11": badges.makeawish,
            "10:40": badges.shakespeare,
            "2:46": badges.twofoursixeight,
            "2:47": badges.twentyfourseven,
            "9:46": badges.scooter,
            "4:04": badges.notfound,
            "7:47": badges.jumbo,
            "6:07": badges.sixseven
        };

        // 24-hour moments score once a day.
        var badgeBy24Hour = {
            "0:00": badges.midnight,
            "12:00": badges.noon,
            "14:30": badges.scottishdentist,
            "16:20": badges.fourtwenty,
            "17:30": badges.beer,
            "4:55": badges.caitlin,
            "1:20": badges.martydeparts,
            "16:29": badges.martyarrives,
            "13:37": badges.hacker,
            "18:52": badges.seattle
        };
        badgeBy24Hour[currentYearKey] = badges.currentyear;

        return badgeBy24Hour[key24] || badgeBy12Hour[key12] || null;
    }

    function ruleMomentInTime(date, normalizedTime, hits) {
        var badge = getMomentBadge(date, normalizedTime);

        if (badge) {
            hits.push(Object.assign({}, rules.momentInTime, { badge: badge }));
        }
    }

    // Listed from highest to lowest. Ids are stable; "minutesum" was previously
    // exposed as "product" (no stored data depends on rule ids).
    var rules = {

        royalstraightflush: {
            id: "royalstraightflush",
            points: 9,
            rule: "Royal Straight Flush",
            hint: "A four-digit straight: 12:34"
        },

        momentInTime: {
            id: "momentintime",
            points: 7,
            rule: "Special moment in time",
            hint: "A famous time like 3:14 or 13:37"
        },

        today: {
            id: "today",
            points: 6,
            rule: "Today in time",
            hint: "Hour is the month, minute is the day"
        },

        threeofakind: {
            id: "threeofakind",
            points: 5,
            rule: "Three strikes and you're in",
            hint: "Three of a kind, like 2:22"
        },

        runs: {
            id: "runs",
            points: 5,
            rule: "A run in time",
            hint: "Three digits in a row, like 2:34 or 3:21"
        },

        equals: {
            id: "equals",
            points: 4,
            rule: "Pete : Repeat",
            hint: "Hour and minute match, like 10:10"
        },

        twopairs: {
            id: "twopairs",
            points: 3,
            rule: "A couple of couples",
            hint: "Two pairs, like 11:22"
        },

        tophour: {
            id: "tophour",
            points: 3,
            rule: "Top of the hour",
            hint: "Minute is :00"
        },

        divide: {
            id: "divide",
            points: 2,
            rule: "Double digit divide",
            hint: "10-12 o'clock and the minute divides by the hour"
        },

        prime: {
            id: "prime",
            points: 2,
            rule: "Nothing but primes",
            hint: "Every digit is 2, 3, 5 or 7"
        },

        minutesum: {
            id: "minutesum",
            points: 1,
            rule: "Minute sums it up",
            hint: "The minute digits add up to the hour"
        },

        mirrormirror: {
            id: "mirrormirror",
            points: 1,
            rule: "Mirror, mirror on the wall",
            hint: "A palindrome, like 1:01"
        }
    };

    // Every minute of the day that can score on any date (the date-dependent
    // "Today in time" rule is excluded so the total is stable). Keys are "HH:MM".
    var _collectibleCache = null;
    function getCollectibleMinutes(referenceDate) {
        var year = (referenceDate || new Date()).getFullYear();
        if (_collectibleCache && _collectibleCache.year === year)
            return _collectibleCache.keys;

        // Feb 1 never triggers "today" (month 2 would need minute 01 at 2:01; excluded below anyway).
        var keys = [];
        for (var m = 0; m < 1440; m++) {
            var d = new Date(year, 1, 1, Math.floor(m / 60), m % 60);
            var hits = runRules(d, normalize(d)).filter(function (h) { return h.id !== "today"; });
            if (hits.length > 0)
                keys.push(getMinuteKey(d));
        }

        _collectibleCache = { year: year, keys: keys };
        return keys;
    }

    return {
        getScore: getScore,
        getMinuteKey: getMinuteKey,
        getCollectibleMinutes: getCollectibleMinutes,
        rules: rules
    };
});
