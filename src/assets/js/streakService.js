var StreakService = (function () {

    var streakKey = "streak:count",
        lastVisitKey = "streak:lastVisit",
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
        var savedWeek = localStorage.getItem(streakSaveWeekKey);

        if (savedWeek !== currentWeek) {
            localStorage.setItem(streakSaveKey, "1");
            localStorage.setItem(streakSaveWeekKey, currentWeek);
        }
    }

    function recordVisit(date) {
        var today = getDateString(date);
        var lastVisit = localStorage.getItem(lastVisitKey);
        var currentStreak = parseInt(localStorage.getItem(streakKey), 10) || 0;

        refreshStreakSave(date);

        if (lastVisit === today) {
            return;
        }

        if (!lastVisit) {
            localStorage.setItem(streakKey, "1");
            localStorage.setItem(lastVisitKey, today);
            return;
        }

        var gap = daysBetween(lastVisit, today);

        if (gap === 1) {
            currentStreak += 1;
            localStorage.setItem(streakKey, String(currentStreak));
        } else if (gap === 2 && localStorage.getItem(streakSaveKey) === "1") {
            localStorage.setItem(streakSaveKey, "0");
            currentStreak += 1;
            localStorage.setItem(streakKey, String(currentStreak));
        } else if (gap > 1) {
            currentStreak = 1;
            localStorage.setItem(streakKey, "1");
        }

        localStorage.setItem(lastVisitKey, today);
    }

    function getStreak() {
        return parseInt(localStorage.getItem(streakKey), 10) || 0;
    }

    function hasStreakSave() {
        return localStorage.getItem(streakSaveKey) === "1";
    }

    return {
        recordVisit: recordVisit,
        getStreak: getStreak,
        hasStreakSave: hasStreakSave
    };
});
