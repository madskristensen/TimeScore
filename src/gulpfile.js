﻿/// <binding AfterBuild='default' ProjectOpened='watch' />

var gulp = require("gulp"),
    manifest = require("gulp-cache-manifest"),
    concat = require("gulp-concat");

gulp.task("default", ["concat", "manifest"]);


gulp.task("concat", function () {
    gulp.src(["./assets/js/badgeService.js", "./assets/js/highscoreService.js", "./assets/js/timescore.js", "./assets/js/dom.js", "./assets/js/appcacheHandler.js"])
        .pipe(concat("all.js"))
        .pipe(gulp.dest("./assets/dist"))
});

gulp.task("manifest", function () {
    gulp.src(["./assets/{dist,css,img}/*.{js,css,svg}", "./index.html", "web.config"])
    .pipe(manifest({
        timestamp: true,
        relativePath: "/assets",
        preferOnline: true,
        network: ["*"],
        filename: "manifest.appcache",

        exclude: ["index.html", "web.config"]
    }))
    .pipe(gulp.dest('./'));
});

gulp.task("watch", ["concat", "manifest"], function () {
    gulp.watch("./assets/js/*", ["concat", "manifest"]);
    gulp.watch("./assets/css/*", ["manifest"]);
    gulp.watch(["./index.html", "./web.config", "./assets/img/*"], ["manifest"]);
});