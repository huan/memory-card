/**
 * Guards the one-API rule: the web entry (`./mod.ts`, served for `browser` and
 * `default`) and the node entry (`./node/mod.ts`, served for `node`) must export
 * the same names, and every exported class must have the same static and
 * prototype members.
 */
import * as assert from 'node:assert/strict'
import * as os from 'node:os'
import * as path from 'node:path'
import { test } from 'node:test'

import * as web from './mod.ts'
import * as node from './node/mod.ts'

const IGNORED = new Set(['length', 'name', 'prototype', 'constructor'])

/** Collects own and inherited member names up to, but excluding, Object/Function. */
function members (target: object): string[] {
  const names = new Set<string>()
  for (
    let proto: object | null = target;
    proto && proto !== Object.prototype && proto !== Function.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const key of Reflect.ownKeys(proto)) {
      if (typeof key === 'string' && !IGNORED.has(key)) {
        names.add(key)
      }
    }
  }
  return [...names].sort()
}

test('web and node entries export the same names', () => {
  assert.deepEqual(Object.keys(node).sort(), Object.keys(web).sort())
})

test('web and node entries export the same kind of value for each name', () => {
  for (const name of Object.keys(web) as Array<keyof typeof web>) {
    assert.equal(typeof node[name as keyof typeof node], typeof web[name], name)
  }
})

test('every exported class has the same static and prototype members', () => {
  for (const [name, value] of Object.entries(web)) {
    if (typeof value !== 'function') continue
    const other = (node as Record<string, unknown>)[name] as typeof value
    assert.deepEqual(members(other), members(value), `${name} statics`)
    assert.deepEqual(
      members(other.prototype),
      members(value.prototype),
      `${name} prototype`,
    )
  }
})

test('compile-time subtyping parity: Node MemoryCard is assignable to Web MemoryCard', () => {
  type IsAssignable<A, B> = [A] extends [B] ? true : false
  const isAssignable: IsAssignable<node.MemoryCard, web.MemoryCard> = true
  assert.ok(isAssignable)
})

test('Node MemoryCard handles empty storageOptions object and defaults to file storage', async () => {
  const card = new node.MemoryCard({
    name: path.join(os.tmpdir(), 'test-empty-options-' + Math.random().toString(36).slice(2)),
    storageOptions: {} as any,
  })
  await card.load()
  await card.set('k', 'v')
  assert.equal(await card.get('k'), 'v')
  await card.destroy()
})
