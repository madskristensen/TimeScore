/// <reference path="timescore.js" />
/// <reference path="highscore.js" />

var elmTime = document.getElementById("time"),
    elmScore = document.getElementById("score"),
    rules = document.getElementById("rules"),
    ts = new TimeScore(),
    hs = new Highscore(),
    actives = [];

var current = new Date();
//current.setHours(4); current.setMinutes(5);

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
