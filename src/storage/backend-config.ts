import { StorageFile }  from './file'
import { StorageS3 }    from './s3'

export interface StorageFileOptions {
  placeholder?: never
}

export interface StorageS3Options {
  accessKeyId     : string,
  secretAccessKey : string,
  region          : string,
  ////////////////////////
  bucket : string,
}

export const BACKEND_DICT = {
  file : StorageFile,
  s3   : StorageS3,
}

export type StorageBackendType = keyof typeof BACKEND_DICT

export type StorageBackendOptions =
    ( { type?: 'file' }  & StorageFileOptions )
  | ( { type?: 's3' }    & StorageS3Options )
