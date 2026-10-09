/// <reference path="badgeService.js" />
/// <reference path="highscoreService.js" />
/// <reference path="streakService.js" />
/// <reference path="dailyChallengeService.js" />
/// <reference path="collectionService.js" />
/// <reference path="shareService.js" />
/// <reference path="timescore.js" />

(function () {

    function $(id) {
        return document.getElementById(id);
    }

    var elmTime = $("time"),
        elmAmPm = $("ampm"),
        elmFaceHint = $("faceHint"),
        elmTimeContainer = $("timeContainer"),
        elmRules = $("rules"),
        elmRingProgress = $("ringProgress"),
        elmRingProgressGold = $("ringProgressGold"),
        elmRingHead = $("ringHead"),
        elmRingHeadTrail = $("ringHeadTrail"),
        elmCurrentScore = $("currentScore"),
        elmCurrentScoreValue = $("currentScoreValue"),
        elmAnnouncer = $("announcer"),
        elmToasts = $("toasts"),
        elmInstallApp = $("installApp"),
        elmClockFace = $("clockFace"),
        elmClockMode = $("clockMode"),
        elmStreak = $("streak"),
        elmStreakCount = $("streakCount"),
        elmStreakSave = $("streakSave"),
        elmStreakHint = $("streakHint"),
        elmChallenge = $("challenge"),
        elmChallengeDesc = $("challengeDesc"),
        elmChallengeBar = $("challengeBar"),
        elmChallengeStatus = $("challengeStatus"),
        elmChallengeHistory = $("challengeHistory"),
        elmBadgeGrid = $("badgeGrid"),
        elmBadgeDetail = $("badgeDetail"),
        elmBadgesTitle = $("badgesTitle"),
        ts = new TimeScore(),
        hs = new HighscoreService(),
        badgeService = new BadgeService(),
        streakService = new StreakService(),
        challengeService = new DailyChallengeService(),
        collectionService = new CollectionService(),
        shareService = new ShareService(),
        ruleElementsById = {},
        elmScoreToast = null,
        ringCircumference = 0,
        ringRadius = 106,
        ringCenter = 130,
        ringHeadX = ringCenter + ringRadius,
        ringHeadY = ringCenter,
        ringTrailX = ringCenter + ringRadius,
        ringTrailY = ringCenter,
        lastWholeSecond = null,
        lastResult = null,
        clockPref = window.GTT.clockPref(),
        current = new Date(),
        currentDay = streakService.getDateString(current),
        selectedBadgeId = null;

    var helpSeenKey = "timescoreHelpSeen",
        installDismissedKey = "timescoreInstallDismissed",
        clockPrefKey = "pref:clock",
        deferredInstallPrompt = null,
        hasEngaged = false,
        isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    var reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null,
        prefersReducedMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

    var rarityLabels = { common: "Common", rare: "Rare", legendary: "Legendary" };

    /* ---------- Clock ---------- */

    function renderClock(date) {
        var f = window.GTT.format(date, clockPref);
        // Only touch the DOM when the text actually changes: rewriting the same
        // text creates a new LCP candidate and forces a fresh layout.
        if (elmTime.textContent !== f.time) {
            elmTime.textContent = f.time;
            if (!window.ResizeObserver)
                fitTimeToRing();
        }
        if (elmAmPm.textContent !== f.suffix)
            elmAmPm.textContent = f.suffix;
        if (elmFaceHint.textContent !== f.hint)
            elmFaceHint.textContent = f.hint;
    }

    function formatKey(key) {
        var parts = key.split(":");
        return window.GTT.format(new Date(2000, 0, 1, +parts[0], +parts[1]), clockPref);
    }

    function formatHourLabel(hour) {
        if (clockPref === "24")
            return String(hour).padStart(2, "0") + ":00";

        return (hour % 12 || 12) + " " + (hour < 12 ? "AM" : "PM");
    }

    // Scales the time down when its glyph box would reach the ring. The time is
    // centred in the ring, so its corners must stay inside the ring's inner edge
    // (radius 103/260 of the container, minus padding). Digits occupy ~0.72em of
    // the 1em line box. Sizes come from layout (offsetWidth/ResizeObserver ignore
    // transforms), so there's no need to reset the scale before measuring.
    function applyTimeScale(timeWidth, containerWidth, timeHeight) {
        var radius = containerWidth * (103 / 260) - Math.max(8, containerWidth * 0.04);
        var halfW = timeWidth / 2,
            halfH = (timeHeight || 0) * 0.38;
        var reach = Math.sqrt(halfW * halfW + halfH * halfH);
        var scale = reach > radius ? (radius / reach) : 1;
        var value = "scale(" + scale.toFixed(3) + ")";

        if (elmTime.style.transform !== value)
            elmTime.style.transform = value;
    }

    function fitTimeToRing() {
        applyTimeScale(elmTime.offsetWidth, elmTimeContainer.clientWidth, elmTime.offsetHeight);
    }

    // ResizeObserver reports sizes after layout, so fitting the time never forces a
    // synchronous reflow (it fires on first layout, text changes and resizes).
    function observeTimeSize() {
        if (!window.ResizeObserver) {
            fitTimeToRing();
                    return;
        }

        var sizes = { time: 0, timeHeight: 0, container: 0 };
        var observer = new ResizeObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                var box = entries[i].borderBoxSize && entries[i].borderBoxSize[0];
                var width = box ? box.inlineSize : entries[i].contentRect.width;
                if (entries[i].target === elmTime) {
                    sizes.time = width;
                    sizes.timeHeight = box ? box.blockSize : entries[i].contentRect.height;
                }
                else
                    sizes.container = width;
            }

            if (sizes.time && sizes.container)
                applyTimeScale(sizes.time, sizes.container, sizes.timeHeight);
        });

        observer.observe(elmTime);
        observer.observe(elmTimeContainer);
    }

    function renderClockMode() {
        window.GTT.renderMode(clockPref);
    }

    // Restarts a one-shot CSS animation class. Reading offsetWidth here is a
    // deliberate, user-initiated reflow (a click), never on the load path.
    function replayClass(elm, className, duration) {
        elm.classList.remove(className);
        void elm.offsetWidth;
        elm.classList.add(className);
        clearTimeout(elm["_" + className]);
        elm["_" + className] = setTimeout(function () {
            elm.classList.remove(className);
        }, duration);
    }

    function switchClockFormat() {
        clockPref = clockPref === "24" ? "12" : "24";
        try {
            localStorage.setItem(clockPrefKey, clockPref);
        }
        catch (err) {
        }

        renderClockMode();
        renderClock(current);
        replayClass(elmTime, "switching", 300);
        replayClass(elmClockMode, "flash", 1200);
        announce(clockPref === "24" ? "24-hour clock" : "12-hour clock");
    }

    /* ---------- Scoring ---------- */

    // Handles the current minute. Every side effect (celebration, streak, badges,
    // collection, challenge) runs only the first time a minute is recorded, so
    // reloading during a scoring minute never double counts.
    function processMinute(date) {
        var result = ts.getScore(date),
            activeRuleIds = {};

        lastResult = result;
        renderClock(date);

        for (var i = 0; i < result.score.length; i++) {
            activeRuleIds[result.score[i].id] = true;
        }

        updateRuleStates(activeRuleIds);
        renderCurrentScore(result.points);

        // The seconds ring glows gold for the whole of a scoring minute.
        toggleClass(elmTimeContainer, "scoring", result.points > 0);

        if (result.points <= 0)
            return;

        markEngaged();

        if (!hs.recordScore(date, result.points))
            return;

        var unlocked = [];
        var momentBadge = null;

        for (var j = 0; j < result.score.length; j++) {
            if (result.score[j].badge) {
                momentBadge = result.score[j].badge;
                var added = badgeService.addBadge(momentBadge);
                if (added && added.isNew)
                    unlocked.push(added);
            }
        }

        var f = window.GTT.format(date, clockPref);
        collectionService.record(date, result.points, {
            time: f.time,
            suffix: f.suffix,
            points: result.points,
            rules: result.score.map(function (h) { return h.rule; }),
            badge: momentBadge ? { id: momentBadge.id, icon: momentBadge.icon, name: momentBadge.name, rarity: momentBadge.rarity } : null
        });

        streakService.recordScoringDay(date);
        challengeService.recordProgress(date, result.score, result.points);
        unlocked = unlocked.concat(badgeService.awardTiers(hs.getScore(date).weekly));

        triggerCelebration();
        showScoreToast(result.points);
        announce(f.time + (f.suffix ? " " + f.suffix : "") + ". Plus " + result.points + (result.points === 1 ? " point: " : " points: ") +
            result.score.map(function (h) { return h.rule; }).join(", ") + ".");

        for (var k = 0; k < unlocked.length; k++) {
            showBadgeToast(unlocked[k].badge, k * 900);
        }

        refreshPanels();
    }

    function renderCurrentScore(points) {
        if (points > 0) {
            elmCurrentScoreValue.textContent = "+" + points;
            elmCurrentScore.className = "";
        } else {
            elmCurrentScore.className = "hidden";
        }
    }

    function initializeScoreFeedback() {
        elmScoreToast = document.createElement("span");
        elmScoreToast.id = "scoreToast";
        elmScoreToast.className = "scoreToast";
        elmScoreToast.setAttribute("aria-hidden", "true");
        elmTimeContainer.appendChild(elmScoreToast);
    }

    function showScoreToast(points) {
        elmScoreToast.textContent = "+" + points;
        elmScoreToast.className = "scoreToast";
        void elmScoreToast.offsetWidth;
        elmScoreToast.className = "scoreToast show";
    }

    function toggleClass(el, name, on) {
        if (el.classList)
            el.classList.toggle(name, !!on);
    }

    function triggerCelebration() {
        toggleClass(document.body, "celebrate", false);
        void document.body.offsetWidth;
        toggleClass(document.body, "celebrate", true);

        window.clearTimeout(triggerCelebration._timer);
        triggerCelebration._timer = window.setTimeout(function () {
            toggleClass(document.body, "celebrate", false);
        }, 500);
    }

    function announce(text) {
        elmAnnouncer.textContent = "";
        window.setTimeout(function () {
            elmAnnouncer.textContent = text;
        }, 50);
    }

    function showRules() {
        for (var name in ts.rules) {
            var rule = ts.rules[name];

            var li = document.createElement("li");
            li.className = "ruleRow muted";
            li.id = rule.id;
            li.title = rule.hint || "";

            var pointSpan = document.createElement("span");
            pointSpan.className = "rulePoints";
            pointSpan.textContent = rule.points + "pt";
            li.appendChild(pointSpan);

            var textSpan = document.createElement("span");
            textSpan.className = "ruleText";
            textSpan.textContent = rule.rule;
            li.appendChild(textSpan);

            ruleElementsById[rule.id] = li;
            elmRules.appendChild(li);
        }
    }

    function updateRuleStates(activeRuleIds) {
        for (var id in ruleElementsById) {
            if (ruleElementsById.hasOwnProperty(id)) {
                ruleElementsById[id].className = activeRuleIds[id] ? "ruleRow active" : "ruleRow muted";
            }
        }
    }

    /* ---------- Panels ---------- */

    function refreshPanels() {
        updateHighscore();
        updateStreak();
        updateChallenge();
        updateCollection();
        updateBadges();
    }

    function updateHighscore() {
        var score = hs.getScore(current);
        $("daily").firstElementChild.textContent = score.daily;
        $("weekly").firstElementChild.textContent = score.weekly;
    }

    function updateStreak() {
        var now = new Date();
        var count = streakService.getStreak(now);
        var scoredToday = streakService.hasScoredToday(now);

        elmStreakCount.textContent = count;
        elmStreakSave.className = streakService.hasStreakSave() ? "" : "hidden";
        elmStreak.className = count > 0 && !scoredToday ? "atRisk" : "";

        if (count === 0)
            elmStreakHint.textContent = "Score a point to start a streak";
        else if (!scoredToday)
            elmStreakHint.textContent = "Score a point today to keep it going";
        else
            elmStreakHint.textContent = "";
    }

    function updateChallenge() {
        var challenge = challengeService.getChallenge(current);

        elmChallengeDesc.textContent = challenge.description;
        elmChallengeBar.style.width = Math.min(challenge.progress / challenge.target * 100, 100) + "%";

        if (challenge.completed) {
            elmChallengeStatus.textContent = "\u2714 Completed!";
            elmChallenge.className = "challengeComplete";
        } else {
            elmChallengeStatus.textContent = challenge.progress + " / " + challenge.target;
            elmChallenge.className = "";
        }

        var history = challengeService.getHistory().slice(0, 7).reverse();
        elmChallengeHistory.innerHTML = "";

        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            var parts = String(entry.date).split("-");
            var label = new Date(+parts[0], +parts[1] - 1, +parts[2]).toLocaleDateString(undefined, { weekday: "short" });
            var li = document.createElement("li");
            li.className = entry.completed ? "done" : "";
            li.textContent = entry.completed ? "\u2714" : "\u2715";
            li.title = label + ": " + entry.name + (entry.completed ? " (completed)" : " (missed)");
            li.setAttribute("aria-label", li.title);
            elmChallengeHistory.appendChild(li);
        }

        elmChallengeHistory.className = history.length ? "" : "hidden";
    }

    function getCollectionProgress() {
        return collectionService.getProgress(ts.getCollectibleMinutes(current));
    }

    function updateCollection() {
        var progress = getCollectionProgress();
        $("collectedCount").textContent = progress.collected;
        $("collectibleTotal").textContent = progress.total;
        $("collectionBar").style.width = (progress.total ? progress.collected / progress.total * 100 : 0) + "%";
    }

    function renderCollectionModal() {
        var progress = getCollectionProgress();
        var list = $("collectionHours");
        list.innerHTML = "";

        $("collectionModalLead").textContent = progress.collected + " of " + progress.total + " scoring times collected · " +
            collectionService.getLifetimePoints() + " lifetime points";

        for (var h = 0; h < 24; h++) {
            var bucket = progress.byHour[h];
            var li = document.createElement("li");

            var label = document.createElement("span");
            label.className = "hourLabel";
            label.textContent = formatHourLabel(h);
            li.appendChild(label);

            var chips = document.createElement("span");
            chips.className = "hourChips";

            for (var i = 0; i < bucket.collected.length; i++) {
                var f = formatKey(bucket.collected[i]);
                var chip = document.createElement("span");
                chip.className = "chip";
                chip.textContent = f.time;
                chips.appendChild(chip);
            }

            var locked = bucket.total - bucket.collected.length;
            if (locked > 0) {
                var lockedChip = document.createElement("span");
                lockedChip.className = "chip locked";
                lockedChip.textContent = "🔒 " + locked;
                lockedChip.setAttribute("aria-label", locked + " still locked");
                chips.appendChild(lockedChip);
            }

            li.appendChild(chips);

            var count = document.createElement("span");
            count.className = "hourCount";
            count.textContent = bucket.collected.length + "/" + bucket.total;
            li.appendChild(count);

            list.appendChild(li);
        }
    }

    function updateBadges() {
        var all = badgeService.getAllBadges();
        var earned = all.filter(function (b) { return b.count > 0; }).length;

        elmBadgesTitle.textContent = "Badges · " + earned + " of " + all.length;
        elmBadgeGrid.innerHTML = "";

        for (var i = 0; i < all.length; i++) {
            elmBadgeGrid.appendChild(createBadgeButton(all[i]));
        }
    }

    function createBadgeButton(badge) {
        var isEarned = badge.count > 0;
        var rarity = badge.rarity || "common";
        var button = document.createElement("button");
        button.type = "button";
        button.id = "badge-" + badge.id;
        button.className = "badge rarity-" + rarity + (isEarned ? "" : " locked") + (selectedBadgeId === badge.id ? " selected" : "");

        var icon = document.createElement("span");
        icon.className = "badgeIcon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = badge.icon || "🏅";
        button.appendChild(icon);

        var name = document.createElement("span");
        name.className = "badgeName";
        name.textContent = isEarned ? badge.name : "Locked";
        button.appendChild(name);

        if (isEarned && badge.count > 1) {
            var count = document.createElement("span");
            count.className = "badgeCount";
            count.textContent = "\u00d7" + badge.count;
            button.appendChild(count);
        }

        button.setAttribute("aria-label", isEarned
            ? badge.name + ", " + rarityLabels[rarity] + " badge" + (badge.count > 1 ? ", earned " + badge.count + " times" : "")
            : "Locked " + rarityLabels[rarity] + " badge");

        button.addEventListener("click", function () {
            selectedBadgeId = badge.id;
            var buttons = elmBadgeGrid.querySelectorAll(".badge");
            for (var i = 0; i < buttons.length; i++) {
                toggleClass(buttons[i], "selected", buttons[i] === button);
            }

            elmBadgeDetail.textContent = isEarned
                ? (badge.icon + " " + badge.name + " (" + rarityLabels[rarity] + "): " + (/[.!?]$/.test(badge.description) ? badge.description : badge.description + ".") + (badge.count > 1 ? " Earned " + badge.count + " times." : ""))
                : ("A locked " + rarityLabels[rarity].toLowerCase() + " badge. Keep watching the clock to discover it.");
        });

        return button;
    }

    /* ---------- Toasts ---------- */

    // options: { id, icon, title, text, actionLabel, onAction, duration (ms, 0 = sticky), className, delay }
    function showToast(options) {
        var render = function () {
            if (options.id && $(options.id))
                return;

            var toast = document.createElement("div");
            toast.className = "toast" + (options.className ? " " + options.className : "");
            toast.setAttribute("role", "status");
            if (options.id)
                toast.id = options.id;

            if (options.icon) {
                var icon = document.createElement("span");
                icon.className = "toastIcon";
                icon.setAttribute("aria-hidden", "true");
                icon.textContent = options.icon;
                toast.appendChild(icon);
            }

            var body = document.createElement("span");
            var title = document.createElement("span");
            title.className = "toastTitle";
            title.textContent = options.title || "";
            body.appendChild(title);
            var text = document.createElement("span");
            text.className = "toastText";
            text.textContent = options.text || "";
            body.appendChild(text);
            toast.appendChild(body);

            var dismiss = function () {
                toggleClass(toast, "leaving", true);
                window.setTimeout(function () {
                    if (toast.parentNode)
                        toast.parentNode.removeChild(toast);
                }, 260);
            };

            if (options.actionLabel) {
                var action = document.createElement("button");
                action.type = "button";
                action.textContent = options.actionLabel;
                action.addEventListener("click", function () {
                    dismiss();
                    if (options.onAction)
                        options.onAction();
                });
                toast.appendChild(action);
            }

            elmToasts.appendChild(toast);

            var duration = options.duration === undefined ? 4500 : options.duration;
            if (duration > 0)
                window.setTimeout(dismiss, duration);
        };

        if (options.delay)
            window.setTimeout(render, options.delay);
        else
            render();
    }

    window.showToast = showToast;

    function showBadgeToast(badge, delay) {
        var rarity = badge.rarity || "common";
        showToast({
            icon: badge.icon || "🏅",
            title: rarityLabels[rarity] + " badge unlocked",
            text: badge.name,
            className: "badgeToast rarity-" + rarity,
            duration: 5000,
            delay: delay
        });
    }

    /* ---------- Ring ---------- */

    function initializeTimeRing() {
        ringRadius = parseFloat(elmRingProgress.getAttribute("r")) || 106;
        ringCircumference = 2 * Math.PI * ringRadius;
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

        elmRingProgress.style.strokeDasharray = visibleLength + " " + ringCircumference;
        elmRingProgress.style.strokeDashoffset = 0;
        elmRingProgressGold.style.strokeDasharray = elmRingProgress.style.strokeDasharray;

        elmRingHeadTrail.setAttribute("cx", ringTrailX);
        elmRingHeadTrail.setAttribute("cy", ringTrailY);
        elmRingHeadTrail.style.opacity = secondPercent > 0.003 ? "0.65" : "0.25";

        elmRingHead.setAttribute("cx", ringHeadX);
        elmRingHead.setAttribute("cy", ringHeadY);
        elmRingHead.style.opacity = secondPercent > 0.003 ? "0.95" : "0.35";
    }

    function triggerMinutePulse() {
        toggleClass(elmTimeContainer, "minutePulse", false);
        void elmTimeContainer.offsetWidth;
        toggleClass(elmTimeContainer, "minutePulse", true);

        window.clearTimeout(triggerMinutePulse._timer);
        triggerMinutePulse._timer = window.setTimeout(function () {
            toggleClass(elmTimeContainer, "minutePulse", false);
        }, 360);
    }

    function startRingAnimation() {
        function secondsNow(now) {
            return prefersReducedMotion ? now.getSeconds() : now.getSeconds() + (now.getMilliseconds() / 1000);
        }

        function schedule() {
            if (prefersReducedMotion)
                window.setTimeout(frame, 250);
            else
                window.requestAnimationFrame(frame);
        }

        function frame() {
            var now = new Date();
            var wholeSeconds = now.getSeconds();

            if (!prefersReducedMotion && lastWholeSecond !== null && wholeSeconds < lastWholeSecond) {
                triggerMinutePulse();
            }

            lastWholeSecond = wholeSeconds;
            setSecondProgress(secondsNow(now));
            schedule();
        }

        var now = new Date();
        lastWholeSecond = now.getSeconds();
        ringTrailX = ringCenter + Math.cos(now.getSeconds() / 60 * 2 * Math.PI) * ringRadius;
        ringTrailY = ringCenter + Math.sin(now.getSeconds() / 60 * 2 * Math.PI) * ringRadius;
        setSecondProgress(secondsNow(now));
        schedule();
    }

    /* ---------- Modals (focus trap + Escape) ---------- */

    var openModalStack = [];

    function focusableIn(container) {
        return Array.prototype.filter.call(
            container.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"),
            function (el) { return !el.disabled && el.offsetParent !== null; });
    }

    function openModal(modal) {
        if (!modal.classList.contains("hidden"))
            return;

        openModalStack.push({ modal: modal, returnFocus: document.activeElement });
        modal.classList.remove("hidden");

        var focusable = focusableIn(modal);
        if (focusable.length)
            focusable[0].focus();
    }

    function closeModal(modal) {
        if (modal.classList.contains("hidden"))
            return;

        modal.classList.add("hidden");

        for (var i = openModalStack.length - 1; i >= 0; i--) {
            if (openModalStack[i].modal === modal) {
                var entry = openModalStack.splice(i, 1)[0];
                if (entry.returnFocus && entry.returnFocus.focus)
                    entry.returnFocus.focus();
                break;
            }
        }

        if (modal.id === "helpModal")
            writeFlag(helpSeenKey, true);

        if (modal.id === "installModal") {
            writeFlag(installDismissedKey, true);
            updateInstallButton();
        }
    }

    document.addEventListener("keydown", function (e) {
        var top = openModalStack[openModalStack.length - 1];
        if (!top)
            return;

        if (e.key === "Escape" || e.key === "Esc") {
            e.preventDefault();
            closeModal(top.modal);
            return;
        }

        if (e.key === "Tab") {
            var focusable = focusableIn(top.modal);
            if (!focusable.length) {
                e.preventDefault();
                return;
            }

            var first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && (document.activeElement === first || !top.modal.contains(document.activeElement))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (document.activeElement === last || !top.modal.contains(document.activeElement))) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // Tapping the dimmed backdrop closes a modal too.
    Array.prototype.forEach.call(document.querySelectorAll(".modal"), function (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal)
                closeModal(modal);
        });
    });

    /* ---------- Share ---------- */

    var preparedShare = null;

    function getShareData() {
        var progress = getCollectionProgress();
        var base = {
            streak: streakService.getStreak(new Date()),
            collected: progress.collected,
            total: progress.total
        };

        if (lastResult && lastResult.points > 0) {
            var f = window.GTT.format(current, clockPref);
            var badgeHit = lastResult.score.filter(function (h) { return h.badge; })[0];
            return Object.assign(base, {
                time: f.time,
                suffix: f.suffix,
                points: lastResult.points,
                rules: lastResult.score.map(function (h) { return h.rule; }),
                badge: badgeHit ? badgeHit.badge : null
            });
        }

        var last = collectionService.getLast();
        if (last && last.points > 0) {
            return Object.assign(base, {
                time: last.time,
                suffix: last.suffix,
                points: last.points,
                rules: last.rules || [],
                badge: last.badge || null
            });
        }

        var now = window.GTT.format(current, clockPref);
        return Object.assign(base, { time: now.time, suffix: now.suffix, points: 0, rules: [], badge: null });
    }

    function openShare() {
        var data = getShareData();
        var modal = $("shareModal");

        $("shareLead").textContent = data.points > 0
            ? "Your " + data.time + (data.suffix ? " " + data.suffix : "") + " catch, worth +" + data.points + " points."
            : "Invite a friend to game the time.";

        preparedShare = null;
        $("shareNow").disabled = true;

        shareService.prepare(data).then(function (prepared) {
            preparedShare = prepared;
            $("sharePreview").src = prepared.dataUrl;
            $("sharePreview").alt = prepared.text;
            $("shareDownload").href = prepared.dataUrl;
            $("shareNow").disabled = false;
            $("shareNow").textContent = navigator.share ? "Share" : "Copy link";
            $("shareCopy").className = navigator.share ? "" : "hidden";
        });

        openModal(modal);
    }

    function shareFeedback(outcome) {
        if (outcome === "copied")
            showToast({ icon: "📋", title: "Copied", text: "Share text copied to clipboard", duration: 2500 });
    }

    /* ---------- Install ---------- */

    function readFlag(key) {
        var value = null;

        try {
            value = window.localStorage.getItem(key);
        }
        catch (e) {
        }

        if (value === null)
            value = readCookie(key);

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
            if (entry.indexOf(prefix) === 0)
                return entry.substring(prefix.length);
        }

        return null;
    }

    function writeCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/; SameSite=Lax";
    }

    function isStandalone() {
        var displayMode = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
        return !!displayMode || window.navigator.standalone === true;
    }

    function markEngaged() {
        if (hasEngaged)
            return;

        hasEngaged = true;
        updateInstallButton();
    }

    function updateInstallButton() {
        var shouldShow = hasEngaged && !isStandalone() && !readFlag(installDismissedKey) && (isIOS || !!deferredInstallPrompt);
        elmInstallApp.className = "pill pillButton" + (shouldShow ? "" : " hidden");
    }

    /* ---------- Wiring ---------- */

    function onTick() {
        var date = new Date();

        if (document.hidden)
            return;

        var day = streakService.getDateString(date);
        if (day !== currentDay) {
            // Midnight while the app is open: new challenge, streak status and 24h totals.
            currentDay = day;
            current = date;
            refreshPanels();
        }

        if (date.getHours() !== current.getHours() || date.getMinutes() !== current.getMinutes()) {
            current = date;
            processMinute(current);
        }
    }

    if (reducedMotionQuery) {
        var onReducedMotionChange = function (e) {
            prefersReducedMotion = !!e.matches;
            ringTrailX = ringHeadX;
            ringTrailY = ringHeadY;
        };

        if (typeof reducedMotionQuery.addEventListener === "function")
            reducedMotionQuery.addEventListener("change", onReducedMotionChange);
        else if (typeof reducedMotionQuery.addListener === "function")
            reducedMotionQuery.addListener(onReducedMotionChange);
    }

    // 1. Everything needed for the clock itself, synchronously.
    initializeScoreFeedback();
    observeTimeSize();
    initializeTimeRing();
    startRingAnimation();
    renderClockMode();
    showRules();
    processMinute(current);

    // 2. Storage-heavy panels only after the clock has been painted:
    //    requestAnimationFrame runs right before the first paint, and the
    //    timeout queued from it runs right after that paint.
    function afterFirstPaint(fn) {
        if (window.requestAnimationFrame && !document.hidden)
            window.requestAnimationFrame(function () { window.setTimeout(fn, 0); });
        else
            window.setTimeout(fn, 0);
    }

    afterFirstPaint(function () {
        try {
            updateHighscore();          // also migrates legacy score keys
            collectionService.migrate();
            refreshPanels();
        }
        finally {
            // Reveal the panels only once they hold real content, so nothing below the
            // clock shifts while it fills in (site.css also has to be loaded).
            document.body.classList.add("ready");
            restoreScroll();
        }
    });

    // Scroll restoration is manual (set in index.html): a reload returns to exactly
    // where the player was once the full layout exists; any other visit starts at the top.
    var scrollKey = "gtt:scrollY";

    function isReload() {
        try {
            var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
            if (nav)
                return nav.type === "reload";
            return performance.navigation && performance.navigation.type === 1;
        }
        catch (e) {
            return false;
        }
    }

    function restoreScroll() {
        var y = 0;
        try {
            if (isReload())
                y = parseInt(sessionStorage.getItem(scrollKey), 10) || 0;
            sessionStorage.removeItem(scrollKey);
        }
        catch (e) {
        }

        if (window.scrollY !== y)
            window.scrollTo(0, y);
    }

    window.addEventListener("pagehide", function () {
        try {
            sessionStorage.setItem(scrollKey, String(Math.round(window.scrollY)));
        }
        catch (e) {
        }
    });

    window.setTimeout(markEngaged, 45000);
    window.setTimeout(function () {
        if (!readFlag(helpSeenKey)) {
            writeFlag(helpSeenKey, true);
            openModal($("helpModal"));
        }
    }, 1200);

    window.setInterval(onTick, 1000);
    document.addEventListener("visibilitychange", onTick);

    elmClockFace.addEventListener("click", switchClockFormat);

    $("reset").addEventListener("click", function () {
        if (!confirm("This will reset your scores, badges, challenge and collection. Are you sure?"))
            return;

        var keep = {};
        ["streak:count", "streak:lastVisit", "streak:saveAvailable", "streak:saveWeek", clockPrefKey].forEach(function (key) {
            keep[key] = localStorage.getItem(key);
        });
        var helpSeen = readFlag(helpSeenKey);
        var installDismissed = readFlag(installDismissedKey);

        try {
            localStorage.clear();
        }
        catch (err) {
        }

        writeFlag(helpSeenKey, helpSeen);
        writeFlag(installDismissedKey, installDismissed);

        for (var key in keep) {
            if (keep[key] !== null)
                localStorage.setItem(key, keep[key]);
        }

        localStorage.setItem("collection:migrated", "1");
        refreshPanels();
    });

    $("howToPlay").addEventListener("click", function () { openModal($("helpModal")); });
    $("closeHelp").addEventListener("click", function () { closeModal($("helpModal")); });
    $("closeInstall").addEventListener("click", function () { closeModal($("installModal")); });
    $("openCollection").addEventListener("click", function () {
        renderCollectionModal();
        openModal($("collectionModal"));
    });
    $("closeCollection").addEventListener("click", function () { closeModal($("collectionModal")); });
    $("shareButton").addEventListener("click", openShare);
    $("closeShare").addEventListener("click", function () { closeModal($("shareModal")); });

    $("shareNow").addEventListener("click", function () {
        if (!preparedShare)
            return;

        shareService.share(preparedShare).then(shareFeedback);
    });

    $("shareCopy").addEventListener("click", function () {
        if (!preparedShare)
            return;

        shareService.copy(preparedShare).then(shareFeedback);
    });

    elmInstallApp.addEventListener("click", function () {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(function (choice) {
                if (!choice || choice.outcome !== "accepted")
                    writeFlag(installDismissedKey, true);

                deferredInstallPrompt = null;
                updateInstallButton();
            });
            return;
        }

        if (isIOS)
            openModal($("installModal"));
    });

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

    document.addEventListener("touchstart", function () { }, { passive: true });

    // Test/screenshot hook: lets the headless checks drive a specific minute.
    window.GTT.simulate = function (date) {
        current = date;
        currentDay = streakService.getDateString(date);
        processMinute(date);
    };

})();
