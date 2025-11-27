/**
 * Network Manager with Enhanced Error Handling and Retry Logic
 * Provides robust network operations with timeout, retry, and connectivity management
 * @since 1.0.0
 */

import { VocabularyError, ErrorFactory, NetworkError } from './error-types.js';

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
export type NetworkEventType = 
  | 'request-started'
  | 'request-progress'
  | 'request-completed'
  | 'request-failed'
  | 'request-retrying'
  | 'connectivity-changed'
  | 'offline-detected'
  | 'online-restored';

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
export class NetworkManager {
  private options: Required<NetworkManagerOptions>;
  private listeners: Set<NetworkEventListener> = new Set();
  private statistics: NetworkStatistics;
  private connectivityStatus: ConnectivityStatus;
  private connectivityCheckTimer?: number;
  private activeRequests: Map<string, AbortController> = new Map();
  private requestCounter = 0;

  /**
   * Create a new network manager
   * @param options - Configuration options
   */
  constructor(options: NetworkManagerOptions = {}) {
    this.options = {
      defaultTimeout: 10_000,
      defaultMaxRetries: 3,
      defaultBaseDelay: 1000,
      defaultMaxDelay: 30_000,
      connectivityCheckInterval: 30_000,
      enableLogging: process.env.NODE_ENV === 'development',
      enableStatistics: true,
      ...options
    };

    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      averageDuration: 0,
      successRate: 0,
      totalDataTransferred: 0
    };

    this.connectivityStatus = {
      online: navigator.onLine,
      lastCheck: new Date()
    };

    this.initializeConnectivityMonitoring();
  }

  /**
   * Perform a network request with enhanced error handling and retry logic
   * @param url - Request URL
   * @param options - Request options
   * @returns Enhanced response with metadata
   */
  async fetch(url: string, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    const mergedOptions = {
      timeout: this.options.defaultTimeout,
      maxRetries: this.options.defaultMaxRetries,
      baseDelay: this.options.defaultBaseDelay,
      maxDelay: this.options.defaultMaxDelay,
      retryOnNetworkError: true,
      retryOnServerError: true,
      retryOnTimeout: true,
      shouldRetry: undefined,
      metadata: {},
      ...options
    } as Required<NetworkRequestOptions>;

    this.emitEvent({
      type: 'request-started',
      url,
      method: mergedOptions.method || 'GET',
      timestamp: new Date(),
      data: { requestId, ...mergedOptions.metadata }
    });

    this.log(`Starting request ${requestId}: ${mergedOptions.method || 'GET'} ${url}`);

    try {
      const response = await this.executeRequestWithRetry(url, mergedOptions, requestId);
      const duration = Date.now() - startTime;
      
      // Add response metadata
      (response as NetworkResponse).duration = duration;
      (response as NetworkResponse).retryCount = 0;
      (response as NetworkResponse).metadata = mergedOptions.metadata;

      this.updateStatistics(true, duration, (response as NetworkResponse).size || 0);
      
      this.emitEvent({
        type: 'request-completed',
        url,
        method: mergedOptions.method || 'GET',
        timestamp: new Date(),
        data: { requestId, duration, status: response.status, size: (response as NetworkResponse).size }
      });

      this.log(`Completed request ${requestId} in ${duration}ms with status ${response.status}`);
      return response as NetworkResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      const vocabError = ErrorFactory.fromError(error, {
        url,
        method: mergedOptions.method,
        timeout: mergedOptions.timeout,
        requestId
      });

      this.updateStatistics(false, duration, 0);
      
      this.emitEvent({
        type: 'request-failed',
        url,
        method: mergedOptions.method || 'GET',
        error: vocabError,
        timestamp: new Date(),
        data: { requestId, duration }
      });

      this.log(`Failed request ${requestId} after ${duration}ms: ${vocabError.message}`);
      throw vocabError;
    }
  }

  /**
   * Perform a GET request
   * @param url - Request URL
   * @param options - Request options
   * @returns Enhanced response
   */
  async get(url: string, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * Perform a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param options - Request options
   * @returns Enhanced response
   */
  async post(url: string, data?: BodyInit, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    return this.fetch(url, { ...options, method: 'POST', body: data });
  }

  /**
   * Perform a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param options - Request options
   * @returns Enhanced response
   */
  async put(url: string, data?: BodyInit, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    return this.fetch(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * Perform a DELETE request
   * @param url - Request URL
   * @param options - Request options
   * @returns Enhanced response
   */
  async delete(url: string, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * Check connectivity status
   * @returns Current connectivity status
   */
  async checkConnectivity(): Promise<ConnectivityStatus> {
    try {
      // Try a simple HEAD request to a reliable endpoint
      const response = await fetch('/data/vocab/index.json', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });

      this.updateConnectivityStatus(true);
      return this.connectivityStatus;

    } catch {
      this.updateConnectivityStatus(false);
      return this.connectivityStatus;
    }
  }

  /**
   * Get current connectivity status
   * @returns Current connectivity status
   */
  getConnectivityStatus(): ConnectivityStatus {
    return { ...this.connectivityStatus };
  }

  /**
   * Get network statistics
   * @returns Current network statistics
   */
  getStatistics(): NetworkStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset network statistics
   */
  resetStatistics(): void {
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      averageDuration: 0,
      successRate: 0,
      totalDataTransferred: 0
    };
    this.log('Reset network statistics');
  }

  /**
   * Cancel an active request
   * @param requestId - Request identifier
   */
  cancelRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
      this.log(`Cancelled request ${requestId}`);
    }
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests(): void {
    for (const [requestId, controller] of this.activeRequests) {
      controller.abort();
      this.log(`Cancelled request ${requestId}`);
    }
    this.activeRequests.clear();
  }

  /**
   * Subscribe to network events
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  subscribe(listener: NetworkEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Unsubscribe from network events
   * @param listener - Event listener function
   */
  unsubscribe(listener: NetworkEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Destroy the network manager and clean up resources
   */
  destroy(): void {
    this.cancelAllRequests();
    
    if (this.connectivityCheckTimer) {
      clearInterval(this.connectivityCheckTimer);
      this.connectivityCheckTimer = undefined;
    }

    this.listeners.clear();
    this.log('Network manager destroyed');
  }

  /**
   * Execute a request with retry logic
   * @param url - Request URL
   * @param options - Request options
   * @param requestId - Request identifier
   * @returns Response
   */
  private async executeRequestWithRetry(
    url: string, 
    options: Required<NetworkRequestOptions>, 
    requestId: string
  ): Promise<Response> {
    let lastError: VocabularyError;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.emitEvent({
            type: 'request-retrying',
            url,
            method: options.method || 'GET',
            timestamp: new Date(),
            data: { requestId, attempt, maxRetries: options.maxRetries }
          });

          const delay = this.calculateRetryDelay(attempt, options.baseDelay, options.maxDelay);
          await this.delay(delay);
        }

        const response = await this.executeSingleRequest(url, options, requestId);
        
        // Check if response indicates an error that should be retried
        if (this.shouldRetryResponse(response, options) && attempt < options.maxRetries) {
          lastError = ErrorFactory.network(
            `HTTP ${response.status}: ${response.statusText}`,
            { statusCode: response.status, url, method: options.method }
          );
          continue;
        }

        return response;

      } catch (error) {
        lastError = ErrorFactory.fromError(error, {
          url,
          method: options.method,
          timeout: options.timeout,
          requestId,
          attempt
        });

        // Check if error should be retried
        if (!this.shouldRetryError(lastError, options, attempt)) {
          throw lastError;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute a single request without retry
   * @param url - Request URL
   * @param options - Request options
   * @param requestId - Request identifier
   * @returns Response
   */
  private async executeSingleRequest(
    url: string, 
    options: Required<NetworkRequestOptions>, 
    requestId: string
  ): Promise<Response> {
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.activeRequests.delete(requestId);

      // Calculate response size if possible
      let size: number | undefined;
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        size = parseInt(contentLength, 10);
      }

      (response as NetworkResponse).size = size;
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      this.activeRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Check if a response should be retried
   * @param response - HTTP response
   * @param options - Request options
   * @returns Whether response should be retried
   */
  private shouldRetryResponse(response: Response, options: Required<NetworkRequestOptions>): boolean {
    if (!options.retryOnServerError) return false;
    
    // Retry on server errors (5xx)
    return response.status >= 500;
  }

  /**
   * Check if an error should be retried
   * @param error - Vocabulary error
   * @param options - Request options
   * @param attempt - Current attempt number
   * @returns Whether error should be retried
   */
  private shouldRetryError(
    error: VocabularyError, 
    options: Required<NetworkRequestOptions>, 
    attempt: number
  ): boolean {
    // Check custom retry condition first
    if (options.shouldRetry && !options.shouldRetry(error, attempt)) {
      return false;
    }

    // Don't retry if we've exceeded max retries
    if (attempt >= options.maxRetries) {
      return false;
    }

    // Check error-specific retry conditions
    if (error instanceof NetworkError) {
      if (error.statusCode) {
        // HTTP errors
        return (error.statusCode >= 500 && options.retryOnServerError) ||
               (error.statusCode === 408 && options.retryOnTimeout);
      }
      // Network errors (timeout, connection failed, etc.)
      return options.retryOnNetworkError || options.retryOnTimeout;
    }

    // Default to retrying for unknown errors
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param attempt - Current attempt number (0-based)
   * @param baseDelay - Base delay in milliseconds
   * @param maxDelay - Maximum delay in milliseconds
   * @returns Calculated delay in milliseconds
   */
  private calculateRetryDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    const delay = exponentialDelay + jitter;
    
    return Math.min(delay, maxDelay);
  }

  /**
   * Initialize connectivity monitoring
   */
  private initializeConnectivityMonitoring(): void {
    // Listen for browser online/offline events
    window.addEventListener('online', () => {
      this.updateConnectivityStatus(true);
      this.emitEvent({
        type: 'online-restored',
        timestamp: new Date()
      });
    });

    window.addEventListener('offline', () => {
      this.updateConnectivityStatus(false);
      this.emitEvent({
        type: 'offline-detected',
        timestamp: new Date()
      });
    });

    // Get connection information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateConnectionInfo(connection);
      
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
      });
    }

    // Start periodic connectivity checks
    this.startConnectivityChecks();
  }

  /**
   * Start periodic connectivity checks
   */
  private startConnectivityChecks(): void {
    if (this.options.connectivityCheckInterval > 0) {
      this.connectivityCheckTimer = window.setInterval(() => {
        this.checkConnectivity();
      }, this.options.connectivityCheckInterval);
    }
  }

  /**
   * Update connectivity status
   * @param online - Whether online
   */
  private updateConnectivityStatus(online: boolean): void {
    const wasOnline = this.connectivityStatus.online;
    this.connectivityStatus.online = online;
    this.connectivityStatus.lastCheck = new Date();

    if (wasOnline !== online) {
      this.emitEvent({
        type: online ? 'online-restored' : 'offline-detected',
        timestamp: new Date(),
        data: { wasOnline, isOnline: online }
      });

      this.log(`Connectivity changed: ${wasOnline} -> ${online}`);
    }
  }

  /**
   * Update connection information
   * @param connection - Network connection API
   */
  private updateConnectionInfo(connection: any): void {
    if (connection) {
      this.connectivityStatus.connectionType = connection.type;
      this.connectivityStatus.effectiveType = connection.effectiveType;
      this.connectivityStatus.downlink = connection.downlink;
      this.connectivityStatus.rtt = connection.rtt;
    }
  }

  /**
   * Update network statistics
   * @param success - Whether request was successful
   * @param duration - Request duration in milliseconds
   * @param size - Response size in bytes
   */
  private updateStatistics(success: boolean, duration: number, size: number): void {
    if (!this.options.enableStatistics) return;

    this.statistics.totalRequests++;
    
    if (success) {
      this.statistics.successfulRequests++;
    } else {
      this.statistics.failedRequests++;
    }

    this.statistics.totalDataTransferred += size;

    // Update average duration
    const totalDuration = this.statistics.averageDuration * (this.statistics.totalRequests - 1) + duration;
    this.statistics.averageDuration = totalDuration / this.statistics.totalRequests;

    // Update success rate
    this.statistics.successRate = this.statistics.successfulRequests / this.statistics.totalRequests;
  }

  /**
   * Emit an event to all listeners
   * @param event - Event to emit
   */
  private emitEvent(event: NetworkEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in network event listener:', error);
      }
    }
  }

  /**
   * Generate a unique request identifier
   * @returns Unique request ID
   */
  private generateRequestId(): string {
    return `req-${++this.requestCounter}-${Date.now()}`;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message if logging is enabled
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.options.enableLogging) {
      console.log(`[NetworkManager] ${message}`);
    }
  }
}

// Create singleton instance
export const networkManager = new NetworkManager({
  enableLogging: process.env.NODE_ENV === 'development'
});

export default networkManager;