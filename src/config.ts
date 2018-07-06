// tslint:disable:no-var-requires

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

export {
  log,
}           from 'brolog'

let version = '0.0.0'

try {
  version = require('../../package.json').version
} catch (e) {
  version = require('../package.json')
}

export const VERSION = version
