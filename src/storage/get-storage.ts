import {
  log,
} from '../config.ts'

import {
  BACKEND_FACTORY_DICT,
  type StorageBackendOptions,
} from './backend-config.ts'

import type {
  StorageBackend,
} from './backend.ts'

async function getStorage (
  name?   : string,
  options?: StorageBackendOptions,
): Promise<StorageBackend> {
  log.verbose('getStorage', 'name: %s, options: %s', name, JSON.stringify(options))

  if (!name) {
    if (options && options.type && options.type !== 'nop') {
      throw new Error('storage have to be `nop` with a un-named storage')
    }
    options = { type: 'nop' }
    name = 'nop'
  } else if (!options || !options.type) {
    options = { ...options, type: 'localStorage' }
  }

  if (!options.type || !(options.type in BACKEND_FACTORY_DICT)) {
    throw new Error('backend unknown: ' + options.type)
  }

  const Backend = await BACKEND_FACTORY_DICT[options.type]()
  const backend = new (Backend as any)(name, options)
  return backend
}

export { getStorage }
