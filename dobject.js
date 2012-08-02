var Ree   = require("ree");
var utils = require("./utils");

var validate = function(o) {
  var ret;

  if (Array.isArray(o)) {
    ret = o;
  } else if (utils.type.isFunction(o)) {
    ret = o;
  } else if (utils.type.isNumber(o) || utils.type.isString(o)) {
    ret = o;
  } else {
    if (o.type && o.type === "function") {
      ret = function () {};
    } else {
      ret = o;
    }
  }

  if (utils.type.isFunction(o) || utils.type.isObject(o)) {
    Object.keys(o).forEach(function(key) {
      if (key === "type") return;
      ret[key] = validate(o[key]);
    });
  }

  return ret;
};

var expose = function(o) {
  var ret;

  if (Array.isArray(o)) {
    ret = o;
  } else if (utils.type.isFunction(o)) {
    ret = { type: "function" };
  } else if (utils.type.isNumber(o) || utils.type.isString(o)) {
    ret = o;
  } else {
    ret = {};
  }

  if (ret !== o) {
    Object.keys(o).forEach(function(key) {
      ret[key] = expose(o[key]);
    });
  }

  return ret;
};

var DObject = {};

DObject.validate = validate;
DObject.expose = expose;

exports = module.exports = DObject;
