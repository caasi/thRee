var Agent   = require("./agent");

var validate = function() {
  var self = this;
  var type = typeof this;

  if (!Array.isArray(this) && (type === "function" || type === "object")) {
    Object.keys(this).forEach(function(key) {
      if (self[key].type && self[key].type === "function") {
        self[key] = function () {};
      }

      validate.call(self[key]);
    });
  }

  return this;
};

var expose = function() {
  var self = this;
  var type = typeof this;
  var ret;

  if (Array.isArray(this)) {
    ret = this;
  } else if (type === "function") {
    ret = { type: type };
  } else if (type === "object") {
    ret = {};
  } else {
    ret = this;
  }

  if (ret !== this) {
    Object.keys(this).forEach(function(key) {
      ret[key] = expose.call(self[key]);
    });
  }

  return ret;
};

var exec = function(cmd) {
  var prev;
  var current;

  current = this;

  cmd.keypath.forEach(function(key) {
    if (!current) return;

    prev = current;
    current = current[key];
  });

  if (cmd.type === "msg") {
    current.apply(prev, cmd.args);
  } else {
    if (cmd.type === "get") {
      return prev[cmd.keypath[cmd.keypath.length - 1]];
    }
    if (cmd.type === "set") {
      prev[cmd.keypath[cmd.keypath.length - 1]] = cmd.args[0];
    }
  }
};

var DObject = function(o) {
  var agent = Agent(o);

  agent.expose = function() {
    return expose.call(o);
  };

  agent.exec = function(cmd) {
    return exec.call(o, cmd);
  };

  return agent;
};

DObject.validate = function(o) {
  return validate.call(o);
};

DObject.expose = function(o) {
  return expose.call(o);
};

DObject.exec = function(o, cmd) {
  return exec.call(o, cmd);
};

exports = module.exports = DObject;
