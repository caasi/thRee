var winston = require("winston");
var logger =  new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      colorize:   true,
      level:      "debug",
      timestamp:  true
    })
  ],
  levels: {
    error:  3,
    info:   2,
    chat:   1,
    debug:  0
  },
  colors: {
    error:  "red",
    info:   "yellow",
    chat:   "blue",
    debug:  "grey"
  }
});

exports = module.exports = logger;
