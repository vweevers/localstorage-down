'use strict';

var inherits = require('inherits');
var AbstractIterator = require('abstract-leveldown').AbstractIterator;
var nextTick = require('./nexttick');
var serializer = require('./serializer');

function WebstorageIterator (db, options) {
  AbstractIterator.call(this, db);

  this._storage = db._storage;
  this._prefix = db._prefix;
  this._keys = db._getKeys(options);

  this._limit = options.limit >= 0 ? options.limit : Infinity;
  this._keyAsBuffer = options.keyAsBuffer;
  this._valueAsBuffer = options.valueAsBuffer;
  this._includeKeys = options.keys;
  this._includeValues = options.values;

  this._pos = 0;
  this._count = 0;
}

inherits(WebstorageIterator, AbstractIterator);

WebstorageIterator.prototype._next = function (callback) {
  if (this._pos === this._keys.length || this._count >= this._limit) {
    // Done reading.
    return nextTick(callback);
  }

  var key = this._keys[this._pos++];
  var value;

  try {
    if (this._includeValues) {
      value = this._storage.getItem(this._prefix + key);

      if (value == null) {
        // Skip entry that was removed in the meantime.
        return nextTick(this._next.bind(this, callback));
      }

      value = serializer.deserializeValue(value, this._valueAsBuffer);
    }

    if (this._includeKeys) {
      key = serializer.deserializeKey(key, this._keyAsBuffer);
    } else {
      key = undefined;
    }
  } catch (err) {
    return nextTick(function() { callback(err); });
  }

  this._count++;

  nextTick(function() {
    callback(null, key, value);
  });
};

module.exports = WebstorageIterator;
