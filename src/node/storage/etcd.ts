/// <reference path="./types.d.ts" />
import { Etcd3 } from 'etcd3'

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
  StorageEtcdOptions,
}                         from '../../storage/backend-config.ts'

export class StorageEtcd extends StorageBackend {

  private etcd: Etcd3

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageEtcd', 'constructor()')

    options.type = 'etcd'
    super(name, options)
    const etcdOptions = options as StorageEtcdOptions

    this.etcd = new Etcd3({
      hosts: etcdOptions.hosts,
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
    log.verbose('StorageEtcd', 'save()')

    await this.etcd
      .put(this.name)
      .value(
        JSON.stringify(payload),
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
    } catch (e: any) {
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

export default StorageEtcd
