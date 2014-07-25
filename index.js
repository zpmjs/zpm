
var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautify");
var replace = require("gulp-replace");
var zip = require("gulp-zip");
var del = require("del");

exports.build = function(cwd){
  var pkg = require(cwd + "/package.json");

  if (!pkg || !pkg.spm){return;}

  var name = pkg.name;
  var version = pkg.version;
  var main_file = pkg.spm.main;
  var main = main_file.replace(/\.js$/, "");
  var debug_file = main + "-debug.js";

  var dist_dir = "dist";

  del(dist_dir, function(){

    // build
    gulp.src(["./template/intro.js", cwd + "/" + main_file, "./template/outro.js"])
      .pipe(concat(main_file))
      .pipe(replace('"{MODULE_ID}"', '"' + [name, version, main].join("/") + '"'))
      .pipe(replace('"{MODULE_DEPS}"', '[]'))
      //TODO: replace requires.
      //.pipe(replace(/\brequire\s*\((["'])[^\1]*\1\)/, 'require("' + ''")'))
      .pipe(uglify())
      .pipe(gulp.dest([dist_dir, name, version].join("/")));

    // build-debug
    gulp.src(["./template/intro.js", cwd + "/" + main_file, "./template/outro.js"])
      .pipe(concat(debug_file))
      .pipe(replace('"{MODULE_ID}"', '"' + [name, version, main+"-debug"].join("/") + '"'))
      .pipe(replace('"{MODULE_DEPS}"', '[]'))
      .pipe(beautify({indentSize: 2}))
      .pipe(gulp.dest([dist_dir, name, version].join("/")));

  });

};

exports.zip = function(cwd){
  var dist_dir = "dist";
  gulp.src(cwd + "/" + dist_dir + "/" + name + "/*")
    .pipe(zip(main+".zip"))
    .pipe(gulp.dest(dist_dir));
};
