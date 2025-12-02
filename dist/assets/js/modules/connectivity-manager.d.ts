/**
 * Connectivity Manager
 * Provides offline detection, connectivity monitoring, and fallback strategies
 * @since 1.0.0
 */
import { VocabularyError } from './error-types.js';
/**
 * Connection quality levels
 */
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
/**
 * Connectivity status
 */
export interface ConnectivityStatus {
    /** Whether currently online */
    online: boolean;
    /** Connection quality */
    quality: ConnectionQuality;
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
    /** Time since last successful connection */
    timeSinceLastConnection?: number;
}
/**
 * Connectivity event types
 */
export type ConnectivityEventType = 'online' | 'offline' | 'connection-changed' | 'quality-changed' | 'slow-connection' | 'connection-restored';
/**
 * Connectivity event data
 */
export interface ConnectivityEvent {
    /** Event type */
    type: ConnectivityEventType;
    /** Current connectivity status */
    status: ConnectivityStatus;
    /** Previous connectivity status */
    previousStatus?: ConnectivityStatus;
    /** Event timestamp */
    timestamp: Date;
    /** Additional event data */
    data?: Record<string, unknown>;
}
/**
 * Connectivity event listener
 */
export type ConnectivityEventListener = (event: ConnectivityEvent) => void;
/**
 * Fallback strategy configuration
 */
export interface FallbackStrategy {
    /** Strategy name */
    name: string;
    /** Strategy priority (higher = more preferred) */
    priority: number;
    /** Whether strategy is available */
    available: boolean;
    /** Execute the fallback strategy */
    execute: (context: FallbackContext) => Promise<unknown>;
}
/**
 * Fallback context
 */
export interface FallbackContext {
    /** Original operation that failed */
    operation: string;
    /** Error that triggered fallback */
    error: VocabularyError;
    /** Request URL if applicable */
    url?: string;
    /** Request options if applicable */
    options?: RequestInit;
    /** Additional context data */
    data?: Record<string, unknown>;
}
/**
 * Connectivity manager options
 */
export interface ConnectivityManagerOptions {
    /** Connectivity check interval in milliseconds */
    checkInterval?: number;
    /** Timeout for connectivity checks in milliseconds */
    checkTimeout?: number;
    /** URL to use for connectivity checks */
    checkUrl?: string;
    /** Number of consecutive failures before considering offline */
    offlineThreshold?: number;
    /** Whether to enable detailed logging */
    enableLogging?: boolean;
    /** Whether to enable automatic fallback */
    enableFallback?: boolean;
}
/**
 * Connectivity Manager
 * Monitors network connectivity and provides fallback strategies
 */
export declare class ConnectivityManager {
    private options;
    private listeners;
    private currentStatus;
    private previousStatus?;
    private checkTimer?;
    private consecutiveFailures;
    private lastSuccessfulCheck;
    private fallbackStrategies;
    /**
     * Create a new connectivity manager
     * @param options - Configuration options
     */
    constructor(options?: ConnectivityManagerOptions);
    /**
     * Get current connectivity status
     * @returns Current connectivity status
     */
    getStatus(): ConnectivityStatus;
    /**
     * Check if currently online
     * @returns Whether online
     */
    isOnline(): boolean;
    /**
     * Check if connection quality is good
     * @returns Whether connection quality is good or better
     */
    isGoodConnection(): boolean;
    /**
     * Check if connection is slow
     * @returns Whether connection is slow
     */
    isSlowConnection(): boolean;
    /**
     * Perform a connectivity check
     * @returns Promise resolving to connectivity status
     */
    checkConnectivity(): Promise<ConnectivityStatus>;
    /**
     * Execute an operation with fallback strategies
     * @param operation - Operation name
     * @param primaryFunction - Primary operation function
     * @param context - Fallback context
     * @returns Operation result
     */
    executeWithFallback<T>(operation: string, primaryFunction: () => Promise<T>, context?: Partial<FallbackContext>): Promise<T>;
    /**
     * Add a fallback strategy
     * @param strategy - Fallback strategy to add
     */
    addFallbackStrategy(strategy: FallbackStrategy): void;
    /**
     * Remove a fallback strategy
     * @param name - Strategy name to remove
     */
    removeFallbackStrategy(name: string): void;
    /**
     * Get available fallback strategies
     * @returns Array of available strategies
     */
    getFallbackStrategies(): FallbackStrategy[];
    /**
     * Subscribe to connectivity events
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    subscribe(listener: ConnectivityEventListener): () => void;
    /**
     * Unsubscribe from connectivity events
     * @param listener - Event listener function
     */
    unsubscribe(listener: ConnectivityEventListener): void;
    /**
     * Destroy the connectivity manager and clean up resources
     */
    destroy(): void;
    /**
     * Initialize connectivity monitoring
     */
    private initializeConnectivityMonitoring;
    /**
     * Initialize default fallback strategies
     */
    private initializeFallbackStrategies;
    /**
     * Start periodic connectivity checks
     */
    private startPeriodicChecks;
    /**
     * Handle browser connectivity change events
     * @param online - Whether browser reports online
     */
    private handleBrowserConnectivityChange;
    /**
     * Handle connection information changes
     */
    private handleConnectionChange;
    /**
     * Update connectivity status
     * @param online - Whether online
     * @param responseTime - Response time in milliseconds
     */
    private updateConnectivityStatus;
    /**
     * Update connection information from Network Information API
     * @param connection - Network connection API
     */
    private updateConnectionInfo;
    /**
     * Calculate connection quality from response time
     * @param responseTime - Response time in milliseconds
     * @returns Connection quality
     */
    private calculateQuality;
    /**
     * Get connection quality from effective type
     * @param effectiveType - Effective connection type
     * @returns Connection quality
     */
    private getQualityFromEffectiveType;
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
export declare const connectivityManager: ConnectivityManager;
export default connectivityManager;
//# sourceMappingURL=connectivity-manager.d.ts.map