var assert    = require("assert");
var fs        = require("fs");
var io        = require("socket.io").listen(80, { "log level": 0 });
var Ree       = require("ree");
var utils     = require("./utils");
var logger    = require("./logger");
var User      = require("./user");
var DObject   = require("./dobject");
var thRee     = require("./three");
var com       = require("./communication");
                require("./basic");
                require("./simple");
var Life      = require("./life");
var welcome;

var gol = Life(40, 30);
var aol = Ree(gol);

// buggy if you mix original object and agent object
setInterval(function() {
  aol.tick();
}, 66);

io.sockets.on("connection", function(socket) {
  /* ask client for rpcs with namespace */
  socket.on("thRee", function(o) {
    var client = Ree(DObject.validate(o));
    var user = User(o.prev_name || new Buffer(socket.id).toString("base64").substring(0, 8));
    var emitLifeCommand;

    socket.on("disconnect", function() {
      aol.off(emitLifeCommand);
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

  socket.emit("life", DObject.expose(gol));

  socket.on("life.cmd", function(cmd) {
    Ree.exec(aol, cmd);
  });

  emitLifeCommand = function(cmd) {
    if (cmd.type === "set") {
      socket.emit("life.cmd", cmd);
    }
  };

  aol.on("bubble", emitLifeCommand);
});

logger.chat("ready");
