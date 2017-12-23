'use strict';

var levelup = require('levelup');

module.exports.setUp = function (leveldown, test, testCommon) {
  test('setUp common', testCommon.setUp);
  test('setUp db', function (t) {
    var db = leveldown(testCommon.location());
    db.open(t.end.bind(t));
  });
};

module.exports.all = function (leveldown, test, testCommon) {
  module.exports.setUp(leveldown, test, testCommon);

  test('test buffer and string base64-encoding equality', function (t) {
    var db = leveldown(testCommon.location());

    db.open(function (err) {
      t.ifError(err, 'no open error');

      db.put('a', 'value', function (err) {
        t.ifError(err, 'no put error');

        // If string keys are not base64-encoded (with the same character
        // mapping as Buffer keys), then 'a' would be > Buffer.from('a').
        var it = db.iterator({ gt: Buffer.from('a') });

        testCommon.collectEntries(it, function (err, entries) {
          t.ifError(err, 'no iterator error');
          t.same(entries.length, 0);

          db.close(t.end.bind(t));
        });
      });
    });
  });

  test('test custom localStorage', function (t) {
    t.plan(5);

    var location = testCommon.location();
    var db = leveldown(location, {
      setItem: function (key, value) {
        t.is(key, location + '!PqKt');
        t.is(value, 'svalue');
      }
    });

    db.open(function (err) {
      t.ifError(err, 'no open error');

      db.put('key', 'value', function (err) {
        t.ifError(err, 'no put error');

        db.close(function (err) {
          t.ifError(err, 'no close error');
        });
      });
    });
  });

  test('test .clear', function (t) {
    t.plan(8);

    var loc1 = testCommon.location();
    var loc2 = testCommon.location();

    var db = leveldown(loc1);
    var db2 = leveldown(loc2);

    db2.put('key2', 'value2', function (err) {
      t.ifError(err, 'no put error');

      db.put('key', 'value', function (err) {
        t.ifError(err, 'no put error');

        db.get('key', { asBuffer: false }, function (err, value) {
          t.ifError(err, 'no get error');
          t.is(value, 'value', 'should have value');

          db.clear(function (err) {
            t.ifError(err, 'no clear error');

            var db3 = leveldown(loc1);

            db3.get('key', { asBuffer: false }, function (err, value) {
              t.ok(err, 'key is not there');

              db2.get('key2', { asBuffer: false }, function (err, value) {
                t.ifError(err, 'no get error');
                t.is(value, 'value2', 'should have value2');
              });
            });
          });
        });
      });
    });
  });

  test('test .clear with multiple dbs', function (t) {
    var loc1 = testCommon.location();
    var loc2 = testCommon.location();
    var loc3 = testCommon.location();

    var db = levelup(leveldown(loc1));
    var db2 = levelup(leveldown(loc2));
    var db3 = levelup(leveldown(loc3));

    db.put('1', '1', function (err) {
      t.notOk(err, 'no error');
      db2.put('1', '1', function (err) {
        t.notOk(err, 'no error');
        db3.put('1', '1', function (err) {
          t.notOk(err, 'no error');
          db2.put('2', '2', function (err) {
            t.notOk(err, 'no error');
            db2.put('3', '3', function (err) {
              t.notOk(err, 'no error');
              db2.db.clear(function (err) {
                t.notOk(err, 'no error');
                db3.get('1', { asBuffer: false }, function (err, res) {
                  t.notOk(err, 'no error');
                  t.is(res, '1');
                  db2 = levelup(leveldown(loc2));
                  db2.get('3', { asBuffer: false }, function (err) {
                    t.ok(err);
                    t.end();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  test('test escaped db name', function (t) {
    var db = levelup(leveldown('bang!'));
    var db2 = levelup(leveldown('bang!!'));

    db.put('!db1', '!db1', function (err) {
      t.notOk(err, 'no error');
      db2.put('db2', 'db2', function (err) {
        t.notOk(err, 'no error');
        db.close(function (err) {
          t.notOk(err, 'no error');
          db2.close(function (err) {
            t.notOk(err, 'no error');

            var db3 = levelup(leveldown('bang!'));

            db3.get('!db2', function (err, key, value) {
              t.ok(err, 'got error');
              t.equal(key, undefined, 'key should be null');
              t.equal(value, undefined, 'value should be null');
              t.end();
            });
          });
        });
      });
    });
  });

  test('delete while iterating', function (t) {
    var db = leveldown(testCommon.location());
    var noerr = function (err) {
      t.error(err, 'no error');
    };
    var noop = function () {};
    var iterator;
    db.open(noerr);
    db.put('a', 'A', noop);
    db.put('b', 'B', noop);
    db.put('c', 'C', noop);
    iterator = db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: 'a' });
    iterator.next(function (err, key, value) {
      t.equal(key, 'a');
      t.equal(value, 'A');
      db.del('b', function (err) {
        t.notOk(err, 'no error');
        iterator.next(function (err, key, value) {
          t.notOk(err, 'no error');
          t.ok(key, 'key exists');
          t.ok(value, 'value exists');
          t.end();
        });
      });
    });
  });

  test('add many while iterating', function (t) {
    var db = leveldown(testCommon.location());
    var noerr = function (err) {
      t.error(err, 'no error');
    };
    var noop = function () {};
    var iterator;
    db.open(noerr);
    db.put('c', 'C', noop);
    db.put('d', 'D', noop);
    db.put('e', 'E', noop);
    iterator = db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: 'c' });
    iterator.next(function (err, key, value) {
      t.equal(key, 'c');
      t.equal(value, 'C');
      db.del('c', function (err) {
        t.notOk(err, 'no error');
        db.put('a', 'A', function (err) {
          t.notOk(err, 'no error');
          db.put('b', 'B', function (err) {
            t.notOk(err, 'no error');
            iterator.next(function (err, key, value) {
              t.notOk(err, 'no error');
              t.ok(key, 'key exists');
              t.ok(value, 'value exists');
              t.ok(key >= 'c', 'key "' + key + '" should be greater than c');
              t.end();
            });
          });
        });
      });
    });
  });

  test('concurrent batch delete while iterating', function (t) {
    var db = leveldown(testCommon.location());
    var noerr = function (err) {
      t.error(err, 'no error');
    };
    var noop = function () {};
    var iterator;
    db.open(noerr);
    db.put('a', 'A', noop);
    db.put('b', 'B', noop);
    db.put('c', 'C', noop);
    iterator = db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: 'a' });
    iterator.next(function (err, key, value) {
      t.equal(key, 'a');
      t.equal(value, 'A');
      db.batch([{
        type: 'del',
        key: 'b'
      }], noerr);
      iterator.next(function (err, key, value) {
        t.notOk(err, 'no error');
        // on backends that support snapshots, it will be 'b'.
        // else it will be 'c'
        t.ok(key, 'key should exist');
        t.ok(value, 'value should exist');
        t.end();
      });
    });
  });

  test('iterate past end of db', function (t) {
    var db = leveldown(testCommon.location());
    var db2 = leveldown(testCommon.location());
    var noerr = function (err) {
      t.error(err, 'no error');
    };
    var noop = function () {};
    var iterator;
    db.open(noerr);
    db2.open(noerr);
    db.put('1', '1', noop);
    db.put('2', '2', noop);
    db2.put('3', '3', noop);
    iterator = db.iterator({ keyAsBuffer: false, valueAsBuffer: false, start: '1' });
    iterator.next(function (err, key, value) {
      t.equal(key, '1');
      t.equal(value, '1');
      t.notOk(err, 'no error');
      iterator.next(function (err, key, value) {
        t.notOk(err, 'no error');
        t.equals(key, '2');
        t.equal(value, '2');
        iterator.next(function (err, key, value) {
          t.notOk(key, 'should not actually have a key');
          t.end();
        });
      });
    });
  });

  test('next() callback is dezalgofied', function (t) {
    var db = leveldown(testCommon.location());
    var noerr = function (err) {
      t.error(err, 'no error');
    };
    var noop = function () {
    };
    var iterator;
    db.open(noerr);
    db.put('1', '1', noop);
    db.put('2', '2', noop);
    iterator = db.iterator({
      keyAsBuffer: false,
      valueAsBuffer: false,
      start: '1'
    });

    var zalgoReleased = false;
    iterator.next(function (err, key, value) {
      zalgoReleased = true;
      t.notOk(err, 'no error');
      var zalgoReleased2 = false;
      iterator.next(function (err, key, value) {
        zalgoReleased2 = true;
        t.notOk(err, 'no error');
        var zalgoReleased3 = false;
        iterator.next(function (err, key, value) {
          zalgoReleased3 = true;
          t.notOk(err, 'no error');
          t.end();
        });
        t.ok(!zalgoReleased3, 'zalgo not released (3)');
      });
      t.ok(!zalgoReleased2, 'zalgo not released (2)');
    });
    t.ok(!zalgoReleased, 'zalgo not released (1)');
  });

  test('bypasses getItem for key streams', function (t) {
    t.plan(3);

    var down = leveldown(testCommon.location());
    var db = levelup(down);

    down._storage.getItem = function () {
      t.fail('shouldn\'t get called for key streams');
    };

    var batch = [
      {
        key: 'a',
        value: '1',
        type: 'put'
      },
      {
        key: 'b',
        value: '2',
        type: 'put'
      },
      {
        key: 'c',
        value: '3',
        type: 'put'
      },
    ];

    db.batch(batch, function (err) {
      t.ifError(err, 'no batch error');

      db.createKeyStream({
        start: 'c',
        keyAsBuffer: false
      })
      .on('data', function (key) {
        t.equals(key, 'c');
      })
      .on('end', function () {
        db.close(function (err) {
          t.ifError(err, 'no close error');
        });
      });
    });
  });
};
