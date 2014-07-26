
var detector = require("detector");

var Tracker = {};

Tracker.click = function(){
  return detector.os.name + "/" + detector.os.version;
};

module.exports = Tracker;
