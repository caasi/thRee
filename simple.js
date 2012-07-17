var thRee   = require("./three");

/* the game */
var games = {};
var simple, key;

var ask, wait, roll;
var strategies = {
  ask: {},
  wait: {},
  roll: {}
};

var game = function(user, opponentName) {
  var opponent = thRee.userForName(opponentName);
  var players;

  if (!opponent) {
    thRee.self.whisper(user, "Opponent not found.");
    return;
  };
  
  players = {};

  players[user.name] = {
    user: user,
    opponent: undefined,
    score: 0,
    strategy: strategies.wait
  };

  players[opponent.name] = {
    user: opponent,
    opponent: undefined,
    score: 0,
    strategy: strategies.ask
  };

  players[user.name].opponent = players[opponent.name];
  players[opponent.name].opponent = players[user.name];

  games[user.name] = games[opponent.name] = {
    players: players,
  };

  thRee.self.
    whisper(user, "Wait for " + opponent.name + ".").
    whisper(opponent, user.name + " wants to play a game, you can accept it by typing \"/simple.accept\".");
};

game.accept = function(user) {
  var game = games[user.name];
  var userPlayer = game.players[user.name];
  var opponentPlayer = userPlayer.opponent;

  userPlayer.strategy = strategies.wait;
  opponentPlayer.strategy = strategies.roll;

  thRee.self.
    whisper(user, "Thanks, time for " + opponentPlayer.user.name + " to roll.").
    whisper(opponentPlayer.user, user.name + " is ready.").
    whisper(opponentPlayer.user, "please roll by \"/simple.roll\".");
};

game.abort = function(user) {
  var players = games[user.name].players;
  var opponentPlayer = players[user.name].opponent;
  var opponent = opponentPlayer.user;
  var msg = user.name + " runs away, game abort.";

  thRee.self.whisper(user, msg);
  thRee.self.whisper(opponent, msg);

  delete opponentPlayer.opponent;
  delete players[user.name].opponent;
  delete games[user.name];

  games[user.name] = undefined;
  games[opponent.name] = undefined;
};

game.roll = function(user) {
  var players = games[user.name].players;
  var userPlayer = players[user.name];
  var opponentPlayer = userPlayer.opponent;
  var opponent = opponentPlayer.user;
  var score = Math.ceil(Math.random() * 100);
  var winner, loser;

  userPlayer.score = score;

  thRee.self.
    whisper(user, "You rolled a " + score + ".").
    whisper(opponent, user.name + " rolled a " + score + ".");

  if (!opponentPlayer.score) {
    userPlayer.strategy = strategies.wait;
    opponentPlayer.strategy = strategies.roll;

    thRee.self.
      whisper(user, "Time for " + opponent.name + " to roll.").
      whisper(opponent, "Please roll by \"/simple.roll\".");
  } else {
    if (userPlayer.score !== opponentPlayer.score) {
      if (userPlayer.score > opponentPlayer.score) {
        winner = user;
        loser = opponent;
      } else {
        winner = opponent;
        loser = user;
      }

      thRee.self.
        whisper(winner, "You win.").
        whisper(loser, "You lose.");
    } else {
      thRee.self.
        whisper(user, "Draw.").
        whisper(opponent, "Draw.");
    }

    delete opponentPlayer.opponent;
    delete players[user.name].opponent;
    delete games[user.name];

    games[user.name] = undefined;
    games[opponent.name] = undefined;
  }
};

thRee.on("leave", function(user) {
  var currentGame = games[user.name];

  if (currentGame) {
    game.abort(user);
  }
});

/* the strategies */
for (key in strategies) {
  if (strategies.hasOwnProperty(key)) {
    strategies[key] = Object.create(game);
  }
}

strategies.ask.roll = function(user) {
  thRee.self.whisper(user, "You haven't answer yet.");
};

strategies.wait.accept =
strategies.wait.roll = function(user) {
  thRee.self.whisper(user, "Please wait for your opponent.");
};

strategies.roll.accept = function(user) {
  thRee.self.whisper(user, "Type \"/simple.roll\" please.");
};

/* the wrap */
simple = function(user, opponentName) {
  var currentGame = games[user.name];

  if (!currentGame) {
    game(user, opponentName);
  } else {
    thRee.self.whisper(user, "You are already in a game.");
  }
};

for (key in game) {
  if (game.hasOwnProperty(key)) {
    (function(key) {
      simple[key] = function(user) {
        var currentGame = games[user.name];
        var strategy;

        if (!currentGame) {
          thRee.self.whisper(user, "You are not in a game.");
          return;
        }

        strategy = currentGame.players[user.name].strategy;
        strategy[key].apply(strategy, arguments);
      }
    }(key));
  }
}

simple.help = function(user) {
  thRee.self.
    whisper(user, "Play a small game with another user by typing \"/simple <opponent>\".").
    whisper(user, "You can abort the game by typing \"/simple.abort\".");
};

thRee.exts.simple = simple;
