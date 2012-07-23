var assert    = require("assert");
var fs        = require("fs");
var io        = require("socket.io").listen(8081, { "log level": 0 });
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

var foo = {
  count: 0
};

var dfoo = DObject(foo);

io.set("authorization", function (handshakeData, callback) {
  var cookies = {};

  /* parse cookies */
  if (handshakeData.headers.cookie) {
    handshakeData.headers.cookie.split(";").forEach(function (cookie) {
      var parts = cookie.split("=");
      cookies[parts[0].trim()] = (parts[1] || "").trim();
    });
  }

  /* client will remember username and send it by cookie */
  handshakeData.name = cookies.name;

  callback(null, true);
});

io.sockets.on("connection", function(socket) {
  /* ask client for rpcs with namespace */
  socket.on("expose", function(o) {
    var client = Agent(DObject.validate(o));
    var user = User();

    client.on("bubble", function(cmd) {
      socket.emit("cmd", cmd);
    });

    user.on("out", function(log) {
      client.chat.log(log);
    });

    user.on("did updated", function(key, value) {
      client.username(value);
    });

    socket.on("disconnect", function() {
      thRee.self.say(user.name + " has logged out.");
      thRee.leave(socket.id);
    });

    socket.on("cmd", function(cmd) {
      user.in(cmd);
    });

    /* set name and send it to the client */
    user.name = socket.handshake.name || new Buffer(socket.id).toString("base64").substring(0, 8);

    com.logs(15).forEach(function(log) {
      client.chat.log(log);
    });
  
    thRee.join(socket.id, user);

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

  dfoo.on("bubble", function(cmd) {
    socket.emit("foobar.cmd", cmd);
  });

  socket.on("foobar.cmd", function(cmd) {
    dfoo.exec(cmd);
  });

  socket.emit("expose", DObject.expose(thRee.exts));
  socket.emit("foobar", DObject.expose(foo));
});

logger.chat("ready");
