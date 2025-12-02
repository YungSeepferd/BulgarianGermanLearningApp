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
    async buildIndex(data) {
        if (this.indexingPromise) {
            return this.indexingPromise;
        }
        this.indexingPromise = this._buildIndexInternal(data);
        return this.indexingPromise;
    }
    async _buildIndexInternal(data) {
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
        }
        catch (error) {
            console.error('[SearchEngine] Index building failed:', error);
            throw error;
        }
        finally {
            this.indexingPromise = null;
        }
    }
    async indexVocabulary(vocabulary) {
        for (const item of vocabulary) {
            const doc = {
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
    async indexGrammar(grammar) {
        for (const item of grammar) {
            const doc = {
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
    buildVocabularyContent(item) {
        const parts = [
            item.word,
            item.translation,
            item.notes || '',
            item.etymology || '',
            item.cultural_note || '',
            item.linguistic_note || ''
        ];
        if (item.examples && Array.isArray(item.examples)) {
            parts.push(...item.examples.map(ex => typeof ex === 'string' ? ex : ex.text || ex));
        }
        return parts.filter(Boolean).join(' ');
    }
    buildGrammarContent(item) {
        const parts = [
            item.title,
            item.description || '',
            item.content || '',
            item.examples || ''
        ];
        if (item.rules && Array.isArray(item.rules)) {
            parts.push(...item.rules.map(rule => typeof rule === 'string' ? rule : rule.text || rule));
        }
        return parts.filter(Boolean).join(' ');
    }
    indexDocument(doc) {
        const terms = this.extractTerms(doc.content + ' ' + doc.title);
        for (const term of terms) {
            if (!this.index.has(term)) {
                this.index.set(term, new Map());
            }
            const termIndex = this.index.get(term);
            if (!termIndex.has(doc.id)) {
                termIndex.set(doc.id, {
                    frequency: 0,
                    positions: [],
                    inTitle: doc.title.toLowerCase().includes(term)
                });
            }
            const docEntry = termIndex.get(doc.id);
            docEntry.frequency++;
        }
    }
    extractTerms(text) {
        // Normalize text: lowercase, remove punctuation, split into words
        const normalized = text
            .toLowerCase()
            .replaceAll(/[^\s\w\u0400-\u04FF]/g, ' ') // Keep Cyrillic characters
            .replaceAll(/\s+/g, ' ')
            .trim();
        const words = normalized.split(' ');
        const terms = new Set();
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
    optimizeIndex() {
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
    async search(query, options = {}) {
        const startTime = performance.now();
        try {
            // Ensure index is built
            if (!this.isIndexed) {
                throw new Error('Search index not ready. Call buildIndex() first.');
            }
            const { type = 'all', // 'vocabulary', 'grammar', 'all'
            category = '', level = '', limit = 50, offset = 0, sortBy = 'relevance', // 'relevance', 'alphabetical', 'difficulty'
            direction = '', minScore = 0.1 } = options;
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
        }
        catch (error) {
            console.error('[SearchEngine] Search failed:', error);
            throw error;
        }
    }
    parseQuery(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }
        // Handle quoted phrases
        const phrases = [];
        const quotedRegex = /"([^"]+)"/g;
        let match;
        while ((match = quotedRegex.exec(query)) !== null) {
            phrases.push(match[1].toLowerCase().trim());
        }
        // Remove quoted phrases from query and get individual terms
        const remainingQuery = query.replaceAll(quotedRegex, '').trim();
        const individualTerms = this.extractTerms(remainingQuery);
        return [...phrases, ...individualTerms].filter(term => term.length >= 2);
    }
    findMatches(searchTerms, filters) {
        const matches = new Map();
        for (const term of searchTerms) {
            const termMatches = this.findTermMatches(term);
            for (const [docId, termScore] of termMatches) {
                const doc = this.documents.get(docId);
                if (!doc)
                    continue;
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
                const match = matches.get(docId);
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
    findTermMatches(term) {
        const matches = new Map();
        // Exact matches
        if (this.index.has(term)) {
            const termIndex = this.index.get(term);
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
    isFuzzyMatch(term1, term2) {
        // Simple fuzzy matching based on edit distance
        if (Math.abs(term1.length - term2.length) > 2) {
            return false;
        }
        const distance = this.levenshteinDistance(term1, term2);
        const maxDistance = Math.floor(Math.max(term1.length, term2.length) * 0.3);
        return distance <= maxDistance;
    }
    levenshteinDistance(str1, str2) {
        const matrix = Array.from({ length: str2.length + 1 }).fill(null).map(() => Array.from({ length: str1.length + 1 }).fill(0));
        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + cost);
            }
        }
        return matrix[str2.length][str1.length];
    }
    calculateFuzzyScore(term1, term2) {
        const distance = this.levenshteinDistance(term1, term2);
        const maxLength = Math.max(term1.length, term2.length);
        return Math.max(0, (maxLength - distance) / maxLength) * 0.7;
    }
    passesFilters(doc, filters) {
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
    calculateRelevanceScore(match, searchTerms) {
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
        const titleMatches = searchTerms.filter(term => titleTerms.some(titleTerm => titleTerm.includes(term) || term.includes(titleTerm)));
        if (titleMatches.length > 0) {
            score *= 1.5;
        }
        // Normalize score
        return score / Math.max(1, searchTerms.length);
    }
    sortResults(matches, sortBy) {
        const sortFunctions = {
            alphabetical: (a, b) => a.doc.title.localeCompare(b.doc.title),
            difficulty: (a, b) => (a.doc.difficulty || 1) - (b.doc.difficulty || 1),
            relevance: (a, b) => b.score - a.score
        };
        const sortFunction = sortFunctions[sortBy] || sortFunctions.relevance;
        return matches.sort(sortFunction);
    }
    buildResult(match, searchTerms) {
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
    generateSnippet(content, searchTerms, maxLength = 200) {
        const sentences = content.split(/[!.?]+/);
        let bestSentence = '';
        let maxMatches = 0;
        for (const sentence of sentences) {
            const matches = searchTerms.filter(term => sentence.toLowerCase().includes(term.toLowerCase())).length;
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
    generateHighlights(doc, searchTerms) {
        const highlights = [];
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
    escapeRegex(string) {
        return string.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
    }
    // Search suggestions and autocomplete
    generateSuggestions(query, resultCount) {
        if (resultCount > 0) {
            return []; // No suggestions needed if we have results
        }
        const suggestions = [];
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
    async getAutocompleteSuggestions(query, limit = 10) {
        if (!query || query.length < 2) {
            return [];
        }
        const queryLower = query.toLowerCase();
        const suggestions = [];
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
    updateSearchStats(query, responseTime, resultCount) {
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
    getSearchStats() {
        return {
            ...this.searchStats,
            indexSize: this.index.size,
            documentCount: this.documents.size,
            isIndexed: this.isIndexed,
            recentSearches: this.searchHistory.slice(0, 10)
        };
    }
    // Utility methods
    clearIndex() {
        this.index.clear();
        this.documents.clear();
        this.isIndexed = false;
    }
    getIndexInfo() {
        return {
            termCount: this.index.size,
            documentCount: this.documents.size,
            isIndexed: this.isIndexed,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    estimateMemoryUsage() {
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
    get isReady() {
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
    get documentCount() {
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
    get termCount() {
        return this.index.size;
    }
}
// Create and export singleton instance
const searchEngine = new SearchEngine();
export default searchEngine;
//# sourceMappingURL=search-engine.js.map