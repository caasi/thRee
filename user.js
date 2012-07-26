var EventEmitter = require("events").EventEmitter;

User = function(name) {
  var _name = name || "";

  var instance = {
    in: function(cmd) {
      this.emit("in", cmd);
      return this;
    },
    out: function(str) {
      this.emit("out", str);
      return this;
    }
  };

  Object.defineProperty(
    instance,
    "name",
    {
      enumerable: true,
      get: function() {
        return _name;
      },
      set: function(str) {
        _name = str;
        instance.emit("bubble", { type: "set", keypath: ["name"], args: [str] });
      }
    }
  );

  instance.__proto__ = Object.create(EventEmitter.prototype);

  return instance;
};

exports = module.exports = User;
