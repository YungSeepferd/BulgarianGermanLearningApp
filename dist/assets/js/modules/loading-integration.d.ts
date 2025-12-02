/**
 * Loading Integration Module
 * Provides integration between vocabulary operations and loading UI
 * Demonstrates how to use the loading system with real vocabulary operations
 * @since 1.0.0
 */
/**
 * Loading integration options
 */
export interface LoadingIntegrationOptions {
    /** Whether to show progress bars for vocabulary operations */
    showProgressBars?: boolean;
    /** Whether to show toast notifications */
    showToasts?: boolean;
    /** Whether to show modal overlays for long operations */
    showModals?: boolean;
    /** Minimum duration in milliseconds to show modal */
    modalThreshold?: number;
}
/**
 * Loading Integration Class
 * Integrates vocabulary operations with loading UI components
 */
export declare class LoadingIntegration {
    private options;
    private activeLoadings;
    constructor(options?: LoadingIntegrationOptions);
    /**
     * Load vocabulary with loading UI
     * @param level - CEFR level to load
     * @param category - Category to load
     * @returns Promise resolving to vocabulary entries
     */
    loadVocabularyWithUI(level?: string, category?: string): Promise<any[]>;
    /**
     * Preload chunks with loading UI
     * @param chunkNames - Array of chunk names to preload
     * @returns Promise resolving when preloading is complete
     */
    preloadChunksWithUI(chunkNames: string[]): Promise<void>;
    /**
     * Get vocabulary statistics with loading UI
     * @returns Promise resolving to vocabulary statistics
     */
    getStatisticsWithUI(): Promise<any>;
    /**
     * Clear cache with loading UI
     * @returns Promise resolving when cache is cleared
     */
    clearCacheWithUI(): Promise<void>;
    /**
     * Get active loading operations
     * @returns Array of active operation IDs
     */
    getActiveLoadings(): string[];
    /**
     * Cancel an active loading operation
     * @param operationId - Operation ID to cancel
     * @returns Whether operation was cancelled
     */
    cancelLoading(operationId: string): boolean;
    /**
     * Cancel all active loading operations
     * @returns Number of operations cancelled
     */
    cancelAllLoadings(): number;
    /**
     * Get integration statistics
     * @returns Integration statistics
     */
    getStatistics(): {
        activeLoadings: number;
        totalOperations: number;
        averageLoadTime: number;
    };
    /**
     * Clean up all resources
     */
    destroy(): void;
    /**
     * Initialize event listeners
     */
    private initializeEventListeners;
}
export declare const loadingIntegration: LoadingIntegration;
export default loadingIntegration;
//# sourceMappingURL=loading-integration.d.ts.map