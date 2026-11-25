import { StorageLocalStorage } from './local-storage.ts'
import { StorageNop }          from './nop.ts'

export interface StorageNopOptions {
  placeholder?: never
}

export type StorageLocalStorageOptions = StorageNopOptions
export type StorageFileOptions = StorageNopOptions

export interface StorageS3Options {
  accessKeyId     : string
  secretAccessKey : string
  region          : string
  bucket          : string
}

export interface StorageObsOptions {
  accessKeyId     : string
  secretAccessKey : string
  server          : string
  bucket          : string
}

export interface StorageEtcdOptions {
  hosts        : string[] | string
  auth?        : {
    username : string
    password : string
  }
  credentials? : {
    rootCertificate : any
    privateKey?     : any
    certChain?      : any
  }
}

function unsupportedBackend (type: string) {
  return () => {
    throw new Error(
      `Storage '${type}' is not supported in browser environment. Use 'memory-card/node' or switch to 'localStorage' or 'nop'.`,
    )
  }
}

export const BACKEND_FACTORY_DICT = {
  etcd         : unsupportedBackend('etcd'),
  file         : unsupportedBackend('file'),
  localStorage : async () => Promise.resolve(StorageLocalStorage),
  nop          : async () => Promise.resolve(StorageNop),
  obs          : unsupportedBackend('obs'),
  s3           : unsupportedBackend('s3'),
}

export type StorageBackendType = keyof typeof BACKEND_FACTORY_DICT

export type StorageBackendOptions =
  | ({ type?: 'localStorage' } & StorageLocalStorageOptions)
  | ({ type?: 'file' }         & StorageFileOptions)
  | ({ type?: 'nop' }          & StorageNopOptions)
  | ({ type?: 's3' }           & StorageS3Options)
  | ({ type?: 'obs' }          & StorageObsOptions)
  | ({ type?: 'etcd' }         & StorageEtcdOptions)
