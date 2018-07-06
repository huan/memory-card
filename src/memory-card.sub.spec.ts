#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test   from 'blue-tape'
import sinon  from 'sinon'

import {
  MemoryCard,
  NAMESPACE_KEY_SEPRATOR,
  NAMESPACE_SUB_SEPRATOR,
}                           from './memory-card'

class MemoryCardTest extends MemoryCard {
  public get payload () {
    return super.payload
  }
  public set payload (data: object) {
    super.payload = data
  }
  public resolveKey (key: string): string {
    return super.resolveKey(key)
  }

  public isSubKey (key: string): boolean {
    return super.isSubKey(key)
  }
}

test('sub set() & get()', async t => {
  const KEY = 'a'
  const VAL = 'b'

  const card = new MemoryCard()
  const cardA = card.sub('a')
  const cardB = card.sub('b')

  t.equal(await card.size,  0, 'init with 0 for card')
  t.equal(await cardA.size, 0, 'init with 0 for cardA')
  t.equal(await cardB.size, 0, 'init with 0 for cardB')

  await card.set(KEY, VAL)
  t.equal(await card.size,  1, 'size with 1')
  t.equal(await cardA.size, 0, 'size with 0 for cardA')
  t.equal(await cardB.size, 0, 'size with 0 for cardB')

  await cardA.set(KEY, VAL)
  t.equal(await card.size,  2, 'card size with 2(include cardA)')
  t.equal(await cardA.size, 1, 'cardA size with 1')
  t.equal(await cardB.size, 0, 'cardB size with 0')

  await cardB.set(KEY, VAL)
  t.equal(await card.size,  3, 'card size with 3(include cardA & cardB)')
  t.equal(await cardA.size, 1, 'cardA size with 1')
  t.equal(await cardB.size, 1, 'cardB size with 1')

  await cardB.delete('a')
  t.equal(await card.size,  2, 'card size with 2(include cardA)')
  t.equal(await cardA.size, 1, 'cardA size with 1')
  t.equal(await cardB.size, 0, 'cardB size with 0')

  await cardA.delete('a')
  t.equal(await card.size,  1, 'size with 1')
  t.equal(await cardA.size, 0, 'size with 0 for cardA')
  t.equal(await cardB.size, 0, 'size with 0 for cardB')

  await card.delete('a')
  t.equal(await card.size,  0, 'size with 0')
  t.equal(await cardA.size, 0, 'size with 0 for cardA')
  t.equal(await cardB.size, 0, 'size with 0 for cardB')

  await card.destroy()
})

test('sub clear()', async t => {
  const KEY = 'a'
  const VAL = 'b'

  const card = new MemoryCard()
  const cardA = card.sub('a')
  const cardB = card.sub('b')

  await card.set(KEY, VAL)
  await cardA.set(KEY, VAL)
  await cardB.set(KEY, VAL)

  t.equal(await card.size,  3, 'card size with 3(include cardA & cardB)')
  t.equal(await cardA.size, 1, 'cardA size with 1')
  t.equal(await cardB.size, 1, 'cardB size with 1')

  await cardB.clear()
  t.equal(await card.size,  2, 'card size with 2(include cardA & cardB)')
  t.equal(await cardA.size, 1, 'cardA size with 1')
  t.equal(await cardB.size, 0, 'cardB size with 0')

  await cardA.clear()
  t.equal(await card.size,  1, 'card size with 1(include cardA & cardB)')
  t.equal(await cardA.size, 0, 'cardA size with 0')
  t.equal(await cardB.size, 0, 'cardB size with 0')

  await card.destroy()
})

test('sub deeper than two layers', async t => {
  const KEY = 'a'
  const VAL = 'b'

  const card    = new MemoryCardTest()
  const cardA   = card.sub('a')
  const cardAA  = cardA.sub('a')
  const cardAAA = cardAA.sub('a')

  await card.set(KEY, VAL)
  await cardA.set(KEY, VAL)
  await cardAA.set(KEY, VAL)
  await cardAAA.set(KEY, VAL)

  // console.log(card.payload)

  t.equal(await card.size,  4, 'card size with 4(include cardA & cardAA & cardAAA)')
  t.equal(await cardA.size, 3, 'cardA size with 3')
  t.equal(await cardAA.size, 2, 'cardAA size with 2')
  t.equal(await cardAAA.size, 1, 'cardAAA size with 1')

  await cardAA.delete('a')
  t.equal(await card.size,  3, 'card size with 4(include cardA & cardAA & cardAAA)')
  t.equal(await cardA.size, 2, 'cardA size with 3')
  t.equal(await cardAA.size, 1, 'cardAA size with 1 (include cardAAA)')
  t.equal(await cardAAA.size, 1, 'cardAAA size with 1')

  await card.destroy()
})

test('sub destroy()', async t => {
  const card = new MemoryCard()
  const cardA = card.sub('test')

  try {
    await cardA.destroy()
    t.fail('should throw')
  } catch (e) {
    t.pass('should not allow destroy() on sub memory')
  }
})

test('sub clear()', async t => {
  const KEY = 'a'
  const VAL = 'b'

  const card = new MemoryCard()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEY, VAL)

  await cardA.clear()

  t.equal(await card.size, 1, 'should keep parent data when clear child(sub)')
  t.equal(await cardA.size, 0, 'should clear the memory')
})

test('sub has()', async t => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'

  const card = new MemoryCard()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  t.ok(await card.has(KEY), 'card should has KEY')
  t.notOk(await card.has(KEYA), 'card should not has KEYA')

  t.ok(await cardA.has(KEYA), 'cardA should has KEYA')
  t.notOk(await cardA.has(KEY), 'cardA should not has KEY')

  await card.destroy()
})

test('sub keys()', async t => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'

  const card = new MemoryCardTest()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys = []
  const cardAKeys = []

  for await (const key of card.keys()) {
    cardKeys.push(key)
  }
  for await (const key of cardA.keys()) {
    cardAKeys.push(key)
  }

  t.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  t.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')
})

test('sub values()', async t => {
  const KEY = 'key'
  const VAL = 'val'
  const KEYA = 'key-a'
  const VALA = 'val-a'

  const card = new MemoryCard()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardValues = []
  const cardAValues = []

  for await (const value of card.values()) {
    cardValues.push(value)
  }
  for await (const value of cardA.values()) {
    cardAValues.push(value)
  }

  t.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')
  t.deepEqual(cardAValues, [VALA], 'should get values back for cardA')
})

test('sub entries()', async t => {
  const KEY = 'key'
  const VAL = 'val'
  const KEYA = 'key-a'
  const VALA = 'val-a'

  const card = new MemoryCardTest()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys    = []
  const cardAKeys   = []
  const cardValues  = []
  const cardAValues = []

  for await (const [key, value] of card.entries()) {
    cardKeys.push(key)
    cardValues.push(value)
  }
  t.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  t.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')

  for await (const [key, value] of cardA.entries()) {
    cardAKeys.push(key)
    cardAValues.push(value)
  }
  // console.log(cardA.payload)
  t.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')
  t.deepEqual(cardAValues, [VALA], 'should get values back for cardA')
})

test('sub [Symbol.asyncIterator]()', async t => {
  const KEY = 'a'
  const VAL = 'b'
  const KEYA = 'aa'
  const VALA = 'bb'

  const card = new MemoryCardTest()
  const cardA = card.sub('test')

  await card.set(KEY, VAL)
  await cardA.set(KEYA, VALA)

  const cardKeys    = []
  const cardAKeys   = []
  const cardValues  = []
  const cardAValues = []

  for await (const [key, value] of card) {
    cardKeys.push(key)
    cardValues.push(value)
  }
  t.deepEqual(cardKeys, [KEY, cardA.resolveKey(KEYA)], 'should get keys back for card')
  t.deepEqual(cardValues, [VAL, VALA], 'should get values back for card')

  for await (const [key, value] of cardA) {
    cardAKeys.push(key)
    cardAValues.push(value)
  }
  t.deepEqual(cardAKeys, [KEYA], 'should get keys back for cardA')
  t.deepEqual(cardAValues, [VALA], 'should get values back for cardA')
})

test('sub toString()', async t => {
  const NAME = 'name'
  const SUB_NAME = 'sub'

  const cardNoName = new MemoryCard()
  const cardNoNameA = cardNoName.sub(SUB_NAME)

  const card = new MemoryCard(NAME)
  const cardA = card.sub(SUB_NAME)

  t.equal(cardNoName.toString(), 'MemoryCard<>', 'should get toString with empty name')
  t.equal(cardNoNameA.toString(), `MemoryCard<>.sub(${SUB_NAME})`, 'should get toString with empty name . sub(xxx)')

  t.equal(card.toString(), `MemoryCard<${NAME}>`, 'should get toString with name')
  t.equal(cardA.toString(), `MemoryCard<${NAME}>.sub(${SUB_NAME})`, 'should get toString with name & sub name')
})

test('sub subKey()', async t => {
  const SUB_NAME = 'sub-name'
  const SUB_KEY  = 'sub-key'

  const EXPECTED_ABS_KEY = [
    NAMESPACE_SUB_SEPRATOR,
    SUB_NAME,
    NAMESPACE_KEY_SEPRATOR,
    SUB_KEY,
  ].join('')

  const card = new MemoryCardTest()
  const cardA = card.sub(SUB_NAME)

  t.equal(card.resolveKey(SUB_KEY), SUB_KEY, 'root memory should get the same subKey for their arg')
  t.equal(cardA.resolveKey(SUB_KEY), EXPECTED_ABS_KEY, 'should get subKey for NAME')
})

test('sub isSub()', async t => {
  const NAME = 'a'

  const card = new MemoryCardTest()
  const cardA = card.sub(NAME)

  t.equal(card.isSub(), false, 'card is not a sub memory')
  t.equal(cardA.isSub(), true, 'card a is a sub memory')
})

test('sub isSubKey()', async t => {
  const NAME = 'name'
  const SUB_KEY = [
    NAMESPACE_SUB_SEPRATOR,
    'name',
    NAMESPACE_KEY_SEPRATOR,
    'key',
  ].join('')

  const card = new MemoryCardTest()
  const cardA = card.sub(NAME)

  t.equal(card.isSubKey(NAME), false, 'card should identify any key as not sub key')
  t.equal(cardA.isSubKey(SUB_KEY), true, 'card a should identify SUB_KEY a sub key')
})

test('sub save()', async t => {
  const MEMORY_NAME = 'unit-test-memory-name'
  const SUB_NAME    = 'unit-test-sub-name'

  const card  = new MemoryCardTest(MEMORY_NAME)
  const cardA = card.sub(SUB_NAME)

  const sandbox = sinon.createSandbox()

  const stub = sandbox.stub(card, 'save').callsFake(() => { /* void */ })

  await cardA.save()
  t.equal(stub.callCount, 1, 'sub memory should call parent save()')

  await card.destroy()
  sandbox.restore()
})
