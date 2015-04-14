var Badges = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {
            var points = localStorage["badge:" + allBadges[badge].id];

            if (points) {
                var b = parseInt(points, 10)
                var thisBadge = allBadges[badge]
                thisBadge.level = Math.floor(points / 5);
                console.log(points, thisBadge.level)
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(name) {
        var b = null;

        for (var badge in allBadges) {
            if (badge === name || allBadges[badge] === name) {
                b = badge;
                break;
            }
        }

        if (allBadges[b].type === "single" && localStorage["badge:" + b])
            return;
        console.log(name)
        localStorage["badge:" + b] = localStorage["badge:" + b] ? parseInt(localStorage["badge:" + b]) + 1 : 1;
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
            id: "Time traveller",
            name: "Adventurer",
            description: "Congrats!! That's your first 50 points",
            type: "single"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "Congrats!! That's your first 100 points",
            type: "single"
        },

        appreciate: {
            id: "appreciate",
            name: "Who do we appreciate",
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
            description: "Caitlin was born on this time of day."
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
        emily: {
            id: "emily",
            name: "Emily's birthday",
            description: "Emily was born on this time of day"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
        },
        prime: {
            id: "prime",
            name: "Optimus Prime",
            description: "Gotta love them prime numbers",
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
            description: "you know if you know"
        },
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});
/// <reference path="badges.js" />

var Highscore = function () {

    var _score
    badgeService = new Badges();

    function recordScore(date, points) {

        if (isRecorded(date))
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

        if (weekly >= 100)
            badgeService.addBadge(badgeService.badges.timelord)
        else if (weekly >= 50)
            badgeService.addBadge(badgeService.badges.timetraveller)
        else if (weekly >= 10)
            badgeService.addBadge(badgeService.badges.adventurer)
        else if (weekly > 0)
            badgeService.addBadge(badgeService.badges.newbie)

        return {
            daily: daily,
            weekly: weekly,
            total: 0
        }
    }

    return {
        recordScore: recordScore,
        getScore: getScore,
        isRecorded: isRecorded
    }
}
/// <reference path="badges.js" />
/// <reference path="highscore.js" />

var TimeScore = (function () {

    var _hour, _minute, _date,
        badgeService = new Badges(),
        hightscoreService = new Highscore();

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
        else if (_hour === _minute) {
            hits.push(rules.equals);
        }

        if (_hour + _hour === _minute) {
            hits.push(rules.threeofakind);
        }

        if (_minute === "00") {
            hits.push(rules.tophour);
        }

        ruleMomentIntime(hits);

        var half = parseInt(_hour) / 2;
        if (_minute.length == 2 && _minute[0] == half && _minute[1] == half) {
            hits.push(rules.product);
        }

        if (_hour === "12" && _minute === "34") {
            hits.push(rules.onetwothreefour);
        }

        if (_hour === "11" && _minute === "11") {
            hits.push(rules.eleveneleven);
        }

        if (hits.length > 0 && realHours >= 2 && realHours < 5) {
            hits.push(rules.nightowl);
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
        else if (_hour === "2" && _minute === "46")
            badge = badges.appreciate;
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
        else if (realHours === 11 && _minute === "07")
            badge = badges.emily;

        if (badge && !hightscoreService.isRecorded(_date)) {
            rule = rules.momentInTime;
            rule.badge = badge;
            hits.push(rule);
            badgeService.addBadge(badge);
        }
    }

    var rules = {

        onetwothreefour: {
            id: "royalstraightflush",
            points: 6,
            rule: "Royal Straight Flush"
        },

        momentInTime: {
            id: "momentintime",
            points: 4,
            rule: "Special moment in time"
        },

        threeofakind: {
            id: "threeofakind",
            points: 3,
            rule: "Three of a kind"
        },

        equals: {
            id: "equals",
            points: 2,
            rule: "Pete : Repeat"
        },

        product: {
            id: "product",
            points: 2,
            rule: "Minute is the product"
        },

        mirrormirror: {
            id: "mirrormirror",
            points: 1,
            rule: "Mirror, mirror on the wall"
        },

        tophour: {
            id: "tophour",
            points: 1,
            rule: "Top of the hour"
        },

        eleveneleven: {
            id: "fourofakind",
            points: 3,
            rule: "Four of a kind",
            type: "bonus"
        },

        nightowl: {
            id: "nightowl",
            points: 1,
            rule: "Knight owl",
            type: "bonus"
        },

    };

    return {
        getScore: getScore,
        rules: rules,
        date: _date
    };
});
/// <reference path="badges.js" />
/// <reference path="timescore.js" />
/// <reference path="highscore.js" />

var elmTime = document.getElementById("time"),
    elmScore = document.getElementById("score"),
    rules = document.getElementById("rules"),
    reset = document.getElementById("reset"),
    elmBadges = document.getElementById("badges"),
    ts = new TimeScore(),
    hs = new Highscore(),
    actives = [];

var current = new Date();
//current.setHours(7); current.setMinutes(11);

//(function printAllCombinations() {
//    current.setHours(0); current.setMinutes(0);
//    var day = current.getDate();
//    var pre = document.createElement("pre");

//    while (current.getDate() == day) {
//        var result = ts.getScore(current);
//        var points = 0;

//        for (var i = 0; i < result.score.length; i++) {
//            points += result.score[i].points;
//        }

//        if (points > 0)
//            pre.innerHTML += current.getHours() + ":" + current.getMinutes() + "\t" + points + "\r\n";

//        current = new Date(current.getTime() + 60000);
//    }

//    document.body.appendChild(pre);
//})();

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

    elmScore.innerHTML = points;
    if (points > 0){
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

    var type;

    for (var name in ts.rules) {
        var rule = ts.rules[name];

        var point = rule.points === 1 ? "point&nbsp;&nbsp;" : "points";

        var li = document.createElement("li");
        li.innerHTML = rule.points + " " + point + " - " + rule.rule;
        li.id = name;

        if (type != rule.type) {
            li.innerHTML = "<strong>Bonus points</strong>" + li.innerHTML;
        }

        type = rule.type;
        rules.appendChild(li);
    }
};

function updateBadges() {

    var badges = new Badges().getBadges();

    if (elmBadges.childElementCount === badges.length + 1)
        return;

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];

        var img = document.createElement("p")
        img.setAttribute("aria-label", badge.description);

        if (badge.user)
            img.className = "user";

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

    if (document.hidden || document["webkitHidden"] || document["mozHidden"] || document["msHidden"] || document["oHidden"])
        return;

    var date = new Date();

    if (date.getHours() != current.getHours() || date.getMinutes() != current.getMinutes()) {
        current = date;
        calculate();
    }
}, 2000);

reset.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("This will reset the score. Are you sure?")) {
        localStorage.clear();
        updateHighscore();
        updateBadges();
    }
});