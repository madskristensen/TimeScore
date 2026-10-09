/*
 * A streak day is a calendar day with at least one scored point.
 * Storage keys are unchanged from the visit-based version, so existing streaks
 * carry over ("streak:lastVisit" now means "last day with a point").
 */
var StreakService = (function () {

    var streakKey = "streak:count",
        lastDayKey = "streak:lastVisit",
        streakSaveKey = "streak:saveAvailable",
        streakSaveWeekKey = "streak:saveWeek";

    function getDateString(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }

    function getWeekNumber(date) {
        var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }

    function daysBetween(dateStr1, dateStr2) {
        var parts1 = dateStr1.split("-");
        var parts2 = dateStr2.split("-");
        var d1 = new Date(+parts1[0], +parts1[1] - 1, +parts1[2]);
        var d2 = new Date(+parts2[0], +parts2[1] - 1, +parts2[2]);
        return Math.round((d2 - d1) / 86400000);
    }

    function refreshStreakSave(date) {
        var currentWeek = date.getFullYear() + "-" + getWeekNumber(date);

        if (localStorage.getItem(streakSaveWeekKey) !== currentWeek) {
            localStorage.setItem(streakSaveKey, "1");
            localStorage.setItem(streakSaveWeekKey, currentWeek);
        }
    }

    // Call when a minute scores >= 1 point. Returns the streak after recording.
    function recordScoringDay(date) {
        if (window.testmode)
            return getStreak(date);

        var today = getDateString(date);
        var lastDay = localStorage.getItem(lastDayKey);
        var currentStreak = parseInt(localStorage.getItem(streakKey), 10) || 0;

        refreshStreakSave(date);

        if (lastDay === today)
            return currentStreak;

        var gap = lastDay ? daysBetween(lastDay, today) : Infinity;

        if (gap === 1) {
            currentStreak += 1;
        } else if (gap === 2 && localStorage.getItem(streakSaveKey) === "1") {
            localStorage.setItem(streakSaveKey, "0");
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        localStorage.setItem(streakKey, String(currentStreak));
        localStorage.setItem(lastDayKey, today);
        return currentStreak;
    }

    // The streak as it stands right now: still alive if the last point was today,
    // yesterday, or two days ago with a streak save available.
    function getStreak(date) {
        var lastDay = localStorage.getItem(lastDayKey);
        var count = parseInt(localStorage.getItem(streakKey), 10) || 0;

        if (!lastDay || !count)
            return 0;

        refreshStreakSave(date || new Date());
        var gap = daysBetween(lastDay, getDateString(date || new Date()));

        if (gap <= 1 || (gap === 2 && hasStreakSave()))
            return count;

        return 0;
    }

    function hasScoredToday(date) {
        return localStorage.getItem(lastDayKey) === getDateString(date || new Date());
    }

    function hasStreakSave() {
        return localStorage.getItem(streakSaveKey) === "1";
    }

    return {
        recordScoringDay: recordScoringDay,
        getStreak: getStreak,
        hasScoredToday: hasScoredToday,
        hasStreakSave: hasStreakSave,
        getDateString: getDateString
    };
});
