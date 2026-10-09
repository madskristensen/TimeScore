/*
 * Builds a square share card on a canvas and shares it with the Web Share API
 * (as an image file when supported, otherwise as text + link).
 */
var ShareService = (function () {

    var url = "https://gamethetime.fun/",
        font = '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        size = 1080;

    var rarityColors = {
        common: "#bfc8dd",
        rare: "#74c3ff",
        legendary: "#f8d986"
    };

    // data = { time, suffix, points, rules: [names], badge: {icon,name,rarity}|null, streak, collected, total }
    function getText(data) {
        if (data.points > 0) {
            var text = "I caught " + data.time + (data.suffix ? " " + data.suffix : "") + " for +" + data.points + " points";
            if (data.badge)
                text += " and the " + data.badge.icon + " " + data.badge.name + " badge";
            return text + " on Game The Time ⏰";
        }

        return "How many points is right now worth? ⏰ Game The Time";
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function fitText(ctx, text, maxWidth, weight, startSize) {
        var px = startSize;
        do {
            ctx.font = weight + " " + px + "px " + font;
            px -= 2;
        } while (ctx.measureText(text).width > maxWidth && px > 10);
    }

    function draw(data) {
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var cx = size / 2;

        var bg = ctx.createRadialGradient(size * .2, size * .2, 0, size * .2, size * .2, size * 1.1);
        bg.addColorStop(0, "#1f233f");
        bg.addColorStop(.45, "#0d1020");
        bg.addColorStop(1, "#050608");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);

        // Ring
        var ringY = 400, ringR = 270;
        ctx.lineWidth = 16;
        ctx.strokeStyle = "rgba(120, 146, 197, .28)";
        ctx.beginPath();
        ctx.arc(cx, ringY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        var progress = data.points > 0 ? Math.min(1, .25 + data.points / 16) : .25;
        var ringGradient = ctx.createLinearGradient(0, ringY - ringR, 0, ringY + ringR);
        ringGradient.addColorStop(0, "#9de5ff");
        ringGradient.addColorStop(1, "#eec04d");
        ctx.strokeStyle = ringGradient;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(96, 196, 255, .6)";
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(cx, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Time
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(165, 225, 255, .45)";
        ctx.shadowBlur = 30;
        fitText(ctx, data.time, ringR * 1.6, "700", 190);
        ctx.fillText(data.time, cx, ringY + 50);
        ctx.shadowBlur = 0;

        if (data.suffix) {
            ctx.font = "700 44px " + font;
            ctx.fillStyle = "#9fb2de";
            ctx.fillText(data.suffix, cx, ringY + 120);
        }

        // Points
        ctx.fillStyle = "#eec04d";
        ctx.shadowColor = "rgba(238, 192, 77, .5)";
        ctx.shadowBlur = 20;
        ctx.font = "800 84px " + font;
        ctx.fillText(data.points > 0 ? "+" + data.points + " points" : "Not all time is equal", cx, 770);
        ctx.shadowBlur = 0;

        // Rules or badge line
        var line = "";
        if (data.badge) {
            line = data.badge.icon + " " + data.badge.name;
            ctx.fillStyle = rarityColors[data.badge.rarity] || rarityColors.common;
        } else if (data.rules && data.rules.length) {
            line = data.rules.slice(0, 2).join(" + ");
            ctx.fillStyle = "#ffe7ac";
        }

        if (line) {
            fitText(ctx, line, size - 160, "600", 48);
            ctx.fillText(line, cx, 845);
        }

        // Footer pill
        var stats = [];
        if (data.streak > 0)
            stats.push("🔥 " + data.streak + "-day streak");
        if (data.total)
            stats.push(data.collected + "/" + data.total + " times");

        ctx.fillStyle = "rgba(7, 13, 28, .7)";
        roundRect(ctx, 90, 900, size - 180, 120, 28);
        ctx.fill();
        ctx.strokeStyle = "rgba(77, 97, 141, .5)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#dfe7fa";
        fitText(ctx, stats.join("  ·  ") || "Game The Time", size - 260, "600", 36);
        ctx.fillText(stats.join("  ·  ") || "Game The Time", cx, 950);
        ctx.fillStyle = "#8b9cc4";
        ctx.font = "600 32px " + font;
        ctx.fillText("gamethetime.fun", cx, 995);

        return canvas;
    }

    function toBlob(canvas) {
        return new Promise(function (resolve) {
            if (canvas.toBlob) {
                canvas.toBlob(function (blob) { resolve(blob); }, "image/png");
            } else {
                resolve(null);
            }
        });
    }

    // Prepares everything up front so the share button can call navigator.share
    // synchronously inside the tap (required by iOS Safari).
    function prepare(data) {
        var canvas = draw(data);
        var dataUrl = canvas.toDataURL("image/png");

        return toBlob(canvas).then(function (blob) {
            var file = null;
            try {
                if (blob && typeof File === "function")
                    file = new File([blob], "game-the-time.png", { type: "image/png" });
            }
            catch (e) {
            }

            return {
                dataUrl: dataUrl,
                file: file,
                text: getText(data),
                url: url
            };
        });
    }

    // Returns a promise resolving to "shared-image", "shared-link", "copied" or "cancelled".
    function share(prepared) {
        var files = prepared.file ? [prepared.file] : null;

        if (files && navigator.canShare && navigator.canShare({ files: files })) {
            return navigator.share({ files: files, title: "Game The Time", text: prepared.text + " " + prepared.url })
                .then(function () { return "shared-image"; }, function () { return "cancelled"; });
        }

        if (navigator.share) {
            return navigator.share({ title: "Game The Time", text: prepared.text, url: prepared.url })
                .then(function () { return "shared-link"; }, function () { return "cancelled"; });
        }

        return copy(prepared);
    }

    function copy(prepared) {
        var text = prepared.text + " " + prepared.url;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(function () { return "copied"; }, function () { return legacyCopy(text); });
        }

        return Promise.resolve(legacyCopy(text));
    }

    function legacyCopy(text) {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try {
            ok = document.execCommand("copy");
        }
        catch (e) {
        }
        document.body.removeChild(area);
        return ok ? "copied" : "cancelled";
    }

    return {
        getText: getText,
        draw: draw,
        prepare: prepare,
        share: share,
        copy: copy
    };
});
