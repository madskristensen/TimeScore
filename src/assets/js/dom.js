/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />
/// <reference path="timescore.js" />

var elmTime = document.getElementById("time"),
    elmTimeContainer = document.getElementById("timeContainer"),
    rules = document.getElementById("rules"),
    reset = document.getElementById("reset"),
    elmBadges = document.getElementById("badges"),
    elmMeter = document.getElementById("meter"),
    elmRingProgress = document.getElementById("ringProgress"),
    elmRingHead = document.getElementById("ringHead"),
    elmRingHeadTrail = document.getElementById("ringHeadTrail"),
    elmHowToPlay = document.getElementById("howToPlay"),
    elmInstallApp = document.getElementById("installApp"),
    elmHelpModal = document.getElementById("helpModal"),
    elmInstallModal = document.getElementById("installModal"),
    elmCloseHelp = document.getElementById("closeHelp"),
    elmCloseInstall = document.getElementById("closeInstall"),
    elmStreakCount = document.getElementById("streakCount"),
    elmStreakSave = document.getElementById("streakSave"),
    elmChallenge = document.getElementById("challenge"),
    elmChallengeDesc = document.getElementById("challengeDesc"),
    elmChallengeBar = document.getElementById("challengeBar"),
    elmChallengeStatus = document.getElementById("challengeStatus"),
    ts = new TimeScore(),
    hs = new HighscoreService(),
    badgeService = new BadgeService(),
    streakService = new StreakService(),
    challengeService = null,
    ruleElementsById = {},
    elmScoreToast = null,
    ringCircumference = 0,
    ringRadius = 106,
    ringCenter = 130,
    ringHeadX = ringCenter + ringRadius,
    ringHeadY = ringCenter,
    ringTrailX = ringCenter + ringRadius,
    ringTrailY = ringCenter,
    lastWholeSecond = null;

var helpSeenKey = "timescoreHelpSeen",
    installDismissedKey = "timescoreInstallDismissed",
    deferredInstallPrompt = null,
    hasEngaged = false,
    isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

var reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null,
    prefersReducedMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

var current = new Date();
//current = new Date(2015, 4, 16, 4, 16);
//current.setHours(7); current.setMinutes(11); //localStorage.clear();

function calculate() {

    var result = ts.getScore(current),
        points = 0,
        activeRuleIds = {};

    elmTime.textContent = result.time;
    fitTimeToRing();

    for (var i = 0; i < result.score.length; i++) {

        var score = result.score[i];
        points += score.points;

        if (score.points > 0) {
            activeRuleIds[score.id] = true;
        }
    }

    updateRuleStates(activeRuleIds);

    if (points > 0) {
        triggerCelebration();
        showScoreToast(points);
        markEngaged();
        hs.recordScore(current, points);
        updateHighscore();
        updateBadges();
        updateChallenge(result.score, points);
    }
}

function fitTimeToRing() {
    if (!elmTime || !elmTimeContainer)
        return;

    elmTime.style.transform = "scale(1)";

    var maxWidth = elmTimeContainer.clientWidth * 0.76;
    var timeWidth = elmTime.getBoundingClientRect().width;
    var scale = timeWidth > maxWidth ? (maxWidth / timeWidth) : 1;

    elmTime.style.transform = "scale(" + scale.toFixed(3) + ")";
}

function initializeScoreFeedback() {
    if (!elmTimeContainer)
        return;

    elmScoreToast = document.createElement("span");
    elmScoreToast.id = "scoreToast";
    elmScoreToast.className = "scoreToast";
    elmTimeContainer.appendChild(elmScoreToast);
}

function showScoreToast(points) {
    if (!elmScoreToast)
        return;

    elmScoreToast.textContent = "+" + points;
    elmScoreToast.className = "scoreToast";
    void elmScoreToast.offsetWidth;
    elmScoreToast.className = "scoreToast show";
}

function triggerCelebration() {
    document.body.className = document.body.className.replace(/\bcelebrate\b/g, "").replace(/\s{2,}/g, " ").trim();
    document.body.className = (document.body.className ? document.body.className + " " : "") + "celebrate";

    window.clearTimeout(triggerCelebration._timer);
    triggerCelebration._timer = window.setTimeout(function () {
        document.body.className = document.body.className.replace(/\bcelebrate\b/g, "").replace(/\s{2,}/g, " ").trim();
    }, 500);
}

function readFlag(key) {
    var value = null;

    try {
        value = window.localStorage.getItem(key);
    }
    catch (e) {
    }

    if (value === null) {
        value = readCookie(key);
    }

    return value === "1";
}

function writeFlag(key, value) {
    var stringValue = value ? "1" : "0";

    try {
        window.localStorage.setItem(key, stringValue);
    }
    catch (e) {
    }

    writeCookie(key, stringValue, 3650);
}

function readCookie(name) {
    var prefix = name + "=";
    var pairs = document.cookie ? document.cookie.split(";") : [];

    for (var i = 0; i < pairs.length; i++) {
        var entry = pairs[i].replace(/^\s+/, "");
        if (entry.indexOf(prefix) === 0) {
            return entry.substring(prefix.length);
        }
    }

    return null;
}

function writeCookie(name, value, days) {
    var expires = "";

    if (typeof days === "number") {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
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
    for (var id in ruleElementsById) {
        if (ruleElementsById.hasOwnProperty(id)) {
            ruleElementsById[id].className = "ruleRow muted";
        }
    }
}

function updateRuleStates(activeRuleIds) {
    for (var id in ruleElementsById) {
        if (!ruleElementsById.hasOwnProperty(id))
            continue;

        var row = ruleElementsById[id];
        if (activeRuleIds[id]) {
            row.className = "ruleRow active";
        } else {
            row.className = "ruleRow muted";
        }
    }
}

function updateHighscore() {
    var score = hs.getScore(current);
    document.getElementById("daily").firstElementChild.textContent = score.daily;
    document.getElementById("weekly").firstElementChild.textContent = score.weekly;
}

function showRules() {

    for (var name in ts.rules) {
        var rule = ts.rules[name];

        var li = document.createElement("li");
        li.className = "ruleRow muted";
        var pointSpan = document.createElement("span");
        pointSpan.className = "rulePoints";
        pointSpan.textContent = `${rule.points}pt`;
        li.appendChild(pointSpan);
        var textSpan = document.createElement("span");
        textSpan.className = "ruleText";
        textSpan.textContent = rule.rule;
        li.appendChild(textSpan);
        li.id = rule.id;
        ruleElementsById[rule.id] = li;

        rules.appendChild(li);
    }
};

function initializeTimeRing() {
    if (!elmRingProgress)
        return;

    ringRadius = parseFloat(elmRingProgress.getAttribute("r")) || 106;
    ringCircumference = 2 * Math.PI * ringRadius;
    elmRingProgress.style.strokeDasharray = "0 " + ringCircumference;
    elmRingProgress.style.strokeDashoffset = 0;

    if (elmRingHead) {
        elmRingHead.setAttribute("cx", ringCenter + ringRadius);
        elmRingHead.setAttribute("cy", ringCenter);
    }

    if (elmRingHeadTrail) {
        elmRingHeadTrail.setAttribute("cx", ringCenter + ringRadius);
        elmRingHeadTrail.setAttribute("cy", ringCenter);
    }
}

function setSecondProgress(seconds) {
    var secondPercent = Math.max(0, Math.min(seconds / 60, 1));
    var visibleLength = ringCircumference * secondPercent;
    var angle = secondPercent * (2 * Math.PI);
    ringHeadX = ringCenter + Math.cos(angle) * ringRadius;
    ringHeadY = ringCenter + Math.sin(angle) * ringRadius;

    if (prefersReducedMotion) {
        ringTrailX = ringHeadX;
        ringTrailY = ringHeadY;
    } else {
        ringTrailX += (ringHeadX - ringTrailX) * 0.2;
        ringTrailY += (ringHeadY - ringTrailY) * 0.2;
    }

    if (elmMeter)
        elmMeter.style.width = (secondPercent * 100) + "%";

    if (elmRingProgress && ringCircumference > 0) {
        elmRingProgress.style.strokeDasharray = visibleLength + " " + ringCircumference;
        elmRingProgress.style.strokeDashoffset = 0;
    }

    if (elmRingHeadTrail) {
        elmRingHeadTrail.setAttribute("cx", ringTrailX);
        elmRingHeadTrail.setAttribute("cy", ringTrailY);
        elmRingHeadTrail.style.opacity = secondPercent > 0.003 ? "0.65" : "0.25";
    }

    if (elmRingHead) {
        elmRingHead.setAttribute("cx", ringHeadX);
        elmRingHead.setAttribute("cy", ringHeadY);
        elmRingHead.style.opacity = secondPercent > 0.003 ? "0.95" : "0.35";
    }
}

function triggerMinutePulse() {
    if (!elmTimeContainer)
        return;

    elmTimeContainer.className = elmTimeContainer.className.replace(/\bminutePulse\b/g, "").replace(/\s{2,}/g, " ").trim();
    elmTimeContainer.className = (elmTimeContainer.className ? elmTimeContainer.className + " " : "") + "minutePulse";

    window.clearTimeout(triggerMinutePulse._timer);
    triggerMinutePulse._timer = window.setTimeout(function () {
        elmTimeContainer.className = elmTimeContainer.className.replace(/\bminutePulse\b/g, "").replace(/\s{2,}/g, " ").trim();
    }, 360);
}

function startRingAnimation() {
    function frame() {
        var now = new Date();
        var seconds = prefersReducedMotion ? now.getSeconds() : now.getSeconds() + (now.getMilliseconds() / 1000);
        var wholeSeconds = now.getSeconds();

        if (!prefersReducedMotion && lastWholeSecond !== null && wholeSeconds < lastWholeSecond) {
            triggerMinutePulse();
        }

        lastWholeSecond = wholeSeconds;
        setSecondProgress(seconds);

        if (prefersReducedMotion) {
            window.setTimeout(frame, 250);
        } else {
            window.requestAnimationFrame(frame);
        }
    }

    var now = new Date();
    var seconds = prefersReducedMotion ? now.getSeconds() : now.getSeconds() + (now.getMilliseconds() / 1000);
    lastWholeSecond = now.getSeconds();
    setSecondProgress(seconds);

    if (prefersReducedMotion) {
        window.setTimeout(frame, 250);
    } else {
        window.requestAnimationFrame(frame);
    }
}

function updateBadges() {

    var badges = badgeService.getBadges();
    var badgesText = badges.length === 1 ? " badge" : " badges";

    var title = elmBadges.querySelector("h2");
    var legend = document.getElementById("badgeLegend");

    title.textContent = badges.length + badgesText;
    elmBadges.innerHTML = title.outerHTML + (legend ? legend.outerHTML : "");

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];

        var img = document.createElement("p")
        img.setAttribute("aria-label", badge.description);
        img.id = badge.id;
        img.tabIndex = 1;
        img.className = "rarity-" + (badge.rarity || "common");

        if (badge.level > 1) {
            var span = document.createElement("span");
            span.textContent = badge.level + "x";
            img.appendChild(span);
        }

        elmBadges.appendChild(img);
    }
}

function updateStreak() {
    streakService.recordVisit(new Date());
    var count = streakService.getStreak();
    elmStreakCount.textContent = count;

    if (streakService.hasStreakSave()) {
        elmStreakSave.className = "";
    } else {
        elmStreakSave.className = "hidden";
    }
}

function initChallenge() {
    try {
        var service = getChallengeService();
        if (!service) {
            renderChallengeFallback();
            return;
        }

        var challenge = service.getChallenge(current);
        renderChallenge(challenge);
    }
    catch (e) {
        renderChallengeFallback();
    }
}

function updateChallenge(hits, totalPoints) {
    try {
        var service = getChallengeService();
        if (!service)
            return;

        var challenge = service.recordProgress(current, hits, totalPoints);
        renderChallenge(challenge);
    }
    catch (e) {
        renderChallengeFallback();
    }
}

function getChallengeService() {
    if (challengeService)
        return challengeService;

    if (typeof DailyChallengeService !== "function")
        return null;

    challengeService = new DailyChallengeService();
    return challengeService;
}

function renderChallengeFallback() {
    if (!elmChallengeDesc || !elmChallengeBar || !elmChallengeStatus)
        return;

    elmChallengeDesc.textContent = "Challenge unavailable";
    elmChallengeBar.style.width = "0%";
    elmChallengeStatus.textContent = "Refresh to retry";
    elmChallenge.className = "";
}

function renderChallenge(challenge) {
    elmChallengeDesc.textContent = challenge.description;
    var pct = Math.min(challenge.progress / challenge.target * 100, 100);
    elmChallengeBar.style.width = pct + "%";

    if (challenge.completed) {
        elmChallengeStatus.textContent = "\u2714 Completed!";
        elmChallenge.className = "challengeComplete";
    } else {
        elmChallengeStatus.textContent = challenge.progress + " / " + challenge.target;
        elmChallenge.className = "";
    }
}

if (reducedMotionQuery) {
    var onReducedMotionChange = function (e) {
        prefersReducedMotion = !!e.matches;
        ringTrailX = ringHeadX;
        ringTrailY = ringHeadY;
    };

    if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", onReducedMotionChange);
    } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(onReducedMotionChange);
    }
}

initializeScoreFeedback();
showRules();
initializeTimeRing();
startRingAnimation();
calculate();
updateHighscore();
updateBadges();
updateStreak();
initChallenge();
setTimeout(markEngaged, 45000);
setTimeout(maybeShowHelpOnFirstVisit, 1200);

window.addEventListener("resize", fitTimeToRing);

setInterval(function () {

    var date = new Date();

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
        var helpSeen = readFlag(helpSeenKey);
        var installDismissed = readFlag(installDismissedKey);
        var streakCount = localStorage.getItem("streak:count");
        var streakLast = localStorage.getItem("streak:lastVisit");
        var streakSave = localStorage.getItem("streak:saveAvailable");
        var streakSaveWeek = localStorage.getItem("streak:saveWeek");

        try {
            localStorage.clear();
        }
        catch (err) {
        }

        writeFlag(helpSeenKey, helpSeen);
        writeFlag(installDismissedKey, installDismissed);

        if (streakCount) localStorage.setItem("streak:count", streakCount);
        if (streakLast) localStorage.setItem("streak:lastVisit", streakLast);
        if (streakSave) localStorage.setItem("streak:saveAvailable", streakSave);
        if (streakSaveWeek) localStorage.setItem("streak:saveWeek", streakSaveWeek);

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