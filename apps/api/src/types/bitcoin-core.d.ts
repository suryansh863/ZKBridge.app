declare module 'bitcoin-core' {
  export default class Client {
    constructor(options: {
      url: string;
      username: string;
      password: string;
    });
    
    getBlockCount(): Promise<number>;
    getBlockHash(height: number): Promise<string>;
    getRawTransaction(txid: string): Promise<string>;
    decodeRawTransaction(hex: string): Promise<any>;
  }
}


