var EventEmitter = require("events").EventEmitter;

User = function(name) {
  var instance = {
    name: name || "John Doe",
    in: function(cmd) {
      this.emit("in", cmd);
      return this;
    },
    out: function(str) {
      this.emit("out", str);
      return this;
    }
  };

  instance.__proto__ = Object.create(EventEmitter.prototype);

  return instance;
};

exports = module.exports = User;
