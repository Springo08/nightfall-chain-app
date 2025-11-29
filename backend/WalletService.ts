import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export interface Wallet {
    mnemonic: string;
    privateKey: string;
    publicKey: string;
    address: string;
}

/**
 * Generates a new wallet with BIP39 mnemonic seed phrase
 * @returns Wallet object with mnemonic, keys, and address
 */
export function generateWallet(): Wallet {
    // Generate 256-bit entropy for maximum security
    const entropy = crypto.randomBytes(32);

    // Generate BIP39 mnemonic (12 words)
    const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'));

    // Derive keys from mnemonic
    return deriveKeysFromMnemonic(mnemonic);
}

/**
 * Derives private/public keys and address from a BIP39 mnemonic
 * @param mnemonic - 12-word BIP39 mnemonic phrase
 * @returns Wallet object with keys and address
 */
export function deriveKeysFromMnemonic(mnemonic: string): Wallet {
    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // Use first 32 bytes of seed as private key
    const privateKeyBytes = seed.slice(0, 32);
    const privateKey = privateKeyBytes.toString('hex');

    // Generate key pair from private key
    const keyPair = ec.keyFromPrivate(privateKey);

    // Get public key (compressed format)
    const publicKey = keyPair.getPublic('hex');

    // Generate address from public key (last 20 bytes of hash)
    const address = generateAddress(publicKey);

    return {
        mnemonic,
        privateKey,
        publicKey,
        address
    };
}

/**
 * Validates a BIP39 mnemonic phrase
 * @param mnemonic - Mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
}

/**
 * Restores a wallet from a BIP39 mnemonic phrase
 * @param mnemonic - 12-word BIP39 mnemonic phrase
 * @returns Wallet object or null if invalid
 */
export function restoreWallet(mnemonic: string): Wallet | null {
    if (!validateMnemonic(mnemonic)) {
        return null;
    }

    return deriveKeysFromMnemonic(mnemonic);
}

/**
 * Generates a wallet address from a public key
 * @param publicKey - Hex-encoded public key
 * @returns Wallet address (0x-prefixed hex string)
 */
function generateAddress(publicKey: string): string {
    // Hash the public key with SHA-256
    const hash = crypto.createHash('sha256').update(publicKey, 'hex').digest();

    // Take last 20 bytes and convert to hex
    const address = hash.slice(-20).toString('hex');

    // Add 0x prefix
    return '0x' + address;
}

/**
 * Gets the BIP39 wordlist (English)
 * @returns Array of 2048 BIP39 words
 */
export function getWordlist(): string[] {
    return bip39.wordlists.english;
}
