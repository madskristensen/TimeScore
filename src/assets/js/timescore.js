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
        else if (realHours === 23 && _minute === "07")
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
            points: 5,
            rule: "Special moment in time"
        },

        eleveneleven: {
            id: "fourofakind",
            points: 4,
            rule: "Four of a kind"
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