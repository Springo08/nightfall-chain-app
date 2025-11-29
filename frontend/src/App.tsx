import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Impressum from './components/Impressum';
import Menu from './components/Menu';
import WalletSetup from './components/WalletSetup';
import WalletRestore from './components/WalletRestore';
import TokenCreation from './components/TokenCreation';
import TokenPortfolio from './components/TokenPortfolio';
import NetworkTab from './components/NetworkTab';
import PasswordUnlock from './components/PasswordUnlock';
import PasswordSetup from './components/PasswordSetup';
import { encryptWalletData, decryptWalletData } from './utils/walletEncryption';
import type { WalletData, EncryptedWallet } from './utils/walletEncryption';

interface Block {
  timestamp: number;
  transactions: any[];
  previousHash: string;
  hash: string;
  difficulty?: number;
  nonce: number;
}

interface Transaction {
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  message: string;
  timestamp?: number;
  type?: string;
}

interface ChainInfo {
  circulatingSupply: number;
  maxSupply: number;
  difficulty: number;
  peers: number;
}

type TabType = 'wallet' | 'tokens' | 'create-token' | 'network' | 'messages' | 'transactions' | 'blockchain';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [info, setInfo] = useState<ChainInfo | null>(null);
  const [minerAddress, setMinerAddress] = useState('');
  const [message, setMessage] = useState('');
  const [txRecipient, setTxRecipient] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMessage, setTxMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [showWalletRestore, setShowWalletRestore] = useState(false);
  const [selectedToken, setSelectedToken] = useState('NATIVE');
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<any[]>([]);
  const [balanceError, setBalanceError] = useState('');
  const [conversations, setConversations] = useState<string[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatAddress, setNewChatAddress] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRead, setLastRead] = useState<Record<string, number>>({});
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupParticipants, setGroupParticipants] = useState('');
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [groupParticipantsMap, setGroupParticipantsMap] = useState<Record<string, string[]>>({});
  const [deletedConversations, setDeletedConversations] = useState<string[]>([]);


  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  const fetchBlocks = async () => {
    try {
      const res = await fetch(`${API_URL}/blocks`);
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/info`);
      const data = await res.json();
      setInfo(data);
    } catch (error) {
      console.error('Error fetching info:', error);
    }
  };

  const fetchBalance = async (address: string) => {
    if (!address) {
      setBalance(0);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/balance/${address}`);
      const data = await res.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet);

        // Check if wallet is encrypted
        if (wallet.encrypted) {
          // Wallet is encrypted, show unlock screen
          setIsLocked(true);
        } else {
          // Old unencrypted wallet, prompt to set password
          setMinerAddress(wallet.address);
          setShowPasswordSetup(true);
          setIsLocked(false);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
        setShowWalletSetup(true);
        setIsLocked(false);
      }
    } else {
      setShowWalletSetup(true);
      setIsLocked(false);
    }

    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      try {
        setConversations(JSON.parse(savedConversations));
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }

    // Load lastRead from localStorage
    const savedLastRead = localStorage.getItem('lastRead');
    if (savedLastRead) {
      try {
        setLastRead(JSON.parse(savedLastRead));
      } catch (error) {
        console.error('Error loading lastRead:', error);
      }
    }

    // Load groupNames from localStorage
    const savedGroupNames = localStorage.getItem('groupNames');
    if (savedGroupNames) {
      try {
        setGroupNames(JSON.parse(savedGroupNames));
      } catch (error) {
        console.error('Error loading groupNames:', error);
      }
    }

    // Load groupParticipantsMap from localStorage
    const savedGroupParticipants = localStorage.getItem('groupParticipants');
    if (savedGroupParticipants) {
      try {
        setGroupParticipantsMap(JSON.parse(savedGroupParticipants));
      } catch (error) {
        console.error('Error loading groupParticipants:', error);
      }
    }

    // Load deletedConversations from localStorage
    const savedDeletedConversations = localStorage.getItem('deletedConversations');
    if (savedDeletedConversations) {
      try {
        setDeletedConversations(JSON.parse(savedDeletedConversations));
      } catch (error) {
        console.error('Error loading deletedConversations:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
    fetchInfo();
    const interval = setInterval(() => {
      fetchBlocks();
      fetchInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const allTransactions = useMemo(() => {
    if (!minerAddress) return [];
    const txs = blocks.flatMap(block => block.transactions).filter(tx =>
      tx.fromAddress === minerAddress ||
      tx.toAddress === minerAddress ||
      tx.toAddress.startsWith('GROUP_')
    );
    return txs.reverse();
  }, [blocks, minerAddress]);

  // Discover groups
  useEffect(() => {
    if (!minerAddress) return;

    let newConversations = [...conversations];
    let newGroupNames = { ...groupNames };
    let newGroupParticipants = { ...groupParticipantsMap };
    let changed = false;

    allTransactions.forEach(tx => {
      if (tx.toAddress.startsWith('GROUP_') && tx.message && tx.message.includes('GROUP_INIT')) {
        try {
          const data = JSON.parse(tx.message);
          if (data.type === 'GROUP_INIT' && data.participants && data.participants.includes(minerAddress)) {
            const groupId = tx.toAddress;

            if (!newConversations.includes(groupId) && !deletedConversations.includes(groupId)) {
              newConversations.unshift(groupId);
              changed = true;
            }

            if (!newGroupNames[groupId]) {
              newGroupNames[groupId] = data.name;
              changed = true;
            }

            if (!newGroupParticipants[groupId]) {
              newGroupParticipants[groupId] = data.participants;
              changed = true;
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    });

    if (changed) {
      setConversations(newConversations);
      setGroupNames(newGroupNames);
      setGroupParticipantsMap(newGroupParticipants);
      localStorage.setItem('conversations', JSON.stringify(newConversations));
      localStorage.setItem('groupNames', JSON.stringify(newGroupNames));
      localStorage.setItem('groupParticipants', JSON.stringify(newGroupParticipants));
    }
  }, [allTransactions, minerAddress, deletedConversations]);

  useEffect(() => {
    fetchBalance(minerAddress);
    fetchTokens();
    fetchTokenBalance(minerAddress, selectedToken);
  }, [minerAddress, blocks, selectedToken]);

  useEffect(() => {
    let miningInterval: any;
    if (isMining) {
      miningInterval = setInterval(() => {
        mine();
      }, 1000);
    }
    return () => clearInterval(miningInterval);
  }, [isMining, minerAddress]);

  const mine = async () => {
    if (!minerAddress) return alert('Please enter a miner address');
    setStatus('Mining...');
    try {
      const response = await fetch(`${API_URL}/mine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minerAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || 'Mining failed');
        return;
      }

      setStatus('Block mined successfully!');
      fetchBlocks();
      fetchInfo();
    } catch (error) {
      setStatus('Mining failed');
    }
  };

  const sendMessage = async () => {
    if (!minerAddress || !selectedConversation) return alert('Please select a conversation first');

    // Calculate token cost: 1 for direct messages, (number of other members) for groups
    let tokenCost = 1;
    if (selectedConversation.startsWith('GROUP_')) {
      const participants = groupParticipantsMap[selectedConversation] || [];
      // Cost is number of OTHER members (exclude self)
      tokenCost = Math.max(1, participants.length - 1);
    }

    try {
      await fetch(`${API_URL}/transact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: minerAddress,
          to: selectedConversation,
          amount: tokenCost,
          message,
          type: 'MESSAGE'
        }),
      });
      setStatus('Message sent!');
      setMessage('');

      // Add to conversations if not already there
      if (!conversations.includes(selectedConversation)) {
        const updatedConversations = [...conversations, selectedConversation];
        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      }

      // Set as selected conversation
      setSelectedConversation(selectedConversation);
      setShowNewChat(false);
    } catch (error) {
      setStatus('Message failed');
    }
  };

  const startNewChat = () => {
    if (newChatAddress && !conversations.includes(newChatAddress)) {
      const updatedConversations = [newChatAddress, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      setSelectedConversation(newChatAddress);
      setShowNewChat(false);
      setNewChatAddress('');
    } else if (newChatAddress) {
      setSelectedConversation(newChatAddress);
      setShowNewChat(false);
      setNewChatAddress('');
    }
  };

  const deleteConversation = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      const updatedConversations = conversations.filter(c => c !== address);
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));

      const updatedDeleted = [...deletedConversations, address];
      setDeletedConversations(updatedDeleted);
      localStorage.setItem('deletedConversations', JSON.stringify(updatedDeleted));

      if (selectedConversation === address) {
        setSelectedConversation(null);
      }
    }
  };

  const createGroup = async () => {
    if (!groupName || !groupParticipants) return alert('Please fill all fields');

    const participants = groupParticipants.split(',').map(p => p.trim()).filter(p => p);
    if (participants.length === 0) return alert('Please add at least one participant');

    const groupId = `GROUP_${Date.now()}`;
    const allParticipants = [minerAddress, ...participants];

    // Create group init message
    const groupInitData = {
      type: 'GROUP_INIT',
      name: groupName,
      participants: allParticipants
    };

    try {
      await fetch(`${API_URL}/transact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: minerAddress,
          to: groupId,
          amount: 1,
          message: JSON.stringify(groupInitData),
          type: 'MESSAGE'
        }),
      });

      // Update local state
      const updatedConversations = [groupId, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));

      const newGroupNames = { ...groupNames, [groupId]: groupName };
      setGroupNames(newGroupNames);
      localStorage.setItem('groupNames', JSON.stringify(newGroupNames));

      const newGroupParticipants = { ...groupParticipantsMap, [groupId]: allParticipants };
      setGroupParticipantsMap(newGroupParticipants);
      localStorage.setItem('groupParticipants', JSON.stringify(newGroupParticipants));

      setSelectedConversation(groupId);
      setShowNewGroup(false);
      setGroupName('');
      setGroupParticipants('');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const updateLastRead = (address: string) => {
    const newLastRead = { ...lastRead, [address]: Date.now() };
    setLastRead(newLastRead);
    localStorage.setItem('lastRead', JSON.stringify(newLastRead));
  };

  const getUnreadCount = (address: string) => {
    const lastReadTime = lastRead[address] || 0;
    const messages = allTransactions.filter(tx =>
      tx.type === 'MESSAGE' &&
      (tx.fromAddress === address || tx.toAddress === address) &&
      tx.timestamp && tx.timestamp > lastReadTime &&
      tx.fromAddress !== minerAddress // Only count incoming messages
    );
    return messages.length;
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch(`${API_URL}/tokens`);
      const data = await res.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchTokenBalance = async (address: string, tokenId: string) => {
    if (!address || !tokenId) return;
    try {
      const res = await fetch(`${API_URL}/balance/${address}/${tokenId}`);
      const data = await res.json();
      setTokenBalance(data.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setTokenBalance(0);
    }
  };

  const sendTransaction = async () => {
    if (!minerAddress || !txRecipient || !txAmount) {
      return alert('Please fill all fields');
    }

    setBalanceError('');

    // Check balance before sending
    const currentBalance = selectedToken === 'NATIVE' ? balance : tokenBalance;
    const amount = Number(txAmount);

    if (currentBalance < amount) {
      const tokenSymbol = selectedToken === 'NATIVE' ? 'NATIVE' :
        tokens.find(t => t.id === selectedToken)?.symbol || 'tokens';
      setBalanceError(`Insufficient balance! You have ${currentBalance} ${tokenSymbol}, but need ${amount} ${tokenSymbol}`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: minerAddress,
          to: txRecipient,
          amount: amount,
          message: txMessage,
          tokenId: selectedToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      setStatus('Transaction sent!');
      setTxAmount('');
      setTxMessage('');
      setBalanceError('');
      fetchTokenBalance(minerAddress, selectedToken);
    } catch (error: any) {
      setStatus('Transaction failed');
      setBalanceError(error.message);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!minerAddress || !selectedConversation) return [];
    const msgs: Transaction[] = [];
    blocks.forEach((block) => {
      block.transactions.forEach((tx: any) => {
        if (tx.message) {
          // For group chats: show all messages sent to the group
          if (selectedConversation.startsWith('GROUP_')) {
            if (tx.toAddress === selectedConversation) {
              msgs.push(tx);
            }
          } else {
            // For direct messages: show messages between the two addresses
            if ((tx.fromAddress === minerAddress && tx.toAddress === selectedConversation) ||
              (tx.fromAddress === selectedConversation && tx.toAddress === minerAddress)) {
              msgs.push(tx);
            }
          }
        }
      });
    });
    return msgs;
  }, [blocks, minerAddress, selectedConversation]);

  const getLastMessage = (address: string) => {
    const msgs: Transaction[] = [];
    blocks.forEach((block) => {
      block.transactions.forEach((tx: any) => {
        if (tx.message &&
          ((tx.fromAddress === minerAddress && tx.toAddress === address) ||
            (tx.fromAddress === address && tx.toAddress === minerAddress))) {
          msgs.push(tx);
        }
      });
    });
    return msgs.length > 0 ? msgs[msgs.length - 1].message : 'No messages yet';
  };



  const handleWalletSetupComplete = (mnemonic: string, address: string) => {
    // Store wallet temporarily and show password setup
    const wallet: WalletData = {
      mnemonic,
      address,
      createdAt: Date.now()
    };
    localStorage.setItem('temp_wallet', JSON.stringify(wallet));
    setMinerAddress(address);
    setShowWalletSetup(false);
    setShowPasswordSetup(true);
  };

  const handleWalletRestore = (mnemonic: string, address: string) => {
    // Store wallet temporarily and show password setup
    const wallet: WalletData = {
      mnemonic,
      address,
      createdAt: Date.now()
    };
    localStorage.setItem('temp_wallet', JSON.stringify(wallet));
    setMinerAddress(address);
    setShowWalletRestore(false);
    setShowPasswordSetup(true);
  };

  const unlockWallet = (password: string) => {
    try {
      const savedWallet = localStorage.getItem('wallet');
      if (!savedWallet) {
        setUnlockError('Kein Wallet gefunden');
        return;
      }

      const encryptedWallet: EncryptedWallet = JSON.parse(savedWallet);
      const wallet = decryptWalletData(encryptedWallet, password);

      setMinerAddress(wallet.address);
      setIsLocked(false);
      setUnlockError('');
    } catch (error) {
      setUnlockError('Falsches Passwort');
    }
  };

  const handlePasswordSetup = (password: string) => {
    try {
      const tempWallet = localStorage.getItem('temp_wallet');
      if (!tempWallet) {
        // Fallback to old unencrypted wallet
        const savedWallet = localStorage.getItem('wallet');
        if (!savedWallet) return;
        const wallet: WalletData = JSON.parse(savedWallet);
        const encryptedWallet = encryptWalletData(wallet, password);
        localStorage.setItem('wallet', JSON.stringify(encryptedWallet));
      } else {
        // Use temporary wallet
        const wallet: WalletData = JSON.parse(tempWallet);
        const encryptedWallet = encryptWalletData(wallet, password);
        localStorage.setItem('wallet', JSON.stringify(encryptedWallet));
        localStorage.removeItem('temp_wallet');
      }

      setShowPasswordSetup(false);
      setIsLocked(false);
    } catch (error) {
      console.error('Error setting up password:', error);
    }
  };

  const handleRestoreFromUnlock = () => {
    setIsLocked(false);
    setShowWalletRestore(true);
  };

  return (
    <>
      {isLocked && (
        <PasswordUnlock
          onUnlock={unlockWallet}
          onRestore={handleRestoreFromUnlock}
          error={unlockError}
        />
      )}

      {showPasswordSetup && !isLocked && (
        <PasswordSetup
          onPasswordSet={handlePasswordSetup}
          title="Passwort festlegen"
          description="Schütze dein bestehendes Wallet mit einem Passwort"
        />
      )}

      {showWalletSetup && !isLocked && (
        <WalletSetup onComplete={handleWalletSetupComplete} />
      )}

      {showWalletRestore && !isLocked && (
        <WalletRestore
          onRestore={handleWalletRestore}
          onCancel={() => setShowWalletRestore(false)}
        />
      )}

      <div className="container">
        <header>
          <h1>Decentralized Miner</h1>
          {info && (
            <div className="stats">
              <div className="stat-card">
                <h3>Supply</h3>
                <p>{info.circulatingSupply} / {info.maxSupply}</p>
              </div>
              <div className="stat-card">
                <h3>Difficulty</h3>
                <p>{info.difficulty}</p>
              </div>
              <div className="stat-card">
                <h3>Online Miners (Peers)</h3>
                <p>{info.peers}</p>
              </div>
            </div>
          )}
        </header>

        <main>
          {/* Tab Navigation */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallet')}
            >
              💼 My Wallet
            </button>
            <button
              className={`tab ${activeTab === 'tokens' ? 'active' : ''}`}
              onClick={() => setActiveTab('tokens')}
            >
              🪙 My Tokens
            </button>
            <button
              className={`tab ${activeTab === 'create-token' ? 'active' : ''}`}
              onClick={() => setActiveTab('create-token')}
            >
              ✨ Create Token
            </button>
            <button
              className={`tab ${activeTab === 'network' ? 'active' : ''}`}
              onClick={() => setActiveTab('network')}
            >
              🌐 Network
            </button>
            <button
              className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              💬 Messages
            </button>
            <button
              className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              💸 Transactions
            </button>
            <button
              className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`}
              onClick={() => setActiveTab('blockchain')}
            >
              ⛓️ Blockchain
            </button>
          </div>

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="tab-content">
              <section className="card">
                <h2>My Wallet</h2>
                <div className="wallet-info">
                  <div className="form-group">
                    <label>Your Wallet Address</label>
                    <div className="wallet-address-display">
                      {minerAddress}
                    </div>
                    {minerAddress && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                        💰 Balance: <strong style={{ color: '#42d392' }}>{balance} Tokens</strong>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowWalletRestore(true)}
                    className="btn-restore-wallet"
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(100, 126, 255, 0.2)', border: '1px solid rgba(100, 126, 255, 0.3)', borderRadius: '8px', color: '#647eff', cursor: 'pointer' }}
                  >
                    🔑 Wallet wiederherstellen
                  </button>
                </div>

                <h3 style={{ marginTop: '2rem' }}>Mining Controls</h3>
                <div className="actions">
                  <button onClick={mine} className="btn-primary" disabled={isMining}>
                    ⛏️ Mine Once
                  </button>
                  <button
                    onClick={() => setIsMining(!isMining)}
                    className={`btn-toggle ${isMining ? 'active' : ''}`}
                  >
                    {isMining ? '🛑 Stop Auto-Mining' : '🚀 Start Auto-Mining'}
                  </button>
                </div>

                {status && <p className="status">{status}</p>}

                <h3 style={{ marginTop: '2rem' }}>Recent Activity</h3>
                <div className="transaction-list">
                  {allTransactions.length === 0 ? (
                    <p className="no-messages">No transactions yet.</p>
                  ) : (
                    allTransactions.slice(0, 10).map((tx, i) => (
                      <div key={i} className="transaction-item">
                        <div className="tx-header">
                          <span className={tx.fromAddress === minerAddress ? 'tx-sent' : 'tx-received'}>
                            {tx.fromAddress === minerAddress ? '📤 Sent' : '📥 Received'}
                          </span>
                          <span className="tx-amount">{tx.amount} Tokens</span>
                        </div>
                        <div className="tx-details">
                          <span>From: {tx.fromAddress || 'System'}</span>
                          <span>To: {tx.toAddress}</span>
                        </div>
                        {tx.message && <p className="tx-message">💬 {tx.message}</p>}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="tab-content">
              <div className="messages-container">
                {/* Conversations Sidebar */}
                <div className="conversations-sidebar">
                  <div className="sidebar-header">
                    <h2>💬 Chats</h2>
                    <button
                      className="new-chat-button"
                      onClick={() => setShowNewChat(true)}
                      title="Neuer Chat"
                    >
                      ✏️
                    </button>
                    <button
                      className="new-chat-button"
                      onClick={() => setShowNewGroup(true)}
                      title="Neue Gruppe"
                      style={{ marginLeft: '0.5rem', background: '#647eff' }}
                    >
                      👥
                    </button>
                  </div>

                  <div className="search-bar" style={{ padding: '0 1rem 1rem' }}>
                    <input
                      type="text"
                      placeholder="🔍 Suche..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #333',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white'
                      }}
                    />
                  </div>

                  <div className="conversations-list">
                    {conversations.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <p className="no-conversations">Keine Chats gefunden.</p>
                    ) : (
                      conversations
                        .filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((address, i) => {
                          const unreadCount = getUnreadCount(address);
                          return (
                            <div
                              key={i}
                              className={`conversation-item ${selectedConversation === address ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedConversation(address);
                                updateLastRead(address);
                                setShowNewChat(false);
                              }}
                            >
                              <div className="conversation-header">
                                <span className="conversation-address">
                                  {groupNames[address] ? `👥 ${groupNames[address]}` : `${address.substring(0, 8)}...${address.substring(address.length - 6)}`}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {unreadCount > 0 && (
                                    <span className="unread-badge" style={{
                                      background: '#42d392',
                                      color: '#000',
                                      borderRadius: '50%',
                                      padding: '0.1rem 0.4rem',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}>
                                      {unreadCount}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => deleteConversation(address, e)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '0.8rem' }}
                                    title="Chat löschen"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              <p className="conversation-preview">{getLastMessage(address)}</p>
                            </div>
                          )
                        })
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                  {showNewChat ? (
                    <div className="new-chat-dialog">
                      <h2>Neuer Chat</h2>
                      <div className="form-group">
                        <label>Wallet-Adresse des Empfängers</label>
                        <input
                          type="text"
                          value={newChatAddress}
                          onChange={(e) => setNewChatAddress(e.target.value)}
                          placeholder="Wallet-Adresse eingeben..."
                          autoFocus
                        />
                      </div>
                      <div className="dialog-actions">
                        <button onClick={() => setShowNewChat(false)} className="btn-cancel">
                          Abbrechen
                        </button>
                        <button onClick={startNewChat} className="btn-primary">
                          Chat starten
                        </button>
                      </div>
                    </div>
                  ) : showNewGroup ? (
                    <div className="new-chat-dialog">
                      <h2>Neue Gruppe erstellen</h2>
                      <div className="form-group">
                        <label>Gruppenname</label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          placeholder="z.B. Projekt Alpha"
                          autoFocus
                        />
                      </div>
                      <div className="form-group">
                        <label>Teilnehmer (Wallet-Adressen, komma-getrennt)</label>
                        <textarea
                          value={groupParticipants}
                          onChange={(e) => setGroupParticipants(e.target.value)}
                          placeholder="Adresse1, Adresse2..."
                          style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #333', color: 'white' }}
                        />
                      </div>
                      <div className="dialog-actions">
                        <button onClick={() => setShowNewGroup(false)} className="btn-cancel">
                          Abbrechen
                        </button>
                        <button onClick={createGroup} className="btn-primary">
                          Gruppe erstellen
                        </button>
                      </div>
                    </div>
                  ) : !selectedConversation ? (
                    <div className="no-chat-selected">
                      <div className="empty-state">
                        <span className="empty-icon">💬</span>
                        <h3>Wähle einen Chat aus</h3>
                        <p>Wähle eine Konversation aus der Liste oder starte einen neuen Chat</p>
                        <button
                          className="btn-primary"
                          onClick={() => setShowNewChat(true)}
                        >
                          ✏️ Neuer Chat
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="chat-header">
                        <div className="chat-header-info">
                          <h3>{groupNames[selectedConversation] ? `👥 ${groupNames[selectedConversation]}` : `${selectedConversation.substring(0, 10)}...${selectedConversation.substring(selectedConversation.length - 8)}`}</h3>
                          <p className="chat-header-address">{selectedConversation}</p>
                        </div>
                      </div>

                      <div className="chat-messages">
                        {filteredMessages.length === 0 ? (
                          <p className="no-messages">Noch keine Nachrichten. Schreibe die erste Nachricht!</p>
                        ) : (
                          filteredMessages.map((msg, i) => (
                            <div key={i} className={`chat-bubble ${msg.fromAddress === minerAddress ? 'sent' : 'received'}`}>
                              <p className="chat-text">{msg.message}</p>
                              <div className="chat-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                                <span className="chat-time" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                <span className="chat-amount" style={{ fontSize: '0.7rem', opacity: 0.7 }}>{msg.amount} Token</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="chat-input-container">
                        <input
                          type="text"
                          className="chat-input"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Nachricht schreiben..."
                        />
                        {selectedConversation.startsWith('GROUP_') && (
                          <span style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '1rem',
                            fontSize: '0.7rem',
                            color: '#888',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            💰 {Math.max(1, (groupParticipantsMap[selectedConversation]?.length || 1) - 1)} Token
                          </span>
                        )}
                        <button onClick={sendMessage} className="btn-send">
                          📤
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="tab-content">
              <TokenPortfolio walletAddress={minerAddress} />
            </div>
          )}

          {/* Create Token Tab */}
          {activeTab === 'create-token' && (
            <div className="tab-content">
              <TokenCreation
                walletAddress={minerAddress}
                onTokenCreated={() => {
                  fetchTokens();
                  setActiveTab('tokens');
                }}
              />
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="tab-content">
              <NetworkTab apiUrl={API_URL} />
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="tab-content">
              <div className="grid-container">
                <section className="card">
                  <h2>Send Tokens</h2>
                  <div className="form-group">
                    <label>Your Address</label>
                    <input
                      type="text"
                      value={minerAddress}
                      readOnly
                      placeholder="Your wallet address"
                      style={{ cursor: 'not-allowed', opacity: 0.7 }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Token</label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'inherit',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="NATIVE">Native Token</option>
                      {tokens.map(token => (
                        <option key={token.id} value={token.id}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                    {minerAddress && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                        💰 Available: <strong style={{ color: '#42d392' }}>
                          {selectedToken === 'NATIVE' ? balance : tokenBalance} {selectedToken === 'NATIVE' ? 'NATIVE' : tokens.find(t => t.id === selectedToken)?.symbol || ''}
                        </strong>
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      value={txRecipient}
                      onChange={(e) => setTxRecipient(e.target.value)}
                      placeholder="Recipient Address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      placeholder="Amount of tokens"
                    />
                  </div>
                  <div className="form-group">
                    <label>Message (Optional)</label>
                    <input
                      type="text"
                      value={txMessage}
                      onChange={(e) => setTxMessage(e.target.value)}
                      placeholder="Optional message..."
                    />
                  </div>
                  <button onClick={sendTransaction} className="btn-secondary">
                    Send Transaction
                  </button>
                  {balanceError && (
                    <p className="status" style={{ color: '#ff3b30', marginTop: '1rem' }}>
                      ⚠️ {balanceError}
                    </p>
                  )}
                  {status && <p className="status">{status}</p>}
                </section>

                <section className="card">
                  <h2>Transaction History</h2>
                  <div className="transaction-list">
                    {allTransactions.length === 0 ? (
                      <p className="no-messages">No transactions yet.</p>
                    ) : (
                      allTransactions.map((tx, i) => (
                        <div key={i} className="transaction-item">
                          <div className="tx-header">
                            <span className={tx.fromAddress === minerAddress ? 'tx-sent' : 'tx-received'}>
                              {tx.fromAddress === minerAddress ? '📤 Sent' : '📥 Received'}
                            </span>
                            <span className="tx-amount">{tx.amount} Tokens</span>
                          </div>
                          <div className="tx-details">
                            <span>From: {tx.fromAddress || 'System'}</span>
                            <span>To: {tx.toAddress}</span>
                          </div>
                          {tx.message && <p className="tx-message">💬 {tx.message}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Blockchain Tab */}
          {activeTab === 'blockchain' && (
            <div className="tab-content">
              <section className="card">
                <h2>Blockchain Explorer</h2>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="🔍 Search messages, addresses, hashes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid #444',
                      borderRadius: '12px',
                      color: 'white',
                      marginBottom: '1rem'
                    }}
                  />
                </div>

                {searchQuery && (
                  <div className="search-results" style={{ marginBottom: '2rem' }}>
                    <h3>Search Results</h3>
                    {blocks.flatMap(block =>
                      block.transactions.map(tx => ({ ...tx, blockHash: block.hash, blockTimestamp: block.timestamp }))
                    ).filter(tx => {
                      const query = searchQuery.toLowerCase();
                      return (
                        (tx.message && tx.message.toLowerCase().includes(query)) ||
                        (tx.fromAddress && tx.fromAddress.toLowerCase().includes(query)) ||
                        (tx.toAddress && tx.toAddress.toLowerCase().includes(query)) ||
                        (tx.blockHash && tx.blockHash.toLowerCase().includes(query))
                      );
                    }).map((tx, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        borderLeft: '3px solid #42d392'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#888', fontSize: '0.8rem' }}>
                            {new Date(tx.timestamp || tx.blockTimestamp).toLocaleString()}
                          </span>
                          <span style={{ color: '#42d392', fontSize: '0.8rem' }}>
                            {tx.type || 'TRANSACTION'}
                          </span>
                        </div>
                        {tx.message && (
                          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            "{tx.message}"
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: '#aaa', fontFamily: 'monospace' }}>
                          From: {tx.fromAddress?.substring(0, 10)}...<br />
                          To: {tx.toAddress?.substring(0, 10)}...
                        </div>
                      </div>
                    ))}
                    {blocks.flatMap(block => block.transactions).filter(tx => {
                      const query = searchQuery.toLowerCase();
                      return (
                        (tx.message && tx.message.toLowerCase().includes(query)) ||
                        (tx.fromAddress && tx.fromAddress.toLowerCase().includes(query)) ||
                        (tx.toAddress && tx.toAddress.toLowerCase().includes(query))
                      );
                    }).length === 0 && (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No matches found</p>
                      )}
                  </div>
                )}
              </section>

              <section className="card">
                <h2>Blockchain Settings</h2>
                <div className="form-group">
                  <label>
                    Mining Difficulty: {info?.difficulty || 2}
                    <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '10px' }}>
                      (Auto-adjusted every 5 blocks)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={info?.difficulty || 2}
                    disabled={true}
                    style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    The network automatically adjusts difficulty to maintain a ~10s block time.
                  </p>
                </div>
              </section>

              <section className="card">
                <h2>Blockchain Data</h2>
                <div className="chain-container">
                  {blocks.map((block, index) => (
                    <div key={block.hash} className="block">
                      <div className="block-header">
                        <span className="block-index">#{index}</span>
                        <span className="block-timestamp">{new Date(block.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="block-body">
                        <p><strong>Hash:</strong> <span className="hash">{block.hash.substring(0, 10)}...</span></p>
                        <p><strong>Prev:</strong> <span className="hash">{block.previousHash.substring(0, 10)}...</span></p>
                        <p><strong>Txns:</strong> {block.transactions.length}</p>
                        <p><strong>Difficulty:</strong> {block.difficulty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main >
      </div >
    </>
  );
}

function App() {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/impressum" element={<Impressum />} />
      </Routes>
    </Router>
  );
}

export default App;

