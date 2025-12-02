/**
 * Background Sync Module for offline progress saving
 * Handles queuing and syncing user progress when offline
 */
class BackgroundSyncManager {
    constructor(config = {}) {
        this.queue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.config = {
            maxRetries: 3,
            retryDelay: 5000, // 5 seconds
            queueSize: 100,
            syncEndpoint: '/api/sync',
            ...config
        };
        this.init();
    }
    /**
     * Initialize background sync manager
     */
    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        // Load existing queue from storage
        this.loadQueue();
        // Start periodic sync if online
        if (this.isOnline) {
            this.startPeriodicSync();
        }
    }
    /**
     * Add item to sync queue
     */
    addToQueue(type, data) {
        const id = this.generateId();
        const item = {
            id,
            type,
            data,
            timestamp: Date.now(),
            retries: 0
        };
        // Add to queue
        this.queue.unshift(item);
        // Limit queue size
        if (this.queue.length > this.config.queueSize) {
            this.queue = this.queue.slice(0, this.config.queueSize);
        }
        // Save queue to storage
        this.saveQueue();
        // Try to sync immediately if online
        if (this.isOnline && !this.syncInProgress) {
            this.processQueue();
        }
        return id;
    }
    /**
     * Process sync queue
     */
    async processQueue() {
        if (this.syncInProgress || this.queue.length === 0 || !this.isOnline) {
            return;
        }
        this.syncInProgress = true;
        try {
            while (this.queue.length > 0 && this.isOnline) {
                const item = this.queue[this.queue.length - 1]; // Get oldest item
                try {
                    await this.syncItem(item);
                    // Remove successfully synced item
                    this.queue.pop();
                }
                catch (error) {
                    console.warn(`Sync failed for item ${item.id}:`, error);
                    item.retries++;
                    if (item.retries >= this.config.maxRetries) {
                        // Remove item after max retries
                        console.error(`Max retries reached for item ${item.id}, removing from queue`);
                        this.queue.pop();
                    }
                    else {
                        // Move to front for retry
                        this.queue.unshift(this.queue.pop());
                        break; // Wait before next retry
                    }
                }
                this.saveQueue();
            }
        }
        finally {
            this.syncInProgress = false;
        }
    }
    /**
     * Sync individual item
     */
    async syncItem(item) {
        const response = await fetch(this.config.syncEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: item.type,
                data: item.data,
                timestamp: item.timestamp
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log(`Successfully synced ${item.type} item: ${item.id}`);
    }
    /**
     * Handle online event
     */
    handleOnline() {
        this.isOnline = true;
        console.log('Connection restored, starting background sync');
        // Start periodic sync
        this.startPeriodicSync();
        // Process any queued items
        this.processQueue();
    }
    /**
     * Handle offline event
     */
    handleOffline() {
        this.isOnline = false;
        console.log('Connection lost, queuing sync operations');
    }
    /**
     * Start periodic sync
     */
    startPeriodicSync() {
        // Sync every 30 seconds when online
        setInterval(() => {
            if (this.isOnline && !this.syncInProgress && this.queue.length > 0) {
                this.processQueue();
            }
        }, 30000);
    }
    /**
     * Generate unique ID for sync items
     */
    generateId() {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Save queue to localStorage
     */
    saveQueue() {
        try {
            localStorage.setItem('bgde_sync_queue', JSON.stringify(this.queue));
        }
        catch (error) {
            console.warn('Failed to save sync queue:', error);
        }
    }
    /**
     * Load queue from localStorage
     */
    loadQueue() {
        try {
            const stored = localStorage.getItem('bgde_sync_queue');
            if (stored) {
                this.queue = JSON.parse(stored);
                console.log(`Loaded ${this.queue.length} items from sync queue`);
            }
        }
        catch (error) {
            console.warn('Failed to load sync queue:', error);
            this.queue = [];
        }
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
        const total = this.queue.length;
        const pending = this.queue.filter(item => item.retries === 0).length;
        const failed = this.queue.filter(item => item.retries > 0).length;
        return { total, pending, failed };
    }
    /**
     * Clear sync queue
     */
    clearQueue() {
        this.queue = [];
        this.saveQueue();
        console.log('Sync queue cleared');
    }
    /**
     * Check if sync is available
     */
    isSyncAvailable() {
        return 'serviceWorker' in navigator && 'SyncManager' in window;
    }
}
// Export singleton instance
export const backgroundSync = new BackgroundSyncManager();
window.bgdeBackgroundSync = backgroundSync;
export default backgroundSync;
//# sourceMappingURL=background-sync.js.map