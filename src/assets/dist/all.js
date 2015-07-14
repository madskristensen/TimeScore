var BadgeService = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {

            var points = localStorage["badge:" + badge];

            if (points) {
                var b = parseInt(points, 10)
                var thisBadge = allBadges[badge]
                thisBadge.level = Math.floor(points / 5);
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(badge) {

        if (window.testmode || (badge.type === "single" && localStorage["badge:" + badge.id]))
            return;

        localStorage["badge:" + badge.id] = (localStorage["badge:" + badge.id] ? parseInt(localStorage["badge:" + badge.id], 10) : 1);
    }

    var allBadges = {
        newbie: {
            id: "newbie",
            name: "Newbie",
            description: "Congrats!! You got your first point",
            type: "single"
        },
        adventurer: {
            id: "adventurer",
            name: "Adventurer",
            description: "Congrats!! That's your first 10 points",
            type: "single"
        },
        timetraveller: {
            id: "timetraveller",
            name: "Time traveller",
            description: "You're a Time Traveller! That's 50 points",
            type: "single"
        },
        timebandit: {
            id: "timebandit",
            name: "Time Bandit",
            description: "Time Bandit got 100 points in one week",
            type: "single"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "500 points in one week. You are a Time Lord!!",
            type: "single"
        },

        twentyfourseven: {
            id: "twentyfourseven",
            name: "We're open 24 hours a day",
            description: "Who do we appreciate"
        },
        beer: {
            id: "beer",
            name: "Beer o'clock",
            description: "Beer o'clock"
        },
        caitlin: {
            id: "caitlin",
            name: "Caitlin's birthday",
            description: "The inspiration was born at this time."
        },
        denmark: {
            id: "denmark",
            name: "Kingdom of Denmark",
            description: "Kingdom of Denmark was founded"
        },
        ellendun: {
            id: "ellendun",
            name: "Battle of Ellendun",
            description: "Battle of Ellendun which united England"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
        },
        redsea: {
            id: "redsea",
            name: "What color is the sea?",
            description: "What sea hides under these coordinates?",
        },
        scooter: {
            id: "scotter",
            name: "Retro scooter",
            description: "Retro scooter",
        },
        seveneleven: {
            id: "seveneleven",
            name: "7-Eleven",
            description: "Thank heaven for this corner store",
        },
        shakespeare: {
            id: "shakespeare",
            name: "Shakespeare FTW!",
            description: "Shakespeare FTW!",
        },
        youknow: {
            id: "youknow",
            name: "You know if you know",
            description: "You know if you know"
        },
        martydeparts: {
            id: "martydeparts",
            name: "Marty McFly leaves for the future",
            description: "Marty McFly leaves for the future"
        },
        martyarrives: {
            id: "martyarrives",
            name: "Marty McFly arrives in the future",
            description: "Marty McFly arrives in the future"
        },
        notfound: {
            id: "notfound",
            name: "The page that couldn't be found",
            description: "The page that couldn't be found"
        },
        hacker: {
            id: "Hacker lingo",
            name: "You speak hacker",
            description: "You speak hacker"
        },
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});
/// <reference path="badgeService.js" />

var HighscoreService = function () {

    var _score
    badgeService = new BadgeService();

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
/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />
/// <reference path="timescore.js" />

var elmTime = document.getElementById("time"),
    elmScore = document.getElementById("score"),
    rules = document.getElementById("rules"),
    reset = document.getElementById("reset"),
    elmBadges = document.getElementById("badges"),
    elmMeter = document.getElementById("meter"),
    ts = new TimeScore(),
    hs = new HighscoreService(),
    actives = [];

var current = new Date();
//current = new Date(2015, 4, 16, 4, 16);
//current.setHours(7); current.setMinutes(11); //localStorage.clear();

function calculate() {

    var result = ts.getScore(current),
        points = 0,
        lis = rules.getElementsByTagName("li");

    elmTime.innerHTML = result.time;
    clearResults();

    for (var i = 0; i < result.score.length; i++) {

        var score = result.score[i];
        points += score.points;

        for (var a = 0; a < lis.length; a++) {
            li = lis[a];

            if (score.points > 0 && li.innerHTML.lastIndexOf(score.rule) > -1) {
                li.className = "active";
                actives.push(li);
                break;
            }
        }
    }

    elmScore.innerHTML = points == 0 ? points : "<span class=\"active\">" + points + "</span>";
    if (points > 0) {
        hs.recordScore(current, points);
        updateHighscore();
        updateBadges();
    }
}

function clearResults() {

    for (var i = 0; i < actives.length; i++) {
        actives[i].className = "";
    }

    actives = [];
}

function updateHighscore() {
    var score = hs.getScore(current);
    document.getElementById("daily").firstElementChild.innerHTML = score.daily;
    document.getElementById("weekly").firstElementChild.innerHTML = score.weekly;
}

function showRules() {

    for (var name in ts.rules) {
        var rule = ts.rules[name];

        var point = rule.points === 1 ? "point" : "points";

        var li = document.createElement("li");
        li.innerHTML = "<span>" + rule.points + " " + point + "</span> - " + rule.rule;
        li.id = name;

        rules.appendChild(li);
    }
};

function updateBadges() {

    var badges = new BadgeService().getBadges();
    var badgesText = badges.length === 1 ? " badge" : " badges";

    elmBadges.firstElementChild.innerHTML = badges.length + badgesText;
    elmBadges.innerHTML = elmBadges.firstElementChild.outerHTML;

    if (elmBadges.childElementCount === badges.length + 1)
        return;

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];

        var img = document.createElement("p")
        img.setAttribute("aria-label", badge.description);
        img.id = badge.id;
        img.tabIndex = 1;

        if (badge.level > 1) {
            var span = document.createElement("span");
            span.innerHTML = badge.level + "x";
            img.appendChild(span);
        }

        elmBadges.appendChild(img);
    }
}

showRules();
calculate();
updateHighscore();
updateBadges();

setInterval(function () {

    var date = new Date();

    elmMeter.style.width = (date.getSeconds() / 60 * 100) + "%";

    if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden || document.oHidden)
        return;

    if (date.getHours() != current.getHours() || date.getMinutes() != current.getMinutes()) {
        current = date;
        calculate();
    }
}, 1000);

reset.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("This will reset the score. Are you sure?")) {
        localStorage.clear();
        updateHighscore();
        updateBadges();
    }
});

document.addEventListener("touchstart", function () { });
(function (undefined) {

    var lastCheck = new Date();
    //lastCheck = new Date("2015-04-19T12:00");
    var checkInterval = (1000 * 60 * 60 /* 1 hour*/) * 2;

    window.applicationCache.addEventListener('updateready', function (e) {
        window.location.reload();
    }, false);

    setInterval(function () {
        window.applicationCache.update();
        lastCheck = new Date();
    }, checkInterval)

})(undefined);