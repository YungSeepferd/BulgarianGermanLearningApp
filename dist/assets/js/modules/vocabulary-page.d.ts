/**
 * Vocabulary Page Module - Lazy loaded only on vocabulary pages
 *
 * Handles vocabulary listing, filtering, and selection with advanced features
 * including pagination, virtual scrolling, search functionality, and practice
 * session management. This module provides a comprehensive vocabulary browsing
 * experience with performance optimizations and accessibility support.
 *
 * Features:
 * - Advanced filtering by level, category, and search terms
 * - Pagination with URL state persistence
 * - Virtual scrolling for large datasets
 * - Search indexing for fast text search
 * - Practice session integration
 * - Language direction support
 * - Keyboard navigation and accessibility
 * - Phase-based filtering for spaced repetition
 * - Progressive loading and performance optimization
 *
 * @example
 * ```typescript
 * import VocabularyPageModule from './modules/vocabulary-page.js';
 *
 * // Initialize with custom container
 * const vocabModule = new VocabularyPageModule({
 *   container: '#vocabulary-grid',
 *   adapter: vocabularyAdapter
 * });
 *
 * await vocabModule.init();
 *
 * // Module handles all vocabulary page functionality automatically
 * ```
 *
 * @since 1.0.0
 */
/**
 * Interface for vocabulary item data structure
 *
 * Represents a single vocabulary item with all its associated metadata
 * and learning information used throughout the application.
 *
 * @interface VocabularyItem
 * @property {string} id - Unique identifier for the vocabulary item
 * @property {string} word - The vocabulary word in the source language
 * @property {string} translation - Translation in the target language
 * @property {string} category - Category classification (e.g., 'nouns', 'verbs')
 * @property {string} level - Difficulty level (e.g., 'A1', 'B2', 'C1')
 * @property {string} [notes] - Additional learning notes
 * @property {string} [etymology] - Etymology information
 * @property {string} [cultural_note] - Cultural context notes
 *
 * @example
 * ```typescript
 * const item: VocabularyItem = {
 *   id: 'word-123',
 *   word: 'Hallo',
 *   translation: 'Hello',
 *   category: 'greetings',
 *   level: 'A1',
 *   notes: 'Common greeting',
 *   etymology: 'From Old High German',
 *   cultural_note: 'Used in formal and informal contexts'
 * };
 * ```
 */
export interface VocabularyItem {
    id: string;
    word: string;
    translation: string;
    category: string;
    level: string;
    notes?: string;
    etymology?: string;
    cultural_note?: string;
}
/**
 * Interface for filter DOM elements
 *
 * References to the DOM elements used for filtering vocabulary items.
 * Phase filter is represented as null since it uses button-based filtering
 * rather than a single input element.
 *
 * @interface FilterElements
 * @property {HTMLSelectElement|null} level - Level filter dropdown element
 * @property {HTMLSelectElement|null} category - Category filter dropdown element
 * @property {HTMLInputElement|null} search - Search input element
 * @property {null} phase - Phase filter (uses buttons, not single element)
 *
 * @example
 * ```typescript
 * const filters: FilterElements = {
 *   level: document.querySelector('#level-filter'),
 *   category: document.querySelector('#category-filter'),
 *   search: document.querySelector('#search-input'),
 *   phase: null
 * };
 * ```
 */
export interface FilterElements {
    level: HTMLSelectElement | null;
    category: HTMLSelectElement | null;
    search: HTMLInputElement | null;
    phase: null;
}
/**
 * Interface for pagination state persistence
 *
 * Stores pagination information in localStorage for maintaining
 * the user's position across page reloads and navigation.
 *
 * @interface PaginationState
 * @property {number} page - Current page number
 * @property {number} timestamp - When the state was last saved
 *
 * @example
 * ```typescript
 * const state: PaginationState = {
 *   page: 3,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface PaginationState {
    page: number;
    timestamp: number;
}
/**
 * Interface for filter state persistence
 *
 * Stores filter configuration in localStorage for maintaining
 * filter settings across page reloads and navigation.
 *
 * @interface FilterState
 * @property {string} level - Current level filter value
 * @property {string} category - Current category filter value
 * @property {string} search - Current search query
 * @property {number} timestamp - When the state was last saved
 *
 * @example
 * ```typescript
 * const state: FilterState = {
 *   level: 'A1',
 *   category: 'nouns',
 *   search: 'hello',
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface FilterState {
    level: string;
    category: string;
    search: string;
    timestamp: number;
}
/**
 * Interface for search index entry
 *
 * Optimized search index entry for fast text searching across
 * vocabulary items with pre-computed search text.
 *
 * @interface SearchIndexEntry
 * @property {string} id - Vocabulary item ID
 * @property {string} searchText - Pre-computed searchable text
 * @property {VocabularyItem} item - Original vocabulary item
 *
 * @example
 * ```typescript
 * const entry: SearchIndexEntry = {
 *   id: 'word-123',
 *   searchText: 'hello hallo greeting common',
 *   item: vocabularyItem
 * };
 * ```
 */
export interface SearchIndexEntry {
    id: string;
    searchText: string;
    item: VocabularyItem;
}
/**
 * Interface for vocabulary page module initialization options
 *
 * Configuration options for creating a VocabularyPageModule instance
 * with custom container and data adapter settings.
 *
 * @interface VocabularyPageModuleOptions
 * @property {string} [container='#vocabulary-grid'] - CSS selector for the vocabulary container
 * @property {any} [adapter] - Vocabulary data adapter instance
 *
 * @example
 * ```typescript
 * const options: VocabularyPageModuleOptions = {
 *   container: '#custom-vocab-grid',
 *   adapter: new VocabularyAdapter()
 * };
 * ```
 */
export interface VocabularyPageModuleOptions {
    container?: string;
    adapter?: any;
}
/**
 * Interface for URL state parameters
 *
 * Represents the URL query parameters that can be used to
 * restore pagination and filter state from the URL.
 *
 * @interface URLState
 * @property {number} page - Current page number
 * @property {string} [level] - Level filter value
 * @property {string} [category] - Category filter value
 * @property {string} [search] - Search query
 *
 * @example
 * ```typescript
 * // URL: /vocabulary/?page=2&level=A1&category=nouns&search=hello
 * const state: URLState = {
 *   page: 2,
 *   level: 'A1',
 *   category: 'nouns',
 *   search: 'hello'
 * };
 * ```
 */
export interface URLState {
    page: number;
    level?: string;
    category?: string;
    search?: string;
}
/**
 * Interface for review data from spaced repetition system
 *
 * Contains learning progress data used for phase-based filtering
 * and spaced repetition calculations.
 *
 * @interface ReviewData
 * @property {number} [phase] - Current learning phase
 * @property {number} [easeFactor] - Memory ease factor
 * @property {number} [repetitions] - Number of successful repetitions
 *
 * @example
 * ```typescript
 * const reviewData: ReviewData = {
 *   phase: 3,
 *   easeFactor: 2.5,
 *   repetitions: 5
 * };
 * ```
 */
export interface ReviewData {
    phase?: number;
    easeFactor?: number;
    repetitions?: number;
}
/**
 * Vocabulary Page Module class
 *
 * Comprehensive vocabulary page management with advanced filtering, pagination,
 * search functionality, and practice session integration. This module is
 * lazy-loaded only on vocabulary pages and provides a rich browsing experience
 * with performance optimizations and accessibility support.
 *
 * Key features:
 * - Multi-criteria filtering (level, category, search, phase)
 * - Pagination with URL state persistence
 * - Virtual scrolling for large datasets
 * - Optimized search with indexing
 * - Practice session integration
 * - Language direction support
 * - Keyboard navigation
 * - Screen reader announcements
 * - Progressive loading
 *
 * @class VocabularyPageModule
 *
 * @example
 * ```typescript
 * // Basic usage
 * const vocabModule = new VocabularyPageModule();
 * await vocabModule.init();
 *
 * // Advanced usage with custom configuration
 * const vocabModule = new VocabularyPageModule({
 *   container: '#custom-grid',
 *   adapter: vocabularyAdapter
 * });
 *
 * await vocabModule.init();
 *
 * // Module automatically handles:
 * // - Filter application and persistence
 * // - Pagination navigation
 * // - Search functionality
 * // - Practice session integration
 * // - Language direction updates
 * ```
 *
 * @since 1.0.0
 */
declare class VocabularyPageModule {
    private container;
    private adapter;
    private enhancedVocab;
    private culturalToggle;
    private filters;
    private searchTimeout;
    private isSearching;
    private activePhaseFilter;
    private virtualScrollThreshold;
    private virtualScrollEnabled;
    private visibleItems;
    private allItems;
    private currentPage;
    private itemsPerPage;
    private totalPages;
    private totalItems;
    private persistenceKey;
    private filterPersistenceKey;
    private intersectionObserver;
    private searchIndex;
    private inlineVocab;
    private vocabById;
    constructor(options?: VocabularyPageModuleOptions);
    /**
     * Apply filters to DOM elements
     */
    domApplyFilters(): void;
    /**
     * Update direction UI for vocabulary cards
     * @param dir - Language direction
     */
    updateDirectionUI(dir: string): void;
    /**
     * Initializes the vocabulary page module
     *
     * This method sets up the complete vocabulary page functionality by:
     * 1. Loading optional dependencies and inline data
     * 2. Initializing pagination from URL parameters
     * 3. Setting up all UI components and event listeners
     * 4. Configuring virtual scrolling for performance
     * 5. Performing initial render with optimizations
     *
     * @public
     * @async
     * @returns {Promise<void>} Promise that resolves when initialization is complete
     * @throws {Error} When initialization fails
     *
     * @example
     * ```typescript
     * const vocabModule = new VocabularyPageModule();
     *
     * try {
     *   await vocabModule.init();
     *   console.log('Vocabulary page ready');
     * } catch (error) {
     *   console.error('Failed to initialize:', error);
     * }
     * ```
     */
    init(): Promise<void>;
    /**
     * Initialize pagination from URL parameters
     */
    initializePaginationFromURL(): void;
    /**
     * Initialize filters from URL query parameters
     * Supports: ?level=A1&category=Verb&search=hello
     */
    initializeFiltersFromURL(urlParams?: URLSearchParams): void;
    /**
     * Load persisted pagination state from localStorage
     */
    loadPersistedPagination(): PaginationState | null;
    /**
     * Save pagination state to localStorage
     */
    savePaginationState(): void;
    /**
     * Save filter state to localStorage
     */
    saveFilterState(): void;
    /**
     * Initialize pagination system
     */
    initializePagination(): void;
    /**
     * Setup keyboard shortcuts for pagination navigation
     */
    setupKeyboardShortcuts(): void;
    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message: string): void;
    /**
     * Calculate pagination parameters
     */
    calculatePagination(): void;
    /**
     * Setup pagination controls
     */
    setupPaginationControls(): void;
    /**
     * Navigates to a specific page in the vocabulary listing
     *
     * This method handles page navigation with proper validation, URL updates,
     * state persistence, and smooth scrolling. It updates the browser history
     * and ensures the page number is within valid bounds.
     *
     * @public
     * @param {number} page - Target page number (1-based)
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Navigate to page 3
     * vocabModule.goToPage(3);
     *
     // Navigate to first page
     * vocabModule.goToPage(1);
     *
     // Navigate to last page
     * vocabModule.goToPage(vocabModule.totalPages);
     * ```
     */
    goToPage(page: number): void;
    /**
     * Update URL with current pagination and filter state
     */
    updateURLWithState(): void;
    /**
     * Render the current page
     */
    renderCurrentPage(): void;
    /**
     * Virtual scrolling optimization for large datasets
     * Only renders visible items + buffer zone
     */
    renderVirtualScrollPage(visibleCards: HTMLElement[], startIndex: number, endIndex: number): void;
    /**
     * Update pagination UI elements
     */
    updatePaginationUI(): void;
    /**
     * Load inline vocabulary data from script tag
     */
    loadInlineData(): void;
    /**
     * Load dependencies (all dependencies are loaded via classic script tags)
     */
    loadDependencies(): Promise<void>;
    /**
     * Initialize filter elements
     */
    initializeFilters(): void;
    /**
     * Initialize vocabulary cards component
     */
    initializeVocabularyCards(): void;
    /**
     * Initialize cultural context toggle component
     */
    initializeCulturalToggle(): void;
    /**
     * Initialize event listeners
     */
    initializeEventListeners(): void;
    /**
     * Initialize virtual scrolling
     */
    initializeVirtualScrolling(): void;
    /**
     * Handle intersection observer events
     */
    handleIntersection(entries: IntersectionObserverEntry[]): void;
    /**
     * Handle search input with debouncing
     */
    handleSearch(event: Event): void;
    /**
     * Handle search keydown events
     */
    handleSearchKeydown(event: KeyboardEvent): void;
    /**
     * Perform search with indexing
     */
    performSearch(query: string): void;
    /**
     * Build search index for better performance
     */
    buildSearchIndex(): SearchIndexEntry[];
    /**
     * Search in index
     */
    searchInIndex(index: SearchIndexEntry[], query: string): VocabularyItem[];
    /**
     * Applies current filters to vocabulary items
     *
     * This method processes all active filters (level, category, search, phase)
     * and updates the display accordingly. It handles both adapter-based filtering
     * and DOM-based fallback filtering, updates URL state, and re-renders pagination.
     *
     * @public
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Apply current filters
     * vocabModule.applyFilters();
     *
     // The method will:
     * // 1. Reset to page 1
     * // 2. Save filter state to localStorage
     * // 3. Update URL with filter parameters
     * // 4. Filter vocabulary items
     * // 5. Update display and pagination
     * ```
     */
    applyFilters(): void;
    /**
     * Filter items based on current filter values
     */
    filterItems(items: VocabularyItem[]): VocabularyItem[];
    /**
     * Update filtered results display
     */
    updateFilteredResults(filtered: VocabularyItem[]): void;
    /**
     * Render filtered results to DOM
     */
    renderFilteredResults(filtered: VocabularyItem[]): void;
    /**
     * Toggle no results message display
     */
    toggleNoResultsMessage(show: boolean): void;
    /**
     * Show search indicator
     */
    showSearchIndicator(): void;
    /**
     * Hide search indicator
     */
    hideSearchIndicator(): void;
    /**
     * Normalize direction value
     */
    normalizeDirection(value: string | null): string | null;
    /**
     * Get current language direction
     */
    getCurrentDirection(): string;
    /**
     * Handle quick filter button clicks
     */
    handleQuickFilter(event: Event): void;
    /**
     * Get the current phase for a vocabulary item from localStorage
     */
    getItemPhase(itemId: string): number | string;
    /**
     * Handle practice single item button click
     */
    handlePracticeSingle(button: HTMLElement): void;
    /**
     * Handle practice selected items button click
     */
    handlePracticeSelected(): void;
    /**
     * Show selection alert
     */
    showSelectionAlert(): void;
    /**
     * Clear all filters
     */
    clearFilters(): void;
    /**
     * Perform initial render
     */
    performInitialRender(): void;
    /**
     * Render initial batch of items
     */
    renderInitialBatch(): void;
    /**
     * Load more items for progressive loading
     */
    loadMoreItems(): void;
    /**
     * Append items to display
     */
    appendItems(items: VocabularyItem[]): void;
    /**
     * Show error state
     */
    showErrorState(): void;
    /**
     * Render search results
     */
    renderSearchResults(results: VocabularyItem[]): void;
    /**
     * Cleans up the vocabulary page module and releases resources
     *
     * This method should be called when navigating away from the vocabulary
     * page or when the module is no longer needed. It:
     * 1. Disconnects the intersection observer
     * 2. Clears pending timeouts
     * 3. Removes event listeners
     * 4. Releases memory references
     *
     * @public
     * @returns {void}
     *
     * @example
     * ```typescript
     // Clean up when leaving the page
     * vocabModule.destroy();
     *
     // All resources are released and memory is cleaned up
     * ```
     */
    destroy(): void;
}
export default VocabularyPageModule;
//# sourceMappingURL=vocabulary-page.d.ts.map