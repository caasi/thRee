/** @namespace */
var utils = {};
    utils.type = {};

/**
 * map a function on an object, skip string, because string's children are also strings.
 * @param {object} o The object you want to process.
 * @param {function} func The function which will be apply to the object and it's children.
 * @return {object} Processed object and it's key.
 */
function kvmap(o, func) {
  var i;
  var kvpair;
  var result = {};

  if (typeof o !== "string") {
    for (i in o) {
      if (o.hasOwnProperty(i)) {
        kvpair = func({ key: i, value: o[i] });

        if (kvpair.key !== null) {
          result[kvpair.key] = kvpair.value;
        }
      }
    }
  }

  return result;
}

/**
 * Apply actions on a object and it's children, based on the descriptions in strategy array.
 * @param {object} o The object.
 * @param {array} strategies The strategy array.
 * @return {object} Processed object and it's key.
 */
function skvmap(o, strategies) {
  /** The basic structure of a strategy are a test and a function that processes the object. */
  var defaultStrategies = [
    {
      /**
       * @param {key value pair} kvpair The value you want to test.
       * @return {bool} If you pass the test or not, in this case, you always pass the test.
       */
      test: function(kvpair) { return true; },
      /**
       * @param {key value pair} kvpair The value you want to process.
       * @return {key value pair} Processed key value pair, in this case, it's itself.
       */
      apply: function(kvpair) { return kvpair; }
    }
  ];

  /** Strategies execute in sequence */
  strategies = strategies.concat(defaultStrategies);

  return kvmap(
    o,
    function(kvpair) {
      var i;
      var len = strategies.length;
      var strategy;

      for (i = 0; i < len; i = i + 1) {
        strategy = strategies[i];
        if (strategy.test(kvpair)) {
          return strategy.apply(kvpair);
        }
      }

      throw {
        name: "Strategies gone wrong!",
        message: "Something is wrong in default strategies."
      };
    }
  );
}

function isObject(o) {
  return o === Object(o);
}

function isFunction(o) {
  return typeof o === "function";
}

function isString(o) {
  return Object.prototype.toString.call(o) === "[object String]";
}

function isNumber(o) {
  return Object.prototype.toString.call(o) === "[object Number]";
}

function isObjectID(o) {
  return o && o.equals && o.getTimestamp;
}

function mayBeObjectID(str) {
  return str && typeof str === "string" && str.length === 24;
}

function isObservable(o) {
  return o && o.observable;
}

function isObservableArray(o) {
  return o && o.observable && o.observable === "array";
}

function isObservableValue(o) {
  return o && o.observable && o.observable === "accessor";
}

utils.kvmap = kvmap;
utils.skvmap = skvmap;
utils.type.nullFunction = function() {};
utils.type.isObject = isObject;
utils.type.isFunction = isFunction;
utils.type.isString = isString;
utils.type.isNumber = isNumber;
utils.type.isObjectID = isObjectID;
utils.type.mayBeObjectID = mayBeObjectID;
utils.type.isObservable = isObservable;
utils.type.isObservableArray = isObservableArray;
utils.type.isObservableValue = isObservableValue;

exports = module.exports = utils;
