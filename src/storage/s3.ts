import S3 from 'aws-sdk/clients/s3'

import {
  MemoryCardPayload,
}                     from '../types'
import {
  StorageBackend,
}                     from './backend'

export interface S3Options {
  accessKeyId     : string,
  secretAccessKey : string,
  region          : string,
  ////////////////////////
  bucket : string,
  key    : string,
}

export class StorageS3 implements StorageBackend {
  private s3: S3

  constructor (
    private options: S3Options
  ) {
    this.s3 = new S3({
      credentials: {
        accessKeyId     : options.accessKeyId,
        secretAccessKey : options.secretAccessKey,
      }
    })
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    await this.s3.putObject({
      Body   : JSON.stringify(payload),
      Bucket : this.options.bucket,
      Key    : this.options.key,
    }).promise()
    return
  }

  public async load (): Promise<MemoryCardPayload> {
    const result = await this.s3.getObject({
      Bucket : this.options.bucket,
      Key    : this.options.key,
    }).promise()

    if (!result || !result.Body) {
      return {}
    }
    return JSON.parse(result.Body.toString())
  }

  public async destroy (): Promise<void> {
    await this.s3.deleteObject({
      Bucket : this.options.bucket,
      Key    : this.options.key,
    })
    return
  }
}
