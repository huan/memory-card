import { MemoryCard as UniversalMemoryCard } from '../memory-card.ts'
import { getStorage } from './storage/get-storage.ts'
import type { StorageBackend } from '../storage/backend.ts'

export class MemoryCard extends UniversalMemoryCard {

  protected override async resolveStorage (): Promise<undefined | StorageBackend> {
    if (!this.options) {
      return
    }
    return getStorage(
      this.options.name,
      this.options.storageOptions,
    )
  }

}

export default MemoryCard
