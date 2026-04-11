/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />

var TimeScore = (function () {

    var _date,
        badgeService = new BadgeService(),
        highscoreService = new HighscoreService();

    function getScore(date) {
        var normalizedTime = normalize(date);
        var score = calculateHits(date, normalizedTime, true);

        return {
            time: normalizedTime.hour + ":" + normalizedTime.minute,
            score: score
        }
    }

    function calculateHits(date, normalizedTime, allowSideEffects) {
        _date = date;
        return runRules(date, normalizedTime, allowSideEffects !== false);
    }

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

    function runRules(date, normalizedTime, allowSideEffects) {
        var hits = [];
        var hour = normalizedTime.hour;
        var minute = normalizedTime.minute;

        var all = hour + minute;
        var reverseAll = all.split("").reverse().join("");
        if (all === reverseAll) {
            hits.push(rules.mirrormirror);

        }

        if (hour === minute) {
            hits.push(rules.equals);
        }

        if (hour + hour === minute) {
            hits.push(rules.threeofakind);
        }

        if (minute === "00") {
            hits.push(rules.tophour);
        }

        ruleMomentIntime(date, normalizedTime, hits, allowSideEffects);

        if (minute.length === 2 && parseInt(minute[0], 10) + parseInt(minute[1], 10) === parseInt(hour, 10)) {

            hits.push(rules.product);
        }

        if (hour === "12" && minute === "34") {
            hits.push(rules.onetwothreefour);
        }


        if (date.getMonth() + 1 /*getMonth() is zero-based*/ === parseInt(hour, 10) && date.getDate() === date.getMinutes()) {
            hits.push(rules.today);
        }


        // Runs
        var intHour = parseInt(hour, 10);
        var firstMinuteDigit = parseInt(minute[0], 10);
        var secondMinuteDigit = parseInt(minute[1], 10);
        if ((firstMinuteDigit === intHour + 1 && secondMinuteDigit === intHour + 2) || (firstMinuteDigit === intHour - 1 && secondMinuteDigit === intHour - 2)) {
            hits.push(rules.runs);
        }

        var combined = hour + minute;
        var primeDigits = ["2", "3", "5", "7"];
        var isPrime = combined.split("").every(function (digit) {
            return primeDigits.indexOf(digit) > -1;
        });

        // Primes
        if (isPrime) {
            hits.push(rules.prime);
        }

        if (hour.length === 2 && hour[0] === hour[1] && minute[0] === minute[1]) {
            hits.push(rules.twopairs);
        }

        if (hour.length === 2 && date.getMinutes() % parseInt(hour, 10) === 0) {
            hits.push(rules.divide);
        }

        return hits;
    }

    function ruleMomentIntime(date, normalizedTime, hits, allowSideEffects) {
        var year = date.getFullYear().toString();
        var currentYearKey = year.substring(0, 2) + ":" + year.substring(2, 4);
        var badges = badgeService.badges;
        var key12 = normalizedTime.hour + ":" + normalizedTime.minute;
        var key24 = normalizedTime.hour24 + ":" + normalizedTime.minute;
        var badgeBy12Hour = {
            "7:11": badges.seveneleven,
            "1:23": badges.counting,
            "3:14": badges.pi,
            "4:20": badges.fourtwenty,
            "8:08": badges.lucky,
            "9:11": badges.emergency,
            "9:41": badges.keynote,
            "10:10": badges.watchface,
            "11:11": badges.makeawish,
            "10:40": badges.shakespeare,
            "1:35": badges.prime,
            "5:31": badges.prime,
            "2:46": badges.twofoursixeight,
            "2:47": badges.twentyfourseven,
            "9:46": badges.scooter,
            "4:04": badges.notfound,
            "7:47": badges.jumbo,
            "6:07": badges.sixseven
        };
        var badgeBy24Hour = {
            "0:00": badges.midnight,
            "12:00": badges.noon,
            "14:30": badges.scottishdentist,
            "16:20": badges.youknow,
            "17:30": badges.beer,
            "4:55": badges.caitlin,
            "1:20": badges.martydeparts,
            "16:29": badges.martyarrives,
            "13:37": badges.hacker,
            [currentYearKey]: badges.currentyear,
            "18:52": badges.seattle
        };
        var badge = badgeBy24Hour[key24] || badgeBy12Hour[key12] || null;

        if (badge) {
            var rule = Object.assign({}, rules.momentInTime, { badge: badge });
            hits.push(rule);

            if (allowSideEffects && !highscoreService.isRecorded(date))
                badgeService.addBadge(badge);
        }
    }

    var rules = {

        onetwothreefour: {
            id: "royalstraightflush",
            points: 9,
            rule: "Royal Straight Flush"
        },

        momentInTime: {
            id: "momentintime",
            points: 7,
            rule: "Special moment in time"
        },

        today: {
            id: "today",
            points: 6,
            rule: "Today in time"
        },

        threeofakind: {
            id: "threeofakind",
            points: 5,
            rule: "Three strikes and you're in"
        },

        runs: {
            id: "runs",
            points: 5,
            rule: "A run in time"
        },

        equals: {
            id: "equals",
            points: 4,
            rule: "Pete : Repeat"
        },

        twopairs: {
            id: "twopairs",
            points: 3,
            rule: "A couple of couples"
        },

        tophour: {
            id: "tophour",
            points: 3,
            rule: "Top of the hour"
        },

        divide: {
            id: "divide",
            points: 2,
            rule: "Double digit divide"
        },

        prime: {
            id: "prime",
            points: 2,
            rule: "Nothing but primes"
        },

        product: {
            id: "product",
            points: 1,
            rule: "Minute sums it up"
        },

        mirrormirror: {
            id: "mirrormirror",
            points: 1,
            rule: "Mirror, mirror on the wall"
        },
    };

    return {
        getScore: getScore,
        rules: rules,
        date: _date
    };
});
