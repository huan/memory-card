import S3 from 'aws-sdk/clients/s3'

import {
  log,
}                     from '../config'
import {
  MemoryCardPayload,
}                     from '../types'

import {
  StorageBackend,
}                         from './backend'
import {
  StorageBackendOptions,
  StorageS3Options,
}                         from './backend-config'

export class StorageS3 extends StorageBackend {

  private s3: S3

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageS3', 'constructor()')

    options.type = 's3'
    super(name, options)
    options = options as StorageS3Options

    this.s3 = new S3({
      credentials: {
        accessKeyId     : options.accessKeyId,
        secretAccessKey : options.secretAccessKey,
      },
      region: options.region,
    })
  }

  public toString (): string {
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

      if (!result || !result.Body) {
        return {}
      }

      return JSON.parse(result.Body.toString())

    } catch (e) {
      log.warn('StorageS3', 'load() exception: %s', e)
      return {}
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
