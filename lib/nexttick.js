'use strict';

// see http://stackoverflow.com/a/15349865/680742
module.exports = global.setImmediate || process.nextTick;
