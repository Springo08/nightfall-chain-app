import { useState, useEffect } from 'react';
import './WalletSetup.css';

interface WalletSetupProps {
    onComplete: (mnemonic: string, address: string) => void;
}

function WalletSetup({ onComplete }: WalletSetupProps) {
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [address, setAddress] = useState<string>('');
    const [confirmed, setConfirmed] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateNewWallet = async () => {
        try {
            // Import wallet service from frontend services
            const { generateWallet } = await import('../services/WalletService');
            const wallet = await generateWallet();

            setMnemonic(wallet.mnemonic.split(' '));
            setAddress(wallet.address);
        } catch (error) {
            console.error('Error generating wallet:', error);
        }
    };

    // Generate wallet on component mount
    useEffect(() => {
        generateNewWallet();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mnemonic.join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadSeedPhrase = () => {
        const blob = new Blob([mnemonic.join(' ')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wallet-seed-phrase.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleContinue = () => {
        if (confirmed) {
            onComplete(mnemonic.join(' '), address);
        }
    };

    return (
        <div className="wallet-setup-overlay">
            <div className="wallet-setup-container">
                <div className="wallet-setup-header">
                    <h1>🎉 Willkommen!</h1>
                    <p>Wir haben ein sicheres Wallet für dich erstellt</p>
                </div>

                <div className="seed-phrase-section">
                    <h2>📝 Deine Seed Phrase</h2>
                    <p className="seed-phrase-description">
                        Diese 12 Wörter sind der <strong>einzige Weg</strong>, dein Wallet wiederherzustellen.
                    </p>

                    <div className="seed-phrase-grid">
                        {mnemonic.map((word, index) => (
                            <div key={index} className="seed-word">
                                <span className="seed-word-number">{index + 1}</span>
                                <span className="seed-word-text">{word}</span>
                            </div>
                        ))}
                    </div>

                    <div className="seed-phrase-actions">
                        <button onClick={copyToClipboard} className="btn-copy">
                            {copied ? '✓ Kopiert!' : '📋 Kopieren'}
                        </button>
                        <button onClick={downloadSeedPhrase} className="btn-download">
                            💾 Als Datei speichern
                        </button>
                    </div>
                </div>

                <div className="warning-box">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                        <h3>Wichtig!</h3>
                        <ul>
                            <li>Schreibe diese Wörter auf Papier auf</li>
                            <li>Bewahre sie an einem sicheren Ort auf</li>
                            <li>Teile sie <strong>niemals</strong> mit anderen</li>
                            <li>Wenn du sie verlierst, ist dein Wallet <strong>unwiederbringlich verloren</strong></li>
                        </ul>
                    </div>
                </div>

                <div className="wallet-address-section">
                    <h3>Deine Wallet-Adresse</h3>
                    <div className="wallet-address">{address}</div>
                </div>

                <div className="confirmation-section">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        <span>
                            Ich habe meine Seed Phrase sicher aufgeschrieben und verstehe, dass ich ohne sie keinen Zugriff auf mein Wallet habe.
                        </span>
                    </label>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!confirmed}
                    className="btn-continue"
                >
                    Weiter zur App →
                </button>
            </div>
        </div>
    );
}

export default WalletSetup;
