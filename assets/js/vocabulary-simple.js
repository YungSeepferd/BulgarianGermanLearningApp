/**
 * Simplified Vocabulary functionality - Global functions approach
 * No ES modules, just simple global functions
 */

// Global namespace
window.BgDeApp = window.BgDeApp || {};

// Vocabulary data and state
BgDeApp.vocabulary = {
  data: [],
  filtered: [],
  currentFilters: {
    level: '',
    category: '',
    search: ''
  }
};

// Initialize vocabulary functionality
BgDeApp.initVocabulary = function() {
  BgDeApp.loadVocabularyData();
  BgDeApp.bindVocabularyEvents();
};

// Load vocabulary data from Hugo template
BgDeApp.loadVocabularyData = function() {
  const dataScript = document.getElementById('vocabulary-data');
  if (dataScript) {
    try {
      BgDeApp.vocabulary.data = JSON.parse(dataScript.textContent);
      BgDeApp.populateFilters();
      BgDeApp.applyVocabularyFilters();
    } catch (error) {
      console.error('Failed to parse vocabulary data:', error);
      BgDeApp.vocabulary.data = [];
    }
  }
};

// Populate filter dropdowns
BgDeApp.populateFilters = function() {
  const levelFilter = document.getElementById('level-filter');
  const categoryFilter = document.getElementById('category-filter');
  
  if (!levelFilter || !categoryFilter) return;
  
  // Get unique levels and categories
  const levels = [...new Set(BgDeApp.vocabulary.data.map(item => item.level).filter(Boolean))];
  const categories = [...new Set(BgDeApp.vocabulary.data.map(item => item.category).filter(Boolean))];
  
  // Keep existing options, just add new ones if needed
  levels.sort().forEach(level => {
    if (!levelFilter.querySelector(`option[value="${level}"]`)) {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = level;
      levelFilter.appendChild(option);
    }
  });
  
  categories.sort().forEach(category => {
    if (!categoryFilter.querySelector(`option[value="${category}"]`)) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    }
  });
};

// Bind vocabulary events
BgDeApp.bindVocabularyEvents = function() {
  const levelFilter = document.getElementById('level-filter');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  const practiceSelectedBtn = document.getElementById('practice-selected');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // Filter events
  if (levelFilter) {
    levelFilter.addEventListener('change', BgDeApp.handleVocabularyFilterChange);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', BgDeApp.handleVocabularyFilterChange);
  }
  
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(BgDeApp.handleVocabularyFilterChange, 250);
    });
  }
  
  // Practice selected words
  if (practiceSelectedBtn) {
    practiceSelectedBtn.addEventListener('click', BgDeApp.practiceSelectedWords);
  }
  
  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', BgDeApp.clearVocabularyFilters);
  }
  
  // Listen for language direction changes
  document.addEventListener('learning-direction-changed', function() {
    BgDeApp.applyVocabularyFilters();
  });
};

// Handle filter changes
BgDeApp.handleVocabularyFilterChange = function() {
  const levelFilter = document.getElementById('level-filter');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  
  BgDeApp.vocabulary.currentFilters = {
    level: levelFilter?.value || '',
    category: categoryFilter?.value || '',
    search: searchInput?.value || ''
  };
  
  BgDeApp.applyVocabularyFilters();
};

// Apply filters to vocabulary data
BgDeApp.applyVocabularyFilters = function() {
  const filters = BgDeApp.vocabulary.currentFilters;
  
  BgDeApp.vocabulary.filtered = BgDeApp.vocabulary.data.filter(function(item) {
    const levelMatch = !filters.level || item.level === filters.level;
    const categoryMatch = !filters.category || item.category === filters.category;
    const searchMatch = !filters.search || 
      item.word.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.translation.toLowerCase().includes(filters.search.toLowerCase());
    
    return levelMatch && categoryMatch && searchMatch;
  });
  
  BgDeApp.renderVocabularyCards();
  BgDeApp.updateVocabularyStats();
};

// Render vocabulary cards
BgDeApp.renderVocabularyCards = function() {
  const grid = document.getElementById('vocabulary-grid');
  const noResults = document.getElementById('no-results');
  
  if (!grid) return;
  
  if (BgDeApp.vocabulary.filtered.length === 0) {
    if (noResults) noResults.classList.remove('hidden');
    return;
  }
  
  if (noResults) noResults.classList.add('hidden');
  
  // Update existing cards or create new ones
  const existingCards = grid.querySelectorAll('.vocab-card');
  existingCards.forEach(card => card.remove());
  
  BgDeApp.vocabulary.filtered.forEach(function(item) {
    const cardElement = BgDeApp.createVocabularyCard(item);
    grid.appendChild(cardElement);
  });
  
  BgDeApp.bindVocabularyCardEvents();
};

// Create a vocabulary card element
BgDeApp.createVocabularyCard = function(item) {
  const card = document.createElement('div');
  card.className = 'vocab-card';
  card.dataset.word = item.word;
  card.dataset.translation = item.translation;
  card.dataset.level = item.level || 'A1';
  card.dataset.category = item.category || '';
  
  // Get current learning direction
  const direction = localStorage.getItem('bgde:learning_direction') || 'bg_to_de';
  const isReverse = direction === 'de_to_bg';
  const frontText = isReverse ? item.translation : item.word;
  const backText = isReverse ? item.word : item.translation;
  
  card.innerHTML = `
    <div class="vocab-header">
      <div class="vocab-word">${BgDeApp.escapeHtml(frontText)}</div>
      <input type="checkbox" class="vocab-select" data-word="${BgDeApp.escapeHtml(item.word)}">
    </div>
    
    <div class="vocab-translation hidden">${BgDeApp.escapeHtml(backText)}</div>
    
    <div class="vocab-meta">
      <span class="level-badge level-${(item.level || 'a1').toLowerCase()}">${item.level || 'A1'}</span>
      <span class="category-tag">${BgDeApp.escapeHtml(item.category || '')}</span>
    </div>
    
    ${item.notes ? `<div class="vocab-notes hidden">${BgDeApp.escapeHtml(item.notes)}</div>` : ''}
    
    <div class="vocab-actions">
      <button class="flip-btn" type="button">Flip</button>
      <button class="practice-single-btn" type="button" data-word="${BgDeApp.escapeHtml(item.word)}">Practice</button>
    </div>
  `;
  
  return card;
};

// Bind events to vocabulary cards
BgDeApp.bindVocabularyCardEvents = function() {
  const grid = document.getElementById('vocabulary-grid');
  if (!grid) return;
  
  // Use event delegation for better performance
  grid.addEventListener('click', function(e) {
    if (e.target.classList.contains('flip-btn')) {
      BgDeApp.flipVocabularyCard(e.target);
    } else if (e.target.classList.contains('practice-single-btn')) {
      const word = e.target.dataset.word;
      BgDeApp.startSingleWordPractice(word);
    }
  });
};

// Flip a vocabulary card
BgDeApp.flipVocabularyCard = function(button) {
  const card = button.closest('.vocab-card');
  const translation = card.querySelector('.vocab-translation');
  const notes = card.querySelector('.vocab-notes');
  
  if (translation) {
    translation.classList.toggle('hidden');
  }
  if (notes) {
    notes.classList.toggle('hidden');
  }
  
  button.textContent = translation && translation.classList.contains('hidden') ? 'Flip' : 'Hide';
};

// Start practice with selected words
BgDeApp.practiceSelectedWords = function() {
  const selectedCheckboxes = document.querySelectorAll('.vocab-select:checked');
  const selectedWords = Array.from(selectedCheckboxes).map(cb => cb.dataset.word);
  
  if (selectedWords.length === 0) {
    alert('Please select at least one vocabulary item to practice.');
    return;
  }
  
  // Store selected items for practice session
  localStorage.setItem('bgde:practice_selection', JSON.stringify(selectedWords));
  window.location.href = '/practice/';
};

// Start practice with single word
BgDeApp.startSingleWordPractice = function(word) {
  localStorage.setItem('bgde:practice_selection', JSON.stringify([word]));
  window.location.href = '/practice/';
};

// Clear all filters
BgDeApp.clearVocabularyFilters = function() {
  const levelFilter = document.getElementById('level-filter');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  
  if (levelFilter) levelFilter.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (searchInput) searchInput.value = '';
  
  BgDeApp.handleVocabularyFilterChange();
};

// Update vocabulary statistics
BgDeApp.updateVocabularyStats = function() {
  const totalCount = document.getElementById('total-count');
  const showingCount = document.getElementById('showing-count');
  
  if (totalCount) totalCount.textContent = BgDeApp.vocabulary.data.length;
  if (showingCount) showingCount.textContent = BgDeApp.vocabulary.filtered.length;
};

// Utility function to escape HTML
BgDeApp.escapeHtml = function(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  BgDeApp.initVocabulary();
});
