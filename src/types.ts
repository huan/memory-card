export type PayloadDataType = number | string

export interface MemoryCardPayload {
  [idx: string]: PayloadDataType,
}

export {
  AsyncMap,
}                       from './async-map.type'
