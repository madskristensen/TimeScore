/// <reference path="timescore.js" />

var DailyChallengeService = (function () {

    var challengeProgressKey = "challenge:progress",
        challengeDateKey = "challenge:date",
        challengeRulesKey = "challenge:rules",
        challengeHistoryKey = "challenge:history",
        historyLength = 7;

    var challengeTemplates = [
        {
            id: "palindrome",
            name: "Mirror Master",
            description: "Catch a palindrome time",
            ruleId: "mirrormirror",
            target: 1
        },
        {
            id: "tophour",
            name: "On the Dot",
            description: "Hit the top of any hour",
            ruleId: "tophour",
            target: 1
        },
        {
            id: "prime2",
            name: "Prime Hunter",
            description: "Find 2 all-prime times",
            ruleId: "prime",
            target: 2
        },
        {
            id: "equals",
            name: "Double Vision",
            description: "Catch a Pete : Repeat time",
            ruleId: "equals",
            target: 1
        },
        {
            id: "runs",
            name: "On a Run",
            description: "Catch a run in time",
            ruleId: "runs",
            target: 1
        },
        {
            id: "divide",
            name: "Divisible",
            description: "Find a double digit divide",
            ruleId: "divide",
            target: 1
        },
        {
            id: "product",
            name: "Sum It Up",
            description: "Catch 2 minute-sum times",
            ruleId: "minutesum",
            target: 2
        },
        {
            id: "points5",
            name: "High Roller",
            description: "Score 5+ points in a single minute",
            ruleId: null,
            target: 5
        },
        {
            id: "any3",
            name: "Hat Trick",
            description: "Match 3 different rules today",
            ruleId: null,
            target: 3
        }
    ];

    function getDaySeed(date) {
        return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    }

    function getDateString(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }

    function getTemplate(date) {
        return challengeTemplates[getDaySeed(date) % challengeTemplates.length];
    }

    function parseDateString(value) {
        var parts = String(value).split("-");
        return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }

    function readJson(key, fallback) {
        try {
            var value = JSON.parse(localStorage.getItem(key));
            return value == null ? fallback : value;
        }
        catch (e) {
            return fallback;
        }
    }

    // Most recent first: [{ date: "2026-10-7", name, description, completed }]
    function getHistory() {
        var history = readJson(challengeHistoryKey, []);
        return Array.isArray(history) ? history : [];
    }

    function archiveDay(storedDate) {
        var template = getTemplate(parseDateString(storedDate));
        var progress = parseInt(localStorage.getItem(challengeProgressKey), 10) || 0;
        var history = getHistory().filter(function (h) { return h.date !== storedDate; });

        history.unshift({
            date: storedDate,
            name: template.name,
            description: template.description,
            completed: progress >= template.target
        });

        localStorage.setItem(challengeHistoryKey, JSON.stringify(history.slice(0, historyLength)));
    }

    function getChallenge(date) {
        var template = getTemplate(date);

        var today = getDateString(date);
        var storedDate = localStorage.getItem(challengeDateKey);

        if (storedDate !== today) {
            if (storedDate)
                archiveDay(storedDate);

            localStorage.setItem(challengeDateKey, today);
            localStorage.setItem(challengeProgressKey, "0");
            localStorage.removeItem(challengeRulesKey);
        }

        var progress = parseInt(localStorage.getItem(challengeProgressKey), 10) || 0;

        return {
            id: template.id,
            name: template.name,
            description: template.description,
            ruleId: template.ruleId,
            target: template.target,
            progress: progress,
            completed: progress >= template.target
        };
    }

    function recordProgress(date, hits, totalPoints) {
        var challenge = getChallenge(date);

        if (challenge.completed) {
            return challenge;
        }

        var gained = 0;

        if (challenge.id === "points5") {
            if (totalPoints >= challenge.target) {
                gained = challenge.target;
            }
        } else if (challenge.id === "any3") {
            // Count distinct rules matched today, not repeats of the same rule.
            var matched = readJson(challengeRulesKey, []);
            if (!Array.isArray(matched))
                matched = [];

            for (var j = 0; j < hits.length; j++) {
                if (matched.indexOf(hits[j].id) === -1)
                    matched.push(hits[j].id);
            }

            localStorage.setItem(challengeRulesKey, JSON.stringify(matched));
            gained = matched.length - challenge.progress;
        } else {
            for (var i = 0; i < hits.length; i++) {
                if (hits[i].id === challenge.ruleId) {
                    gained += 1;
                }
            }
        }

        if (gained > 0) {
            var newProgress = Math.min(challenge.progress + gained, challenge.target);
            localStorage.setItem(challengeProgressKey, String(newProgress));
            challenge.progress = newProgress;
            challenge.completed = newProgress >= challenge.target;
        }

        return challenge;
    }

    return {
        getHistory: getHistory,
        getChallenge: getChallenge,
        recordProgress: recordProgress
    };
});
