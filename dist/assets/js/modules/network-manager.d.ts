/**
 * Network Manager with Enhanced Error Handling and Retry Logic
 * Provides robust network operations with timeout, retry, and connectivity management
 * @since 1.0.0
 */
import { VocabularyError } from './error-types.js';
/**
 * Network request configuration options
 */
export interface NetworkRequestOptions extends RequestInit {
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** Base delay for exponential backoff in milliseconds */
    baseDelay?: number;
    /** Maximum delay between retries in milliseconds */
    maxDelay?: number;
    /** Whether to retry on network errors */
    retryOnNetworkError?: boolean;
    /** Whether to retry on server errors (5xx) */
    retryOnServerError?: boolean;
    /** Whether to retry on timeout */
    retryOnTimeout?: boolean;
    /** Custom retry condition function */
    shouldRetry?: (error: VocabularyError, attempt: number) => boolean;
    /** Request metadata for tracking */
    metadata?: Record<string, unknown>;
}
/**
 * Network response with additional metadata
 */
export interface NetworkResponse extends Response {
    /** Request duration in milliseconds */
    duration?: number;
    /** Number of retry attempts */
    retryCount?: number;
    /** Response size in bytes */
    size?: number;
    /** Request metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Connectivity status information
 */
export interface ConnectivityStatus {
    /** Whether currently online */
    online: boolean;
    /** Connection type if available */
    connectionType?: string;
    /** Effective connection type if available */
    effectiveType?: string;
    /** Downlink speed in Mbps if available */
    downlink?: number;
    /** Round-trip time in milliseconds if available */
    rtt?: number;
    /** Last connectivity check timestamp */
    lastCheck: Date;
}
/**
 * Network statistics
 */
export interface NetworkStatistics {
    /** Total number of requests */
    totalRequests: number;
    /** Number of successful requests */
    successfulRequests: number;
    /** Number of failed requests */
    failedRequests: number;
    /** Number of retried requests */
    retriedRequests: number;
    /** Average request duration in milliseconds */
    averageDuration: number;
    /** Success rate as percentage */
    successRate: number;
    /** Total data transferred in bytes */
    totalDataTransferred: number;
}
/**
 * Network event types
 */
export type NetworkEventType = 'request-started' | 'request-progress' | 'request-completed' | 'request-failed' | 'request-retrying' | 'connectivity-changed' | 'offline-detected' | 'online-restored';
/**
 * Network event data
 */
export interface NetworkEvent {
    /** Event type */
    type: NetworkEventType;
    /** Request URL */
    url?: string;
    /** Request method */
    method?: string;
    /** Error information */
    error?: VocabularyError;
    /** Event timestamp */
    timestamp: Date;
    /** Additional event data */
    data?: Record<string, unknown>;
}
/**
 * Network event listener
 */
export type NetworkEventListener = (event: NetworkEvent) => void;
/**
 * Network Manager Configuration
 */
export interface NetworkManagerOptions {
    /** Default request timeout in milliseconds */
    defaultTimeout?: number;
    /** Default maximum retry attempts */
    defaultMaxRetries?: number;
    /** Default base delay for exponential backoff */
    defaultBaseDelay?: number;
    /** Default maximum delay between retries */
    defaultMaxDelay?: number;
    /** Connectivity check interval in milliseconds */
    connectivityCheckInterval?: number;
    /** Whether to enable detailed logging */
    enableLogging?: boolean;
    /** Whether to track statistics */
    enableStatistics?: boolean;
}
/**
 * Network Manager
 * Provides enhanced network operations with retry logic, timeout handling, and connectivity management
 */
export declare class NetworkManager {
    private options;
    private listeners;
    private statistics;
    private connectivityStatus;
    private connectivityCheckTimer?;
    private activeRequests;
    private requestCounter;
    /**
     * Create a new network manager
     * @param options - Configuration options
     */
    constructor(options?: NetworkManagerOptions);
    /**
     * Perform a network request with enhanced error handling and retry logic
     * @param url - Request URL
     * @param options - Request options
     * @returns Enhanced response with metadata
     */
    fetch(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse>;
    /**
     * Perform a GET request
     * @param url - Request URL
     * @param options - Request options
     * @returns Enhanced response
     */
    get(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse>;
    /**
     * Perform a POST request
     * @param url - Request URL
     * @param data - Request body data
     * @param options - Request options
     * @returns Enhanced response
     */
    post(url: string, data?: BodyInit, options?: NetworkRequestOptions): Promise<NetworkResponse>;
    /**
     * Perform a PUT request
     * @param url - Request URL
     * @param data - Request body data
     * @param options - Request options
     * @returns Enhanced response
     */
    put(url: string, data?: BodyInit, options?: NetworkRequestOptions): Promise<NetworkResponse>;
    /**
     * Perform a DELETE request
     * @param url - Request URL
     * @param options - Request options
     * @returns Enhanced response
     */
    delete(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse>;
    /**
     * Check connectivity status
     * @returns Current connectivity status
     */
    checkConnectivity(): Promise<ConnectivityStatus>;
    /**
     * Get current connectivity status
     * @returns Current connectivity status
     */
    getConnectivityStatus(): ConnectivityStatus;
    /**
     * Get network statistics
     * @returns Current network statistics
     */
    getStatistics(): NetworkStatistics;
    /**
     * Reset network statistics
     */
    resetStatistics(): void;
    /**
     * Cancel an active request
     * @param requestId - Request identifier
     */
    cancelRequest(requestId: string): void;
    /**
     * Cancel all active requests
     */
    cancelAllRequests(): void;
    /**
     * Subscribe to network events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener: NetworkEventListener): () => void;
    /**
     * Unsubscribe from network events
     * @param listener - Event listener function
     */
    unsubscribe(listener: NetworkEventListener): void;
    /**
     * Destroy the network manager and clean up resources
     */
    destroy(): void;
    /**
     * Execute a request with retry logic
     * @param url - Request URL
     * @param options - Request options
     * @param requestId - Request identifier
     * @returns Response
     */
    private executeRequestWithRetry;
    /**
     * Execute a single request without retry
     * @param url - Request URL
     * @param options - Request options
     * @param requestId - Request identifier
     * @returns Response
     */
    private executeSingleRequest;
    /**
     * Check if a response should be retried
     * @param response - HTTP response
     * @param options - Request options
     * @returns Whether response should be retried
     */
    private shouldRetryResponse;
    /**
     * Check if an error should be retried
     * @param error - Vocabulary error
     * @param options - Request options
     * @param attempt - Current attempt number
     * @returns Whether error should be retried
     */
    private shouldRetryError;
    /**
     * Calculate retry delay with exponential backoff
     * @param attempt - Current attempt number (0-based)
     * @param baseDelay - Base delay in milliseconds
     * @param maxDelay - Maximum delay in milliseconds
     * @returns Calculated delay in milliseconds
     */
    private calculateRetryDelay;
    /**
     * Initialize connectivity monitoring
     */
    private initializeConnectivityMonitoring;
    /**
     * Start periodic connectivity checks
     */
    private startConnectivityChecks;
    /**
     * Update connectivity status
     * @param online - Whether online
     */
    private updateConnectivityStatus;
    /**
     * Update connection information
     * @param connection - Network connection API
     */
    private updateConnectionInfo;
    /**
     * Update network statistics
     * @param success - Whether request was successful
     * @param duration - Request duration in milliseconds
     * @param size - Response size in bytes
     */
    private updateStatistics;
    /**
     * Emit an event to all listeners
     * @param event - Event to emit
     */
    private emitEvent;
    /**
     * Generate a unique request identifier
     * @returns Unique request ID
     */
    private generateRequestId;
    /**
     * Delay execution for specified milliseconds
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after delay
     */
    private delay;
    /**
     * Log message if logging is enabled
     * @param message - Message to log
     */
    private log;
}
export declare const networkManager: NetworkManager;
export default networkManager;
//# sourceMappingURL=network-manager.d.ts.map