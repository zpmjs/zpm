
(function(global){

  var g_define = global.define;
  var zpm_define;
  var zpmjs;

  if (typeof g_define === "function" && (g_define.cmd || g_define.amd)){
    zpm_define = g_define;
    zpmjs = global.seajs || {
      use: function(modules, callback){
        global.require(modules, callback);
      }
    };
  } else {

    var ZPM_CACHE = "_ZPM_CACHE_";
    if (!global[ZPM_CACHE]){
      global[ZPM_CACHE] = {};
    }

    var module = {
      exports: {},
      require: function(id){
        return global[ZPM_CACHE][id];
      }
    };

    zpm_define = function(id, deps, factory){
      if (global[ZPM_CACHE][id]) { return; }

      var return_exports = factory.call(global, module.require, module.exports, module);

      global[ZPM_CACHE][id] = return_exports || module.exports;
    };
    zpm_define.zmd = true;

    zpmjs = {
      use: function(modules, callback){
        var args = [];

        if (!(modules instanceof Array)){
          modules = [modules];
        }

        for(var i=0,l=modules.length; i<l; i++){
          args[i] = module.require(modules[i]);
        }

        callback.apply(global, args);
      }
    };
  }

  global.zpmjs = zpmjs;

  zpm_define("{MODULE_ID}", "{MODULE_DEPS}", function(require, exports, module){
