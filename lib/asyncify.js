'use strict';

var nextTick = require('./nexttick');

module.exports = function asyncify (arity, fn) {
  if (arity === 0) {
    return function (callback) {
      try {
        var ret = fn.apply(this);
      } catch (err) {
        return nextTick(function() {
          callback(err);
        });
      }

      nextTick(function() {
        callback(null, ret);
      });
    };
  } else if (arity === 1) {
    return function (arg1, callback) {
      if (typeof arg1 === 'function') {
        callback = arg1;
        arg1 = undefined;
      }

      try {
        var ret = fn.call(this, arg1);
      } catch (err) {
        return nextTick(function() {
          callback(err);
        });
      }

      nextTick(function() {
        callback(null, ret);
      });
    };
  } else if (arity === 2) {
    return function (arg1, arg2, callback) {
      if (typeof arg2 === 'function') {
        callback = arg2;
        arg2 = undefined;
      }

      try {
        var ret = fn.call(this, arg1, arg2);
      } catch (err) {
        return nextTick(function() {
          callback(err);
        });
      }

      nextTick(function() {
        callback(null, ret);
      });
    };
  } else if (arity === 3) {
    return function (arg1, arg2, arg3, callback) {
      if (typeof arg3 === 'function') {
        callback = arg3;
        arg3 = undefined;
      }

      try {
        var ret = fn.call(this, arg1, arg2, arg3);
      } catch (err) {
        return nextTick(function() {
          callback(err);
        });
      }

      nextTick(function() {
        callback(null, ret);
      });
    };
  } else {
    throw new RangeError('arity must be >= 0 <= 3');
  }
};
