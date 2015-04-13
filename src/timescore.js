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
        rules: rules
    };
});