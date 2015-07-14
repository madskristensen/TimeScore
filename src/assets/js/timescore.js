/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />

var TimeScore = (function () {

    var _hour, _minute, _date,
        badgeService = new BadgeService(),
        hightscoreService = new HighscoreService();

    function getScore(date) {
        _date = date;
        normalize(date);
        var score = runRules();

        return {
            time: _hour + ":" + _minute,
            score: score
        }
    }

    function normalize(date) {
        var minute = date.getMinutes();
        var hour = date.getHours();

        if (minute < 10) {
            _minute = "0" + minute;
        }
        else {
            _minute = minute.toString();
        }

        if (hour === 0) {
            _hour = "12";
        }
        else if (hour < 10) {
            _hour = "0" + hour;
        }
        else if (hour > 12) {
            var imperial = (hour - 12).toString();

            if (imperial < 10) {
                imperial = "0" + imperial;
            }

            _hour = imperial.indexOf("0") == 0 ? imperial.substr(1) : imperial;
        }
        else {
            _hour = hour.toString();
        }

        _hour = _hour.indexOf("0") == 0 ? _hour.substr(1) : _hour;
    }

    function runRules() {

        var reverseMinutes = _minute.split("").reverse().join("");
        var realHours = _date.getHours();
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

        ruleMomentIntime(hits);

        if (_minute.length == 2 && parseInt(_minute[0], 10) + parseInt(_minute[1], 10) == _hour) {

            hits.push(rules.product);
        }

        if (_hour === "12" && _minute === "34") {
            hits.push(rules.onetwothreefour);
        }


        if (_date.getMonth() + 1 /*getMonth() is zero-based*/ == _hour && _date.getDate() == _date.getMinutes()) {
            hits.push(rules.today);
        }


        // Runs
        var intHour = parseInt(_hour, 10);
        if (_minute[0] == intHour + 1 && _minute[1] == intHour + 2 || _minute[0] == intHour - 1 && _minute[1] == intHour -2) {
            hits.push(rules.runs);
        }

        var combined = _hour + _minute;
        var isPrime = true;
        for (var i = 0; i < combined.length; i++) {
            var digit = combined[i];
            if (digit != 1 && digit != 3 && digit != 5 && digit != 7) {
                isPrime = false;
                break;
            }
        }

        // Primes
        if (isPrime) {
            hits.push(rules.prime);
        }

        if (_hour.length === 2 && _hour[0] === _hour[1] && _minute[0] === _minute[1]) {
            hits.push(rules.twopairs);
        }

        if (_hour.length == 2 && _date.getMinutes() % parseInt(_hour, 10) === 0) {
            hits.push(rules.divide);
        }

        return hits;
    }

    function ruleMomentIntime(hits) {
        var realHours = _date.getHours();
        var badges = badgeService.badges;
        var badge = null;

        if (_hour === "7" && _minute === "11")
            badge = badges.seveneleven;
        else if (_hour === "3" && _minute === "14")
            badge = badges.pi;
        else if (_hour === "10" && _minute === "40")
            badge = badges.shakespeare;
        else if ((_hour === "1" && _minute === "35") || _hour === "5" && _minute === "31")
            badge = badges.prime;
        else if (_hour === "8" && _minute === "25")
            badge = badges.ellendun;
        else if (_hour === "9" && _minute === "36")
            badge = badges.denmark;
        else if (_hour === "2" && _minute === "47")
            badge = badges.twentyfourseven;
        else if (_hour === "9" && _minute === "46")
            badge = badges.scooter;
        else if (realHours === 16 && _minute === "20")
            badge = badges.youknow;
        else if (realHours === 23 && _minute === "37")
            badge = badges.redsea;
        else if (realHours === 17 && _minute === "30")
            badge = badges.beer;
        else if (realHours === 4 && _minute === "55")
            badge = badges.caitlin;
        else if (realHours === 1 && _minute === "20")
            badge = badges.martydeparts;
        else if (realHours === 16 && _minute === "29")
            badge = badges.martyarrives;
        else if (_hour === "4" && _minute === "04")
            badge = badges.notfound;
        else if (realHours === 13 && _minute === "37")
            badge = badges.hacker;

        if (badge) {
            rule = rules.momentInTime;
            rule.badge = badge;
            hits.push(rule);

            if (!hightscoreService.isRecorded(_date))
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