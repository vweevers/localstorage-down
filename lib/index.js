'use strict';

var inherits = require('inherits');
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN;
var serializer = require('./serializer');
var asyncify = require('./asyncify');
var WebstorageIterator = require('./iterator');
var defaultStorage = require('./storage');

function WebstorageDown (prefix, storage) {
  if (!(this instanceof WebstorageDown)) {
    return new WebstorageDown(prefix, storage);
  }

  AbstractLevelDOWN.call(this, '');

  if (typeof prefix !== 'string' || prefix === '') {
    throw new TypeError('prefix must be a string and not empty');
  }

  // Escape bangs in prefix
  this._prefix = prefix.replace(/!/g, '!!') + '!';
  this._storage = storage || defaultStorage();
}

inherits(WebstorageDown, AbstractLevelDOWN);

WebstorageDown.prototype._put = asyncify(3, function (key, value, options) {
  this._storage.setItem(this._prefix + key, value);
});

WebstorageDown.prototype._get = asyncify(2, function (key, options) {
  var value = this._storage.getItem(this._prefix + key);

  if (value == null) {
    throw new Error('NotFound');
  }

  return serializer.deserializeValue(value, options.asBuffer);
});

WebstorageDown.prototype._del = asyncify(2, function (key, options) {
  this._storage.removeItem(this._prefix + key);
});

WebstorageDown.prototype._batch = asyncify(2, function (operations, options) {
  for (var i = 0; i < operations.length; i++) {
    var op = operations[i];

    if (op.type === 'del') {
      this._storage.removeItem(this._prefix + op.key);
    } else if (op.type === 'put') {
      this._storage.setItem(this._prefix + op.key, op.value);
    }
  }
});

WebstorageDown.prototype._serializeKey = serializer.serializeKey;
WebstorageDown.prototype._serializeValue = serializer.serializeValue;

WebstorageDown.prototype._iterator = function (options) {
  return new WebstorageIterator(this, options);
};

WebstorageDown.prototype.clear = asyncify(1, function (options) {
  var keys = this._getKeys(options);

  for (var i = 0; i < keys.length; i++) {
    this._storage.removeItem(this._prefix + keys[i]);
  }
});

WebstorageDown.prototype._getKeys = function (options) {
  if (options == null) {
    options = {};
  }

  // abstract-leveldown doesn't serialize range options.
  // See https://github.com/Level/abstract-leveldown/issues/130
  var lt = 'lt' in options ? serializer.serializeKey(options.lt) : undefined;
  var lte = 'lte' in options ? serializer.serializeKey(options.lte) : undefined;
  var gt = 'gt' in options ? serializer.serializeKey(options.gt) : undefined;
  var gte = 'gte' in options ? serializer.serializeKey(options.gte) : undefined;
  var start = 'start' in options ? serializer.serializeKey(options.start) : undefined;
  var end = 'end' in options ? serializer.serializeKey(options.end) : undefined;

  var keys = this._someKeys(function (key) {
    if (key >= lt || key > lte) { return false; }
    if (key <= gt || key < gte) { return false; }

    // Legacy ranges. Where to start and/or end reading, inclusive.
    if (options.reverse ? key > start : key < start) { return false; }
    if (options.reverse ? key < end : key > end) { return false; }

    return true;
  });

  keys.sort();

  if (options.reverse) {
    keys.reverse();
  }

  return keys;
};

WebstorageDown.prototype._someKeys = function (test) {
  var prefixLength = this._prefix.length;
  var length = this._storage.length;
  var result = [];
  var i = -1;

  while (++i < length) {
    var key = this._storage.key(i);

    if (key != null && key.substring(0, prefixLength) === this._prefix) {
      key = key.substring(prefixLength);

      if (test(key)) {
        result.push(key);
      }
    }
  }

  return result;
};

module.exports = WebstorageDown;
