import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import * as os from 'node:os'
import * as path from 'node:path'
import * as fs from 'node:fs'

import { StorageFile } from '../node/storage/file.ts'

test('StorageFile save, load, and destroy', async () => {
  const tmpDir = path.join(os.tmpdir(), `mc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const cardPath = path.join(tmpDir, 'test-file')

  const storage = new StorageFile(cardPath, { type: 'file' })

  // Non-existing file load
  const empty = await storage.load()
  assert.deepEqual(empty, {}, 'empty load for nonexistent file')

  // Save payload
  const payload = { testKey: 'testVal', count: 99 }
  await storage.save(payload)

  // Load payload back
  const loaded = await storage.load()
  assert.deepEqual(loaded, payload, 'loaded matches saved payload')

  // Verify file exists on disk
  const absExpected = `${cardPath}.memory-card.json`
  assert.equal(fs.existsSync(absExpected), true, 'file created on disk')

  // Destroy file
  await storage.destroy()
  assert.equal(fs.existsSync(absExpected), false, 'file deleted after destroy')

  // Load after destroy
  const emptyAfter = await storage.load()
  assert.deepEqual(emptyAfter, {}, 'empty load after destroy')

  // Clean up directory
  await fs.promises.rm(tmpDir, { recursive: true, force: true })
})
