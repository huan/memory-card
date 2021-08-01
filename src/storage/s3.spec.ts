#!/usr/bin/env ts-node

import test from 'blue-tape'

import { StorageBackendOptions } from './backend-config'
import { StorageS3 } from './s3'

test('amazon s3 storage smoke testing', async t => {

  const awsConfig: Partial<StorageBackendOptions> = {
    accessKeyId     : process.env['AWS_ACCESS_KEY_ID'],
    bucket          : process.env['AWS_S3_BUCKET'],
    region          : process.env['AWS_REGION'],
    secretAccessKey : process.env['AWS_SECRET_ACCESS_KEY'],
  }

  if (Object.values(awsConfig).some(x => !x)) {
    t.skip('AWS S3 environment variables not set.')
    return
  }

  const EXPECTED_PAYLOAD = { mol: 42 }
  const NAME             = 'tmp/memory-card-unit-test-' + Math.random().toString().substr(2)

  const s3 = new StorageS3(
    NAME,
    awsConfig as StorageBackendOptions,
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
