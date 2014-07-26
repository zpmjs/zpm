
# zpm

----

The end of umd package manager for web.

You can write code on commonjs, and build it for anywhere.

## Diff

long long ago, you need write code like this:

```js
(function(window){
  if (window.Mod){
    return window.Mod;
  }

  var detector = window.detector || require("detector");

  var Mod = {};
  Mod.method = function(){
    return detector.os.name + "/" + detector.os.version;
  };

  window.Mod = Mod;

  if ("function" === typeof define && (define.cmd || define.amd)){
    define(function(require, exports, module){
      module.exports = Mod;
    });
  }
})(this);
```

Now you need not to care about dependencies, AMD, CMD, CommonJS or UMD,
Just write it by CommonJS:

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

## Install

```
$ npm install -g zpm
```

## Usage

```
$ zpm build
```
