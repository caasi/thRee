var EventEmitter = require("events").EventEmitter;

var Agent = function(target, thisArg) {
  var type = typeof target;
  var ret;

  if (Array.isArray(target)) {
    ret = null;
  } else if (type === "function") {
    ret = function() {
      target.apply(thisArg, arguments);
      ret.emit("bubble", { type: "msg", keypath: [], args: Array.prototype.slice.call(arguments) });
    };
  } else if (type === "object") {
    ret = {};
  } else {
    ret = null;
  }

  if (ret) {
    ret.__proto__ = Object.create(EventEmitter.prototype);
    
    Object.keys(target).forEach(function(key) {
      var result = Agent(target[key], target);

      if (result) {
        result.on("bubble", function(cmd) {
          ret.emit("bubble", { type: cmd.type, keypath: [key].concat(cmd.keypath), args: cmd.args });
        });

        ret[key] = result;
      } else {
        Object.defineProperty(
          ret,
          key,
          {
            enumerable: true,
            get: function() {
              ret.emit("bubble", { type: "get", keypath: [key], args : [] });
              return target[key];
            },
            set: function(value) {
              target[key] = value;
              ret.emit("bubble", { type: "set", keypath: [key], args: [value] });
            }
          }
        );
      }
    });
  }

  return ret;
};

exports = module.exports = Agent;
