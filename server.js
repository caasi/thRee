var assert    = require("assert");
var fs        = require("fs");
var io        = require("socket.io").listen(80, { "log level": 3 });
var utils     = require("./utils");
var logger    = require("./logger");
var User      = require("./user");
var Agent     = require("./agent");
var DObject   = require("./dobject");
var thRee     = require("./three");
var com       = require("./communication");
                require("./basic");
                require("./simple");
var welcome;

io.sockets.on("connection", function(socket) {
  /* ask client for rpcs with namespace */
  socket.on("thRee", function(o) {
    var client = DObject.interface(DObject.validate(o));
    var user = User(o.prev_name || new Buffer(socket.id).toString("base64").substring(0, 8));

    socket.on("disconnect", function() {
      thRee.self.say(user.name + " has logged out.");
      thRee.leave(socket.id);
    });

    client.on("bubble", function(cmd) {
      socket.emit("thRee.cmd", cmd);
    });

    user.on("bubble", function(cmd) {
      if (cmd.type === "set" && cmd.keypath[cmd.keypath.length - 1] === "name") {
        client.name(cmd.args[0]);
      }
    });

    user.on("out", function(log) {
      client.log(log);
    });

    socket.on("cmd", function(cmd) {
      user.in(cmd);
    });

    /* user */
    thRee.join(socket.id, user);

    client.name(user.name);

    com.logs().forEach(function(log) {
      client.log(log);
    });
  
    if (!welcome) {
      fs.readFile("./msg/welcome.markdown", "utf-8", function(err, data) {
        welcome = data;
        thRee.self.
          msg(user, welcome).
          say(user.name + " has logged in.");
      });
    } else {
      thRee.self.
        msg(user, welcome).
        say(user.name + " has logged in.");
    }
  });
});

logger.chat("ready");
