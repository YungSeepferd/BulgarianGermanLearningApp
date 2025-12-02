/**
 * Simplified Vocabulary functionality - Global functions approach
 * No ES modules or classes, just simple global functions
 */

// Import types using import type syntax
import type { VocabularyItem } from './types';

// Extend global namespace
window.BgDeApp = window.BgDeApp || {} as typeof window.BgDeApp;

// Vocabulary state
window.BgDeApp.vocabulary = {
  data: [] as VocabularyItem[],
  filteredData: [] as VocabularyItem[],
  selectedWords: new Set<string>(),
  filters: {
    level: '',
    category: '',
    search: ''
  }
};

// Initialize vocabulary functionality
window.BgDeApp.initVocabulary = function(): void {
  window.BgDeApp.loadVocabularyData();
  window.BgDeApp.bindVocabularyEvents();
  window.BgDeApp.renderVocabulary();
  window.BgDeApp.updateVocabularyStats();
};

// Load vocabulary data from Hugo template
window.BgDeApp.loadVocabularyData = function(): void {
  const dataScript = document.querySelector('#vocabulary-data');
  if (dataScript) {
    try {
      window.BgDeApp.vocabulary.data = JSON.parse(dataScript.textContent || '[]');
      window.BgDeApp.vocabulary.filteredData = [...window.BgDeApp.vocabulary.data];
    } catch (error) {
      console.error('Failed to parse vocabulary data:', error);
      window.BgDeApp.vocabulary.data = [];
      window.BgDeApp.vocabulary.filteredData = [];
    }
  }
};

// Bind vocabulary events
window.BgDeApp.bindVocabularyEvents = function(): void {
  // Filter controls
  const levelFilter = document.querySelector('#level-filter');
  const categoryFilter = document.querySelector('#category-filter');
  const searchInput = document.querySelector('#search-input');
  const clearFilters = document.querySelector('#clear-filters');
  const practiceSelected = document.querySelector('#practice-selected');

  if (levelFilter) {
    levelFilter.addEventListener('change', function(e: Event): void {
      const target = e.target as HTMLSelectElement;
      window.BgDeApp.vocabulary.filters.level = target.value;
      window.BgDeApp.applyVocabularyFilters();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', function(e: Event): void {
      const target = e.target as HTMLSelectElement;
      window.BgDeApp.vocabulary.filters.category = target.value;
      window.BgDeApp.applyVocabularyFilters();
    });
  }

  if (searchInput) {
    let searchTimeout: number;
    searchInput.addEventListener('input', function(e: Event): void {
      clearTimeout(searchTimeout);
      const target = e.target as HTMLInputElement;
      searchTimeout = window.setTimeout(function(): void {
        window.BgDeApp.vocabulary.filters.search = target.value.toLowerCase();
        window.BgDeApp.applyVocabularyFilters();
      }, 300);
    });
  }

  if (clearFilters) {
    clearFilters.addEventListener('click', function(): void {
      window.BgDeApp.clearAllVocabularyFilters();
    });
  }

  if (practiceSelected) {
    practiceSelected.addEventListener('click', function(): void {
      window.BgDeApp.startPracticeWithSelected();
    });
  }

  // Card selection events
  window.BgDeApp.bindCardSelectionEvents();
};

// Bind card selection events
window.BgDeApp.bindCardSelectionEvents = function(): void {
  document.addEventListener('click', function(e: Event): void {
    const target = e.target as HTMLElement;
    
    // Handle card selection
    if (target.classList.contains('vocabulary-card') || target.closest('.vocabulary-card')) {
      const card = target.classList.contains('vocabulary-card') ? target : target.closest('.vocabulary-card') as HTMLElement;
      const word = card?.dataset.word;
            
      if (word) {
        window.BgDeApp.toggleWordSelection(word, card);
      }
    }

    // Handle flip button
    if (target.classList.contains('flip-btn') || target.closest('.flip-btn')) {
      e.preventDefault();
      const card = target.closest('.vocabulary-card') as HTMLElement;
      if (card) {
        window.BgDeApp.flipVocabularyCard(card);
      }
    }
  });
};

// Apply vocabulary filters
window.BgDeApp.applyVocabularyFilters = function(): void {
  window.BgDeApp.vocabulary.filteredData = window.BgDeApp.vocabulary.data.filter(function(item: VocabularyItem): boolean {
    // Level filter
    if (window.BgDeApp.vocabulary.filters.level && item.level !== window.BgDeApp.vocabulary.filters.level) {
      return false;
    }

    // Category filter
    if (window.BgDeApp.vocabulary.filters.category && item.category !== window.BgDeApp.vocabulary.filters.category) {
      return false;
    }

    // Search filter
    if (window.BgDeApp.vocabulary.filters.search) {
      const searchTerm = window.BgDeApp.vocabulary.filters.search;
      return (item.word.toLowerCase().includes(searchTerm) ||
             item.translation.toLowerCase().includes(searchTerm) ||
             (item.notes && item.notes.toLowerCase().includes(searchTerm))) as boolean;
    }

    return true;
  });

  window.BgDeApp.renderVocabulary();
  window.BgDeApp.updateVocabularyStats();
};

// Clear all filters
window.BgDeApp.clearAllVocabularyFilters = function(): void {
  window.BgDeApp.vocabulary.filters = {
    level: '',
    category: '',
    search: ''
  };

  // Reset form controls
  const levelFilter = document.querySelector('#level-filter') as HTMLSelectElement;
  const categoryFilter = document.querySelector('#category-filter') as HTMLSelectElement;
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;

  if (levelFilter) {
    levelFilter.value = '';
  }
  if (categoryFilter) {
    categoryFilter.value = '';
  }
  if (searchInput) {
    searchInput.value = '';
  }

  window.BgDeApp.vocabulary.filteredData = [...window.BgDeApp.vocabulary.data];
  window.BgDeApp.renderVocabulary();
  window.BgDeApp.updateVocabularyStats();
};

// Render vocabulary cards
window.BgDeApp.renderVocabulary = function(): void {
  const container = document.querySelector('#vocabulary-grid');
  if (!container) {
    return;
  }

  if (window.BgDeApp.vocabulary.filteredData.length === 0) {
    container.innerHTML = '<div class="no-results">No vocabulary items found matching your criteria.</div>';
    return;
  }

  container.innerHTML = window.BgDeApp.vocabulary.filteredData.map(function(item: VocabularyItem): string {
    const isSelected = window.BgDeApp.vocabulary.selectedWords.has(item.word);
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
window.BgDeApp.updateVocabularyStats = function(): void {
  const totalCount = document.querySelector('#total-count');
  const filteredCount = document.querySelector('#filtered-count');
  const selectedCount = document.querySelector('#selected-count');

  if (totalCount) {
    totalCount.textContent = window.BgDeApp.vocabulary.data.length.toString();
  }
  if (filteredCount) {
    filteredCount.textContent = window.BgDeApp.vocabulary.filteredData.length.toString();
  }
  if (selectedCount) {
    selectedCount.textContent = window.BgDeApp.vocabulary.selectedWords.size.toString();
  }

  // Update practice button state
  const practiceBtn = document.querySelector('#practice-selected') as HTMLButtonElement;
  if (practiceBtn) {
    practiceBtn.disabled = window.BgDeApp.vocabulary.selectedWords.size === 0;
    practiceBtn.textContent = `Practice Selected (${window.BgDeApp.vocabulary.selectedWords.size})`;
  }
};

// Toggle word selection
window.BgDeApp.toggleWordSelection = function(word: string, cardElement: HTMLElement): void {
  if (window.BgDeApp.vocabulary.selectedWords.has(word)) {
    window.BgDeApp.vocabulary.selectedWords.delete(word);
    cardElement.classList.remove('selected');
  } else {
    window.BgDeApp.vocabulary.selectedWords.add(word);
    cardElement.classList.add('selected');
  }
    
  window.BgDeApp.updateVocabularyStats();
};

// Flip vocabulary card
window.BgDeApp.flipVocabularyCard = function(cardElement: HTMLElement): void {
  const front = cardElement.querySelector('.card-front');
  const back = cardElement.querySelector('.card-back');
    
  if (front && back) {
    front.classList.toggle('hidden');
    back.classList.toggle('hidden');
  }
};

// Start practice with selected words
window.BgDeApp.startPracticeWithSelected = function(): void {
  if (window.BgDeApp.vocabulary.selectedWords.size === 0) {
    alert('Please select some words to practice.');
    return;
  }

  // Store selected words in localStorage for practice page
  localStorage.setItem('bgde:practice_selection', JSON.stringify([...window.BgDeApp.vocabulary.selectedWords]));
    
  // Navigate to practice page (relative to parent)
  window.location.href = '../practice/';
};

// Utility function to shuffle array
window.BgDeApp.shuffleArray = function<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function(): void {
  // Only initialize if we're on the vocabulary page
  if (document.querySelector('#vocabulary-grid')) {
    window.BgDeApp.initVocabulary();
  }
});