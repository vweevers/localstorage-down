'use strict';

module.exports = function () {
  var storage = global.localStorage;

  if (storage == null) {
    throw new TypeError('localStorage is not available');
  }

  return storage;
};
