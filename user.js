var EventEmitter = require("events").EventEmitter;

User = function(name) {
  var _name;
  _name = name || "John Doe";

  var instance = {
    get name() {
      return _name;
    },
    set name(str) {
      _name = str;
      this.emit("did updated", "name", _name);
    },
    in: function(str) {
      this.emit("in", str);
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
