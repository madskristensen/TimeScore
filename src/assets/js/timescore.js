/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />

var TimeScore = (function () {

    var _hour, _minute, _date,
        badgeService = new BadgeService(),
        hightscoreService = new HighscoreService();

    function getScore(date) {
        var score = calculateHits(date, true);

        return {
            time: `${_hour}:${_minute}`,
            score: score
        }
    }

    function calculateHits(date, allowSideEffects) {
        _date = date;
        normalize(date);
        return runRules(allowSideEffects !== false);
    }

    function normalize(date) {
        var minute = date.getMinutes();
        var hour = date.getHours();

        _minute = String(minute).padStart(2, "0");

        var imperial = hour % 12;
        _hour = String(imperial === 0 ? 12 : imperial);
    }

    function runRules(allowSideEffects) {
        var hits = [];

        var all = (_hour + _minute);
        var reverseAll = all.split("").reverse().join("");
        if (all === reverseAll) {
            hits.push(rules.mirrormirror);

        }

        if (_hour === _minute) {
            hits.push(rules.equals);
        }

        if (_hour + _hour === _minute) {
            hits.push(rules.threeofakind);
        }

        if (_minute === "00") {
            hits.push(rules.tophour);
        }

        ruleMomentIntime(hits, allowSideEffects);

        if (_minute.length === 2 && parseInt(_minute[0], 10) + parseInt(_minute[1], 10) === parseInt(_hour, 10)) {

            hits.push(rules.product);
        }

        if (_hour === "12" && _minute === "34") {
            hits.push(rules.onetwothreefour);
        }


        if (_date.getMonth() + 1 /*getMonth() is zero-based*/ === parseInt(_hour, 10) && _date.getDate() === _date.getMinutes()) {
            hits.push(rules.today);
        }


        // Runs
        var intHour = parseInt(_hour, 10);
        var firstMinuteDigit = parseInt(_minute[0], 10);
        var secondMinuteDigit = parseInt(_minute[1], 10);
        if (firstMinuteDigit === intHour + 1 && secondMinuteDigit === intHour + 2 || firstMinuteDigit === intHour - 1 && secondMinuteDigit === intHour - 2) {
            hits.push(rules.runs);
        }

        var combined = _hour + _minute;
        var primeDigits = ["2", "3", "5", "7"];
        var isPrime = combined.split("").every(function (digit) {
            return primeDigits.indexOf(digit) > -1;
        });

        // Primes
        if (isPrime) {
            hits.push(rules.prime);
        }

        if (_hour.length === 2 && _hour[0] === _hour[1] && _minute[0] === _minute[1]) {
            hits.push(rules.twopairs);
        }

        if (_hour.length === 2 && _date.getMinutes() % parseInt(_hour, 10) === 0) {
            hits.push(rules.divide);
        }

        return hits;
    }

    function ruleMomentIntime(hits, allowSideEffects) {
        var realHours = _date.getHours();
        var year = _date.getFullYear().toString();
        var currentYearKey = year.substring(0, 2) + ":" + year.substring(2, 4);
        var badges = badgeService.badges;
        var key12 = `${_hour}:${_minute}`;
        var key24 = `${realHours}:${_minute}`;
        var badgeBy12Hour = {
            "7:11": badges.seveneleven,
            "1:23": badges.counting,
            "3:14": badges.pi,
            "4:20": badges.fourtwenty,
            "5:00": badges.beer,
            "8:08": badges.lucky,
            "9:41": badges.keynote,
            "10:10": badges.watchface,
            "11:11": badges.makeawish,
            "10:40": badges.shakespeare,
            "1:35": badges.prime,
            "5:31": badges.prime,
            "2:47": badges.twentyfourseven,
            "9:46": badges.scooter,
            "4:04": badges.notfound,
            "7:47": badges.jumbo,
            "6:07": badges.sixseven
        };
        var badgeBy24Hour = {
            "0:00": badges.midnight,
            "12:00": badges.noon,
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

            if (allowSideEffects && !hightscoreService.isRecorded(_date))
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