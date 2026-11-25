/// <reference path="./types.d.ts" />
import ObsClient from 'esdk-obs-nodejs'

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
  StorageObsOptions,
}                         from '../../storage/backend-config.ts'

export class StorageObs extends StorageBackend {

  private obs: any

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageObs', 'constructor()')

    options.type = 'obs'
    super(name, options)
    const obsOptions = options as StorageObsOptions

    this.obs = new ObsClient({
      access_key_id        : obsOptions.accessKeyId,
      secret_access_key    : obsOptions.secretAccessKey,
      server               : obsOptions.server,
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
    log.verbose('StorageObs', 'save()')

    const options = this.options as StorageObsOptions

    await this.putObject({
      Body   : JSON.stringify(payload),
      Bucket : options.bucket,
      Key    : this.name,
    })
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageObs', 'load()')

    try {
      const result = await this.getObject()

      if (!result) {
        return {}
      }
      log.info('presss', result)
      return result
    } catch (e) {
      log.warn('StorageObs', 'load() exception: %s', e)
      return {}
    }

  }

  public async destroy (): Promise<void> {
    log.verbose('StorageObs', 'destroy()')

    await this.deleteObject()
  }

  private async putObject (payload: MemoryCardPayload): Promise<void> {
    const options = this.options as StorageObsOptions
    return new Promise((resolve, reject) => {
      this.obs.putObject({
        Body        : JSON.stringify(payload),
        Bucket      : options.bucket,
        Key         : this.name,
      }, (err: null | Error, result: any) => {
        if (err) {
          reject(err)
        } else if (result.CommonMsg.Status < 300) {
          resolve()
        } else {
          reject(new Error(JSON.stringify(result)))
        }
      })
    })
  }

  private async getObject (): Promise<any> {
    const options = this.options as StorageObsOptions
    return new Promise((resolve, reject) => {
      this.obs.getObject({
        Bucket : options.bucket,
        Key    : this.name,
      }, (err: null | Error, result: any) => {
        if (err) {
          reject(err)
        } else if (result.CommonMsg.Status < 300) {
          try {
            const payload = JSON.parse(result.InterfaceResult.Content)
            resolve(payload)
          } catch (e) {
            reject(e)
          }
        } else if (result.CommonMsg.Status === 404) {
          resolve(undefined)
        } else {
          reject(new Error(JSON.stringify(result)))
        }
      })
    })
  }

  private async deleteObject (): Promise<void> {
    const options = this.options as StorageObsOptions
    return new Promise((resolve, reject) => {
      this.obs.deleteObject({
        Bucket : options.bucket,
        Key    : this.name,
      }, (err: null | Error, result: any) => {
        if (err) {
          reject(err)
        } else if (result.CommonMsg.Status < 300) {
          resolve()
        } else {
          reject(new Error(JSON.stringify(result)))
        }
      })
    })
  }

}

export default StorageObs
