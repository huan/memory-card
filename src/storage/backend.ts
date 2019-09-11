import {
  log,
}                         from '../config'
import {
  MemoryCardPayload,
}                         from '../types'

import {
  StorageBackendOptions,
}                         from './backend-config'

export abstract class StorageBackend {

  constructor (
    protected name    : string,
    protected options : StorageBackendOptions,
  ) {
    log.verbose('StorageBackend', 'constructor(%s, { type: %s })', name, options.type)
  }

  public abstract save (payload: MemoryCardPayload) : Promise<void>
  public abstract load ()                           : Promise<MemoryCardPayload>
  public abstract destroy ()                        : Promise<void>

}
