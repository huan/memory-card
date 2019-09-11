import { VERSION } from './version'

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

export {
  log,
}           from 'brolog'

export {
  VERSION,
}
