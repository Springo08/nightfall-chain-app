import { useState } from 'react';
import './WalletRestore.css';

interface WalletRestoreProps {
    onRestore: (mnemonic: string, address: string) => void;
    onCancel: () => void;
}

function WalletRestore({ onRestore, onCancel }: WalletRestoreProps) {
    const [words, setWords] = useState<string[]>(Array(12).fill(''));
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeInput, setActiveInput] = useState<number>(-1);

    const handleWordChange = async (index: number, value: string) => {
        const newWords = [...words];
        newWords[index] = value.toLowerCase().trim();
        setWords(newWords);
        setError('');

        // Show suggestions if typing
        if (value.length > 1) {
            const { getWordlist } = await import('../services/WalletService');
            const wordlist = getWordlist();
            const matches = wordlist.filter(w => w.startsWith(value.toLowerCase()));
            setSuggestions(matches.slice(0, 5));
            setActiveInput(index);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (word: string) => {
        if (activeInput >= 0) {
            const newWords = [...words];
            newWords[activeInput] = word;
            setWords(newWords);
            setSuggestions([]);
            setActiveInput(-1);

            // Focus next input
            if (activeInput < 11) {
                const nextInput = document.getElementById(`word-${activeInput + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleRestore = async () => {
        const mnemonic = words.join(' ');

        try {
            const { restoreWallet } = await import('../services/WalletService');
            const wallet = await restoreWallet(mnemonic);

            if (!wallet) {
                setError('Ungültige Seed Phrase. Bitte überprüfe die eingegebenen Wörter.');
                return;
            }

            onRestore(wallet.mnemonic, wallet.address);
        } catch (err) {
            setError('Fehler beim Wiederherstellen des Wallets. Bitte versuche es erneut.');
        }
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const pastedWords = pastedText.trim().split(/\s+/);

        if (pastedWords.length === 12) {
            setWords(pastedWords.map(w => w.toLowerCase()));
            setError('');
        } else {
            setError('Bitte füge genau 12 Wörter ein.');
        }
    };

    const isComplete = words.every(w => w.length > 0);

    return (
        <div className="wallet-restore-overlay">
            <div className="wallet-restore-container">
                <div className="wallet-restore-header">
                    <h1>🔑 Wallet wiederherstellen</h1>
                    <p>Gib deine 12-Wörter Seed Phrase ein</p>
                </div>

                <div className="restore-grid" onPaste={handlePaste}>
                    {words.map((word, index) => (
                        <div key={index} className="restore-word-input">
                            <label>{index + 1}</label>
                            <input
                                id={`word-${index}`}
                                type="text"
                                value={word}
                                onChange={(e) => handleWordChange(index, e.target.value)}
                                onFocus={() => setActiveInput(index)}
                                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                placeholder={`Wort ${index + 1}`}
                                autoComplete="off"
                            />
                            {activeInput === index && suggestions.length > 0 && (
                                <div className="suggestions">
                                    {suggestions.map((suggestion, i) => (
                                        <div
                                            key={i}
                                            className="suggestion-item"
                                            onMouseDown={() => selectSuggestion(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                <div className="restore-hint">
                    💡 Tipp: Du kannst alle 12 Wörter auf einmal einfügen (Strg+V / Cmd+V)
                </div>

                <div className="restore-actions">
                    <button onClick={onCancel} className="btn-cancel">
                        Abbrechen
                    </button>
                    <button
                        onClick={handleRestore}
                        disabled={!isComplete}
                        className="btn-restore"
                    >
                        Wallet wiederherstellen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WalletRestore;
