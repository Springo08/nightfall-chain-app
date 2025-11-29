import { useState } from 'react';
import './PasswordUnlock.css';

interface PasswordUnlockProps {
    onUnlock: (password: string) => void;
    onRestore: () => void;
    error?: string;
}

export default function PasswordUnlock({ onUnlock, onRestore, error }: PasswordUnlockProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) {
            onUnlock(password);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as any);
        }
    };

    return (
        <div className="password-unlock-overlay">
            <div className="password-unlock-container">
                <div className="unlock-icon">🔒</div>
                <h1>Wallet entsperren</h1>
                <p className="unlock-description">
                    Gib dein Passwort ein, um auf dein Wallet zuzugreifen
                </p>

                <form onSubmit={handleSubmit} className="unlock-form">
                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Passwort eingeben..."
                            className="password-input"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className="btn-unlock">
                        Entsperren
                    </button>
                </form>

                <div className="unlock-footer">
                    <p>Passwort vergessen?</p>
                    <button onClick={onRestore} className="btn-restore-link">
                        Wallet mit Seed Phrase wiederherstellen
                    </button>
                </div>
            </div>
        </div>
    );
}
