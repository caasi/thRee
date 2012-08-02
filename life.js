var Life = function(width, height) {
  var i, _judge, _setNeighbors, _getNeighbors, _neighbors;
  var ret = {};

  ret.width = Math.floor(width) || 10;
  ret.height = Math.floor(height) || 10;

  ret.world = [];
  _neighbors = [];

  for (i = ret.width * ret.height; i > 0;) {
    i -= 1;
    ret.world[i] = false;
    _neighbors[i] = 0;
  }

  _setNeighbors = function(x, y, n) {
    x = x % ret.width;
    y = y % ret.height;
    _neighbors[x + y * ret.width] = n;
  };

  _getNeighbors = function(x, y) {
    x = x % ret.width;
    y = y % ret.height;
    return _neighbors[x + y * ret.width];
  };

  _judge = function(x, y, state) {
    var i, j;
    for (j = -1; j <= 1; j += 1) {
      for (i = -1; i <= 1; i += 1) {
        if (i === 0 && j === 0) continue;
        _setNeighbors(x + i, y + j, _getNeighbors(x + i, y + j) + state);
      }
    }
  };

  ret.debug = function() {
    var x, y, line = "";

    for (y = 0; y < this.height; y += 1) {
      for (x = 0; x < this.width; x += 1) {
        line += this.getWorld(x, y) ? "#" : ".";
      }
      line += "\n";
    }
    for (y = 0; y < this.height; y += 1) {
      for (x = 0; x < this.width; x += 1) {
        line += _getNeighbors(x, y);
      }
      line += "\n";
    }

    return line;
  };

  ret.setWorld = function(x, y, state) {
    x = x % this.width;
    y = y % this.height;
    this.world[x + y * this.width] = state;
    _judge(x, y, state ? 1 : -1);
  };

  ret.getWorld = function(x, y) {
    x = x % this.width;
    y = y % this.height;
    return this.world[x + y * this.width];
  };

  ret.born = function(x, y) {
    this.setWorld(x, y, true);
  };

  ret.die = function(x, y) {
    this.setWorld(x, y, false);
  };

  ret.tick = function() {
    var self = this;
    var x, y, neighbors, isAlive, willBorn = [], willDie = [];

    for (y = 0; y < this.height; y += 1) {
      for (x = 0; x < this.width; x += 1) {
        // lame code XD
        isAlive = self.getWorld(x, y);
        neighbors = _getNeighbors(x, y);
        if (isAlive && neighbors < 2) willDie.push({ x: x, y: y });
        if (isAlive && neighbors > 3) willDie.push({ x: x, y: y });
        if (!isAlive && neighbors === 3) willBorn.push({ x: x, y: y });
      }
    }

    willBorn.forEach(function(o) {
      self.born(o.x, o.y);
    });

    willDie.forEach(function(o) {
      self.die(o.x, o.y);
    });
  };

  return ret;
};

module.exports = exports = Life;
