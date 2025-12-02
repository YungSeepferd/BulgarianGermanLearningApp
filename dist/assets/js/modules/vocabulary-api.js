/**
 * Modular Vocabulary API
 * Provides lazy-loading capabilities for split vocabulary data
 * Enhanced with structured error handling, loading states, and network resilience
 * Maintains backward compatibility with existing loading patterns
 * @since 1.0.0
 */
import { ErrorFactory, NetworkError, ParsingError, RetryStrategy, ValidationError } from './error-types.js';
import { loadingStateManager } from './loading-state-manager.js';
import { networkManager } from './network-manager.js';
import { connectivityManager } from './connectivity-manager.js';
import { memoryManager } from './memory-manager.js';
import { errorLogger } from './error-logger.js';
class VocabularyAPI {
    constructor() {
        this.loadedChunks = new Map();
        this.index = null;
        this.basePath = '/data/vocab/';
        this.maxRetries = 3;
        this.defaultTimeout = 10000;
        this.retryStrategy = new RetryStrategy(this.maxRetries, 1000, 10000);
        this.loadIndex();
        this.initializeEventListeners();
        // Initialize logging
        errorLogger.info('VocabularyAPI initialized', { component: 'vocabulary-api' });
    }
    /**
     * Load the vocabulary index with enhanced error handling and loading states
     */
    async loadIndex() {
        const operationId = loadingStateManager.startLoading(1, 'Loading vocabulary index...');
        errorLogger.info('Starting vocabulary index load', {}, 'vocabulary-api');
        try {
            // Check connectivity first
            if (!connectivityManager.isOnline()) {
                throw ErrorFactory.network('Offline - cannot load vocabulary index', { url: `${this.basePath}index.json` });
            }
            // Check memory pressure
            const memoryStats = memoryManager.getStatistics();
            if (memoryStats.pressure === 'critical') {
                await memoryManager.forceCleanup('high');
            }
            loadingStateManager.startChunk(operationId, 'index.json');
            loadingStateManager.updateChunkProgress(operationId, 'index.json', 25);
            const response = await networkManager.fetch(`${this.basePath}index.json`, {
                timeout: this.defaultTimeout,
                metadata: { operation: 'loadIndex', chunkId: 'index.json' }
            });
            loadingStateManager.updateChunkProgress(operationId, 'index.json', 75);
            if (!response.ok) {
                throw ErrorFactory.network(`Failed to load vocabulary index: ${response.statusText}`, response.status, { url: `${this.basePath}index.json` });
            }
            const indexData = await response.json();
            // Validate index structure
            if (!this.validateIndex(indexData)) {
                throw new ParsingError('Invalid vocabulary index structure', 'JSON', JSON.stringify(indexData).slice(0, 500), 'valid VocabularyIndex structure');
            }
            this.index = indexData;
            // Cache the index
            await memoryManager.set('vocabulary-index', indexData, 10, {
                type: 'index',
                loadedAt: new Date().toISOString()
            });
            loadingStateManager.completeChunk(operationId, 'index.json');
            loadingStateManager.updateStage(operationId, 'Index loaded successfully');
            errorLogger.info('Vocabulary index loaded successfully', {
                totalEntries: this.index.totalEntries,
                chunkCount: this.index.splitFiles.length
            }, 'vocabulary-api');
        }
        catch (error) {
            const vocabError = ErrorFactory.fromError(error, {
                operation: 'loadIndex',
                url: `${this.basePath}index.json`
            });
            errorLogger.logVocabularyError(vocabError, 'loadIndex', {
                url: `${this.basePath}index.json`
            });
            loadingStateManager.failChunk(operationId, 'index.json', vocabError);
            // Try to load from cache as fallback
            try {
                const cachedIndex = await memoryManager.get('vocabulary-index');
                if (cachedIndex) {
                    this.index = cachedIndex;
                    console.log('[VocabularyAPI] Loaded index from cache as fallback');
                    return;
                }
            }
            catch (cacheError) {
                console.warn('[VocabularyAPI] Failed to load index from cache:', cacheError);
            }
            errorLogger.warn('Using fallback loading due to index load failure', {
                error: vocabError.message
            }, 'vocabulary-api');
        }
    }
    /**
     * Initialize event listeners for loading state management
     */
    initializeEventListeners() {
        loadingStateManager.subscribe((event) => {
            this.handleLoadingEvent(event);
        });
    }
    /**
     * Handle loading state events
     * @param event - Loading event
     */
    handleLoadingEvent(event) {
        // Log significant events for debugging
        if (event.type === 'loading-failed' && event.error) {
            errorLogger.logVocabularyError(event.error, event.operationId, {
                eventType: event.type,
                operationId: event.operationId
            });
        }
        else if (event.type === 'loading-completed') {
            errorLogger.logLoadingState(event.operationId, 'completed', event.progress?.percentage, {
                operationId: event.operationId,
                duration: event.progress?.duration
            });
        }
    }
    /**
     * Validate vocabulary index structure
     * @param index - Index data to validate
     * @returns Whether index is valid
     */
    validateIndex(index) {
        if (!index || typeof index !== 'object')
            return false;
        const idx = index;
        return (typeof idx.generated === 'string' &&
            typeof idx.totalEntries === 'number' &&
            Array.isArray(idx.splitFiles) &&
            typeof idx.summary === 'object' &&
            typeof idx.summary.totalFiles === 'number');
    }
    /**
     * Load a specific vocabulary chunk by file name with enhanced error handling and loading states
     * @param fileName - Name of the chunk file to load
     * @returns Promise resolving to vocabulary entries
     */
    async loadChunk(fileName) {
        // Check if already loaded
        const cachedChunk = this.loadedChunks.get(fileName);
        if (cachedChunk) {
            return cachedChunk;
        }
        // Try memory cache first
        try {
            const memoryChunk = await memoryManager.get(`vocab-chunk-${fileName}`);
            if (memoryChunk) {
                this.loadedChunks.set(fileName, memoryChunk);
                console.log(`[VocabularyAPI] Loaded chunk ${fileName} from memory cache with ${memoryChunk.length} entries`);
                return memoryChunk;
            }
        }
        catch (cacheError) {
            console.warn(`[VocabularyAPI] Memory cache miss for ${fileName}:`, cacheError);
        }
        errorLogger.debug('Starting chunk load', { fileName }, 'vocabulary-api');
        const operationId = loadingStateManager.startLoading(1, `Loading vocabulary chunk: ${fileName}`);
        return this.retryStrategy.recover(new NetworkError(`Failed to load chunk ${fileName}`, undefined, `${this.basePath}${fileName}`), {
            retryFunction: async () => {
                try {
                    // Check connectivity
                    if (!connectivityManager.isOnline()) {
                        throw ErrorFactory.network('Offline - cannot load vocabulary chunk', { url: `${this.basePath}${fileName}` });
                    }
                    // Check memory pressure
                    const memoryStats = memoryManager.getStatistics();
                    if (memoryStats.pressure === 'critical') {
                        await memoryManager.forceCleanup('high');
                    }
                    loadingStateManager.startChunk(operationId, fileName);
                    loadingStateManager.updateChunkProgress(operationId, fileName, 10);
                    // Log network operation
                    errorLogger.logNetworkOperation('loadChunk', `${this.basePath}${fileName}`, 'GET', {
                        fileName,
                        timeout: this.defaultTimeout
                    });
                    // Load with network manager
                    const response = await networkManager.fetch(`${this.basePath}${fileName}`, {
                        timeout: this.defaultTimeout,
                        metadata: { operation: 'loadChunk', fileName }
                    });
                    loadingStateManager.updateChunkProgress(operationId, fileName, 50);
                    if (!response.ok) {
                        throw ErrorFactory.network(`Failed to load vocabulary chunk: ${response.statusText}`, response.status, { url: `${this.basePath}${fileName}` });
                    }
                    const entries = await response.json();
                    loadingStateManager.updateChunkProgress(operationId, fileName, 80);
                    // Validate entries
                    if (!Array.isArray(entries)) {
                        throw new ParsingError(`Invalid data format in ${fileName}`, 'JSON', JSON.stringify(entries).slice(0, 500), 'array of vocabulary entries');
                    }
                    // Validate individual entries
                    const validEntries = entries.filter((entry, index) => {
                        if (!entry || typeof entry !== 'object') {
                            console.warn(`[VocabularyAPI] Skipping invalid entry at index ${index} in ${fileName}`);
                            return false;
                        }
                        if (!entry.id || !entry.word || !entry.translation) {
                            console.warn(`[VocabularyAPI] Skipping entry missing required fields at index ${index} in ${fileName}`);
                            return false;
                        }
                        return true;
                    });
                    if (validEntries.length === 0) {
                        throw new ParsingError(`No valid entries found in ${fileName}`, 'JSON', JSON.stringify(entries).slice(0, 500), 'array with valid vocabulary entries');
                    }
                    // Cache in memory
                    this.loadedChunks.set(fileName, validEntries);
                    await memoryManager.set(`vocab-chunk-${fileName}`, validEntries, 5, {
                        type: 'chunk',
                        fileName,
                        entryCount: validEntries.length,
                        loadedAt: new Date().toISOString()
                    });
                    loadingStateManager.completeChunk(operationId, fileName);
                    errorLogger.info('Chunk loaded successfully', {
                        fileName,
                        entryCount: validEntries.length
                    }, 'vocabulary-api');
                    return validEntries;
                }
                catch (error) {
                    const vocabError = ErrorFactory.fromError(error, {
                        operation: 'loadChunk',
                        fileName,
                        url: `${this.basePath}${fileName}`
                    });
                    errorLogger.logVocabularyError(vocabError, 'loadChunk', {
                        fileName,
                        url: `${this.basePath}${fileName}`
                    });
                    loadingStateManager.failChunk(operationId, fileName, vocabError);
                    throw vocabError;
                }
            }
        });
    }
    /**
     * Load vocabulary by CEFR level with enhanced error handling
     * @param level - CEFR level to load
     * @returns Promise resolving to vocabulary entries
     */
    async loadByLevel(level) {
        // Validate level
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!validLevels.includes(level)) {
            throw new ValidationError(`Invalid CEFR level: ${level}`, 'level', level, 'valid CEFR level', validLevels.join(', '));
        }
        const fileName = `${level}.json`;
        return this.loadChunk(fileName);
    }
    /**
     * Load vocabulary by category with enhanced error handling
     * @param category - Category to load
     * @returns Promise resolving to vocabulary entries
     */
    async loadByCategory(category) {
        if (!category || typeof category !== 'string') {
            throw new ValidationError('Category must be a non-empty string', 'category', category, 'non-empty string');
        }
        // Sanitize category name to match file naming convention
        const sanitizedCategory = category
            .toLowerCase()
            .replaceAll(/[^\da-zßäöü]/g, '-')
            .replaceAll(/-+/g, '-')
            .replaceAll(/^-|-$/g, '');
        if (sanitizedCategory.length === 0) {
            throw new ValidationError('Category contains no valid characters', 'category', category, 'category with valid characters');
        }
        const fileName = `${sanitizedCategory}.json`;
        return this.loadChunk(fileName);
    }
    /**
     * Load all vocabulary with enhanced error handling and loading states
     * @returns Promise resolving to all vocabulary entries
     */
    async loadAll() {
        if (!this.index) {
            await this.loadIndex();
        }
        if (!this.index) {
            throw ErrorFactory.network('Vocabulary index not available', { url: `${this.basePath}index.json` });
        }
        const operationId = loadingStateManager.startLoading(this.index.splitFiles.length, 'Loading all vocabulary chunks...');
        try {
            const allEntries = [];
            const loadedIds = new Set();
            let completedChunks = 0;
            // Load each chunk and combine entries, avoiding duplicates
            for (const fileInfo of this.index.splitFiles) {
                try {
                    loadingStateManager.updateStage(operationId, `Loading ${fileInfo.file}...`);
                    const entries = await this.loadChunk(fileInfo.file);
                    for (const entry of entries) {
                        if (!loadedIds.has(entry.id)) {
                            loadedIds.add(entry.id);
                            allEntries.push(entry);
                        }
                    }
                    completedChunks++;
                    loadingStateManager.updateChunkProgress(operationId, fileInfo.file, 100);
                }
                catch (error) {
                    const vocabError = ErrorFactory.fromError(error, {
                        operation: 'loadAll',
                        chunkFile: fileInfo.file
                    });
                    errorLogger.warn('Skipping failed chunk during loadAll', {
                        chunkFile: fileInfo.file,
                        error: vocabError.message
                    }, 'vocabulary-api');
                    loadingStateManager.failChunk(operationId, fileInfo.file, vocabError);
                    // Continue with other chunks unless too many have failed
                    const failedChunks = this.index.splitFiles.length - completedChunks;
                    if (failedChunks > this.index.splitFiles.length * 0.5) {
                        throw new NetworkError(`Too many chunks failed to load (${failedChunks}/${this.index.splitFiles.length})`, undefined, undefined, undefined, false);
                    }
                }
            }
            loadingStateManager.updateStage(operationId, 'Combining vocabulary entries...');
            // Cache the complete vocabulary set
            await memoryManager.set('vocabulary-all', allEntries, 10, {
                type: 'complete',
                entryCount: allEntries.length,
                loadedAt: new Date().toISOString()
            });
            errorLogger.info('All vocabulary chunks loaded successfully', {
                totalEntries: allEntries.length,
                uniqueEntries: allEntries.length
            }, 'vocabulary-api');
            return allEntries;
        }
        catch (error) {
            const vocabError = ErrorFactory.fromError(error, {
                operation: 'loadAll',
                totalChunks: this.index.splitFiles.length
            });
            errorLogger.logVocabularyError(vocabError, 'loadAll', {
                totalChunks: this.index.splitFiles.length
            });
            // Try to return cached data as fallback
            try {
                const cachedAll = await memoryManager.get('vocabulary-all');
                if (cachedAll) {
                    errorLogger.info('Returning cached vocabulary as fallback', {
                        entryCount: cachedAll.length
                    }, 'vocabulary-api');
                    return cachedAll;
                }
            }
            catch (cacheError) {
                errorLogger.warn('Failed to load cached vocabulary', {
                    error: cacheError instanceof Error ? cacheError.message : 'Unknown error'
                }, 'vocabulary-api');
            }
            throw vocabError;
        }
    }
    /**
     * Load vocabulary with filters and enhanced error handling
     * @param filters - Filter criteria
     * @returns Promise resolving to filtered vocabulary entries
     */
    async loadFiltered(filters = {}) {
        try {
            // Validate filters
            if (filters.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(filters.level)) {
                throw new ValidationError(`Invalid level filter: ${filters.level}`, 'level', filters.level, 'valid CEFR level');
            }
            if (filters.search && typeof filters.search !== 'string') {
                throw new ValidationError('Search filter must be a string', 'search', filters.search, 'string');
            }
            const allEntries = await this.loadAll();
            let filtered = allEntries;
            if (filters.level) {
                filtered = filtered.filter(item => item.level === filters.level);
            }
            if (filters.category) {
                filtered = filtered.filter(item => item.category === filters.category);
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(item => item.word.toLowerCase().includes(searchTerm) ||
                    (item.translation && item.translation.toLowerCase().includes(searchTerm)));
            }
            return filtered;
        }
        catch (error) {
            const vocabError = ErrorFactory.fromError(error, {
                operation: 'loadFiltered',
                filters
            });
            throw vocabError;
        }
    }
    /**
     * Get specific vocabulary item by ID with enhanced error handling
     * @param id - Vocabulary item ID
     * @returns Promise resolving to vocabulary item or null if not found
     */
    async getItemById(id) {
        if (!id || typeof id !== 'string') {
            throw new ValidationError('ID must be a non-empty string', 'id', id, 'non-empty string');
        }
        if (!this.index) {
            await this.loadIndex();
        }
        if (!this.index) {
            return null;
        }
        // First check if we have it in loaded chunks
        for (const [, entries] of this.loadedChunks) {
            const item = entries.find(entry => entry.id === id);
            if (item) {
                return item;
            }
        }
        // Search through chunks to find the item
        for (const fileInfo of this.index.splitFiles) {
            try {
                const entries = await this.loadChunk(fileInfo.file);
                const item = entries.find(entry => entry.id === id);
                if (item) {
                    return item;
                }
            }
            catch (error) {
                const vocabError = ErrorFactory.fromError(error, {
                    operation: 'getItemById',
                    itemId: id,
                    chunkFile: fileInfo.file
                });
                errorLogger.warn('Failed to search chunk for item', {
                    chunkFile: fileInfo.file,
                    itemId: id,
                    error: vocabError.message
                }, 'vocabulary-api');
                // Continue searching other chunks
                continue;
            }
        }
        return null;
    }
    /**
     * Get available levels from index
     */
    getAvailableLevels() {
        if (!this.index)
            return [];
        const levels = new Set();
        for (const file of this.index.splitFiles) {
            if (/^(A1|A2|B1|B2)\.json$/.test(file.file)) {
                levels.add(file.file.replace('.json', ''));
            }
        }
        return [...levels];
    }
    /**
     * Get available categories from index
     */
    getAvailableCategories() {
        if (!this.index)
            return [];
        const categories = new Set();
        for (const file of this.index.splitFiles) {
            if (!/^(A1|A2|B1|B2)\.json$/.test(file.file)) {
                for (const cat of file.categories)
                    categories.add(cat);
            }
        }
        return [...categories];
    }
    /**
     * Clear loaded chunks and memory cache with enhanced cleanup
     */
    async clearCache() {
        try {
            // Clear in-memory cache
            this.loadedChunks.clear();
            // Clear memory manager cache
            await memoryManager.clear();
            errorLogger.info('All caches cleared successfully', {}, 'vocabulary-api');
        }
        catch (error) {
            const vocabError = ErrorFactory.fromError(error, {
                operation: 'clearCache'
            });
            errorLogger.logVocabularyError(vocabError, 'clearCache', {});
            throw vocabError;
        }
    }
    /**
     * Get comprehensive memory and performance statistics
     * @returns Detailed statistics object
     */
    getMemoryStats() {
        let totalEntries = 0;
        let cacheSizeKB = 0;
        for (const entries of this.loadedChunks.values()) {
            totalEntries += entries.length;
            // Rough estimate: 1KB per entry
            cacheSizeKB += entries.length;
        }
        return {
            loadedChunks: this.loadedChunks.size,
            totalEntries,
            cacheSizeKB,
            memoryStats: memoryManager.getStatistics(),
            networkStats: networkManager.getStatistics(),
            connectivityStatus: connectivityManager.getStatus(),
            indexLoaded: !!this.index
        };
    }
    /**
     * Perform health check on vocabulary API
     * @returns Promise resolving to health check result
     */
    async performHealthCheck() {
        const issues = [];
        const recommendations = [];
        const details = {
            indexLoaded: !!this.index,
            loadedChunks: this.loadedChunks.size,
            memoryStats: memoryManager.getStatistics(),
            connectivityStatus: connectivityManager.getStatus()
        };
        // Check index
        if (!this.index) {
            issues.push('Vocabulary index not loaded');
            recommendations.push('Try reloading the application');
        }
        // Check connectivity
        if (!details.connectivityStatus.online) {
            issues.push('Currently offline');
            recommendations.push('Some features may be limited until connection is restored');
        }
        // Check memory pressure
        if (details.memoryStats.pressure === 'high' || details.memoryStats.pressure === 'critical') {
            issues.push(`High memory pressure: ${details.memoryStats.pressure}`);
            recommendations.push('Consider clearing cache or restarting application');
        }
        // Check if chunks are loaded
        if (this.loadedChunks.size === 0 && this.index) {
            issues.push('No vocabulary chunks loaded');
            recommendations.push('Try loading vocabulary data');
        }
        return {
            healthy: issues.length === 0,
            issues,
            recommendations,
            details
        };
    }
    /**
     * Preload commonly used chunks for better performance
     * @param chunkNames - Array of chunk names to preload
     * @returns Promise resolving when preloading is complete
     */
    async preloadChunks(chunkNames) {
        if (!this.index) {
            await this.loadIndex();
        }
        const operationId = loadingStateManager.startLoading(chunkNames.length, 'Preloading vocabulary chunks...');
        try {
            const preloadPromises = chunkNames.map(async (chunkName) => {
                try {
                    await this.loadChunk(chunkName);
                    loadingStateManager.updateChunkProgress(operationId, chunkName, 100);
                }
                catch (error) {
                    errorLogger.warn('Failed to preload chunk', {
                        chunkName,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }, 'vocabulary-api');
                    loadingStateManager.failChunk(operationId, chunkName, ErrorFactory.fromError(error));
                }
            });
            await Promise.allSettled(preloadPromises);
            errorLogger.info('Chunk preloading completed', {
                totalChunks: chunkNames.length
            }, 'vocabulary-api');
        }
        catch (error) {
            errorLogger.error('Chunk preloading failed', undefined, {
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 'vocabulary-api');
        }
    }
    /**
     * Get metadata for all available vocabulary chunks
     * @returns Array of vocabulary chunk metadata
     */
    getMetadata() {
        if (!this.index) {
            return [];
        }
        return this.index.splitFiles.map(file => ({
            name: file.file,
            level: this.extractLevelFromFileName(file.file),
            category: this.extractCategoryFromFileName(file.file),
            count: file.entryCount,
            size: file.sizeKB,
            lastModified: Date.now() // This would be enhanced with actual file timestamps
        }));
    }
    /**
     * Check if vocabulary API is currently loading
     * @returns Whether API is loading
     */
    isLoading() {
        return loadingStateManager.isLoading();
    }
    /**
     * Get current loading state
     * @returns Current loading state
     */
    getProgress() {
        const progress = loadingStateManager.getCurrentProgress();
        return {
            isLoading: progress?.isLoading || false,
            progress: progress?.percentage || 0,
            totalChunks: progress?.totalChunks || 0,
            loadedChunks: progress?.completedChunks || 0,
            currentChunk: progress?.currentChunk || '',
            error: progress?.error?.message || null
        };
    }
    /**
     * Extract CEFR level from filename
     * @param fileName - File name to extract level from
     * @returns CEFR level or empty string
     */
    extractLevelFromFileName(fileName) {
        const levelMatch = fileName.match(/^(A1|A2|B1|B2|C1|C2)/);
        return levelMatch ? levelMatch[1] : '';
    }
    /**
     * Extract category from filename
     * @param fileName - File name to extract category from
     * @returns Category name or empty string
     */
    extractCategoryFromFileName(fileName) {
        // Remove level prefix and extension to get category
        const withoutLevel = fileName.replace(/^(A1|A2|B1|B2|C1|C2)-?/, '');
        const withoutExtension = withoutLevel.replace(/\.json$/, '');
        // Convert filename format back to readable category name
        return withoutExtension
            .replaceAll('-', ' ')
            .replaceAll(/\b\w/g, l => l.toUpperCase());
    }
}
// Create singleton instance
const vocabularyAPI = new VocabularyAPI();
// Export for use in other modules
export { vocabularyAPI, VocabularyAPI };
export default vocabularyAPI;
//# sourceMappingURL=vocabulary-api.js.map