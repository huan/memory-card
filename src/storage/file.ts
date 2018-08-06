import fs   from 'fs'
import path from 'path'

import {
  log,
}                     from '../config'
import {
  MemoryCardPayload,
}                     from '../types'

import {
  StorageBackend,
}                   from './backend'

export interface FileOptions {
  name: string,
}

export class StorageFile implements StorageBackend {
  private readonly absFileName: string

  constructor (
    private options: FileOptions,
  ) {
    this.absFileName = path.isAbsolute(options.name)
                        ? options.name
                        : path.resolve(
                            process.cwd(),
                            options.name,
                          )
    if (!/\.memory-card\.json$/.test(this.absFileName)) {
      this.absFileName +=  '.memory-card.json'
    }
  }

  public toString (): string {
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

    if (!fs.existsSync(this.absFileName)) {
      log.verbose('MemoryCard', 'load() file not exist, NOOP')
      return {}
    }

    const buffer = await new Promise<Buffer>((resolve, reject) => fs.readFile(this.absFileName, (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    }))
    const text = buffer.toString()

    let payload: MemoryCardPayload = {}

    try {
      payload = JSON.parse(text)
    } catch (e) {
      log.error('MemoryCard', 'load() exception: %s', e)
    }
    return payload
  }

  public async save (payload: MemoryCardPayload): Promise<void> {
    log.verbose('StorageFile', 'save() to %s', this.absFileName)

    const text = JSON.stringify(payload)
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(
        this.absFileName,
        text,
        err => err ? reject(err) : resolve(),
      )
    })
  }

  public async destroy (): Promise<void> {
    if (fs.existsSync(this.absFileName)) {
      fs.unlinkSync(this.absFileName)
    }
  }
}
