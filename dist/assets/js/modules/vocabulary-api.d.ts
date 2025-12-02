/**
 * Modular Vocabulary API
 * Provides lazy-loading capabilities for split vocabulary data
 * Enhanced with structured error handling, loading states, and network resilience
 * Maintains backward compatibility with existing loading patterns
 * @since 1.0.0
 */
import type { VocabularyItem, VocabularyLoadingState, VocabularyChunkMetadata } from '../types.js';
interface VocabularyEntry extends VocabularyItem {
}
declare class VocabularyAPI {
    private loadedChunks;
    private index;
    private basePath;
    private retryStrategy;
    private maxRetries;
    private defaultTimeout;
    constructor();
    /**
     * Load the vocabulary index with enhanced error handling and loading states
     */
    private loadIndex;
    /**
     * Initialize event listeners for loading state management
     */
    private initializeEventListeners;
    /**
     * Handle loading state events
     * @param event - Loading event
     */
    private handleLoadingEvent;
    /**
     * Validate vocabulary index structure
     * @param index - Index data to validate
     * @returns Whether index is valid
     */
    private validateIndex;
    /**
     * Load a specific vocabulary chunk by file name with enhanced error handling and loading states
     * @param fileName - Name of the chunk file to load
     * @returns Promise resolving to vocabulary entries
     */
    loadChunk(fileName: string): Promise<VocabularyEntry[]>;
    /**
     * Load vocabulary by CEFR level with enhanced error handling
     * @param level - CEFR level to load
     * @returns Promise resolving to vocabulary entries
     */
    loadByLevel(level: string): Promise<VocabularyEntry[]>;
    /**
     * Load vocabulary by category with enhanced error handling
     * @param category - Category to load
     * @returns Promise resolving to vocabulary entries
     */
    loadByCategory(category: string): Promise<VocabularyEntry[]>;
    /**
     * Load all vocabulary with enhanced error handling and loading states
     * @returns Promise resolving to all vocabulary entries
     */
    loadAll(): Promise<VocabularyEntry[]>;
    /**
     * Load vocabulary with filters and enhanced error handling
     * @param filters - Filter criteria
     * @returns Promise resolving to filtered vocabulary entries
     */
    loadFiltered(filters?: {
        level?: string;
        category?: string;
        search?: string;
    }): Promise<VocabularyEntry[]>;
    /**
     * Get specific vocabulary item by ID with enhanced error handling
     * @param id - Vocabulary item ID
     * @returns Promise resolving to vocabulary item or null if not found
     */
    getItemById(id: string): Promise<VocabularyEntry | null>;
    /**
     * Get available levels from index
     */
    getAvailableLevels(): string[];
    /**
     * Get available categories from index
     */
    getAvailableCategories(): string[];
    /**
     * Clear loaded chunks and memory cache with enhanced cleanup
     */
    clearCache(): Promise<void>;
    /**
     * Get comprehensive memory and performance statistics
     * @returns Detailed statistics object
     */
    getMemoryStats(): {
        loadedChunks: number;
        totalEntries: number;
        cacheSizeKB: number;
        memoryStats: any;
        networkStats: any;
        connectivityStatus: any;
        indexLoaded: boolean;
    };
    /**
     * Perform health check on vocabulary API
     * @returns Promise resolving to health check result
     */
    performHealthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        recommendations: string[];
        details: any;
    }>;
    /**
     * Preload commonly used chunks for better performance
     * @param chunkNames - Array of chunk names to preload
     * @returns Promise resolving when preloading is complete
     */
    preloadChunks(chunkNames: string[]): Promise<void>;
    /**
     * Get metadata for all available vocabulary chunks
     * @returns Array of vocabulary chunk metadata
     */
    getMetadata(): VocabularyChunkMetadata[];
    /**
     * Check if vocabulary API is currently loading
     * @returns Whether API is loading
     */
    isLoading(): boolean;
    /**
     * Get current loading state
     * @returns Current loading state
     */
    getProgress(): VocabularyLoadingState;
    /**
     * Extract CEFR level from filename
     * @param fileName - File name to extract level from
     * @returns CEFR level or empty string
     */
    private extractLevelFromFileName;
    /**
     * Extract category from filename
     * @param fileName - File name to extract category from
     * @returns Category name or empty string
     */
    private extractCategoryFromFileName;
}
declare const vocabularyAPI: VocabularyAPI;
export { vocabularyAPI, VocabularyAPI, VocabularyEntry };
export default vocabularyAPI;
//# sourceMappingURL=vocabulary-api.d.ts.map