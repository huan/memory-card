// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
// if (!Symbol.asyncIterator) {
//   (<any>Symbol).asyncIterator =  Symbol.for('Symbol.asyncIterator')
// }

import * as path from 'path'
import * as fs   from 'fs'

import {
  log,
  VERSION,
}             from './config'
import {
  AsyncMap,
}             from './async-map.type'

export interface MemorySchema {
  // cookies?      : any
  [idx: string] : any
}

export type MemorySection = keyof MemorySchema

export class MemoryCard implements AsyncMap {
  private payload : MemorySchema
  private file?   : string

  constructor(
    public name?: null | string,
  ) {
    log.verbose('MemoryCard', 'constructor(%s)', name)

    if (typeof name === 'undefined') {
      name = 'default'
    }

    this.payload = {}

    if (!name) {
      this.file = undefined
    } else {
      this.file = path.isAbsolute(name)
        ? name
        : path.resolve(
            process.cwd(),
            name,
          )
      if (!/\.wechaty\.json$/.test(this.file)) {
        this.file +=  '.wechaty.json'
      }
    }

    this.payload = {}
  }

  public toString() {
    return `MemoryCard<${this.name}>`
  }

  public version(): string {
    return VERSION
  }

  public async load(): Promise<void> {
    log.verbose('MemoryCard', 'load() file: %s', this.file)
    this.payload = {}

    const file = this.file
    if (!file) {
      log.verbose('MemoryCard', 'load() no file, NOOP')
      return
    }

    const fileExist = await new Promise<boolean>(r => fs.exists(file, r))
    if (!fileExist) {
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

  public async save(): Promise<void> {
    log.verbose('MemoryCard', 'save() file: %s', this.file)

    const file = this.file
    if (!file) {
      log.verbose('MemoryCard', 'save() no file, NOOP')
      return
    }
    if (!this.payload) {
      log.verbose('MemoryCard', 'save() no obj, NOOP')
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

  public async get<T = any>(section: MemorySection): Promise<undefined | T> {
    log.verbose('MemoryCard', 'get(%s)', section)
    if (!this.payload) {
      return undefined
    }
    return this.payload[section] as any as T
  }

  public async set<T = any>(section: MemorySection, data: T): Promise<void> {
    log.verbose('MemoryCard', 'set(%s, %s)', section, data)
    if (!this.payload) {
      this.payload = {}
    }
    this.payload[section] = data
  }

  public async destroy(): Promise<void> {
    log.verbose('MemoryCard', 'destroy() file: %s', this.file)
    this.payload = {}
    if (this.file && fs.existsSync(this.file)) {
      fs.unlinkSync(this.file)
      this.file = undefined
    }
  }

  public async *[Symbol.asyncIterator]<T = any>(): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '*[Symbol.asyncIterator]()')
    yield* this.entries()
  }

  public async* entries<T = any>(): AsyncIterableIterator<[string, T]> {
    log.verbose('MemoryCard', '*entries()')

    for (const key in this.payload) {
      const value = this.payload[key] as T
      const pair: [string, T] = [key, value]
      yield pair
    }
  }

  public async clear(): Promise<void> {
    log.verbose('MemoryCard', 'clear()')
    this.payload = {}
  }

  public async delete(key: string): Promise<void> {
    log.verbose('MemoryCard', 'delete(%s)', key)
    delete this.payload[key]
  }

  public async has(key: string): Promise<boolean> {
    log.verbose('MemoryCard', 'has(%s)', key)

    return key in this.payload
  }

  public async *keys(): AsyncIterableIterator<string> {
    log.verbose('MemoryCard', 'keys()')
    for (const key in this.payload) {
      yield key
    }
  }

  public async *values<T = any>(): AsyncIterableIterator<T> {
    log.verbose('MemoryCard', 'values()')
    for (const key in this.payload) {
      yield this.payload[key]
    }
  }

  public async size(): Promise<number> {
    log.verbose('MemoryCard', 'size()')
    return Object.keys(this.payload).length
  }
}

export default MemoryCard
