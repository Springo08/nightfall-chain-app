import { useState, useEffect } from 'react';
import { validatePassword, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/walletEncryption';
import './PasswordSetup.css';

interface PasswordSetupProps {
    onPasswordSet: (password: string) => void;
    title?: string;
    description?: string;
}

export default function PasswordSetup({
    onPasswordSet,
    title = 'Passwort festlegen',
    description = 'Schütze dein Wallet mit einem sicheren Passwort'
}: PasswordSetupProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        if (password) {
            setStrength(getPasswordStrength(password));
        } else {
            setStrength(0);
        }
    }, [password]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate password
        const validation = validatePassword(password);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein');
            return;
        }

        onPasswordSet(password);
    };

    const strengthColor = getPasswordStrengthColor(strength);
    const strengthLabel = getPasswordStrengthLabel(strength);

    return (
        <div className="password-setup-overlay">
            <div className="password-setup-container">
                <div className="setup-icon">🔐</div>
                <h1>{title}</h1>
                <p className="setup-description">{description}</p>

                <form onSubmit={handleSubmit} className="setup-form">
                    <div className="form-group">
                        <label>Passwort</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mindestens 8 Zeichen"
                            className="password-input"
                            autoFocus
                        />

                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${strength}%`,
                                            backgroundColor: strengthColor
                                        }}
                                    />
                                </div>
                                <span className="strength-label" style={{ color: strengthColor }}>
                                    {strengthLabel}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Passwort bestätigen</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Passwort wiederholen"
                            className="password-input"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="password-requirements">
                        <h4>Anforderungen:</h4>
                        <ul>
                            <li className={password.length >= 8 ? 'met' : ''}>
                                {password.length >= 8 ? '✓' : '○'} Mindestens 8 Zeichen
                            </li>
                            <li className={/[a-z]/.test(password) ? 'met' : ''}>
                                {/[a-z]/.test(password) ? '✓' : '○'} Kleinbuchstaben
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'met' : ''}>
                                {/[A-Z]/.test(password) ? '✓' : '○'} Großbuchstaben
                            </li>
                            <li className={/[0-9]/.test(password) ? 'met' : ''}>
                                {/[0-9]/.test(password) ? '✓' : '○'} Zahlen
                            </li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        className="btn-setup"
                        disabled={!password || !confirmPassword}
                    >
                        Passwort festlegen
                    </button>
                </form>

                <div className="setup-warning">
                    <p>⚠️ <strong>Wichtig:</strong> Dieses Passwort kann nicht wiederhergestellt werden. Bewahre es sicher auf!</p>
                </div>
            </div>
        </div>
    );
}
