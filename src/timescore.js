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

            _hour = imperial.toString();
        }
        else {
            _hour = hour.toString();
        }
    }

    function runRules() {
        var reverseMinutes = _minute.split("").reverse().join("");
        var singleHour = _hour.indexOf("0") == 0 ? _hour.substr(1) : _hour;

        if (_hour === reverseMinutes || singleHour === reverseMinutes) {
            return rules.reverse;
        }

        if (_hour === _minute) {
            return rules.equals;
        }

        if (_minute === "00") {
            return rules.tophour;
        }

        if (_hour === "01" && _minute === "11") {
            return rules.sevelEleven;
        }

        return {
            points: 0,
            rule: ""
        };
    }

    var rules = {

        sevelEleven: {
            points: 4,
            rule: "Thank heaven for 7-Eleven"
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
    };

    return {
        getScore: getScore,
        rules: rules
    }
});

(function () {
    var time = document.querySelector("time"),
        score = document.getElementById("score"),
        rules = document.getElementById("rules"),
        ts = new TimeScore();

    function display() {
        var result = ts.getScore(new Date());
        //var result = ts.getScore(new Date(2015, 12, 31, 9, 9));

        time.innerHTML = result.time;
        score.innerHTML = result.score.points;

        var lis = rules.getElementsByTagName("li");

        for (var i = 0; i < lis.length; i++) {
            li = lis[i];

            if (result.score.points > 0 && li.innerHTML.lastIndexOf(result.score.rule) > -1) {
                li.classList.add("active");
            }
            else {
                li.classList.remove("active");
            }
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

    }, 60 * 1000); // 1 minute
})();