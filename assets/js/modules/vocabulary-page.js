/**
 * Vocabulary Page Module - Lazy loaded only on vocabulary pages
 * Handles vocabulary listing, filtering, and selection
 */

class VocabularyPageModule {
    constructor(options = {}) {
        this.container = options.container || '#vocabulary-grid';
        this.adapter = options.adapter;
        this.enhancedVocab = null;
        this.culturalToggle = null;
        this.filters = {};
        this.searchTimeout = null;
        this.isSearching = false;

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
        this.paginatedItems = [];

        // Pagination persistence
        this.persistenceKey = 'bgde:vocabulary-pagination';
        this.filterPersistenceKey = 'bgde:vocabulary-filters';
    }

  domApplyFilters() {
      const levelSel = document.getElementById('level-filter');
      const catSel = document.getElementById('category-filter');
      const searchInput = document.getElementById('search-input');
      const level = levelSel ? levelSel.value : '';
      const cat = catSel ? catSel.value : '';
      const q = (searchInput?.value || '').toLowerCase();

      let shown = 0;
      document.querySelectorAll('#vocabulary-grid .vocab-card').forEach(card => {
          const l = card.getAttribute('data-level') || '';
          const c = card.getAttribute('data-category') || '';
          const w = (card.getAttribute('data-word') || '').toLowerCase();
          const t = (card.getAttribute('data-translation') || '').toLowerCase();
          const matches = (!level || l === level) && (!cat || c === cat) && (!q || w.includes(q) || t.includes(q));
          card.style.display = matches ? '' : 'none';
          if (matches) shown++;
      });
      const showing = document.getElementById('showing-count');
      if (showing) showing.textContent = shown;
  }

  updateDirectionUI(dir) {
      // Update all vocabulary cards to show correct direction
      document.querySelectorAll('#vocabulary-grid .vocab-card').forEach(card => {
          // Update direction-aware notes (show only the relevant direction)
          const directionNotes = card.querySelectorAll('.vocab-note-direction');
          directionNotes.forEach(note => {
              const noteDirection = note.getAttribute('data-direction');
              if (noteDirection === dir) {
                  note.style.display = ''; // Show
              } else {
                  note.style.display = 'none'; // Hide
              }
          });
          
          // If using vocabById data, also update word/translation
          if (this.vocabById) {
              const id = card.getAttribute('data-id');
              const item = id && this.vocabById.get(id);
              if (!item) return;

              const wordEl = card.querySelector('.vocab-word');
              const transEl = card.querySelector('.vocab-translation');

              if (wordEl && transEl) {
                  if (dir === 'de-bg') {
                      wordEl.textContent = item.translation || '';
                      transEl.textContent = item.word || '';
                  } else {
                      wordEl.textContent = item.word || '';
                      transEl.textContent = item.translation || '';
                  }
              }
          }
      });
      
      console.log(`[VocabularyPage] Updated direction UI to: ${dir}`);
  }

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
        } catch (error) {
            console.error('Failed to initialize VocabularyPageModule:', error);
            this.showErrorState();
        }
    }

    initializePaginationFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Read page from URL or localStorage or default to 1
        let pageParam = urlParams.get('page');

        if (!pageParam) {
            // Try to restore from localStorage
            const persisted = this.loadPersistedPagination();
            if (persisted && persisted.page) {
                pageParam = persisted.page;
                console.log(`[Pagination] Restored from localStorage: page ${pageParam}`);
            }
        }

        this.currentPage = pageParam ? parseInt(pageParam, 10) : 1;

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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            console.warn('[Filters] Failed to save state:', error);
        }
    }

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
            if (e.target.matches('input, textarea, select')) {
                return;
            }

            // Ignore if modifier keys are pressed (Ctrl, Alt, Meta)
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return;
            }

            switch(e.key) {
                case 'PageDown':
                    e.preventDefault();
                    this.goToPage(this.currentPage + 1);
                    this.announceToScreenReader(`Page ${this.currentPage} of ${this.totalPages}`);
                    break;

                case 'PageUp':
                    e.preventDefault();
                    this.goToPage(this.currentPage - 1);
                    this.announceToScreenReader(`Page ${this.currentPage} of ${this.totalPages}`);
                    break;

                case 'Home':
                    // Ctrl+Home or just Home if not in input
                    if (e.ctrlKey || !e.target.matches('input, textarea, select')) {
                        e.preventDefault();
                        this.goToPage(1);
                        this.announceToScreenReader('First page');
                    }
                    break;

                case 'End':
                    // Ctrl+End or just End if not in input
                    if (e.ctrlKey || !e.target.matches('input, textarea, select')) {
                        e.preventDefault();
                        this.goToPage(this.totalPages);
                        this.announceToScreenReader('Last page');
                    }
                    break;

                case 'ArrowLeft':
                    // Alt+Left Arrow for previous page
                    if (e.altKey) {
                        e.preventDefault();
                        this.goToPage(this.currentPage - 1);
                    }
                    break;

                case 'ArrowRight':
                    // Alt+Right Arrow for next page
                    if (e.altKey) {
                        e.preventDefault();
                        this.goToPage(this.currentPage + 1);
                    }
                    break;
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

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    calculatePagination() {
        const vocabGrid = document.getElementById('vocabulary-grid');
        if (!vocabGrid) {
            console.warn('[Pagination] vocabulary-grid not found');
            return;
        }

        // Get all vocabulary cards
        const allCards = Array.from(vocabGrid.querySelectorAll('.vocab-card'));
        this.allItems = allCards;
        this.totalItems = allCards.length; // Store total unfiltered count

        // Calculate total pages based on all items
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

        // Ensure current page is within bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }

        console.log(`[Pagination] Calculated: ${this.totalItems} total items, ${this.totalPages} pages`);
    }

    setupPaginationControls() {
        // Previous button
        const prevBtns = document.querySelectorAll('.pagination-prev');
        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage - 1);
            });
        });

        // Next button
        const nextBtns = document.querySelectorAll('.pagination-next');
        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage + 1);
            });
        });

        // Page jump dropdown
        const pageJump = document.getElementById('page-jump');
        if (pageJump) {
            pageJump.addEventListener('change', (e) => {
                const page = parseInt(e.target.value, 10);
                this.goToPage(page);
            });
        }

        // Page number links
        const pageNumbers = document.querySelectorAll('.pagination-number');
        pageNumbers.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.textContent, 10);
                this.goToPage(page);
            });
        });
    }

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
        const url = new URL(window.location);

        // Update page
        url.searchParams.set('page', this.currentPage);

        // Update filters if they have values
        const level = this.filters.level?.value;
        const category = this.filters.category?.value;
        const search = this.filters.search?.value;

        if (level) {
            url.searchParams.set('level', level);
        } else {
            url.searchParams.delete('level');
        }

        if (category) {
            url.searchParams.set('category', category);
        } else {
            url.searchParams.delete('category');
        }

        if (search) {
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('search');
        }

        // Update browser history
        window.history.pushState({
            page: this.currentPage,
            level,
            category,
            search
        }, '', url);
    }

    renderCurrentPage() {
        const vocabGrid = document.getElementById('vocabulary-grid');
        if (!vocabGrid) return;

        // Get all cards (respecting current filters)
        const allCards = Array.from(vocabGrid.querySelectorAll('.vocab-card'));
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
        } else {
            // Standard rendering: hide all, show current page
            allCards.forEach(card => {
                if (card.style.display !== 'none') {
                    card.style.display = 'none';
                    card.dataset.paginated = 'true';
                }
            });

            // Show only cards for current page
            const pageCards = visibleCards.slice(startIndex, endIndex);
            pageCards.forEach(card => {
                card.style.display = '';
            });
        }

        // Update pagination UI
        this.updatePaginationUI();

        // Update showing count
        const showingCount = document.getElementById('showing-count');
        if (showingCount) {
            const actualShowing = Math.min(this.itemsPerPage, totalVisible - startIndex);
            showingCount.textContent = actualShowing;
        }

        console.log(`[Pagination] Rendered page ${this.currentPage}: showing ${Math.min(this.itemsPerPage, totalVisible - startIndex)} of ${totalVisible} items (virtual: ${this.virtualScrollEnabled})`);
    }

    /**
     * Virtual scrolling optimization for large datasets
     * Only renders visible items + buffer zone
     */
    renderVirtualScrollPage(visibleCards, startIndex, endIndex) {
        const vocabGrid = document.getElementById('vocabulary-grid');
        if (!vocabGrid) return;

        // Buffer zone: render extra items above/below for smooth scrolling
        const bufferSize = 10;
        const renderStart = Math.max(0, startIndex - bufferSize);
        const renderEnd = Math.min(visibleCards.length, endIndex + bufferSize);

        // Hide all cards
        visibleCards.forEach(card => {
            card.style.display = 'none';
        });

        // Show only cards in render range
        for (let i = renderStart; i < renderEnd; i++) {
            visibleCards[i].style.display = '';
        }

        console.log(`[VirtualScroll] Rendered items ${renderStart}-${renderEnd} (visible: ${startIndex}-${endIndex})`);
    }

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
        prevBtns.forEach(btn => {
            if (this.currentPage <= 1) {
                btn.style.display = 'none';
            } else {
                btn.style.display = '';
            }
        });

        // Update next button
        const nextBtns = document.querySelectorAll('.pagination-next');
        nextBtns.forEach(btn => {
            if (this.currentPage >= this.totalPages) {
                btn.style.display = 'none';
            } else {
                btn.style.display = '';
            }
        });

        // Update page jump dropdown
        const pageJump = document.getElementById('page-jump');
        if (pageJump) {
            // Rebuild options
            pageJump.innerHTML = '';
            for (let i = 1; i <= this.totalPages; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                if (i === this.currentPage) {
                    option.selected = true;
                }
                pageJump.appendChild(option);
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

    loadInlineData() {
        try {
            const script = document.getElementById('vocabulary-data');
            const parsed = script ? JSON.parse(script.textContent || '[]') : [];
            this.inlineVocab = Array.isArray(parsed) ? parsed : [];
            this.vocabById = new Map(this.inlineVocab.map(it => [it.id, it]));
        } catch (e) {
            this.inlineVocab = [];
            this.vocabById = new Map();
            console.warn('Failed to parse inline vocabulary data', e);
        }
    }

    async loadDependencies() {
        // All dependencies are loaded via classic script tags; nothing to do here.
        return [];
    }

    initializeFilters() {
        this.filters = {
            level: document.getElementById('level-filter'),
            category: document.getElementById('category-filter'),
            search: document.getElementById('search-input')
        };
    }

    initializeVocabularyCards() {
        if (!window.EnhancedVocabCards) {
            return;
        }

        try {
            this.enhancedVocab = new window.EnhancedVocabCards();
        } catch (error) {
            console.warn('Failed to initialise EnhancedVocabCards:', error);
            this.enhancedVocab = null;
        }
    }

    initializeCulturalToggle() {
        const container = document.getElementById('cultural-context-container');
        if (!container || !window.CulturalContextToggle) return;

        try {
            this.culturalToggle = new window.CulturalContextToggle({
                container
            });
            this.culturalToggle.init();
        } catch (error) {
            console.warn('Failed to initialise CulturalContextToggle:', error);
            this.culturalToggle = null;
        }
    }

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
        const practiceBtn = document.getElementById('practice-selected');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => this.handlePracticeSelected());
        }

        // Clear filters
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Individual practice buttons (using event delegation for dynamic content)
        const vocabGrid = document.getElementById('vocabulary-grid');
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
        quickFilterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickFilter(e));
        });

        // Language direction changes
        document.addEventListener('learning-direction-changed', () => {
            this.updateDirectionUI(this.getCurrentDirection());
            this.applyFilters();
        });
        document.addEventListener('language-direction-changed', (e) => {
            const dir = e?.detail?.direction || this.getCurrentDirection();
            this.updateDirectionUI(dir);
            this.applyFilters();
        });
    }

    initializeVirtualScrolling() {
        if (!this.container) return;

        const container = document.querySelector(this.container);
        if (!container) return;

        // Implement intersection observer for virtual scrolling
        this.intersectionObserver = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                root: container,
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load more items when scrolling near bottom
                this.loadMoreItems();
            }
        });
    }

    handleSearch(event) {
        clearTimeout(this.searchTimeout);
        
        const query = event.target.value;
        
        if (!this.isSearching && query.length > 0) {
            this.showSearchIndicator();
        }

        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
            this.hideSearchIndicator();
        }, 250);
    }

    handleSearchKeydown(event) {
        if (event.key === 'Escape') {
            event.target.value = '';
            this.applyFilters();
            event.target.blur();
        }
    }

    performSearch(query) {
        // Optimized search with indexing
        const searchIndex = this.buildSearchIndex();
        const results = this.searchInIndex(searchIndex, query);
        this.renderSearchResults(results);
    }

    buildSearchIndex() {
        // Create search index for better performance
        if (this.searchIndex) return this.searchIndex;

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

    searchInIndex(index, query) {
        const lowerQuery = query.toLowerCase();
        return index.filter(entry => 
            entry.searchText.includes(lowerQuery)
        ).map(entry => entry.item);
    }

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

        let items = this.adapter.getItemsForDirection(currentDirection) || [];
        const filtered = this.filterItems(items);
        this.updateFilteredResults(filtered);
        // Re-render pagination after filtering
        this.renderCurrentPage();
  }

    filterItems(items) {
        const levelValue = this.filters.level?.value || '';
        const categoryValue = this.filters.category?.value || '';
        const searchValue = this.filters.search?.value?.toLowerCase() || '';

        return items.filter(item => {
            const levelMatch = !levelValue || item.level === levelValue;
            const categoryMatch = !categoryValue || item.category === categoryValue;
            const searchMatch = !searchValue || 
                item.word.toLowerCase().includes(searchValue) ||
                item.translation.toLowerCase().includes(searchValue) ||
                (item.notes && item.notes.toLowerCase().includes(searchValue));

            return levelMatch && categoryMatch && searchMatch;
        });
    }

    updateFilteredResults(filtered) {
        // Update vocabulary cards efficiently when available, otherwise fallback to DOM filtering
        if (this.enhancedVocab && typeof this.enhancedVocab.renderItems === 'function') {
            this.enhancedVocab.renderItems(filtered);
        } else {
            this.domApplyFilters();
        }

        // Update counters
        const showingCount = document.getElementById('showing-count');
        if (showingCount && Array.isArray(filtered)) {
            showingCount.textContent = filtered.length;
        }

        // Show/hide no results message
        this.toggleNoResultsMessage(filtered.length === 0);
    }

    toggleNoResultsMessage(show) {
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.classList.toggle('hidden', !show);
        }
    }

    showSearchIndicator() {
        this.isSearching = true;
        const searchContainer = this.filters.search?.parentElement;
        if (searchContainer) {
            searchContainer.classList.add('searching');
            
            if (!searchContainer.querySelector('.search-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'search-spinner';
                spinner.innerHTML = '<div class="spinner"></div>';
                searchContainer.appendChild(spinner);
            }
        }
    }

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

    normalizeDirection(value) {
        if (!value) return null;
        const normalized = value.toString().toLowerCase();
        if (normalized === 'bg-de' || normalized === 'bg_to_de') return 'bg-de';
        if (normalized === 'de-bg' || normalized === 'de_to_bg') return 'de-bg';
        return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
    }

    getCurrentDirection() {
        if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
            return window.languageToggle.getDirection();
        }

        const stored =
            localStorage.getItem('bgde:language-direction') ||
            localStorage.getItem('bgde:learning_direction');

        return this.normalizeDirection(stored) || 'de-bg';
    }

    handleQuickFilter(event) {
        const button = event.currentTarget;
        const filterType = button.dataset.filterType; // 'level' or 'category'
        const filterValue = button.dataset.filterValue;
        
        // Update active state for visual feedback
        const sameTypeButtons = document.querySelectorAll(`[data-filter-type="${filterType}"]`);
        sameTypeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update corresponding select dropdown
        if (filterType === 'level' && this.filters.level) {
            this.filters.level.value = filterValue;
        } else if (filterType === 'category' && this.filters.category) {
            this.filters.category.value = filterValue;
        }
        
        // Apply filters
        this.applyFilters();
        
        console.log(`[QuickFilter] Applied ${filterType}: ${filterValue || 'all'}`);
    }

    handlePracticeSingle(button) {
        const word = button.dataset.word;
        const cardElement = button.closest('.vocab-card');
        const itemId = cardElement?.dataset.id;
        
        if (word || itemId) {
            // Store single word for practice session
            localStorage.setItem('bgde:practice_selection', JSON.stringify([word || itemId]));
            // Navigate to practice page (relative to parent)
            window.location.href = '../practice/';
        } else {
            console.warn('Cannot practice: no word or ID found');
        }
    }

    handlePracticeSelected() {
        const selected = Array.from(document.querySelectorAll('.vocab-select:checked'))
            .map(checkbox => checkbox.dataset.word);

        if (selected.length > 0) {
            localStorage.setItem('bgde:practice_selection', JSON.stringify(selected));
            window.location.href = '../practice/';
        } else {
            this.showSelectionAlert();
        }
    }

    showSelectionAlert() {
        // Create modern alert instead of browser alert
        const alert = document.createElement('div');
        alert.className = 'selection-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <p>Bitte wählen Sie mindestens ein Wortschatzelement zum Üben aus.</p>
                <p>Моля, изберете поне един елемент от речника за упражнение.</p>
                <button class="alert-close">OK</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 3 seconds or on click
        setTimeout(() => alert.remove(), 3000);
        alert.querySelector('.alert-close').addEventListener('click', () => alert.remove());
    }

    clearFilters() {
        if (this.filters.level) this.filters.level.value = '';
        if (this.filters.category) this.filters.category.value = '';
        if (this.filters.search) this.filters.search.value = '';
        this.applyFilters();
    }

    performInitialRender() {
        const currentDirection = this.getCurrentDirection();
        this.updateDirectionUI(currentDirection);
        this.domApplyFilters();
        // Render the current page after initial load
        this.renderCurrentPage();
  }

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

    appendItems(items) {
        if (this.enhancedVocab && this.enhancedVocab.appendItems) {
            this.enhancedVocab.appendItems(items);
        }
    }

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

    // Cleanup method for memory management
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        clearTimeout(this.searchTimeout);
        
        // Remove event listeners
        Object.values(this.filters).forEach(filter => {
            if (filter) {
                filter.removeEventListener('change', this.applyFilters);
                filter.removeEventListener('input', this.handleSearch);
            }
        });
    }
}

// Expose globally for classic script inclusion
if (typeof window !== 'undefined') {
    window.VocabularyPageModule = VocabularyPageModule;
}
