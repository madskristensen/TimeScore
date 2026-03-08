/// <binding AfterBuild='default' ProjectOpened='watch' />

var gulp = require("gulp"),
    concat = require("gulp-concat");
var fs = require("fs");
var path = require("path");

function concatTask() {
    return gulp.src(["./assets/js/badgeService.js", "./assets/js/highscoreService.js", "./assets/js/timescore.js", "./assets/js/dom.js", "./assets/js/appcacheHandler.js"])
        .pipe(concat("all.js"))
        .pipe(gulp.dest("./assets/dist"));
}

async function manifestTask() {
    var cacheEntries = [];
    var sources = [
        { folder: "dist", extensions: [".js"] },
        { folder: "css", extensions: [".css"] },
        { folder: "img", extensions: [".svg"] }
    ];

    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];
        var directoryPath = path.join(__dirname, "assets", source.folder);
        var files;

        try {
            files = await fs.promises.readdir(directoryPath, { withFileTypes: true });
        } catch (error) {
            if (error && error.code === "ENOENT") {
                continue;
            }

            throw error;
        }

        for (var j = 0; j < files.length; j++) {
            var file = files[j];
            var extension = path.extname(file.name).toLowerCase();

            if (!file.isFile() || source.extensions.indexOf(extension) === -1) {
                continue;
            }

            cacheEntries.push("/assets/" + source.folder + "/" + encodeURI(file.name));
        }
    }

    var manifestContent = [
        "CACHE MANIFEST",
        "# Time: " + new Date(),
        "",
        "",
        "CACHE:",
        cacheEntries.join("\n"),
        "",
        "",
        "NETWORK:",
        "*",
        "",
        "",
        "SETTINGS:",
        "prefer-online",
        ""
    ].join("\n");

    await fs.promises.writeFile(path.join(__dirname, "manifest.appcache"), manifestContent, "utf8");
}

function watchTask() {
    gulp.watch("./assets/js/*", gulp.series(concatTask, manifestTask));
    gulp.watch("./assets/css/*", gulp.series(manifestTask));
    gulp.watch(["./index.html", "./web.config", "./assets/img/*"], gulp.series(manifestTask));
}

var build = gulp.series(concatTask, manifestTask);

exports.concat = concatTask;
exports.manifest = manifestTask;
exports.default = build;
exports.watch = gulp.series(build, watchTask);
