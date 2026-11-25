import {
  log,
}                         from '../../config.ts'

import {
  BACKEND_FACTORY_DICT,
}                         from './backend-config.ts'

import type {
  StorageBackendOptions,
}                         from '../../storage/backend-config.ts'

import type {
  StorageBackend,
}                         from '../../storage/backend.ts'

async function getStorage (
  name?   : string,
  options : StorageBackendOptions = {
    type: 'file',
  },
): Promise<StorageBackend> {
  log.verbose('getStorage', 'name: %s, options: %s', name, JSON.stringify(options))

  if (!name) {
    if (options && options.type && options.type !== 'nop') {
      throw new Error('storage have to be `nop` with a un-named storage')
    }
    options = { type: 'nop' }
    name = 'nop'
  } else if (!options || !options.type) {
    options = { ...options, type: 'file' }
  }

  if (!options.type || !(options.type in BACKEND_FACTORY_DICT)) {
    throw new Error('backend unknown: ' + options.type)
  }

  const Backend = await (BACKEND_FACTORY_DICT as any)[options.type]()
  const backend = new Backend(name, options)
  return backend
}

export { getStorage }
