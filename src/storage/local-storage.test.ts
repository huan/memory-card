import { test } from 'node:test'
import * as assert from 'node:assert/strict'

import { StorageLocalStorage } from './local-storage.ts'

test('StorageLocalStorage save, load, destroy', async () => {
  const mockStorage = new Map<string, string>()
  const originalLocalStorage = globalThis.localStorage

  if (!globalThis.localStorage) {
    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, val: string) => { mockStorage.set(key, val) },
      removeItem: (key: string) => { mockStorage.delete(key) },
      clear: () => { mockStorage.clear() },
    }
  }

  try {
    const storage = new StorageLocalStorage('test-card', { type: 'localStorage' })
    assert.deepEqual(await storage.load(), {}, 'empty initial load')

    await storage.save({ hello: 'world', num: 42 })
    assert.deepEqual(await storage.load(), { hello: 'world', num: 42 }, 'loaded saved payload')

    await storage.destroy()
    assert.deepEqual(await storage.load(), {}, 'empty load after destroy')
  } finally {
    if (!originalLocalStorage) {
      delete (globalThis as any).localStorage
    }
  }
})

test('StorageLocalStorage rejects load, save, destroy when localStorage is unavailable', async () => {
  const originalLocalStorage = globalThis.localStorage

  // Ensure localStorage is undefined for this test
  if (globalThis.localStorage) {
    delete (globalThis as any).localStorage
  }

  try {
    const storage = new StorageLocalStorage('unsupported-card', { type: 'localStorage' })
    await assert.rejects(
      async () => { await storage.load() },
      /globalThis\.localStorage is not available/,
      'load() should reject when localStorage is missing',
    )
    await assert.rejects(
      async () => { await storage.save({ test: 1 }) },
      /globalThis\.localStorage is not available/,
      'save() should reject when localStorage is missing',
    )
    await assert.rejects(
      async () => { await storage.destroy() },
      /globalThis\.localStorage is not available/,
      'destroy() should reject when localStorage is missing',
    )
  } finally {
    if (originalLocalStorage) {
      (globalThis as any).localStorage = originalLocalStorage
    }
  }
})

