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
class VocabularyPageModule {
    constructor(options = {}) {
        this.container = options.container || '#vocabulary-grid';
        this.adapter = options.adapter;
        this.enhancedVocab = null;
        this.culturalToggle = null;
        this.filters = {
            level: null,
            category: null,
            search: null,
            phase: null // Phase is filter type only, no single input element
        };
        this.searchTimeout = null;
        this.isSearching = false;
        this.activePhaseFilter = '';
        // Performance optimization: Virtual scrolling threshold
        this.virtualScrollThreshold = 1000;
        this.virtualScrollEnabled = false;
        this.visibleItems = [];
        this.allItems = [];
        // Pagination state
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.totalPages = 1;
        this.totalItems = 0; // Total items in dataset (unfiltered)
        // this.paginatedItems = []; // Not used
        // Pagination persistence
        this.persistenceKey = 'bgde:vocabulary-pagination';
        this.filterPersistenceKey = 'bgde:vocabulary-filters';
        this.intersectionObserver = null;
        this.searchIndex = null;
        this.inlineVocab = [];
        this.vocabById = new Map();
    }
    /**
     * Apply filters to DOM elements
     */
    domApplyFilters() {
        const levelSel = document.querySelector('#level-filter');
        const catSel = document.querySelector('#category-filter');
        const searchInput = document.querySelector('#search-input');
        const level = levelSel ? levelSel.value : '';
        const cat = catSel ? catSel.value : '';
        const q = (searchInput?.value || '').toLowerCase();
        const phase = this.activePhaseFilter || '';
        let shown = 0;
        for (const card of document.querySelectorAll('#vocabulary-grid .vocab-card')) {
            const l = card.dataset.level || '';
            const c = card.dataset.category || '';
            const w = (card.dataset.word || '').toLowerCase();
            const t = (card.dataset.translation || '').toLowerCase();
            const itemId = card.dataset.id;
            // Check phase match if phase filter is active
            let phaseMatches = true;
            if (phase && itemId) {
                const itemPhase = this.getItemPhase(itemId);
                phaseMatches = itemPhase.toString() === phase;
            }
            const matches = (!level || l === level) && (!cat || c === cat) && (!q || w.includes(q) || t.includes(q)) && phaseMatches;
            card.style.display = matches ? '' : 'none';
            if (matches) {
                shown++;
            }
        }
        const showing = document.querySelector('#showing-count');
        if (showing) {
            showing.textContent = shown.toString();
        }
    }
    /**
     * Update direction UI for vocabulary cards
     * @param dir - Language direction
     */
    updateDirectionUI(dir) {
        // Update all vocabulary cards to show correct direction
        for (const card of document.querySelectorAll('#vocabulary-grid .vocab-card')) {
            // Update direction-aware notes (show only the relevant direction)
            const directionNotes = card.querySelectorAll('.vocab-note-direction');
            for (const note of directionNotes) {
                const noteDirection = note.dataset.direction;
                note.style.display = noteDirection === dir ? '' : 'none';
            }
            // If using vocabById data, also update word/translation
            if (this.vocabById) {
                const id = card.dataset.id;
                const item = id && this.vocabById.get(id);
                if (!item) {
                    continue;
                }
                const wordEl = card.querySelector('.vocab-word');
                const transEl = card.querySelector('.vocab-translation');
                if (wordEl && transEl) {
                    if (dir === 'de-bg') {
                        wordEl.textContent = item.translation || '';
                        transEl.textContent = item.word || '';
                    }
                    else {
                        wordEl.textContent = item.word || '';
                        transEl.textContent = item.translation || '';
                    }
                }
            }
        }
        console.log(`[VocabularyPage] Updated direction UI to: ${dir}`);
    }
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
    async init() {
        try {
            // Ensure any optional globals are in place
            await this.loadDependencies();
            // Parse inline data for direction-aware DOM updates
            this.loadInlineData();
            // Initialize pagination from URL
            this.initializePaginationFromURL();
            // Initialize components
            this.initializeFilters();
            this.initializeVocabularyCards();
            this.initializeCulturalToggle();
            this.initializeEventListeners();
            this.initializePagination();
            this.initializeVirtualScrolling();
            // Initial render with performance optimization
            this.performInitialRender();
            console.log('VocabularyPageModule initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize VocabularyPageModule:', error);
            this.showErrorState();
        }
    }
    /**
     * Initialize pagination from URL parameters
     */
    initializePaginationFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        // Read page from URL or localStorage or default to 1
        let pageParam = urlParams.get('page');
        if (!pageParam) {
            // Try to restore from localStorage
            const persisted = this.loadPersistedPagination();
            if (persisted && persisted.page) {
                pageParam = persisted.page.toString();
                console.log(`[Pagination] Restored from localStorage: page ${pageParam}`);
            }
        }
        this.currentPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
        // Validate page number
        if (this.currentPage < 1 || isNaN(this.currentPage)) {
            this.currentPage = 1;
        }
        // Read filters from URL
        this.initializeFiltersFromURL(urlParams);
        console.log(`[Pagination] Initialized from URL: page ${this.currentPage}`);
    }
    /**
     * Initialize filters from URL query parameters
     * Supports: ?level=A1&category=Verb&search=hello
     */
    initializeFiltersFromURL(urlParams) {
        if (!urlParams) {
            urlParams = new URLSearchParams(window.location.search);
        }
        const level = urlParams.get('level');
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        if (level && this.filters.level) {
            this.filters.level.value = level;
        }
        if (category && this.filters.category) {
            this.filters.category.value = category;
        }
        if (search && this.filters.search) {
            this.filters.search.value = search;
        }
        console.log(`[Filters] Initialized from URL: level=${level}, category=${category}, search=${search}`);
    }
    /**
     * Load persisted pagination state from localStorage
     */
    loadPersistedPagination() {
        try {
            const stored = localStorage.getItem(this.persistenceKey);
            if (stored) {
                return JSON.parse(stored);
            }
        }
        catch (error) {
            console.warn('[Pagination] Failed to load persisted state:', error);
        }
        return null;
    }
    /**
     * Save pagination state to localStorage
     */
    savePaginationState() {
        try {
            const state = {
                page: this.currentPage,
                timestamp: Date.now()
            };
            localStorage.setItem(this.persistenceKey, JSON.stringify(state));
        }
        catch (error) {
            console.warn('[Pagination] Failed to save state:', error);
        }
    }
    /**
     * Save filter state to localStorage
     */
    saveFilterState() {
        try {
            const state = {
                level: this.filters.level?.value || '',
                category: this.filters.category?.value || '',
                search: this.filters.search?.value || '',
                timestamp: Date.now()
            };
            localStorage.setItem(this.filterPersistenceKey, JSON.stringify(state));
        }
        catch (error) {
            console.warn('[Filters] Failed to save state:', error);
        }
    }
    /**
     * Initialize pagination system
     */
    initializePagination() {
        // Calculate total pages based on all items
        this.calculatePagination();
        // Setup pagination controls
        this.setupPaginationControls();
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        // Listen for browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.initializePaginationFromURL();
            this.renderCurrentPage();
        });
        // Enable virtual scrolling if item count exceeds threshold
        if (this.allItems.length >= this.virtualScrollThreshold) {
            this.virtualScrollEnabled = true;
            console.log(`[VirtualScroll] Enabled for ${this.allItems.length} items`);
        }
        console.log(`[Pagination] Setup complete: ${this.totalPages} pages (virtual scroll: ${this.virtualScrollEnabled})`);
    }
    /**
     * Setup keyboard shortcuts for pagination navigation
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target instanceof HTMLElement && e.target.matches('input, textarea, select')) {
                return;
            }
            // Ignore if modifier keys are pressed (Ctrl, Alt, Meta)
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return;
            }
            switch (e.key) {
                case 'PageDown': {
                    e.preventDefault();
                    this.goToPage(this.currentPage + 1);
                    this.announceToScreenReader(`Page ${this.currentPage} of ${this.totalPages}`);
                    break;
                }
                case 'PageUp': {
                    e.preventDefault();
                    this.goToPage(this.currentPage - 1);
                    this.announceToScreenReader(`Page ${this.currentPage} of ${this.totalPages}`);
                    break;
                }
                case 'Home': {
                    // Ctrl+Home or just Home if not in input
                    if (e.ctrlKey || !(e.target instanceof HTMLElement && e.target.matches('input, textarea, select'))) {
                        e.preventDefault();
                        this.goToPage(1);
                        this.announceToScreenReader('First page');
                    }
                    break;
                }
                case 'End': {
                    // Ctrl+End or just End if not in input
                    if (e.ctrlKey || !(e.target instanceof HTMLElement && e.target.matches('input, textarea, select'))) {
                        e.preventDefault();
                        this.goToPage(this.totalPages);
                        this.announceToScreenReader('Last page');
                    }
                    break;
                }
                case 'ArrowLeft': {
                    // Alt+Left Arrow for previous page
                    if (e.altKey) {
                        e.preventDefault();
                        this.goToPage(this.currentPage - 1);
                    }
                    break;
                }
                case 'ArrowRight': {
                    // Alt+Right Arrow for next page
                    if (e.altKey) {
                        e.preventDefault();
                        this.goToPage(this.currentPage + 1);
                    }
                    break;
                }
            }
        });
        console.log('[KeyboardShortcuts] Pagination shortcuts enabled (PageUp/PageDown, Home/End, Alt+Arrows)');
    }
    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        document.body.append(announcement);
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
    /**
     * Calculate pagination parameters
     */
    calculatePagination() {
        const vocabGrid = document.querySelector('#vocabulary-grid');
        if (!vocabGrid) {
            console.warn('[Pagination] vocabulary-grid not found');
            return;
        }
        // Get all vocabulary cards
        const allCards = [...vocabGrid.querySelectorAll('.vocab-card')];
        this.allItems = allCards.map(card => ({
            id: card.dataset.id || '',
            word: card.dataset.word || '',
            translation: card.dataset.translation || '',
            category: card.dataset.category || '',
            level: card.dataset.level || '',
            notes: card.dataset.notes || '',
            etymology: card.dataset.etymology || '',
            cultural_note: card.dataset.culturalNote || ''
        }));
        this.totalItems = allCards.length; // Store total unfiltered count
        // Calculate total pages based on all items
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        // Ensure current page is within bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        console.log(`[Pagination] Calculated: ${this.totalItems} total items, ${this.totalPages} pages`);
    }
    /**
     * Setup pagination controls
     */
    setupPaginationControls() {
        // Previous button
        const prevBtns = document.querySelectorAll('.pagination-prev');
        for (const btn of prevBtns) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage - 1);
            });
        }
        // Next button
        const nextBtns = document.querySelectorAll('.pagination-next');
        for (const btn of nextBtns) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage + 1);
            });
        }
        // Page jump dropdown
        const pageJump = document.querySelector('#page-jump');
        if (pageJump) {
            pageJump.addEventListener('change', (e) => {
                const page = Number.parseInt(e.target.value, 10);
                this.goToPage(page);
            });
        }
        // Page number links
        const pageNumbers = document.querySelectorAll('.pagination-number');
        for (const link of pageNumbers) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = Number.parseInt(link.textContent || '1', 10);
                this.goToPage(page);
            });
        }
    }
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
    goToPage(page) {
        // Validate page number
        if (page < 1 || page > this.totalPages) {
            console.warn(`[Pagination] Invalid page: ${page}`);
            return;
        }
        this.currentPage = page;
        // Update URL without reload (including current filters)
        this.updateURLWithState();
        // Save to localStorage for persistence
        this.savePaginationState();
        // Render the new page
        this.renderCurrentPage();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log(`[Pagination] Navigated to page ${page}`);
    }
    /**
     * Update URL with current pagination and filter state
     */
    updateURLWithState() {
        const url = new URL(window.location.href);
        // Update page
        url.searchParams.set('page', this.currentPage.toString());
        // Update filters if they have values
        const level = this.filters.level?.value;
        const category = this.filters.category?.value;
        const search = this.filters.search?.value;
        if (level) {
            url.searchParams.set('level', level);
        }
        else {
            url.searchParams.delete('level');
        }
        if (category) {
            url.searchParams.set('category', category);
        }
        else {
            url.searchParams.delete('category');
        }
        if (search) {
            url.searchParams.set('search', search);
        }
        else {
            url.searchParams.delete('search');
        }
        // Update browser history
        const state = {
            page: this.currentPage,
            level: level || undefined,
            category: category || undefined,
            search: search || undefined
        };
        window.history.pushState(state, '', url);
    }
    /**
     * Render the current page
     */
    renderCurrentPage() {
        const vocabGrid = document.querySelector('#vocabulary-grid');
        if (!vocabGrid) {
            return;
        }
        // Get all cards (respecting current filters)
        const allCards = [...vocabGrid.querySelectorAll('.vocab-card')];
        const visibleCards = allCards.filter(card => card.style.display !== 'none');
        // Calculate pagination for visible cards
        const totalVisible = visibleCards.length;
        this.totalPages = Math.ceil(totalVisible / this.itemsPerPage);
        // Ensure current page is within bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        // Calculate slice indices
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        // Use virtual scrolling for large datasets
        if (this.virtualScrollEnabled && totalVisible >= this.virtualScrollThreshold) {
            this.renderVirtualScrollPage(visibleCards, startIndex, endIndex);
        }
        else {
            // Standard rendering: hide all, show current page
            for (const card of allCards) {
                if (card.style.display !== 'none') {
                    card.style.display = 'none';
                    card.dataset.paginated = 'true';
                }
            }
            // Show only cards for current page
            const pageCards = visibleCards.slice(startIndex, endIndex);
            for (const card of pageCards) {
                card.style.display = '';
            }
        }
        // Update pagination UI
        this.updatePaginationUI();
        // Update showing count
        const showingCount = document.querySelector('#showing-count');
        if (showingCount) {
            const actualShowing = Math.min(this.itemsPerPage, totalVisible - startIndex);
            showingCount.textContent = actualShowing.toString();
        }
        console.log(`[Pagination] Rendered page ${this.currentPage}: showing ${Math.min(this.itemsPerPage, totalVisible - startIndex)} of ${totalVisible} items (virtual: ${this.virtualScrollEnabled})`);
    }
    /**
     * Virtual scrolling optimization for large datasets
     * Only renders visible items + buffer zone
     */
    renderVirtualScrollPage(visibleCards, startIndex, endIndex) {
        const vocabGrid = document.querySelector('#vocabulary-grid');
        if (!vocabGrid) {
            return;
        }
        // Buffer zone: render extra items above/below for smooth scrolling
        const bufferSize = 10;
        const renderStart = Math.max(0, startIndex - bufferSize);
        const renderEnd = Math.min(visibleCards.length, endIndex + bufferSize);
        // Hide all cards
        for (const card of visibleCards) {
            card.style.display = 'none';
        }
        // Show only cards in render range
        for (let i = renderStart; i < renderEnd; i++) {
            visibleCards[i].style.display = '';
        }
        console.log(`[VirtualScroll] Rendered items ${renderStart}-${renderEnd} (visible: ${startIndex}-${endIndex})`);
    }
    /**
     * Update pagination UI elements
     */
    updatePaginationUI() {
        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            const span = paginationInfo.querySelector('span');
            if (span) {
                span.textContent = `Seite ${this.currentPage} von ${this.totalPages} / Страница ${this.currentPage} от ${this.totalPages}`;
            }
        }
        // Update previous button
        const prevBtns = document.querySelectorAll('.pagination-prev');
        for (const btn of prevBtns) {
            btn.style.display = this.currentPage <= 1 ? 'none' : '';
        }
        // Update next button
        const nextBtns = document.querySelectorAll('.pagination-next');
        for (const btn of nextBtns) {
            btn.style.display = this.currentPage >= this.totalPages ? 'none' : '';
        }
        // Update page jump dropdown
        const pageJump = document.querySelector('#page-jump');
        if (pageJump) {
            // Rebuild options
            pageJump.innerHTML = '';
            for (let i = 1; i <= this.totalPages; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                if (i === this.currentPage) {
                    option.selected = true;
                }
                pageJump.append(option);
            }
        }
        // Show/hide pagination controls
        // CRITICAL FIX: Always show pagination if total items > itemsPerPage,
        // even if current filter shows fewer items. This prevents pagination
        // from disappearing when filters are applied or during initial load.
        const paginationNav = document.querySelector('.pagination');
        if (paginationNav) {
            const shouldShowPagination = this.totalItems > this.itemsPerPage || this.totalPages > 1;
            paginationNav.style.display = shouldShowPagination ? '' : 'none';
            if (shouldShowPagination) {
                console.log(`[Pagination] Showing pagination: ${this.totalItems} total items, ${this.totalPages} pages`);
            }
        }
    }
    /**
     * Load inline vocabulary data from script tag
     */
    loadInlineData() {
        try {
            const script = document.querySelector('#vocabulary-data');
            const parsed = script ? JSON.parse(script.textContent || '[]') : [];
            this.inlineVocab = Array.isArray(parsed) ? parsed : [];
            this.vocabById = new Map(this.inlineVocab.map(it => [it.id, it]));
        }
        catch (error) {
            this.inlineVocab = [];
            this.vocabById = new Map();
            console.warn('Failed to parse inline vocabulary data', error);
        }
    }
    /**
     * Load dependencies (all dependencies are loaded via classic script tags)
     */
    async loadDependencies() {
        // All dependencies are loaded via classic script tags; nothing to do here.
        return;
    }
    /**
     * Initialize filter elements
     */
    initializeFilters() {
        this.filters = {
            level: document.querySelector('#level-filter'),
            category: document.querySelector('#category-filter'),
            search: document.querySelector('#search-input'),
            phase: null // Phase is filter type only, no single input element
        };
        // Store active phase filter value
        this.activePhaseFilter = '';
    }
    /**
     * Initialize vocabulary cards component
     */
    initializeVocabularyCards() {
        const windowWithDeps = window;
        if (!windowWithDeps.EnhancedVocabCards) {
            return;
        }
        try {
            this.enhancedVocab = new windowWithDeps.EnhancedVocabCards();
        }
        catch (error) {
            console.warn('Failed to initialise EnhancedVocabCards:', error);
            this.enhancedVocab = null;
        }
    }
    /**
     * Initialize cultural context toggle component
     */
    initializeCulturalToggle() {
        const container = document.querySelector('#cultural-context-container');
        const windowWithDeps = window;
        if (!container || !windowWithDeps.CulturalContextToggle) {
            return;
        }
        try {
            this.culturalToggle = new windowWithDeps.CulturalContextToggle({
                container
            });
            this.culturalToggle.init();
        }
        catch (error) {
            console.warn('Failed to initialise CulturalContextToggle:', error);
            this.culturalToggle = null;
        }
    }
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Optimized event listeners with debouncing
        if (this.filters.level) {
            this.filters.level.addEventListener('change', () => this.applyFilters());
        }
        if (this.filters.category) {
            this.filters.category.addEventListener('change', () => this.applyFilters());
        }
        if (this.filters.search) {
            this.filters.search.addEventListener('input', (e) => this.handleSearch(e));
            this.filters.search.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        }
        // Practice selected functionality
        const practiceBtn = document.querySelector('#practice-selected');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => this.handlePracticeSelected());
        }
        // Clear filters
        const clearBtn = document.querySelector('#clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
        // Individual practice buttons (using event delegation for dynamic content)
        const vocabGrid = document.querySelector('#vocabulary-grid');
        if (vocabGrid) {
            vocabGrid.addEventListener('click', (e) => {
                const practiceBtn = e.target.closest('.practice-single-btn');
                if (practiceBtn) {
                    this.handlePracticeSingle(practiceBtn);
                }
            });
        }
        // Quick filter buttons (icon-based)
        const quickFilterButtons = document.querySelectorAll('.quick-filter-btn');
        for (const btn of quickFilterButtons) {
            btn.addEventListener('click', (e) => this.handleQuickFilter(e));
        }
        // Language direction changes
        document.addEventListener('learning-direction-changed', () => {
            this.updateDirectionUI(this.getCurrentDirection());
            this.applyFilters();
        });
        document.addEventListener('language-direction-changed', (e) => {
            const customEvent = e;
            const dir = customEvent?.detail?.direction || this.getCurrentDirection();
            this.updateDirectionUI(dir);
            this.applyFilters();
        });
    }
    /**
     * Initialize virtual scrolling
     */
    initializeVirtualScrolling() {
        if (!this.container) {
            return;
        }
        const container = document.querySelector(this.container);
        if (!container) {
            return;
        }
        // Implement intersection observer for virtual scrolling
        this.intersectionObserver = new IntersectionObserver((entries) => this.handleIntersection(entries), {
            root: container,
            rootMargin: '50px',
            threshold: 0.1
        });
    }
    /**
     * Handle intersection observer events
     */
    handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                // Load more items when scrolling near bottom
                this.loadMoreItems();
            }
        }
    }
    /**
     * Handle search input with debouncing
     */
    handleSearch(event) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        const query = event.target.value;
        if (!this.isSearching && query.length > 0) {
            this.showSearchIndicator();
        }
        this.searchTimeout = window.setTimeout(() => {
            this.performSearch(query);
            this.hideSearchIndicator();
        }, 250);
    }
    /**
     * Handle search keydown events
     */
    handleSearchKeydown(event) {
        if (event.key === 'Escape') {
            event.target.value = '';
            this.applyFilters();
            event.target.blur();
        }
    }
    /**
     * Perform search with indexing
     */
    performSearch(query) {
        // Optimized search with indexing
        const searchIndex = this.buildSearchIndex();
        const results = this.searchInIndex(searchIndex, query);
        this.renderSearchResults(results);
    }
    /**
     * Build search index for better performance
     */
    buildSearchIndex() {
        // Create search index for better performance
        if (this.searchIndex) {
            return this.searchIndex;
        }
        this.searchIndex = this.allItems.map(item => ({
            id: item.id,
            searchText: [
                item.word,
                item.translation,
                item.category,
                item.level,
                item.notes || '',
                item.etymology || '',
                item.cultural_note || ''
            ].join(' ').toLowerCase(),
            item: item
        }));
        return this.searchIndex;
    }
    /**
     * Search in index
     */
    searchInIndex(index, query) {
        const lowerQuery = query.toLowerCase();
        return index.filter(entry => entry.searchText.includes(lowerQuery)).map(entry => entry.item);
    }
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
    applyFilters() {
        // Reset to page 1 when filters change
        this.currentPage = 1;
        // Save filter state
        this.saveFilterState();
        // Update URL with new filter state
        this.updateURLWithState();
        const currentDirection = this.getCurrentDirection();
        const hasAdapter = this.adapter && typeof this.adapter.getItemsForDirection === 'function';
        if (!hasAdapter) {
            // Fallback: filter existing DOM cards
            this.domApplyFilters();
            // Ensure direction labels/notes are correct
            this.updateDirectionUI(currentDirection);
            // Re-render pagination after filtering
            this.renderCurrentPage();
            return;
        }
        const items = this.adapter.getItemsForDirection(currentDirection) || [];
        const filtered = this.filterItems(items);
        this.updateFilteredResults(filtered);
        // Re-render pagination after filtering
        this.renderCurrentPage();
    }
    /**
     * Filter items based on current filter values
     */
    filterItems(items) {
        const levelValue = this.filters.level?.value || '';
        const categoryValue = this.filters.category?.value || '';
        const searchValue = this.filters.search?.value?.toLowerCase() || '';
        const phaseValue = this.activePhaseFilter || '';
        console.log(`[VocabPage] 🔧 Filtering ${items.length} items with:`, {
            level: levelValue || '(any)',
            category: categoryValue || '(any)',
            search: searchValue || '(none)',
            phase: phaseValue || '(any)'
        });
        const filtered = items.filter(item => {
            const levelMatch = !levelValue || item.level === levelValue;
            const categoryMatch = !categoryValue || item.category === categoryValue;
            const searchMatch = !searchValue ||
                item.word.toLowerCase().includes(searchValue) ||
                item.translation.toLowerCase().includes(searchValue) ||
                (item.notes && item.notes.toLowerCase().includes(searchValue));
            // Phase filtering: get current phase for this item
            let phaseMatch = true;
            if (phaseValue) {
                const itemPhase = this.getItemPhase(item.id);
                phaseMatch = itemPhase.toString() === phaseValue;
            }
            return levelMatch && categoryMatch && searchMatch && phaseMatch;
        });
        console.log(`[VocabPage] ✅ Filtered to ${filtered.length} items`);
        return filtered;
    }
    /**
     * Update filtered results display
     */
    updateFilteredResults(filtered) {
        console.log(`[VocabPage] 🔍 updateFilteredResults called with ${filtered.length} items`);
        // Apply filtering to DOM cards based on filtered results
        this.renderFilteredResults(filtered);
        // Update counters
        const showingCount = document.querySelector('#showing-count');
        if (showingCount && Array.isArray(filtered)) {
            showingCount.textContent = filtered.length.toString();
        }
        // Show/hide no results message
        this.toggleNoResultsMessage(filtered.length === 0);
    }
    /**
     * Render filtered results to DOM
     */
    renderFilteredResults(filtered) {
        const allCards = [...document.querySelectorAll('#vocabulary-grid .vocab-card')];
        // Create a set of IDs from filtered results for fast lookup
        const filteredIds = new Set(filtered.map(item => item.id));
        let visibleCount = 0;
        for (const card of allCards) {
            const cardId = card.dataset.id;
            const shouldShow = cardId ? filteredIds.has(cardId) : false;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visibleCount++;
            }
        }
        console.log(`[VocabPage] 🎯 Rendered ${visibleCount} of ${allCards.length} cards`);
    }
    /**
     * Toggle no results message display
     */
    toggleNoResultsMessage(show) {
        const noResults = document.querySelector('#no-results');
        if (noResults) {
            noResults.classList.toggle('hidden', !show);
        }
    }
    /**
     * Show search indicator
     */
    showSearchIndicator() {
        this.isSearching = true;
        const searchContainer = this.filters.search?.parentElement;
        if (searchContainer) {
            searchContainer.classList.add('searching');
            if (!searchContainer.querySelector('.search-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'search-spinner';
                spinner.innerHTML = '<div class="spinner"></div>';
                searchContainer.append(spinner);
            }
        }
    }
    /**
     * Hide search indicator
     */
    hideSearchIndicator() {
        this.isSearching = false;
        const searchContainer = this.filters.search?.parentElement;
        if (searchContainer) {
            searchContainer.classList.remove('searching');
            const spinner = searchContainer.querySelector('.search-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
    /**
     * Normalize direction value
     */
    normalizeDirection(value) {
        if (!value) {
            return null;
        }
        const normalized = value.toString().toLowerCase();
        if (normalized === 'bg-de' || normalized === 'bg_to_de') {
            return 'bg-de';
        }
        if (normalized === 'de-bg' || normalized === 'de_to_bg') {
            return 'de-bg';
        }
        return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
    }
    /**
     * Get current language direction
     */
    getCurrentDirection() {
        const windowWithDeps = window;
        if (windowWithDeps.languageToggle && typeof windowWithDeps.languageToggle.getDirection === 'function') {
            return windowWithDeps.languageToggle.getDirection();
        }
        const stored = localStorage.getItem('bgde:language-direction') ||
            localStorage.getItem('bgde:learning_direction');
        return this.normalizeDirection(stored) || 'de-bg';
    }
    /**
     * Handle quick filter button clicks
     */
    handleQuickFilter(event) {
        const button = event.currentTarget;
        const filterType = button.dataset.filterType; // 'level', 'category', or 'phase'
        const filterValue = button.dataset.filterValue;
        // Update active state for visual feedback
        const sameTypeButtons = document.querySelectorAll(`[data-filter-type="${filterType}"]`);
        for (const btn of sameTypeButtons) {
            btn.classList.remove('active');
        }
        button.classList.add('active');
        // Update corresponding select dropdown or active filter state
        if (filterType === 'level' && this.filters.level) {
            this.filters.level.value = filterValue || '';
        }
        else if (filterType === 'category' && this.filters.category) {
            this.filters.category.value = filterValue || '';
        }
        else if (filterType === 'phase') {
            // Phase filter doesn't have a dropdown, store value directly
            this.activePhaseFilter = filterValue || '';
        }
        // Apply filters
        this.applyFilters();
        console.log(`[QuickFilter] Applied ${filterType}: ${filterValue || 'all'}`);
    }
    /**
     * Get the current phase for a vocabulary item from localStorage
     */
    getItemPhase(itemId) {
        if (!itemId) {
            return 'not-started';
        }
        // Get current profile from profile manager
        const windowWithDeps = window;
        const profileId = windowWithDeps.profileManager?.getActiveProfileId() || 'german_learner';
        const currentDirection = this.getCurrentDirection();
        // Build storage key for this item
        const storageKey = `bgde:${profileId}:review_${itemId}_${currentDirection}`;
        try {
            const reviewData = localStorage.getItem(storageKey);
            if (!reviewData) {
                return 'not-started'; // No review data = not started
            }
            const data = JSON.parse(reviewData);
            // If phase is stored directly, use it
            if (data.phase !== undefined) {
                return data.phase;
            }
            // Otherwise calculate phase from easeFactor using PhaseCalculator
            if (windowWithDeps.phaseCalculator && data.easeFactor !== undefined) {
                const repetitions = data.repetitions || 0;
                return windowWithDeps.phaseCalculator.calculatePhase(data.easeFactor, repetitions);
            }
            return 'not-started';
        }
        catch (error) {
            console.warn(`[Phase] Error getting phase for ${itemId}:`, error);
            return 'not-started';
        }
    }
    /**
     * Handle practice single item button click
     */
    handlePracticeSingle(button) {
        const word = button.dataset.word;
        const cardElement = button.closest('.vocab-card');
        const itemId = cardElement?.dataset.id;
        if (word || itemId) {
            // Store single word for practice session
            localStorage.setItem('bgde:practice_selection', JSON.stringify([word || itemId]));
            // Navigate to practice page (relative to parent)
            window.location.href = '../practice/';
        }
        else {
            console.warn('Cannot practice: no word or ID found');
        }
    }
    /**
     * Handle practice selected items button click
     */
    handlePracticeSelected() {
        const selected = [...document.querySelectorAll('.vocab-select:checked')]
            .map(checkbox => checkbox.dataset.word);
        if (selected.length > 0) {
            localStorage.setItem('bgde:practice_selection', JSON.stringify(selected));
            window.location.href = '../practice/';
        }
        else {
            this.showSelectionAlert();
        }
    }
    /**
     * Show selection alert
     */
    showSelectionAlert() {
        // Create modern alert instead of browser alert
        const alert = document.createElement('div');
        alert.className = 'selection-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <p>Bitte wählen Sie mindestens ein Wortschatzelement zum Üben aus.</p>
                <p>Моля, изберете поне един елемент от речник за упражнение.</p>
                <button class="alert-close">OK</button>
            </div>
        `;
        document.body.append(alert);
        // Auto-remove after 3 seconds or on click
        setTimeout(() => alert.remove(), 3000);
        alert.querySelector('.alert-close')?.addEventListener('click', () => alert.remove());
    }
    /**
     * Clear all filters
     */
    clearFilters() {
        if (this.filters.level) {
            this.filters.level.value = '';
        }
        if (this.filters.category) {
            this.filters.category.value = '';
        }
        if (this.filters.search) {
            this.filters.search.value = '';
        }
        this.activePhaseFilter = '';
        // Clear active state from all quick filter buttons
        for (const btn of document.querySelectorAll('.quick-filter-btn.active')) {
            btn.classList.remove('active');
        }
        // Set "Alle" buttons as active for each filter type
        for (const btn of document.querySelectorAll('.quick-filter-btn[data-filter-value=""]')) {
            btn.classList.add('active');
        }
        this.applyFilters();
    }
    /**
     * Perform initial render
     */
    performInitialRender() {
        const currentDirection = this.getCurrentDirection();
        this.updateDirectionUI(currentDirection);
        this.domApplyFilters();
        // Render the current page after initial load
        this.renderCurrentPage();
    }
    /**
     * Render initial batch of items
     */
    renderInitialBatch() {
        const initialBatch = this.allItems.slice(0, 50); // Show first 50 items
        this.updateFilteredResults(initialBatch);
        // Schedule remaining items for next frame
        if (this.allItems.length > 50) {
            requestAnimationFrame(() => {
                this.loadMoreItems();
            });
        }
    }
    /**
     * Load more items for progressive loading
     */
    loadMoreItems() {
        // Implement progressive loading for better performance
        const currentVisible = this.visibleItems.length;
        const nextBatch = this.allItems.slice(currentVisible, currentVisible + 25);
        if (nextBatch.length > 0) {
            this.visibleItems = [...this.visibleItems, ...nextBatch];
            // Update display efficiently
            this.appendItems(nextBatch);
        }
    }
    /**
     * Append items to display
     */
    appendItems(items) {
        if (this.enhancedVocab && this.enhancedVocab.appendItems) {
            this.enhancedVocab.appendItems(items);
        }
    }
    /**
     * Show error state
     */
    showErrorState() {
        const container = document.querySelector(this.container);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <h3>⚠️ Loading Error</h3>
                    <p>Failed to load vocabulary module. Please refresh the page.</p>
                    <button onclick="location.reload()" class="btn-primary">Refresh Page</button>
                </div>
            `;
        }
    }
    /**
     * Render search results
     */
    renderSearchResults(results) {
        // Implementation would depend on how search results are displayed
        console.log(`[Search] Found ${results.length} results`);
    }
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
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        // Remove event listeners
        for (const filter of Object.values(this.filters)) {
            if (filter) {
                filter.removeEventListener('change', this.applyFilters);
                filter.removeEventListener('input', this.handleSearch);
            }
        }
    }
}
// Expose globally for classic script inclusion
if (typeof window !== 'undefined') {
    window.VocabularyPageModule = VocabularyPageModule;
}
export default VocabularyPageModule;
//# sourceMappingURL=vocabulary-page.js.map