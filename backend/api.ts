import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Blockchain } from './Blockchain';
import { P2PServer } from './p2p';
import { Transaction, TransactionType, CustomToken } from './Transaction';
import { PersistenceService } from './PersistenceService';
import { DiscoveryService } from './DiscoveryService';

const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3001;
const P2P_PORT = process.env.P2P_PORT ? parseInt(process.env.P2P_PORT) : 6001;
const PEERS = process.env.PEERS ? process.env.PEERS.split(',').map(p => p.trim()).filter(p => p) : [];

const blockchain = new Blockchain();
const p2pServer = new P2PServer(blockchain);
const persistenceService = new PersistenceService();
const discoveryService = new DiscoveryService();

// Load blockchain from file on startup
persistenceService.loadBlockchain(blockchain);

// Auto-save every 30 seconds
persistenceService.startAutoSave(blockchain, 30000);

// Start heartbeat for discovery
discoveryService.startHeartbeat();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Blockchain Node Status</title>
      <style>
        :root {
          --primary: #646cff;
          --bg: #1a1a1a;
          --card-bg: #242424;
          --text: rgba(255, 255, 255, 0.87);
          --border: #333;
        }
        body {
          font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
          background-color: var(--bg);
          color: var(--text);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .info-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        .info-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.8rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
        }
        .label { color: #888; }
        .value { font-weight: bold; font-family: monospace; }
        .links {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        a {
          display: block;
          padding: 0.8rem;
          background: var(--primary);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          transition: opacity 0.2s;
        }
        a:hover { opacity: 0.9; }
        a.secondary {
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Node Status</h1>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">HTTP Port</span>
            <span class="value">${HTTP_PORT}</span>
          </div>
          <div class="info-item">
            <span class="label">P2P Port</span>
            <span class="value">${P2P_PORT}</span>
          </div>
          <div class="info-item">
            <span class="label">Peers</span>
            <span class="value">${p2pServer.sockets.length}</span>
          </div>
          <div class="info-item">
            <span class="label">Blocks</span>
            <span class="value">${blockchain.chain.length}</span>
          </div>
        </div>
        <div class="links">
          <a href="/blocks">View Blockchain Data</a>
          <a href="/info" class="secondary">View Node Stats</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.get('/info', (req, res) => {
  res.json({
    circulatingSupply: blockchain.circulatingSupply,
    maxSupply: blockchain.maxSupply,
    difficulty: blockchain.difficulty,
    peers: p2pServer.sockets.length
  });
});

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = blockchain.getBalanceOfAddress(address);
  res.json({ address, balance });
});

app.post('/mine', (req, res) => {
  const { minerAddress } = req.body;
  if (!minerAddress) {
    return res.status(400).json({ error: 'Miner address is required' });
  }

  const mined = blockchain.minePendingTransactions(minerAddress);

  if (!mined) {
    return res.status(400).json({
      error: 'No pending transactions to mine',
      pendingCount: blockchain.pendingTransactions.length
    });
  }

  // Auto-save will handle persistence every 30 seconds
  p2pServer.broadcastChain();
  res.json({ success: true, message: 'Block mined successfully' });
});

app.post('/difficulty', (req, res) => {
  const { difficulty } = req.body;

  if (difficulty === undefined || typeof difficulty !== 'number' || difficulty < 1) {
    return res.status(400).json({ error: 'Valid difficulty (positive number) is required' });
  }

  blockchain.difficulty = difficulty;
  res.json({ success: true, message: `Difficulty updated to ${difficulty}`, difficulty });
});

app.post('/transact', (req, res) => {
  const { from, to, amount, message, tokenId, type } = req.body;

  try {
    // Determine transaction type
    let txType = TransactionType.TRANSFER;
    if (type === 'MESSAGE') {
      txType = TransactionType.MESSAGE;
    }

    const transaction = new Transaction(
      from,
      to,
      Number(amount),
      message || '',
      txType,
      tokenId || 'NATIVE'
    );

    blockchain.createTransaction(transaction);
    p2pServer.broadcast({ type: 'TRANSACTION', transaction });
    res.json({ success: true, message: txType === TransactionType.MESSAGE ? 'Message sent' : 'Transaction created' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create new token
app.post('/tokens/create', (req, res) => {
  const { name, symbol, initialSupply, creator } = req.body;

  if (!name || !symbol || !initialSupply || !creator) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create token data
    const tokenData: CustomToken = {
      id: '', // Will be generated by TokenManager
      name,
      symbol: symbol.toUpperCase(),
      creator,
      initialSupply: Number(initialSupply),
      createdAt: Date.now()
    };

    // Generate token ID
    const token = blockchain.tokenManager.createToken(
      name,
      symbol,
      Number(initialSupply),
      creator
    );

    tokenData.id = token.id;

    // Create token creation transaction
    const transaction = new Transaction(
      null,
      creator,
      Number(initialSupply),
      `Token created: ${name} (${symbol})`,
      TransactionType.TOKEN_CREATE,
      token.id,
      tokenData
    );

    blockchain.createTransaction(transaction);
    p2pServer.broadcast({ type: 'TRANSACTION', transaction });

    res.json({ success: true, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tokens
app.get('/tokens', (req, res) => {
  const tokens = blockchain.getTokenRegistry();
  res.json(tokens);
});

// Get token by ID
app.get('/tokens/:id', (req, res) => {
  const { id } = req.params;
  const token = blockchain.tokenManager.getTokenById(id);

  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }

  res.json(token);
});

// Get balance for specific token
app.get('/balance/:address/:tokenId', (req, res) => {
  const { address, tokenId } = req.params;
  const balance = blockchain.getBalanceOfAddress(address, tokenId);
  const tokenSymbol = blockchain.tokenManager.getTokenSymbol(tokenId);

  res.json({ address, tokenId, balance, symbol: tokenSymbol });
});

// Get all token balances for an address
app.get('/balances/:address', (req, res) => {
  const { address } = req.params;
  const balances = blockchain.getAllTokenBalances(address);

  // Convert Map to array of objects
  const balanceArray = Array.from(balances.entries()).map(([tokenId, balance]) => ({
    tokenId,
    balance,
    symbol: blockchain.tokenManager.getTokenSymbol(tokenId)
  }));

  res.json({ address, balances: balanceArray });
});

app.get('/peers', (req, res) => {
  res.json(p2pServer.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

app.post('/peers', (req, res) => {
  const { peer } = req.body;
  p2pServer.connectToPeers([peer]);
  res.json({ message: 'Connected to peer' });
});

// Node Discovery Endpoints
app.get('/nodes', (req, res) => {
  const nodes = discoveryService.getActiveNodes();
  res.json({
    nodes,
    count: nodes.length,
    thisNode: discoveryService.getNodeId()
  });
});

app.post('/nodes/register', (req, res) => {
  const { httpUrl, p2pUrl } = req.body;

  if (!httpUrl || !p2pUrl) {
    return res.status(400).json({ error: 'httpUrl and p2pUrl required' });
  }

  discoveryService.registerNode(httpUrl, p2pUrl);
  res.json({
    success: true,
    nodeId: discoveryService.getNodeId(),
    message: 'Node registered successfully'
  });
});

app.get('/nodes/discover', async (req, res) => {
  const activeNodes = discoveryService.getActiveNodes();

  // Auto-connect to discovered peers
  let connected = 0;
  for (const node of activeNodes) {
    try {
      p2pServer.connectToPeers([node.p2pUrl]);
      connected++;
    } catch (error) {
      console.error(`Failed to connect to ${node.p2pUrl}:`, error);
    }
  }

  res.json({
    discovered: activeNodes.length,
    connected,
    nodes: activeNodes
  });
});

app.get('/connection-info', (req, res) => {
  res.json({
    httpPort: HTTP_PORT,
    p2pPort: P2P_PORT,
    peers: p2pServer.sockets.length,
    message: `Connect to this node using: ws://YOUR_IP:${P2P_PORT}`
  });
});

app.listen(HTTP_PORT, () => console.log(`Listening on port: ${HTTP_PORT}`));
p2pServer.listen(P2P_PORT);

// Auto-connect to peers if specified in environment
if (PEERS.length > 0) {
  console.log(`Connecting to ${PEERS.length} peer(s): ${PEERS.join(', ')}`);
  p2pServer.connectToPeers(PEERS);
}

// Auto-register with discovery if public URLs are provided
const PUBLIC_HTTP_URL = process.env.PUBLIC_HTTP_URL;
const PUBLIC_P2P_URL = process.env.PUBLIC_P2P_URL;

if (PUBLIC_HTTP_URL && PUBLIC_P2P_URL) {
  setTimeout(() => {
    console.log('📡 Registering node with discovery service...');
    discoveryService.registerNode(PUBLIC_HTTP_URL, PUBLIC_P2P_URL);

    // Auto-discover and connect to peers
    const activeNodes = discoveryService.getActiveNodes();
    if (activeNodes.length > 0) {
      console.log(`🔍 Found ${activeNodes.length} active nodes, connecting...`);
      const p2pUrls = activeNodes.map(n => n.p2pUrl);
      p2pServer.connectToPeers(p2pUrls);
    }
  }, 2000); // Wait 2 seconds for server to be ready
}
