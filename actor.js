var EventEmitter = require("events").EventEmitter;

var Actor = function(o) {
  var ret;

  ret = function() {
    ret.emit("bubble", [], Array.prototype.slice.call(arguments));
  };

  ret.__proto__ = Object.create(EventEmitter.prototype);

  if (o) {
    Object.keys(o).forEach(function(key) {
      var actor = Actor(o[key]);

      actor.on("bubble", function(keypath, args) {
        ret.emit("bubble", [key].concat(keypath), args);
      });

      ret[key] = actor;
    });
  }

  return ret;
};

exports = module.exports = Actor;
