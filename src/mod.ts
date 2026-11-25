import { MemoryCard } from './memory-card.ts'
import {
  log,
  VERSION,
} from './config.ts'
import { StorageBackend } from './storage/mod.ts'
import type {
  MemoryCardJsonObject,
  MemoryCardOptions,
} from './memory-card.ts'
import type {
  MemoryCardPayload,
  PayloadDataType,
} from './types.ts'
import type {
  StorageBackendOptions,
  StorageBackendType,
} from './storage/mod.ts'

export {
  MemoryCard,
  VERSION,
  log,
  StorageBackend,
}
export type {
  MemoryCardJsonObject,
  MemoryCardOptions,
  MemoryCardPayload,
  PayloadDataType,
  StorageBackendOptions,
  StorageBackendType,
}
export default MemoryCard
