
var detector = require("detector");
var ready = require("ready");
var Events = require("evt");
var nameStorage = require("name-storage");

var Tracker = {};

nameStorage.setItem("ref", document.referrer);
var evt = new Events();

ready(function(){
  evt.emit("ready");
})

Tracker.click = function(){
  return detector.os.name + "/" + detector.os.version;
};

module.exports = Tracker;
