import { useState, useEffect } from 'react';
import './TokenPortfolio.css';

interface Token {
    tokenId: string;
    balance: number;
    symbol: string;
}

interface TokenDetails {
    id: string;
    name: string;
    symbol: string;
    creator: string;
    initialSupply: number;
    createdAt: number;
}

interface TokenPortfolioProps {
    walletAddress: string;
    onSelectToken?: (tokenId: string) => void;
}

function TokenPortfolio({ walletAddress, onSelectToken }: TokenPortfolioProps) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [tokenDetails, setTokenDetails] = useState<Map<string, TokenDetails>>(new Map());
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 5000);
        return () => clearInterval(interval);
    }, [walletAddress]);

    const fetchBalances = async () => {
        try {
            // Fetch custom tokens
            const response = await fetch(`${API_URL}/balances/${walletAddress}`);
            const data = await response.json();

            // Fetch native balance
            const nativeResponse = await fetch(`${API_URL}/balance/${walletAddress}`);
            const nativeData = await nativeResponse.json();

            const nativeToken: Token = {
                tokenId: 'NATIVE',
                balance: nativeData.balance || 0,
                symbol: 'NATIVE'
            };

            const allTokens = [nativeToken, ...(data.balances || [])];
            setTokens(allTokens);

            // Fetch details for custom tokens
            for (const token of data.balances || []) {
                if (token.tokenId !== 'NATIVE' && !tokenDetails.has(token.tokenId)) {
                    fetchTokenDetails(token.tokenId);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching balances:', error);
            setLoading(false);
        }
    };

    const fetchTokenDetails = async (tokenId: string) => {
        try {
            const response = await fetch(`${API_URL}/tokens/${tokenId}`);
            const data = await response.json();
            setTokenDetails(prev => new Map(prev).set(tokenId, data));
        } catch (error) {
            console.error('Error fetching token details:', error);
        }
    };

    if (loading) {
        return <div className="token-portfolio loading">Loading portfolio...</div>;
    }

    return (
        <div className="token-portfolio">
            <h2>💼 My Token Portfolio</h2>

            {tokens.length === 0 ? (
                <div className="empty-state">
                    <p>No tokens yet. Create your first token!</p>
                </div>
            ) : (
                <div className="token-list">
                    {tokens.map((token) => {
                        const details = tokenDetails.get(token.tokenId);
                        const isNative = token.tokenId === 'NATIVE';

                        return (
                            <div
                                key={token.tokenId}
                                className={`token-card ${onSelectToken ? 'clickable' : ''}`}
                                onClick={() => onSelectToken && onSelectToken(token.tokenId)}
                            >
                                <div className="token-icon">
                                    {isNative ? '💎' : '🪙'}
                                </div>
                                <div className="token-info">
                                    <h3>{isNative ? 'Native Token' : details?.name || 'Loading...'}</h3>
                                    <p className="token-symbol">{token.symbol}</p>
                                    {details && !isNative && (
                                        <p className="token-meta">
                                            Total Supply: {details.initialSupply.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="token-balance">
                                    <div className="balance-amount">{token.balance.toLocaleString()}</div>
                                    <div className="balance-label">{token.symbol}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TokenPortfolio;
