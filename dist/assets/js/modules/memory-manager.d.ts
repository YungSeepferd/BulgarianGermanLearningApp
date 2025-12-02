/**
 * Memory Manager
 * Provides memory pressure monitoring, cache management, and cleanup strategies
 * @since 1.0.0
 */
/**
 * Memory pressure levels
 */
export type MemoryPressure = 'low' | 'medium' | 'high' | 'critical';
/**
 * Cache entry information
 */
export interface CacheEntry {
    /** Cache key */
    key: string;
    /** Cache size in bytes */
    size: number;
    /** Last access timestamp */
    lastAccess: Date;
    /** Creation timestamp */
    created: Date;
    /** Access count */
    accessCount: number;
    /** Entry priority */
    priority: number;
    /** Entry metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Memory statistics
 */
export interface MemoryStatistics {
    /** Total cache size in bytes */
    totalCacheSize: number;
    /** Number of cache entries */
    entryCount: number;
    /** Current memory pressure level */
    pressure: MemoryPressure;
    /** Available memory estimate in bytes */
    availableMemory?: number;
    /** Memory usage percentage */
    memoryUsagePercentage?: number;
    /** Cache hit rate */
    hitRate: number;
    /** Total cache hits */
    totalHits: number;
    /** Total cache misses */
    totalMisses: number;
    /** Last cleanup timestamp */
    lastCleanup?: Date;
}
/**
 * Memory event types
 */
export type MemoryEventType = 'pressure-changed' | 'cache-full' | 'cleanup-started' | 'cleanup-completed' | 'entry-evicted' | 'memory-warning';
/**
 * Memory event data
 */
export interface MemoryEvent {
    /** Event type */
    type: MemoryEventType;
    /** Current memory statistics */
    statistics: MemoryStatistics;
    /** Previous memory pressure level */
    previousPressure?: MemoryPressure;
    /** Event timestamp */
    timestamp: Date;
    /** Additional event data */
    data?: Record<string, unknown>;
}
/**
 * Memory event listener
 */
export type MemoryEventListener = (event: MemoryEvent) => void;
/**
 * Cleanup strategy configuration
 */
export interface CleanupStrategy {
    /** Strategy name */
    name: string;
    /** Strategy priority (higher = more aggressive) */
    priority: number;
    /** Minimum memory pressure level to trigger */
    minPressure: MemoryPressure;
    /** Execute cleanup strategy */
    execute: (entries: CacheEntry[], targetSize: number) => Promise<CacheEntry[]>;
}
/**
 * Memory manager options
 */
export interface MemoryManagerOptions {
    /** Maximum cache size in bytes */
    maxCacheSize?: number;
    /** Memory pressure warning threshold (0-1) */
    warningThreshold?: number;
    /** Memory pressure critical threshold (0-1) */
    criticalThreshold?: number;
    /** Cleanup interval in milliseconds */
    cleanupInterval?: number;
    /** Whether to enable automatic cleanup */
    enableAutoCleanup?: boolean;
    /** Whether to enable detailed logging */
    enableLogging?: boolean;
    /** Whether to track statistics */
    enableStatistics?: boolean;
}
/**
 * Memory Manager
 * Monitors memory usage and manages cache cleanup strategies
 */
export declare class MemoryManager {
    private options;
    private listeners;
    private cache;
    private statistics;
    private cleanupTimer?;
    private cleanupStrategies;
    private totalHits;
    private totalMisses;
    /**
     * Create a new memory manager
     * @param options - Configuration options
     */
    constructor(options?: MemoryManagerOptions);
    /**
     * Get a value from cache
     * @param key - Cache key
     * @returns Cached value or undefined
     */
    get<T>(key: string): Promise<T | undefined>;
    /**
     * Store a value in cache
     * @param key - Cache key
     * @param value - Value to store
     * @param priority - Entry priority (higher = less likely to be evicted)
     * @param metadata - Entry metadata
     */
    set<T>(key: string, value: T, priority?: number, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Remove a value from cache
     * @param key - Cache key
     * @returns Whether entry was removed
     */
    delete(key: string): Promise<boolean>;
    /**
     * Check if key exists in cache
     * @param key - Cache key
     * @returns Whether key exists
     */
    has(key: string): boolean;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get memory statistics
     * @returns Current memory statistics
     */
    getStatistics(): MemoryStatistics;
    /**
     * Get current memory pressure level
     * @returns Memory pressure level
     */
    getMemoryPressure(): MemoryPressure;
    /**
     * Get available memory estimate
     * @returns Available memory in bytes
     */
    getAvailableMemory(): number;
    /**
     * Force cleanup of cache
     * @param pressure - Target memory pressure level
     */
    forceCleanup(pressure?: MemoryPressure): Promise<void>;
    /**
     * Add a cleanup strategy
     * @param strategy - Cleanup strategy to add
     */
    addCleanupStrategy(strategy: CleanupStrategy): void;
    /**
     * Remove a cleanup strategy
     * @param name - Strategy name to remove
     */
    removeCleanupStrategy(name: string): void;
    /**
     * Get cache entries sorted by priority and access
     * @param limit - Maximum number of entries to return
     * @returns Array of cache entries
     */
    getCacheEntries(limit?: number): CacheEntry[];
    /**
     * Subscribe to memory events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener: MemoryEventListener): () => void;
    /**
     * Unsubscribe from memory events
     * @param listener - Event listener function
     */
    unsubscribe(listener: MemoryEventListener): void;
    /**
     * Destroy the memory manager and clean up resources
     */
    destroy(): Promise<void>;
    /**
     * Initialize default cleanup strategies
     */
    private initializeCleanupStrategies;
    /**
     * Start periodic cleanup
     */
    private startPeriodicCleanup;
    /**
     * Calculate memory pressure level
     * @returns Memory pressure level
     */
    private calculateMemoryPressure;
    /**
     * Perform cleanup based on memory pressure
     * @param pressure - Current memory pressure level
     */
    private performCleanup;
    /**
     * Check if cleanup strategy is applicable for given pressure
     * @param strategy - Cleanup strategy
     * @param pressure - Memory pressure level
     * @returns Whether strategy is applicable
     */
    private isStrategyApplicable;
    /**
     * Calculate target cache size for cleanup
     * @param pressure - Memory pressure level
     * @returns Target size in bytes
     */
    private calculateTargetSize;
    /**
     * Evict least recently used entries to make space
     * @param requiredSize - Required space in bytes
     */
    private evictLeastRecentlyUsed;
    /**
     * Calculate total size of entries
     * @param entries - Cache entries
     * @returns Total size in bytes
     */
    private calculateTotalSize;
    /**
     * Calculate approximate size of a value
     * @param value - Value to size
     * @returns Size in bytes
     */
    private calculateSize;
    /**
     * Update memory statistics
     */
    private updateStatistics;
    /**
     * Store value in actual storage (implement based on your storage backend)
     * @param key - Storage key
     * @param value - Value to store
     */
    private storeValue;
    /**
     * Get value from actual storage
     * @param key - Storage key
     * @returns Stored value
     */
    private getStoredValue;
    /**
     * Remove value from actual storage
     * @param key - Storage key
     */
    private removeStoredValue;
    /**
     * Emit an event to all listeners
     * @param event - Event to emit
     */
    private emitEvent;
    /**
     * Log message if logging is enabled
     * @param message - Message to log
     */
    private log;
}
export declare const memoryManager: MemoryManager;
export default memoryManager;
//# sourceMappingURL=memory-manager.d.ts.map