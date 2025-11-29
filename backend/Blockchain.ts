import { Block } from './Block';
import { Transaction, TransactionType } from './Transaction';
import { TokenManager } from './TokenManager';

export class Blockchain {
    public chain: Block[];
    public difficulty: number;
    public pendingTransactions: Transaction[];
    public miningReward: number;
    public maxSupply: number = 10000000;
    public circulatingSupply: number = 0;
    public tokenManager: TokenManager;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 4;
        this.tokenManager = new TokenManager();
    }

    createGenesisBlock(): Block {
        return new Block(Date.now(), [], '0');
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string): boolean {
        // Check if there are any pending transactions
        if (this.pendingTransactions.length === 0) {
            console.log('No pending transactions to mine');
            return false;
        }

        // Check if max supply is reached
        if (this.circulatingSupply + this.miningReward > this.maxSupply) {
            console.log('Max supply reached. No more mining rewards.');
            this.miningReward = 0;
        }

        // Take up to 5 transactions for this block
        const transactionsForBlock = this.pendingTransactions.slice(0, 5);

        // Add mining reward
        const rewardTx = new Transaction(
            null,
            miningRewardAddress,
            this.miningReward,
            'Mining reward',
            TransactionType.MINING_REWARD
        );
        transactionsForBlock.push(rewardTx);

        const block = new Block(Date.now(), transactionsForBlock, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.circulatingSupply += this.miningReward;

        // Remove the transactions that were mined
        this.pendingTransactions = this.pendingTransactions.slice(transactionsForBlock.length - 1); // -1 because mining reward wasn't in pending

        // Adjust difficulty
        this.difficulty = this.adjustDifficulty(this.chain);

        return true;
    }

    adjustDifficulty(chain: Block[]): number {
        const DIFFICULTY_ADJUSTMENT_INTERVAL = 5;
        const BLOCK_GENERATION_INTERVAL = 10000; // 10 seconds

        if (chain.length % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && chain.length > DIFFICULTY_ADJUSTMENT_INTERVAL) {
            const prevAdjustmentBlock = chain[chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
            const latestBlock = chain[chain.length - 1];
            const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
            const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;

            if (timeTaken < timeExpected / 2) {
                console.log(`⚡ Mining too fast (${timeTaken}ms vs ${timeExpected}ms). Increasing difficulty +1`);
                return this.difficulty + 1;
            } else if (timeTaken > timeExpected * 2) {
                console.log(`🐢 Mining too slow (${timeTaken}ms vs ${timeExpected}ms). Decreasing difficulty -1`);
                return Math.max(1, this.difficulty - 1);
            }
        }
        return this.difficulty;
    }

    createTransaction(transaction: Transaction): boolean {
        // Skip validation for mining rewards, token creation, and messages
        if (transaction.type === TransactionType.MINING_REWARD) {
            this.pendingTransactions.push(transaction);
            return true;
        }

        // Handle token creation
        if (transaction.type === TransactionType.TOKEN_CREATE) {
            if (!transaction.tokenData) {
                throw new Error('Token data required for token creation');
            }
            // Token will be registered when block is mined
            this.pendingTransactions.push(transaction);
            return true;
        }

        // Messages are free - no balance validation needed
        if (transaction.type === TransactionType.MESSAGE) {
            this.pendingTransactions.push(transaction);
            return true;
        }

        // Validate balance for transfers
        if (transaction.fromAddress) {
            const balance = this.getBalanceOfAddress(transaction.fromAddress, transaction.tokenId);

            if (balance < transaction.amount) {
                const tokenSymbol = this.tokenManager.getTokenSymbol(transaction.tokenId);
                throw new Error(
                    `Insufficient balance. Have ${balance} ${tokenSymbol}, need ${transaction.amount} ${tokenSymbol}`
                );
            }
        }

        this.pendingTransactions.push(transaction);
        return true;
    }

    /**
     * Gets balance for a specific token
     */
    getBalanceOfAddress(address: string, tokenId: string = 'NATIVE'): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // Register tokens when processing blocks
                if (trans.type === TransactionType.TOKEN_CREATE && trans.tokenData) {
                    try {
                        this.tokenManager.createToken(
                            trans.tokenData.name,
                            trans.tokenData.symbol,
                            trans.tokenData.initialSupply,
                            trans.tokenData.creator
                        );
                    } catch (e) {
                        // Token already registered
                    }
                }

                // Only count transactions for this specific token
                if (trans.tokenId !== tokenId) {
                    continue;
                }

                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    /**
     * Gets balances for all tokens owned by an address
     */
    getAllTokenBalances(address: string): Map<string, number> {
        const balances = new Map<string, number>();

        // Always include native token
        balances.set('NATIVE', this.getBalanceOfAddress(address, 'NATIVE'));

        // Get all custom tokens
        const tokens = this.tokenManager.getAllTokens();
        for (const token of tokens) {
            const balance = this.getBalanceOfAddress(address, token.id);
            if (balance > 0) {
                balances.set(token.id, balance);
            }
        }

        return balances;
    }

    /**
     * Gets all created tokens
     */
    getTokenRegistry() {
        return this.tokenManager.getAllTokens();
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}
