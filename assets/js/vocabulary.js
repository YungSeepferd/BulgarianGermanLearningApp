// Vocabulary management and filtering
class VocabularyApp {
    constructor(options) {
        this.data = options.data || [];
        this.container = options.container || '#vocabulary-grid';
        this.filteredData = [...this.data];
        this.selectedWords = new Set();
        
        this.filters = {
            level: '',
            category: '',
            search: ''
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Filter controls
        const levelFilter = document.getElementById('level-filter');
        const categoryFilter = document.getElementById('category-filter');
        const searchInput = document.getElementById('search-input');
        const clearFilters = document.getElementById('clear-filters');
        const practiceSelected = document.getElementById('practice-selected');

        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.applyFilters();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        if (practiceSelected) {
            practiceSelected.addEventListener('click', () => {
                this.startPracticeSession();
            });
        }

        // Audio buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('audio-btn') || e.target.closest('.audio-btn')) {
                const btn = e.target.closest('.audio-btn');
                const word = btn.closest('.vocab-card').querySelector('.vocab-word').textContent;
                window.audioManager?.playWord(word, 'bg');
            }
        });

        // Selection checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('vocab-select')) {
                const word = e.target.dataset.word;
                if (e.target.checked) {
                    this.selectedWords.add(word);
                } else {
                    this.selectedWords.delete(word);
                }
                this.updatePracticeButton();
            }
        });

        // Practice single word buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('practice-single-btn')) {
                const word = e.target.dataset.word;
                this.startSingleWordPractice(word);
            }
        });
    }

    applyFilters() {
        this.filteredData = this.data.filter(item => {
            // Level filter
            if (this.filters.level && item.level !== this.filters.level) {
                return false;
            }

            // Category filter
            if (this.filters.category && item.category !== this.filters.category) {
                return false;
            }

            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search;
                const searchableText = [
                    item.word,
                    item.translation,
                    item.notes || '',
                    item.category
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        this.render();
        this.updateStats();
    }

    render() {
        const container = document.querySelector(this.container);
        const noResults = document.getElementById('no-results');

        if (!container) return;

        if (this.filteredData.length === 0) {
            container.style.display = 'none';
            noResults?.classList.remove('hidden');
            return;
        }

        container.style.display = 'grid';
        noResults?.classList.add('hidden');

        container.innerHTML = this.filteredData.map(item => this.renderVocabCard(item)).join('');
    }

    renderVocabCard(item) {
        const progress = window.progressTracker?.getItemProgress(item.word);
        const isSelected = this.selectedWords.has(item.word);
        
        let progressIndicator = '';
        if (progress) {
            const masteryLevel = this.getMasteryLevel(progress);
            progressIndicator = `<div class="progress-indicator ${masteryLevel}"></div>`;
        }

        return `
            <div class="vocab-card" 
                 data-level="${item.level}" 
                 data-category="${item.category}"
                 data-word="${item.word.toLowerCase()}"
                 data-translation="${item.translation.toLowerCase()}"
                 data-slug="${this.slugify(item.word)}">
                
                ${progressIndicator}
                
                <div class="vocab-header">
                    <div class="vocab-word">${item.word}</div>
                    <input type="checkbox" 
                           class="vocab-select" 
                           data-word="${item.word}"
                           ${isSelected ? 'checked' : ''}>
                </div>
                
                <div class="vocab-translation">${item.translation}</div>
                
                ${item.audio ? `
                    <button class="audio-btn" data-audio="${item.audio}" title="Play pronunciation">
                        <span class="audio-icon">🔊</span>
                    </button>
                ` : ''}
                
                <div class="vocab-meta">
                    <span class="level-badge level-${item.level.toLowerCase()}">${item.level}</span>
                    <span class="category-tag">${item.category}</span>
                </div>
                
                ${item.notes ? `<div class="vocab-notes">${item.notes}</div>` : ''}
                
                <div class="vocab-actions">
                    <button class="practice-single-btn" data-word="${item.word}">Practice</button>
                    ${progress ? `<span class="review-info">Next: ${this.formatNextReview(progress.nextReview)}</span>` : ''}
                </div>
            </div>
        `;
    }

    getMasteryLevel(progress) {
        if (progress.repetitions >= 5) return 'mastered';
        if (progress.repetitions >= 3) return 'familiar';
        if (progress.repetitions >= 1) return 'learning';
        return 'new';
    }

    formatNextReview(nextReviewDate) {
        if (!nextReviewDate) return 'Now';
        
        const date = new Date(nextReviewDate);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) return 'Now';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `${diffDays} days`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
        return `${Math.ceil(diffDays / 30)} months`;
    }

    updateStats() {
        const totalCount = document.getElementById('total-count');
        const showingCount = document.getElementById('showing-count');

        if (totalCount) totalCount.textContent = this.data.length;
        if (showingCount) showingCount.textContent = this.filteredData.length;
    }

    updatePracticeButton() {
        const practiceBtn = document.getElementById('practice-selected');
        if (practiceBtn) {
            const count = this.selectedWords.size;
            practiceBtn.textContent = count > 0 ? `Practice Selected (${count})` : 'Practice Selected';
            practiceBtn.disabled = count === 0;
        }
    }

    clearAllFilters() {
        this.filters = { level: '', category: '', search: '' };
        
        // Reset form controls
        const levelFilter = document.getElementById('level-filter');
        const categoryFilter = document.getElementById('category-filter');
        const searchInput = document.getElementById('search-input');

        if (levelFilter) levelFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (searchInput) searchInput.value = '';

        this.applyFilters();
    }

    startPracticeSession() {
        if (this.selectedWords.size === 0) return;

        const selectedItems = this.data.filter(item => this.selectedWords.has(item.word));
        this.navigateToPractice(selectedItems);
    }

    startSingleWordPractice(word) {
        const item = this.data.find(item => item.word === word);
        if (item) {
            this.navigateToPractice([item]);
        }
    }

    navigateToPractice(items) {
        // Store practice session data
        sessionStorage.setItem('practice-session', JSON.stringify({
            items: items,
            type: 'vocabulary',
            timestamp: Date.now()
        }));

        // Navigate to practice page
        window.location.href = '/practice/';
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}

// Export for use in templates
window.VocabularyApp = VocabularyApp;
