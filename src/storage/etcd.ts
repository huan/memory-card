import type { Etcd3 } from 'etcd3'

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
  StorageEtcdOptions,
}                         from './backend-config'

const Etcd3Module: { Etcd3: typeof Etcd3 } = require('etcd3')
const Etcd3Ctor = Etcd3Module.Etcd3

export class StorageEtcd extends StorageBackend {

  private etcd: Etcd3

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageEtcd', 'constructor()')

    options.type = 'etcd'
    super(name, options)
    options = options as StorageEtcdOptions

    this.etcd = new Etcd3Ctor({
      hosts: options.hosts,
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
    log.verbose('StorageEtcd', 'save()')

    await this.etcd
      .put(this.name)
      .value(
        JSON.stringify(payload)
      )
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageEtcd', 'load()')

    const result = await this.etcd.get(this.name).string()

    if (!result) {
      return {}
    }

    try {
      return JSON.parse(result)
    } catch (e) {
      log.warn('StorageEtcd', 'load() rejection: %s', e && e.message)
      console.error(e)
      return {}
    }

  }

  public async destroy (): Promise<void> {
    log.verbose('StorageEtcd', 'destroy()')

    await this.etcd.delete().key(this.name)
  }

}
