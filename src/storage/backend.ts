import {
  MemoryCardPayload,
}                     from '../types'

export abstract class StorageBackend {
  /**
   *
   * Static Methods
   *
   */
  public static fromJSON (textOrObj: string | BackendJsonObject): StorageBackend {
    let obj: BackendJsonObject
    if (typeof textOrObj === 'string') {
      obj = JSON.parse(textOrObj)
    } else {
      obj = textOrObj
    }

    if (obj.backend in BACKEND_DICT) {
      const Backend = BACKEND_DICT[obj.backend]
      return Backend.fromJSON(obj)
    }

    throw new Error('Not supported backend: ' + obj.backend)
  }

  public static create (): StorageBackend {
    return {} as any
  }

  /**
   *
   * Instance Methods
   *
   */
  public abstract toJSON (): BackendJsonObject
  public abstract save (payload: MemoryCardPayload) : Promise<void>
  public abstract load ()                           : Promise<MemoryCardPayload>
  public abstract destroy ()                        : Promise<void>
}

export type StorageBackendName = 'file' | 's3'
