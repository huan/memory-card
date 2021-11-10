#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { test } from 'tstest'

import {
  MemoryCard,
}               from '../src/memory-card.js'

test('integrate testing', async t => {
  const card = new MemoryCard()
  await card.load()

  t.equal(await card.size, 0, 'init with 0')

  await card.set('a', 'b')
  t.equal(await card.size, 1, 'size with 1')

  t.equal(await card.get('a'), 'b', 'get key a with value b')

  await card.clear()
  t.equal(await card.size, 0, 'clear reset to 0')
})
