import { StorageFile }  from './file'
import { StorageS3 }    from './s3'

export const BACKEND_DICT = {
  file : StorageFile,
  s3   : StorageS3,
}

export type BackendName = keyof typeof BACKEND_DICT

export type BackendJsonObject =

  backend: BackendName,
}
