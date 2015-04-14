var TimeScore = (function () {

    var _hour, _minute, _date;

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

        if (_hour == reverseMinutes || "0" + _hour === _minute) {
            hits.push(rules.reverse);

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

        if ((_hour === "7" && _minute === "11") || // 7-Eleven
            (realHours === 4 && _minute === "55") || // Caitlin's birthday
            (realHours === 11 && _minute === "07") // Emily's birthday
            ) {
            hits.push(rules.momentInTime);
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

    var rules = {

        onetwothreefour: {
            points: 4,
            rule: "Royal Straight Flush"
        },

        momentInTime: {
            points: 4,
            rule: "Special moment in time"
        },

        threeofakind: {
            points: 3,
            rule: "Three of a kind"
        },

        reverse: {
            points: 3,
            rule: "Mirror, mirror on the wall"
        },

        equals: {
            points: 2,
            rule: "Pete : Repeat"
        },

        tophour: {
            points: 1,
            rule: "Top of the hour"
        },

        eleveneleven: {
            points: 1,
            rule: "Four of a kind",
            type: "bonus"
        },

        nightowl: {
            points: 1,
            rule: "Night owl",
            type: "bonus"
        },

    };

    return {
        getScore: getScore,
        rules: rules,
        date : _date
    };
});
var Highscore = function () {

    var _score;

    function recordScore(date, points) {

        var key = cleanDate(date);// date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        console.log(key)
        localStorage[key] = points;
    }

    function cleanDate(date) {
        return new Date(date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes());
    }

    function getScore(date) {

        date = cleanDate(date);
        var daily = 0;
        var weekly = 0;

        for (var hash in localStorage) {

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

        return {
            daily: daily,
            weekly: weekly,
            total: 0
        }
    }

    return {
        recordScore: recordScore,
        getScore: getScore
    }
}

var elmTime = document.getElementById("time"),
    elmScore = document.getElementById("score"),
    rules = document.getElementById("rules"),
    ts = new TimeScore(),
    hs = new Highscore(),
    actives = [];

var current = new Date();
//current.setHours(7); current.setMinutes(11);

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
    if (points > 0) {
        hs.recordScore(current, points);
        updateHighscore();
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

showRules();
calculate();
updateHighscore();

setInterval(function () {
    var date = new Date();

    if (date.getHours() != current.getHours() || date.getMinutes() != current.getMinutes()) {
        current = date;
        calculate();
    }
}, 2000);
