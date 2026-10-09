/// <reference path="highscoreService.js" />

/*
 * Lifetime collection of scoring times. Unlike the per-minute scores (pruned
 * after 7 days) this is never pruned. Stored as one JSON object:
 *   collection:v1 = { times: { "HH:MM": { n: timesCaught, first: epochMs, best: points } },
 *                     points: lifetimePoints, last: { at, time, points, rules, badge } }
 */
var CollectionService = (function () {

    var storageKey = "collection:v1",
        migratedKey = "collection:migrated",
        scorePrefix = "score:";

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function minuteKey(date) {
        return pad(date.getHours()) + ":" + pad(date.getMinutes());
    }

    function load() {
        var data = null;
        try {
            data = JSON.parse(localStorage.getItem(storageKey));
        }
        catch (e) {
        }

        if (!data || typeof data !== "object")
            data = {};

        if (!data.times || typeof data.times !== "object")
            data.times = {};

        data.points = parseInt(data.points, 10) || 0;
        return data;
    }

    function save(data) {
        if (window.testmode)
            return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
        }
    }

    function addToData(data, date, points) {
        var key = minuteKey(date);
        var entry = data.times[key] || { n: 0, first: date.getTime(), best: 0 };
        var isNew = entry.n === 0;

        entry.n += 1;
        entry.best = Math.max(entry.best || 0, points);
        entry.first = Math.min(entry.first || date.getTime(), date.getTime());
        data.times[key] = entry;
        data.points += points;
        return isNew;
    }

    // Records a newly scored minute. `hit` = { time, points, rules: [names], badge }.
    // Returns true when this time of day is collected for the first time.
    function record(date, points, hit) {
        var data = load();
        var isNew = addToData(data, date, points);

        if (hit) {
            data.last = Object.assign({ at: date.getTime() }, hit);
        }

        save(data);
        return isNew;
    }

    // One-time import of the scores that still exist from before the collection
    // existed (the last 7 days of "score:<minute>" entries).
    function migrate() {
        if (window.testmode || localStorage.getItem(migratedKey) === "1")
            return;

        var data = load();
        Object.keys(localStorage).forEach(function (key) {
            if (key.indexOf(scorePrefix) !== 0)
                return;

            var minute = parseInt(key.substring(scorePrefix.length), 10);
            var points = parseInt(localStorage.getItem(key), 10);

            if (!isNaN(minute) && points > 0)
                addToData(data, new Date(minute * 60000), points);
        });

        save(data);
        localStorage.setItem(migratedKey, "1");
    }

    function getTimes() {
        return load().times;
    }

    function getLast() {
        return load().last || null;
    }

    function getLifetimePoints() {
        return load().points;
    }

    // { collected, total, byHour: [{ hour, collected: ["HH:MM"], total }] }
    function getProgress(collectibleKeys) {
        var times = load().times;
        var byHour = [];
        var collected = 0;

        for (var h = 0; h < 24; h++)
            byHour.push({ hour: h, collected: [], total: 0 });

        for (var i = 0; i < collectibleKeys.length; i++) {
            var key = collectibleKeys[i];
            var bucket = byHour[parseInt(key.substring(0, 2), 10)];
            bucket.total += 1;

            if (times[key] && times[key].n > 0) {
                bucket.collected.push(key);
                collected += 1;
            }
        }

        return { collected: collected, total: collectibleKeys.length, byHour: byHour };
    }

    return {
        minuteKey: minuteKey,
        record: record,
        migrate: migrate,
        getTimes: getTimes,
        getLast: getLast,
        getLifetimePoints: getLifetimePoints,
        getProgress: getProgress
    };
});
