var logger  = require("./logger");
var thRee   = require("./three");

/* privates */
var LOG_LIMIT = 15;
var logs = [], com = {};

var say = function(str) {
  thRee.exts.say(this, str);

  return this;
};

var msg = function(another, str) {
  var now = Date.now();

  logger.chat(this.name.yellow + "->".magenta + another.name.yellow + ": ".magenta + str);

  this.out({ name: this.name, target: another.name, text: str, time:now, type: "self" });
  another.out({ name: this.name, target: another.name, text: str, time:now, type: "private" });

  return this;
};

/* extend thRee and users */
thRee.self.say = say;
thRee.self.msg = msg;

thRee.on("join", function(user) {
  user.say = say;
  user.msg = msg;
});

/* commands */
thRee.exts.say = function(user) {
  var message = Array.prototype.slice.apply(arguments, [1]).join(" ");
  var now = Date.now();

  if (message.length === 0) {
    thRee.self.msg(user, "You said nothing.");
    return;
  }

  logger.chat(user.name.yellow + ": ".magenta + message);

  /* must be JSON */
  logs.push({ name: user.name, text: message, time: now, type: "history" });
  if (logs.length > LOG_LIMIT) logs.shift();

  Object.keys(thRee.users).forEach(function(key) {
    var guy = thRee.users[key];

    if (guy === user) {
      guy.out({ name: user.name, text: message, time: now, type: "self" });
    } else  {
      guy.out({ name: user.name, text:message, time: now, type: "normal" });
    }
  });
};

thRee.exts.say.help = function(user) {
  thRee.self.msg(user, "You can talk by typing \"/say &lt;message&gt;\".");
};

thRee.exts.msg = function(user, name) {
  var message = Array.prototype.slice.apply(arguments, [2]).join(" ");
  var another = thRee.userForName(name);

  if (message.length === 0) {
    thRee.self.msg(user, "You said nothing.");
    return;
  }

  if (name === user.name) {
    thRee.self.msg(user, "Why do you speak to yourself?");
    return;
  }

  if (another) {
    user.msg(another, message);
  } else {
    thRee.self.msg(user, "User not found.");
  }
};

thRee.exts.msg.help = function(user) {
  thRee.self.msg(user, "You can talk to someone by typing \"/msg &lt;name&gt; &lt;message&gt;\".");
};

com.logs = function(num) {
  var i, start;
  var len = logs.length;
  var ret = [];

  num = num || LOG_LIMIT;
  start = len - num;
  start = start < 0 ? 0 : start;

  for (i = start; i < len; i += 1) {
    ret.push(logs[i]);
  }

  return ret;
};

exports = module.exports = com;
