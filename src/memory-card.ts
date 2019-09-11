// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
// if (!Symbol.asyncIterator) {
//   (<any>Symbol).asyncIterator =  Symbol.for('Symbol.asyncIterator')
// }

import {
  log,
  VERSION,
}                       from './config'
import {
  getStorage,
  StorageBackend,
  StorageBackendOptions,
}                         from './storage'
import {
  AsyncMap,
  MemoryCardPayload,
}                       from './types'

export const NAMESPACE_MULTIPLEX_SEPRATOR = '\r'
export const NAMESPACE_KEY_SEPRATOR       = '\n'

const NAMESPACE_MULTIPLEX_SEPRATOR_REGEX = new RegExp(NAMESPACE_MULTIPLEX_SEPRATOR)
const NAMESPACE_KEY_SEPRATOR_REGEX       = new RegExp(NAMESPACE_KEY_SEPRATOR)

export interface MemoryCardOptions {
  name?           : string,
  storageOptions? : StorageBackendOptions,
  // //////////
  multiplex?: {
    parent : MemoryCard,
    name   : string,
  }
}

export interface MemoryCardJsonObject {
  payload: MemoryCardPayload,
  options: MemoryCardOptions,
}

export class MemoryCard implements AsyncMap {

  /**
   *
   *
   * Static
   *
   *
   */
  public static VERSION = VERSION

  public fromJSON (textOrObj: string | MemoryCardJsonObject): MemoryCard {
    log.verbose('MemoryCard', 'fromJSON(...)')

    let jsonObj: MemoryCardJsonObject

    if (typeof textOrObj === 'string') {
      jsonObj = JSON.parse(textOrObj)
    } else {
      jsonObj = textOrObj
    }

    const card = new MemoryCard(jsonObj.options)
    card.payload = jsonObj.payload

    return card
  }

  protected static multiplex<T extends typeof MemoryCard> (
    this: T,
    memory : MemoryCard,
    name   : string,
  ): T['prototype'] {
    log.verbose('MemoryCard', 'static multiplex(%s, %s)', memory, name)

    // if (!memory.options) {
    //   throw new Error('can not multiplex a un-named MemoryCard')
    // }

    const mpMemory = new this({
      ...memory.options,
      multiplex: {
        name,
        parent: memory,
      },
    })
    return mpMemory
  }

  /**
   *
   *
   * Instance
   *
   *
   */
  public name?: string

  protected parent?           : MemoryCard
  protected payload?          : MemoryCardPayload
  protected storage?          : StorageBackend
  protected multiplexNameList : string[]

  private options?: MemoryCardOptions

  constructor (
    options?: string | MemoryCardOptions,
  ) {
    log.verbose('MemoryCard', 'constructor(%s)',
      JSON.stringify(options),
    )

    if (typeof options === 'string') {
      options = { name: options }
    }

    this.options = options
    this.name    = options && options.name

    if (options && options.multiplex) {
      this.parent   = options.multiplex.parent
      this.payload  = this.parent.payload
      this.multiplexNameList = [
        ...this.parent.multiplexNameList,
        options.multiplex.name,
      ]
      this.storage = undefined
    } else {
      // payload should be undefined before load()
      this.payload           = undefined

      this.multiplexNameList = []
      this.storage           = this.getStorage()
    }
  }

  public toString () {
    let mpString = ''
    if (this.multiplexNameList.length > 0) {
      mpString = this.multiplexNameList
        .map(mpName => `.multiplex(${mpName})`)
        .join('')
    }

    const name = this.options && this.options.name
      ? this.options.name.toString()
      : ''

    return `MemoryCard<${name}>${mpString}`
  }

  public version (): string {
    return VERSION
  }

  private getStorage (): undefined | StorageBackend {
    log.verbose('MemoryCard', 'getStorage() for storage type: %s',
      (this.options
        && this.options.storageOptions
        && this.options.storageOptions.type
      ) || 'N/A',
    )

    if (!this.options) {
      return
    }

    const storage = getStorage(
      this.options.name,
      this.options.storageOptions,
    )
    return storage
  }

  public async load (): Promise<void> {
    log.verbose('MemoryCard', 'load() from storage: %s', this.storage || 'N/A')

    if (this.isMultiplex()) {
      log.warn('MemoryCard', 'load() should not be called on a multiplex MemoryCard. NOOP')
      return
    }

    if (this.payload) {
      throw new Error('memory had already loaded before.')
    }

    if (this.storage) {
      this.payload = await this.storage.load()
    } else {
      log.verbose('MemoryCard', 'load() no storage')
      this.payload = {}
    }
  }

  public async save (): Promise<void> {
    if (this.isMultiplex()) {
      if (!this.parent) {
        throw new Error('multiplex memory no parent')
      }
      return this.parent.save()
    }

    log.verbose('MemoryCard', '<%s>%s save() to %s',
      this.name || '',
      this.multiplexPath(),
      this.storage || 'N/A',
    )

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    if (!this.storage) {
      log.verbose('MemoryCard', 'save() no storage, NOOP')
      return
    }

    await this.storage.save(this.payload)
  }

  /**
   *
   * Multiplexing related functions START
   *
   */
  protected isMultiplexKey (key: string): boolean {
    if (NAMESPACE_MULTIPLEX_SEPRATOR_REGEX.test(key)
        && NAMESPACE_KEY_SEPRATOR_REGEX.test(key)
    ) {
      const namespace = this.multiplexNamespace()
      return key.startsWith(namespace)
    }
    return false
  }

  protected multiplexNamespace (): string {
    if (!this.isMultiplex()) {
      throw new Error('not a multiplex memory')
    }

    const namespace = NAMESPACE_MULTIPLEX_SEPRATOR
                      + this.multiplexNameList.join(NAMESPACE_MULTIPLEX_SEPRATOR)
    return namespace
  }

  protected resolveKey (name: string): string {
    if (this.isMultiplex()) {
      const namespace = this.multiplexNamespace()
      return [
        namespace,
        name,
      ].join(NAMESPACE_KEY_SEPRATOR)
    } else {
      return name
    }
  }

  public isMultiplex (): boolean {
    return this.multiplexNameList.length > 0
  }

  protected multiplexPath (): string {
    return this.multiplexNameList.join('/')
  }

  /**
   * @deprecated use multiplex() instead
   * @hidden
   */
  public sub (name: string): this {
    log.warn('MemoryCard', 'sub() DEPRECATED, use multiplex() instead')
    return this.multiplex(name)
  }

  public multiplex (name: string): this {
    log.verbose('MemoryCard', 'multiplex(%s)', name)

    // FIXME: as any ?
    return (this.constructor as any).multiplex(this, name)
  }

  /**
   *
   * Multiplexing related functions END
   *
   */

  public async destroy (): Promise<void> {
    log.verbose('MemoryCard', 'destroy() storage: %s', this.storage || 'N/A')

    if (this.isMultiplex()) {
      throw new Error('can not destroy on a multiplexed memory')
    }

    await this.clear()

    if (this.storage) {
      await this.storage.destroy()
      this.storage = undefined
    }

    // to prevent to use a destroied card
    this.payload = undefined
  }

  /**
   *
   * ES6 Map API (Async Version)
   *
   * BEGIN
   *
   */

  /**
   * size
   */
  public get size (): Promise<number> {
    log.verbose('MemoryCard', '<%s> size', this.multiplexPath())

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    let count

    if (this.isMultiplex()) {
      count = Object.keys(this.payload)
        .filter(key => this.isMultiplexKey(key))
        .length
    } else {
      count = Object.keys(this.payload).length
    }
    return Promise.resolve(count)
  }

  public async get<T = any> (name: string): Promise<undefined | T> {
    log.verbose('MemoryCard', '<%s> get(%s)', this.multiplexPath(), name)

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    const key = this.resolveKey(name)

    return this.payload[key] as any
  }

  public async set<T = any> (name: string, data: T): Promise<void> {
    log.verbose('MemoryCard', '<%s> set(%s, %s)', this.multiplexPath(), name, data)

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    const key = this.resolveKey(name)

    this.payload[key] = data as any
  }

  public async * [Symbol.asyncIterator]<T = any> (): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '<%s> *[Symbol.asyncIterator]()', this.multiplexPath())
    yield * this.entries()
  }

  public async * entries<T = any> (): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '<%s> *entries()', this.multiplexPath())

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    for await (const relativeKey of this.keys()) {
      const absoluteKey       = this.resolveKey(relativeKey)
      const data: T           = this.payload[absoluteKey] as any

      const pair: [string, T] = [relativeKey, data]
      yield pair
    }
  }

  public async clear (): Promise<void> {
    log.verbose('MemoryCard', '<%s> clear()', this.multiplexPath())

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    if (this.isMultiplex()) {
      for (const key in this.payload) {
        if (this.isMultiplexKey(key)) {
          delete this.payload[key]
        }
      }
    } else {
      this.payload = {}
    }
  }

  public async delete (name: string): Promise<void> {
    log.verbose('MemoryCard', '<%s> delete(%s)', this.multiplexPath(), name)

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    const key = this.resolveKey(name)
    delete this.payload[key]
  }

  public async has (key: string): Promise<boolean> {
    log.verbose('MemoryCard', '<%s> has(%s)', this.multiplexPath(), key)

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    const absoluteKey = this.resolveKey(key)
    return absoluteKey in this.payload
  }

  public async * keys (): AsyncIterableIterator<string> {
    log.verbose('MemoryCard', '<%s> keys()', this.multiplexPath())

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    for (const key of Object.keys(this.payload)) {
      // console.log('key', key)
      if (this.isMultiplex()) {
        if (this.isMultiplexKey(key)) {
          const namespace = this.multiplexNamespace()
          // `+1` means there's another NAMESPACE_KEY_SEPRATOR we need to trim
          const mpKey = key.substr(namespace.length + 1)
          yield mpKey
        }
        continue
      }
      yield key
    }
  }

  public async * values<T = any> (): AsyncIterableIterator<T> {
    log.verbose('MemoryCard', '<%s> values()', this.multiplexPath())

    if (!this.payload) {
      throw new Error('no payload, please call load() first.')
    }

    for await (const relativeKey of this.keys()) {
      const absoluteKey = this.resolveKey(relativeKey)
      yield this.payload[absoluteKey] as any
    }
  }

  /**
   *
   * ES6 Map API (Async Version)
   *
   * END
   *
   */

}

export default MemoryCard
