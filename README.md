
# zpm

----

The end of umd package manager for web.

You can write code on commonjs, and build it for anywhere.

## Diff

long time ago, if you want code run in browser for anywhere, you need write
code like this:

```js
(function(window){
  if (window.Mod){
    return window.Mod;
  }

  function factory(detector){
    var Mod = {};
    Mod.method = function(){
      return detector.os.name + "/" + detector.os.version;
    };

    return Mod;
  }

  if ("function" === typeof define && (define.cmd || define.amd)){
    define(function(require, exports, module){
      module.exports = factory(require("detector"));
    });
  } else {
    window.Mod = factory(window.detector);
  }
})(this);
```

* In non-cmd, non-amd, you must use global variable.
* You must manager dependencies by hand via global variable.

----

Now you just write code on CommonJS, zpm will build it to umd for anywhere in
browser:

```js
var detector = require("detector");

var Mod = {};
Mod.method = function(){
  return detector.os.name + "/" + detector.os.version;
};

// If you donot want, global variable is not necessary.
window.Mod = Mod;
module.exports = Mod;
```

And you may want use [spm](https://github.com/spmjs/spm) for write, debug,
test and publish you source code.

## Install

```
$ npm install -g zpm
```

## Usage

```
$ zpm build
```

## Configure in package.json

```json
{
  "zpm": {
    "output": {
      "umd-moudle-a.js": "commonjs-module-source-code-a.js",
      "umd-moudle-b.js": ["commonjs-module-b.js", "commonjs-module-c.js"]
    },
    "dependencies": {
      "jquery": "1.7.2"
    }
  }
}
```

If no `zpm` infomation in package.json, zpm build use `spm` infomation.

```json
{
  "spm": {
    "main": "index.js",
    "dependencies": {
      "jquery": "1.7.2"
    }
  }
}
```
