class GrammarApp {
    // private items: Element[]; // Removed unused property
    constructor(options) {
        this.container = options.container || '#grammar-list';
        this.languageDirection = this.getLanguageDirection();
        // If data is provided, use data-based rendering, otherwise use server-rendered DOM
        this.data = options.data || [];
        this.useServerRendering = this.data.length === 0;
        this.filteredData = [...this.data];
        // this.items = []; // Removed unused property initialization
        this.filters = {
            level: '',
            search: ''
        };
        // If using server-rendered content, get items from DOM
        // Note: items property removed as it was unused
        this.init();
    }
    init() {
        this.bindEvents();
        if (this.useServerRendering) {
            this.applyFiltersToDOM();
        }
        this.updateStats();
        this.updateDirectionNotes();
    }
    getServerRenderedItems() {
        const container = document.querySelector(this.container);
        if (!container) {
            return [];
        }
        return [...container.querySelectorAll('.grammar-item')];
    }
    bindEvents() {
        // Filter controls
        const levelFilter = document.querySelector('#grammar-level-filter');
        const searchInput = document.querySelector('#grammar-search');
        const clearFilters = document.querySelector('#clear-grammar-filters');
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                const target = e.target;
                this.filters.level = target.value;
                this.applyFilters();
            });
        }
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const target = e.target;
                clearTimeout(searchTimeout);
                searchTimeout = window.setTimeout(() => {
                    this.filters.search = target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
            });
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        document.addEventListener('language-direction-changed', (e) => {
            this.languageDirection = e?.detail?.direction || 'bg-de';
            this.updateDirectionNotes();
        });
        // Show more examples buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('show-more-examples')) {
                this.toggleExamples(target);
            }
        });
        // Exercise buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('start-exercise-btn')) {
                const grammarTitle = target.dataset.grammarTitle || '';
                this.startGrammarExercise(grammarTitle);
            }
        });
        // Bookmark buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('bookmark-btn')) {
                const grammarTitle = target.dataset.grammarTitle || '';
                this.toggleBookmark(grammarTitle, target);
            }
        });
    }
    applyFilters() {
        if (this.useServerRendering) {
            this.applyFiltersToDOM();
        }
        else {
            this.applyFiltersToData();
        }
        this.updateStats();
    }
    applyFiltersToDOM() {
        const items = this.getServerRenderedItems();
        let visibleCount = 0;
        for (const item of items) {
            let shouldShow = true;
            // Level filter
            if (this.filters.level) {
                const itemLevel = item.dataset.level || '';
                if (itemLevel !== this.filters.level) {
                    shouldShow = false;
                }
            }
            // Search filter
            if (this.filters.search && shouldShow) {
                const itemTitle = item.dataset.title || '';
                const itemDescription = item.dataset.description || '';
                const searchableText = itemTitle + ' ' + itemDescription;
                if (!searchableText.includes(this.filters.search)) {
                    shouldShow = false;
                }
            }
            item.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visibleCount++;
            }
        }
        // Show/hide no results message
        const container = document.querySelector(this.container);
        const noResults = document.querySelector('#grammar-no-results');
        if (visibleCount === 0) {
            container?.classList.add('no-results-state');
            noResults?.classList.remove('hidden');
        }
        else {
            container?.classList.remove('no-results-state');
            noResults?.classList.add('hidden');
        }
    }
    applyFiltersToData() {
        this.filteredData = this.data.filter(item => {
            // Level filter
            if (this.filters.level && item.level !== this.filters.level) {
                return false;
            }
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search;
                const searchableText = [
                    item.title,
                    item.description,
                    ...(item.examples || [])
                ].join(' ').toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            return true;
        });
        this.render();
    }
    render() {
        // Only render if using data-based approach (not server rendering)
        if (this.useServerRendering) {
            return; // DOM is already rendered by server
        }
        const container = document.querySelector(this.container);
        const noResults = document.querySelector('#grammar-no-results');
        if (!container) {
            return;
        }
        if (this.filteredData.length === 0) {
            container.style.display = 'none';
            noResults?.classList.remove('hidden');
            return;
        }
        container.style.display = 'block';
        noResults?.classList.add('hidden');
        container.innerHTML = this.filteredData.map(item => this.renderGrammarItem(item)).join('');
        this.updateDirectionNotes();
    }
    renderGrammarItem(item) {
        const bookmarked = this.isBookmarked(item.title);
        const examplesId = `examples-${this.slugify(item.title)}`;
        const notesHtml = this.buildNotesHtml(item);
        return `
            <article class="grammar-item" 
                     data-level="${item.level}" 
                     data-title="${item.title.toLowerCase()}"
                     data-description="${item.description.toLowerCase()}">
                <header class="grammar-header">
                    <h2>${item.title}</h2>
                    <span class="level-badge level-${item.level.toLowerCase()}">${item.level}</span>
                </header>
                
                <div class="grammar-description">
                    ${this.markdownToHtml(item.description)}
                </div>
                
                ${notesHtml}

                ${item.examples && item.examples.length > 0 ? `
                    <div class="grammar-examples">
                        <h3>Examples:</h3>
                        <ul class="examples-list" id="${examplesId}">
                            ${item.examples.slice(0, 3).map(example => `<li class="example-item">${example}</li>`).join('')}
                            ${item.examples.length > 3 ? `
                                <div class="hidden-examples hidden">
                                    ${item.examples.slice(3).map(example => `<li class="example-item">${example}</li>`).join('')}
                                </div>
                            ` : ''}
                        </ul>
                        
                        ${item.examples.length > 3 ? `
                            <button class="show-more-examples" data-target="${examplesId}">
                                Show More Examples (${item.examples.length - 3} more)
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="grammar-actions">
                    <button class="start-exercise-btn" data-grammar-title="${item.title}">
                        Practice This Rule
                    </button>
                    <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}" 
                            data-grammar-title="${item.title}" 
                            title="${bookmarked ? 'Remove bookmark' : 'Bookmark this rule'}">
                        ${bookmarked ? '⭐' : '☆'}
                    </button>
                </div>
            </article>
        `;
    }
    buildNotesHtml(item) {
        const notesBg = item.notes_bg_to_de ? this.escapeHtml(item.notes_bg_to_de) : '';
        const notesDe = item.notes_de_to_bg ? this.escapeHtml(item.notes_de_to_bg) : '';
        if (!notesBg && !notesDe) {
            return '';
        }
        const showBg = this.languageDirection === 'bg-de';
        const showDe = this.languageDirection === 'de-bg';
        return `
            <div class="grammar-notes" aria-live="polite">
                ${notesBg ? `<div class="grammar-note-direction" data-direction="bg-de" style="${showBg ? '' : 'display:none;'}">${notesBg}</div>` : ''}
                ${notesDe ? `<div class="grammar-note-direction" data-direction="de-bg" style="${showDe ? '' : 'display:none;'}">${notesDe}</div>` : ''}
            </div>
        `;
    }
    toggleExamples(button) {
        const targetId = button.dataset.target || '';
        const examplesList = document.querySelector(`#${targetId}`);
        const hiddenExamples = examplesList?.querySelector('.hidden-examples');
        if (hiddenExamples) {
            const isHidden = hiddenExamples.classList.contains('hidden');
            hiddenExamples.classList.toggle('hidden');
            button.textContent = isHidden ? 'Show Fewer Examples' : `Show More Examples (${hiddenExamples.children.length} more)`;
        }
    }
    startGrammarExercise(grammarTitle) {
        const grammarItem = this.data.find(item => item.title === grammarTitle);
        if (!grammarItem) {
            return;
        }
        // Store grammar exercise data
        sessionStorage.setItem('practice-session', JSON.stringify({
            items: [grammarItem],
            type: 'grammar',
            timestamp: Date.now()
        }));
        // Navigate to practice page (relative to parent)
        window.location.href = '../practice/';
    }
    toggleBookmark(grammarTitle, button) {
        const bookmarks = this.getBookmarks();
        const isBookmarked = bookmarks.includes(grammarTitle);
        if (isBookmarked) {
            const index = bookmarks.indexOf(grammarTitle);
            bookmarks.splice(index, 1);
            button.classList.remove('bookmarked');
            button.textContent = '☆';
            button.title = 'Bookmark this rule';
        }
        else {
            bookmarks.push(grammarTitle);
            button.classList.add('bookmarked');
            button.textContent = '⭐';
            button.title = 'Remove bookmark';
        }
        localStorage.setItem('grammar-bookmarks', JSON.stringify(bookmarks));
    }
    isBookmarked(grammarTitle) {
        const bookmarks = this.getBookmarks();
        return bookmarks.includes(grammarTitle);
    }
    getBookmarks() {
        const stored = localStorage.getItem('grammar-bookmarks');
        return stored ? JSON.parse(stored) : [];
    }
    updateStats() {
        const totalCount = document.querySelector('#grammar-total');
        const showingCount = document.querySelector('#grammar-showing');
        if (this.useServerRendering) {
            const items = this.getServerRenderedItems();
            const visibleItems = items.filter(item => item.style.display !== 'none');
            if (totalCount) {
                totalCount.textContent = items.length.toString();
            }
            if (showingCount) {
                showingCount.textContent = visibleItems.length.toString();
            }
        }
        else {
            if (totalCount) {
                totalCount.textContent = this.data.length.toString();
            }
            if (showingCount) {
                showingCount.textContent = this.filteredData.length.toString();
            }
        }
    }
    updateDirectionNotes() {
        const containers = document.querySelectorAll('.grammar-notes');
        for (const container of containers) {
            const notes = [...container.querySelectorAll('.grammar-note-direction')];
            let shown = false;
            for (const note of notes) {
                if (!note.dataset.direction) {
                    continue;
                }
                const shouldShow = note.dataset.direction === this.languageDirection;
                note.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    shown = true;
                }
            }
            if (!shown) {
                const fallback = notes[0];
                if (fallback) {
                    fallback.style.display = '';
                }
            }
        }
    }
    clearAllFilters() {
        this.filters = { level: '', search: '' };
        // Reset form controls
        const levelFilter = document.querySelector('#grammar-level-filter');
        const searchInput = document.querySelector('#grammar-search');
        if (levelFilter) {
            levelFilter.value = '';
        }
        if (searchInput) {
            searchInput.value = '';
        }
        this.applyFilters();
    }
    getLanguageDirection() {
        try {
            if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
                return window.languageToggle.getDirection();
            }
            const stored = localStorage.getItem('bgde:language-direction') || localStorage.getItem('bgde:learning_direction');
            return stored === 'de-bg' ? 'de-bg' : 'bg-de';
        }
        catch {
            return 'bg-de';
        }
    }
    markdownToHtml(text) {
        // Simple markdown conversion for basic formatting
        return text
            .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replaceAll(/\*(.*?)\*/g, '<em>$1</em>')
            .replaceAll(/`(.*?)`/g, '<code>$1</code>')
            .replaceAll('\n', '<br>');
    }
    slugify(text) {
        return text.toLowerCase()
            .replaceAll(/[^\s\w-]/g, '')
            .replaceAll(/[\s_-]+/g, '-')
            .replaceAll(/^-+|-+$/g, '');
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Export for use in templates
window.GrammarApp = GrammarApp;
export {};
//# sourceMappingURL=grammar.js.map