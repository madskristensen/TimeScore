/// <reference path="http://code.jquery.com/qunit/qunit-1.18.0.js" />
/// <reference path="../timescore.js" />

var ts;

QUnit.testStart(function () {
    ts = new TimeScore();
});

QUnit.module("Royal Straight Flush");
QUnit.test("12:34", function (assert) { runTest(assert, 12, 34, 9) });
QUnit.test("2:23", function (assert) { runTest(assert, 2, 34, 0) });


QUnit.module("Four of a kind");
QUnit.test("11:11", function (assert) { runTest(assert, 11, 11, 12) });


QUnit.module("Three of a kind");
QUnit.test("02:22", function (assert) { runTest(assert, 2, 22, 6) });
QUnit.test("05:55", function (assert) { runTest(assert, 5, 55, 6) });


QUnit.module("Mirror, mirror on the wall");
QUnit.test("10:01", function (assert) { runTest(assert, 10, 01, 1) });
QUnit.test("10:11", function (assert) { runTest(assert, 10, 11, 0) });
QUnit.test("6:06", function (assert) { runTest(assert, 6, 6, 2) });


QUnit.module("Pete : Repeat");
QUnit.test("10:10", function (assert) { runTest(assert, 10, 10, 6) });
QUnit.test("09:09", function (assert) { runTest(assert, 9, 9, 2) });


QUnit.module("Minute is the product");
QUnit.test("4:13", function (assert) { runTest(assert, 4, 13, 1) });
QUnit.test("16:13", function (assert) { runTest(assert, 16, 13, 1) });


QUnit.module("Special moment in time");
QUnit.test("7-Eleven am", function (assert) { runTest(assert, 7, 11, 7) });
QUnit.test("7-Eleven pm", function (assert) { runTest(assert, 19, 11, 7) });
QUnit.test("PI am", function (assert) { runTest(assert, 3, 14, 7) });
QUnit.test("PI pm", function (assert) { runTest(assert, 15, 14, 7) });
QUnit.test("Beer o'clock", function (assert) { runTest(assert, 17, 30, 7) });
QUnit.test("Battle of Ellendun am", function (assert) { runTest(assert, 8, 25, 7) });
QUnit.test("Battle of Ellendun pm", function (assert) { runTest(assert, 20, 25, 7) });
QUnit.test("Kingdom of Denmark am", function (assert) { runTest(assert, 9, 36, 8) });
QUnit.test("Kingdom of Denmark pm", function (assert) { runTest(assert, 21, 36, 8) });
QUnit.test("24/7 am", function (assert) { runTest(assert, 2, 47, 7) });
QUnit.test("24/7 pm", function (assert) { runTest(assert, 14, 47, 7) });
QUnit.test("Retro scooter am", function (assert) { runTest(assert, 9, 46, 7) });
QUnit.test("Retro scooter pm", function (assert) { runTest(assert, 21, 46, 7) });
QUnit.test("Prime numbers", function (assert) { runTest(assert, 1, 35, 7) });
QUnit.test("Prime numbers backwards", function (assert) { runTest(assert, 5, 31, 7) });
QUnit.test("You know if you know", function (assert) { runTest(assert, 16, 20, 7) });
QUnit.test("What color is the sea", function (assert) { runTest(assert, 23, 37, 7) });
QUnit.test("Macbeth murders Duncan am", function (assert) { runTest(assert, 10, 40, 9) });
QUnit.test("Macbeth murders Duncan pm", function (assert) { runTest(assert, 22, 40, 9) });
QUnit.test("Caitlin's birthday", function (assert) { runTest(assert, 4, 55, 7) });


QUnit.module("Two pairs");
QUnit.test("11:22", function (assert) { runTest(assert, 11, 22, 5) });


QUnit.module("Top of the hour");
QUnit.test("Midnight", function (assert) { runTest(assert, 0, 0, 4) });
QUnit.test("10:00", function (assert) { runTest(assert, 10, 0, 4) });
QUnit.test("11:01", function (assert) { runTest(assert, 11, 1, 0) });


QUnit.test("Today in time", function (assert) {
    var date = new Date(2015, 4, 16, 4, 16);

    var result = ts.getScore(date)
    var total = 0;
    var rules = [];

    for (var i = 0; i < result.score.length; i++) {
        total += result.score[i].points;
        rules.push("'" + result.score[i].rule + "'");
    }

    assert.equal(total, 6, total + " points - (" + rules.join(", ") + ")");

});


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