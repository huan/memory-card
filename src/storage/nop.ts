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

export class StorageNop extends StorageBackend {

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageNop', 'constructor(%s, ...)', name)
    super(name, options)
  }

  override toString (): string {
    return `${this.constructor.name}<nop>`
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageNop', 'load()')
    return {}
  }

  public async save (_payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageNop', 'save()')
  }

  public async destroy (): Promise<void> {
    log.verbose('StorageNop', 'destroy()')
  }

}

export default StorageNop
