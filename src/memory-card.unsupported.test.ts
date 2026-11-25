import { test } from 'node:test'
import * as assert from 'node:assert/strict'

import { MemoryCard } from './mod.ts'

test('web build rejects unsupported Node storage backends', async () => {
  const card = new MemoryCard({
    name: 'test-unsupported',
    storageOptions: {
      type: 'file',
    },
  })

  await assert.rejects(
    async () => card.load(),
    /Storage 'file' is not supported in browser environment/,
  )
})

test('web build rejects unsupported s3 backend', async () => {
  const card = new MemoryCard({
    name: 'test-s3',
    storageOptions: {
      type: 's3',
      accessKeyId: 'a',
      secretAccessKey: 'b',
      region: 'c',
      bucket: 'd',
    },
  })

  await assert.rejects(
    async () => card.load(),
    /Storage 's3' is not supported in browser environment/,
  )
})
