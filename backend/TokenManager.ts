import { CustomToken } from './Transaction';
import * as crypto from 'crypto';

export class TokenManager {
    private tokens: Map<string, CustomToken> = new Map();

    /**
     * Creates a new custom token
     */
    createToken(name: string, symbol: string, initialSupply: number, creator: string): CustomToken {
        // Generate unique token ID
        const tokenId = this.generateTokenId(name, symbol, creator);

        // Check if token already exists
        if (this.tokens.has(tokenId)) {
            throw new Error(`Token with ID ${tokenId} already exists`);
        }

        const token: CustomToken = {
            id: tokenId,
            name,
            symbol: symbol.toUpperCase(),
            creator,
            initialSupply,
            createdAt: Date.now()
        };

        this.tokens.set(tokenId, token);
        return token;
    }

    /**
     * Generates a unique token ID based on creator, name, and timestamp
     */
    private generateTokenId(name: string, symbol: string, creator: string): string {
        const data = `${creator}-${name}-${symbol}-${Date.now()}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    /**
     * Gets a token by its ID
     */
    getTokenById(tokenId: string): CustomToken | undefined {
        return this.tokens.get(tokenId);
    }

    /**
     * Gets all created tokens
     */
    getAllTokens(): CustomToken[] {
        return Array.from(this.tokens.values());
    }

    /**
     * Checks if a token exists
     */
    tokenExists(tokenId: string): boolean {
        return this.tokens.has(tokenId);
    }

    /**
     * Gets token symbol (for display)
     */
    getTokenSymbol(tokenId: string): string {
        if (tokenId === 'NATIVE') {
            return 'NATIVE';
        }
        const token = this.tokens.get(tokenId);
        return token ? token.symbol : 'UNKNOWN';
    }
}
