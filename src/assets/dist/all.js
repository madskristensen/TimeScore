var BadgeService = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {

            var points = localStorage["badge:" + badge];

            if (points) {
                var b = parseInt(points, 10)
                var thisBadge = allBadges[badge]
                thisBadge.level = Math.floor(points / 5);
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(badge) {

        if (window.testmode || (badge.type === "single" && localStorage["badge:" + badge.id]))
            return;

        localStorage["badge:" + badge.id] = (localStorage["badge:" + badge.id] ? parseInt(localStorage["badge:" + badge.id], 10) : 1);
    }

    var allBadges = {
        newbie: {
            id: "newbie",
            name: "Newbie",
            description: "Congrats!! You got your first point",
            type: "single"
        },
        adventurer: {
            id: "adventurer",
            name: "Adventurer",
            description: "Congrats!! That's your first 10 points",
            type: "single"
        },
        timetraveller: {
            id: "timetraveller",
            name: "Time traveller",
            description: "You're a Time Traveller! That's 50 points",
            type: "single"
        },
        timebandit: {
            id: "timebandit",
            name: "Time Bandit",
            description: "Time Bandit got 100 points in one week",
            type: "single"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "500 points in one week. You are a Time Lord!!",
            type: "single"
        },
        timegamer: {
            id: "timegamer",
            name: "Time gamer",
            description: "1000 points in one week. You are a Time Gamer!!",
            type: "single"
        },

        twentyfourseven: {
            id: "twentyfourseven",
            name: "We're open 24 hours a day",
            description: "Who do we appreciate"
        },
        beer: {
            id: "beer",
            name: "Beer o'clock",
            description: "Beer o'clock"
        },
        caitlin: {
            id: "caitlin",
            name: "Caitlin's birthday",
            description: "The inspiration was born at this time."
        },
        denmark: {
            id: "denmark",
            name: "Kingdom of Denmark",
            description: "Kingdom of Denmark was founded"
        },
        ellendun: {
            id: "ellendun",
            name: "Battle of Ellendun",
            description: "Battle of Ellendun which united England"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
        },
        redsea: {
            id: "redsea",
            name: "What color is the sea?",
            description: "What sea hides under these coordinates?",
        },
        scooter: {
            id: "scotter",
            name: "Retro scooter",
            description: "Retro scooter",
        },
        seveneleven: {
            id: "seveneleven",
            name: "7-Eleven",
            description: "Thank heaven for this corner store",
        },
        shakespeare: {
            id: "shakespeare",
            name: "Shakespeare FTW!",
            description: "Shakespeare FTW!",
        },
        youknow: {
            id: "youknow",
            name: "You know if you know",
            description: "You know if you know"
        },
        martydeparts: {
            id: "martydeparts",
            name: "Marty McFly leaves for the future",
            description: "Marty McFly leaves for the future"
        },
        martyarrives: {
            id: "martyarrives",
            name: "Marty McFly arrives in the future",
            description: "Marty McFly arrives in the future"
        },
        notfound: {
            id: "notfound",
            name: "The page that couldn't be found",
            description: "The page that couldn't be found"
        },
        hacker: {
            id: "hacker",
            name: "You speak hacker",
            description: "You speak hacker"
        },
        jumbo: {
            id: "jumbo",
            name: "Jumbo",
            description: "The Jumbo Jet"
        },
        concordat: {
            id: "concordat",
            name: "Concordat of Worms",
            description: "Concordat of Worms",
        },
        genghis: {
            id: "genghis",
            name: "Genghis Khan becomes great",
            description: "Genghis Khan becomes great",
        },
        paris: {
            id: "paris",
            name: "Treaty of Paris",
            description: "Treaty of Paris",
        },
        hadrian: {
            id: "hadrian",
            name: "Hadrian's Wall",
            description: "Hadrian's Wall",
        },
        alarm: {
            id: "alarm",
            name: "The alarm clock was invented",
            description: "The alarm clock was invented",
        },
        sixseven: {
            id: "sixseven",
            name: "¯\\_(ツ)_/¯",
            description: "Siiiiix seeeeven?",
        },
        seattle: {
            id: "seattle",
            name: "Rain City got its name",
            description: "Rain City got its name",
        }
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});
/// <reference path="badgeService.js" />

var HighscoreService = function () {

    var _score,
        badgeService = new BadgeService();

    function recordScore(date, points) {

        if (isRecorded(date) || window.testmode)
            return;

        var key = cleanDate(date);
        localStorage.setItem(key, points);
    }

    function cleanDate(date) {
        var clean = new Date(date);
        clean.setSeconds(0, 0);
        return clean;
    }

    function isRecorded(date) {
        var clean = cleanDate(date);

        return localStorage.getItem(clean) != null;
    }

    function getScore(date) {

        date = cleanDate(date);
        var daily = 0;
        var weekly = 0;

        Object.keys(localStorage).forEach(function (hash) {

            if (hash.indexOf("badge:") === 0)
                return;

            var timestamp = new Date(hash);
            var timeDiff = Math.abs(date.getTime() - timestamp.getTime());
            var diffDays = timeDiff / (1000 * 3600 * 24);
            var points = parseInt(localStorage.getItem(hash), 10);

            if (isNaN(points))
                return;

            if (diffDays <= 1) {
                daily += points;
                weekly += points;
            }
            else if (diffDays <= 7) {
                weekly += points;
            }
            else {
                localStorage.removeItem(hash);
            }
        });

        if (weekly >= 1000)
            badgeService.addBadge(badgeService.badges.timegamer)
        else if (weekly >= 500)
            badgeService.addBadge(badgeService.badges.timelord)
        else if (weekly >= 100)
            badgeService.addBadge(badgeService.badges.timebandit)
        else if (weekly >= 50)
            badgeService.addBadge(badgeService.badges.timetraveller)
        else if (weekly >= 10)
            badgeService.addBadge(badgeService.badges.adventurer)
        else if (weekly > 0)
            badgeService.addBadge(badgeService.badges.newbie)

        return {
            daily: daily,
            weekly: weekly
        }
    }

    return {
        recordScore: recordScore,
        getScore: getScore,
        isRecorded: isRecorded
    }
}
/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />

var TimeScore = (function () {

    var _hour, _minute, _date,
        badgeService = new BadgeService(),
        hightscoreService = new HighscoreService();

    function getScore(date) {
        _date = date;
        normalize(date);
        var score = runRules();

        return {
            time: `${_hour}:${_minute}`,
            score: score
        }
    }

    function normalize(date) {
        var minute = date.getMinutes();
        var hour = date.getHours();

        _minute = String(minute).padStart(2, "0");

        var imperial = hour % 12;
        _hour = String(imperial === 0 ? 12 : imperial);
    }

    function runRules() {
        var hits = [];

        var all = (_hour + _minute);
        var reverseAll = all.split("").reverse().join("");
        if (all === reverseAll) {
            hits.push(rules.mirrormirror);

        }

        if (_hour === _minute) {
            hits.push(rules.equals);
        }

        if (_hour + _hour === _minute) {
            hits.push(rules.threeofakind);
        }

        if (_minute === "00") {
            hits.push(rules.tophour);
        }

        ruleMomentIntime(hits);

        if (_minute.length === 2 && parseInt(_minute[0], 10) + parseInt(_minute[1], 10) === parseInt(_hour, 10)) {

            hits.push(rules.product);
        }

        if (_hour === "12" && _minute === "34") {
            hits.push(rules.onetwothreefour);
        }


        if (_date.getMonth() + 1 /*getMonth() is zero-based*/ === parseInt(_hour, 10) && _date.getDate() === _date.getMinutes()) {
            hits.push(rules.today);
        }


        // Runs
        var intHour = parseInt(_hour, 10);
        var firstMinuteDigit = parseInt(_minute[0], 10);
        var secondMinuteDigit = parseInt(_minute[1], 10);
        if (firstMinuteDigit === intHour + 1 && secondMinuteDigit === intHour + 2 || firstMinuteDigit === intHour - 1 && secondMinuteDigit === intHour - 2) {
            hits.push(rules.runs);
        }

        var combined = _hour + _minute;
        var primeDigits = ["2", "3", "5", "7"];
        var isPrime = combined.split("").every(function (digit) {
            return primeDigits.indexOf(digit) > -1;
        });

        // Primes
        if (isPrime) {
            hits.push(rules.prime);
        }

        if (_hour.length === 2 && _hour[0] === _hour[1] && _minute[0] === _minute[1]) {
            hits.push(rules.twopairs);
        }

        if (_hour.length === 2 && _date.getMinutes() % parseInt(_hour, 10) === 0) {
            hits.push(rules.divide);
        }

        return hits;
    }

    function ruleMomentIntime(hits) {
        var realHours = _date.getHours();
        var badges = badgeService.badges;
        var key12 = `${_hour}:${_minute}`;
        var key24 = `${realHours}:${_minute}`;
        var badgeBy12Hour = {
            "7:11": badges.seveneleven,
            "3:14": badges.pi,
            "10:40": badges.shakespeare,
            "1:35": badges.prime,
            "5:31": badges.prime,
            "8:25": badges.ellendun,
            "9:36": badges.denmark,
            "2:47": badges.twentyfourseven,
            "9:46": badges.scooter,
            "4:04": badges.notfound,
            "7:47": badges.jumbo,
            "11:22": badges.concordat,
            "12:06": badges.genghis,
            "12:59": badges.paris,
            "1:22": badges.hadrian,
            "2:50": badges.alarm,
            "6:07": badges.sixseven
        };
        var badgeBy24Hour = {
            "16:20": badges.youknow,
            "23:37": badges.redsea,
            "17:30": badges.beer,
            "4:55": badges.caitlin,
            "1:20": badges.martydeparts,
            "16:29": badges.martyarrives,
            "13:37": badges.hacker,
            "18:52": badges.seattle
        };
        var badge = badgeBy24Hour[key24] || badgeBy12Hour[key12] || null;

        if (badge) {
            var rule = Object.assign({}, rules.momentInTime, { badge: badge });
            hits.push(rule);

            if (!hightscoreService.isRecorded(_date))
                badgeService.addBadge(badge);
        }
    }

    var rules = {

        onetwothreefour: {
            id: "royalstraightflush",
            points: 9,
            rule: "Royal Straight Flush"
        },

        momentInTime: {
            id: "momentintime",
            points: 7,
            rule: "Special moment in time"
        },

        today: {
            id: "today",
            points: 6,
            rule: "Today in time"
        },

        threeofakind: {
            id: "threeofakind",
            points: 5,
            rule: "Three strikes and you're in"
        },

        runs: {
            id: "runs",
            points: 5,
            rule: "A run in time"
        },

        equals: {
            id: "equals",
            points: 4,
            rule: "Pete : Repeat"
        },

        twopairs: {
            id: "twopairs",
            points: 3,
            rule: "A couple of couples"
        },

        tophour: {
            id: "tophour",
            points: 3,
            rule: "Top of the hour"
        },

        divide: {
            id: "divide",
            points: 2,
            rule: "Double digit divide"
        },

        prime: {
            id: "prime",
            points: 2,
            rule: "Nothing but primes"
        },

        product: {
            id: "product",
            points: 1,
            rule: "Minute sums it up"
        },

        mirrormirror: {
            id: "mirrormirror",
            points: 1,
            rule: "Mirror, mirror on the wall"
        },
    };

    return {
        getScore: getScore,
        rules: rules,
        date: _date
    };
});
/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />
/// <reference path="timescore.js" />

var elmTime = document.getElementById("time"),
    elmScore = document.getElementById("score"),
    rules = document.getElementById("rules"),
    reset = document.getElementById("reset"),
    elmBadges = document.getElementById("badges"),
    elmMeter = document.getElementById("meter"),
    elmHowToPlay = document.getElementById("howToPlay"),
    elmInstallApp = document.getElementById("installApp"),
    elmHelpModal = document.getElementById("helpModal"),
    elmInstallModal = document.getElementById("installModal"),
    elmCloseHelp = document.getElementById("closeHelp"),
    elmCloseInstall = document.getElementById("closeInstall"),
    ts = new TimeScore(),
    hs = new HighscoreService(),
    actives = [];

var helpSeenKey = "timescoreHelpSeen",
    installDismissedKey = "timescoreInstallDismissed",
    deferredInstallPrompt = null,
    hasEngaged = false,
    isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

var current = new Date();
//current = new Date(2015, 4, 16, 4, 16);
//current.setHours(7); current.setMinutes(11); //localStorage.clear();

function calculate() {

    var result = ts.getScore(current),
        points = 0,
        lis = rules.getElementsByTagName("li");

    elmTime.textContent = result.time;
    clearResults();

    for (var i = 0; i < result.score.length; i++) {

        var score = result.score[i];
        points += score.points;

        for (var a = 0; a < lis.length; a++) {
            var li = lis[a];

            if (score.points > 0 && li.textContent.indexOf(score.rule) > -1) {
                li.className = "active";
                actives.push(li);
                break;
            }
        }
    }

    elmScore.innerHTML = points == 0 ? points : "<span class=\"active\">" + points + "</span>";
    if (points > 0) {
        markEngaged();
        hs.recordScore(current, points);
        updateHighscore();
        updateBadges();
    }
}

function readFlag(key) {
    try {
        return window.localStorage.getItem(key) === "1";
    }
    catch (e) {
        return false;
    }
}

function writeFlag(key, value) {
    try {
        window.localStorage.setItem(key, value ? "1" : "0");
    }
    catch (e) {
    }
}

function isStandalone() {
    var displayMode = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    return !!displayMode || window.navigator.standalone === true;
}

function setModalVisible(modal, show) {
    if (!modal)
        return;

    modal.className = show ? "modal" : "modal hidden";
}

function markEngaged() {
    if (hasEngaged)
        return;

    hasEngaged = true;
    updateInstallButton();
}

function updateInstallButton() {
    if (!elmInstallApp)
        return;

    var shouldShow = hasEngaged && !isStandalone() && !readFlag(installDismissedKey) && (isIOS || !!deferredInstallPrompt);
    elmInstallApp.style.display = shouldShow ? "inline-block" : "none";
}

function maybeShowHelpOnFirstVisit() {
    if (readFlag(helpSeenKey))
        return;

    writeFlag(helpSeenKey, true);
    setModalVisible(elmHelpModal, true);
}

function clearResults() {

    for (var i = 0; i < actives.length; i++) {
        actives[i].className = "";
    }

    actives = [];
}

function updateHighscore() {
    var score = hs.getScore(current);
    document.getElementById("daily").firstElementChild.textContent = score.daily;
    document.getElementById("weekly").firstElementChild.textContent = score.weekly;
}

function showRules() {

    for (var name in ts.rules) {
        var rule = ts.rules[name];

        var point = rule.points === 1 ? "point" : "points";

        var li = document.createElement("li");
        var pointSpan = document.createElement("span");
        pointSpan.textContent = `${rule.points} ${point}`;
        li.appendChild(pointSpan);
        li.appendChild(document.createTextNode(` - ${rule.rule}`));
        li.id = name;

        rules.appendChild(li);
    }
};

function updateBadges() {

    var badges = new BadgeService().getBadges();
    var badgesText = badges.length === 1 ? " badge" : " badges";

    elmBadges.firstElementChild.textContent = badges.length + badgesText;
    elmBadges.innerHTML = elmBadges.firstElementChild.outerHTML;

    if (elmBadges.childElementCount === badges.length + 1)
        return;

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];

        var img = document.createElement("p")
        img.setAttribute("aria-label", badge.description);
        img.id = badge.id;
        img.tabIndex = 1;

        if (badge.level > 1) {
            var span = document.createElement("span");
            span.textContent = badge.level + "x";
            img.appendChild(span);
        }

        elmBadges.appendChild(img);
    }
}

showRules();
calculate();
updateHighscore();
updateBadges();
setTimeout(markEngaged, 45000);
setTimeout(maybeShowHelpOnFirstVisit, 1200);

setInterval(function () {

    var date = new Date();

    elmMeter.style.width = (date.getSeconds() / 60 * 100) + "%";

    if (document.hidden)
        return;

    if (date.getHours() != current.getHours() || date.getMinutes() != current.getMinutes()) {
        current = date;
        calculate();
    }
}, 1000);

reset.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("This will reset the score. Are you sure?")) {
        localStorage.clear();
        updateHighscore();
        updateBadges();
    }
});

if (elmHowToPlay) {
    elmHowToPlay.addEventListener("click", function () {
        setModalVisible(elmHelpModal, true);
    });
}

if (elmCloseHelp) {
    elmCloseHelp.addEventListener("click", function () {
        writeFlag(helpSeenKey, true);
        setModalVisible(elmHelpModal, false);
    });
}

if (elmInstallApp) {
    elmInstallApp.addEventListener("click", function () {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(function (choice) {
                if (!choice || choice.outcome !== "accepted") {
                    writeFlag(installDismissedKey, true);
                }

                deferredInstallPrompt = null;
                updateInstallButton();
            });
            return;
        }

        if (isIOS) {
            setModalVisible(elmInstallModal, true);
        }
    });
}

if (elmCloseInstall) {
    elmCloseInstall.addEventListener("click", function () {
        writeFlag(installDismissedKey, true);
        setModalVisible(elmInstallModal, false);
        updateInstallButton();
    });
}

window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallButton();
});

window.addEventListener("appinstalled", function () {
    writeFlag(installDismissedKey, true);
    deferredInstallPrompt = null;
    updateInstallButton();
});

document.addEventListener("touchstart", function () { });
(function (undefined) {

    if (!("serviceWorker" in navigator))
        return;

    var refreshing = false;

    function promptForRefresh(worker) {
        if (!worker)
            return;

        if (confirm("A new version is available. Reload now?")) {
            worker.postMessage({ type: "SKIP_WAITING" });
        }
    }

    function watchForUpdate(registration) {
        if (!registration)
            return;

        if (registration.waiting) {
            promptForRefresh(registration.waiting);
        }

        registration.addEventListener("updatefound", function () {
            var newWorker = registration.installing;
            if (!newWorker)
                return;

            newWorker.addEventListener("statechange", function () {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    promptForRefresh(newWorker);
                }
            });
        });
    }

    window.addEventListener("load", function () {
        navigator.serviceWorker.register("/service-worker.js").then(function (registration) {
            watchForUpdate(registration);
            registration.update();
        });
    });

    navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing)
            return;

        refreshing = true;
        window.location.reload();
    });

})(undefined);