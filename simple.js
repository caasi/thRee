var thRee   = require("./three");

/* simple game */
var games = {};

var simple = function(user, opponentName) {
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

simple.help = function(user) {
  thRee.self.whisper(user, "Play a small game with another user by typing \"/simple <opponent>\". You can abort the game by typing \"/simple.abort\".");
};

simple.accept = function(user) {
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

simple.abort = function(user) {
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

simple.roll = function(user) {
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

thRee.exts.simple = simple;
