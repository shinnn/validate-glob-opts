/*!
 * validate-glob-opts | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/validate-glob-opts
*/
'use strict';

const inspect = require('util').inspect;

const isPlainObj = require('is-plain-obj');

const ERROR_MESSAGE = 'Expected node-glob options to be an object';
const INVALID_CACHE_MESSAGE = 'Expected every value in the `cache` option to be ' +
                              'true, false, \'FILE\', \'DIR\' or an array';

const INVALID_STAT_CACHE_MESSAGE = 'Expected every value in the `statCache` option to be a ' +
                                   'fs.Stats instance';

const pathOptions = ['cwd', 'root'];
const booleanOptions = [
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
const typos = {
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
    return [new TypeError(`${ERROR_MESSAGE}, but got '' (empty string).`)];
  }

  if (!obj) {
    return [];
  }

  if (typeof obj !== 'object') {
    return [new TypeError(`${ERROR_MESSAGE}, but got ${inspect(obj)}.`)];
  }

  if (Array.isArray(obj)) {
    return [new TypeError(`Expected node-glob options to be an object, but got an array ${inspect(obj)}.`)];
  }

  const results = [];

  if (obj.sync !== undefined) {
    results.push(new Error(
      `\`sync\` option is deprecated and there’s no need to pass any values to that option, but ${
        inspect(obj.sync)
      } was provided.`
    ));
  }

  for (const prop of pathOptions) {
    const val = obj[prop];

    if (val !== undefined && typeof obj[prop] !== 'string') {
      results.push(new TypeError(
        `node-glob expected \`${prop}\` option to be a directory path (string), but got ${inspect(val)}.`
      ));
    }
  }

  for (const prop of booleanOptions) {
    const val = obj[prop];

    if (val !== undefined && typeof obj[prop] !== 'boolean') {
      results.push(new TypeError(
        `node-glob expected \`${prop}\` option to be a Boolean value, but got ${inspect(val)}.`
      ));
    }
  }

  if (obj.cache !== undefined) {
    if (!isPlainObj(obj.cache)) {
      results.push(new TypeError(
        `node-glob expected \`cache\` option to be an object, but got ${inspect(obj.cache)}.`
      ));
    } else {
      for (const field of Object.keys(obj.cache)) {
        const val = obj.cache[field];

        if (typeof val !== 'string') {
          if (typeof val !== 'boolean' && !Array.isArray(val)) {
            results.push(new TypeError(
              `${INVALID_CACHE_MESSAGE}, but got an invalid value ${inspect(val)} in \`${field}\` property.`
            ));
          }
        } else if (val !== 'FILE' && val !== 'DIR') {
          results.push(new Error(
            `${INVALID_CACHE_MESSAGE}, but got an invalid string ${inspect(val)} in \`${field}\` property.`
          ));
        }
      }
    }
  }

  if (obj.statCache !== undefined) {
    if (!isPlainObj(obj.statCache)) {
      results.push(new TypeError(
        `node-glob expected \`statCache\` option to be an object, but got ${inspect(obj.statCache)}.`
      ));
    } else {
      for (const field of Object.keys(obj.statCache)) {
        const val = obj.statCache[field];

        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
          results.push(new TypeError(
            `${INVALID_STAT_CACHE_MESSAGE}, but got an invalid value ${
              inspect(val)
            } in \`${field}\` property.`
          ));
        } else if (typeof val.mode !== 'number') {
          results.push(new Error(
            `${INVALID_STAT_CACHE_MESSAGE}, but got an invalid object ${
              inspect(val)
            } in \`${field}\` property, which doesn't have a valid file mode.`
          ));
        }
      }
    }
  }

  if (obj.symlinks !== undefined) {
    if (!isPlainObj(obj.symlinks)) {
      results.push(new TypeError(
        `node-glob expected \`symlinks\` option to be an object, but got ${inspect(obj.symlinks)}.`
      ));
    } else {
      for (const field of Object.keys(obj.symlinks)) {
        const val = obj.symlinks[field];

        if (typeof val !== 'boolean') {
          results.push(new TypeError(
            `Expected every value in the \`symlink\` option to be Boolean, but got an invalid value ${
              inspect(val)
            } in \`${field}\` property.`
          ));
        }
      }
    }
  }

  if (obj.ignore !== undefined) {
    if (!Array.isArray(obj.ignore)) {
      if (typeof obj.ignore !== 'string') {
        results.push(new TypeError(
          `node-glob expected \`ignore\` option to be an array or string, but got ${
            inspect(obj.ignore)
          }.`
        ));
      }
    } else {
      for (const val of obj.ignore) {
        if (typeof val !== 'string') {
          results.push(new TypeError(
            'Expected every value in the `ignore` option to be a string, ' +
            `but the array includes a non-string value ${inspect(val)}.`
          ));
        }
      }
    }
  }

  for (const key of Object.keys(obj)) {
    const correctName = typos[key];

    if (correctName) {
      results.push(new Error(
        `node-glob doesn't have \`${key}\` option. Probably you meant \`${correctName}\`.`
      ));
    }
  }

  return results;
};
