import WebSocket from 'ws';
import { Blockchain } from './Blockchain';
import { Block } from './Block';

const MESSAGE_TYPE = {
    CHAIN: 'CHAIN',
    TRANSACTION: 'TRANSACTION'
};

export class P2PServer {
    public sockets: WebSocket[];
    public blockchain: Blockchain;

    constructor(blockchain: Blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen(port: number): void {
        const server = new WebSocket.Server({ port });
        server.on('connection', (socket: WebSocket) => this.connectSocket(socket));
        console.log(`Listening for peer-to-peer connections on: ${port}`);
    }

    connectToPeers(peers: string[]): void {
        peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket: WebSocket): void {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    messageHandler(socket: WebSocket): void {
        socket.on('message', (message: string) => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPE.CHAIN:
                    this.handleChainSync(data.chain);
                    break;
                case MESSAGE_TYPE.TRANSACTION:
                    // Handle transaction sync (not implemented in this basic version but good to have structure)
                    break;
            }
        });
    }

    sendChain(socket: WebSocket): void {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.CHAIN,
            chain: this.blockchain.chain
        }));
    }

    syncChains(): void {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    broadcast(data: any): void {
        this.sockets.forEach(socket => socket.send(JSON.stringify(data)));
    }

    broadcastChain(): void {
        this.broadcast({
            type: MESSAGE_TYPE.CHAIN,
            chain: this.blockchain.chain
        });
    }

    handleChainSync(newChain: Block[]): void {
        if (newChain.length <= this.blockchain.chain.length) {
            console.log('Received chain is not longer than current chain. Do nothing.');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('Received chain is not valid.');
            return;
        }

        console.log('Replacing current chain with received chain.');
        this.blockchain.chain = newChain;
        this.blockchain.circulatingSupply = this.calculateCirculatingSupply(newChain);
    }

    isValidChain(chain: Block[]): boolean {
        // Basic validation: Genesis block must match, and hashes must link
        if (JSON.stringify(chain[0]) !== JSON.stringify(this.blockchain.createGenesisBlock())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];

            // Re-calculate hash to verify integrity (simplified for sync, ideally should use full validation)
            // Note: In a real app, we'd need to reconstruct the Block object to call calculateHash
            // For now, we assume the structure is correct and just check links
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    calculateCirculatingSupply(chain: Block[]): number {
        let supply = 0;
        for (const block of chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === null) {
                    supply += tx.amount;
                }
            }
        }
        return supply;
    }
}
