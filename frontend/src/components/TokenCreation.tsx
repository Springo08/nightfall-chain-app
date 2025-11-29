import { useState } from 'react';
import './TokenCreation.css';

interface TokenCreationProps {
    walletAddress: string;
    onTokenCreated: () => void;
}

function TokenCreation({ walletAddress, onTokenCreated }: TokenCreationProps) {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [initialSupply, setInitialSupply] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    const handleCreate = async () => {
        setError('');
        setSuccess(false);

        // Validation
        if (!name || !symbol || !initialSupply) {
            setError('All fields are required');
            return;
        }

        if (symbol.length < 2 || symbol.length > 5) {
            setError('Symbol must be 2-5 characters');
            return;
        }

        const supply = Number(initialSupply);
        if (isNaN(supply) || supply <= 0) {
            setError('Initial supply must be a positive number');
            return;
        }

        setCreating(true);

        try {
            const response = await fetch(`${API_URL}/tokens/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    symbol: symbol.toUpperCase(),
                    initialSupply: supply,
                    creator: walletAddress
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create token');
            }

            setSuccess(true);
            setName('');
            setSymbol('');
            setInitialSupply('');

            setTimeout(() => {
                onTokenCreated();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="token-creation">
            <h2>🪙 Create Custom Token</h2>
            <p className="description">
                Create your own token on the blockchain. You will receive the initial supply in your wallet.
            </p>

            <div className="form-group">
                <label>Token Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Token"
                    disabled={creating}
                />
            </div>

            <div className="form-group">
                <label>Token Symbol (2-5 characters)</label>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="MAT"
                    maxLength={5}
                    disabled={creating}
                />
            </div>

            <div className="form-group">
                <label>Initial Supply</label>
                <input
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    placeholder="1000000"
                    min="1"
                    disabled={creating}
                />
                <small>Total number of tokens to create</small>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    ✅ Token created successfully! Mining block...
                </div>
            )}

            <button
                onClick={handleCreate}
                disabled={creating || !name || !symbol || !initialSupply}
                className="btn-create"
            >
                {creating ? 'Creating Token...' : '🪙 Create Token'}
            </button>

            <div className="info-box">
                <h4>ℹ️ How it works:</h4>
                <ul>
                    <li>Token will be created on the blockchain</li>
                    <li>You will receive the initial supply</li>
                    <li>Token can be transferred to other addresses</li>
                    <li>Supply is fixed and cannot be changed</li>
                </ul>
            </div>
        </div>
    );
}

export default TokenCreation;
