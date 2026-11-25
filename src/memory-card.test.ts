import { test } from 'node:test'
import * as assert from 'node:assert/strict'

import { MemoryCard } from '#memory-card'

test('smoke testing with in-memory (nop)', async () => {
  const card = new MemoryCard()
  await card.load()

  assert.equal(await card.size, 0, 'init with 0')

  await card.set('a', 'b')
  assert.equal(await card.size, 1, 'size with 1')

  assert.equal(await card.get('a'), 'b', 'get key a with value b')

  assert.equal(await card.has('a'), true, 'has key a')
  assert.equal(await card.has('nonexistent'), false, 'does not have nonexistent')

  const keys: string[] = []
  for await (const k of card.keys()) {
    keys.push(k)
  }
  assert.deepEqual(keys, ['a'])

  const values: any[] = []
  for await (const v of card.values()) {
    values.push(v)
  }
  assert.deepEqual(values, ['b'])

  const entries: [string, any][] = []
  for await (const pair of card.entries()) {
    entries.push(pair)
  }
  assert.deepEqual(entries, [['a', 'b']])

  const forEachEntries: [string, any][] = []
  await card.forEach((val, key) => {
    forEachEntries.push([key, val])
  })
  assert.deepEqual(forEachEntries, [['a', 'b']])

  const deleted = await card.delete('a')
  assert.equal(deleted, true, 'delete returns true for existing key')
  assert.equal(await card.size, 0, 'size is 0 after delete')

  const deleteAgain = await card.delete('a')
  assert.equal(deleteAgain, false, 'delete returns false for nonexistent key')

  await card.set('x', 42)
  await card.clear()
  assert.equal(await card.size, 0, 'clear reset to 0')
})

test('save() throws exception before load()', async () => {
  const card = new MemoryCard()
  await assert.rejects(
    async () => card.save(),
    /no payload, please call load\(\) first/,
  )
})

test('load() twice should throw error', async () => {
  const card = new MemoryCard()
  await card.load()
  await assert.rejects(
    async () => card.load(),
    /memory had already loaded before/,
  )
})

test('instantiate MemoryCard with undefined options should get undefined name', () => {
  const card = new MemoryCard()
  assert.equal(card.name, undefined)
})

test('fromJSON() restores payload and options', async () => {
  const card = new MemoryCard({ name: 'test-json' })
  await card.load()
  await card.set('hello', 'world')

  const jsonStr = JSON.stringify({
    options: { name: 'test-json' },
    payload: { hello: 'world' },
  })

  const restored = MemoryCard.fromJSON(jsonStr) as MemoryCard
  assert.equal(await restored.get('hello'), 'world')
  assert.equal(await restored.size, 1)
})
