# webstorage-down

> An [`abstract-leveldown`] compliant [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) wrapper for mobile and desktop browsers.

Use the [level](http://github.com/level) ecosystem on any browser that supports `localStorage` or `sessionStorage`. The scenarios envisaged are:

1. Small data sets
2. Occasionally connected clients
3. Ad-hoc networks where clients need to sync directly with each other

## differences from `localstorage-down`

This is an upgrade to latest [`abstract-leveldown`], modern use of Buffers, and simplicity:

- Support Buffer keys and fetching Buffers as strings and vice versa
- Remove obsolete `ArrayBuffer` and `Uint8Array` formats
- Keys and values written with `localstorage-down` are _*not*_ compatible.
- Remove the `LocalStorageCore` layer, while still supporting custom storages that conform to the [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface. This reduces our scope to a wrapper of synchronous, global storages. Any other should not use `webstorage-down` or lose the potential of increased [`abstract-leveldown`] compliance.
- Don't maintain in-memory list of keys (no need)
- Fetch keys synchronously upon creation of an iterator. Snapshotting keys early brings our behavior closer to `leveldown`, though we can never provide full snapshot guarantees.
- `localstorage-down` uses `humble-localstorage` as a wrapper for `localStorage`
because it falls back to an in-memory implementation in environments without
`localStorage`. However, `humble-localstorage` feature-detects by writing to `localStorage` on startup, falls back to memory on *any* error and unexpectedly doesn't persist. A quota error for example, should be exposed to and handled by the consumer. So `webstorage-down` is dumb: it assumes localStorage is available in browsers and only uses an in-memory replacement for Node.
- Ditching `humble-localstorage` also removes a redundant JSON encoding layer.
- Remove `TaskQueue` which made all operations sequential
- Replace `destroy()` with `db.clear()` (also supports range options).
- Has the same unit tests as `localstorage-down` to avoid regression.

## install

```
npm install localstorage-down
```

## Browser support

Basically we support [any browser that has LocalStorage](http://caniuse.com/namevalue-storage), but since we also rely on an ES5 environment due to dependencies from [abstract-leveldown](https://github.com/Level/abstract-leveldown), in practice you will need the following shims in order to work correctly on all browsers (e.g. IE 8-9, Android 2.3):

* ~~[typedarray](https://github.com/substack/typedarray) for binary storage~~
* [es5-shim](https://github.com/es-shims/es5-shim) for just about everything

We run [automated tests](http://travis-ci.org/No9/localstorage-down) in the following browsers:

* **Firefox**: 40-latest
* **Chrome**: 44-beta
* **IE**: 9-11
* **Edge**: latest
* **Safari**: 7.0-latest
* **iPhone**: 8.0-latest
* **Android**: 4.1-latest

In Node this module will fall back to an in-memory implementation.

## Example

At the command prompt in your chosen directory :

    npm install localstorage-down
    npm install levelup
    npm install browserify -g
    npm install beefy -g

Create a file called `index.js` and enter the following:

```js
var localstorage = require('localstorage-down');
var levelup = require('levelup');
var db = levelup('dbname', { db: localstorage });

db.put('name', 'James Dean');
db.put('dob', 'February 8, 1931');
db.put('occupation', 'Rebel');
db.put('cause', 'none');

db.readStream()
   .on('data', function (data) {
      if (typeof data.value !== 'undefined') {
         console.log(data.key, '=', data.value);
      }
   })
   .on('error', function (err) {
      console.log('Oh my!', err);
   })
   .on('close', function () {
      console.log('Stream closed');
   })
   .on('end', function () {
     console.log('Stream ended');
   });
```

Publish the site :

    beefy index.js

See the output :

[http://localhost:9966](http://localhost:9966)

Listen to John Cage:

https://www.youtube.com/watch?v=9hVFCmK6GgM

## Tests

    npm run test

This will run tests in Node against `localstorage-memory`.

To test in Saucelabs, you can run e.g.:

    npm run test-browser

Or to test in Zuul locally:

    npm run test-zuul-local

To test and check code coverage, run:

    npm run coverage

To test and report code coverage to Coveralls, run:

    npm run report-coverage

##  Contributors

* [Anton Whalley](https://github.com/no9)
* [Adam Shih](https://github.com/adamshih)
* [Nolan Lawson](https://github.com/nolanlawson)
* [Many more!](https://github.com/No9/localstorage-down/graphs/contributors)

[`abstract-leveldown`]: https://github.com/Level/abstract-leveldown/
