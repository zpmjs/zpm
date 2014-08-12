
(function(global){

  var g_define = global.define;
  var zpm_define;
  var zpmjs;
  var use;

  function each(list, handler) {
    for(var i=0,l=list.length; i<l; i++){
      handler.call(list, list[i], i);
    }
  }

  if (typeof g_define === "function" && (g_define.cmd || g_define.amd)){
    zpm_define = g_define;
    use = global.seajs ? global.seajs.use : global.require;
  } else {

    var ZPM_CACHE = "_ZPM_CACHE_";
    if (!global[ZPM_CACHE]){
      global[ZPM_CACHE] = {};
    }

    var MODULE = {
      exports: {},
      require: function(id){
        return global[ZPM_CACHE][id];
      }
    };

    zpm_define = function(id, deps, factory){
      if (global[ZPM_CACHE][id]) { return; }

      var return_exports = factory.call(global, MODULE.require, MODULE.exports, MODULE);

      global[ZPM_CACHE][id] = return_exports || MODULE.exports;
    };
    zpm_define.zmd = true;

    use = function(modules, callback){
      callback();
    }
  }

  zpmjs.use = function(modules, callback){
    var mods = [];

    if (!(modules instanceof Array)){
      modules = [modules];
    }

    use(modules, function(){
      var args = arguments;

      each(modules, function(module_id, i){
        mods[i] = args[i] || MODULE.require(module_id);
      });

    });

    callback.apply(global, mods);
  };

  global.zpmjs = zpmjs;

  zpm_define("{MODULE_ID}", "{MODULE_DEPS}", function(require, exports, module){
