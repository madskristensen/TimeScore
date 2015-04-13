var TimeScore = (function () {

    var _hour, _minute, _date;

    function getScore(date) {
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

        if (hour < 10) {
            _hour = "0" + hour;
        }
        else if (hour > 12) {
            var imperial = hour - 12;

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

        if (_hour === "07" && _minute === "11") {
            hits.push(rules.sevelEleven);
        }

        if (_hour === "12" && _minute === "34") {
            hits.push(rules.onetwothreefour);
        }

        if (_hour === "11" && _minute === "11") {
            hits.push(rules.eleveneleven);
        }

        return hits;
    }

    var rules = {

        onetwothreefour: {
            points: 4,
            rule: "Royal Straight Flush"
        },

        sevelEleven: {
            points: 4,
            rule: "Thank heaven for 7-Eleven"
        },

        threeofakind: {
            points: 3,
            rule: "Three of a kind"
        },

        reverse: {
            points: 3,
            rule: "Minutes reversed equals hour"
        },

        equals: {
            points: 2,
            rule: "Hour and minutes are the same"
        },

        tophour: {
            points: 1,
            rule: "Top of the hour"
        },

        eleveneleven: {
            points: 1,
            rule: "Four of a kind"
        },

    };

    return {
        getScore: getScore,
        rules: rules
    };
});

(function () {
    var time = document.querySelector("time"),
        elmScore = document.getElementById("score"),
        rules = document.getElementById("rules"),
        ts = new TimeScore();

    function display() {
        var result = ts.getScore(new Date());
        //var result = ts.getScore(new Date(2015, 12, 31, 12, 00));
        var points = 0;
        var lis = rules.getElementsByTagName("li");

        time.innerHTML = result.time;
        clearResults();

        for (var i = 0; i < result.score.length; i++) {

            var score = result.score[i];
            points += score.points;

            for (var a = 0; a < lis.length; a++) {
                li = lis[a];

                if (score.points > 0 && li.innerHTML.lastIndexOf(score.rule) > -1) {
                    li.classList.add("active");
                    break;
                }
            }
        }

        elmScore.innerHTML = points;
    }

    function clearResults() {
        var lis = rules.getElementsByTagName("li");

        for (var i = 0; i < lis.length; i++) {
            li = lis[i];

            li.classList.remove("active");
        }
    }

    function showRules() {
        for (var name in ts.rules) {
            var rule = ts.rules[name];
            var li = document.createElement("li");
            li.innerHTML = rule.points + " points - " + rule.rule;
            li.id = name;
            rules.appendChild(li);
        }
    };

    showRules();
    display();

    setInterval(function () {
        display();

    }, 2000);
})();