/**
 * Loading Integration Module
 * Provides integration between vocabulary operations and loading UI
 * Demonstrates how to use the loading system with real vocabulary operations
 * @since 1.0.0
 */
import { vocabularyAPI } from './vocabulary-api.js';
import { loadingUIManager } from './loading-ui-manager.js';
import { errorLogger } from './error-logger.js';
/**
 * Loading Integration Class
 * Integrates vocabulary operations with loading UI components
 */
export class LoadingIntegration {
    constructor(options = {}) {
        this.activeLoadings = new Map(); // operationId -> componentId
        this.options = {
            showProgressBars: true,
            showToasts: true,
            showModals: true,
            modalThreshold: 3000, // Show modal for operations longer than 3 seconds
            ...options
        };
        this.initializeEventListeners();
        errorLogger.info('LoadingIntegration initialized', {
            component: 'loading-integration',
            options: this.options
        });
    }
    /**
     * Load vocabulary with loading UI
     * @param level - CEFR level to load
     * @param category - Category to load
     * @returns Promise resolving to vocabulary entries
     */
    async loadVocabularyWithUI(level, category) {
        const operationId = `load-vocab-${Date.now()}`;
        let modalElement = null;
        let progressBarComponent = null;
        try {
            errorLogger.info('Starting vocabulary load with UI', {
                operationId,
                level,
                category
            }, 'loading-integration');
            // Show toast notification
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Loading vocabulary${level ? ` (${level})` : ''}${category ? ` - ${category}` : ''}...`, 'info', 5000);
            }
            // Create progress bar component
            if (this.options.showProgressBars) {
                progressBarComponent = loadingUIManager.createComponent(operationId, 'progress-bar', document.querySelector('#loading-container') || undefined);
                loadingUIManager.showComponent(progressBarComponent.id);
            }
            // Show modal for potentially long operations
            if (this.options.showModals) {
                modalElement = loadingUIManager.showModal(`Loading vocabulary${level ? ` (${level})` : ''}${category ? ` - ${category}` : ''}...`, {
                    showProgress: true,
                    allowCancel: true,
                    onCancel: () => {
                        errorLogger.info('User cancelled vocabulary load', {
                            operationId
                        }, 'loading-integration');
                    }
                });
            }
            // Track the loading
            this.activeLoadings.set(operationId, progressBarComponent?.id || '');
            // Load vocabulary
            const startTime = Date.now();
            const vocabulary = await vocabularyAPI.loadFiltered({ level, category });
            const loadTime = Date.now() - startTime;
            errorLogger.info('Vocabulary load completed with UI', {
                operationId,
                loadTime,
                entryCount: vocabulary.length
            }, 'loading-integration');
            // Hide modal
            if (modalElement) {
                loadingUIManager.hideModal(modalElement);
            }
            // Show success toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Loaded ${vocabulary.length} vocabulary entries successfully`, 'success', 3000);
            }
            return vocabulary;
        }
        catch (error) {
            errorLogger.logVocabularyError(error instanceof Error ? error : new Error('Unknown error'), 'loadVocabularyWithUI', {
                operationId,
                level,
                category
            });
            // Hide modal
            if (modalElement) {
                loadingUIManager.hideModal(modalElement);
            }
            // Show error toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Failed to load vocabulary: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 5000);
            }
            throw error;
        }
        finally {
            // Clean up
            this.activeLoadings.delete(operationId);
            if (progressBarComponent) {
                setTimeout(() => {
                    loadingUIManager.destroyComponent(progressBarComponent.id);
                }, 1000);
            }
        }
    }
    /**
     * Preload chunks with loading UI
     * @param chunkNames - Array of chunk names to preload
     * @returns Promise resolving when preloading is complete
     */
    async preloadChunksWithUI(chunkNames) {
        const operationId = `preload-chunks-${Date.now()}`;
        let modalElement = null;
        let progressBarComponent = null;
        try {
            errorLogger.info('Starting chunk preloading with UI', {
                operationId,
                chunkCount: chunkNames.length
            }, 'loading-integration');
            // Show toast notification
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Preloading ${chunkNames.length} vocabulary chunks...`, 'info', 5000);
            }
            // Create progress bar component
            if (this.options.showProgressBars) {
                progressBarComponent = loadingUIManager.createComponent(operationId, 'progress-bar', document.querySelector('#loading-container') || undefined);
                loadingUIManager.showComponent(progressBarComponent.id);
            }
            // Show modal for preloading
            if (this.options.showModals) {
                modalElement = loadingUIManager.showModal(`Preloading ${chunkNames.length} vocabulary chunks...`, {
                    showProgress: true,
                    allowCancel: false
                });
            }
            // Track the loading
            this.activeLoadings.set(operationId, progressBarComponent?.id || '');
            // Preload chunks
            const startTime = Date.now();
            await vocabularyAPI.preloadChunks(chunkNames);
            const loadTime = Date.now() - startTime;
            errorLogger.info('Chunk preloading completed with UI', {
                operationId,
                loadTime,
                chunkCount: chunkNames.length
            }, 'loading-integration');
            // Hide modal
            if (modalElement) {
                loadingUIManager.hideModal(modalElement);
            }
            // Show success toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Preloaded ${chunkNames.length} chunks successfully`, 'success', 3000);
            }
        }
        catch (error) {
            errorLogger.error('Chunk preloading failed with UI', error instanceof Error ? error : undefined, {
                operationId,
                chunkCount: chunkNames.length
            }, 'loading-integration');
            // Hide modal
            if (modalElement) {
                loadingUIManager.hideModal(modalElement);
            }
            // Show error toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Failed to preload chunks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 5000);
            }
            throw error;
        }
        finally {
            // Clean up
            this.activeLoadings.delete(operationId);
            if (progressBarComponent) {
                setTimeout(() => {
                    loadingUIManager.destroyComponent(progressBarComponent.id);
                }, 1000);
            }
        }
    }
    /**
     * Get vocabulary statistics with loading UI
     * @returns Promise resolving to vocabulary statistics
     */
    async getStatisticsWithUI() {
        const operationId = `get-stats-${Date.now()}`;
        let spinnerComponent = null;
        try {
            errorLogger.info('Getting statistics with UI', {
                operationId
            }, 'loading-integration');
            // Create spinner component
            if (this.options.showProgressBars) {
                spinnerComponent = loadingUIManager.createComponent(operationId, 'spinner', document.querySelector('#loading-container') || undefined);
                loadingUIManager.showComponent(spinnerComponent.id);
            }
            // Track the loading
            this.activeLoadings.set(operationId, spinnerComponent?.id || '');
            // Get statistics
            const startTime = Date.now();
            const stats = vocabularyAPI.getMemoryStats();
            const loadTime = Date.now() - startTime;
            errorLogger.info('Statistics retrieved with UI', {
                operationId,
                loadTime,
                stats
            }, 'loading-integration');
            return stats;
        }
        catch (error) {
            errorLogger.error('Failed to get statistics with UI', error instanceof Error ? error : undefined, {
                operationId
            }, 'loading-integration');
            // Show error toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 3000);
            }
            throw error;
        }
        finally {
            // Clean up
            this.activeLoadings.delete(operationId);
            if (spinnerComponent) {
                setTimeout(() => {
                    loadingUIManager.destroyComponent(spinnerComponent.id);
                }, 500);
            }
        }
    }
    /**
     * Clear cache with loading UI
     * @returns Promise resolving when cache is cleared
     */
    async clearCacheWithUI() {
        const operationId = `clear-cache-${Date.now()}`;
        let spinnerComponent = null;
        try {
            errorLogger.info('Clearing cache with UI', {
                operationId
            }, 'loading-integration');
            // Show toast notification
            if (this.options.showToasts) {
                loadingUIManager.showToast('Clearing vocabulary cache...', 'info', 3000);
            }
            // Create spinner component
            if (this.options.showProgressBars) {
                spinnerComponent = loadingUIManager.createComponent(operationId, 'spinner', document.querySelector('#loading-container') || undefined);
                loadingUIManager.showComponent(spinnerComponent.id);
            }
            // Track the loading
            this.activeLoadings.set(operationId, spinnerComponent?.id || '');
            // Clear cache
            const startTime = Date.now();
            await vocabularyAPI.clearCache();
            const loadTime = Date.now() - startTime;
            errorLogger.info('Cache cleared with UI', {
                operationId,
                loadTime
            }, 'loading-integration');
            // Show success toast
            if (this.options.showToasts) {
                loadingUIManager.showToast('Cache cleared successfully', 'success', 3000);
            }
        }
        catch (error) {
            errorLogger.error('Failed to clear cache with UI', error instanceof Error ? error : undefined, {
                operationId
            }, 'loading-integration');
            // Show error toast
            if (this.options.showToasts) {
                loadingUIManager.showToast(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 3000);
            }
            throw error;
        }
        finally {
            // Clean up
            this.activeLoadings.delete(operationId);
            if (spinnerComponent) {
                setTimeout(() => {
                    loadingUIManager.destroyComponent(spinnerComponent.id);
                }, 500);
            }
        }
    }
    /**
     * Get active loading operations
     * @returns Array of active operation IDs
     */
    getActiveLoadings() {
        return [...this.activeLoadings.keys()];
    }
    /**
     * Cancel an active loading operation
     * @param operationId - Operation ID to cancel
     * @returns Whether operation was cancelled
     */
    cancelLoading(operationId) {
        const componentId = this.activeLoadings.get(operationId);
        if (!componentId) {
            return false;
        }
        try {
            // Destroy the loading component
            loadingUIManager.destroyComponent(componentId);
            // Remove from active loadings
            this.activeLoadings.delete(operationId);
            errorLogger.info('Loading operation cancelled', {
                operationId
            }, 'loading-integration');
            return true;
        }
        catch (error) {
            errorLogger.error('Failed to cancel loading operation', error instanceof Error ? error : undefined, {
                operationId
            }, 'loading-integration');
            return false;
        }
    }
    /**
     * Cancel all active loading operations
     * @returns Number of operations cancelled
     */
    cancelAllLoadings() {
        const operationIds = [...this.activeLoadings.keys()];
        let cancelledCount = 0;
        for (const operationId of operationIds) {
            if (this.cancelLoading(operationId)) {
                cancelledCount++;
            }
        }
        errorLogger.info('All loading operations cancelled', {
            totalOperations: operationIds.length,
            cancelledCount
        }, 'loading-integration');
        return cancelledCount;
    }
    /**
     * Get integration statistics
     * @returns Integration statistics
     */
    getStatistics() {
        return {
            activeLoadings: this.activeLoadings.size,
            totalOperations: this.activeLoadings.size, // TODO: Track total operations over time
            averageLoadTime: 0 // TODO: Track load times
        };
    }
    /**
     * Clean up all resources
     */
    destroy() {
        try {
            // Cancel all active loadings
            this.cancelAllLoadings();
            errorLogger.info('LoadingIntegration destroyed', {}, 'loading-integration');
        }
        catch (error) {
            errorLogger.error('Error during LoadingIntegration cleanup', error instanceof Error ? error : undefined, {}, 'loading-integration');
        }
    }
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Subscribe to loading UI events
        loadingUIManager.subscribe('component-created', (event) => {
            errorLogger.debug('Loading UI component created', {
                componentId: event.detail.componentId,
                operationId: event.detail.operationId
            }, 'loading-integration');
        });
        loadingUIManager.subscribe('component-updated', (event) => {
            errorLogger.debug('Loading UI component updated', {
                componentId: event.detail.componentId,
                operationId: event.detail.operationId,
                eventType: event.detail.eventType
            }, 'loading-integration');
        });
        loadingUIManager.subscribe('ui-error', (event) => {
            errorLogger.error('Loading UI error occurred', undefined, {
                error: event.detail.error,
                operationId: event.detail.operationId
            }, 'loading-integration');
        });
    }
}
// Create singleton instance
export const loadingIntegration = new LoadingIntegration();
export default loadingIntegration;
//# sourceMappingURL=loading-integration.js.map