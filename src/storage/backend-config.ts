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

export const BACKEND_DICT = {
  file : StorageFile,
  nop  : StorageNop,
  obs  : StorageObs,
  s3   : StorageS3,
}

export type StorageBackendType = keyof typeof BACKEND_DICT

export type StorageBackendOptions =
    ({ type?: 'file' }  & StorageFileOptions)
  | ({ type?: 'nop' }   & StorageNopOptions)
  | ({ type?: 's3' }    & StorageS3Options)
  | ({ type?: 'obs' }   & StorageObsOptions)
