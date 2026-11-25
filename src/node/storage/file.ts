import * as fs from 'node:fs'
import * as path from 'node:path'

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
  StorageFileOptions,
}                         from '../../storage/backend-config.ts'

export class StorageFile extends StorageBackend {

  private readonly absFileName: string

  constructor (
    name    : string,
    options : StorageBackendOptions,
  ) {
    log.verbose('StorageFile', 'constructor(%s, ...)', name)

    options.type = 'file'
    super(name, options)

    options = options as StorageFileOptions

    this.absFileName = path.isAbsolute(this.name)
      ? this.name
      : path.resolve(
        process.cwd(),
        this.name,
      )
    if (!/\.memory-card\.json$/.test(this.absFileName)) {
      this.absFileName += '.memory-card.json'
    }
  }

  override toString (): string {
    const text = [
      this.constructor.name,
      '<',
      this.absFileName,
      '>',
    ].join('')
    return text
  }

  public async load (): Promise<MemoryCardPayload> {
    log.verbose('StorageFile', 'load() from %s', this.absFileName)

    let text: string
    try {
      text = await fs.promises.readFile(this.absFileName, 'utf-8')
    } catch (err: any) {
      if (err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        log.verbose('StorageFile', 'load() file not exist, NOOP')
        return {}
      }
      log.error('StorageFile', 'load() readFile exception: %s', err)
      throw err
    }

    try {
      return JSON.parse(text)
    } catch (err) {
      log.error('StorageFile', 'load() JSON.parse exception: %s', err)
      return {}
    }
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageFile', 'save() to %s', this.absFileName)

    const text = JSON.stringify(payload)
    const dir = path.dirname(this.absFileName)
    await fs.promises.mkdir(dir, { recursive: true })

    const tmpFile = `${this.absFileName}.tmp.${process.pid}.${Date.now()}`
    await fs.promises.writeFile(tmpFile, text, 'utf-8')
    await fs.promises.rename(tmpFile, this.absFileName)
  }

  public async destroy (): Promise<void> {
    log.verbose('StorageFile', 'destroy()')

    try {
      await fs.promises.unlink(this.absFileName)
    } catch (err: any) {
      if (err && (err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err
      }
    }
  }

}

export default StorageFile
