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
    say: function(str) {
      if (str.charAt(0) === "/") {
        this.emit("exec", str.substring(1));
      } else {
        this.emit("say", str);
      }

      return this;
    },
    hear: function(talker, str) {
      this.emit("hear", talker, str);

      return this;
    },
    whisper: function(user, str) {
      this.hear(this, str);
      user.hear(this, str);

      return this;
    },
  };

  instance.__proto__ = Object.create(EventEmitter.prototype);

  return instance;
};

exports = module.exports = User;
