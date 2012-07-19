var thRee = require("./three");
var com   = require("./communication");

thRee.exts.help = function(user) {
  var key;
  var commands = "";

  Object.keys(this).forEach(function(key) {
    commands = commands.concat("/" + key + ", ");
  });

  thRee.self.msg(user, "Available commands: " + commands.substring(0, commands.length - 2) + ".");
};

thRee.exts.help.help = function(user) {
  thRee.self.msg(user, "Don't panic!");
};

thRee.exts.nick = function(user, name) {
  var oldName;

  if (name && name !== "") {
    if (name === user.name) {
      thRee.self.msg(user, "It's your own name.");
      return;
    }

    if (thRee.userForName(name)) {
      thRee.self.msg(user, "This name has already been taken.");
      return;
    }

    oldName = user.name;
    user.name = name;

    thRee.self.say(oldName + " is now known as " + name + ".");
  } else {
    thRee.self.msg(user, "You didn't give me any nick.");
  }
};

thRee.exts.nick.help = function(user) {
  thRee.self.msg(user, "You can change your name by typing \"/nick <new name>\".");
};
