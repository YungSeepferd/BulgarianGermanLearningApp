/**
 * Simplified Vocabulary functionality - Global functions approach
 * No ES modules or classes, just simple global functions
 */

// Extend global namespace
window.BgDeApp = window.BgDeApp || {};

// Vocabulary state
BgDeApp.vocabulary = {
    data: [],
    filteredData: [],
    selectedWords: new Set(),
    filters: {
        level: '',
        category: '',
        search: ''
    }
};

// Initialize vocabulary functionality
BgDeApp.initVocabulary = function() {
    BgDeApp.loadVocabularyData();
    BgDeApp.bindVocabularyEvents();
    BgDeApp.renderVocabulary();
    BgDeApp.updateVocabularyStats();
};

// Load vocabulary data from Hugo template
BgDeApp.loadVocabularyData = function() {
    const dataScript = document.getElementById('vocabulary-data');
    if (dataScript) {
        try {
            BgDeApp.vocabulary.data = JSON.parse(dataScript.textContent);
            BgDeApp.vocabulary.filteredData = [...BgDeApp.vocabulary.data];
        } catch (error) {
            console.error('Failed to parse vocabulary data:', error);
            BgDeApp.vocabulary.data = [];
            BgDeApp.vocabulary.filteredData = [];
        }
    }
};

// Bind vocabulary events
BgDeApp.bindVocabularyEvents = function() {
    // Filter controls
    const levelFilter = document.getElementById('level-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const clearFilters = document.getElementById('clear-filters');
    const practiceSelected = document.getElementById('practice-selected');

    if (levelFilter) {
        levelFilter.addEventListener('change', function(e) {
            BgDeApp.vocabulary.filters.level = e.target.value;
            BgDeApp.applyVocabularyFilters();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            BgDeApp.vocabulary.filters.category = e.target.value;
            BgDeApp.applyVocabularyFilters();
        });
    }

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                BgDeApp.vocabulary.filters.search = e.target.value.toLowerCase();
                BgDeApp.applyVocabularyFilters();
            }, 300);
        });
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            BgDeApp.clearAllVocabularyFilters();
        });
    }

    if (practiceSelected) {
        practiceSelected.addEventListener('click', function() {
            BgDeApp.startPracticeWithSelected();
        });
    }

    // Card selection events
    BgDeApp.bindCardSelectionEvents();
};

// Bind card selection events
BgDeApp.bindCardSelectionEvents = function() {
    document.addEventListener('click', function(e) {
        // Handle card selection
        if (e.target.classList.contains('vocabulary-card') || e.target.closest('.vocabulary-card')) {
            const card = e.target.classList.contains('vocabulary-card') ? e.target : e.target.closest('.vocabulary-card');
            const word = card.dataset.word;
            
            if (word) {
                BgDeApp.toggleWordSelection(word, card);
            }
        }

        // Handle flip button
        if (e.target.classList.contains('flip-btn') || e.target.closest('.flip-btn')) {
            e.preventDefault();
            const card = e.target.closest('.vocabulary-card');
            if (card) {
                BgDeApp.flipVocabularyCard(card);
            }
        }
    });
};

// Apply vocabulary filters
BgDeApp.applyVocabularyFilters = function() {
    BgDeApp.vocabulary.filteredData = BgDeApp.vocabulary.data.filter(function(item) {
        // Level filter
        if (BgDeApp.vocabulary.filters.level && item.level !== BgDeApp.vocabulary.filters.level) {
            return false;
        }

        // Category filter
        if (BgDeApp.vocabulary.filters.category && item.category !== BgDeApp.vocabulary.filters.category) {
            return false;
        }

        // Search filter
        if (BgDeApp.vocabulary.filters.search) {
            const searchTerm = BgDeApp.vocabulary.filters.search;
            return item.word.toLowerCase().includes(searchTerm) ||
                   item.translation.toLowerCase().includes(searchTerm) ||
                   (item.notes && item.notes.toLowerCase().includes(searchTerm));
        }

        return true;
    });

    BgDeApp.renderVocabulary();
    BgDeApp.updateVocabularyStats();
};

// Clear all filters
BgDeApp.clearAllVocabularyFilters = function() {
    BgDeApp.vocabulary.filters = {
        level: '',
        category: '',
        search: ''
    };

    // Reset form controls
    const levelFilter = document.getElementById('level-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');

    if (levelFilter) levelFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (searchInput) searchInput.value = '';

    BgDeApp.vocabulary.filteredData = [...BgDeApp.vocabulary.data];
    BgDeApp.renderVocabulary();
    BgDeApp.updateVocabularyStats();
};

// Render vocabulary cards
BgDeApp.renderVocabulary = function() {
    const container = document.getElementById('vocabulary-grid');
    if (!container) return;

    if (BgDeApp.vocabulary.filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">No vocabulary items found matching your criteria.</div>';
        return;
    }

    container.innerHTML = BgDeApp.vocabulary.filteredData.map(function(item) {
        const isSelected = BgDeApp.vocabulary.selectedWords.has(item.word);
        return `
            <div class="vocabulary-card ${isSelected ? 'selected' : ''}" data-word="${item.word}">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="word">${item.word}</div>
                        <div class="word-meta">
                            <span class="level-badge">${item.level}</span>
                            <span class="category-tag">${item.category}</span>
                        </div>
                    </div>
                    <div class="card-back hidden">
                        <div class="translation">${item.translation}</div>
                        ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="flip-btn">Flip</button>
                </div>
            </div>
        `;
    }).join('');
};

// Update vocabulary stats
BgDeApp.updateVocabularyStats = function() {
    const totalCount = document.getElementById('total-count');
    const filteredCount = document.getElementById('filtered-count');
    const selectedCount = document.getElementById('selected-count');

    if (totalCount) totalCount.textContent = BgDeApp.vocabulary.data.length;
    if (filteredCount) filteredCount.textContent = BgDeApp.vocabulary.filteredData.length;
    if (selectedCount) selectedCount.textContent = BgDeApp.vocabulary.selectedWords.size;

    // Update practice button state
    const practiceBtn = document.getElementById('practice-selected');
    if (practiceBtn) {
        practiceBtn.disabled = BgDeApp.vocabulary.selectedWords.size === 0;
        practiceBtn.textContent = `Practice Selected (${BgDeApp.vocabulary.selectedWords.size})`;
    }
};

// Toggle word selection
BgDeApp.toggleWordSelection = function(word, cardElement) {
    if (BgDeApp.vocabulary.selectedWords.has(word)) {
        BgDeApp.vocabulary.selectedWords.delete(word);
        cardElement.classList.remove('selected');
    } else {
        BgDeApp.vocabulary.selectedWords.add(word);
        cardElement.classList.add('selected');
    }
    
    BgDeApp.updateVocabularyStats();
};

// Flip vocabulary card
BgDeApp.flipVocabularyCard = function(cardElement) {
    const front = cardElement.querySelector('.card-front');
    const back = cardElement.querySelector('.card-back');
    
    if (front && back) {
        front.classList.toggle('hidden');
        back.classList.toggle('hidden');
    }
};

// Start practice with selected words
BgDeApp.startPracticeWithSelected = function() {
    if (BgDeApp.vocabulary.selectedWords.size === 0) {
        alert('Please select some words to practice.');
        return;
    }

    // Store selected words in localStorage for practice page
    localStorage.setItem('bgde:practice_selection', JSON.stringify(Array.from(BgDeApp.vocabulary.selectedWords)));
    
    // Navigate to practice page
    window.location.href = '/practice/';
};

// Utility function to shuffle array
BgDeApp.shuffleArray = function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the vocabulary page
    if (document.getElementById('vocabulary-grid')) {
        BgDeApp.initVocabulary();
    }
});
