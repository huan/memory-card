// tslint:disable:no-var-requires

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

export {
  log,
}           from 'brolog'

export const VERSION: string = require('../package.json').version
