var io      = require("socket.io").listen(8081, { "log level": 0 });
var utils   = require("./utils");
var logger  = require("./logger");
var User    = require("./user");
var thRee   = require("./three");
              require("./simple");

var SocketUser = function(user, socket) {
  user.on("say", function(str, unixtime) {
    logger.chat(user.name.yellow + ": ".magenta + str);
    socket.broadcast.emit("log", { name: user.name, text: str, type: "say", time: unixtime });
  });

  user.on("hear", function(talker, str, unixtime) {
    if (talker !== user) {
      logger.chat(talker.name.yellow + "->".magenta + user.name.yellow + ": ".magenta + str);
    }
    socket.emit("log", { name: talker.name, text: str, type: "whisper", time: unixtime });
  });

  user.on("did updated", function(key, value) {
    if (key === "name") {
      socket.emit("user", { name: value });
    }
  });

  return user;
};

var CommanderUser = function(user, executer) {
  user.on("exec", function(command) {
    logger.chat(user.name.yellow + "$ ".green + command);
    executer.exec(user, command);
  });

  return user;
};

SocketUser(CommanderUser(thRee.self, thRee), { emit: utils.type.nullFunction, broadcast: io.sockets });

io.sockets.on("connection", function(socket) {
  var user, name;

  socket.on("disconnect", function() {
    thRee.self.say(user.name + " has logged out.");
    thRee.leave(socket.id);
  });

  socket.on("msg", function(msg) {
    user.say(msg);
  });
  
  user = new User();
  name = new Buffer(socket.id).toString("base64").substring(0, 8);
  SocketUser(CommanderUser(user, thRee), socket);
  user.name = name;

  thRee.logs(15).forEach(function(log) {
    socket.emit("log", log);
  });
  
  thRee.join(socket.id, user);
  thRee.self.
    whisper(user, "Welcome.").
    whisper(user, "I will call you \"" + user.name + "\" for now,").
    whisper(user, "but you can change it at will.").
    whisper(user, "Try /help and /help.help yourself,").
    whisper(user, "and have a nice day.").
    say(user.name + " has logged in.");
});

logger.chat("ready");
