/**
 * Storage backend implementation for Huawei Cloud Object Storage Service (OBS).
 *
 * Owns persistent key-value serialization to Huawei OBS storage buckets under Node.js.
 * Handles both legacy envelope payloads and modern single-wrapped JSON payloads.
 */
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

/**
 * Huawei Cloud Object Storage Service (OBS) backend for MemoryCard.
 */
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

  /**
   * Save payload to Huawei OBS bucket.
   */
  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageObs', 'save()')
    await this.putObject(payload)
  }

  /**
   * Load payload from Huawei OBS bucket.
   * Resolves empty object if the object does not exist (404); propagates operational errors.
   */
  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageObs', 'load()')

    try {
      const result = await this.getObject()

      if (!result) {
        return {}
      }
      return result
    } catch (e) {
      log.warn('StorageObs', 'load() exception: %s', e)
      throw e
    }

  }

  /**
   * Delete object from Huawei OBS bucket.
   */
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

  private async getObject (): Promise<MemoryCardPayload | undefined> {
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
            const content = result.InterfaceResult?.Content
            if (content === undefined || content === null) {
              resolve(undefined)
              return
            }
            const raw = typeof content === 'string' ? content : content.toString('utf-8')
            const parsed = JSON.parse(raw)
            // Support both legacy envelopes { Body: '{"key":"val"}', Bucket, Key } and direct payloads
            const isLegacyEnvelope = (
              parsed &&
              typeof parsed === 'object' &&
              !Array.isArray(parsed) &&
              typeof parsed.Body === 'string' &&
              parsed.Bucket === options.bucket &&
              parsed.Key === this.name &&
              Object.keys(parsed).length === 3
            )
            if (isLegacyEnvelope) {
              try {
                const inner = JSON.parse(parsed.Body)
                resolve(inner as MemoryCardPayload)
                return
              } catch {
                // fall back to parsed if inner Body is not valid JSON
              }
            }
            resolve(parsed as MemoryCardPayload)
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
