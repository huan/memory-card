import { test } from 'node:test'
import * as assert from 'node:assert/strict'

import { MemoryCard } from '#memory-card'
import {
  NAMESPACE_KEY_SEPRATOR,
  NAMESPACE_MULTIPLEX_SEPRATOR,
} from './memory-card.ts'

class MemoryCardTest extends MemoryCard {

  override resolveKey (key: string): string {
    return super.resolveKey(key)
  }

  override multiplexPath (): string {
    return super.multiplexPath()
  }

  override isMultiplexKey (key: string): boolean {
    return super.isMultiplexKey(key)
  }

}

test('multiplex set() & get()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCard({
    name: NAME,
    storageOptions: { type: 'nop' },
  })
  await card.load()

  const cardA = card.multiplex('a')
  const cardB = card.multiplex('b')

  assert.equal(await card.size,  0, 'init with 0 for card')
  assert.equal(await cardA.size, 0, 'init with 0 for cardA')
  assert.equal(await cardB.size, 0, 'init with 0 for cardB')

  await card.set(KEY, VAL)
  assert.equal(await card.size,  1, 'size with 1')
  assert.equal(await cardA.size, 0, 'size with 0 for cardA')
  assert.equal(await cardB.size, 0, 'size with 0 for cardB')

  await cardA.set(KEY, VAL)
  assert.equal(await card.size,  2, 'card size with 2(include cardA)')
  assert.equal(await cardA.size, 1, 'cardA size with 1')
  assert.equal(await cardB.size, 0, 'cardB size with 0')

  await cardB.set(KEY, VAL)
  assert.equal(await card.size,  3, 'card size with 3(include cardA & cardB)')
  assert.equal(await cardA.size, 1, 'cardA size with 1')
  assert.equal(await cardB.size, 1, 'cardB size with 1')

  await cardB.delete('a')
  assert.equal(await card.size,  2, 'card size with 2(include cardA)')
  assert.equal(await cardA.size, 1, 'cardA size with 1')
  assert.equal(await cardB.size, 0, 'cardB size with 0')

  await cardA.delete('a')
  assert.equal(await card.size,  1, 'size with 1')
  assert.equal(await cardA.size, 0, 'size with 0 for cardA')
  assert.equal(await cardB.size, 0, 'size with 0 for cardB')

  await card.delete('a')
  assert.equal(await card.size,  0, 'size with 0')
  assert.equal(await cardA.size, 0, 'size with 0 for cardA')
  assert.equal(await cardB.size, 0, 'size with 0 for cardB')

  await card.destroy()
})

test('multiplex clear()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCard({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('a')
  const cardB = card.multiplex('b')

  await card.set(KEY, VAL)
  await cardA.set(KEY, VAL)
  await cardB.set(KEY, VAL)

  assert.equal(await card.size,  3, 'card size with 3(include cardA & cardB)')
  assert.equal(await cardA.size, 1, 'cardA size with 1')
  assert.equal(await cardB.size, 1, 'cardB size with 1')

  await cardB.clear()
  assert.equal(await card.size,  2, 'card size with 2(include cardA & cardB)')
  assert.equal(await cardA.size, 1, 'cardA size with 1')
  assert.equal(await cardB.size, 0, 'cardB size with 0')

  await cardA.clear()
  assert.equal(await card.size,  1, 'card size with 1(include cardA & cardB)')
  assert.equal(await cardA.size, 0, 'cardA size with 0')
  assert.equal(await cardB.size, 0, 'cardB size with 0')

  await card.destroy()
})

test('multiplex deeper than two layers', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const NAME = Math.random().toString().slice(2)

  const card    = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA   = card.multiplex('a')
  const cardAA  = cardA.multiplex('a')
  const cardAAA = cardAA.multiplex('a')

  await card.set(KEY, VAL)
  await cardA.set(KEY, VAL)
  await cardAA.set(KEY, VAL)
  await cardAAA.set(KEY, VAL)

  assert.equal(await card.size,  4, 'card size with 4(include cardA & cardAA & cardAAA)')
  assert.equal(await cardA.size, 3, 'cardA size with 3')
  assert.equal(await cardAA.size, 2, 'cardAA size with 2')
  assert.equal(await cardAAA.size, 1, 'cardAAA size with 1')

  await cardAA.delete('a')
  assert.equal(await card.size,  3, 'card size with 3(include cardA & cardAA & cardAAA)')
  assert.equal(await cardA.size, 2, 'cardA size with 2')
  assert.equal(await cardAA.size, 1, 'cardAA size with 1 (include cardAAA)')
  assert.equal(await cardAAA.size, 1, 'cardAAA size with 1')

  await card.destroy()
})

test('multiplex destroy()', async () => {
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCard({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  await assert.rejects(
    async () => cardA.destroy(),
    /can not destroy on a multiplexed memory/,
  )

  await card.destroy()
})

test('multiplex has()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCard({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  assert.equal(await card.has(KEY),  false, 'should has nothing in init')
  assert.equal(await cardA.has(KEY), false, 'should has nothing in init')

  await card.set(KEY, VAL)
  assert.equal(await card.has(KEY),  true,  'should has KEY for card')
  assert.equal(await cardA.has(KEY), false, 'should not has KEY for cardA')

  await cardA.set(KEY, VAL)
  assert.equal(await card.has(KEY),  true, 'should has KEY for card')
  assert.equal(await cardA.has(KEY), true, 'should has KEY for cardA')

  await card.destroy()
})

test('multiplex keys()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys: string[] = []
  const cardAKeys: string[] = []

  for await (const key of card.keys()) {
    cardKeys.push(key)
  }
  for await (const key of cardA.keys()) {
    cardAKeys.push(key)
  }

  assert.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  assert.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')

  await card.destroy()
})

test('multiplex values()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardValues: any[] = []
  const cardAValues: any[] = []

  for await (const value of card.values()) {
    cardValues.push(value)
  }
  for await (const value of cardA.values()) {
    cardAValues.push(value)
  }

  assert.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')
  assert.deepEqual(cardAValues, [VALA], 'should get values back for cardA')

  await card.destroy()
})

test('multiplex entries()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys: string[] = []
  const cardAKeys: string[] = []
  const cardValues: any[] = []
  const cardAValues: any[] = []

  for await (const [key, value] of card.entries()) {
    cardKeys.push(key)
    cardValues.push(value)
  }
  assert.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  assert.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')

  for await (const [key, value] of cardA.entries()) {
    cardAKeys.push(key)
    cardAValues.push(value)
  }
  assert.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')
  assert.deepEqual(cardAValues, [VALA], 'should get values back for cardA')

  await card.destroy()
})

test('multiplex [Symbol.asyncIterator]()', async () => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys: string[] = []
  const cardAKeys: string[] = []
  const cardValues: any[] = []
  const cardAValues: any[] = []

  for await (const [key, value] of card) {
    cardKeys.push(key)
    cardValues.push(value)
  }
  assert.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  assert.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')

  for await (const [key, value] of cardA) {
    cardAKeys.push(key)
    cardAValues.push(value)
  }
  assert.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')
  assert.deepEqual(cardAValues, [VALA], 'should get values back for cardA')

  await card.destroy()
})

test('multiplex toString()', async () => {
  const NAME = Math.random().toString().slice(2)
  const MULTIPLEX_NAME = 'sub'

  const cardNoName = new MemoryCard({ name: 'test' })
  await cardNoName.load()

  const cardNoNameA = cardNoName.multiplex(MULTIPLEX_NAME)

  const card = new MemoryCard({ name: NAME, storageOptions: { type: 'nop' } })
  const cardA = card.multiplex(MULTIPLEX_NAME)

  assert.equal(cardNoName.toString(), 'MemoryCard<test>', 'should get toString with empty name')
  assert.equal(cardNoNameA.toString(), `MemoryCard<test>.multiplex(${MULTIPLEX_NAME})`,
    'should get toString with empty name . multiplex(xxx)',
  )

  assert.equal(card.toString(), `MemoryCard<${NAME}>`, 'should get toString with name')
  assert.equal(cardA.toString(), `MemoryCard<${NAME}>.multiplex(${MULTIPLEX_NAME})`,
    'should get toString with name & sub name',
  )
})

test('multiplex multiplexKey()', async () => {
  const SUB_NAME = 'sub-name'
  const SUB_KEY  = 'sub-key'
  const NAME = Math.random().toString().slice(2)

  const EXPECTED_ABS_KEY = [
    NAMESPACE_MULTIPLEX_SEPRATOR,
    SUB_NAME,
    NAMESPACE_KEY_SEPRATOR,
    SUB_KEY,
  ].join('')

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex(SUB_NAME)

  assert.equal(card.resolveKey(SUB_KEY), SUB_KEY, 'root memory should get the same subKey for their arg')
  assert.equal(cardA.resolveKey(SUB_KEY), EXPECTED_ABS_KEY, 'should get subKey for NAME')

  await card.destroy()
})

test('multiplex isMultiplex()', async () => {
  const NAME = Math.random().toString().slice(2)

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex(NAME)

  assert.equal(card.isMultiplex(), false, 'card is not a sub memory')
  assert.equal(cardA.isMultiplex(), true, 'card a is a sub memory')

  await card.destroy()
})

test('multiplex isMultiplexKey()', async () => {
  const NAME = Math.random().toString().slice(2)
  const KEY  = Math.random().toString().slice(2)

  const EXPECTED_MULTIPLEX_KEY = [
    NAMESPACE_MULTIPLEX_SEPRATOR,
    NAME,
    NAMESPACE_KEY_SEPRATOR,
    KEY,
  ].join('')

  const card = new MemoryCardTest({ name: NAME, storageOptions: { type: 'nop' } })
  const cardA = card.multiplex(NAME)

  assert.equal(card.isMultiplexKey(KEY),                     false,  'card should identify normal string as not sub key')
  assert.equal(cardA.isMultiplexKey(EXPECTED_MULTIPLEX_KEY), true,   'card a should identify SUB_KEY a sub key')
})

test('multiplex save()', async () => {
  const MEMORY_NAME = Math.random().toString().slice(2)
  const SUB_NAME    = Math.random().toString().slice(2)

  const card  = new MemoryCardTest({ name: MEMORY_NAME, storageOptions: { type: 'nop' } })
  await card.load()

  const cardA = card.multiplex(SUB_NAME)

  let saveCount = 0
  const originalSave = card.save.bind(card)
  card.save = async () => {
    saveCount++
    return originalSave()
  }

  await cardA.save()
  assert.equal(saveCount, 1, 'multiplexed memory should call parent save()')

  await card.destroy()
})

test('multiplex multiplexPath()', async () => {
  const SUB_NAME_A = Math.random().toString().slice(2)
  const SUB_NAME_B = Math.random().toString().slice(2)

  const EXPECTED_SUB_PATH = [SUB_NAME_A, SUB_NAME_B].join('/')

  const card = new MemoryCardTest({ name: 'test', storageOptions: { type: 'nop' } })
  const cardA = card.multiplex(SUB_NAME_A)
  const cardB = cardA.multiplex(SUB_NAME_B)

  assert.equal(cardB.multiplexPath(), EXPECTED_SUB_PATH, 'should get sub path right')
})
