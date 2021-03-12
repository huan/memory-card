import {
  log,
}                         from '../config'

import {
  BACKEND_FACTORY_DICT,
  StorageBackendOptions,
}                         from './backend-config'

import {
  StorageBackend,
}                         from './backend'

export function getStorage (
  name?   : string,
  options : StorageBackendOptions = {
    type: 'file',
  }
): StorageBackend {
  log.verbose('getStorage', 'name: %s, options: %s', name, JSON.stringify(options))

  if (!name) {
    if (options.type !== 'nop') {
      throw new Error('storage have to be `nop` with a un-named storage')
    }
    name = 'nop'
  }

  if (!options.type || !(options.type in BACKEND_FACTORY_DICT)) {
    throw new Error('backend unknown: ' + options.type)
  }

  const Backend = BACKEND_FACTORY_DICT[options.type]()
  const backend = new Backend(name, options)
  return backend
}
