
var detector = require("detector");
var ready = require("ready");
var Events = require("evt");
var nameStorage = require("name-storage");
var Tracker = require("tracker");

var T = {};

nameStorage.setItem("ref", document.referrer);
var evt = new Events();

ready(function(){
  evt.emit("ready");
})

T.click = function(){
  Tracker.click.apply(T, arguments)
  return detector.os.name + "/" + detector.os.version;
};

module.exports = T;
