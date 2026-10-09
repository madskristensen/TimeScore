/* global QUnit, TimeScore, BadgeService, HighscoreService, StreakService, DailyChallengeService, CollectionService */

var ts = new TimeScore();

function score(hour, minutes, date) {
    var d = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minutes) : new Date(2015, 1, 1, hour, minutes);
    return ts.getScore(d);
}

function ids(result) {
    return result.score.map(function (s) { return s.id; }).sort().join(",");
}

function runTest(assert, hour, minutes, points) {
    var result = score(hour, minutes);
    assert.equal(result.points, points, points + " points - (" + result.score.map(function (s) { return "'" + s.rule + "'"; }).join(", ") + ")");
}

// Tests for services that write to storage run against a snapshot of
// localStorage that is restored afterwards, so running the suite on a real
// origin never touches the player's data.
var storageHooks = {
    beforeEach: function () {
        this.snapshot = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            this.snapshot[key] = localStorage.getItem(key);
        }
        localStorage.clear();
        window.testmode = false;
    },
    afterEach: function () {
        window.testmode = true;
        localStorage.clear();
        for (var key in this.snapshot) {
            localStorage.setItem(key, this.snapshot[key]);
        }
    }
};

QUnit.module("Straights", function () {
    QUnit.test("12:34 is the Royal Straight Flush (and not also a run)", function (assert) {
        assert.equal(ids(score(12, 34)), "royalstraightflush");
        runTest(assert, 12, 34, 9);
        runTest(assert, 0, 34, 9);
    });
    QUnit.test("3-digit runs", function (assert) {
        runTest(assert, 2, 34, 5);
        runTest(assert, 2, 10, 5);
        assert.equal(ids(score(3, 21)), "minutesum,runs");
        runTest(assert, 1, 23, 12); // run + Counting Sequence moment
        runTest(assert, 2, 36, 0);
    });
});

QUnit.module("Patterns", function () {
    QUnit.test("Three of a kind", function (assert) {
        runTest(assert, 2, 22, 8);
        runTest(assert, 5, 55, 8);
    });
    QUnit.test("Mirror, mirror on the wall", function (assert) {
        runTest(assert, 10, 1, 1);
        runTest(assert, 10, 11, 0);
        runTest(assert, 6, 6, 2);
    });
    QUnit.test("Pete : Repeat", function (assert) {
        runTest(assert, 10, 10, 13);
        runTest(assert, 9, 9, 2);
    });
    QUnit.test("Two pairs", function (assert) {
        runTest(assert, 11, 22, 5);
        runTest(assert, 11, 11, 17);
    });
    QUnit.test("Minute sums it up (id: minutesum)", function (assert) {
        runTest(assert, 4, 13, 1);
        runTest(assert, 16, 13, 1);
        assert.ok(ts.rules.minutesum, "rule key renamed from 'product'");
        assert.equal(ts.rules.minutesum.id, "minutesum");
    });
    QUnit.test("Top of the hour", function (assert) {
        runTest(assert, 0, 0, 10);
        runTest(assert, 10, 0, 3);
        runTest(assert, 11, 1, 0);
        runTest(assert, 5, 0, 3);
    });
    QUnit.test("Today in time", function (assert) {
        var result = ts.getScore(new Date(2015, 3, 16, 4, 16));
        assert.equal(result.points, 6);
        assert.equal(ids(result), "today");
    });
});

QUnit.module("12-hour face, AM and PM", function () {
    QUnit.test("pattern rules fire twice a day", function (assert) {
        assert.equal(score(2, 22).points, score(14, 22).points);
        assert.equal(score(12, 34).points, score(0, 34).points);
    });
    QUnit.test("midnight is 12:00 on the face", function (assert) {
        var result = score(0, 0);
        assert.equal(result.time, "12:00");
        assert.equal(result.minuteKey, "00:00");
        assert.equal(ids(result), "momentintime,tophour");
    });
});

QUnit.module("Special moment in time", function () {
    var cases = [
        ["7-Eleven am", 7, 11, 7], ["7-Eleven pm", 19, 11, 7],
        ["PI am", 3, 14, 7], ["PI pm", 15, 14, 7],
        ["420 am", 4, 20, 0], ["420 pm", 16, 20, 7],
        ["Scottish dentist appointment am", 2, 30, 0], ["Scottish dentist appointment pm", 14, 30, 7],
        ["Beer o'clock", 17, 30, 7],
        ["2-4-6-8 am", 2, 46, 7], ["2-4-6-8 pm", 14, 46, 7],
        ["24/7 am", 2, 47, 7], ["24/7 pm", 14, 47, 7],
        ["Retro scooter am", 9, 46, 7], ["Retro scooter pm", 21, 46, 7],
        ["Macbeth murders Duncan am", 10, 40, 9], ["Macbeth murders Duncan pm", 22, 40, 9],
        ["Caitlin's birthday", 4, 55, 7],
        ["404 not found", 4, 4, 9],
        ["Hacker", 13, 37, 7],
        ["Jumbo", 7, 47, 8],
        ["Emergency am", 9, 11, 7], ["Emergency pm", 21, 11, 7],
        ["Removed moments no longer score", 8, 25, 0],
        ["1:35 does not point at a missing badge", 1, 35, 0],
        ["5:31 does not point at a missing badge", 5, 31, 0]
    ];

    cases.forEach(function (c) {
        QUnit.test(c[0], function (assert) { runTest(assert, c[1], c[2], c[3]); });
    });

    QUnit.test("every moment points at a real badge", function (assert) {
        var badges = new BadgeService().badges;
        for (var m = 0; m < 1440; m++) {
            var result = ts.getScore(new Date(2026, 1, 1, Math.floor(m / 60), m % 60));
            result.score.forEach(function (hit) {
                if (hit.id === "momentintime") {
                    assert.ok(hit.badge && badges[hit.badge.id] && badges[hit.badge.id].name === hit.badge.name, result.minuteKey + " -> " + (hit.badge && hit.badge.id));
                }
            });
        }
    });

    QUnit.test("current year nod", function (assert) {
        var result = ts.getScore(new Date(2026, 5, 1, 20, 26));
        assert.ok(result.score.some(function (h) { return h.badge && h.badge.id === "currentyear"; }));
    });
});

QUnit.module("Collection", function () {
    QUnit.test("collectible minutes are stable and date independent", function (assert) {
        var keys = ts.getCollectibleMinutes(new Date(2026, 9, 8));
        assert.ok(keys.length > 300 && keys.length < 400, keys.length + " collectible minutes");
        assert.ok(keys.indexOf("11:11") > -1 && keys.indexOf("23:11") > -1, "AM and PM are separate entries");
        assert.equal(keys.indexOf("02:36"), -1);
    });
});

QUnit.module("Badges", storageHooks, function () {
    QUnit.test("score tiers award every crossed tier", function (assert) {
        var badges = new BadgeService();
        var awarded = badges.awardTiers(55).map(function (r) { return r.badge.id; });
        assert.deepEqual(awarded, ["newbie", "adventurer", "timetraveller"]);
        assert.deepEqual(badges.awardTiers(60), [], "single badges are only awarded once");
    });
    QUnit.test("repeat badges count every catch", function (assert) {
        var badges = new BadgeService();
        assert.ok(badges.addBadge(badges.badges.pi).isNew);
        assert.equal(badges.addBadge(badges.badges.pi).count, 2);
        var pi = badges.getBadges().filter(function (b) { return b.id === "pi"; })[0];
        assert.equal(pi.count, 2);
    });
    QUnit.test("every badge has an icon, name and rarity", function (assert) {
        new BadgeService().getAllBadges().forEach(function (b) {
            assert.ok(b.icon && b.name && b.rarity, b.id);
        });
    });
});

QUnit.module("Highscore", storageHooks, function () {
    QUnit.test("a minute is only recorded once", function (assert) {
        var hs = new HighscoreService();
        var d = new Date(2026, 9, 8, 11, 11, 5);
        assert.true(hs.recordScore(d, 17));
        assert.false(hs.recordScore(new Date(2026, 9, 8, 11, 11, 40), 17), "reload in the same minute");
        assert.equal(hs.getScore(d).daily, 17);
    });
});

QUnit.module("Streak", storageHooks, function () {
    QUnit.test("only days with a point count", function (assert) {
        var s = new StreakService();
        assert.equal(s.getStreak(new Date(2026, 9, 5)), 0);
        s.recordScoringDay(new Date(2026, 9, 5, 9));
        s.recordScoringDay(new Date(2026, 9, 5, 18));
        assert.equal(s.getStreak(new Date(2026, 9, 5)), 1);
        s.recordScoringDay(new Date(2026, 9, 6, 9));
        assert.equal(s.getStreak(new Date(2026, 9, 7, 8)), 2, "still alive the next morning");
        assert.false(s.hasScoredToday(new Date(2026, 9, 7, 8)));
    });
    QUnit.test("a missed day uses the weekly save, two missed days reset", function (assert) {
        var s = new StreakService();
        s.recordScoringDay(new Date(2026, 9, 5));
        s.recordScoringDay(new Date(2026, 9, 6));
        assert.equal(s.recordScoringDay(new Date(2026, 9, 8)), 3, "save used");
        assert.false(s.hasStreakSave());
        assert.equal(s.recordScoringDay(new Date(2026, 9, 11)), 1, "reset");
    });
    QUnit.test("existing visit-based streak data carries over", function (assert) {
        localStorage.setItem("streak:count", "4");
        localStorage.setItem("streak:lastVisit", "2026-10-7");
        var s = new StreakService();
        assert.equal(s.getStreak(new Date(2026, 9, 8)), 4);
        assert.equal(s.recordScoringDay(new Date(2026, 9, 8)), 5);
    });
});

QUnit.module("Daily challenge", storageHooks, function () {
    // 2026-10-08 -> seed 20261008 % 9 = 0 -> "palindrome"; find a day for "any3".
    function dayFor(id) {
        var c = new DailyChallengeService();
        for (var i = 0; i < 9; i++) {
            var d = new Date(2026, 9, 1 + i, 12);
            localStorage.clear();
            if (c.getChallenge(d).id === id)
                return d;
        }
    }

    QUnit.test("Hat Trick counts different rules, not repeats", function (assert) {
        var d = dayFor("any3");
        var c = new DailyChallengeService();
        var mirror = [ts.rules.mirrormirror];
        c.recordProgress(d, mirror, 1);
        c.recordProgress(d, mirror, 1);
        c.recordProgress(d, mirror, 1);
        assert.equal(c.getChallenge(d).progress, 1, "three mirrors are one rule");
        c.recordProgress(d, [ts.rules.mirrormirror, ts.rules.minutesum], 2);
        assert.equal(c.getChallenge(d).progress, 2);
        c.recordProgress(d, [ts.rules.tophour], 3);
        assert.true(c.getChallenge(d).completed);
    });

    QUnit.test("minute-sum challenge uses the renamed rule id", function (assert) {
        var d = dayFor("product");
        var c = new DailyChallengeService();
        c.recordProgress(d, [ts.rules.minutesum], 1);
        assert.equal(c.getChallenge(d).progress, 1);
    });

    QUnit.test("finished days move into the history", function (assert) {
        var c = new DailyChallengeService();
        var day1 = new Date(2026, 9, 7, 12);
        var challenge = c.getChallenge(day1);
        localStorage.setItem("challenge:progress", String(challenge.target));
        c.getChallenge(new Date(2026, 9, 8, 0, 1));
        var history = c.getHistory();
        assert.equal(history.length, 1);
        assert.equal(history[0].date, "2026-10-7");
        assert.true(history[0].completed);
    });
});

QUnit.module("Collection storage", storageHooks, function () {
    QUnit.test("records distinct times and lifetime points", function (assert) {
        var c = new CollectionService();
        assert.true(c.record(new Date(2026, 9, 8, 11, 11), 17, { time: "11:11", points: 17 }));
        assert.false(c.record(new Date(2026, 9, 9, 11, 11), 17), "same time on another day is not new");
        c.record(new Date(2026, 9, 9, 23, 11), 17);
        assert.equal(c.getLifetimePoints(), 51);
        var progress = c.getProgress(["11:11", "23:11", "12:34"]);
        assert.equal(progress.collected, 2);
        assert.equal(progress.total, 3);
        assert.equal(c.getLast().time, "11:11");
    });
    QUnit.test("migrates the scores that already exist", function (assert) {
        var minute = Math.floor(new Date(2026, 9, 8, 12, 34).getTime() / 60000);
        localStorage.setItem("score:" + minute, "9");
        var c = new CollectionService();
        c.migrate();
        c.migrate();
        assert.equal(c.getLifetimePoints(), 9, "migrated once");
        assert.ok(c.getTimes()["12:34"]);
    });
});

QUnit.module("First paint", function () {
    QUnit.test("the inline scoring map in index.html matches the rules engine", function (assert) {
        var done = assert.async();
        fetch("../index.html", { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (html) {
            var map = (html.match(/scoringMap: "([^"]+)"/) || [])[1];
            assert.ok(map, "scoringMap found");
            var bits = atob(map), mismatches = [];

            for (var m = 0; m < 1440; m++) {
                var d = new Date(2001, 1, 1, Math.floor(m / 60), m % 60);
                var hits = ts.getScore(d).score.filter(function (h) {
                    return h.id !== "today" && !(h.badge && h.badge.id === "currentyear");
                });
                var inMap = ((bits.charCodeAt(m >> 3) >> (m & 7)) & 1) === 1;
                if (inMap !== hits.length > 0)
                    mismatches.push(ts.getMinuteKey(d));
            }

            var bytes = [];
            for (var b = 0; b < 180; b++) bytes.push(0);
            for (var k = 0; k < 1440; k++) {
                var dk = new Date(2001, 1, 1, Math.floor(k / 60), k % 60);
                if (ts.getScore(dk).score.some(function (h) { return h.id !== "today" && !(h.badge && h.badge.id === "currentyear"); }))
                    bytes[k >> 3] |= 1 << (k & 7);
            }
            var expected = btoa(String.fromCharCode.apply(null, bytes));

            assert.deepEqual(mismatches, [], "minutes that disagree with the engine");
            assert.equal(map, expected, "if the rules change, paste this value into scoringMap in index.html");
            done();
        });
    });
});
