var EventEmitter = require("events").EventEmitter;
var utils =        require("./utils");
var User  =        require("./user");

var users = {};
var logs = [];

var thRee = {
  exts: {},
  userForName: function(name) {
    var user;
    var key;

    for (key in users) {
      user = users[key];
      if (user.name === name) return user;
    }

    return null;
  },
  join: function(id, user) {
    users[id] = user;

    user.on("say", function(str, unixtime) {
      logs.push({ name: user.name, text: str, type: "history", time: unixtime });
    });

    this.emit("join", user);
  },
  leave: function(id) {
    var user = users[id];

    delete users[id];

    this.emit("leave", user);
  },
  logs: function(num) {
    var i, start;
    var len = logs.length;
    var result = [];

    num = num || 1;
    start = len - num;
    start = start < 0 ? 0 : start;

    for (i = start; i < len; i = i + 1) {
      result.push(logs[i]);
    }

    return result;
  },
  exec: function(user, str) {
    var path;
    var args;
    var prev;
    var func;
    var i;

    args = str.split(" ");
    path = args.splice(0, 1)[0];
    path = path.split(".");

    func = this.exts;

    for (i = 0; i < path.length; i = i + 1) {
      prev = func;
      func = func[path[i]];

      if (!func) {
        this.self.whisper(user, "I don't understand.");
        return;
      }
    }

    if (utils.type.isFunction(func)) {
      func.apply(prev, [user].concat(args));
    }
  }
};

thRee.__proto__ = Object.create(EventEmitter.prototype);

thRee.self = User("thRee");
thRee.join(0, thRee.self);

/* command help */
thRee.exts.help = function(user) {
  var key;
  var commands = "";

  for (key in this) {
    if (this.hasOwnProperty(key)) {
      commands = commands.concat("/" + key + ", ");
    }
  }

  thRee.self.whisper(user, "Available commands: " + commands.substring(0, commands.length - 2) + ".");
};

thRee.exts.help.help = function(user) {
  thRee.self.whisper(user, "Don't panic!");
};

/* command nick */
thRee.exts.nick = function(user, name) {
  var oldName;

  if (name && name !== "") {
    if (name === user.name) {
      thRee.self.whisper(user, "It's your own name.");
      return;
    }

    if (thRee.userForName(name)) {
      thRee.self.whisper(user, "This name has already been taken.");
      return;
    }

    oldName = user.name;
    user.name = name;

    thRee.self.say(oldName + " is now known as " + name + ".");
  } else {
    thRee.self.whisper(user, "You didn't give me any nick.");
  }
};

thRee.exts.nick.help = function(user) {
  thRee.self.whisper(user, "You can change your name by typing \"/nick <new name>\".");
};

exports = module.exports = thRee;
