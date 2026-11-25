import {
  log,
} from '../config.ts'
import type {
  MemoryCardPayload,
} from '../types.ts'

import {
  StorageBackend,
} from './backend.ts'
import type {
  StorageBackendOptions,
} from './backend-config.ts'

export class StorageLocalStorage extends StorageBackend {

  private key: string

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageLocalStorage', 'constructor(%s, ...)', name)
    super(name, options)
    this.key = `memory-card:${this.name}`
  }

  private getStorage (): Storage {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        return globalThis.localStorage
      }
    } catch {
      // In restricted iframes or privacy modes, accessing globalThis.localStorage throws SecurityError
    }
    throw new Error('globalThis.localStorage is not available in the current environment')
  }

  override toString (): string {
    return `${this.constructor.name}<${this.key}>`
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageLocalStorage', 'load() from %s', this.key)
    const storage = this.getStorage()
    const text = storage.getItem(this.key)
    if (!text) {
      return {}
    }
    try {
      return JSON.parse(text)
    } catch (e) {
      log.error('StorageLocalStorage', 'load() exception: %s', e)
      return {}
    }
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageLocalStorage', 'save() to %s', this.key)
    const storage = this.getStorage()
    const text = JSON.stringify(payload)
    storage.setItem(this.key, text)
  }

  public async destroy (): Promise<void> {
    log.verbose('StorageLocalStorage', 'destroy()')
    const storage = this.getStorage()
    storage.removeItem(this.key)
  }

}

export default StorageLocalStorage
