/// <reference path="http://code.jquery.com/qunit/qunit-1.18.0.js" />
/// <reference path="../timescore.js" />

var ts;

QUnit.testStart(function () {
    ts = new TimeScore();
});

QUnit.module("Royal Straight Flush");
QUnit.test("12:34", function (assert) { runTest(assert, 12, 34, 4) });
QUnit.test("2:23", function (assert) { runTest(assert, 2, 34, 0) });


QUnit.module("Three of a kind");
QUnit.test("02:22", function (assert) { runTest(assert, 2, 22, 4) });
QUnit.test("05:55", function (assert) { runTest(assert, 5, 55, 3) });


QUnit.module("Four of a kind");
QUnit.test("11:11", function (assert) { runTest(assert, 11, 11, 4) });


QUnit.module("Mirror, mirror on the wall");
QUnit.test("10:01", function (assert) { runTest(assert, 10, 01, 3) });
QUnit.test("10:11", function (assert) { runTest(assert, 10, 11, 0) });
QUnit.test("6:06", function (assert) { runTest(assert, 6, 6, 3) });


QUnit.module("Pete : Repeat");
QUnit.test("10:10", function (assert) { runTest(assert, 10, 10, 2) });
QUnit.test("09:09", function (assert) { runTest(assert, 9, 9, 3) });


QUnit.module("Special moment in time");
QUnit.test("7-Eleven morning", function (assert) { runTest(assert, 7, 11, 4) });
QUnit.test("7-Eleven evening", function (assert) { runTest(assert, 19, 11, 4) });
QUnit.test("Caitlin", function (assert) { runTest(assert, 4, 55, 5) });
QUnit.test("Emily", function (assert) { runTest(assert, 11, 7, 4) });


QUnit.module("Top of the hour");
QUnit.test("Midnight", function (assert) { runTest(assert, 0, 0, 1) });
QUnit.test("10:00", function (assert) { runTest(assert, 10, 0, 1) });
QUnit.test("11:01", function (assert) { runTest(assert, 11, 1, 0) });


function runTest(assert, hour, minutes, points) {

    var result = ts.getScore(new Date(2015, 1, 1, hour, minutes))
    var total = 0;
    var rules = [];

    for (var i = 0; i < result.score.length; i++) {
        total += result.score[i].points;
        rules.push("'" + result.score[i].rule + "'");
    }

    assert.equal(total, points, points + " points - (" + rules.join(", ") + ")");
}