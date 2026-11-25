/// <reference path="./types.d.ts" />
import AWS_SDK from 'aws-sdk'

import {
  log,
}                     from '../../config.ts'
import type {
  MemoryCardPayload,
}                     from '../../types.ts'

import {
  StorageBackend,
}                         from '../../storage/backend.ts'
import type {
  StorageBackendOptions,
  StorageS3Options,
}                         from '../../storage/backend-config.ts'

const { S3 } = AWS_SDK

export class StorageS3 extends StorageBackend {

  private s3: any

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageS3', 'constructor()')

    options.type = 's3'
    super(name, options)
    const s3Options = options as StorageS3Options

    this.s3 = new S3({
      credentials: {
        accessKeyId     : s3Options.accessKeyId,
        secretAccessKey : s3Options.secretAccessKey,
      },
      region: s3Options.region,
    })
  }

  override toString (): string {
    const text = [
      this.constructor.name,
      '<',
      this.name,
      '>',
    ].join('')
    return text
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageS3', 'save()')

    const options = this.options as StorageS3Options

    await this.s3.putObject({
      Body   : JSON.stringify(payload),
      Bucket : options.bucket,
      Key    : this.name,
    }).promise()
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageS3', 'load()')

    const options = this.options as StorageS3Options

    try {
      const result = await this.s3.getObject({
        Bucket : options.bucket,
        Key    : this.name,
      }).promise()

      if (!result.Body) {
        return {}
      }

      return JSON.parse(result.Body.toString())

    } catch (e: any) {
      if (/^4/.test(e.statusCode)) {
        return {}
      }
      throw e
    }

  }

  public async destroy (): Promise<void> {
    log.verbose('StorageS3', 'destroy()')

    const options = this.options as StorageS3Options

    await this.s3.deleteObject({
      Bucket : options.bucket,
      Key    : this.name,
    }).promise()
  }

}

export default StorageS3
