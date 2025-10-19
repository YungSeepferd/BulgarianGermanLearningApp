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
        this.virtualScrollThreshold = 100;
        this.visibleItems = [];
        this.allItems = [];
    }

    async init() {
        try {
            // Lazy load dependencies only when needed
            await this.loadDependencies();
            
            // Initialize components
            this.initializeFilters();
            this.initializeVocabularyCards();
            this.initializeCulturalToggle();
            this.initializeEventListeners();
            this.initializeVirtualScrolling();
            
            // Initial render with performance optimization
            this.performInitialRender();
            
            console.log('VocabularyPageModule initialized successfully');
        } catch (error) {
            console.error('Failed to initialize VocabularyPageModule:', error);
            this.showErrorState();
        }
    }

    async loadDependencies() {
        // Dynamically import only required modules
        const modules = await Promise.all([
            this.loadModule('enhanced-vocab-cards'),
            this.loadModule('cultural-context-toggle')
        ]);
        
        return modules;
    }

    async loadModule(moduleName) {
        try {
            // Use dynamic imports for better performance
            const module = await import(`../enhanced-${moduleName}.js`);
            return module.default || module;
        } catch (error) {
            console.warn(`Failed to load module ${moduleName}:`, error);
            return null;
        }
    }

    initializeFilters() {
        this.filters = {
            level: document.getElementById('level-filter'),
            category: document.getElementById('category-filter'),
            search: document.getElementById('search-input')
        };
    }

    initializeVocabularyCards() {
        if (!this.adapter) return;

        this.enhancedVocab = new EnhancedVocabCards({
            container: this.container,
            adapter: this.adapter,
            showCulturalContext: true,
            enableInteractions: true,
            virtualScrolling: true,
            threshold: this.virtualScrollThreshold
        });

        this.enhancedVocab.init();
    }

    initializeCulturalToggle() {
        const container = document.getElementById('cultural-context-container');
        if (!container) return;

        this.culturalToggle = new CulturalContextToggle({
            container: container
        });
        this.culturalToggle.init();
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

        // Language direction changes
        document.addEventListener('learning-direction-changed', () => this.applyFilters());
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
        const currentDirection = this.getCurrentDirection();
        let items = this.adapter ? this.adapter.getItemsForDirection(currentDirection) : [];

        // Apply filters with performance optimization
        const filtered = this.filterItems(items);
        
        // Update UI efficiently
        this.updateFilteredResults(filtered);
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
        // Update vocabulary cards efficiently
        if (this.enhancedVocab) {
            this.enhancedVocab.renderItems(filtered);
        }

        // Update counters
        const showingCount = document.getElementById('showing-count');
        if (showingCount) {
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

    handlePracticeSelected() {
        const selected = Array.from(document.querySelectorAll('.vocab-select:checked'))
            .map(checkbox => checkbox.dataset.word);

        if (selected.length > 0) {
            localStorage.setItem('bgde:practice_selection', JSON.stringify(selected));
            window.location.href = '/practice/';
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
        // Load initial items with performance optimization
        const currentDirection = this.getCurrentDirection();
        this.allItems = this.adapter ? this.adapter.getItemsForDirection(currentDirection) : [];
        
        // Render first batch immediately, rest lazily
        this.renderInitialBatch();
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

// Export for module loading
export default VocabularyPageModule;
