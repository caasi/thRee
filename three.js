var utils = require("./utils");
var User  = require("./user");

var users = {};
var logs = [];
var games = {};

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
  },
  leave: function(id) {
    delete users[id];
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

/* simple game */
thRee.exts.simple = function(user, opponentName) {
  var game = games[user.name];
  var opponent;

  if (game) {
    thRee.self.whisper(user, "You are already in a game.");
    return;
  }
  
  opponent = thRee.userForName(opponentName);

  if (!opponent) {
    thRee.self.whisper(user, "Can find your opponent.");
    return;
  }

  if (opponent === user) {
    thRee.self.whisper(user, "It's weird to play with yourself.");
    return;
  }

  games[user.name] = games[opponent.name] = {
    ready: false,
    current: 0,
    players: [user, opponent],
    points: [0, 0]
  };

  thRee.self.whisper(opponent, user.name + " want to play a game, type /simple.accept to play.");
  thRee.self.whisper(user, "Waiting for another player....");
};

thRee.exts.simple.help = function(user) {
  thRee.self.whisper(user, "Play a small game with another user by typing \"/simple <opponent>\". You can abort the game by typing \"/simple.abort\".");
};

thRee.exts.simple.accept = function(user) {
  var game = games[user.name];

  if (!game) {
    thRee.self.whisper(user, "You are not in a game.");
    return;
  }

  if (game.ready) {
    thRee.self.whisper(user, "You are already playing.");
    return;
  }

  if (game.players[0] === user) {
    thRee.self.whisper(user, "Please wait for your opponent.");
    return;
  }

  game.ready = true;
  thRee.self.whisper(game.players[0], "Game is ready, please roll a die by typing \"/simple.roll\".");
  thRee.self.whisper(game.players[1], "Thank you, and have a nice fight.");
};

thRee.exts.simple.abort = function(user) {
  var game = games[user.name];
  var user0, user1;

  if (!game) {
    thRee.self.whisper(user, "You are not in a game.");
    return;
  }

  user0 = game.players[0];
  user1 = game.players[1];

  thRee.self.whisper(user0, user.name + " just give up.");
  thRee.self.whisper(user1, user.name + " just give up.");

  delete games[user0.name];
  delete games[user1.name];

  games[user0.name] = undefined;
  games[user1.name] = undefined;
};

thRee.exts.simple.roll = function(user) {
  var game = games[user.name];
  var opponent;
  var point;

  if (!game) {
    thRee.self.whisper(user, "You are not in a game.");
    return;
  }

  if (game.players[game.current] !== user) {
    thRee.self.whisper(user, "It's not your turn.");
    return;
  }

  opponent = game.players[(game.current + 1) % 2];

  point = Math.ceil(Math.random() * 100);
  game.points[game.current] = point;

  thRee.self.whisper(user, "You rolled a " + point);
  thRee.self.whisper(opponent, user.name + " rolled a " + point);

  game.current += 1;

  if (game.current !== 2) {
    thRee.self.whisper(opponent, "Please roll a die by typing \"/simple.roll\".");
  } else {
    if (game.points[0] > game.points[1]) {
      thRee.self.whisper(game.players[0], "You win.");
      thRee.self.whisper(game.players[1], "You lose.");
    } else if (game.points[0] < game.points[1]) {
      thRee.self.whisper(game.players[0], "You lose.");
      thRee.self.whisper(game.players[1], "You win.");
    } else {
      thRee.self.whisper(game.players[0], "Draw.");
      thRee.self.whisper(game.players[1], "Draw.");
    }

    delete games[user.name];
    delete games[opponent.name];

    games[user.name] = undefined;
    games[opponent.name] = undefined;
  }
};

exports = module.exports = thRee;
