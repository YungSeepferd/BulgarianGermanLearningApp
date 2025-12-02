/**
 * Connectivity Manager
 * Provides offline detection, connectivity monitoring, and fallback strategies
 * @since 1.0.0
 */

import { VocabularyError, ErrorFactory } from './error-types.js';

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
export type ConnectivityEventType = 
  | 'online'
  | 'offline'
  | 'connection-changed'
  | 'quality-changed'
  | 'slow-connection'
  | 'connection-restored';

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
export class ConnectivityManager {
  private options: Required<ConnectivityManagerOptions>;
  private listeners: Set<ConnectivityEventListener> = new Set();
  private currentStatus: ConnectivityStatus;
  private previousStatus?: ConnectivityStatus;
  private checkTimer?: number;
  private consecutiveFailures = 0;
  private lastSuccessfulCheck = Date.now();
  private fallbackStrategies: Map<string, FallbackStrategy> = new Map();

  /**
   * Create a new connectivity manager
   * @param options - Configuration options
   */
  constructor(options: ConnectivityManagerOptions = {}) {
    this.options = {
      checkInterval: 30_000,
      checkTimeout: 5000,
      checkUrl: '/data/vocab/index.json',
      offlineThreshold: 3,
      enableLogging: process.env.NODE_ENV === 'development',
      enableFallback: true,
      ...options
    };

    this.currentStatus = {
      online: navigator.onLine,
      quality: 'unknown',
      lastCheck: new Date()
    };

    this.initializeConnectivityMonitoring();
    this.initializeFallbackStrategies();
  }

  /**
   * Get current connectivity status
   * @returns Current connectivity status
   */
  getStatus(): ConnectivityStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if currently online
   * @returns Whether online
   */
  isOnline(): boolean {
    return this.currentStatus.online;
  }

  /**
   * Check if connection quality is good
   * @returns Whether connection quality is good or better
   */
  isGoodConnection(): boolean {
    return this.currentStatus.quality === 'excellent' || this.currentStatus.quality === 'good';
  }

  /**
   * Check if connection is slow
   * @returns Whether connection is slow
   */
  isSlowConnection(): boolean {
    return this.currentStatus.quality === 'poor' || this.currentStatus.quality === 'fair';
  }

  /**
   * Perform a connectivity check
   * @returns Promise resolving to connectivity status
   */
  async checkConnectivity(): Promise<ConnectivityStatus> {
    const startTime = Date.now();
    
    try {
      // Use fetch with timeout to check connectivity
      await fetch(this.options.checkUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(this.options.checkTimeout)
      });

      const duration = Date.now() - startTime;
      this.updateConnectivityStatus(true, duration);
      this.consecutiveFailures = 0;
      this.lastSuccessfulCheck = Date.now();

      this.log(`Connectivity check successful in ${duration}ms`);
      return this.getStatus();

    } catch {
      const duration = Date.now() - startTime;
      this.consecutiveFailures++;
      
      const isOffline = this.consecutiveFailures >= this.options.offlineThreshold;
      this.updateConnectivityStatus(isOffline, duration);
      
      this.log(`Connectivity check failed in ${duration}ms (failure ${this.consecutiveFailures}/${this.options.offlineThreshold})`);
      return this.getStatus();
    }
  }

  /**
   * Execute an operation with fallback strategies
   * @param operation - Operation name
   * @param primaryFunction - Primary operation function
   * @param context - Fallback context
   * @returns Operation result
   */
  async executeWithFallback<T>(
    operation: string,
    primaryFunction: () => Promise<T>,
    context?: Partial<FallbackContext>
  ): Promise<T> {
    if (!this.options.enableFallback) {
      return primaryFunction();
    }

    try {
      // Try primary operation first
      const result = await primaryFunction();
      this.log(`Primary operation succeeded: ${operation}`);
      return result;

    } catch (error) {
      const vocabError = ErrorFactory.fromError(error);
      this.log(`Primary operation failed: ${operation} - ${vocabError.message}`);

      // Try fallback strategies in priority order
      const sortedStrategies = [...this.fallbackStrategies.values()]
        .filter(strategy => strategy.available)
        .sort((a, b) => b.priority - a.priority);

      for (const strategy of sortedStrategies) {
        try {
          this.log(`Trying fallback strategy: ${strategy.name}`);
          const fallbackContext: FallbackContext = {
            operation,
            error: vocabError,
            ...context
          };

          const result = await strategy.execute(fallbackContext);
          this.log(`Fallback strategy succeeded: ${strategy.name}`);
          return result as T;

        } catch (fallbackError) {
          this.log(`Fallback strategy failed: ${strategy.name} - ${fallbackError}`);
          continue;
        }
      }

      // All strategies failed, throw original error
      throw vocabError;
    }
  }

  /**
   * Add a fallback strategy
   * @param strategy - Fallback strategy to add
   */
  addFallbackStrategy(strategy: FallbackStrategy): void {
    this.fallbackStrategies.set(strategy.name, strategy);
    this.log(`Added fallback strategy: ${strategy.name}`);
  }

  /**
   * Remove a fallback strategy
   * @param name - Strategy name to remove
   */
  removeFallbackStrategy(name: string): void {
    this.fallbackStrategies.delete(name);
    this.log(`Removed fallback strategy: ${name}`);
  }

  /**
   * Get available fallback strategies
   * @returns Array of available strategies
   */
  getFallbackStrategies(): FallbackStrategy[] {
    return [...this.fallbackStrategies.values()]
      .filter(strategy => strategy.available)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Subscribe to connectivity events
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  subscribe(listener: ConnectivityEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Unsubscribe from connectivity events
   * @param listener - Event listener function
   */
  unsubscribe(listener: ConnectivityEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Destroy the connectivity manager and clean up resources
   */
  destroy(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
    }

    this.listeners.clear();
    this.fallbackStrategies.clear();
    this.log('Connectivity manager destroyed');
  }

  /**
   * Initialize connectivity monitoring
   */
  private initializeConnectivityMonitoring(): void {
    // Listen for browser online/offline events
    window.addEventListener('online', () => {
      this.handleBrowserConnectivityChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleBrowserConnectivityChange(false);
    });

    // Get connection information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateConnectionInfo(connection);
      
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
        this.handleConnectionChange();
      });
    }

    // Start periodic connectivity checks
    this.startPeriodicChecks();
  }

  /**
   * Initialize default fallback strategies
   */
  private initializeFallbackStrategies(): void {
    // Cache strategy - try to use cached data
    this.addFallbackStrategy({
      name: 'cache',
      priority: 100,
      available: true,
      execute: async (context: FallbackContext) => {
        if (context.url) {
          // Try to get from cache
          const cache = await caches.open('vocabulary-cache');
          const cachedResponse = await cache.match(context.url);
          
          if (cachedResponse) {
            const data = await cachedResponse.json();
            this.log('Retrieved data from cache');
            return data;
          }
        }
        
        throw ErrorFactory.network('No cached data available', { url: context.url });
      }
    });

    // LocalStorage strategy - try to get from localStorage
    this.addFallbackStrategy({
      name: 'localStorage',
      priority: 80,
      available: true,
      execute: async (context: FallbackContext) => {
        if (context.operation.includes('vocabulary')) {
          const key = 'bgde:vocabulary:cache';
          const cachedData = localStorage.getItem(key);
          
          if (cachedData) {
            const data = JSON.parse(cachedData);
            this.log('Retrieved data from localStorage');
            return data;
          }
        }
        
        throw ErrorFactory.storage('No cached data available', 'read');
      }
    });

    // IndexedDB strategy - try to get from IndexedDB
    this.addFallbackStrategy({
      name: 'indexedDB',
      priority: 60,
      available: 'indexedDB' in self,
      execute: async () => {
        // Implementation would depend on your IndexedDB setup
        throw ErrorFactory.fromError(new Error('IndexedDB fallback not implemented'), { component: 'connectivity-manager' });
      }
    });

    // Minimal data strategy - return minimal dataset
    this.addFallbackStrategy({
      name: 'minimal',
      priority: 40,
      available: true,
      execute: async () => {
        // Return a minimal dataset for offline functionality
        const minimalData = {
          entries: [],
          total: 0,
          message: 'Offline mode - limited functionality'
        };
        
        this.log('Using minimal dataset for offline mode');
        return minimalData;
      }
    });
  }

  /**
   * Start periodic connectivity checks
   */
  private startPeriodicChecks(): void {
    if (this.options.checkInterval > 0) {
      this.checkTimer = window.setInterval(() => {
        this.checkConnectivity();
      }, this.options.checkInterval);
    }
  }

  /**
   * Handle browser connectivity change events
   * @param online - Whether browser reports online
   */
  private handleBrowserConnectivityChange(online: boolean): void {
    const wasOnline = this.currentStatus.online;
    
    if (wasOnline !== online) {
      this.updateConnectivityStatus(online);
      
      this.emitEvent({
        type: online ? 'online' : 'offline',
        status: this.currentStatus,
        previousStatus: this.previousStatus,
        timestamp: new Date()
      });

      this.log(`Browser connectivity changed: ${wasOnline} -> ${online}`);
    }
  }

  /**
   * Handle connection information changes
   */
  private handleConnectionChange(): void {
    const oldQuality = this.currentStatus.quality;
    this.updateConnectionInfo((navigator as any).connection);
    
    if (oldQuality !== this.currentStatus.quality) {
      this.emitEvent({
        type: 'quality-changed',
        status: this.currentStatus,
        previousStatus: this.previousStatus,
        timestamp: new Date(),
        data: { oldQuality, newQuality: this.currentStatus.quality }
      });

      if (this.isSlowConnection()) {
        this.emitEvent({
          type: 'slow-connection',
          status: this.currentStatus,
          timestamp: new Date()
        });
      }

      this.log(`Connection quality changed: ${oldQuality} -> ${this.currentStatus.quality}`);
    }
  }

  /**
   * Update connectivity status
   * @param online - Whether online
   * @param responseTime - Response time in milliseconds
   */
  private updateConnectivityStatus(online: boolean, responseTime?: number): void {
    this.previousStatus = { ...this.currentStatus };
    
    this.currentStatus.online = online;
    this.currentStatus.lastCheck = new Date();
    this.currentStatus.timeSinceLastConnection = Date.now() - this.lastSuccessfulCheck;
    
    if (responseTime) {
      this.currentStatus.quality = this.calculateQuality(responseTime);
    }

    this.emitEvent({
      type: 'connection-changed',
      status: this.currentStatus,
      previousStatus: this.previousStatus,
      timestamp: new Date(),
      data: { responseTime }
    });
  }

  /**
   * Update connection information from Network Information API
   * @param connection - Network connection API
   */
  private updateConnectionInfo(connection: any): void {
    if (connection) {
      this.currentStatus.connectionType = connection.type;
      this.currentStatus.effectiveType = connection.effectiveType;
      this.currentStatus.downlink = connection.downlink;
      this.currentStatus.rtt = connection.rtt;
      
      // Update quality based on connection information
      if (connection.effectiveType) {
        this.currentStatus.quality = this.getQualityFromEffectiveType(connection.effectiveType);
      }
    }
  }

  /**
   * Calculate connection quality from response time
   * @param responseTime - Response time in milliseconds
   * @returns Connection quality
   */
  private calculateQuality(responseTime: number): ConnectionQuality {
    if (responseTime < 200) return 'excellent';
    if (responseTime < 500) return 'good';
    if (responseTime < 1000) return 'fair';
    if (responseTime < 3000) return 'poor';
    return 'unknown';
  }

  /**
   * Get connection quality from effective type
   * @param effectiveType - Effective connection type
   * @returns Connection quality
   */
  private getQualityFromEffectiveType(effectiveType: string): ConnectionQuality {
    switch (effectiveType) {
    case '4g': { return 'excellent';
    }
    case '3g': { return 'good';
    }
    case '2g': { return 'fair';
    }
    case 'slow-2g': { return 'poor';
    }
    default: { return 'unknown';
    }
    }
  }

  /**
   * Emit an event to all listeners
   * @param event - Event to emit
   */
  private emitEvent(event: ConnectivityEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in connectivity event listener:', error);
      }
    }
  }

  /**
   * Log message if logging is enabled
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.options.enableLogging) {
      console.log(`[ConnectivityManager] ${message}`);
    }
  }
}

// Create singleton instance
export const connectivityManager = new ConnectivityManager({
  enableLogging: process.env.NODE_ENV === 'development'
});

export default connectivityManager;