import { StorageFile }  from './file.js'
import { StorageNop }   from './nop.js'
import type { StorageObs }   from './obs.js'
import type { StorageS3 }    from './s3.js'

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

async function obsLoader (): Promise<typeof StorageObs> {
  try {
    const m = await import('./obs.js')
    return m.default
  } catch (e) {
    console.error(e)
    throw new Error('Load OBS Storage failed: have you installed the "esdk-obs-nodejs" NPM module?')
  }
}

async function s3Loader (): Promise<typeof StorageS3> {
  try {
    const m = await import('./s3.js')
    return m.default
  } catch (e) {
    console.error(e)
    throw new Error('Load S3 Storage failed: have you installed the "aws-sdk" NPM module?')
  }
}

export const BACKEND_FACTORY_DICT = {
  file : async () => Promise.resolve(StorageFile),
  nop  : async () => Promise.resolve(StorageNop),
  obs  : obsLoader,
  s3   : s3Loader,
}

export type StorageBackendType = keyof typeof BACKEND_FACTORY_DICT

export type StorageBackendOptions =
  | ({ type?: 'file' }  & StorageFileOptions)
  | ({ type?: 'nop' }   & StorageNopOptions)
  | ({ type?: 's3' }    & StorageS3Options)
  | ({ type?: 'obs' }   & StorageObsOptions)
