import * as fs from 'fs';
import * as path from 'path';
import { Blockchain } from './Blockchain';
import { Block } from './Block';
import { Transaction } from './Transaction';

export class PersistenceService {
    private dataPath: string;

    constructor(dataPath: string = './blockchain-data') {
        this.dataPath = dataPath;

        // Create data directory if it doesn't exist
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }

    /**
     * Save blockchain to file
     */
    saveBlockchain(blockchain: Blockchain): void {
        try {
            const data = {
                chain: blockchain.chain,
                pendingTransactions: blockchain.pendingTransactions,
                difficulty: blockchain.difficulty,
                miningReward: blockchain.miningReward,
                maxSupply: blockchain.maxSupply,
                circulatingSupply: blockchain.circulatingSupply,
                tokens: blockchain.tokenManager.getAllTokens(),
                timestamp: Date.now()
            };

            const filePath = path.join(this.dataPath, 'blockchain.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log('✅ Blockchain saved successfully');
        } catch (error) {
            console.error('❌ Error saving blockchain:', error);
        }
    }

    /**
     * Load blockchain from file
     */
    loadBlockchain(blockchain: Blockchain): boolean {
        try {
            const filePath = path.join(this.dataPath, 'blockchain.json');

            if (!fs.existsSync(filePath)) {
                console.log('📁 No saved blockchain found, starting fresh');
                return false;
            }

            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Restore chain
            blockchain.chain = data.chain.map((blockData: any) => {
                const block = new Block(
                    blockData.timestamp,
                    blockData.transactions.map((tx: any) =>
                        new Transaction(
                            tx.fromAddress,
                            tx.toAddress,
                            tx.amount,
                            tx.message,
                            tx.type,
                            tx.tokenId,
                            tx.tokenData
                        )
                    ),
                    blockData.previousHash
                );
                block.hash = blockData.hash;
                block.nonce = blockData.nonce;
                return block;
            });

            // Restore pending transactions
            blockchain.pendingTransactions = data.pendingTransactions.map((tx: any) =>
                new Transaction(
                    tx.fromAddress,
                    tx.toAddress,
                    tx.amount,
                    tx.message,
                    tx.type,
                    tx.tokenId,
                    tx.tokenData
                )
            );

            // Restore other properties
            blockchain.difficulty = data.difficulty;
            blockchain.miningReward = data.miningReward;
            blockchain.maxSupply = data.maxSupply;
            blockchain.circulatingSupply = data.circulatingSupply;

            // Restore tokens
            if (data.tokens) {
                for (const token of data.tokens) {
                    try {
                        blockchain.tokenManager.createToken(
                            token.name,
                            token.symbol,
                            token.initialSupply,
                            token.creator
                        );
                    } catch (e) {
                        // Token might already exist from chain processing
                    }
                }
            }

            console.log(`✅ Blockchain loaded: ${blockchain.chain.length} blocks, ${blockchain.pendingTransactions.length} pending transactions`);
            return true;
        } catch (error) {
            console.error('❌ Error loading blockchain:', error);
            return false;
        }
    }

    /**
     * Auto-save on interval
     */
    startAutoSave(blockchain: Blockchain, intervalMs: number = 30000): NodeJS.Timeout {
        console.log(`🔄 Auto-save enabled (every ${intervalMs / 1000}s)`);
        return setInterval(() => {
            this.saveBlockchain(blockchain);
        }, intervalMs);
    }
}
