
(function(global){

  var g_define = global.define;
  var zpm_define;

  if (typeof g_define === "function" && (g_define.cmd || g_define.amd)){
    zpm_define = g_define;
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
  }

  zpm_define("{MODULE_ID}", "{MODULE_DEPS}", function(require, exports, module){
