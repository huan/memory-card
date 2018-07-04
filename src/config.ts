// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!Symbol.asyncIterator) {
  (<any>Symbol).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

export {
  log,
}           from 'brolog'

export const VERSION: string = require('../package.json').version
