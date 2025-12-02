/**
 * Memory Manager
 * Provides memory pressure monitoring, cache management, and cleanup strategies
 * @since 1.0.0
 */
import { ErrorFactory } from './error-types.js';
/**
 * Memory Manager
 * Monitors memory usage and manages cache cleanup strategies
 */
export class MemoryManager {
    /**
     * Create a new memory manager
     * @param options - Configuration options
     */
    constructor(options = {}) {
        this.listeners = new Set();
        this.cache = new Map();
        this.cleanupStrategies = new Map();
        this.totalHits = 0;
        this.totalMisses = 0;
        this.options = {
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            warningThreshold: 0.8,
            criticalThreshold: 0.95,
            cleanupInterval: 60000, // 1 minute
            enableAutoCleanup: true,
            enableLogging: process.env.NODE_ENV === 'development',
            enableStatistics: true,
            ...options
        };
        this.statistics = {
            totalCacheSize: 0,
            entryCount: 0,
            pressure: 'low',
            hitRate: 0,
            totalHits: 0,
            totalMisses: 0
        };
        this.initializeCleanupStrategies();
        this.startPeriodicCleanup();
    }
    /**
     * Get a value from cache
     * @param key - Cache key
     * @returns Cached value or undefined
     */
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.totalMisses++;
            this.updateStatistics();
            return undefined;
        }
        // Update access information
        entry.lastAccess = new Date();
        entry.accessCount++;
        this.totalHits++;
        this.updateStatistics();
        this.log(`Cache hit: ${key}`);
        return this.getStoredValue(key);
    }
    /**
     * Store a value in cache
     * @param key - Cache key
     * @param value - Value to store
     * @param priority - Entry priority (higher = less likely to be evicted)
     * @param metadata - Entry metadata
     */
    async set(key, value, priority = 1, metadata) {
        const size = this.calculateSize(value);
        const now = new Date();
        // Check if we need to make space
        if (size > this.options.maxCacheSize) {
            throw ErrorFactory.storage(`Value too large for cache: ${size} bytes > ${this.options.maxCacheSize} bytes`, 'write', key, this.getAvailableMemory(), { size });
        }
        // Check memory pressure and cleanup if needed
        const pressure = this.calculateMemoryPressure();
        if (pressure !== 'low') {
            await this.performCleanup(pressure);
        }
        // Still not enough space after cleanup?
        if (this.statistics.totalCacheSize + size > this.options.maxCacheSize) {
            await this.evictLeastRecentlyUsed(size);
        }
        const entry = {
            key,
            size,
            lastAccess: now,
            created: now,
            accessCount: 1,
            priority,
            metadata
        };
        this.cache.set(key, entry);
        await this.storeValue(key, value);
        this.updateStatistics();
        this.log(`Cache set: ${key} (${size} bytes)`);
    }
    /**
     * Remove a value from cache
     * @param key - Cache key
     * @returns Whether entry was removed
     */
    async delete(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        this.cache.delete(key);
        await this.removeStoredValue(key);
        this.updateStatistics();
        this.emitEvent({
            type: 'entry-evicted',
            statistics: this.statistics,
            timestamp: new Date(),
            data: { key, size: entry.size }
        });
        this.log(`Cache delete: ${key}`);
        return true;
    }
    /**
     * Check if key exists in cache
     * @param key - Cache key
     * @returns Whether key exists
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Clear all cache entries
     */
    async clear() {
        const keys = [...this.cache.keys()];
        for (const key of keys) {
            await this.delete(key);
        }
        this.log('Cache cleared');
    }
    /**
     * Get memory statistics
     * @returns Current memory statistics
     */
    getStatistics() {
        return { ...this.statistics };
    }
    /**
     * Get current memory pressure level
     * @returns Memory pressure level
     */
    getMemoryPressure() {
        return this.calculateMemoryPressure();
    }
    /**
     * Get available memory estimate
     * @returns Available memory in bytes
     */
    getAvailableMemory() {
        return this.options.maxCacheSize - this.statistics.totalCacheSize;
    }
    /**
     * Force cleanup of cache
     * @param pressure - Target memory pressure level
     */
    async forceCleanup(pressure = 'medium') {
        await this.performCleanup(pressure);
        this.log('Force cleanup completed');
    }
    /**
     * Add a cleanup strategy
     * @param strategy - Cleanup strategy to add
     */
    addCleanupStrategy(strategy) {
        this.cleanupStrategies.set(strategy.name, strategy);
        this.log(`Added cleanup strategy: ${strategy.name}`);
    }
    /**
     * Remove a cleanup strategy
     * @param name - Strategy name to remove
     */
    removeCleanupStrategy(name) {
        this.cleanupStrategies.delete(name);
        this.log(`Removed cleanup strategy: ${name}`);
    }
    /**
     * Get cache entries sorted by priority and access
     * @param limit - Maximum number of entries to return
     * @returns Array of cache entries
     */
    getCacheEntries(limit) {
        const entries = [...this.cache.values()]
            .sort((a, b) => {
            // Sort by priority first (higher priority first), then by last access (most recent first)
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return b.lastAccess.getTime() - a.lastAccess.getTime();
        });
        return limit ? entries.slice(0, limit) : entries;
    }
    /**
     * Subscribe to memory events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Unsubscribe from memory events
     * @param listener - Event listener function
     */
    unsubscribe(listener) {
        this.listeners.delete(listener);
    }
    /**
     * Destroy the memory manager and clean up resources
     */
    async destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        await this.clear();
        this.listeners.clear();
        this.cleanupStrategies.clear();
        this.log('Memory manager destroyed');
    }
    /**
     * Initialize default cleanup strategies
     */
    initializeCleanupStrategies() {
        // LRU (Least Recently Used) strategy
        this.addCleanupStrategy({
            name: 'lru',
            priority: 100,
            minPressure: 'medium',
            execute: async (entries, targetSize) => {
                // Sort by last access time (oldest first)
                const sorted = entries.sort((a, b) => a.lastAccess.getTime() - b.lastAccess.getTime());
                const toRemove = [];
                let currentSize = this.calculateTotalSize(sorted);
                for (const entry of sorted) {
                    if (currentSize <= targetSize)
                        break;
                    toRemove.push(entry);
                    currentSize -= entry.size;
                }
                // Remove entries from cache
                for (const entry of toRemove) {
                    await this.delete(entry.key);
                }
                return sorted.filter(entry => !toRemove.includes(entry));
            }
        });
        // LFU (Least Frequently Used) strategy
        this.addCleanupStrategy({
            name: 'lfu',
            priority: 90,
            minPressure: 'high',
            execute: async (entries, targetSize) => {
                // Sort by access count (least used first)
                const sorted = entries.sort((a, b) => a.accessCount - b.accessCount);
                const toRemove = [];
                let currentSize = this.calculateTotalSize(sorted);
                for (const entry of sorted) {
                    if (currentSize <= targetSize)
                        break;
                    toRemove.push(entry);
                    currentSize -= entry.size;
                }
                // Remove entries from cache
                for (const entry of toRemove) {
                    await this.delete(entry.key);
                }
                return sorted.filter(entry => !toRemove.includes(entry));
            }
        });
        // Priority-based strategy
        this.addCleanupStrategy({
            name: 'priority',
            priority: 80,
            minPressure: 'critical',
            execute: async (entries, targetSize) => {
                // Sort by priority (lowest priority first)
                const sorted = entries.sort((a, b) => a.priority - b.priority);
                const toRemove = [];
                let currentSize = this.calculateTotalSize(sorted);
                for (const entry of sorted) {
                    if (currentSize <= targetSize)
                        break;
                    toRemove.push(entry);
                    currentSize -= entry.size;
                }
                // Remove entries from cache
                for (const entry of toRemove) {
                    await this.delete(entry.key);
                }
                return sorted.filter(entry => !toRemove.includes(entry));
            }
        });
    }
    /**
     * Start periodic cleanup
     */
    startPeriodicCleanup() {
        if (this.options.enableAutoCleanup && this.options.cleanupInterval > 0) {
            this.cleanupTimer = window.setInterval(() => {
                const pressure = this.calculateMemoryPressure();
                if (pressure !== 'low') {
                    this.performCleanup(pressure);
                }
            }, this.options.cleanupInterval);
        }
    }
    /**
     * Calculate memory pressure level
     * @returns Memory pressure level
     */
    calculateMemoryPressure() {
        const usage = this.statistics.totalCacheSize / this.options.maxCacheSize;
        if (usage >= this.options.criticalThreshold)
            return 'critical';
        if (usage >= this.options.warningThreshold)
            return 'high';
        if (usage >= 0.6)
            return 'medium';
        return 'low';
    }
    /**
     * Perform cleanup based on memory pressure
     * @param pressure - Current memory pressure level
     */
    async performCleanup(pressure) {
        const previousPressure = this.statistics.pressure;
        this.emitEvent({
            type: 'cleanup-started',
            statistics: this.statistics,
            timestamp: new Date(),
            data: { pressure }
        });
        this.log(`Starting cleanup for ${pressure} pressure`);
        // Get applicable strategies
        const applicableStrategies = [...this.cleanupStrategies.values()]
            .filter(strategy => this.isStrategyApplicable(strategy, pressure))
            .sort((a, b) => b.priority - a.priority);
        // Calculate target size
        const targetSize = this.calculateTargetSize(pressure);
        const entries = [...this.cache.values()];
        // Execute strategies in priority order
        for (const strategy of applicableStrategies) {
            try {
                this.log(`Executing cleanup strategy: ${strategy.name}`);
                await strategy.execute(entries, targetSize);
                // Check if we've freed enough memory
                if (this.statistics.totalCacheSize <= targetSize) {
                    break;
                }
            }
            catch (error) {
                this.log(`Cleanup strategy failed: ${strategy.name} - ${error}`);
            }
        }
        this.updateStatistics();
        this.statistics.lastCleanup = new Date();
        this.emitEvent({
            type: 'cleanup-completed',
            statistics: this.statistics,
            timestamp: new Date(),
            data: { pressure, previousPressure }
        });
        // Check if pressure changed
        if (previousPressure !== this.statistics.pressure) {
            this.emitEvent({
                type: 'pressure-changed',
                statistics: this.statistics,
                previousPressure,
                timestamp: new Date()
            });
        }
        this.log(`Cleanup completed: ${this.statistics.totalCacheSize} bytes used`);
    }
    /**
     * Check if cleanup strategy is applicable for given pressure
     * @param strategy - Cleanup strategy
     * @param pressure - Memory pressure level
     * @returns Whether strategy is applicable
     */
    isStrategyApplicable(strategy, pressure) {
        const pressureLevels = ['low', 'medium', 'high', 'critical'];
        const strategyIndex = pressureLevels.indexOf(strategy.minPressure);
        const currentPressureIndex = pressureLevels.indexOf(pressure);
        return currentPressureIndex >= strategyIndex;
    }
    /**
     * Calculate target cache size for cleanup
     * @param pressure - Memory pressure level
     * @returns Target size in bytes
     */
    calculateTargetSize(pressure) {
        switch (pressure) {
            case 'critical': {
                return this.options.maxCacheSize * 0.5;
            } // Reduce to 50%
            case 'high': {
                return this.options.maxCacheSize * 0.7;
            } // Reduce to 70%
            case 'medium': {
                return this.options.maxCacheSize * 0.8;
            } // Reduce to 80%
            default: {
                return this.options.maxCacheSize * 0.9;
            } // Reduce to 90%
        }
    }
    /**
     * Evict least recently used entries to make space
     * @param requiredSize - Required space in bytes
     */
    async evictLeastRecentlyUsed(requiredSize) {
        const entries = [...this.cache.values()]
            .sort((a, b) => a.lastAccess.getTime() - b.lastAccess.getTime());
        let freedSpace = 0;
        for (const entry of entries) {
            if (freedSpace >= requiredSize)
                break;
            await this.delete(entry.key);
            freedSpace += entry.size;
        }
        this.log(`Evicted LRU entries to free ${freedSpace} bytes`);
    }
    /**
     * Calculate total size of entries
     * @param entries - Cache entries
     * @returns Total size in bytes
     */
    calculateTotalSize(entries) {
        return entries.reduce((total, entry) => total + entry.size, 0);
    }
    /**
     * Calculate approximate size of a value
     * @param value - Value to size
     * @returns Size in bytes
     */
    calculateSize(value) {
        if (value === null || value === undefined)
            return 0;
        try {
            const jsonString = JSON.stringify(value);
            return new Blob([jsonString]).size;
        }
        catch {
            // Fallback estimation
            return 100; // Default 100 bytes
        }
    }
    /**
     * Update memory statistics
     */
    updateStatistics() {
        const entries = [...this.cache.values()];
        this.statistics.totalCacheSize = this.calculateTotalSize(entries);
        this.statistics.entryCount = entries.length;
        this.statistics.pressure = this.calculateMemoryPressure();
        this.statistics.totalHits = this.totalHits;
        this.statistics.totalMisses = this.totalMisses;
        const totalRequests = this.totalHits + this.totalMisses;
        this.statistics.hitRate = totalRequests > 0 ? this.totalHits / totalRequests : 0;
        // Try to get memory usage information
        if ('memory' in performance) {
            const memory = performance.memory;
            this.statistics.availableMemory = memory.jsHeapSizeLimit - memory.usedJSHeapSize;
            this.statistics.memoryUsagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
    }
    /**
     * Store value in actual storage (implement based on your storage backend)
     * @param key - Storage key
     * @param value - Value to store
     */
    async storeValue(key, value) {
        try {
            // For now, use localStorage as the backend
            const serialized = JSON.stringify(value);
            localStorage.setItem(`cache:${key}`, serialized);
        }
        catch (error) {
            throw ErrorFactory.storage('Failed to store value', 'write', { key, error });
        }
    }
    /**
     * Get value from actual storage
     * @param key - Storage key
     * @returns Stored value
     */
    async getStoredValue(key) {
        try {
            const serialized = localStorage.getItem(`cache:${key}`);
            return serialized ? JSON.parse(serialized) : undefined;
        }
        catch (error) {
            throw ErrorFactory.storage('Failed to retrieve value', 'read', { key, error });
        }
    }
    /**
     * Remove value from actual storage
     * @param key - Storage key
     */
    async removeStoredValue(key) {
        try {
            localStorage.removeItem(`cache:${key}`);
        }
        catch (error) {
            throw ErrorFactory.storage('Failed to remove value', 'clear', { key, error });
        }
    }
    /**
     * Emit an event to all listeners
     * @param event - Event to emit
     */
    emitEvent(event) {
        for (const listener of this.listeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error('Error in memory event listener:', error);
            }
        }
    }
    /**
     * Log message if logging is enabled
     * @param message - Message to log
     */
    log(message) {
        if (this.options.enableLogging) {
            console.log(`[MemoryManager] ${message}`);
        }
    }
}
// Create singleton instance
export const memoryManager = new MemoryManager({
    enableLogging: process.env.NODE_ENV === 'development'
});
export default memoryManager;
//# sourceMappingURL=memory-manager.js.map