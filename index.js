
var path = require("path");
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
    var intro_file = __dirname + "/template/intro.js";
    var outro_file = __dirname + "/template/outro.js";
    var src_file = cwd + "/" + main_file;

    var deps = {};
    if (pkg.zpm && pkg.zpm.dependencies){
      deps = pkg.zpm.dependencies;
    } else if (pkg.spm && pkg.spm.dependencies){
      deps = pkg.spm.dependencies;
    }

    var dep_mods = {};
    for(var mod in deps){
      var dep_pkg = require(path.join(cwd, "sea-modules", mod, deps[mod], "package.json"));
      dep_mods[mod] = path.join(mod, deps[mod],
        (dep_pkg.spm ? dep_pkg.spm.main : dep_pkg.main).replace(/\.js$/, "")
      );
    }

    // build
    gulp.src([intro_file, src_file, outro_file])
      .pipe(concat(main_file))
      .pipe(replace('"{MODULE_ID}"', '"' + [name, version, main].join("/") + '"'))
      .pipe(replace('"{MODULE_DEPS}"', '[]'))
      .pipe(replace(/\brequire\s*\(\s*(["'])([^\1]*)\1\s*\)/, function($0, $1_quote, $2_name){
        return deps[$2_name] ? 'require(' + $1_quote + dep_mods[$2_name] + $1_quote + ')'  : $0;
      }))
      .pipe(uglify())
      .pipe(gulp.dest([dist_dir, name, version].join("/")));

    // build-debug
    gulp.src([intro_file, src_file, outro_file])
      .pipe(concat(debug_file))
      .pipe(replace('"{MODULE_ID}"', '"' + [name, version, main+"-debug"].join("/") + '"'))
      .pipe(replace('"{MODULE_DEPS}"', '[]'))
      .pipe(replace(/\brequire\s*\(\s*(["'])([^\1]*)\1\s*\)/, function($0, $1_quote, $2_name){
        return deps[$2_name] ? 'require(' + $1_quote + dep_mods[$2_name] + $1_quote + ')'  : $0;
      }))
      .pipe(beautify({indent_size: 2}))
      .pipe(gulp.dest([dist_dir, name, version].join("/")));

  });

};

exports.zip = function(cwd){
  var pkg = require(cwd + "/package.json");

  if (!pkg || !pkg.spm){return;}

  var name = pkg.name;
  var dist_dir = "dist";
  var main = pkg.spm.main.replace(/\.js$/, "");

  gulp.src(cwd + "/" + dist_dir + "/" + name + "/*")
    .pipe(zip(main+".zip"))
    .pipe(gulp.dest(cwd + "/" + dist_dir));
};
