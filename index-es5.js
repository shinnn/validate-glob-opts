/*!
 * validate-glob-opts | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/validate-glob-opts
*/
'use strict';

var inspect = require('util').inspect;

var isPlainObj = require('is-plain-obj');

var ERROR_MESSAGE = 'Expected node-glob options to be an object';
var INVALID_CACHE_MESSAGE = 'Expected every value in the `cache` option to be ' +
                              'true, false, \'FILE\', \'DIR\' or an array';

var INVALID_STAT_CACHE_MESSAGE = 'Expected every value in the `statCache` option to be a ' +
                                   'fs.Stats instance';

var pathOptions = ['cwd', 'root'];
var booleanOptions = [
  'dot',
  'nomount',
  'mark',
  'nosort',
  'stat',
  'silent',
  'strict',
  'nounique',
  'nonull',
  'debug',
  'nobrace',
  'noglobstar',
  'noext',
  'nocase',
  'matchBase',
  'nodir',
  'follow',
  'realpath',
  'absolute'
];
var typos = {
  noMount: 'nomount',
  nouniq: 'nounique',
  noUnique: 'nounique',
  noNull: 'nonull',
  noBrace: 'nobrace',
  noGlobStar: 'noglobstar',
  noExt: 'noext',
  noCase: 'nocase',
  matchbase: 'matchBase',
  noDir: 'nodir',
  realPath: 'realpath',
  caches: 'cache',
  statcache: 'statCache',
  statCaches: 'statCache',
  symlink: 'symlinks'
};

module.exports = function validateGlobOpts(obj) {
  if (obj === '') {
    return [new TypeError((ERROR_MESSAGE + ", but got '' (empty string)."))];
  }

  if (!obj) {
    return [];
  }

  if (typeof obj !== 'object') {
    return [new TypeError((ERROR_MESSAGE + ", but got " + (inspect(obj)) + "."))];
  }

  if (Array.isArray(obj)) {
    return [new TypeError(("Expected node-glob options to be an object, but got an array " + (inspect(obj)) + "."))];
  }

  var results = [];

  if (obj.sync !== undefined) {
    results.push(new TypeError(
      ("`sync` option is deprecated and there is no need to pass any values to the option, but " + (inspect(obj.sync)) + " is provided.")
    ));
  }

  for (var i = 0, list = pathOptions; i < list.length; i += 1) {
    var prop = list[i];

    var val = obj[prop];

    if (val !== undefined && typeof obj[prop] !== 'string') {
      results.push(new TypeError(
        ("node-glob expected `" + prop + "` option to be a directory path (string), but got " + (inspect(val)) + ".")
      ));
    }
  }

  for (var i$1 = 0, list$1 = booleanOptions; i$1 < list$1.length; i$1 += 1) {
    var prop$1 = list$1[i$1];

    var val$1 = obj[prop$1];

    if (val$1 !== undefined && typeof obj[prop$1] !== 'boolean') {
      results.push(new TypeError(
        ("node-glob expected `" + prop$1 + "` option to be a Boolean value, but got " + (inspect(val$1)) + ".")
      ));
    }
  }

  if (obj.cache !== undefined) {
    if (!isPlainObj(obj.cache)) {
      results.push(new TypeError(
        ("node-glob expected `cache` option to be an object, but got " + (inspect(obj.cache)) + ".")
      ));
    } else {
      for (var i$2 = 0, list$2 = Object.keys(obj.cache); i$2 < list$2.length; i$2 += 1) {
        var field = list$2[i$2];

        var val$2 = obj.cache[field];

        if (typeof val$2 !== 'string') {
          if (typeof val$2 !== 'boolean' && !Array.isArray(val$2)) {
            results.push(new TypeError(
              (INVALID_CACHE_MESSAGE + ", but got an invalid value " + (inspect(val$2)) + " in `" + field + "` property.")
            ));
          }
        } else if (val$2 !== 'FILE' && val$2 !== 'DIR') {
          results.push(new Error(
            (INVALID_CACHE_MESSAGE + ", but got an invalid string " + (inspect(val$2)) + " in `" + field + "` property.")
          ));
        }
      }
    }
  }

  if (obj.statCache !== undefined) {
    if (!isPlainObj(obj.statCache)) {
      results.push(new TypeError(
        ("node-glob expected `statCache` option to be an object, but got " + (inspect(obj.statCache)) + ".")
      ));
    } else {
      for (var i$3 = 0, list$3 = Object.keys(obj.statCache); i$3 < list$3.length; i$3 += 1) {
        var field$1 = list$3[i$3];

        var val$3 = obj.statCache[field$1];

        if (val$3 === null || typeof val$3 !== 'object' || Array.isArray(val$3)) {
          results.push(new TypeError(
            (INVALID_STAT_CACHE_MESSAGE + ", but got an invalid value " + (inspect(val$3)) + " in `" + field$1 + "` property.")
          ));
        } else if (typeof val$3.mode !== 'number') {
          results.push(new Error(
            (INVALID_STAT_CACHE_MESSAGE + ", but got an invalid object " + (inspect(val$3)) + " in `" + field$1 + "` property, which doesn't have a valid file mode.")
          ));
        }
      }
    }
  }

  if (obj.symlinks !== undefined) {
    if (!isPlainObj(obj.symlinks)) {
      results.push(new TypeError(
        ("node-glob expected `symlinks` option to be an object, but got " + (inspect(obj.symlinks)) + ".")
      ));
    } else {
      for (var i$4 = 0, list$4 = Object.keys(obj.symlinks); i$4 < list$4.length; i$4 += 1) {
        var field$2 = list$4[i$4];

        var val$4 = obj.symlinks[field$2];

        if (typeof val$4 !== 'boolean') {
          results.push(new TypeError(
            ("Expected every value in the `symlink` option to be Boolean, but got an invalid value " + (inspect(val$4)) + " in `" + field$2 + "` property.")
          ));
        }
      }
    }
  }

  if (obj.ignore !== undefined) {
    if (!Array.isArray(obj.ignore)) {
      if (typeof obj.ignore !== 'string') {
        results.push(new TypeError(
          ("node-glob expected `ignore` option to be an array or string, but got " + (inspect(obj.ignore)) + ".")
        ));
      }
    } else {
      for (var i$5 = 0, list$5 = obj.ignore; i$5 < list$5.length; i$5 += 1) {
        var val$5 = list$5[i$5];

        if (typeof val$5 !== 'string') {
          results.push(new TypeError(
            'Expected every value in the `ignore` option to be a string, ' +
            "but the array includes a non-string value " + (inspect(val$5)) + "."
          ));
        }
      }
    }
  }

  for (var i$6 = 0, list$6 = Object.keys(obj); i$6 < list$6.length; i$6 += 1) {
    var key = list$6[i$6];

    var correctName = typos[key];

    if (correctName) {
      results.push(new Error(
        ("node-glob doesn't have `" + key + "` option. Probably you meant `" + correctName + "`.")
      ));
    }
  }

  return results;
};
