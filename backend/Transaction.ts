export enum TransactionType {
    TRANSFER = 'TRANSFER',
    MESSAGE = 'MESSAGE',
    TOKEN_CREATE = 'TOKEN_CREATE',
    MINING_REWARD = 'MINING_REWARD'
}

export interface CustomToken {
    id: string;
    name: string;
    symbol: string;
    creator: string;
    initialSupply: number;
    createdAt: number;
}

export class Transaction {
    public timestamp: number;

    constructor(
        public fromAddress: string | null,
        public toAddress: string,
        public amount: number,
        public message: string = '',
        public type: TransactionType = TransactionType.TRANSFER,
        public tokenId: string = 'NATIVE',
        public tokenData?: CustomToken
    ) {
        this.timestamp = Date.now();
    }
}
