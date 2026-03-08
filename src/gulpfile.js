/// <binding AfterBuild='default' ProjectOpened='watch' />

var gulp = require("gulp"),
    concat = require("gulp-concat");

function concatTask() {
    return gulp.src(["./assets/js/badgeService.js", "./assets/js/highscoreService.js", "./assets/js/timescore.js", "./assets/js/dom.js", "./assets/js/appcacheHandler.js"])
        .pipe(concat("all.js"))
        .pipe(gulp.dest("./assets/dist"));
}

function watchTask() {
    gulp.watch("./assets/js/*", gulp.series(concatTask));
}

var build = gulp.series(concatTask);

exports.concat = concatTask;
exports.default = build;
exports.watch = gulp.series(build, watchTask);
