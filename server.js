var assert  = require("assert");
var fs      = require("fs");
var io      = require("socket.io").listen(8081, { "log level": 0 });
var utils   = require("./utils");
var logger  = require("./logger");
var User    = require("./user");
var thRee   = require("./three");
var com     = require("./communication");
              require("./basic");
              require("./simple");
var welcome;

var SocketUser = function(user, socket) {
  user.on("out", function(log) {
    socket.emit("log", log);
  });

  user.on("did updated", function(key, value) {
    if (key === "name") {
      socket.emit("user", { name: value });
    }
  });

  return user;
};

SocketUser(thRee.self, { emit: utils.type.nullFunction });

io.set("authorization", function (handshakeData, callback) {
  var cookies = {};

  /* parse cookies */
  handshakeData.headers.cookie.split(";").forEach(function (cookie) {
    var parts = cookie.split("=");
    cookies[parts[0].trim()] = (parts[1] || "").trim();
  });

  /* client will remember username and send it by cookie */
  handshakeData.name = cookies.name;

  callback(null, true);
});

io.sockets.on("connection", function(socket) {
  var user, name;

  socket.on("disconnect", function() {
    thRee.self.say(user.name + " has logged out.");
    thRee.leave(socket.id);
  });

  socket.on("command", function(command) {
    if (command.charAt(0) !== "/") {
      command = "say " + command;
    } else {
      command = command.substring(1);
    }
    
    user.in(command);
  });
  
  name = socket.handshake.name || new Buffer(socket.id).toString("base64").substring(0, 8);
  user = User(name);
  SocketUser(user, socket);

  com.logs(15).forEach(function(log) {
    socket.emit("log", log);
  });
  
  thRee.join(socket.id, user);

  if (!welcome) {
    fs.readFile("./msg/welcome.markdown", "utf-8", function(err, data) {
      welcome = data;
      thRee.self.msg(user, welcome);
    });
  } else {
    thRee.self.msg(user, welcome);
  }

  thRee.self.say(user.name + " has logged in.");
});

logger.chat("ready");
