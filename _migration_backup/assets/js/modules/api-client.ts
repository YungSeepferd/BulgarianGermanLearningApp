// API Client for optimized data loading
// Handles vocabulary, grammar, and practice data with caching and pagination

import type { VocabularyItem, GrammarItem, PracticeItem } from '../types/vocabulary-types.js';

/**
 * API response interface for paginated data
 * @interface PaginatedResponse
 * @template T - Type of data items in the response
 */
interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Vocabulary item interface
 * @interface VocabularyItem
 */
interface VocabularyItem {
  id: string;
  bulgarian: string;
  german: string;
  category: string;
  level: string;
  tags?: string[];
  examples?: string[];
  pronunciation?: string;
  difficulty?: number;
}

/**
 * Grammar item interface
 * @interface GrammarItem
 */
interface GrammarItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  examples: string[];
  rules: string[];
}

/**
 * Practice item interface
 * @interface PracticeItem
 */
interface PracticeItem {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  answer: string;
  category: string;
  level: string;
  difficulty: number;
  reviewType: 'due' | 'new' | 'review';
}

/**
 * Search result interface
 * @interface SearchResult
 */
interface SearchResult {
  type: 'vocabulary' | 'grammar';
  item: VocabularyItem | GrammarItem;
  relevance: number;
}

/**
 * Search response interface
 * @interface SearchResponse
 */
interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

/**
 * API metrics interface
 * @interface APIMetrics
 */
interface APIMetrics {
  requests: number;
  cacheHits: number;
  errors: number;
  avgResponseTime: number;
}

/**
 * Extended metrics with calculated values
 * @interface ExtendedMetrics
 * @extends APIMetrics
 */
interface ExtendedMetrics extends APIMetrics {
  cacheSize: number;
  cacheHitRate: string;
}

/**
 * Cache entry interface
 * @interface CacheEntry
 * @template T - Type of cached data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  timeout: number;
}

/**
 * Health check response interface
 * @interface HealthCheckResponse
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  statusCode?: number;
  error?: string;
  timestamp: string;
}

/**
 * Batch result interface
 * @interface BatchResult
 * @template T - Type of data in batch result
 */
interface BatchResult<T> {
  id: string;
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Vocabulary API options
 * @interface VocabularyOptions
 */
interface VocabularyOptions {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  direction?: 'bg-de' | 'de-bg';
  useCache?: boolean;
}

/**
 * Grammar API options
 * @interface GrammarOptions
 */
interface GrammarOptions {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  useCache?: boolean;
}

/**
 * Practice API options
 * @interface PracticeOptions
 */
interface PracticeOptions {
  count?: number;
  categories?: string[];
  levels?: string[];
  direction?: 'bg-de' | 'de-bg';
  reviewType?: 'due' | 'new' | 'review';
  useCache?: boolean;
}

/**
 * Search API options
 * @interface SearchOptions
 */
interface SearchOptions {
  type?: 'vocabulary' | 'grammar' | 'all';
  limit?: number;
  useCache?: boolean;
}

/**
 * API Client class for optimized data loading
 * Handles vocabulary, grammar, and practice data with caching and pagination
 * @class APIClient
 * @example
 * ```typescript
 * const api = new APIClient();
 * const vocab = await api.getVocabulary({ page: 1, limit: 20 });
 * const searchResults = await api.search('hello');
 * ```
 */
class APIClient {
  // private baseURL: string; // Not used
  private cache: Map<string, CacheEntry<unknown>>;
  private cacheTimeout: number;
  private requestQueue: Map<string, Promise<Response>>;
  private metrics: APIMetrics;

  /**
   * Create new API client instance
   * @constructor
   * @description Initializes the API client with default cache settings and metrics
   */
  constructor() {
    // this.baseURL = ''; // Not used
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    
    // Performance monitoring
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  /**
   * Get vocabulary items with pagination and filtering
   * @public
   * @param {VocabularyOptions} [options={}] - Query options for vocabulary request
   * @returns {Promise<PaginatedResponse<VocabularyItem>>} Paginated vocabulary items
   * @description Fetches vocabulary items with optional filtering, pagination, and caching
   * @example
   * ```typescript
   * const vocab = await api.getVocabulary({
   *   page: 1,
   *   limit: 50,
   *   category: 'verbs',
   *   level: 'A1'
   * });
   * ```
   */
  public async getVocabulary(options: VocabularyOptions = {}): Promise<PaginatedResponse<VocabularyItem>> {
    const {
      page = 1,
      limit = 50,
      category = '',
      level = '',
      search = '',
      direction = 'bg-de',
      useCache = true
    } = options;

    const cacheKey = `vocab-${page}-${limit}-${category}-${level}-${search}-${direction}`;
    
    // Check cache first
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category,
      level,
      search,
      direction
    });

    const url = `/api/vocabulary/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Vocabulary fetch failed:', error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.warn('[API Client] Using stale cache due to error');
        return this.cache.get(cacheKey)!.data;
      }
      
      throw error;
    }
  }

  /**
   * Get a single vocabulary item by ID
   * @public
   * @param {string} id - Vocabulary item ID
   * @returns {Promise<VocabularyItem>} Vocabulary item data
   * @description Fetches a specific vocabulary item with caching
   * @example
   * ```typescript
   * const item = await api.getVocabularyItem('word_123');
   * ```
   */
  public async getVocabularyItem(id: string): Promise<VocabularyItem> {
    const cacheKey = `vocab-item-${id}`;
    
    if (this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(`/api/vocabulary/${id}/`, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Vocabulary item fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get grammar items with pagination and filtering
   * @public
   * @param {GrammarOptions} [options={}] - Query options for grammar request
   * @returns {Promise<PaginatedResponse<GrammarItem>>} Paginated grammar items
   * @description Fetches grammar items with optional filtering and pagination
   * @example
   * ```typescript
   * const grammar = await api.getGrammar({
   *   page: 1,
   *   category: 'verbs',
   *   level: 'A1'
   * });
   * ```
   */
  public async getGrammar(options: GrammarOptions = {}): Promise<PaginatedResponse<GrammarItem>> {
    const {
      page = 1,
      limit = 20,
      category = '',
      level = '',
      useCache = true
    } = options;

    const cacheKey = `grammar-${page}-${limit}-${category}-${level}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category,
      level
    });

    const url = `/api/grammar/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Grammar fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get practice items for sessions
   * @public
   * @param {PracticeOptions} [options={}] - Options for practice item selection
   * @returns {Promise<PracticeItem[]>} Array of practice items
   * @description Fetches practice items based on specified criteria
   * @example
   * ```typescript
   * const items = await api.getPracticeItems({
   *   count: 20,
   *   categories: ['verbs'],
   *   reviewType: 'due'
   * });
   * ```
   */
  public async getPracticeItems(options: PracticeOptions = {}): Promise<PracticeItem[]> {
    const {
      count = 20,
      categories = [],
      levels = [],
      direction = 'bg-de',
      reviewType = 'due',
      useCache = false // Practice data should be fresh
    } = options;

    const cacheKey = `practice-${count}-${categories.join(',')}-${levels.join(',')}-${direction}-${reviewType}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      count: count.toString(),
      categories: categories.join(','),
      levels: levels.join(','),
      direction,
      review_type: reviewType
    });

    const url = `/api/practice/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data, 60_000); // Short cache for practice data
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Practice items fetch failed:', error);
      throw error;
    }
  }

  /**
   * Search across vocabulary and grammar
   * @public
   * @param {string} query - Search query string
   * @param {SearchOptions} [options={}] - Search options
   * @returns {Promise<SearchResponse>} Search results
   * @description Searches vocabulary and grammar content with caching
   * @example
   * ```typescript
   * const results = await api.search('hello', {
   *   type: 'vocabulary',
   *   limit: 10
   * });
   * ```
   */
  public async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const {
      type = 'all', // 'vocabulary', 'grammar', 'all'
      limit = 50,
      useCache = true
    } = options;

    if (!query || query.trim().length < 2) {
      return { results: [], total: 0, query };
    }

    const cacheKey = `search-${query}-${type}-${limit}`;
    
    if (useCache && this.isCached(cacheKey)) {
      this.metrics.cacheHits++;
      return this.getFromCache(cacheKey);
    }

    const params = new URLSearchParams({
      q: query.trim(),
      type,
      limit: limit.toString()
    });

    const url = `/api/search/?${params.toString()}`;
    
    try {
      const startTime = performance.now();
      const response = await this.fetchWithQueue(url, cacheKey);
      const endTime = performance.now();
      
      this.updateMetrics(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.metrics.errors++;
      console.error('[API Client] Search failed:', error);
      throw error;
    }
  }

  /**
   * Utility methods
   */

  /**
   * Fetch with request queuing to prevent duplicates
   * @private
   * @param {string} url - Request URL
   * @param {string} queueKey - Queue key for deduplication
   * @returns {Promise<Response>} Response object
   * @description Prevents duplicate requests by queuing identical requests
   */
  private async fetchWithQueue(url: string, queueKey: string): Promise<Response> {
    // Prevent duplicate requests
    if (this.requestQueue.has(queueKey)) {
      return this.requestQueue.get(queueKey)!;
    }

    const requestPromise = fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    this.requestQueue.set(queueKey, requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.requestQueue.delete(queueKey);
    }
  }

  /**
   * Check if data is cached and not expired
   * @private
   * @param {string} key - Cache key
   * @returns {boolean} True if cached and valid
   * @description Checks cache validity and removes expired entries
   */
  private isCached(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }
    
    const cached = this.cache.get(key)!;
    const isExpired = Date.now() - cached.timestamp > cached.timeout;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get data from cache
   * @private
   * @template T - Type of cached data
   * @param {string} key - Cache key
   * @returns {T} Cached data or null if not found
   * @description Retrieves data from cache if available
   */
  private getFromCache<T>(key: string): T {
    const cached = this.cache.get(key);
    return cached ? cached.data : null as T;
  }

  /**
   * Set data in cache with timeout
   * @private
   * @template T - Type of data to cache
   * @param {string} key - Cache key
   * @param {T} data - Data to cache
   * @param {number} [timeout=this.cacheTimeout] - Cache timeout in milliseconds
   * @description Stores data in cache with automatic cleanup for large caches
   */
  private setCache<T>(key: string, data: T, timeout: number = this.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout
    });

    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear cache entries
   * @public
   * @param {string | null} [pattern=null] - Pattern to match for selective clearing
   * @description Clears cache entries, optionally filtered by pattern
   * @example
   * ```typescript
   * api.clearCache(); // Clear all cache
   * api.clearCache('vocab'); // Clear vocabulary cache entries
   * ```
   */
  public clearCache(pattern: string | null = null): void {
    if (pattern) {
      // Clear cache entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Update performance metrics
   * @private
   * @param {number} responseTime - Response time in milliseconds
   * @description Updates internal performance tracking metrics
   */
  private updateMetrics(responseTime: number): void {
    this.metrics.requests++;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime) / 
      this.metrics.requests;
  }

  /**
   * Get API performance metrics
   * @public
   * @returns {ExtendedMetrics} Comprehensive metrics including cache statistics
   * @description Returns detailed performance metrics for monitoring
   * @example
   * ```typescript
   * const metrics = api.getMetrics();
   * console.log(`Cache hit rate: ${metrics.cacheHitRate}`);
   * console.log(`Average response time: ${metrics.avgResponseTime}ms`);
   * ```
   */
  public getMetrics(): ExtendedMetrics {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.requests > 0 ? 
        (this.metrics.cacheHits / this.metrics.requests * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Prefetch methods for performance optimization
   */

  /**
   * Prefetch vocabulary data for better performance
   * @public
   * @param {string[]} [categories=[]] - Categories to prefetch
   * @param {string[]} [levels=[]] - Levels to prefetch
   * @returns {Promise<void>} Promise that resolves when prefetching completes
   * @description Preloads vocabulary data to improve subsequent load times
   * @example
   * ```typescript
   * await api.prefetchVocabulary(['verbs', 'nouns'], ['A1', 'A2']);
   * ```
   */
  public async prefetchVocabulary(categories: string[] = [], levels: string[] = []): Promise<void> {
    const prefetchPromises: Promise<any>[] = [];
    
    // Prefetch first pages of each category/level combination
    for (const category of categories) {
      for (const level of levels) {
        prefetchPromises.push(
          this.getVocabulary({ 
            page: 1, 
            category, 
            level, 
            useCache: true 
          }).catch(() => {}) // Ignore prefetch errors
        );
      }
    }
    
    // Also prefetch without filters
    prefetchPromises.push(
      this.getVocabulary({ page: 1, useCache: true }).catch(() => {})
    );
    
    await Promise.allSettled(prefetchPromises);
    console.log('[API Client] Prefetch completed');
  }

  /**
   * Prefetch grammar data
   * @public
   * @returns {Promise<void>} Promise that resolves when prefetching completes
   * @description Preloads grammar data to improve subsequent load times
   * @example
   * ```typescript
   * await api.prefetchGrammar();
   * ```
   */
  public async prefetchGrammar(): Promise<void> {
    try {
      await this.getGrammar({ page: 1, useCache: true });
      console.log('[API Client] Grammar prefetch completed');
    } catch (error) {
      console.warn('[API Client] Grammar prefetch failed:', error);
    }
  }

  /**
   * Batch operations
   */

  /**
   * Batch get vocabulary items
   * @public
   * @param {string[]} ids - Array of vocabulary item IDs
   * @returns {Promise<BatchResult<VocabularyItem>[]>} Array of batch results
   * @description Fetches multiple vocabulary items in parallel with error handling
   * @example
   * ```typescript
   * const results = await api.batchGetVocabulary(['id1', 'id2', 'id3']);
   * results.forEach(result => {
   *   if (result.success) {
   *     console.log('Got item:', result.data);
   *   } else {
   *     console.error('Error:', result.error);
   *   }
   * });
   * ```
   */
  public async batchGetVocabulary(ids: string[]): Promise<BatchResult<VocabularyItem>[]> {
    const batchPromises = ids.map(id =>
      this.getVocabularyItem(id).catch(error => ({ error, id }))
    );
    
    const results = await Promise.allSettled(batchPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        const value = result.value;
        // Check if this is an error object from the catch handler
        return value && typeof value === 'object' && 'error' in value ? {
          id: ids[index] || `item-${index}`,
          success: false,
          data: null,
          error: (value as any).error
        } : {
          id: ids[index] || `item-${index}`,
          success: true,
          data: value as VocabularyItem,
          error: null
        };
      } else {
        return {
          id: ids[index] || `item-${index}`,
          success: false,
          data: null,
          error: result.reason
        };
      }
    });
  }

  /**
   * Health check
   */

  /**
   * Perform API health check
   * @public
   * @returns {Promise<HealthCheckResponse>} Health check response
   * @description Checks API availability and responsiveness
   * @example
   * ```typescript
   * const health = await api.healthCheck();
   * if (health.status === 'healthy') {
   *   console.log('API is healthy');
   * }
   * ```
   */
  public async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch('/api/health/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const apiClient = new APIClient();

export default apiClient;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  (window as any).apiClient = apiClient;
}