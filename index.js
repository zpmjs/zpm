
var path = require("path");
var gulp = require("gulp");
var eventStream = require("event-stream");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautify");
var replace = require("gulp-replace");
var wrap = require("gulp-wrap");
var zip = require("gulp-zip");
var del = require("del");

// @param {String} cwd, current working diractory.
// @param {Boolean} allInOne.
exports.build = function(cwd, allInOne){
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
    var zpmjs_file = __dirname + "/node_modules/zpmjs/zpm.js"
    var src_file = cwd + "/" + main_file;

    var debug_streams = [];
    var minify_streams = [];

    function makeStream(file_path, module_id, is_debug){
      var s_debug = is_debug ? "-debug" : "";

      return gulp.src(file_path)
        .pipe(wrap(
          'zpmjs.define("{MODULE_ID}", function(require, exports, module){\n' +
          '<%= contents %>\n});'))
        .pipe(replace('"{MODULE_ID}"', '"' + module_id + s_debug + '"'))
        .pipe(replace(/\brequire\s*\(\s*(["'])([^\1]*?)\1\s*\)/g, function($0, $1_quote, $2_name){
          return deps[$2_name] ? 'require(' + $1_quote + dep_mods[$2_name] + s_debug + $1_quote + ')'  : $0;
        }));
    }
    debug_streams.push(
      gulp.src(zpmjs_file)
        .pipe(beautify({indent_size: 2}))
    );
    minify_streams.push(
      gulp.src(zpmjs_file)
        .pipe(uglify())
    );

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

    if (allInOne) {
      for(var mod in deps){
        debug_streams.push(
          makeStream(path.join(cwd, "sea-modules", dep_mods[mod]+".js"),
              dep_mods[mod],
              true
            )
            .pipe(beautify({indent_size: 2}))
        );
        minify_streams.push(
          makeStream(path.join(cwd, "sea-modules", dep_mods[mod]+".js"),
              dep_mods[mod],
              false
            )
            .pipe(uglify())
        );
      }
    }

    debug_streams.push(
      makeStream(src_file,
          [name, version, main].join("/"),
          true
        )
        .pipe(beautify({indent_size: 2}))
    );
    minify_streams.push(
      makeStream(src_file,
          [name, version, main].join("/"),
          false
        )
        .pipe(uglify())
    );

    eventStream.merge.apply(eventStream, debug_streams)
      .pipe(concat(debug_file))
      .pipe(gulp.dest([dist_dir, name, version].join("/")));

    eventStream.merge.apply(eventStream, minify_streams)
      .pipe(concat(main_file))
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
