/**
 * Loading State Management System
 * Provides comprehensive progress tracking and state management for vocabulary operations
 * @since 1.0.0
 */
import { ErrorFactory } from './error-types.js';
/**
 * Loading State Manager
 * Manages loading states for vocabulary operations with progress tracking and event emission
 */
export class LoadingStateManager {
    /**
     * Create a new loading state manager
     * @param options - Configuration options
     */
    constructor(options = {}) {
        this.operations = new Map();
        this.listeners = new Set();
        this.operationCounter = 0;
        this.cleanupTimers = new Map();
        this.options = {
            maxConcurrentOperations: 5,
            defaultTimeout: 30000,
            autoCleanup: true,
            cleanupDelay: 5000,
            enableLogging: false,
            ...options
        };
    }
    /**
     * Start a new loading operation
     * @param totalChunks - Total number of chunks to load
     * @param stage - Initial stage description
     * @param metadata - Operation metadata
     * @returns Operation identifier
     */
    startLoading(totalChunks, stage = 'Loading vocabulary data...', metadata) {
        const operationId = this.generateOperationId();
        const chunks = new Map();
        for (let i = 0; i < totalChunks; i++) {
            const chunkId = `${operationId}-chunk-${i}`;
            chunks.set(chunkId, {
                id: chunkId,
                status: 'pending',
                progress: 0,
                retryCount: 0,
                startTime: new Date()
            });
        }
        const operation = {
            id: operationId,
            status: 'loading',
            progress: 0,
            stage,
            startTime: new Date(),
            chunks,
            totalChunks,
            completedChunks: 0,
            failedChunks: 0,
            metadata
        };
        this.operations.set(operationId, operation);
        this.emitEvent({
            type: 'loading-started',
            operationId,
            progress: 0,
            stage,
            timestamp: new Date(),
            data: { totalChunks }
        });
        this.log(`Started loading operation ${operationId} with ${totalChunks} chunks`);
        return operationId;
    }
    /**
     * Start loading a specific chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param metadata - Chunk metadata
     */
    startChunk(operationId, chunkId, metadata) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            throw ErrorFactory.validation(`Operation ${operationId} not found`, { operationId });
        }
        const chunk = operation.chunks.get(chunkId);
        if (!chunk) {
            throw ErrorFactory.validation(`Chunk ${chunkId} not found in operation ${operationId}`, {
                operationId,
                chunkId
            });
        }
        chunk.status = 'loading';
        chunk.startTime = new Date();
        chunk.metadata = metadata;
        this.emitEvent({
            type: 'chunk-started',
            operationId,
            chunkId,
            timestamp: new Date(),
            data: metadata
        });
        this.log(`Started loading chunk ${chunkId} for operation ${operationId}`);
    }
    /**
     * Update progress for a chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param progress - Progress percentage (0-100)
     * @param estimatedTimeRemaining - Estimated time remaining in milliseconds
     */
    updateChunkProgress(operationId, chunkId, progress, estimatedTimeRemaining) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        const chunk = operation.chunks.get(chunkId);
        if (!chunk)
            return;
        const oldProgress = chunk.progress;
        chunk.progress = Math.max(0, Math.min(100, progress));
        chunk.estimatedTimeRemaining = estimatedTimeRemaining;
        // Update overall operation progress
        this.updateOperationProgress(operationId);
        // Only emit event if progress changed significantly
        if (Math.abs(chunk.progress - oldProgress) >= 1) {
            this.emitEvent({
                type: 'chunk-progress',
                operationId,
                chunkId,
                progress: chunk.progress,
                timestamp: new Date(),
                data: { estimatedTimeRemaining }
            });
            this.emitEvent({
                type: 'loading-progress',
                operationId,
                progress: operation.progress,
                stage: operation.stage,
                timestamp: new Date()
            });
        }
    }
    /**
     * Mark a chunk as completed
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param size - Chunk size in bytes
     */
    completeChunk(operationId, chunkId, size) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        const chunk = operation.chunks.get(chunkId);
        if (!chunk)
            return;
        chunk.status = 'completed';
        chunk.progress = 100;
        chunk.endTime = new Date();
        chunk.size = size;
        chunk.estimatedTimeRemaining = 0;
        operation.completedChunks++;
        this.updateOperationProgress(operationId);
        this.emitEvent({
            type: 'chunk-completed',
            operationId,
            chunkId,
            progress: 100,
            timestamp: new Date(),
            data: { size, duration: chunk.endTime.getTime() - chunk.startTime.getTime() }
        });
        this.emitEvent({
            type: 'loading-progress',
            operationId,
            progress: operation.progress,
            stage: operation.stage,
            timestamp: new Date()
        });
        // Check if operation is complete
        if (operation.completedChunks === operation.totalChunks) {
            this.completeOperation(operationId);
        }
        this.log(`Completed chunk ${chunkId} for operation ${operationId}`);
    }
    /**
     * Mark a chunk as failed
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param error - Error that caused failure
     * @param canRetry - Whether the chunk can be retried
     */
    failChunk(operationId, chunkId, error, canRetry = true) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        const chunk = operation.chunks.get(chunkId);
        if (!chunk)
            return;
        chunk.status = canRetry ? 'failed' : 'failed';
        chunk.error = error;
        chunk.endTime = new Date();
        chunk.estimatedTimeRemaining = 0;
        operation.failedChunks++;
        this.updateOperationProgress(operationId);
        this.emitEvent({
            type: 'chunk-failed',
            operationId,
            chunkId,
            error,
            timestamp: new Date(),
            data: { canRetry, retryCount: chunk.retryCount }
        });
        // Check if operation has failed completely
        if (operation.failedChunks > operation.totalChunks * 0.5) {
            this.failOperation(operationId, ErrorFactory.fromError(new Error(`Too many chunks failed (${operation.failedChunks}/${operation.totalChunks})`), { component: 'loading-state-manager' }));
        }
        this.log(`Failed chunk ${chunkId} for operation ${operationId}: ${error.message}`);
    }
    /**
     * Retry a failed chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     */
    retryChunk(operationId, chunkId) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        const chunk = operation.chunks.get(chunkId);
        if (!chunk)
            return;
        chunk.status = 'retrying';
        chunk.retryCount++;
        chunk.error = undefined;
        chunk.startTime = new Date();
        chunk.progress = 0;
        operation.failedChunks = Math.max(0, operation.failedChunks - 1);
        this.updateOperationProgress(operationId);
        this.emitEvent({
            type: 'chunk-retrying',
            operationId,
            chunkId,
            timestamp: new Date(),
            data: { retryCount: chunk.retryCount }
        });
        this.log(`Retrying chunk ${chunkId} for operation ${operationId} (attempt ${chunk.retryCount})`);
    }
    /**
     * Update the overall operation stage
     * @param operationId - Operation identifier
     * @param stage - New stage description
     */
    updateStage(operationId, stage) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        operation.stage = stage;
        this.emitEvent({
            type: 'loading-progress',
            operationId,
            progress: operation.progress,
            stage,
            timestamp: new Date()
        });
        this.log(`Updated stage for operation ${operationId}: ${stage}`);
    }
    /**
     * Cancel a loading operation
     * @param operationId - Operation identifier
     * @param reason - Cancellation reason
     */
    cancelOperation(operationId, reason = 'Operation cancelled by user') {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        operation.status = 'cancelled';
        operation.endTime = new Date();
        // Cancel all pending chunks
        for (const chunk of operation.chunks.values()) {
            if (chunk.status === 'pending' || chunk.status === 'loading' || chunk.status === 'retrying') {
                chunk.status = 'cancelled';
                chunk.endTime = new Date();
            }
        }
        this.emitEvent({
            type: 'loading-cancelled',
            operationId,
            timestamp: new Date(),
            data: { reason }
        });
        this.scheduleCleanup(operationId);
        this.log(`Cancelled operation ${operationId}: ${reason}`);
    }
    /**
     * Get the current state of an operation
     * @param operationId - Operation identifier
     * @returns Current loading state or undefined if not found
     */
    getOperationState(operationId) {
        return this.operations.get(operationId);
    }
    /**
     * Get the current state of a chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @returns Chunk state or undefined if not found
     */
    getChunkState(operationId, chunkId) {
        const operation = this.operations.get(operationId);
        return operation?.chunks.get(chunkId);
    }
    /**
     * Get all active operations
     * @returns Array of active operation states
     */
    getActiveOperations() {
        return [...this.operations.values()].filter(op => op.status === 'loading');
    }
    /**
     * Subscribe to loading state events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Unsubscribe from loading state events
     * @param listener - Event listener function
     */
    unsubscribe(listener) {
        this.listeners.delete(listener);
    }
    /**
     * Clear all operations (useful for testing or reset)
     */
    clearAll() {
        this.operations.clear();
        for (const timer of this.cleanupTimers)
            clearTimeout(timer);
        this.cleanupTimers.clear();
        this.log('Cleared all loading operations');
    }
    /**
     * Get statistics about loading operations
     * @returns Loading statistics
     */
    getStatistics() {
        const operations = [...this.operations.values()];
        const active = operations.filter(op => op.status === 'loading');
        const completed = operations.filter(op => op.status === 'completed');
        const failed = operations.filter(op => op.status === 'failed');
        const completedOperations = completed.filter(op => op.endTime);
        const totalLoadTime = completedOperations.reduce((sum, op) => sum + (op.endTime.getTime() - op.startTime.getTime()), 0);
        const averageLoadTime = completedOperations.length > 0 ?
            totalLoadTime / completedOperations.length : 0;
        const totalFinished = completed.length + failed.length;
        const successRate = totalFinished > 0 ? completed.length / totalFinished : 0;
        return {
            totalOperations: operations.length,
            activeOperations: active.length,
            completedOperations: completed.length,
            failedOperations: failed.length,
            averageLoadTime,
            successRate
        };
    }
    /**
     * Update overall operation progress based on chunk progress
     * @param operationId - Operation identifier
     */
    updateOperationProgress(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        let totalProgress = 0;
        let totalEstimatedTime = 0;
        let activeChunks = 0;
        for (const chunk of operation.chunks.values()) {
            totalProgress += chunk.progress;
            if (chunk.estimatedTimeRemaining) {
                totalEstimatedTime += chunk.estimatedTimeRemaining;
                activeChunks++;
            }
        }
        operation.progress = operation.totalChunks > 0 ?
            Math.round(totalProgress / operation.totalChunks) : 0;
        if (activeChunks > 0) {
            operation.estimatedTimeRemaining = totalEstimatedTime / activeChunks;
        }
    }
    /**
     * Complete an operation successfully
     * @param operationId - Operation identifier
     */
    completeOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        operation.status = 'completed';
        operation.progress = 100;
        operation.endTime = new Date();
        operation.estimatedTimeRemaining = 0;
        this.emitEvent({
            type: 'loading-completed',
            operationId,
            progress: 100,
            timestamp: new Date(),
            data: {
                duration: operation.endTime.getTime() - operation.startTime.getTime(),
                totalChunks: operation.totalChunks,
                failedChunks: operation.failedChunks
            }
        });
        this.scheduleCleanup(operationId);
        this.log(`Completed operation ${operationId} in ${operation.endTime.getTime() - operation.startTime.getTime()}ms`);
    }
    /**
     * Fail an operation due to error
     * @param operationId - Operation identifier
     * @param error - Error that caused failure
     */
    failOperation(operationId, error) {
        const operation = this.operations.get(operationId);
        if (!operation)
            return;
        operation.status = 'failed';
        operation.endTime = new Date();
        // Mark all pending chunks as failed
        for (const chunk of operation.chunks.values()) {
            if (chunk.status === 'pending' || chunk.status === 'loading' || chunk.status === 'retrying') {
                chunk.status = 'failed';
                chunk.endTime = new Date();
                chunk.error = error;
            }
        }
        this.emitEvent({
            type: 'loading-failed',
            operationId,
            error,
            timestamp: new Date(),
            data: {
                duration: operation.endTime.getTime() - operation.startTime.getTime(),
                completedChunks: operation.completedChunks,
                failedChunks: operation.failedChunks
            }
        });
        this.scheduleCleanup(operationId);
        this.log(`Failed operation ${operationId}: ${error.message}`);
    }
    /**
     * Schedule cleanup of a completed operation
     * @param operationId - Operation identifier
     */
    scheduleCleanup(operationId) {
        if (!this.options.autoCleanup)
            return;
        const timer = window.setTimeout(() => {
            this.operations.delete(operationId);
            this.cleanupTimers.delete(operationId);
            this.log(`Cleaned up operation ${operationId}`);
        }, this.options.cleanupDelay);
        this.cleanupTimers.set(operationId, timer);
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
                console.error('Error in loading state event listener:', error);
            }
        }
    }
    /**
     * Generate a unique operation identifier
     * @returns Unique operation ID
     */
    generateOperationId() {
        return `vocab-load-${++this.operationCounter}-${Date.now()}`;
    }
    /**
     * Log message if logging is enabled
     * @param message - Message to log
     */
    log(message) {
        if (this.options.enableLogging) {
            console.log(`[LoadingStateManager] ${message}`);
        }
    }
}
// Create singleton instance
export const loadingStateManager = new LoadingStateManager({
    enableLogging: process.env.NODE_ENV === 'development'
});
export default loadingStateManager;
//# sourceMappingURL=loading-state-manager.js.map