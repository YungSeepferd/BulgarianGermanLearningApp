/**
 * Background Sync Module for offline progress saving
 * Handles queuing and syncing user progress when offline
 */
interface SyncQueueItem {
    id: string;
    type: 'progress' | 'session' | 'vocab' | 'settings';
    data: any;
    timestamp: number;
    retries: number;
}
interface BackgroundSyncConfig {
    maxRetries: number;
    retryDelay: number;
    queueSize: number;
    syncEndpoint: string;
}
declare class BackgroundSyncManager {
    private queue;
    private config;
    private isOnline;
    private syncInProgress;
    constructor(config?: Partial<BackgroundSyncConfig>);
    /**
     * Initialize background sync manager
     */
    private init;
    /**
     * Add item to sync queue
     */
    addToQueue(type: SyncQueueItem['type'], data: any): string;
    /**
     * Process sync queue
     */
    private processQueue;
    /**
     * Sync individual item
     */
    private syncItem;
    /**
     * Handle online event
     */
    private handleOnline;
    /**
     * Handle offline event
     */
    private handleOffline;
    /**
     * Start periodic sync
     */
    private startPeriodicSync;
    /**
     * Generate unique ID for sync items
     */
    private generateId;
    /**
     * Save queue to localStorage
     */
    private saveQueue;
    /**
     * Load queue from localStorage
     */
    private loadQueue;
    /**
     * Get queue status
     */
    getQueueStatus(): {
        total: number;
        pending: number;
        failed: number;
    };
    /**
     * Clear sync queue
     */
    clearQueue(): void;
    /**
     * Check if sync is available
     */
    isSyncAvailable(): boolean;
}
export declare const backgroundSync: BackgroundSyncManager;
declare global {
    interface Window {
        bgdeBackgroundSync: BackgroundSyncManager;
    }
}
export default backgroundSync;
//# sourceMappingURL=background-sync.d.ts.map