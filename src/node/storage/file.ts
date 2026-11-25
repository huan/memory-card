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

    try {
      const text = await fs.promises.readFile(this.absFileName, 'utf-8')
      return JSON.parse(text)
    } catch (err: any) {
      if (err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        log.verbose('StorageFile', 'load() file not exist, NOOP')
        return {}
      }
      log.error('StorageFile', 'load() exception: %s', err)
      return {}
    }
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageFile', 'save() to %s', this.absFileName)

    const text = JSON.stringify(payload)
    await fs.promises.mkdir(path.dirname(this.absFileName), { recursive: true })
    await fs.promises.writeFile(
      this.absFileName,
      text,
      'utf-8',
    )
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
