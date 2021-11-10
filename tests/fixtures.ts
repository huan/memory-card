import type { StorageBackendOptions } from '../src/storage/backend-config.js'

/**
 * S3 Key for Unit Testing
 */
const awsSetting: Partial<StorageBackendOptions> = {
  accessKeyId     : process.env['AWS_ACCESS_KEY_ID'],
  bucket          : process.env['AWS_S3_BUCKET'],
  region          : process.env['AWS_REGION'],
  secretAccessKey : process.env['AWS_SECRET_ACCESS_KEY'],
}

let AWS_SETTING: undefined | StorageBackendOptions

if (Object.values(awsSetting).every(x => !!x)) {
  AWS_SETTING = awsSetting as StorageBackendOptions
}

const OBS_SETTING = {
  ACCESS_KEY_ID     : 'AQFJBZBZA0BTMSCE8DDN',
  BUCKET            : 'xiaobeitest',
  SECRET_ACCESS_KEY : '1LduhgPkhtGO1UdNlZ7KZu2XjK7g1x833Z8q54yM+VJ83SAa2a9VTeGQST',
  SERVER            : 'https://obs.cn-north-4.myhuaweicloud.com',
}

export {
  AWS_SETTING,
  OBS_SETTING,
}
