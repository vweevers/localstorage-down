'use strict';

/* jshint ignore:start */

require('es5-shim');

var test   = require('tape');
var webstorage = require('../');
var testCommon = require('./testCommon');

require('abstract-leveldown/abstract/leveldown-test').args(webstorage, test);
require('abstract-leveldown/abstract/open-test').setUp(test, testCommon);
require('abstract-leveldown/abstract/open-test').args(webstorage, test, testCommon);
require('abstract-leveldown/abstract/open-test').open(webstorage, test, testCommon);

// Skip createIfMissing and errorIfExists tests
// require('abstract-leveldown/abstract/open-test').openAdvanced(webstorage, test, testCommon);

require('abstract-leveldown/abstract/open-test').tearDown(test, testCommon);
require('abstract-leveldown/abstract/del-test').all(webstorage, test, testCommon);
require('abstract-leveldown/abstract/put-test').all(webstorage, test, testCommon);
require('abstract-leveldown/abstract/get-test').all(webstorage, test, testCommon);
require('abstract-leveldown/abstract/put-get-del-test').all(webstorage, test, testCommon);
require('abstract-leveldown/abstract/close-test').close(webstorage, test, testCommon);
require('abstract-leveldown/abstract/iterator-test').setUp(webstorage, test, testCommon);
require('abstract-leveldown/abstract/iterator-test').args(test);
require('abstract-leveldown/abstract/iterator-test').sequence(test);
require('abstract-leveldown/abstract/iterator-test').iterator(webstorage, test, testCommon);

// Skip snapshot test, we cannot offer such guarantees.
// require('abstract-leveldown/abstract/iterator-test').snapshot(webstorage, test, testCommon);

require('abstract-leveldown/abstract/iterator-test').tearDown(test, testCommon);
require('abstract-leveldown/abstract/iterator-range-test').all(webstorage, test, testCommon);
require('abstract-leveldown/abstract/chained-batch-test').all(webstorage, test, testCommon);

require('abstract-leveldown/abstract/batch-test').all(webstorage, test, testCommon);

require('./custom-tests.js').all(webstorage, test, testCommon);
