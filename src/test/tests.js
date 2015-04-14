/// <reference path="http://code.jquery.com/qunit/qunit-1.18.0.js" />
/// <reference path="../timescore.js" />

var ts;

QUnit.testStart(function () {
    ts = new TimeScore();
});

QUnit.module("Royal Straight Flush");
QUnit.test("12:34", function (assert) { runTest(assert, 12, 34, 6) });
QUnit.test("2:23", function (assert) { runTest(assert, 2, 34, 0) });


QUnit.module("Three of a kind");
QUnit.test("02:22", function (assert) { runTest(assert, 2, 22, 5) });
QUnit.test("05:55", function (assert) { runTest(assert, 5, 55, 4) });


QUnit.module("Four of a kind");
QUnit.test("11:11", function (assert) { runTest(assert, 11, 11, 4) });


QUnit.module("Mirror, mirror on the wall");
QUnit.test("10:01", function (assert) { runTest(assert, 10, 01, 1) });
QUnit.test("10:11", function (assert) { runTest(assert, 10, 11, 0) });
QUnit.test("6:06", function (assert) { runTest(assert, 6, 6, 1) });


QUnit.module("Pete : Repeat");
QUnit.test("10:10", function (assert) { runTest(assert, 10, 10, 2) });
QUnit.test("09:09", function (assert) { runTest(assert, 9, 9, 1) });


QUnit.module("Special moment in time");
QUnit.test("7-Eleven am", function (assert) { runTest(assert, 7, 11, 4) });
QUnit.test("7-Eleven pm", function (assert) { runTest(assert, 19, 11, 4) });
QUnit.test("PI am", function (assert) { runTest(assert, 3, 14, 5) });
QUnit.test("PI pm", function (assert) { runTest(assert, 15, 14, 4) });
QUnit.test("Beer o'clock", function (assert) { runTest(assert, 17, 30, 4) });
QUnit.test("Battle of Ellendun am", function (assert) { runTest(assert, 8, 25, 4) });
QUnit.test("Battle of Ellendun pm", function (assert) { runTest(assert, 20, 25, 4) });
QUnit.test("Kingdom of Denmark am", function (assert) { runTest(assert, 9, 36, 4) });
QUnit.test("Kingdom of Denmark pm", function (assert) { runTest(assert, 21, 36, 4) });
QUnit.test("Who do we appreciate am", function (assert) { runTest(assert, 2, 46, 5) });
QUnit.test("Who do we appreciate pm", function (assert) { runTest(assert, 14, 46, 4) });
QUnit.test("Retro scooter am", function (assert) { runTest(assert, 9, 46, 4) });
QUnit.test("Retro scooter pm", function (assert) { runTest(assert, 21, 46, 4) });
QUnit.test("Prime numbers", function (assert) { runTest(assert, 1, 35, 4) });
QUnit.test("Prime numbers backwards", function (assert) { runTest(assert, 5, 31, 4) });
QUnit.test("You know if you know", function (assert) { runTest(assert, 16, 20, 4) });
QUnit.test("What color is the sea", function (assert) { runTest(assert, 23, 37, 4) });
QUnit.test("Macbeth murders Duncan am", function (assert) { runTest(assert, 10, 40, 4) });
QUnit.test("Macbeth murders Duncan pm", function (assert) { runTest(assert, 22, 40, 4) });
QUnit.test("Caitlin's birthday", function (assert) { runTest(assert, 4, 55, 5) });
QUnit.test("Emily's birthday", function (assert) { runTest(assert, 11, 7, 4) });


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