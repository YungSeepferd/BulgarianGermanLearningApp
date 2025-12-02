/**
 * Loading State Management System
 * Provides comprehensive progress tracking and state management for vocabulary operations
 * @since 1.0.0
 */
import { VocabularyError } from './error-types.js';
/**
 * Loading status for individual chunks
 */
export type ChunkStatus = 'pending' | 'loading' | 'completed' | 'failed' | 'retrying' | 'cancelled';
/**
 * Overall loading operation status
 */
export type LoadingStatus = 'idle' | 'loading' | 'completed' | 'failed' | 'cancelled';
/**
 * Individual chunk loading state
 */
export interface ChunkLoadingState {
    /** Unique chunk identifier */
    id: string;
    /** Current loading status */
    status: ChunkStatus;
    /** Progress percentage (0-100) */
    progress: number;
    /** Error if chunk failed */
    error?: VocabularyError;
    /** Number of retry attempts */
    retryCount: number;
    /** When chunk loading started */
    startTime: Date;
    /** When chunk loading ended */
    endTime?: Date;
    /** Estimated time remaining in milliseconds */
    estimatedTimeRemaining?: number;
    /** Chunk size in bytes if known */
    size?: number;
    /** Additional chunk metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Overall loading operation state
 */
export interface LoadingState {
    /** Unique operation identifier */
    id: string;
    /** Overall loading status */
    status: LoadingStatus;
    /** Overall progress percentage (0-100) */
    progress: number;
    /** Current loading stage description */
    stage: string;
    /** When operation started */
    startTime: Date;
    /** When operation ended */
    endTime?: Date;
    /** Estimated total time remaining in milliseconds */
    estimatedTimeRemaining?: number;
    /** Individual chunk states */
    chunks: Map<string, ChunkLoadingState>;
    /** Total number of chunks */
    totalChunks: number;
    /** Number of completed chunks */
    completedChunks: number;
    /** Number of failed chunks */
    failedChunks: number;
    /** Operation metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Loading state event types
 */
export type LoadingEventType = 'loading-started' | 'loading-progress' | 'chunk-started' | 'chunk-progress' | 'chunk-completed' | 'chunk-failed' | 'chunk-retrying' | 'loading-completed' | 'loading-failed' | 'loading-cancelled';
/**
 * Loading state event data
 */
export interface LoadingEvent {
    /** Event type */
    type: LoadingEventType;
    /** Operation identifier */
    operationId: string;
    /** Chunk identifier (if applicable) */
    chunkId?: string;
    /** Current progress percentage */
    progress?: number;
    /** Current stage description */
    stage?: string;
    /** Error information (if applicable) */
    error?: VocabularyError;
    /** Event timestamp */
    timestamp: Date;
    /** Additional event data */
    data?: Record<string, unknown>;
}
/**
 * Loading state event listener
 */
export type LoadingEventListener = (event: LoadingEvent) => void;
/**
 * Loading state configuration options
 */
export interface LoadingStateManagerOptions {
    /** Maximum number of concurrent operations */
    maxConcurrentOperations?: number;
    /** Default timeout for operations in milliseconds */
    defaultTimeout?: number;
    /** Whether to automatically clean up completed operations */
    autoCleanup?: boolean;
    /** Time to keep completed operations in milliseconds */
    cleanupDelay?: number;
    /** Whether to enable detailed logging */
    enableLogging?: boolean;
}
/**
 * Loading State Manager
 * Manages loading states for vocabulary operations with progress tracking and event emission
 */
export declare class LoadingStateManager {
    private operations;
    private listeners;
    private options;
    private operationCounter;
    private cleanupTimers;
    /**
     * Create a new loading state manager
     * @param options - Configuration options
     */
    constructor(options?: LoadingStateManagerOptions);
    /**
     * Start a new loading operation
     * @param totalChunks - Total number of chunks to load
     * @param stage - Initial stage description
     * @param metadata - Operation metadata
     * @returns Operation identifier
     */
    startLoading(totalChunks: number, stage?: string, metadata?: Record<string, unknown>): string;
    /**
     * Start loading a specific chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param metadata - Chunk metadata
     */
    startChunk(operationId: string, chunkId: string, metadata?: Record<string, unknown>): void;
    /**
     * Update progress for a chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param progress - Progress percentage (0-100)
     * @param estimatedTimeRemaining - Estimated time remaining in milliseconds
     */
    updateChunkProgress(operationId: string, chunkId: string, progress: number, estimatedTimeRemaining?: number): void;
    /**
     * Mark a chunk as completed
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param size - Chunk size in bytes
     */
    completeChunk(operationId: string, chunkId: string, size?: number): void;
    /**
     * Mark a chunk as failed
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @param error - Error that caused failure
     * @param canRetry - Whether the chunk can be retried
     */
    failChunk(operationId: string, chunkId: string, error: VocabularyError, canRetry?: boolean): void;
    /**
     * Retry a failed chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     */
    retryChunk(operationId: string, chunkId: string): void;
    /**
     * Update the overall operation stage
     * @param operationId - Operation identifier
     * @param stage - New stage description
     */
    updateStage(operationId: string, stage: string): void;
    /**
     * Cancel a loading operation
     * @param operationId - Operation identifier
     * @param reason - Cancellation reason
     */
    cancelOperation(operationId: string, reason?: string): void;
    /**
     * Get the current state of an operation
     * @param operationId - Operation identifier
     * @returns Current loading state or undefined if not found
     */
    getOperationState(operationId: string): LoadingState | undefined;
    /**
     * Get the current state of a chunk
     * @param operationId - Operation identifier
     * @param chunkId - Chunk identifier
     * @returns Chunk state or undefined if not found
     */
    getChunkState(operationId: string, chunkId: string): ChunkLoadingState | undefined;
    /**
     * Get all active operations
     * @returns Array of active operation states
     */
    getActiveOperations(): LoadingState[];
    /**
     * Subscribe to loading state events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener: LoadingEventListener): () => void;
    /**
     * Unsubscribe from loading state events
     * @param listener - Event listener function
     */
    unsubscribe(listener: LoadingEventListener): void;
    /**
     * Clear all operations (useful for testing or reset)
     */
    clearAll(): void;
    /**
     * Get statistics about loading operations
     * @returns Loading statistics
     */
    getStatistics(): {
        totalOperations: number;
        activeOperations: number;
        completedOperations: number;
        failedOperations: number;
        averageLoadTime: number;
        successRate: number;
    };
    /**
     * Update overall operation progress based on chunk progress
     * @param operationId - Operation identifier
     */
    private updateOperationProgress;
    /**
     * Complete an operation successfully
     * @param operationId - Operation identifier
     */
    private completeOperation;
    /**
     * Fail an operation due to error
     * @param operationId - Operation identifier
     * @param error - Error that caused failure
     */
    private failOperation;
    /**
     * Schedule cleanup of a completed operation
     * @param operationId - Operation identifier
     */
    private scheduleCleanup;
    /**
     * Emit an event to all listeners
     * @param event - Event to emit
     */
    private emitEvent;
    /**
     * Generate a unique operation identifier
     * @returns Unique operation ID
     */
    private generateOperationId;
    /**
     * Log message if logging is enabled
     * @param message - Message to log
     */
    private log;
}
export declare const loadingStateManager: LoadingStateManager;
export default loadingStateManager;
//# sourceMappingURL=loading-state-manager.d.ts.map