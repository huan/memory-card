/**
 * ES6 Map like Async API
 */
export interface AsyncMap<K = any, V = any> {
  size: Promise<number>

  [Symbol.asyncIterator] () : AsyncIterableIterator<[K, V]>
  entries                () : AsyncIterableIterator<[K, V]>
  keys                   () : AsyncIterableIterator<K>
  values                 () : AsyncIterableIterator<V>

  get     (key: K)           : Promise<V | undefined>
  set     (key: K, value: V) : Promise<void>
  has     (key: K)           : Promise<boolean>
  delete  (key: K)           : Promise<void>
  clear   ()                 : Promise<void>
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
