import CryptoJS from 'crypto-js';

export interface WalletData {
    mnemonic: string;
    address: string;
    createdAt: number;
}

export interface EncryptedWallet {
    encrypted: true;
    data: string;
    createdAt: number;
}

/**
 * Encrypts wallet data using AES-256 encryption
 */
export function encryptWalletData(wallet: WalletData, password: string): EncryptedWallet {
    const walletString = JSON.stringify(wallet);
    const encrypted = CryptoJS.AES.encrypt(walletString, password).toString();

    return {
        encrypted: true,
        data: encrypted,
        createdAt: wallet.createdAt
    };
}

/**
 * Decrypts wallet data
 * @throws Error if password is incorrect
 */
export function decryptWalletData(encryptedWallet: EncryptedWallet, password: string): WalletData {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedWallet.data, password);
        const walletString = decrypted.toString(CryptoJS.enc.Utf8);

        if (!walletString) {
            throw new Error('Invalid password');
        }

        return JSON.parse(walletString);
    } catch (error) {
        throw new Error('Invalid password or corrupted data');
    }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Passwort muss mindestens 8 Zeichen lang sein' };
    }

    return { valid: true, message: '' };
}

/**
 * Calculates password strength (0-100)
 */
export function getPasswordStrength(password: string): number {
    let strength = 0;

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (password.length >= 16) strength += 10;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;

    // Contains numbers
    if (/[0-9]/.test(password)) strength += 10;

    // Contains special characters
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
}

/**
 * Gets password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
    if (strength < 40) return 'Schwach';
    if (strength < 70) return 'Mittel';
    return 'Stark';
}

/**
 * Gets password strength color
 */
export function getPasswordStrengthColor(strength: number): string {
    if (strength < 40) return '#e74c3c';
    if (strength < 70) return '#f39c12';
    return '#42d392';
}
