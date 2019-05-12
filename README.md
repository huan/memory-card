# MEMORY CARD

[![NPM Version](https://badge.fury.io/js/memory-card.svg)](https://badge.fury.io/js/memory-card)
[![npm (next)](https://img.shields.io/npm/v/memory-card/next.svg)](https://www.npmjs.com/package/memory-card?activeTab=versions)
[![Powered by TypeScript](https://img.shields.io/badge/Powered%20By-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://travis-ci.com/huan/memory-card.svg?branch=master)](https://travis-ci.com/huan/memory-card)
[![Greenkeeper badge](https://badges.greenkeeper.io/huan/memory-card.svg)](https://greenkeeper.io/)

Memory Card is an Easy to Use Key/Value Store, with Swagger API Backend &amp; Serialization Support.

- It is design for using in distribution scenarios.
- It is NOT design for performance.

![Memory Card](https://huan.github.io/memory-card/images/memory-card-logo.png)

## API

```ts
/**
 * ES6 Map like Async API
 */
export interface AsyncMap<K = any, V = any> {
  size: Promise<number>

  [Symbol.asyncIterator](): AsyncIterableIterator<[K, V]>
  entries()                  : AsyncIterableIterator<[K, V]>
  keys    ()                 : AsyncIterableIterator<K>
  values  ()                 : AsyncIterableIterator<V>

  get     (key: K)           : Promise<V | undefined>
  set     (key: K, value: V) : Promise<void>
  has     (key: K)           : Promise<boolean>
  delete  (key: K)           : Promise<void>
  clear   ()                 : Promise<void>
}

export class MemoryCard implements AsyncMap { ... }
```

### 1. load()

### 2. save()

### 3. destroy()

### 4. multiplex()

## TODO

1. Swagger API Backend Support
1. toJSON Serializable with Metadata

## CHANGELOG

### v0.6 master (Aug 2018)

1. Support AWS S3 Cloud Storage

### v0.4 July 2018

1. Add `multiplex()` method to Multiplex MemoryStore to sub-MemoryStores.

### v0.2 June 2018

1. Unit Testing
1. NPM Pack Testing
1. DevOps to NPM with `@next` tag support for developing branch

### v0.0 May 31st, 2018

1. Promote `Profile` of Wechaty to SOLO NPM Module: `MemoryCard`
1. Update the API to ES6 `Map`-like, the difference is that MemoryCard is all **Async**.

## AUTHOR

Huan LI \<zixia@zixia.net\> (http://linkedin.com/in/zixia)

<a href="http://stackoverflow.com/users/1123955/zixia">
  <img src="http://stackoverflow.com/users/flair/1123955.png" width="208" height="58" alt="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers" title="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers">
</a>

## COPYRIGHT & LICENSE

* Code & Docs © 2017 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
