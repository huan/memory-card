#!/usr/bin/env ts-node

import test from 'blue-tape'

import { StorageEtcd } from './etcd'

test('etcd storage smoke testing', async t => {
  const EXPECTED_PAYLOAD = { mol: 42 }
  const NAME             = 'tmp/memory-card-unit-test-' + Math.random().toString().substr(2)

  const etcd = new StorageEtcd(
    NAME,
    {
      hosts: '127.0.0.1:2379',
    }
  )

  let empty = await etcd.load()
  t.deepEqual(empty, {}, 'should get back a empty object for non-exist data')

  await etcd.save(EXPECTED_PAYLOAD)
  const payload = await etcd.load()

  t.deepEqual(payload, EXPECTED_PAYLOAD, 'should get back data from s3')

  await etcd.destroy()

  empty = await etcd.load()
  t.deepEqual(empty, {}, 'should get back a empty object after destroy()')
})
