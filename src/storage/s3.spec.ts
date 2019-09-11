#!/usr/bin/env ts-node

import test from 'blue-tape'

import { StorageS3 } from './s3'

import { AWS_SETTING } from '../../tests/fixtures'

test.skip('amazon s3 storage smoke testing', async t => {
  const EXPECTED_PAYLOAD = { mol: 42 }
  const NAME             = Math.random().toString().substr(2)

  const s3 = new StorageS3(
    NAME,
    {
      accessKeyId     : AWS_SETTING.ACCESS_KEY_ID,
      bucket          : AWS_SETTING.BUCKET,
      region          : AWS_SETTING.REGION,
      secretAccessKey : AWS_SETTING.SECRET_ACCESS_KEY,
    },
  )

  let empty = await s3.load()
  t.deepEqual(empty, {}, 'should get back a empty object for non-exist data')

  await s3.save(EXPECTED_PAYLOAD)
  const payload = await s3.load()

  t.deepEqual(payload, EXPECTED_PAYLOAD, 'should get back data from s3')

  await s3.destroy()

  empty = await s3.load()
  t.deepEqual(empty, {}, 'should get back a empty object after destroy()')
})
