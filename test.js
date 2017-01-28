'use strict';

const {Stats} = require('fs');

const main = require('.');
const {Stats: GracefulFsStats} = require('graceful-fs');
const test = require('tape');

test('validateGlobOpts()', t => {
  t.deepEqual(
    main(),
    [],
    'should return an empty array if it takes no arguments.'
  );

  t.deepEqual(
    main(null),
    [],
    'should return an empty array if it takes falsy value.'
  );

  t.deepEqual(
    main({}),
    [],
    'should return an empty array if it takes an empty object.'
  );

  t.deepEqual(
    main({ignore: 'node_modules'}),
    [],
    'should return an empty array if it takes a valid node-glob options.'
  );

  t.deepEqual(
    main('').map(String),
    ['TypeError: Expected node-glob options to be an object, but got \'\' (empty string).'],
    'should invalidate an empty string.'
  );

  t.deepEqual(
    main(t.fail).map(String),
    ['TypeError: Expected node-glob options to be an object, but got [Function: bound].'],
    'should invalidate a non-object value.'
  );

  t.deepEqual(
    main([1, 2]).map(({message}) => message),
    ['Expected node-glob options to be an object, but got an array [ 1, 2 ].'],
    'should invalidate an array.'
  );

  const results = main({
    sync: false,
    cwd: process.cwd(),
    root: Buffer.from('_'),
    dot: true,
    nomount: 1,
    cache: new Uint8Array(),
    realpathCache: new Uint16Array(),
    statCache: new ArrayBuffer(),
    symlinks: /.+/,
    ignore: new Set([null]),
    symlink: {}
  }).map(String);

  t.strictEqual(results.length, 9, 'should invalidate invalid glob options.');

  t.strictEqual(
    results[0],
    'Error: `sync` option is deprecated and ' +
    'there’s no need to pass any values to that option, but false was provided.',
    'should invalidate deprecated `sync` option.'
  );

  t.strictEqual(
    results[1],
    'TypeError: node-glob expected `root` option to be a directory path (string), but got <Buffer 5f>.',
    'should invalidate non-string directory-related options.'
  );

  t.strictEqual(
    results[2],
    'TypeError: node-glob expected `nomount` option to be a Boolean value, but got 1.',
    'should invalidate boolean options receiving non-boolean value.'
  );

  t.strictEqual(
    results[3],
    'TypeError: node-glob expected `cache` option to be an object, but got Uint8Array [  ].',
    'should invalidate non-object `cache` option.'
  );

  t.strictEqual(
    results[4],
    'TypeError: node-glob expected `realpathCache` option to be an object, but got Uint16Array [  ].',
    'should invalidate non-object `statCache` option.'
  );

  t.strictEqual(
    results[5],
    'TypeError: node-glob expected `statCache` option to be an object, but got ArrayBuffer { byteLength: 0 }.',
    'should invalidate non-object `statCache` option.'
  );

  t.strictEqual(
    results[6],
    'TypeError: node-glob expected `symlinks` option to be an object, but got /.+/.',
    'should invalidate non-object `symlinks` option.'
  );

  t.strictEqual(
    results[7],
    'TypeError: node-glob expected `ignore` option to be an array or string, but got Set { null }.',
    'should invalidate wrong-type `ignore` option.'
  );

  t.strictEqual(
    results[8],
    'Error: node-glob doesn\'t have `symlink` option. Probably you meant `symlinks`.',
    'should invalidate typos.'
  );

  const anotherResults = main({
    cache: {
      '/foo/0': false,
      '/foo/1': true,
      '/foo/2': 'FILE',
      '/foo/3': 'DIR',
      '/foo/4': 1,
      '/foo/5': 'file'
    },
    realpathCache: {
      '/foo/0': 'foo/2',
      '/foo/1': Infinity
    },
    statCache: {
      '/foo/0': new Stats(1, 33188),
      '/foo/1': new GracefulFsStats(1, 16877),
      '/foo/2': Function,
      '/foo/3': {dev: 3}
    },
    symlinks: {
      '/foo/0': true,
      '/foo/1': Symbol('false')
    },
    ignore: ['a', ['b']]
  }).map(String);

  t.strictEqual(
    anotherResults[0],
    'TypeError: Expected every value in the `cache` option to be ' +
    'true, false, \'FILE\', \'DIR\' or an array, but found an invalid value 1 in `/foo/4` property.',
    'should invalidate wrong-type cache.'
  );

  t.strictEqual(
    anotherResults[1],
    'Error: Expected every value in the `cache` option to be ' +
    'true, false, \'FILE\', \'DIR\' or an array, ' +
    'but found an invalid string \'file\' in `/foo/5` property.',
    'should invalidate invalid-string cache.'
  );

  t.strictEqual(
    anotherResults[2],
    'TypeError: Expected every value in the `realpathCache` option to be a string, ' +
    'but found a non-string value Infinity in `/foo/1` property.',
    'should invalidate non-string realpath cache.'
  );

  t.strictEqual(
    anotherResults[3],
    'TypeError: Expected every value in the `statCache` option to be a fs.Stats instance, ' +
    'but found an invalid value [Function: Function] in `/foo/2` property.',
    'should invalidate wrong-type stat cache.'
  );

  t.strictEqual(
    anotherResults[4],
    'Error: Expected every value in the `statCache` option to be a fs.Stats instance, ' +
    'but found an invalid object { dev: 3 } in `/foo/3` property, which doesn\'t have a valid file mode.',
    'should invalidate broken stat cache.'
  );

  t.strictEqual(
    anotherResults[5],
    'TypeError: Expected every value in the `symlink` option to be Boolean, ' +
    'but found an invalid value Symbol(false) in `/foo/1` property.',
    'should invalidate non-boolean symlink cache.'
  );

  t.strictEqual(
    anotherResults[6],
    'TypeError: Expected every value in the `ignore` option to be a string, ' +
    'but the array includes a non-string value [ \'b\' ].',
    'should invalidate non-string ignore pattern.'
  );

  t.end();
});

