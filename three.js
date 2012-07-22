var EventEmitter = require("events").EventEmitter;
var logger       = require("./logger");
var utils        = require("./utils");
var User         = require("./user");

var thRee = {
  users: {},
  exts: {},
  userForName: function(name) {
    var self = this;
    var user;

    if (Object.keys(this.users).some(function(key) {
      user = self.users[key];
      return user.name === name;
    })) {
      return user;
    }

    return null;
  },
  join: function(id, user) {
    var self = this;

    this.users[id] = user;
    /* short cuts */
    user.on("in", function(cmd) {
      self.exec(user, cmd);
    });

    this.emit("join", user);
  },
  leave: function(id) {
    var user = this.users[id];

    delete this.users[id];

    this.emit("leave", user);
  },
  exec: function(user, cmd) {
    var prev;
    var current;
    var i;

    logger.chat(user.name.yellow + "$ ".magenta + cmd.keypath.join(".") + " " + cmd.args.join(", "));

    current = this.exts;

    for (i = 0; i < cmd.keypath.length; i += 1) {
      prev = current;
      current = current[cmd.keypath[i]];

      if (!current) {
        logger.chat("command not found");
        return;
      }
    }

    if (utils.type.isFunction(current)) {
      current.apply(prev, [user].concat(cmd.args));
    }
  }
};

thRee.__proto__ = Object.create(EventEmitter.prototype);

thRee.self = User("thRee");
thRee.join(0, thRee.self);

exports = module.exports = thRee;
