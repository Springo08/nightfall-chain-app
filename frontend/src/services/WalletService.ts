import * as bip39 from 'bip39';

export interface Wallet {
    mnemonic: string;
    privateKey: string;
    publicKey: string;
    address: string;
}

/**
 * Generates a random 12-word mnemonic using BIP39 wordlist
 */
function generateMnemonic(): string {
    const wordlist = bip39.wordlists.english;
    const words: string[] = [];

    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * wordlist.length);
        words.push(wordlist[randomIndex]);
    }

    return words.join(' ');
}

/**
 * Generates a simple hash from a string using SHA-256
 */
async function simpleHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a new wallet with random mnemonic
 */
export async function generateWallet(): Promise<Wallet> {
    // Generate random 12-word mnemonic
    const mnemonic = generateMnemonic();

    // Generate private key from mnemonic (SHA-256 hash)
    const privateKey = await simpleHash(mnemonic);

    // Generate public key (hash of private key)
    const publicKey = await simpleHash(privateKey);

    // Generate address (0x + first 40 chars of public key hash)
    const addressHash = await simpleHash(publicKey);
    const address = '0x' + addressHash.substring(0, 40);

    return {
        mnemonic,
        privateKey,
        publicKey,
        address
    };
}

/**
 * Restores a wallet from a mnemonic phrase
 */
export async function restoreWallet(mnemonic: string): Promise<Wallet | null> {
    if (!mnemonic || mnemonic.trim().split(/\s+/).length !== 12) {
        return null;
    }

    // Generate keys from mnemonic (same process as generation)
    const privateKey = await simpleHash(mnemonic);
    const publicKey = await simpleHash(privateKey);
    const addressHash = await simpleHash(publicKey);
    const address = '0x' + addressHash.substring(0, 40);

    return {
        mnemonic,
        privateKey,
        publicKey,
        address
    };
}

/**
 * Validates a mnemonic (basic check - 12 words from BIP39 wordlist)
 */
export function validateMnemonic(mnemonic: string): boolean {
    const wordlist = bip39.wordlists.english;
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12 && words.every(word => wordlist.includes(word));
}

/**
 * Gets the BIP39 wordlist for autocomplete
 */
export function getWordlist(): string[] {
    return bip39.wordlists.english;
}
