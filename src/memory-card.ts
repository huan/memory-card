// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
// if (!Symbol.asyncIterator) {
//   (<any>Symbol).asyncIterator =  Symbol.for('Symbol.asyncIterator')
// }

import * as fs        from 'fs'
import * as nodePath  from 'path'

import {
  AsyncMap,
}             from './async-map.type'
import {
  log,
  VERSION,
}             from './config'

export const NAMESPACE_SUB_SEPRATOR = '\r'
export const NAMESPACE_KEY_SEPRATOR = '\n'

const NAMESPACE_SUB_SEPRATOR_REGEX = new RegExp(NAMESPACE_SUB_SEPRATOR)
const NAMESPACE_KEY_SEPRATOR_REGEX = new RegExp(NAMESPACE_KEY_SEPRATOR)

export class MemoryCard implements AsyncMap {

  protected parent?     : MemoryCard
  protected payload     : { [idx: string]: any }
  protected subNameList : string[]

  protected file?   : string

  protected static sub<T extends typeof MemoryCard> (
    this: T,
    memory : MemoryCard,
    name   : string,
  ): T['prototype'] {
    log.verbose('MemoryCard', 'static sub(%s, %s)', memory, name)

    const subMemory = new this(memory.name)

    subMemory.parent  = memory
    subMemory.payload = memory.payload

    subMemory.subNameList = [
      ...memory.subNameList,
      name,
    ]

    return subMemory
  }

  constructor (
    public name: null | string = null,
  ) {
    log.verbose('MemoryCard', 'constructor(%s)', name || '')

    this.payload     = {}
    this.subNameList = []

    if (name) {
      this.file = nodePath.isAbsolute(name)
        ? name
        : nodePath.resolve(
            process.cwd(),
            name,
          )
      if (!/\.memory-card\.json$/.test(this.file)) {
        this.file +=  '.memory-card.json'
      }
    }
  }

  public toString () {
    let subString = ''
    if (this.subNameList.length > 0) {
      subString = this.subNameList
                        .map(subName => `.sub(${subName})`)
                        .join('')
    }
    return `MemoryCard<${this.name || ''}>${subString}`
  }

  public version (): string {
    return VERSION
  }

  public async load (): Promise<void> {
    log.verbose('MemoryCard', 'load() file: %s', this.file)

    if (this.isSub()) {
      return
    }

    const file = this.file
    if (!file) {
      log.verbose('MemoryCard', 'load() no file, NOOP')
      return
    }

    if (!fs.existsSync(file)) {
      log.verbose('MemoryCard', 'load() file not exist, NOOP')
      return
    }

    const buffer = await new Promise<Buffer>((resolve, reject) => fs.readFile(file, (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    }))
    const text = buffer.toString()

    try {
      this.payload = JSON.parse(text)
    } catch (e) {
      log.error('MemoryCard', 'load() exception: %s', e)
    }
  }

  public async save (): Promise<void> {
    log.verbose('MemoryCard', '<%s> save() file: %s',
                              this.subPath(),
                              this.file,
                )

    if (this.isSub()) {
      if (!this.parent) {
        throw new Error('sub memory no parent')
      }
      return this.parent.save()
    }

    const file = this.file
    if (!file) {
      log.verbose('MemoryCard', 'save() no file, NOOP')
      return
    }
    if (!this.payload) {
      log.verbose('MemoryCard', 'save() no payload, NOOP')
      return
    }

    try {
      const text = JSON.stringify(this.payload)
      await new Promise<void>((resolve, reject) => fs.writeFile(file, text, err => err ? reject(err) : resolve()))
    } catch (e) {
      log.error('MemoryCard', 'save() exception: %s', e)
      throw e
    }
  }

  /**
   * Sub() related functions START
   */

  protected isSubKey (key: string): boolean {
    if (   NAMESPACE_SUB_SEPRATOR_REGEX.test(key)
        && NAMESPACE_KEY_SEPRATOR_REGEX.test(key)
    ) {
      const namespace = this.subNamespace()
      return key.startsWith(namespace)

    }
    return false
  }

  protected subNamespace (): string {
    if (!this.isSub()) {
      throw new Error('not a sub memory')
    }

    const namespace = NAMESPACE_SUB_SEPRATOR
                      + this.subNameList.join(NAMESPACE_SUB_SEPRATOR)
    return namespace
  }

  protected resolveKey (name: string): string {
    if (this.isSub()) {
      const namespace = this.subNamespace()
      return [
        namespace,
        name,
      ].join(NAMESPACE_KEY_SEPRATOR)
    } else {
      return name
    }
  }

  public isSub (): boolean {
    return this.subNameList.length > 0
  }

  protected subPath (): string {
    return this.subNameList.join('/')
  }

  public sub (name: string): this {
    log.verbose('MemoryCard', 'sub(%s)', name)

    // FIXME: as any ?
    return (this.constructor as any).sub(this, name)
  }

  /**
   *
   * Sub() related functions END
   *
   */

  public async destroy (): Promise<void> {
    log.verbose('MemoryCard', 'destroy() file: %s', this.file)

    if (this.isSub()) {
      throw new Error('can not destroy on a sub memory')
    }

    await this.clear()
    if (this.file && fs.existsSync(this.file)) {
      fs.unlinkSync(this.file)
      this.file = undefined
    }
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
    log.verbose('MemoryCard', '<%s> size', this.subPath())

    let count

    if (this.isSub()) {
      count = Object.keys(this.payload)
                    .filter(key => this.isSubKey(key))
                    .length
    } else {
      count = Object.keys(this.payload).length
    }
    return Promise.resolve(count)
  }

  public async get<T = any> (name: string): Promise<undefined | T> {
    log.verbose('MemoryCard', '<%s> get(%s)', this.subPath(), name)

    const key = this.resolveKey(name)

    return this.payload[key]
  }

  public async set<T = any> (name: string, data: T): Promise<void> {
    log.verbose('MemoryCard', '<%s> set(%s, %s)', this.subPath(), name, data)

    const key = this.resolveKey(name)

    this.payload[key] = data
  }

  public async* [Symbol.asyncIterator]<T = any> (): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '<%s> *[Symbol.asyncIterator]()', this.subPath())
    yield* this.entries()
  }

  public async* entries<T = any> (): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '<%s> *entries()', this.subPath())

    for await (const relativeKey of this.keys()) {
      const absoluteKey       = this.resolveKey(relativeKey)
      const data: T           = this.payload[absoluteKey]

      const pair: [string, T] = [relativeKey, data]
      yield pair
    }
  }

  public async clear (): Promise<void> {
    log.verbose('MemoryCard', '<%s> clear()', this.subPath())

    if (this.isSub()) {
      for (const key in this.payload) {
        if (this.isSubKey(key)) {
          delete this.payload[key]
        }
      }
    } else {
      this.payload = {}
    }
  }

  public async delete (name: string): Promise<void> {
    log.verbose('MemoryCard', '<%s> delete(%s)', this.subPath(), name)

    const key = this.resolveKey(name)
    delete this.payload[key]
  }

  public async has (key: string): Promise<boolean> {
    log.verbose('MemoryCard', '<%s> has(%s)', this.subPath(), key)

    const absoluteKey = this.resolveKey(key)
    return absoluteKey in this.payload
  }

  public async *keys (): AsyncIterableIterator<string> {
    log.verbose('MemoryCard', '<%s> keys()', this.subPath())
    for (const key of Object.keys(this.payload)) {
      // console.log('key', key)
      if (this.isSub()) {
        if (this.isSubKey(key)) {
          const namespace = this.subNamespace()
          // `+1` means there's another NAMESPACE_KEY_SEPRATOR we need to trim
          const subKey = key.substr(namespace.length + 1)
          yield subKey
        }
        continue
      }
      yield key
    }
  }

  public async *values<T = any> (): AsyncIterableIterator<T> {
    log.verbose('MemoryCard', '<%s> values()', this.subPath())
    for await (const relativeKey of this.keys()) {
      const absoluteKey = this.resolveKey(relativeKey)
      yield this.payload[absoluteKey]
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
