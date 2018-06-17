'use strict';

var Buffer = require('safe-buffer').Buffer;
var d64 = require('d64');

var BUFFER_PREFIX = 'b';
var STRING_PREFIX = 's';

exports.serializeKey = serializeKey;
exports.deserializeKey = deserializeKey;
exports.serializeValue = serializeValue;
exports.deserializeValue = deserializeValue;

function serializeKey (key) {
  if (Buffer.isBuffer(key)) {
    return d64.encode(key);
  } else {
    return d64.encode(Buffer.from(String(key)));
  }
}

function deserializeKey (key, asBuffer) {
  var buf = d64.decode(key);
  return asBuffer ? buf : buf.toString();
}

function serializeValue (value) {
  if (value == null) {
    return STRING_PREFIX;
  } else if (Buffer.isBuffer(value)) {
    return BUFFER_PREFIX + value.toString('base64');
  } else {
    return STRING_PREFIX + value;
  }
}

function deserializeValue (value, asBuffer) {
  var prefix = value[0];
  var str = value.slice(1);

  if (prefix === BUFFER_PREFIX) {
    var buf = Buffer.from(str, 'base64');
    return asBuffer ? buf : buf.toString();
  } else {
    return asBuffer ? Buffer.from(str) : str;
  }
}
