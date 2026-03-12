/// <reference path="timescore.js" />

var DailyChallengeService = (function () {

    var challengeProgressKey = "challenge:progress",
        challengeDateKey = "challenge:date";

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
            ruleId: "product",
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

    function getChallenge(date) {
        var seed = getDaySeed(date);
        var index = seed % challengeTemplates.length;
        var template = challengeTemplates[index];

        var today = getDateString(date);
        var storedDate = localStorage.getItem(challengeDateKey);

        if (storedDate !== today) {
            localStorage.setItem(challengeDateKey, today);
            localStorage.setItem(challengeProgressKey, "0");
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
            gained = hits.length;
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
        getChallenge: getChallenge,
        recordProgress: recordProgress
    };
});
