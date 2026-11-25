import { StorageFile } from './file.ts'
import { StorageNop }  from '../../storage/nop.ts'
import { StorageLocalStorage } from '../../storage/local-storage.ts'

import type { StorageEtcd }  from './etcd.ts'
import type { StorageObs }   from './obs.ts'
import type { StorageS3 }    from './s3.ts'

export type {
  StorageBackendOptions,
  StorageBackendType,
  StorageEtcdOptions,
  StorageFileOptions,
  StorageLocalStorageOptions,
  StorageNopOptions,
  StorageObsOptions,
  StorageS3Options,
} from '../../storage/backend-config.ts'

async function obsLoader (): Promise<typeof StorageObs> {
  try {
    const m = await import('./obs.ts')
    return m.default
  } catch (e) {
    console.error(e)
    throw new Error('Load OBS Storage failed: have you installed the "esdk-obs-nodejs" NPM module?')
  }
}

async function s3Loader (): Promise<typeof StorageS3> {
  try {
    const m = await import('./s3.ts')
    return m.default
  } catch (e) {
    console.error(e)
    throw new Error('Load S3 Storage failed: have you installed the "aws-sdk" NPM module?')
  }
}

async function etcdLoader (): Promise<typeof StorageEtcd > {
  try {
    const m = await import('./etcd.ts')
    return m.default
  } catch (e) {
    console.error(e)
    throw new Error('Load Etcd Storage failed: have you installed the "etcd3" NPM module?')
  }
}

export const BACKEND_FACTORY_DICT = {
  etcd         : etcdLoader,
  file         : async () => Promise.resolve(StorageFile),
  localStorage : async () => Promise.resolve(StorageLocalStorage),
  nop          : async () => Promise.resolve(StorageNop),
  obs          : obsLoader,
  s3           : s3Loader,
}
