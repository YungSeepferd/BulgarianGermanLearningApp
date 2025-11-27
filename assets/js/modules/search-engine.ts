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
 * Search filters interface for internal filtering logic
 *
 * @interface SearchFilters
 * @property {string} [type] - Content type filter
 * @property {string} [category] - Category filter
 * @property {string} [level] - Level filter
 * @property {string} [direction] - Learning direction filter
 * @property {number} [minScore] - Minimum score filter
 */
interface SearchFilters {
  type?: string;
  category?: string;
  level?: string;
  direction?: string;
  minScore?: number;
}

/**
 * Document interface representing indexed content
 *
 * @interface Document
 * @property {string} id - Unique document identifier
 * @property {'vocabulary'|'grammar'} type - Document type
 * @property {string} title - Document title
 * @property {string} content - Full text content for searching
 * @property {string} category - Content category
 * @property {string} level - Difficulty level
 * @property {string} [source_lang] - Source language code
 * @property {string} [target_lang] - Target language code
 * @property {number} [difficulty] - Difficulty rating (1-5)
 * @property {number} [frequency] - Usage frequency
 * @property {string} url - Document URL
 * @property {any} data - Original document data
 *
 * @example
 * ```typescript
 * const doc: Document = {
 *   id: 'word-123',
 *   type: 'vocabulary',
 *   title: 'Hallo',
 *   content: 'Hallo Hello Greeting',
 *   category: 'greetings',
 *   level: 'A1',
 *   source_lang: 'de',
 *   target_lang: 'bg',
 *   difficulty: 1,
 *   frequency: 100,
 *   url: '/vocabulary/hallo/',
 *   data: originalVocabularyItem
 * };
 * ```
 */
interface Document {
  id: string;
  type: 'vocabulary' | 'grammar';
  title: string;
  content: string;
  category: string;
  level: string;
  source_lang?: string;
  target_lang?: string;
  difficulty?: number;
  frequency?: number;
  url: string;
  data: any;
}

/**
 * Term index data interface for tracking term occurrences
 *
 * @interface TermIndexData
 * @property {number} frequency - How many times term appears in document
 * @property {number[]} positions - Character positions where term occurs
 * @property {boolean} inTitle - Whether term appears in document title
 */
interface TermIndexData {
  frequency: number;
  positions: number[];
  inTitle: boolean;
}

/**
 * Search match interface for intermediate search results
 *
 * @interface SearchMatch
 * @property {Document} doc - The matching document
 * @property {number} score - Calculated relevance score
 * @property {Map<string, number>} termMatches - Map of terms to their scores
 */
interface SearchMatch {
  doc: Document;
  score: number;
  termMatches: Map<string, number>;
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
 * Vocabulary item interface for vocabulary data structure
 *
 * @interface VocabularyItem
 * @property {string} id - Unique item identifier
 * @property {string} word - The vocabulary word
 * @property {string} translation - Word translation
 * @property {string} [notes] - Additional notes
 * @property {string} [etymology] - Etymology information
 * @property {string} [cultural_note] - Cultural context notes
 * @property {string} [linguistic_note] - Linguistic notes
 * @property {Array<string|{text: string}>} [examples] - Usage examples
 * @property {string} category - Word category
 * @property {string} level - Difficulty level
 * @property {string} [source_lang] - Source language code
 * @property {string} [target_lang] - Target language code
 * @property {number} [difficulty] - Difficulty rating
 * @property {number} [frequency] - Usage frequency
 */
interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  notes?: string;
  etymology?: string;
  cultural_note?: string;
  linguistic_note?: string;
  examples?: Array<string | { text: string }>;
  category: string;
  level: string;
  source_lang?: string;
  target_lang?: string;
  difficulty?: number;
  frequency?: number;
}

/**
 * Grammar item interface for grammar data structure
 *
 * @interface GrammarItem
 * @property {string} [id] - Unique item identifier
 * @property {string} title - Grammar rule title
 * @property {string} [description] - Rule description
 * @property {string} [content] - Full content
 * @property {string} [examples] - Usage examples
 * @property {Array<string|{text: string}>} [rules] - Grammar rules
 * @property {string} [category] - Grammar category
 * @property {string} [level] - Difficulty level
 * @property {number} [difficulty] - Difficulty rating
 * @property {string} [slug] - URL-friendly slug
 */
interface GrammarItem {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  examples?: string;
  rules?: Array<string | { text: string }>;
  category?: string;
  level?: string;
  difficulty?: number;
  slug?: string;
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
class SearchEngine {
  /** Inverted index mapping terms to document occurrences */
  private index: Map<string, Map<string, TermIndexData>>;
  /** Map of all indexed documents */
  private documents: Map<string, Document>;
  /** Set of stop words to exclude from indexing */
  private stopWords: Set<string>;
  /** Array of search history entries */
  private searchHistory: SearchHistoryEntry[];
  /** Maximum number of history entries to keep */
  private maxHistorySize: number;
  /** Search performance statistics */
  private searchStats: SearchStats;
  /** Whether the search index is built and ready */
  private isIndexed: boolean;
  /** Promise for ongoing indexing operation */
  private indexingPromise: Promise<void> | null;

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
  constructor() {
    this.index = new Map();
    this.documents = new Map();
    this.stopWords = new Set([
      // German stop words
      'der', 'die', 'das', 'und', 'oder', 'aber', 'mit', 'von', 'zu', 'in', 'auf', 'für', 'ist', 'sind', 'war', 'waren',
      // Bulgarian stop words
      'и', 'или', 'но', 'с', 'от', 'до', 'в', 'на', 'за', 'е', 'са', 'беше', 'бяха', 'това', 'тази', 'този',
      // English stop words
      'the', 'and', 'or', 'but', 'with', 'from', 'to', 'in', 'on', 'for', 'is', 'are', 'was', 'were'
    ]);
    
    this.searchHistory = [];
    this.maxHistorySize = 100;
    this.searchStats = {
      totalSearches: 0,
      avgResponseTime: 0,
      popularTerms: new Map()
    };
    
    this.isIndexed = false;
    this.indexingPromise = null;
  }

  // Index building
  public async buildIndex(data: SearchData): Promise<void> {
    if (this.indexingPromise) {
      return this.indexingPromise;
    }

    this.indexingPromise = this._buildIndexInternal(data);
    return this.indexingPromise;
  }

  private async _buildIndexInternal(data: SearchData): Promise<void> {
    console.log('[SearchEngine] Building search index...');
    const startTime = performance.now();
    
    try {
      // Clear existing index
      this.index.clear();
      this.documents.clear();
      
      // Index vocabulary items
      if (data.vocabulary) {
        await this.indexVocabulary(data.vocabulary);
      }
      
      // Index grammar items
      if (data.grammar) {
        await this.indexGrammar(data.grammar);
      }
      
      // Optimize index for search performance
      this.optimizeIndex();
      
      this.isIndexed = true;
      const endTime = performance.now();
      
      console.log(`[SearchEngine] Index built in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[SearchEngine] Indexed ${this.documents.size} documents with ${this.index.size} terms`);
      
    } catch (error) {
      console.error('[SearchEngine] Index building failed:', error);
      throw error;
    } finally {
      this.indexingPromise = null;
    }
  }

  private async indexVocabulary(vocabulary: VocabularyItem[]): Promise<void> {
    for (const item of vocabulary) {
      const doc: Document = {
        id: item.id,
        type: 'vocabulary',
        title: item.word,
        content: this.buildVocabularyContent(item),
        category: item.category,
        level: item.level,
        source_lang: item.source_lang || 'bg',
        target_lang: item.target_lang || 'de',
        difficulty: item.difficulty || 1,
        frequency: item.frequency || 1,
        url: `/vocabulary/${item.word}/`,
        data: item
      };
      
      this.documents.set(doc.id, doc);
      this.indexDocument(doc);
    }
  }

  private async indexGrammar(grammar: GrammarItem[]): Promise<void> {
    for (const item of grammar) {
      const doc: Document = {
        id: item.id || `grammar-${item.title}`,
        type: 'grammar',
        title: item.title,
        content: this.buildGrammarContent(item),
        category: item.category || 'grammar',
        level: item.level || 'A1',
        difficulty: item.difficulty || 1,
        url: `/grammar/${item.slug || item.title}/`,
        data: item
      };
      
      this.documents.set(doc.id, doc);
      this.indexDocument(doc);
    }
  }

  private buildVocabularyContent(item: VocabularyItem): string {
    const parts: string[] = [
      item.word,
      item.translation,
      item.notes || '',
      item.etymology || '',
      item.cultural_note || '',
      item.linguistic_note || ''
    ];
    
    if (item.examples && Array.isArray(item.examples)) {
      parts.push(...item.examples.map(ex => (typeof ex === 'string' ? ex : (ex as any).text || ex)));
    }
    
    return parts.filter(Boolean).join(' ');
  }

  private buildGrammarContent(item: GrammarItem): string {
    const parts: string[] = [
      item.title,
      item.description || '',
      item.content || '',
      item.examples || ''
    ];
    
    if (item.rules && Array.isArray(item.rules)) {
      parts.push(...item.rules.map(rule => (typeof rule === 'string' ? rule : (rule as any).text || rule)));
    }
    
    return parts.filter(Boolean).join(' ');
  }

  private indexDocument(doc: Document): void {
    const terms = this.extractTerms(doc.content + ' ' + doc.title);
    
    for (const term of terms) {
      if (!this.index.has(term)) {
        this.index.set(term, new Map());
      }
      
      const termIndex = this.index.get(term)!;
      if (!termIndex.has(doc.id)) {
        termIndex.set(doc.id, {
          frequency: 0,
          positions: [],
          inTitle: doc.title.toLowerCase().includes(term)
        });
      }
      
      const docEntry = termIndex.get(doc.id)!;
      docEntry.frequency++;
    }
  }

  private extractTerms(text: string): string[] {
    // Normalize text: lowercase, remove punctuation, split into words
    const normalized = text
      .toLowerCase()
      .replaceAll(/[^\s\w\u0400-\u04FF]/g, ' ') // Keep Cyrillic characters
      .replaceAll(/\s+/g, ' ')
      .trim();
    
    const words = normalized.split(' ');
    const terms = new Set<string>();
    
    for (const word of words) {
      if (word.length < 2 || this.stopWords.has(word)) {
        continue;
      }
      
      // Add the word itself
      terms.add(word);
      
      // Add prefixes for partial matching
      for (let i = 2; i <= Math.min(word.length, 6); i++) {
        terms.add(word.slice(0, Math.max(0, i)));
      }
      
      // Add suffixes for inflected forms
      if (word.length > 4) {
        for (let i = Math.max(2, word.length - 3); i < word.length; i++) {
          terms.add(word.slice(Math.max(0, i)));
        }
      }
    }
    
    return [...terms];
  }

  private optimizeIndex(): void {
    // Remove very common terms that don't add value
    const docCount = this.documents.size;
    const maxDocFreq = docCount * 0.8; // Terms in >80% of docs
    
    for (const [term, termIndex] of this.index.entries()) {
      if (termIndex.size > maxDocFreq) {
        this.index.delete(term);
      }
    }
  }

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
  public async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = performance.now();
    
    try {
      // Ensure index is built
      if (!this.isIndexed) {
        throw new Error('Search index not ready. Call buildIndex() first.');
      }
      
      const {
        type = 'all', // 'vocabulary', 'grammar', 'all'
        category = '',
        level = '',
        limit = 50,
        offset = 0,
        sortBy = 'relevance', // 'relevance', 'alphabetical', 'difficulty'
        direction = '',
        minScore = 0.1
      } = options;
      
      // Parse and normalize query
      const searchTerms = this.parseQuery(query);
      if (searchTerms.length === 0) {
        return { results: [], total: 0, query, responseTime: 0, suggestions: [] };
      }
      
      // Find matching documents
      const matches = this.findMatches(searchTerms, {
        type, category, level, direction, minScore
      });
      
      // Sort results
      const sortedResults = this.sortResults(matches, sortBy);
      
      // Apply pagination
      const paginatedResults = sortedResults.slice(offset, offset + limit);
      
      // Build result objects
      const results = paginatedResults.map(match => this.buildResult(match, searchTerms));
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Update statistics
      this.updateSearchStats(query, responseTime, results.length);
      
      return {
        results,
        total: sortedResults.length,
        query,
        responseTime,
        suggestions: this.generateSuggestions(query, results.length)
      };
      
    } catch (error) {
      console.error('[SearchEngine] Search failed:', error);
      throw error;
    }
  }

  private parseQuery(query: string): string[] {
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    // Handle quoted phrases
    const phrases: string[] = [];
    const quotedRegex = /"([^"]+)"/g;
    let match: RegExpExecArray | null;
    
    while ((match = quotedRegex.exec(query)) !== null) {
      phrases.push(match[1].toLowerCase().trim());
    }
    
    // Remove quoted phrases from query and get individual terms
    const remainingQuery = query.replaceAll(quotedRegex, '').trim();
    const individualTerms = this.extractTerms(remainingQuery);
    
    return [...phrases, ...individualTerms].filter(term => term.length >= 2);
  }

  private findMatches(searchTerms: string[], filters: SearchFilters): SearchMatch[] {
    const matches = new Map<string, SearchMatch>();
    
    for (const term of searchTerms) {
      const termMatches = this.findTermMatches(term);
      
      for (const [docId, termScore] of termMatches) {
        const doc = this.documents.get(docId);
        
        if (!doc) continue;
        
        // Apply filters
        if (!this.passesFilters(doc, filters)) {
          continue;
        }
        
        if (!matches.has(docId)) {
          matches.set(docId, {
            doc,
            score: 0,
            termMatches: new Map()
          });
        }
        
        const match = matches.get(docId)!;
        match.score += termScore;
        match.termMatches.set(term, termScore);
      }
    }
    
    // Calculate final scores
    for (const match of matches.values()) {
      match.score = this.calculateRelevanceScore(match, searchTerms);
    }
    
    return [...matches.values()];
  }

  private findTermMatches(term: string): Map<string, number> {
    const matches = new Map<string, number>();
    
    // Exact matches
    if (this.index.has(term)) {
      const termIndex = this.index.get(term)!;
      for (const [docId, docData] of termIndex) {
        matches.set(docId, docData.frequency * (docData.inTitle ? 2 : 1));
      }
    }
    
    // Fuzzy matches for longer terms
    if (term.length >= 4) {
      for (const [indexTerm, termIndex] of this.index) {
        if (indexTerm !== term && this.isFuzzyMatch(term, indexTerm)) {
          const fuzzyScore = this.calculateFuzzyScore(term, indexTerm);
          
          for (const [docId, docData] of termIndex) {
            const currentScore = matches.get(docId) || 0;
            const newScore = docData.frequency * fuzzyScore * (docData.inTitle ? 1.5 : 1);
            matches.set(docId, Math.max(currentScore, newScore));
          }
        }
      }
    }
    
    return matches;
  }

  private isFuzzyMatch(term1: string, term2: string): boolean {
    // Simple fuzzy matching based on edit distance
    if (Math.abs(term1.length - term2.length) > 2) {
      return false;
    }
    
    const distance = this.levenshteinDistance(term1, term2);
    const maxDistance = Math.floor(Math.max(term1.length, term2.length) * 0.3);
    
    return distance <= maxDistance;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array.from({ length: str2.length + 1 }).fill(null).map(() => 
      Array.from({ length: str1.length + 1 }).fill(0)
    ) as number[][];
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateFuzzyScore(term1: string, term2: string): number {
    const distance = this.levenshteinDistance(term1, term2);
    const maxLength = Math.max(term1.length, term2.length);
    return Math.max(0, (maxLength - distance) / maxLength) * 0.7;
  }

  private passesFilters(doc: Document, filters: SearchFilters): boolean {
    if (filters.type && filters.type !== 'all' && doc.type !== filters.type) {
      return false;
    }
    
    if (filters.category && doc.category !== filters.category) {
      return false;
    }
    
    if (filters.level && doc.level !== filters.level) {
      return false;
    }
    
    if (filters.direction) {
      const [source, target] = filters.direction.split('-');
      if (doc.source_lang !== source || doc.target_lang !== target) {
        return false;
      }
    }
    
    return true;
  }

  private calculateRelevanceScore(match: SearchMatch, searchTerms: string[]): number {
    const doc = match.doc;
    let score = match.score;
    
    // Boost score based on document properties
    if (doc.type === 'vocabulary') {
      score *= 1.2; // Slight preference for vocabulary
    }
    
    // Boost based on difficulty (easier items rank higher for beginners)
    if (doc.difficulty) {
      score *= (6 - doc.difficulty) / 5;
    }
    
    // Boost based on frequency (more common words rank higher)
    if (doc.frequency) {
      score *= Math.log(doc.frequency + 1);
    }
    
    // Boost for title matches
    const titleTerms = this.extractTerms(doc.title);
    const titleMatches = searchTerms.filter(term => 
      titleTerms.some(titleTerm => titleTerm.includes(term) || term.includes(titleTerm))
    );
    
    if (titleMatches.length > 0) {
      score *= 1.5;
    }
    
    // Normalize score
    return score / Math.max(1, searchTerms.length);
  }

  private sortResults(matches: SearchMatch[], sortBy: string): SearchMatch[] {
    const sortFunctions: Record<string, (a: SearchMatch, b: SearchMatch) => number> = {
      alphabetical: (a, b) => a.doc.title.localeCompare(b.doc.title),
      difficulty: (a, b) => (a.doc.difficulty || 1) - (b.doc.difficulty || 1),
      relevance: (a, b) => b.score - a.score
    };
    
    const sortFunction = sortFunctions[sortBy] || sortFunctions.relevance;
    return matches.sort(sortFunction);
  }

  private buildResult(match: SearchMatch, searchTerms: string[]): SearchResult {
    const doc = match.doc;
    
    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      snippet: this.generateSnippet(doc.content, searchTerms),
      category: doc.category,
      level: doc.level,
      url: doc.url,
      score: match.score,
      highlights: this.generateHighlights(doc, searchTerms),
      data: doc.data
    };
  }

  private generateSnippet(content: string, searchTerms: string[], maxLength: number = 200): string {
    const sentences = content.split(/[!.?]+/);
    let bestSentence = '';
    let maxMatches = 0;
    
    for (const sentence of sentences) {
      const matches = searchTerms.filter(term => 
        sentence.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence.trim();
      }
    }
    
    if (bestSentence.length > maxLength) {
      bestSentence = bestSentence.slice(0, Math.max(0, maxLength)) + '...';
    }
    
    return bestSentence || content.slice(0, Math.max(0, maxLength)) + '...';
  }

  private generateHighlights(doc: Document, searchTerms: string[]): Highlight[] {
    const highlights: Highlight[] = [];
    
    for (const term of searchTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\w*`, 'gi');
      const titleMatches = doc.title.match(regex) || [];
      const contentMatches = doc.content.match(regex) || [];
      
      if (titleMatches.length > 0 || contentMatches.length > 0) {
        highlights.push({
          term,
          titleMatches,
          contentMatches: contentMatches.slice(0, 5) // Limit content matches
        });
      }
    }
    
    return highlights;
  }

  private escapeRegex(string: string): string {
    return string.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
  }

  // Search suggestions and autocomplete
  private generateSuggestions(query: string, resultCount: number): string[] {
    if (resultCount > 0) {
      return []; // No suggestions needed if we have results
    }
    
    const suggestions: string[] = [];
    const queryTerms = this.extractTerms(query);
    
    // Find similar terms in the index
    for (const [indexTerm] of this.index) {
      for (const queryTerm of queryTerms) {
        if (indexTerm.includes(queryTerm) || queryTerm.includes(indexTerm)) {
          suggestions.push(indexTerm);
        }
      }
    }
    
    // Add popular search terms
    const popularTerms = [...this.searchStats.popularTerms.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term]) => term);
    
    suggestions.push(...popularTerms);
    
    return [...new Set(suggestions)].slice(0, 5);
  }

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
  public async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const queryLower = query.toLowerCase();
    const suggestions: string[] = [];
    
    // Find terms that start with the query
    for (const [term] of this.index) {
      if (term.startsWith(queryLower) && term !== queryLower) {
        suggestions.push(term);
        
        if (suggestions.length >= limit) {
          break;
        }
      }
    }
    
    return suggestions;
  }

  // Statistics and analytics
  private updateSearchStats(query: string, responseTime: number, resultCount: number): void {
    this.searchStats.totalSearches++;
    
    // Update average response time
    const totalTime = this.searchStats.avgResponseTime * (this.searchStats.totalSearches - 1) + responseTime;
    this.searchStats.avgResponseTime = totalTime / this.searchStats.totalSearches;
    
    // Track popular terms
    const terms = this.extractTerms(query);
    for (const term of terms) {
      const count = this.searchStats.popularTerms.get(term) || 0;
      this.searchStats.popularTerms.set(term, count + 1);
    }
    
    // Add to search history
    this.searchHistory.unshift({
      query,
      resultCount,
      timestamp: Date.now(),
      responseTime
    });
    
    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
  }

  public getSearchStats(): ExtendedSearchStats {
    return {
      ...this.searchStats,
      indexSize: this.index.size,
      documentCount: this.documents.size,
      isIndexed: this.isIndexed,
      recentSearches: this.searchHistory.slice(0, 10)
    };
  }

  // Utility methods
  public clearIndex(): void {
    this.index.clear();
    this.documents.clear();
    this.isIndexed = false;
  }

  public getIndexInfo(): IndexInfo {
    return {
      termCount: this.index.size,
      documentCount: this.documents.size,
      isIndexed: this.isIndexed,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate index size
    for (const [term, termIndex] of this.index) {
      size += term.length * 2; // Rough estimate for string
      size += termIndex.size * 50; // Rough estimate for term data
    }
    
    // Estimate document size
    for (const [, doc] of this.documents) {
      size += JSON.stringify(doc).length * 2;
    }
    
    return size;
  }

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
  public get isReady(): boolean {
    return this.isIndexed;
  }

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
  public get documentCount(): number {
    return this.documents.size;
  }

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
  public get termCount(): number {
    return this.index.size;
  }
}

// Create and export singleton instance
const searchEngine = new SearchEngine();

export default searchEngine;