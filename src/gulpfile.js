/// <binding AfterBuild='default' ProjectOpened='watch' />

var gulp = require("gulp"),
    manifest = require("gulp-cache-manifest"),
    concat = require("gulp-concat");

gulp.task("default", ["concat", "manifest"]);


gulp.task("concat", function () {
    gulp.src(["./assets/js/timescore.js", "./assets/js/highscore.js", "./assets/js/dom.js"])
        .pipe(concat("all.js"))
        .pipe(gulp.dest("./assets/dist"))
});

gulp.task("manifest", function () {
    gulp.src(['./assets/{dist,css}/*'])
    .pipe(manifest({
        hash: true,
        relativePath: "assets",
        preferOnline: false,
        network: ["http://*"],
        filename: "manifest.appcache",
        exclude: ["manifest.appcache"]
    }))
    .pipe(gulp.dest('./'));
});

gulp.task("watch", ["concat", "manifest"], function () {
    gulp.watch("./assets/js/*", ["manifest", "concat"]);
    gulp.watch("./assets/css/*", ["manifest"]);
});