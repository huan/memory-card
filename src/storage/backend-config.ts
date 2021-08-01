import { StorageFile }  from './file'
import { StorageNop }   from './nop'
import { StorageObs }   from './obs'
import { StorageS3 }    from './s3'

export interface StorageNopOptions {
  placeholder?: never
}

export type StorageFileOptions = StorageNopOptions

export interface StorageS3Options {
  accessKeyId     : string,
  secretAccessKey : string,
  region          : string,
  // //////////////////////
  bucket : string,
}

export interface StorageObsOptions {
  accessKeyId     : string,
  secretAccessKey : string,
  server          : string,
  // //////////////////////
  bucket : string,
}

function obsLoader (): typeof StorageObs {
  const m = require('./obs')
  if (m?.default) {
    return m.default
  }
  throw new Error('Load OBS Storage failed: have you installed the "esdk-obs-nodejs" NPM module?')
}

function s3Loader (): typeof StorageS3 {
  const m = require('./s3')
  if (m?.default) {
    return m.default
  }
  throw new Error('Load S3 Storage failed: have you installed the "aws-sdk" NPM module?')
}

export const BACKEND_FACTORY_DICT = {
  file : () => StorageFile,
  nop  : () => StorageNop,
  obs  : obsLoader,
  s3   : s3Loader,
}

export type StorageBackendType = keyof typeof BACKEND_FACTORY_DICT

export type StorageBackendOptions =
    ({ type?: 'file' }  & StorageFileOptions)
  | ({ type?: 'nop' }   & StorageNopOptions)
  | ({ type?: 's3' }    & StorageS3Options)
  | ({ type?: 'obs' }   & StorageObsOptions)
