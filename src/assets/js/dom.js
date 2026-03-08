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