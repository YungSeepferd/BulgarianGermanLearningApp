/**
 * @file vocab-cards.ts
 * @description Interactive vocabulary card display system
 * @status ACTIVE
 * @dependencies language-toggle.ts
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

// Remove unused import

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  level?: string;
  category?: string;
  difficulty?: number;
  frequency?: number;
  notes?: string;
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
  etymology?: string;
  cultural_note?: string;
  linguistic_note?: string;
  audio_url?: string;
  examples?: Array<{
    sentence: string;
    translation: string;
    context: string;
  }>;
  // Direction-specific fields for other properties
  etymology_bg_to_de?: string;
  etymology_de_to_bg?: string;
  cultural_note_bg_to_de?: string;
  cultural_note_de_to_bg?: string;
  linguistic_note_bg_to_de?: string;
  linguistic_note_de_to_bg?: string;
}

interface VocabularyAPI {
  loadAll(): Promise<VocabularyItem[]>;
  loadFiltered(filters: { level?: string; category?: string; search?: string }): Promise<VocabularyItem[]>;
}

// Remove unused interface

interface CardText {
  frontText: string;
  backText: string;
}

export class VocabCards {
  private container: HTMLElement;
  private vocabularyData: VocabularyItem[] = [];
  private filteredData: VocabularyItem[] = [];
  private currentCategory: string;
  private currentLevel: string;
  private limit: number;
  private interactive: boolean;
  private languageDirection: string;

  // DOM elements
  private grid: HTMLElement | null;
  private loading: HTMLElement | null;
  private error: HTMLElement | null;
  private cardCount: HTMLElement | null;
  private categoryFilter: HTMLSelectElement | null;
  private levelFilter: HTMLSelectElement | null;
  private shuffleBtn: HTMLElement | null;
  private retryBtn: HTMLElement | null;

  // Bound event handlers for cleanup
  private onLanguageDirectionChanged: (e: CustomEvent) => void;
  private languageListenerAttached: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.vocabularyData = [];
    this.filteredData = [];
    this.currentCategory = container.dataset.category || '';
    this.currentLevel = container.dataset.level || '';
    this.limit = Number.parseInt(container.dataset.limit || '0');
    this.interactive = container.dataset.interactive === 'true';
    this.languageDirection = 'bg-de'; // Default direction

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
  
  async init(): Promise<void> {
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
  
  private bindEvents(): void {
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
    document.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeyboardNavigation(e));
  }
  
  private async loadVocabulary(): Promise<void> {
    try {
      this.showLoading(true);

      const inlineData = this.readInlineVocabulary();

      if (inlineData) {
        this.vocabularyData = inlineData;
        this.populateFilters();
        this.showError(false);
        return;
      }

      // Try to load from modular vocabulary API first
      try {
        const { vocabularyAPI } = await import('./modules/vocabulary-api.js') as { vocabularyAPI: VocabularyAPI };
        const allEntries = await vocabularyAPI.loadAll();
        
        if (Array.isArray(allEntries) && allEntries.length > 0) {
          this.vocabularyData = allEntries;
          this.populateFilters();
          this.showError(false);
          console.log(`[VocabCards] Loaded ${allEntries.length} entries via modular API`);
          return;
        }
      } catch (apiError) {
        console.warn('[VocabCards] Modular API not available, falling back to fetch:', apiError);
      }

      // Fallback to fetching from Hugo's data directory
      let response = await fetch('/data/vocabulary.json');

      // Fallback to static directory if data directory fails
      if (!response.ok) {
        response = await fetch('/static/data/vocabulary.json');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.vocabularyData = await response.json() as VocabularyItem[];

      if (!Array.isArray(this.vocabularyData) || this.vocabularyData.length === 0) {
        throw new Error('Invalid or empty vocabulary data');
      }

      this.populateFilters();
      this.showError(false);

    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      this.showError(true, (error as Error).message);
      this.showLoading(false);

      // Fallback to empty array to prevent crashes
      this.vocabularyData = [];
    }
    // Note: Loading indicator is now hidden in init() after renderCards() completes
  }

  private readInlineVocabulary(): VocabularyItem[] | null {
    const inlineNode = this.container.querySelector('[data-vocab-inline]');

    if (!inlineNode) {
      return null;
    }

    try {
      const inlineJson = inlineNode.textContent?.trim() || '';

      if (!inlineJson) {
        return null;
      }

      const parsed = JSON.parse(inlineJson) as unknown;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.warn('Inline vocabulary data is empty or invalid array.');
        return null;
      }

      return parsed as VocabularyItem[];
    } catch (error) {
      console.warn('Failed to parse inline vocabulary JSON:', error);
      return null;
    }
  }
  
  private populateFilters(): void {
    if (!this.categoryFilter || !this.levelFilter) {
      return;
    }
    
    // Get unique categories and levels
    const categories = [...new Set(this.vocabularyData.map(item => item.category).filter(Boolean))] as string[];
    const levels = [...new Set(this.vocabularyData.map(item => item.level).filter(Boolean))] as string[];
    
    // Populate category filter
    this.categoryFilter.innerHTML = '<option value="">All Categories</option>';
    for (const category of categories.sort()) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      if (category === this.currentCategory) {
        option.selected = true;
      }
      this.categoryFilter.append(option);
    }
    
    // Populate level filter
    this.levelFilter.innerHTML = '<option value="">All Levels</option>';
    for (const level of levels.sort()) {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = level;
      if (level === this.currentLevel) {
        option.selected = true;
      }
      this.levelFilter.append(option);
    }
  }
  
  private applyInitialFilters(): void {
    this.filteredData = this.vocabularyData.filter(item => {
      const categoryMatch = !this.currentCategory || item.category === this.currentCategory;
      const levelMatch = !this.currentLevel || item.level === this.currentLevel;
      return categoryMatch && levelMatch;
    });
    
    if (this.limit > 0) {
      this.filteredData = this.filteredData.slice(0, this.limit);
    }
  }
  
  private handleFilterChange(): void {
    this.currentCategory = this.categoryFilter?.value || '';
    this.currentLevel = this.levelFilter?.value || '';
    
    this.applyInitialFilters();
    this.renderCards();
    
    // Announce filter change to screen readers
    this.announceToScreenReader(`Filtered to ${this.filteredData.length} cards`);
  }
  
  private shuffleCards(): void {
    this.filteredData = this.shuffleArray([...this.filteredData]);
    this.renderCards();
    this.announceToScreenReader('Cards shuffled');
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]!;
      result[i] = result[j]!;
      result[j] = temp;
    }
    return result;
  }
  
  private renderCards(): void {
    if (!this.grid) {
      return;
    }

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

    for (const item of this.filteredData) {
      const card = this.createCard(item);
      fragment.append(card);
    }

    this.grid.append(fragment);

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
  
  private createCard(vocab: VocabularyItem): HTMLElement {
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
      <div class="vocab-category">${this.escapeHtml(vocab.category || '')}</div>
      <div class="vocab-level">${this.escapeHtml(vocab.level || '')}</div>
    `;
    
    // Back side
    const cardBack = document.createElement('div');
    cardBack.className = 'vocab-card-back';
    cardBack.innerHTML = `
      <div class="vocab-translation">${this.escapeHtml(backText)}</div>
      ${this.buildNotesHtml(vocab)}
    `;
    
    cardInner.append(cardFront);
    cardInner.append(cardBack);
    card.append(cardInner);
    
    if (this.interactive) {
      card.addEventListener('click', () => this.flipCard(card));
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.flipCard(card);
        }
      });
    }
    return card;
  }

  private buildNotesHtml(vocab: VocabularyItem): string {
    const isBgToDe = this.languageDirection === 'bg-de';

    // Get direction-specific content
    const notes = this.getDirectionSpecificContent(vocab, 'notes');
    const etymology = this.getDirectionSpecificContent(vocab, 'etymology');
    const culturalNote = this.getDirectionSpecificContent(vocab, 'cultural_note');
    const linguisticNote = this.getDirectionSpecificContent(vocab, 'linguistic_note');

    let html = '';

    if (notes) {
      html += `<div class="vocab-notes">${this.escapeHtml(notes)}</div>`;
    }

    if (etymology) {
      html += `<div class="vocab-etymology"><strong>${isBgToDe ? 'Произход:' : 'Etymologie:'}</strong> ${this.escapeHtml(etymology)}</div>`;
    }

    if (culturalNote) {
      html += `<div class="vocab-cultural-note"><strong>${isBgToDe ? 'Културна бележка:' : 'Kulturelle Anmerkung:'}</strong> ${this.escapeHtml(culturalNote)}</div>`;
    }

    if (linguisticNote) {
      html += `<div class="vocab-linguistic-note"><strong>${isBgToDe ? 'Лингвистична бележка:' : 'Linguistische Anmerkung:'}</strong> ${this.escapeHtml(linguisticNote)}</div>`;
    }

    return html;
  }

  /**
   * Get language-direction-specific content from vocabulary item
   * @param vocab - Vocabulary item
   * @param fieldName - Base field name (e.g., 'notes', 'etymology')
   * @returns Content in appropriate language
   */
  private getDirectionSpecificContent(vocab: VocabularyItem, fieldName: string): string {
    const isBgToDe = this.languageDirection === 'bg-de';

    // Try direction-specific field first (e.g., notes_bg_to_de, notes_de_to_bg)
    const directionField = isBgToDe
      ? `${fieldName}_bg_to_de`
      : `${fieldName}_de_to_bg`;

    // Use type-safe property access
    const directionValue = vocab[directionField as keyof VocabularyItem];
    if (directionValue) {
      return directionValue as string;
    }

    // Try parsing bilingual field (Bulgarian\nGerman format)
    const generalField = vocab[fieldName as keyof VocabularyItem];
    if (generalField && typeof generalField === 'string') {
      // Check if field contains bilingual content separated by newline
      const parts = generalField.split('\n').filter(p => p.trim());

      // If we have exactly 2 parts, assume first is Bulgarian, second is German
      if (parts.length === 2) {
        return isBgToDe ? (parts[0] || '') : (parts[1] || '');
      }

      // Otherwise return as-is (fallback to English or single-language content)
      return generalField;
    }

    return '';
  }
  
  private getCardText(vocab: VocabularyItem): CardText {
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
  
  private flipCard(card: HTMLElement): void {
    const isFlipped = card.classList.contains('flipped');
    
    if (isFlipped) {
      card.classList.remove('flipped');
      const currentLabel = card.getAttribute('aria-label') || '';
      card.setAttribute('aria-label', currentLabel.replace('showing translation', 'showing word'));
    } else {
      card.classList.add('flipped');
      const currentLabel = card.getAttribute('aria-label') || '';
      card.setAttribute('aria-label', currentLabel.replace('showing word', 'showing translation'));
    }
    
    // Update flip button text
    const flipBtn = card.querySelector('.vocab-flip-btn');
    if (flipBtn) {
      flipBtn.setAttribute('aria-label', isFlipped ? 'Flip card to see translation' : 'Flip card to see word');
    }
  }
  
  private renderEmptyState(): void {
    if (!this.grid) return;
    
    this.grid.innerHTML = `
      <div class="vocab-empty-state" role="status">
        <div class="empty-icon">📚</div>
        <h3>No vocabulary cards found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    `;
  }
  
  private updateCardCount(): void {
    if (this.cardCount) {
      const count = this.filteredData.length;
      this.cardCount.textContent = `${count} card${count === 1 ? '' : 's'}`;
    }
  }
  
  private handleKeyboardNavigation(e: KeyboardEvent): void {
    const focusedCard = document.activeElement as HTMLElement;
    if (!focusedCard || !focusedCard.classList?.contains?.('vocab-card')) {
      return;
    }
    
    const cards = [...(this.grid?.querySelectorAll?.('.vocab-card') || [])] as HTMLElement[];
    const currentIndex = cards.indexOf(focusedCard);
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown': {
      nextIndex = Math.min(currentIndex + 1, cards.length - 1);
      break;
    }
    case 'ArrowLeft':
    case 'ArrowUp': {
      nextIndex = Math.max(currentIndex - 1, 0);
      break;
    }
    case 'Home': {
      nextIndex = 0;
      break;
    }
    case 'End': {
      nextIndex = cards.length - 1;
      break;
    }
    default: {
      return;
    }
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      focusedCard.setAttribute('tabindex', '-1');
      const nextCard = cards[nextIndex];
      if (nextCard) {
        nextCard.setAttribute('tabindex', '0');
        nextCard.focus();
      }
    }
  }
  
  private showLoading(show: boolean): void {
    if (this.loading) {
      this.loading.setAttribute('aria-hidden', (!show).toString());
      this.loading.style.display = show ? 'flex' : 'none';
    }
  }
  
  private showError(show: boolean, message: string = ''): void {
    if (this.error) {
      this.error.setAttribute('aria-hidden', (!show).toString());
      this.error.style.display = show ? 'block' : 'none';
      
      if (show && message) {
        const errorText = this.error.querySelector('p');
        if (errorText) {
          errorText.textContent = `Failed to load vocabulary: ${message}`;
        }
      }
    }
  }
  
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  private handleLanguageDirectionChange(e: CustomEvent): void {
    this.languageDirection = e.detail.direction;
    this.renderCards(); // Re-render cards with new direction
  }

  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.append(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  /**
   * Cleanup method to remove event listeners
   * Prevents event listener accumulation (P1 bug fix)
   */
  cleanup(): void {
    // Remove language direction listener
    if (this.languageListenerAttached) {
      document.removeEventListener('language-direction-changed', this.onLanguageDirectionChanged);
      this.languageListenerAttached = false;
    }
  }
}

// Export for use in other modules
export default VocabCards;