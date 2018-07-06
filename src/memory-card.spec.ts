#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test from 'blue-tape'

import {
  MemoryCard,
}               from './memory-card'

test('smoke testing', async t => {
  const card = new MemoryCard()

  t.equal(await card.size, 0, 'init with 0')

  await card.set('a', 'b')
  t.equal(await card.size, 1, 'size with 1')

  t.equal(await card.get('a'), 'b', 'get key a with value b')

  await card.clear()
  t.equal(await card.size, 0, 'clear reset to 0')
})
