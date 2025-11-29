import * as fs from 'fs';
import * as path from 'path';

export interface NodeInfo {
    id: string;
    httpUrl: string;
    p2pUrl: string;
    lastSeen: number;
    version: string;
}

export class DiscoveryService {
    private nodesFile: string;
    private nodes: Map<string, NodeInfo>;
    private nodeId: string;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(dataPath: string = './blockchain-data') {
        this.nodesFile = path.join(dataPath, 'nodes.json');
        this.nodes = new Map();
        this.nodeId = this.generateNodeId();

        // Create data directory if needed
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }

        this.loadNodes();
        this.startCleanup();
    }

    private generateNodeId(): string {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load nodes from file
     */
    private loadNodes(): void {
        try {
            if (fs.existsSync(this.nodesFile)) {
                const data = JSON.parse(fs.readFileSync(this.nodesFile, 'utf-8'));
                this.nodes = new Map(Object.entries(data));
                console.log(`📡 Loaded ${this.nodes.size} known nodes`);
            }
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    }

    /**
     * Save nodes to file
     */
    private saveNodes(): void {
        try {
            const data = Object.fromEntries(this.nodes);
            fs.writeFileSync(this.nodesFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving nodes:', error);
        }
    }

    /**
     * Register this node
     */
    registerNode(httpUrl: string, p2pUrl: string): void {
        const node: NodeInfo = {
            id: this.nodeId,
            httpUrl,
            p2pUrl,
            lastSeen: Date.now(),
            version: '1.0.0'
        };

        this.nodes.set(this.nodeId, node);
        this.saveNodes();
        console.log(`✅ Node registered: ${httpUrl}`);
    }

    /**
     * Update heartbeat for this node
     */
    heartbeat(): void {
        const node = this.nodes.get(this.nodeId);
        if (node) {
            node.lastSeen = Date.now();
            this.saveNodes();
        }
    }

    /**
     * Get all active nodes (seen in last 5 minutes)
     */
    getActiveNodes(): NodeInfo[] {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const activeNodes: NodeInfo[] = [];

        for (const [id, node] of this.nodes.entries()) {
            if (node.lastSeen > fiveMinutesAgo && id !== this.nodeId) {
                activeNodes.push(node);
            }
        }

        return activeNodes;
    }

    /**
     * Get all nodes (including inactive)
     */
    getAllNodes(): NodeInfo[] {
        return Array.from(this.nodes.values()).filter(n => n.id !== this.nodeId);
    }

    /**
     * Remove inactive nodes (not seen in 10 minutes)
     */
    private cleanup(): void {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        let removed = 0;

        for (const [id, node] of this.nodes.entries()) {
            if (node.lastSeen < tenMinutesAgo && id !== this.nodeId) {
                this.nodes.delete(id);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`🧹 Cleaned up ${removed} inactive nodes`);
            this.saveNodes();
        }
    }

    /**
     * Start periodic cleanup
     */
    private startCleanup(): void {
        // Cleanup every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Start periodic heartbeat
     */
    startHeartbeat(): NodeJS.Timeout {
        // Send heartbeat every minute
        return setInterval(() => {
            this.heartbeat();
        }, 60 * 1000);
    }

    /**
     * Stop all intervals
     */
    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }

    getNodeId(): string {
        return this.nodeId;
    }
}
