
(function(global){

  var zpm_define;

  if (typeof define === "function" && (define.cmd || define.amd)){
    zpm_define = define;
  } else {

    var UMD_CACHE = "_zpm_cache_";
    if (!global[UMD_CACHE]){
      global[UMD_CACHE] = {};
    }

    var module = {
      exports: {},
      require: function(id){
        return global[UMD_CACHE][id];
      }
    };

    zpm_define = function(id, deps, factory){
      var return_exports = factory.call(global, module.require, module.exports, module);

      global[UMD_CACHE][id] = return_exports || module.exports;
    };
    zpm_define.zmd = true;
  }

  zpm_define("{MODULE_ID}", "{MODULE_DEPS}", function(require, exports, module){
