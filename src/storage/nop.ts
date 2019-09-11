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
}                         from './backend-config'

export class StorageNop extends StorageBackend {

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageNop', 'constructor(%s, ...)', name)
    super(name, options)
  }

  public toString (): string {
    const text = [
      this.constructor.name,
      '<nop>',
    ].join('')
    return text
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageNop', 'load()')
    return {}
  }

  public async save (_ /* payload */ : MemoryCardPayload): Promise<void> {
    log.verbose('StorageNop', 'save()')
  }

  public async destroy (): Promise<void> {
    log.verbose('StorageNop', 'destroy()')
  }

}
