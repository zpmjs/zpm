
var Tracker = require("tracker");

var T = {};
T.click = function(){
  Tracker.click.apply(T, arguments)
};

module.exports = T;
