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
declare class APIClient {
    private cache;
    private cacheTimeout;
    private requestQueue;
    private metrics;
    /**
     * Create new API client instance
     * @constructor
     * @description Initializes the API client with default cache settings and metrics
     */
    constructor();
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
    getVocabulary(options?: VocabularyOptions): Promise<PaginatedResponse<VocabularyItem>>;
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
    getVocabularyItem(id: string): Promise<VocabularyItem>;
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
    getGrammar(options?: GrammarOptions): Promise<PaginatedResponse<GrammarItem>>;
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
    getPracticeItems(options?: PracticeOptions): Promise<PracticeItem[]>;
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
    search(query: string, options?: SearchOptions): Promise<SearchResponse>;
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
    private fetchWithQueue;
    /**
     * Check if data is cached and not expired
     * @private
     * @param {string} key - Cache key
     * @returns {boolean} True if cached and valid
     * @description Checks cache validity and removes expired entries
     */
    private isCached;
    /**
     * Get data from cache
     * @private
     * @template T - Type of cached data
     * @param {string} key - Cache key
     * @returns {T} Cached data or null if not found
     * @description Retrieves data from cache if available
     */
    private getFromCache;
    /**
     * Set data in cache with timeout
     * @private
     * @template T - Type of data to cache
     * @param {string} key - Cache key
     * @param {T} data - Data to cache
     * @param {number} [timeout=this.cacheTimeout] - Cache timeout in milliseconds
     * @description Stores data in cache with automatic cleanup for large caches
     */
    private setCache;
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
    clearCache(pattern?: string | null): void;
    /**
     * Update performance metrics
     * @private
     * @param {number} responseTime - Response time in milliseconds
     * @description Updates internal performance tracking metrics
     */
    private updateMetrics;
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
    getMetrics(): ExtendedMetrics;
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
    prefetchVocabulary(categories?: string[], levels?: string[]): Promise<void>;
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
    prefetchGrammar(): Promise<void>;
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
    batchGetVocabulary(ids: string[]): Promise<BatchResult<VocabularyItem>[]>;
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
    healthCheck(): Promise<HealthCheckResponse>;
}
declare const apiClient: APIClient;
export default apiClient;
//# sourceMappingURL=api-client.d.ts.map