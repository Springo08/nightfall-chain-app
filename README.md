# NightfallChain - Blockchain Messaging Application

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

A decentralized blockchain-based messaging application with built-in cryptocurrency, wallet management, and peer-to-peer networking. Built by **Nightfall Systems Ltd**.

## 🌟 Features

### 🔐 Secure Wallet System
- **BIP39 Mnemonic Generation**: Industry-standard 12-word seed phrases for wallet creation
- **Wallet Recovery**: Restore your wallet from your mnemonic phrase
- **Password Protection**: AES-256 encryption for wallet data with password-based unlock
- **Locked Wallet Address**: Your wallet address is immutable and tied to your BIP39 seed

### 💬 Decentralized Messaging
- **Wallet-to-Wallet Messaging**: Send encrypted messages directly between wallet addresses
- **Message Encryption**: All messages are encrypted with AES-256 before being stored on the blockchain
- **Conversation View**: View message history between any two wallet addresses
- **Message Deletion**: Delete messages from your local blockchain (requires re-mining)
- **Token Cost**: Each message costs 1 token to send

### ⛏️ Proof of Work Mining
- **Automatic Mining**: Mine new blocks to secure the network and earn rewards
- **Dynamic Difficulty**: Mining difficulty automatically adjusts based on network hash rate
- **Mining Controls**: Start/stop mining at will
- **Block Rewards**: Earn tokens for successfully mining blocks
- **Smart Mining**: Only mines when there are pending transactions (no empty blocks)

### 🪙 Token Economy
- **Create Custom Tokens**: Launch your own tokens with custom names and supply
- **Token Transfers**: Send tokens between wallet addresses
- **Portfolio Management**: View all your token holdings in one place
- **Balance Tracking**: Real-time balance updates for all tokens

### 🌐 Peer-to-Peer Network
- **P2P Communication**: Connect directly with other nodes via WebSocket
- **Node Discovery**: Automatic peer discovery service for finding other nodes
- **Blockchain Synchronization**: Automatically sync blockchain data with peers
- **Network Status**: View connected peers and network health
- **Public Node Support**: Expose your node publicly using ngrok

### 🔍 Global Search
- **Search Transactions**: Find transactions by wallet address, token name, or message content
- **Search Blocks**: Locate specific blocks by hash or index
- **Filter Results**: Narrow down search results by type

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Springo08/nightfall-chain-app.git
cd nightfall-chain-app

# Install dependencies
npm install
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

This starts:
1. Backend server (Express + P2P) on port **3001**
2. Frontend dev server (Vite) on port **5173**
3. Electron app with a native window

#### Building for Production

**macOS:**
```bash
npm run build:mac
```
Output: `dist/Blockchain Ecosystem-1.0.0.dmg`

**Windows:**
```bash
npm run build:win
```
Output: `dist/Blockchain Ecosystem Setup 1.0.0.exe`

**All Platforms:**
```bash
npm run build:all
```

## 📁 Project Structure

```
blockchain-ecosystem-app/
├── electron/                    # Electron main process
│   ├── main.js                 # App entry point
│   └── preload.js              # Preload script for IPC
│
├── backend/                     # Backend services (TypeScript)
│   ├── Block.ts                # Block data structure
│   ├── Blockchain.ts           # Core blockchain logic
│   ├── Transaction.ts          # Transaction data structure
│   ├── TokenManager.ts         # Token creation and management
│   ├── WalletService.ts        # BIP39 wallet generation
│   ├── DiscoveryService.ts     # Peer discovery service
│   ├── PersistenceService.ts   # Blockchain data persistence
│   ├── api.ts                  # REST API endpoints
│   ├── p2p.ts                  # P2P networking
│   └── main.ts                 # Backend entry point
│
├── frontend/                    # React frontend (TypeScript)
│   ├── src/
│   │   ├── App.tsx             # Main application component
│   │   ├── components/         # UI components
│   │   │   ├── WalletSetup.tsx        # Wallet creation
│   │   │   ├── WalletRestore.tsx      # Wallet recovery
│   │   │   ├── PasswordSetup.tsx      # Password creation
│   │   │   ├── PasswordUnlock.tsx     # Password unlock
│   │   │   ├── TokenCreation.tsx      # Token creation
│   │   │   ├── TokenPortfolio.tsx     # Token holdings
│   │   │   ├── NetworkTab.tsx         # P2P network view
│   │   │   ├── Menu.tsx               # Navigation menu
│   │   │   ├── LandingPage.tsx        # Landing page
│   │   │   └── Impressum.tsx          # Legal info
│   │   ├── utils/
│   │   │   └── walletEncryption.ts    # Wallet encryption
│   │   └── services/
│   │       └── api.ts                 # API client
│   └── dist/                   # Built frontend files
│
├── package.json                # Main package configuration
├── START.md                    # Quick start guide
├── NGROK_SETUP.md             # Public node setup guide
└── TROUBLESHOOTING.md         # Common issues and fixes
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start app in development mode |
| `npm run build` | Build backend and frontend |
| `npm run build:backend` | Build backend only (TypeScript → JavaScript) |
| `npm run build:frontend` | Build frontend only (React → static files) |
| `npm run build:mac` | Create macOS installer (.dmg) |
| `npm run build:win` | Create Windows installer (.exe) |
| `npm run build:all` | Create installers for all platforms |

## 📖 How It Works

### Blockchain Architecture

NightfallChain uses a **Proof of Work** consensus mechanism similar to Bitcoin:

1. **Transactions** are created when users send messages or tokens
2. Transactions are added to a **pending pool**
3. **Miners** collect pending transactions and attempt to mine a new block
4. Mining involves finding a hash that meets the current **difficulty target**
5. Successfully mined blocks are added to the chain and broadcast to peers
6. **Difficulty adjusts** every 10 blocks based on average block time

### Wallet System

Wallets are generated using the **BIP39** standard:

1. A 12-word **mnemonic phrase** is generated
2. The mnemonic is converted to a **seed**
3. The seed generates an **ECDSA key pair** (secp256k1 curve)
4. The **public key** becomes your wallet address
5. The **private key** is encrypted with your password and stored locally

### Messaging System

Messages are stored on the blockchain:

1. User composes a message and specifies recipient wallet address
2. Message is **encrypted** with AES-256
3. A transaction is created with the encrypted message
4. Transaction costs **1 token** to send
5. Message is mined into a block
6. Recipient can decrypt and read the message

### Token System

Anyone can create custom tokens:

1. Specify token **name** and **initial supply**
2. Token creation transaction is added to the blockchain
3. Creator receives the initial supply
4. Tokens can be transferred between wallets
5. All token balances are tracked on-chain

### P2P Network

Nodes communicate via WebSocket:

1. Each node runs a **WebSocket server** on port 6001
2. Nodes connect to known **peers**
3. **Discovery service** helps find other nodes
4. Blockchain data is **synchronized** between peers
5. New blocks and transactions are **broadcast** to all peers

## 🌐 Running a Public Node

To make your node accessible from the internet, use **ngrok**:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Run the startup script
./start-with-ngrok.sh
```

This will:
- Start the backend server
- Expose HTTP API (port 3001) and P2P (port 6001) via ngrok
- Display public URLs for others to connect

See [NGROK_SETUP.md](NGROK_SETUP.md) for detailed instructions.

## 🔧 Configuration

### Backend Configuration

The backend runs on the following ports:
- **HTTP API**: 3001
- **P2P WebSocket**: 6001

### Frontend Configuration

The frontend dev server runs on:
- **Vite Dev Server**: 5173

### Blockchain Parameters

- **Block Time Target**: 10 seconds
- **Difficulty Adjustment**: Every 10 blocks
- **Mining Reward**: 50 tokens
- **Message Cost**: 1 token

## 🐛 Troubleshooting

### Port Already in Use

If ports 3001 or 5173 are already in use:

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Backend Not Starting

Ensure all dependencies are installed:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Electron Window Stays White

Wait a few seconds for the backend and frontend to start. Open DevTools (Cmd+Option+I on macOS) to check for errors.

### Blockchain Data Corruption

If your blockchain data becomes corrupted:

```bash
rm -rf backend/blockchain-data
```

This will reset your blockchain to genesis.

### Wallet Recovery Issues

If you can't recover your wallet:
1. Ensure you're entering the correct 12-word mnemonic
2. Check that words are spelled correctly
3. Verify the mnemonic is from the BIP39 word list

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.

## 🔒 Security Considerations

- **Wallet Security**: Your mnemonic phrase is the ONLY way to recover your wallet. Store it securely offline.
- **Password Protection**: Choose a strong password for wallet encryption.
- **Private Keys**: Never share your private key or mnemonic with anyone.
- **Network Security**: When running a public node, be aware that your IP address is visible to peers.
- **Message Privacy**: While messages are encrypted, metadata (sender, recipient, timestamp) is public on the blockchain.

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License - see the LICENSE file for details.

## 🏢 About Nightfall Systems

NightfallChain is developed by **Nightfall Systems Ltd**, a company focused on building decentralized applications and blockchain technology.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ by Nightfall Systems Ltd**
