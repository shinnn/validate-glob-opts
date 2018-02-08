'use strict';

const {Stats} = require('fs');

const main = require('.');
const GracefulFsStats = require('graceful-fs').Stats;
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
		['Expected node-glob options to be an object, but got [ 1, 2 ] (array).'],
		'should invalidate an array.'
	);

	const results = main({
		sync: false,
		cwd: process.cwd(),
		root: Buffer.from('_'),
		dot: true,
		nomount: 1,
		nodir: true,
		mark: true,
		cache: new Uint8Array(),
		realpathCache: new Uint16Array(),
		statCache: new WeakMap(),
		symlinks: /.+/,
		ignore: new Set([null]),
		symlink: {}
	}).map(String);

	t.equal(results.length, 10, 'should invalidate invalid glob options.');

	t.equal(
		results[0],
		'Error: `sync` option is deprecated and ' +
    'there’s no need to pass any values to that option, but false was provided.',
		'should invalidate deprecated `sync` option.'
	);

	t.equal(
		results[1],
		'TypeError: node-glob expected `root` option to be a directory path (string), but got <Buffer 5f>.',
		'should invalidate non-string directory-related options.'
	);

	t.equal(
		results[2],
		'TypeError: node-glob expected `nomount` option to be a Boolean value, but got 1 (number).',
		'should invalidate boolean options receiving non-boolean value.'
	);

	t.equal(
		results[3],
		'TypeError: Expected `mark` option not to be `true` when `nodir` option is `true`, because there is no need to differentiate directory paths from file paths when `nodir` option is enabled, but got `true`.',
		'should disallow `mark` option to be enabled along with `nodir` option.'
	);

	t.equal(
		results[4],
		'TypeError: node-glob expected `cache` option to be an object, but got Uint8Array [  ].',
		'should invalidate non-object `cache` option.'
	);

	t.equal(
		results[5],
		'TypeError: node-glob expected `realpathCache` option to be an object, but got Uint16Array [  ].',
		'should invalidate non-object `statCache` option.'
	);

	t.equal(
		results[6],
		'TypeError: node-glob expected `statCache` option to be an object, but got WeakMap {}.',
		'should invalidate non-object `statCache` option.'
	);

	t.equal(
		results[7],
		'TypeError: node-glob expected `symlinks` option to be an object, but got /.+/ (regexp).',
		'should invalidate non-object `symlinks` option.'
	);

	t.equal(
		results[8],
		'TypeError: node-glob expected `ignore` option to be an array or string, but got Set { null }.',
		'should invalidate wrong-type `ignore` option.'
	);

	t.equal(
		results[9],
		'Error: node-glob doesn\'t have `symlink` option. Probably you meant `symlinks`.',
		'should invalidate typos.'
	);

	const anotherResults = main({
		nodir: true,
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

	t.equal(
		anotherResults[0],
		'TypeError: Expected every value in the `cache` option to be true, false, \'FILE\', \'DIR\' ' +
    'or an array, but found an invalid value 1 (number) in `/foo/4` property.',
		'should invalidate wrong-type cache.'
	);

	t.equal(
		anotherResults[1],
		'Error: Expected every value in the `cache` option to be ' +
    'true, false, \'FILE\', \'DIR\' or an array, ' +
    'but found an invalid string \'file\' in `/foo/5` property.',
		'should invalidate invalid-string cache.'
	);

	t.equal(
		anotherResults[2],
		'TypeError: Expected every value in the `realpathCache` option to be a string, ' +
    'but found a non-string value Infinity (number) in `/foo/1` property.',
		'should invalidate non-string realpath cache.'
	);

	t.equal(
		anotherResults[3],
		'TypeError: Expected every value in the `statCache` option to be a fs.Stats instance, ' +
    'but found an invalid value [Function: Function] in `/foo/2` property.',
		'should invalidate wrong-type stat cache.'
	);

	t.equal(
		anotherResults[4],
		'Error: Expected every value in the `statCache` option to be a fs.Stats instance, ' +
    'but found an invalid object { dev: 3 } in `/foo/3` property, which doesn\'t have a valid file mode.',
		'should invalidate broken stat cache.'
	);

	t.equal(
		anotherResults[5],
		'TypeError: Expected every value in the `symlink` option to be Boolean, ' +
    'but found an invalid value Symbol(false) in `/foo/1` property.',
		'should invalidate non-boolean symlink cache.'
	);

	t.equal(
		anotherResults[6],
		'TypeError: Expected every value in the `ignore` option to be a string, ' +
    'but the array includes a non-string value [ \'b\' ] (array).',
		'should invalidate non-string ignore pattern.'
	);

	t.end();
});

test('validateGlobOpts() with custom validations', t => {
	t.deepEqual(
		main({noExt: true}, [
			obj => new Error(`Error!: ${Object.keys(obj).join('')}`),
			() => new TypeError('TypeError!')
		]).map(String),
		[
			'Error: node-glob doesn\'t have `noExt` option. Probably you meant `noext`.',
			'Error: Error!: noExt',
			'TypeError: TypeError!'
		],
		'should apply custom validations.'
	);

	t.deepEqual(
		main({}, []).map(String),
		[],
		'should apply no custom validations if the array is empty.'
	);

	t.throws(
		() => main({}, Math.sign),
		/^TypeError.* Expected an array of functions, but got a non-array value \[Function: sign]\./,
		'should throw an error when the second argument is a non-array value.'
	);

	t.throws(
		() => main({}, [0.5]),
		/^TypeError.*found a non-function value in the array: 0\.5 \(at 0\)\./,
		'should throw an error when the second argument includes a non-function value.'
	);

	t.throws(
		() => main({}, [{a: 0}, Number, '?']),
		/^TypeError.*found non-function values in the array: { a: 0 } \(at 0\) and '\?' \(at 2\)\./,
		'should throw an error when the second argument includes non-function values.'
	);

	t.throws(
		() => main({}, [() => null, () => []]),
		/^TypeError.*Expected an additional validation function to return an error, but returned \[] \(array\)\./,
		'should throw an error when the custom validation returns a non-error value.'
	);

	t.end();
});

test('validateGlobOpts() with too many arguments', t => {
	t.throws(
		() => main({}, [], null),
		/^TypeError: Expected 0, 1 or 2 arguments \(\[<object>, <array>]\), but got 3\./,
		'should throw an error.'
	);

	t.end();
});
