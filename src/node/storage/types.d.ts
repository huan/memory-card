declare module 'aws-sdk' {
  const AWS: any
  export default AWS
}

declare module 'esdk-obs-nodejs' {
  const ObsClient: any
  export default ObsClient
}

declare module 'etcd3' {
  export class Etcd3 {
    constructor(options?: any)
    put(key: string): any
    get(key: string): any
    delete(): any
  }
}
