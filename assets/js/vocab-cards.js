/**
 * @file vocab-cards.js
 * @description Interactive vocabulary card display system
 * @status ACTIVE
 * @dependencies language-toggle.js
 * @used_by layouts/_shortcodes/vocab.html, layouts/vocabulary/list.html
 * @features
 *   - Category and CEFR level filtering
 *   - Text search with debouncing
 *   - Card flip animations
 *   - Bidirectional display (Bulgarian↔German)
 *   - Accessibility (keyboard navigation, ARIA)
 * @see docs/ARCHITECTURE.md for system design
 * @version 1.0.0
 * @updated October 2025
 */

import { languageToggle } from './language-toggle.js';

export class VocabCards {
  constructor(container) {
    this.container = container;
    this.vocabularyData = [];
    this.filteredData = [];
    this.currentCategory = container.dataset.category || '';
    this.currentLevel = container.dataset.level || '';
    this.limit = parseInt(container.dataset.limit) || 0;
    this.interactive = container.dataset.interactive === 'true';
    this.languageDirection = languageToggle.getDirection();

    // DOM elements
    this.grid = container.querySelector('#vocab-grid');
    this.loading = container.querySelector('#vocab-loading');
    this.error = container.querySelector('#vocab-error');
    this.cardCount = container.querySelector('#card-count');
    this.categoryFilter = container.querySelector('#category-filter');
    this.levelFilter = container.querySelector('#level-filter');
    this.shuffleBtn = container.querySelector('#shuffle-cards');
    this.retryBtn = container.querySelector('#retry-load');

    // Bound event handlers for cleanup
    this.onLanguageDirectionChanged = this.handleLanguageDirectionChange.bind(this);
    this.languageListenerAttached = false;

    this.init();
  }
  
  async init() {
    this.bindEvents();
    await this.loadVocabulary();
    this.applyInitialFilters();
    this.renderCards();

    // Ensure loading is hidden after cards are rendered
    // Use requestAnimationFrame to wait for DOM paint
    requestAnimationFrame(() => {
      this.showLoading(false);
    });
  }
  
  bindEvents() {
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', () => this.handleFilterChange());
    }
    
    if (this.levelFilter) {
      this.levelFilter.addEventListener('change', () => this.handleFilterChange());
    }
    
    if (this.shuffleBtn) {
      this.shuffleBtn.addEventListener('click', () => this.shuffleCards());
    }
    
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => this.init());
    }
    
    // Listen for language direction changes (use bound handler for cleanup)
    if (!this.languageListenerAttached) {
      document.addEventListener('language-direction-changed', this.onLanguageDirectionChanged);
      this.languageListenerAttached = true;
    }
    
    // Keyboard navigation
  }
  
  async loadVocabulary() {
    try {
      this.showLoading(true);

      const inlineData = this.readInlineVocabulary();

      if (inlineData) {
        this.vocabularyData = inlineData;
        this.populateFilters();
        this.showError(false);
        return;
      }

      // Try to load from Hugo's data directory first
      let response = await fetch('/data/vocabulary.json');

      // Fallback to static directory if data directory fails
      if (!response.ok) {
        response = await fetch('/static/data/vocabulary.json');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.vocabularyData = await response.json();

      if (!Array.isArray(this.vocabularyData) || this.vocabularyData.length === 0) {
        throw new Error('Invalid or empty vocabulary data');
      }

      this.populateFilters();
      this.showError(false);

    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      this.showError(true, error.message);
      this.showLoading(false);

      // Fallback to empty array to prevent crashes
      this.vocabularyData = [];
    }
    // Note: Loading indicator is now hidden in init() after renderCards() completes
  }

  readInlineVocabulary() {
    const inlineNode = this.container.querySelector('[data-vocab-inline]');

    if (!inlineNode) {
      return null;
    }

    try {
      const inlineJson = inlineNode.textContent.trim();

      if (!inlineJson) {
        return null;
      }

      const parsed = JSON.parse(inlineJson);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.warn('Inline vocabulary data is empty or invalid array.');
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to parse inline vocabulary JSON:', error);
      return null;
    }
  }
  
  populateFilters() {
    if (!this.categoryFilter || !this.levelFilter) return;
    
    // Get unique categories and levels
    const categories = [...new Set(this.vocabularyData.map(item => item.category).filter(Boolean))];
    const levels = [...new Set(this.vocabularyData.map(item => item.level).filter(Boolean))];
    
    // Populate category filter
    this.categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      if (category === this.currentCategory) option.selected = true;
      this.categoryFilter.appendChild(option);
    });
    
    // Populate level filter
    this.levelFilter.innerHTML = '<option value="">All Levels</option>';
    levels.sort().forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = level;
      if (level === this.currentLevel) option.selected = true;
      this.levelFilter.appendChild(option);
    });
  }
  
  applyInitialFilters() {
    this.filteredData = this.vocabularyData.filter(item => {
      const categoryMatch = !this.currentCategory || item.category === this.currentCategory;
      const levelMatch = !this.currentLevel || item.level === this.currentLevel;
      return categoryMatch && levelMatch;
    });
    
    if (this.limit > 0) {
      this.filteredData = this.filteredData.slice(0, this.limit);
    }
  }
  
  handleFilterChange() {
    this.currentCategory = this.categoryFilter?.value || '';
    this.currentLevel = this.levelFilter?.value || '';
    
    this.applyInitialFilters();
    this.renderCards();
    
    // Announce filter change to screen readers
    this.announceToScreenReader(`Filtered to ${this.filteredData.length} cards`);
  }
  
  shuffleCards() {
    this.filteredData = this.shuffleArray([...this.filteredData]);
    this.renderCards();
    this.announceToScreenReader('Cards shuffled');
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  renderCards() {
    if (!this.grid) return;

    // Show loading while rendering on mobile (can be slow with many cards)
    const isMobile = window.innerWidth < 768;
    if (isMobile && this.filteredData.length > 20) {
      this.showLoading(true);
    }

    this.grid.innerHTML = '';
    this.updateCardCount();

    if (this.filteredData.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    this.filteredData.forEach((item, index) => {
      const card = this.createCard(item, index);
      fragment.appendChild(card);
    });

    this.grid.appendChild(fragment);

    // Set focus to first card for keyboard navigation
    const firstCard = this.grid.querySelector('.vocab-card');
    if (firstCard) {
      firstCard.setAttribute('tabindex', '0');
    }

    // Hide loading after render completes (for filter/shuffle operations)
    if (isMobile && this.filteredData.length > 20) {
      requestAnimationFrame(() => {
        this.showLoading(false);
      });
    }
  }
  
  createCard(vocab) {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.id = vocab.id || '';
    card.dataset.level = vocab.level || '';
    card.dataset.category = vocab.category || '';
    card.dataset.word = vocab.word || '';
    card.dataset.translation = vocab.translation || '';
    
    // Get display text based on language direction
    const { frontText, backText } = this.getCardText(vocab);
    card.setAttribute('aria-label', `Vocabulary card: ${frontText} - ${backText}`);
    
    const cardInner = document.createElement('div');
    cardInner.className = 'vocab-card-inner';
    
    // Front side
    const cardFront = document.createElement('div');
    cardFront.className = 'vocab-card-front';
    cardFront.innerHTML = `
      <div class="vocab-word">${this.escapeHtml(frontText)}</div>
      <div class="vocab-category">${this.escapeHtml(vocab.category)}</div>
      <div class="vocab-level">${this.escapeHtml(vocab.level)}</div>
    `;
    
    // Back side
    const cardBack = document.createElement('div');
    cardBack.className = 'vocab-card-back';
    cardBack.innerHTML = `
      <div class="vocab-translation">${this.escapeHtml(backText)}</div>
      ${this.buildNotesHtml(vocab)}
    `;
    
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    
    if (this.interactive) {
      card.addEventListener('click', () => this.flipCard(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.flipCard(card);
        }
      });
    }
    return card;
  }

  buildNotesHtml(vocab) {
    const notesBgToDe = vocab.notes_bg_to_de ? this.escapeHtml(vocab.notes_bg_to_de) : '';
    const notesDeToBg = vocab.notes_de_to_bg ? this.escapeHtml(vocab.notes_de_to_bg) : '';
    const generalNotes = vocab.notes ? this.escapeHtml(vocab.notes) : '';

    if (notesBgToDe || notesDeToBg) {
      const showBg = this.languageDirection === 'bg-de';
      const showDe = this.languageDirection === 'de-bg';
      return `
        <div class="vocab-notes">
          ${notesBgToDe ? `<div class="vocab-note-direction" data-direction="bg-de" style="${showBg ? '' : 'display:none;'}">${notesBgToDe}</div>` : ''}
          ${notesDeToBg ? `<div class="vocab-note-direction" data-direction="de-bg" style="${showDe ? '' : 'display:none;'}">${notesDeToBg}</div>` : ''}
        </div>
      `;
    }

    if (generalNotes) {
      return `<div class="vocab-notes">${generalNotes}</div>`;
    }

    return '';
  }
  
  getCardText(vocab) {
    // Return appropriate text based on language direction
    if (this.languageDirection === 'bg-de') {
      // Bulgarian to German: show Bulgarian word, translate to German
      return {
        frontText: vocab.word || '',
        backText: vocab.translation || ''
      };
    }

    // German to Bulgarian: show German word, translate to Bulgarian
    return {
      frontText: vocab.translation || '',
      backText: vocab.word || ''
    };
  }
  
  flipCard(card) {
    const isFlipped = card.classList.contains('flipped');
    
    if (isFlipped) {
      card.classList.remove('flipped');
      card.setAttribute('aria-label', card.getAttribute('aria-label').replace('showing translation', 'showing word'));
    } else {
      card.classList.add('flipped');
      card.setAttribute('aria-label', card.getAttribute('aria-label').replace('showing word', 'showing translation'));
    }
    
    // Update flip button text
    const flipBtn = card.querySelector('.vocab-flip-btn');
    if (flipBtn) {
      flipBtn.setAttribute('aria-label', isFlipped ? 'Flip card to see translation' : 'Flip card to see word');
    }
  }
  
  renderEmptyState() {
    this.grid.innerHTML = `
      <div class="vocab-empty-state" role="status">
        <div class="empty-icon">📚</div>
        <h3>No vocabulary cards found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    `;
  }
  
  updateCardCount() {
    if (this.cardCount) {
      const count = this.filteredData.length;
      this.cardCount.textContent = `${count} card${count !== 1 ? 's' : ''}`;
    }
  }
  
  handleKeyboard(e) {
    const focusedCard = document.activeElement;
    if (!focusedCard?.classList.contains('vocab-card')) return;
    
    const cards = Array.from(this.grid.querySelectorAll('.vocab-card'));
    const currentIndex = cards.indexOf(focusedCard);
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, cards.length - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = cards.length - 1;
        break;
      default:
        return;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      focusedCard.setAttribute('tabindex', '-1');
      cards[nextIndex].setAttribute('tabindex', '0');
      cards[nextIndex].focus();
    }
  }
  
  showLoading(show) {
    if (this.loading) {
      this.loading.setAttribute('aria-hidden', !show);
      this.loading.style.display = show ? 'flex' : 'none';
    }
  }
  
  showError(show, message = '') {
    if (this.error) {
      this.error.setAttribute('aria-hidden', !show);
      this.error.style.display = show ? 'block' : 'none';
      
      if (show && message) {
        const errorText = this.error.querySelector('p');
        if (errorText) {
          errorText.textContent = `Failed to load vocabulary: ${message}`;
        }
      }
    }
  }
  
  generateWordId(word) {
    return word.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  handleLanguageDirectionChange(e) {
    this.languageDirection = e.detail.direction;
    this.renderCards(); // Re-render cards with new direction
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Cleanup method to remove event listeners
   * Prevents event listener accumulation (P1 bug fix)
   */
  cleanup() {
    // Remove language direction listener
    if (this.languageListenerAttached) {
      document.removeEventListener('language-direction-changed', this.onLanguageDirectionChanged);
      this.languageListenerAttached = false;
    }
  }
}

// Export for use in other modules
export default VocabCards;
