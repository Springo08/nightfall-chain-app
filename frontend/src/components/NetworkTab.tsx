import { useState, useEffect } from 'react';
import './NetworkTab.css';

interface NetworkTabProps {
    apiUrl: string;
}

interface ConnectionInfo {
    httpPort: number;
    p2pPort: number;
    peers: number;
    message: string;
}

function NetworkTab({ apiUrl }: NetworkTabProps) {
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
    const [peers, setPeers] = useState<string[]>([]);
    const [newPeerAddress, setNewPeerAddress] = useState('');
    const [status, setStatus] = useState('');
    const [localIp, setLocalIp] = useState('Loading...');

    useEffect(() => {
        fetchConnectionInfo();
        fetchPeers();
        fetchLocalIp();

        const interval = setInterval(() => {
            fetchConnectionInfo();
            fetchPeers();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchConnectionInfo = async () => {
        try {
            const res = await fetch(`${apiUrl}/connection-info`);
            const data = await res.json();
            setConnectionInfo(data);
        } catch (error) {
            console.error('Error fetching connection info:', error);
        }
    };

    const fetchPeers = async () => {
        try {
            const res = await fetch(`${apiUrl}/peers`);
            const data = await res.json();
            setPeers(data);
        } catch (error) {
            console.error('Error fetching peers:', error);
        }
    };

    const fetchLocalIp = async () => {
        try {
            // Try to get local IP from a public service
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setLocalIp(data.ip);
        } catch (error) {
            setLocalIp('Unable to detect');
        }
    };

    const connectToPeer = async () => {
        if (!newPeerAddress.trim()) {
            setStatus('⚠️ Please enter a peer address');
            return;
        }

        setStatus('Connecting...');
        try {
            const res = await fetch(`${apiUrl}/peers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ peer: newPeerAddress }),
            });

            if (res.ok) {
                setStatus('✅ Connected successfully!');
                setNewPeerAddress('');
                fetchPeers();
            } else {
                setStatus('❌ Connection failed');
            }
        } catch (error) {
            setStatus('❌ Connection error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setStatus('📋 Copied to clipboard!');
        setTimeout(() => setStatus(''), 2000);
    };

    const getLocalAddress = () => {
        if (!connectionInfo) return 'Loading...';
        return `ws://YOUR_LOCAL_IP:${connectionInfo.p2pPort}`;
    };

    const getPublicAddress = () => {
        if (!connectionInfo) return 'Loading...';
        return `ws://${localIp}:${connectionInfo.p2pPort}`;
    };

    return (
        <div className="network-tab">
            <h2>🌐 Network Connection</h2>

            {/* Server Info */}
            <section className="network-card">
                <h3>📡 Your Server</h3>
                <div className="server-info">
                    <div className="info-row">
                        <span className="label">HTTP API:</span>
                        <span className="value">Port {connectionInfo?.httpPort || '...'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">P2P Server:</span>
                        <span className="value">Port {connectionInfo?.p2pPort || '...'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Connected Peers:</span>
                        <span className="value peers-count">{connectionInfo?.peers || 0}</span>
                    </div>
                </div>
            </section>

            {/* Connection Addresses */}
            <section className="network-card">
                <h3>🔗 Share Your Address</h3>
                <p className="description">
                    Share this address with others so they can connect to your node
                </p>

                <div className="address-box">
                    <div className="address-label">Local Network Address:</div>
                    <div className="address-value">
                        <code>{getLocalAddress()}</code>
                        <button
                            onClick={() => copyToClipboard(getLocalAddress())}
                            className="btn-copy"
                        >
                            📋 Copy
                        </button>
                    </div>
                    <small>Use this for computers on the same WiFi/network</small>
                </div>

                <div className="address-box">
                    <div className="address-label">Public Address:</div>
                    <div className="address-value">
                        <code>{getPublicAddress()}</code>
                        <button
                            onClick={() => copyToClipboard(getPublicAddress())}
                            className="btn-copy"
                        >
                            📋 Copy
                        </button>
                    </div>
                    <small>Use this for computers on the internet (requires port forwarding)</small>
                </div>
            </section>

            {/* Connect to Peer */}
            <section className="network-card">
                <h3>➕ Connect to Peer</h3>
                <p className="description">
                    Enter the WebSocket address of another node to connect
                </p>

                <div className="connect-form">
                    <input
                        type="text"
                        value={newPeerAddress}
                        onChange={(e) => setNewPeerAddress(e.target.value)}
                        placeholder="ws://192.168.1.100:6002"
                        className="peer-input"
                    />
                    <button onClick={connectToPeer} className="btn-connect">
                        🔌 Connect
                    </button>
                </div>

                {status && <p className="status-message">{status}</p>}

                <div className="example-box">
                    <strong>Example addresses:</strong>
                    <ul>
                        <li><code>ws://192.168.1.100:6002</code> - Local network</li>
                        <li><code>ws://123.45.67.89:6002</code> - Public IP</li>
                    </ul>
                </div>
            </section>

            {/* Connected Peers */}
            <section className="network-card">
                <h3>👥 Connected Peers ({peers.length})</h3>
                {peers.length === 0 ? (
                    <p className="empty-state">No peers connected yet. Add a peer above!</p>
                ) : (
                    <div className="peers-list">
                        {peers.map((peer, index) => (
                            <div key={index} className="peer-item">
                                <span className="peer-icon">🟢</span>
                                <code className="peer-address">{peer}</code>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* How to Connect */}
            <section className="network-card info-card">
                <h3>ℹ️ How to Connect Multiple Computers</h3>
                <ol className="instructions">
                    <li>
                        <strong>On this computer:</strong> Copy your address above
                    </li>
                    <li>
                        <strong>On another computer:</strong> Install and run the app
                    </li>
                    <li>
                        <strong>In the other app:</strong> Go to Network tab and paste your address
                    </li>
                    <li>
                        <strong>Click Connect:</strong> Both computers are now synchronized!
                    </li>
                </ol>

                <div className="benefits-box">
                    <h4>✨ What happens when connected:</h4>
                    <ul>
                        <li>🔄 Blockchain automatically synchronizes</li>
                        <li>⛏️ Mining rewards shared across network</li>
                        <li>💬 Send messages to any wallet</li>
                        <li>🪙 Trade tokens with anyone</li>
                        <li>📊 Real-time updates on all nodes</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

export default NetworkTab;
