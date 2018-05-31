/**
 * ES6 Map like Async API
 */
export interface AsyncMap<K = any, V = any> {
  [Symbol.asyncIterator](): AsyncIterableIterator<[K, V]>

  clear   ()                 : Promise<void>
  delete  (key: K)           : Promise<void>
  entries()                  : AsyncIterableIterator<[K, V]>
  get     (key: K)           : Promise<V | undefined>
  has     (key: K)           : Promise<boolean>
  keys    ()                 : AsyncIterableIterator<K>
  set     (key: K, value: V) : Promise<void>
  size    ()                 : Promise<number>
  values  ()                 : AsyncIterableIterator<V>
}

/**
 * ES6 Map Defination:
 */
// interface Map<K, V> {
//   clear(): void;
//   delete(key: K): boolean;
//   forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
//   get(key: K): V | undefined;
//   has(key: K): boolean;
//   set(key: K, value: V): this;
//   readonly size: number;
// }

// interface Map<K, V> {
//   /** Returns an iterable of entries in the map. */
//   [Symbol.iterator](): IterableIterator<[K, V]>;

//   /**
//    * Returns an iterable of key, value pairs for every entry in the map.
//    */
//   entries(): IterableIterator<[K, V]>;

//   /**
//    * Returns an iterable of keys in the map
//    */
//   keys(): IterableIterator<K>;

//   /**
//    * Returns an iterable of values in the map
//    */
//   values(): IterableIterator<V>;
// }
