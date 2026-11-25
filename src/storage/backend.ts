import {
  log,
} from '../config.ts'
import type {
  MemoryCardPayload,
} from '../types.ts'
import type {
  StorageBackendOptions,
} from './backend-config.ts'

export abstract class StorageBackend {

  name    : string
  options : StorageBackendOptions

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    this.name = name
    this.options = options
    log.verbose('StorageBackend', 'constructor(%s, { type: %s })', name, options.type)
  }

  public abstract save (payload: MemoryCardPayload) : Promise<void>
  public abstract load ()                           : Promise<MemoryCardPayload>
  public abstract destroy ()                        : Promise<void>

}

export default StorageBackend
