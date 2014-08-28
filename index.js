
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
var fs = require("fs");

var DEFAULT_SPM_MODULE_DIR = "spm_modules";
if (!fs.existsSync(DEFAULT_SPM_MODULE_DIR)){
  DEFAULT_SPM_MODULE_DIR = "sea-modules";
}

// @param {String} cwd, current working diractory.
// @param {Boolean} allInOne.
exports.build = function(cwd, allInOne){
  var pkg_file = cwd + "/package.json";

  if (!fs.existsSync(pkg_file)) {
    console.error("File not found: " + pkg_file);
    return;
  }

  var pkg = require(pkg_file);

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
          var dep_full_name = dep_mods[module_id + ":" + $2_name];
          return dep_full_name ? 'require(' + $1_quote + dep_full_name + s_debug + $1_quote + ')'  : $0;
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

    function cacheDeps(cache, pkg){
      var pkg_name = pkg.name;
      var pkg_version = pkg.version;
      var pkg_main = (pkg.spm && pkg.spm.main ? pkg.spm.main : pkg.main)
        .replace(/\.js$/, "");

      var dependencies;

      if (pkg.zpm && pkg.zpm.dependencies){
        dependencies = pkg.zpm.dependencies;
      } else if (pkg.spm && pkg.spm.dependencies){
        dependencies = pkg.spm.dependencies;
      }

      for(var dep_name in dependencies){
        if (!dependencies.hasOwnProperty(dep_name)) {continue;}

        var dep_version = dependencies[dep_name];

        var dep_pkg_file = path.join(cwd, DEFAULT_SPM_MODULE_DIR, dep_name, dep_version, "package.json");
        if (!fs.existsSync(dep_pkg_file)) {
          console.error("File not found: " + dep_pkg_file);
          continue;
        }
        var dep_pkg = require(dep_pkg_file);
        var dep_main = (dep_pkg.spm && dep_pkg.spm.main ? dep_pkg.spm.main : dep_pkg.main).replace(/\.js$/, "");

        cache[pkg_name + "/" + pkg_version + "/" + pkg_main + ":" + dep_name] = path.join(
          dep_name,
          dep_version,
          dep_main
        );

        cacheDeps(cache, dep_pkg);
      }

    }


    // 缓存依赖关系。
    // dep_mods[module_name] = "module_name/module_version/module_main"
    var dep_mods = {};
    cacheDeps(dep_mods, pkg);


    if (allInOne) {
      for(var mod in dep_mods){
        var dep_id = dep_mods[mod];
        var dep_file = dep_id + ".js";
        debug_streams.push(
          makeStream(path.join(cwd, DEFAULT_SPM_MODULE_DIR, dep_file), dep_id, true)
            .pipe(beautify({indent_size: 2}))
        );
        minify_streams.push(
          makeStream(path.join(cwd, DEFAULT_SPM_MODULE_DIR, dep_file), dep_id, false)
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
