
(function(global, factory){

  var UMD_CACHE = "_umd_cache_";
  if (!global[UMD_CACHE]){
    global[UMD_CACHE] = {};
  }

  if (typeof define === "function" && (define.cmd || define.amd)){
    define("{MODULE_ID}", "{MODULE_DEPS}", factory);
  } else {

    var require = function(id){
      return global[UMD_CACHE][id];
    };
    var module = { exports: {} };
    var return_exports = factory.call(global, require, module.exports, module);

    global[UMD_CACHE]["{MODULE_ID}"] = return_exports || module.exports;

  }

})(this, function(require, exports, module){
