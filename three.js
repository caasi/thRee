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
    user.on("in", function(str) {
      self.exec(user, str);
    });

    this.emit("join", user);
  },
  leave: function(id) {
    var user = this.users[id];

    delete this.users[id];

    this.emit("leave", user);
  },
  exec: function(user, str) {
    var path;
    var args;
    var prev;
    var func;
    var i;

    logger.chat(user.name.yellow + "$ ".magenta + str);

    args = str.split(" ");
    path = args.splice(0, 1)[0];
    path = path.split(".");

    func = this.exts;

    for (i = 0; i < path.length; i = i + 1) {
      prev = func;
      func = func[path[i]];

      if (!func) return;
    }

    if (utils.type.isFunction(func)) {
      func.apply(prev, [user].concat(args));
    }
  }
};

thRee.__proto__ = Object.create(EventEmitter.prototype);

thRee.self = User("thRee");
thRee.join(0, thRee.self);

exports = module.exports = thRee;
