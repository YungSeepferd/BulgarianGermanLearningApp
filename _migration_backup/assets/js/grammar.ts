// Grammar management and filtering
interface GrammarItem {
  title: string;
  description: string;
  level: string;
  examples?: string[];
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
}

interface GrammarAppOptions {
  container?: string;
  data?: GrammarItem[];
}

interface GrammarFilters {
  level: string;
  search: string;
}

interface LanguageToggle {
  getDirection(): string;
}

// Extend Window interface - this extends the global Window interface
export {};

declare global {
  interface Window {
    languageToggle?: LanguageToggle;
    GrammarApp?: typeof GrammarApp;
  }
}

class GrammarApp {
  private container: string;
  private languageDirection: string;
  private data: GrammarItem[];
  private useServerRendering: boolean;
  private filteredData: GrammarItem[];
  private filters: GrammarFilters;
  // private items: Element[]; // Removed unused property

  constructor(options: GrammarAppOptions) {
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

  init(): void {
    this.bindEvents();
    if (this.useServerRendering) {
      this.applyFiltersToDOM();
    }
    this.updateStats();
    this.updateDirectionNotes();
  }

  private getServerRenderedItems(): Element[] {
    const container = document.querySelector(this.container);
    if (!container) {
      return [];
    }
    return [...container.querySelectorAll('.grammar-item')];
  }

  private bindEvents(): void {
    // Filter controls
    const levelFilter = document.querySelector('#grammar-level-filter');
    const searchInput = document.querySelector('#grammar-search');
    const clearFilters = document.querySelector('#clear-grammar-filters');

    if (levelFilter) {
      levelFilter.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.filters.level = target.value;
        this.applyFilters();
      });
    }

    if (searchInput) {
      let searchTimeout: number;
      searchInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
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

    document.addEventListener('language-direction-changed', (e: CustomEvent) => {
      this.languageDirection = e?.detail?.direction || 'bg-de';
      this.updateDirectionNotes();
    });

    // Show more examples buttons
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('show-more-examples')) {
        this.toggleExamples(target);
      }
    });

    // Exercise buttons
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('start-exercise-btn')) {
        const grammarTitle = target.dataset.grammarTitle || '';
        this.startGrammarExercise(grammarTitle);
      }
    });

    // Bookmark buttons
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('bookmark-btn')) {
        const grammarTitle = target.dataset.grammarTitle || '';
        this.toggleBookmark(grammarTitle, target);
      }
    });
  }

  private applyFilters(): void {
    if (this.useServerRendering) {
      this.applyFiltersToDOM();
    } else {
      this.applyFiltersToData();
    }
    this.updateStats();
  }

  private applyFiltersToDOM(): void {
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

      (item as HTMLElement).style.display = shouldShow ? '' : 'none';
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
    } else {
      container?.classList.remove('no-results-state');
      noResults?.classList.add('hidden');
    }
  }

  private applyFiltersToData(): void {
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

  private render(): void {
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
      (container as HTMLElement).style.display = 'none';
      noResults?.classList.remove('hidden');
      return;
    }

    (container as HTMLElement).style.display = 'block';
    noResults?.classList.add('hidden');

    container.innerHTML = this.filteredData.map(item => this.renderGrammarItem(item)).join('');

    this.updateDirectionNotes();
  }

  private renderGrammarItem(item: GrammarItem): string {
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
                            ${item.examples.slice(0, 3).map(example => 
    `<li class="example-item">${example}</li>`
  ).join('')}
                            ${item.examples.length > 3 ? `
                                <div class="hidden-examples hidden">
                                    ${item.examples.slice(3).map(example => 
    `<li class="example-item">${example}</li>`
  ).join('')}
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

  private buildNotesHtml(item: GrammarItem): string {
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

  private toggleExamples(button: HTMLElement): void {
    const targetId = button.dataset.target || '';
    const examplesList = document.querySelector(`#${targetId}`);
    const hiddenExamples = examplesList?.querySelector('.hidden-examples');
        
    if (hiddenExamples) {
      const isHidden = hiddenExamples.classList.contains('hidden');
      hiddenExamples.classList.toggle('hidden');
      button.textContent = isHidden ? 'Show Fewer Examples' : `Show More Examples (${hiddenExamples.children.length} more)`;
    }
  }

  private startGrammarExercise(grammarTitle: string): void {
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

  private toggleBookmark(grammarTitle: string, button: HTMLElement): void {
    const bookmarks = this.getBookmarks();
    const isBookmarked = bookmarks.includes(grammarTitle);
        
    if (isBookmarked) {
      const index = bookmarks.indexOf(grammarTitle);
      bookmarks.splice(index, 1);
      button.classList.remove('bookmarked');
      button.textContent = '☆';
      button.title = 'Bookmark this rule';
    } else {
      bookmarks.push(grammarTitle);
      button.classList.add('bookmarked');
      button.textContent = '⭐';
      button.title = 'Remove bookmark';
    }
        
    localStorage.setItem('grammar-bookmarks', JSON.stringify(bookmarks));
  }

  private isBookmarked(grammarTitle: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.includes(grammarTitle);
  }

  private getBookmarks(): string[] {
    const stored = localStorage.getItem('grammar-bookmarks');
    return stored ? JSON.parse(stored) : [];
  }

  private updateStats(): void {
    const totalCount = document.querySelector('#grammar-total');
    const showingCount = document.querySelector('#grammar-showing');

    if (this.useServerRendering) {
      const items = this.getServerRenderedItems();
      const visibleItems = items.filter(item => (item as HTMLElement).style.display !== 'none');

      if (totalCount) {
        totalCount.textContent = items.length.toString();
      }
      if (showingCount) {
        showingCount.textContent = visibleItems.length.toString();
      }
    } else {
      if (totalCount) {
        totalCount.textContent = this.data.length.toString();
      }
      if (showingCount) {
        showingCount.textContent = this.filteredData.length.toString();
      }
    }
  }

  private updateDirectionNotes(): void {
    const containers = document.querySelectorAll('.grammar-notes');
    for (const container of containers) {
      const notes = [...container.querySelectorAll('.grammar-note-direction')];
      let shown = false;
      for (const note of notes) {
        if (!note.dataset.direction) {
          continue;
        }
        const shouldShow = note.dataset.direction === this.languageDirection;
        (note as HTMLElement).style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          shown = true;
        }
      }

      if (!shown) {
        const fallback = notes[0];
        if (fallback) {
          (fallback as HTMLElement).style.display = '';
        }
      }
    }
  }

  private clearAllFilters(): void {
    this.filters = { level: '', search: '' };
        
    // Reset form controls
    const levelFilter = document.querySelector('#grammar-level-filter');
    const searchInput = document.querySelector('#grammar-search');

    if (levelFilter) {
      (levelFilter as HTMLSelectElement).value = '';
    }
    if (searchInput) {
      (searchInput as HTMLInputElement).value = '';
    }

    this.applyFilters();
  }

  private getLanguageDirection(): string {
    try {
      if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
        return window.languageToggle.getDirection();
      }
      const stored = localStorage.getItem('bgde:language-direction') || localStorage.getItem('bgde:learning_direction');
      return stored === 'de-bg' ? 'de-bg' : 'bg-de';
    } catch {
      return 'bg-de';
    }
  }

  private markdownToHtml(text: string): string {
    // Simple markdown conversion for basic formatting
    return text
      .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replaceAll(/\*(.*?)\*/g, '<em>$1</em>')
      .replaceAll(/`(.*?)`/g, '<code>$1</code>')
      .replaceAll('\n', '<br>');
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replaceAll(/[^\s\w-]/g, '')
      .replaceAll(/[\s_-]+/g, '-')
      .replaceAll(/^-+|-+$/g, '');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in templates
(window as { GrammarApp?: typeof GrammarApp }).GrammarApp = GrammarApp;