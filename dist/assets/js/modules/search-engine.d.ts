/**
 * Enhanced Search Engine with Full-Text Indexing
 *
 * Provides fast, accurate search across vocabulary and grammar content
 * with advanced features including fuzzy matching, autocomplete, search
 * suggestions, and comprehensive analytics.
 *
 * Features:
 * - Full-text indexing with term frequency and position tracking
 * - Fuzzy matching using Levenshtein distance
 * - Search suggestions and autocomplete
 * - Multi-language support (German, Bulgarian, English)
 * - Performance analytics and search history
 * - Configurable sorting and filtering
 * - Snippet generation and highlighting
 *
 * @example
 * ```typescript
 * import searchEngine from './modules/search-engine.js';
 *
 * // Build search index
 * await searchEngine.buildIndex({
 *   vocabulary: vocabularyData,
 *   grammar: grammarData
 * });
 *
 * // Perform search
 * const results = await searchEngine.search('hello world', {
 *   type: 'vocabulary',
 *   level: 'A1',
 *   limit: 10
 * });
 *
 * console.log(`Found ${results.total} results in ${results.responseTime}ms`);
 * ```
 *
 * @since 1.0.0
 */
/**
 * Search options interface for configuring search behavior
 *
 * @interface SearchOptions
 * @property {'vocabulary'|'grammar'|'all'} [type='all'] - Content type to search
 * @property {string} [category] - Filter by category (e.g., 'nouns', 'verbs')
 * @property {string} [level] - Filter by difficulty level (e.g., 'A1', 'B2')
 * @property {number} [limit=50] - Maximum number of results to return
 * @property {number} [offset=0] - Number of results to skip (pagination)
 * @property {'relevance'|'alphabetical'|'difficulty'} [sortBy='relevance'] - Sort order
 * @property {string} [direction] - Learning direction filter (e.g., 'bg-de')
 * @property {number} [minScore=0.1] - Minimum relevance score threshold
 *
 * @example
 * ```typescript
 * const options: SearchOptions = {
 *   type: 'vocabulary',
 *   category: 'nouns',
 *   level: 'A1',
 *   limit: 20,
 *   sortBy: 'relevance',
 *   minScore: 0.3
 * };
 * ```
 */
interface SearchOptions {
    type?: 'vocabulary' | 'grammar' | 'all';
    category?: string;
    level?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'alphabetical' | 'difficulty';
    direction?: string;
    minScore?: number;
}
/**
 * Search result interface for final search output
 *
 * @interface SearchResult
 * @property {string} id - Result identifier
 * @property {'vocabulary'|'grammar'} type - Result type
 * @property {string} title - Result title
 * @property {string} snippet - Content snippet with highlights
 * @property {string} category - Result category
 * @property {string} level - Difficulty level
 * @property {string} url - Result URL
 * @property {number} score - Relevance score
 * @property {Highlight[]} highlights - Search term highlights
 * @property {any} data - Original document data
 *
 * @example
 * ```typescript
 * const result: SearchResult = {
 *   id: 'word-123',
 *   type: 'vocabulary',
 *   title: 'Hallo',
 *   snippet: 'Hallo - <mark>Hello</mark> (Greeting)',
 *   category: 'greetings',
 *   level: 'A1',
 *   url: '/vocabulary/hallo/',
 *   score: 0.95,
 *   highlights: [{ term: 'hello', titleMatches: ['Hallo'], contentMatches: ['Hello'] }],
 *   data: vocabularyItem
 * };
 * ```
 */
interface SearchResult {
    id: string;
    type: 'vocabulary' | 'grammar';
    title: string;
    snippet: string;
    category: string;
    level: string;
    url: string;
    score: number;
    highlights: Highlight[];
    data: any;
}
/**
 * Highlight interface for search term matches
 *
 * @interface Highlight
 * @property {string} term - The search term
 * @property {string[]} titleMatches - Matches found in title
 * @property {string[]} contentMatches - Matches found in content
 */
interface Highlight {
    term: string;
    titleMatches: string[];
    contentMatches: string[];
}
/**
 * Search response interface containing complete search results
 *
 * @interface SearchResponse
 * @property {SearchResult[]} results - Array of search results
 * @property {number} total - Total number of matching documents
 * @property {string} query - Original search query
 * @property {number} responseTime - Search execution time in milliseconds
 * @property {string[]} suggestions - Search suggestions for better results
 *
 * @example
 * ```typescript
 * const response: SearchResponse = {
 *   results: [result1, result2, result3],
 *   total: 25,
 *   query: 'hello',
 *   responseTime: 12.5,
 *   suggestions: ['hallo', 'greeting', 'welcome']
 * };
 * ```
 */
interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
    responseTime: number;
    suggestions: string[];
}
/**
 * Search history entry interface for tracking search analytics
 *
 * @interface SearchHistoryEntry
 * @property {string} query - Search query
 * @property {number} resultCount - Number of results returned
 * @property {number} timestamp - Search timestamp
 * @property {number} responseTime - Search response time
 */
interface SearchHistoryEntry {
    query: string;
    resultCount: number;
    timestamp: number;
    responseTime: number;
}
/**
 * Search statistics interface for performance analytics
 *
 * @interface SearchStats
 * @property {number} totalSearches - Total number of searches performed
 * @property {number} avgResponseTime - Average response time across all searches
 * @property {Map<string, number>} popularTerms - Map of terms to their search frequency
 */
interface SearchStats {
    totalSearches: number;
    avgResponseTime: number;
    popularTerms: Map<string, number>;
}
/**
 * Extended search statistics interface with additional metrics
 *
 * @interface ExtendedSearchStats
 * @extends SearchStats
 * @property {number} indexSize - Number of terms in search index
 * @property {number} documentCount - Number of indexed documents
 * @property {boolean} isIndexed - Whether index is built and ready
 * @property {SearchHistoryEntry[]} recentSearches - Recent search history
 */
interface ExtendedSearchStats extends SearchStats {
    indexSize: number;
    documentCount: number;
    isIndexed: boolean;
    recentSearches: SearchHistoryEntry[];
}
/**
 * Index info interface for index status and metrics
 *
 * @interface IndexInfo
 * @property {number} termCount - Number of indexed terms
 * @property {number} documentCount - Number of indexed documents
 * @property {boolean} isIndexed - Whether index is ready
 * @property {number} memoryUsage - Estimated memory usage in bytes
 */
interface IndexInfo {
    termCount: number;
    documentCount: number;
    isIndexed: boolean;
    memoryUsage: number;
}
/**
 * Search data interface for index building
 *
 * @interface SearchData
 * @property {any[]} [vocabulary] - Array of vocabulary items to index
 * @property {any[]} [grammar] - Array of grammar items to index
 */
interface SearchData {
    vocabulary?: any[];
    grammar?: any[];
}
/**
 * Search Engine class
 *
 * A powerful full-text search engine with advanced features including:
 * - Inverted index with term frequency and position tracking
 * - Fuzzy matching using Levenshtein distance algorithm
 * - Multi-language stop words and text processing
 * - Search suggestions and autocomplete functionality
 * - Performance analytics and search history tracking
 * - Configurable sorting, filtering, and pagination
 * - Snippet generation with search term highlighting
 *
 * The engine supports both vocabulary and grammar content with
 * optimized indexing and fast search performance.
 *
 * @class SearchEngine
 *
 * @example
 * ```typescript
 * import searchEngine from './modules/search-engine.js';
 *
 * // Initialize with data
 * await searchEngine.buildIndex({
 *   vocabulary: vocabularyItems,
 *   grammar: grammarItems
 * });
 *
 * // Perform searches
 * const results = await searchEngine.search('hello', {
 *   type: 'vocabulary',
 *   level: 'A1',
 *   limit: 10
 * });
 *
 * // Get autocomplete suggestions
 * const suggestions = await searchEngine.getAutocompleteSuggestions('hel');
 *
 * // Access statistics
 * const stats = searchEngine.getSearchStats();
 * console.log(`Indexed ${stats.documentCount} documents`);
 * ```
 *
 * @since 1.0.0
 */
declare class SearchEngine {
    /** Inverted index mapping terms to document occurrences */
    private index;
    /** Map of all indexed documents */
    private documents;
    /** Set of stop words to exclude from indexing */
    private stopWords;
    /** Array of search history entries */
    private searchHistory;
    /** Maximum number of history entries to keep */
    private maxHistorySize;
    /** Search performance statistics */
    private searchStats;
    /** Whether the search index is built and ready */
    private isIndexed;
    /** Promise for ongoing indexing operation */
    private indexingPromise;
    /**
     * Creates a new SearchEngine instance
     *
     * @constructor
     *
     * @example
     * ```typescript
     * const searchEngine = new SearchEngine();
     *
     * // Engine is ready for indexing
     * await searchEngine.buildIndex(data);
     * ```
     */
    constructor();
    buildIndex(data: SearchData): Promise<void>;
    private _buildIndexInternal;
    private indexVocabulary;
    private indexGrammar;
    private buildVocabularyContent;
    private buildGrammarContent;
    private indexDocument;
    private extractTerms;
    private optimizeIndex;
    /**
     * Performs a search query against the indexed content
     *
     * This method executes a full-text search with support for:
     * - Fuzzy matching and partial term matching
     * - Filtering by type, category, level, and direction
     * - Configurable sorting and pagination
     * - Search suggestions when no results found
     * - Performance tracking and analytics
     *
     * @public
     * @async
     * @param {string} query - Search query string
     * @param {SearchOptions} [options={}] - Search configuration options
     * @returns {Promise<SearchResponse>} Search results with metadata
     * @throws {Error} When search index is not built
     *
     * @example
     * ```typescript
     * // Basic search
     * const results = await searchEngine.search('hello');
     *
     * // Advanced search with filters
     * const results = await searchEngine.search('greeting', {
     *   type: 'vocabulary',
     *   category: 'greetings',
     *   level: 'A1',
     *   limit: 20,
     *   sortBy: 'relevance'
     * });
     *
     * console.log(`Found ${results.total} results in ${results.responseTime}ms`);
     * results.results.forEach(result => {
     *   console.log(`${result.title}: ${result.snippet}`);
     * });
     * ```
     */
    search(query: string, options?: SearchOptions): Promise<SearchResponse>;
    private parseQuery;
    private findMatches;
    private findTermMatches;
    private isFuzzyMatch;
    private levenshteinDistance;
    private calculateFuzzyScore;
    private passesFilters;
    private calculateRelevanceScore;
    private sortResults;
    private buildResult;
    private generateSnippet;
    private generateHighlights;
    private escapeRegex;
    private generateSuggestions;
    /**
     * Gets autocomplete suggestions for a partial query
     *
     * This method provides real-time autocomplete suggestions by
     * finding indexed terms that start with the provided query.
     * Useful for search input fields and type-ahead functionality.
     *
     * @public
     * @async
     * @param {string} query - Partial search query
     * @param {number} [limit=10] - Maximum number of suggestions to return
     * @returns {Promise<string[]>} Array of suggestion strings
     *
     * @example
     * ```typescript
     * // Get suggestions for partial query
     * const suggestions = await searchEngine.getAutocompleteSuggestions('hel');
     * console.log(suggestions); // ['hello', 'help', 'helmet', ...]
     *
     * // Limit number of suggestions
     * const suggestions = await searchEngine.getAutocompleteSuggestions('g', 5);
     * ```
     */
    getAutocompleteSuggestions(query: string, limit?: number): Promise<string[]>;
    private updateSearchStats;
    getSearchStats(): ExtendedSearchStats;
    clearIndex(): void;
    getIndexInfo(): IndexInfo;
    private estimateMemoryUsage;
    /**
     * Gets whether the search index is built and ready
     *
     * @public
     * @readonly
     * @type {boolean}
     * @returns {boolean} True if index is ready for searching
     *
     * @example
     * ```typescript
     * if (searchEngine.isReady) {
     *   const results = await searchEngine.search('hello');
     * } else {
     *   console.log('Search index not ready yet');
     * }
     * ```
     */
    get isReady(): boolean;
    /**
     * Gets the number of indexed documents
     *
     * @public
     * @readonly
     * @type {number}
     * @returns {number} Total number of documents in the index
     *
     * @example
     * ```typescript
     * console.log(`Indexed ${searchEngine.documentCount} documents`);
     * ```
     */
    get documentCount(): number;
    /**
     * Gets the number of indexed terms
     *
     * @public
     * @readonly
     * @type {number}
     * @returns {number} Total number of unique terms in the index
     *
     * @example
     * ```typescript
     * console.log(`Indexed ${searchEngine.termCount} unique terms`);
     * ```
     */
    get termCount(): number;
}
declare const searchEngine: SearchEngine;
export default searchEngine;
//# sourceMappingURL=search-engine.d.ts.map