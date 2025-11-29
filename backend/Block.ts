import * as CryptoJS from 'crypto-js';
import { Transaction } from './Transaction';

export class Block {
    public nonce: number = 0;
    public hash: string;

    constructor(
        public timestamp: number,
        public transactions: Transaction[],
        public previousHash: string = ''
    ) {
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        return CryptoJS.SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}
