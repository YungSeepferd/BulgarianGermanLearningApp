/**
 * @file language-toggle.js
 * @description Bidirectional language learning direction controller
 * @status ACTIVE
 * @dependencies None (pure implementation)
 * @used_by flashcards.js, vocab-cards.js, enhanced-*.js modules, layouts/partials/language-toggle.html
 * @features
 *   - Toggle between BG→DE and DE→BG learning directions
 *   - localStorage persistence (bgde:language-direction)
 *   - Event-based notifications for direction changes
 *   - Cultural context adaptation based on native language
 *   - Difficulty multipliers for SM-2 (BG→DE: 1.2x, DE→BG: 1.1x)
 * @see docs/BIDIRECTIONAL_IMPLEMENTATION_PLAN.md for design
 * @version 2.0.0
 * @updated October 2025
 */

const DIRECTION = {
  BG_TO_DE: 'bg-de',
  DE_TO_BG: 'de-bg'
};

const DEFAULT_DIRECTION = DIRECTION.DE_TO_BG;
const VALID_DIRECTIONS = new Set([DIRECTION.BG_TO_DE, DIRECTION.DE_TO_BG]);

class LanguageToggle {
  constructor() {
    this.storageKey = 'bgde:language-direction';
    this.legacyStorageKey = 'bgde:learning_direction';
    this.currentDirection = this.loadDirection();
    this.toggleButton = null;

    this.init();
  }

  init() {
    this.createToggleButton();
    this.applyDirection();
    this.bindEvents();
  }

  createToggleButton() {
    let container = document.querySelector('[data-language-toggle]');

    if (container) {
      container.classList.add('language-controls');
      container.innerHTML = '';
    } else {
      container = document.querySelector('.theme-toggle-container');

      if (!container) {
        container = document.createElement('div');
        container.className = 'language-controls';

        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
          header.appendChild(container);
        } else {
          container.classList.add('floating-controls');
          document.body.appendChild(container);
        }
      }
    }

    const toggleButton = document.createElement('button');
    toggleButton.className = 'language-toggle-btn';
    toggleButton.type = 'button';
    toggleButton.id = 'language-toggle-button';
    
    // Enhanced accessibility
    toggleButton.setAttribute('aria-pressed', 'false');
    toggleButton.setAttribute('aria-describedby', 'language-toggle-description');

    // Create hidden description for screen readers
    const description = document.createElement('span');
    description.id = 'language-toggle-description';
    description.className = 'sr-only';
    description.textContent = 'Click to switch learning direction between German to Bulgarian and Bulgarian to German';
    
    this.updateToggleButton(toggleButton);

    container.appendChild(toggleButton);
    container.appendChild(description);
    this.toggleButton = toggleButton;
  }

  updateToggleButton(button) {
    if (!button) return;

    const directions = {
      [DIRECTION.DE_TO_BG]: {
        icon: '🇩🇪→🇧🇬',
        text: 'DE→BG',
        title: 'Learning Bulgarian (from German perspective)',
        ariaLabel: 'Switch learning direction. Currently German to Bulgarian. Click to change to Bulgarian to German.'
      },
      [DIRECTION.BG_TO_DE]: {
        icon: '🇧🇬→🇩🇪',
        text: 'BG→DE',
        title: 'Learning German (from Bulgarian perspective)',
        ariaLabel: 'Switch learning direction. Currently Bulgarian to German. Click to change to German to Bulgarian.'
      }
    };

    const current = directions[this.currentDirection] || directions[DEFAULT_DIRECTION];
    button.innerHTML = `
      <span class="toggle-icon" aria-hidden="true">${current.icon}</span>
      <span class="toggle-text">${current.text}</span>
      <span class="sr-only">${current.ariaLabel}</span>
    `;
    button.setAttribute('title', current.title);
    button.setAttribute('aria-label', current.ariaLabel);
    button.setAttribute('data-direction', this.currentDirection);
  }

  bindEvents() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleDirection());
    }

    const handleExternalChange = (event) => {
      const detail = event?.detail;
      if (!detail || detail.source === 'language-toggle') {
        return;
      }

      this.setDirection(detail.direction, { silent: true });
    };

    document.addEventListener('language-direction-changed', handleExternalChange);
    document.addEventListener('languageDirectionChanged', handleExternalChange);
    window.addEventListener('learning-direction-changed', handleExternalChange);

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.setDirection(event.newValue, { silent: true });
      } else if (event.key === this.legacyStorageKey) {
        const migrated = this.migrateLegacyDirection(event.newValue);
        if (migrated) {
          this.setDirection(migrated, { silent: true });
        }
      }
    });
  }

  toggleDirection() {
    const nextDirection =
      this.currentDirection === DIRECTION.DE_TO_BG ? DIRECTION.BG_TO_DE : DIRECTION.DE_TO_BG;

    // Show confirmation modal if available
    if (typeof window.LanguageToggleConfirmation !== 'undefined') {
      const confirmation = new window.LanguageToggleConfirmation();
      confirmation.show(
        this.currentDirection,
        nextDirection,
        (confirmedDirection) => {
          // User confirmed, proceed with change
          this.setDirection(confirmedDirection, { announce: true });
        }
      );
    } else {
      // Fallback: direct change without confirmation
      this.setDirection(nextDirection, { announce: true });
    }
  }

  setDirection(direction, { silent = false, announce = false } = {}) {
    const normalized = this.normalizeDirection(direction) || DEFAULT_DIRECTION;
    const changed = normalized !== this.currentDirection;

    this.currentDirection = normalized;
    this.saveDirection();
    this.applyDirection();
    this.updateToggleButton(this.toggleButton);

    if (changed && !silent) {
      this.broadcastDirectionChange();
      if (announce) {
        this.announceDirectionChange();
      }
    }
  }

  applyDirection() {
    const body = document.body;
    if (body) {
      if (body.classList) {
        body.classList.remove('lang-de-bg', 'lang-bg-de');
        body.classList.add(`lang-${this.currentDirection}`);
      }

      if (body.dataset) {
        body.dataset.languageDirection = this.currentDirection;
      }
    }

    const isGermanBase = this.isGermanBase();
    document.documentElement.setAttribute('lang', isGermanBase ? 'de' : 'bg');

    this.updateMetaDescription();
  }

  updateMetaDescription() {
    const descriptions = {
      [DIRECTION.DE_TO_BG]:
        'Bulgarisch lernen für Deutsche - Interaktive Vokabeln und Grammatik mit Spaced Repetition',
      [DIRECTION.BG_TO_DE]:
        'Учене на немски за българи - Интерактивни думи и граматика със система за повторение'
    };

    const content = descriptions[this.currentDirection] || descriptions[DEFAULT_DIRECTION];

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }

    metaDesc.setAttribute('content', content);
  }

  broadcastDirectionChange() {
    const detail = {
      direction: this.currentDirection,
      isGermanBase: this.isGermanBase(),
      isBulgarianBase: this.isBulgarianBase(),
      source: 'language-toggle'
    };

    document.dispatchEvent(new CustomEvent('language-direction-changed', { detail }));
    document.dispatchEvent(new CustomEvent('languageDirectionChanged', { detail }));
    window.dispatchEvent(new CustomEvent('learning-direction-changed', { detail }));
  }

  announceDirectionChange() {
    const announcements = {
      [DIRECTION.DE_TO_BG]: 'Switched to German to Bulgarian learning mode. You will now see Bulgarian words to translate to German.',
      [DIRECTION.BG_TO_DE]: 'Switched to Bulgarian to German learning mode. You will now see German words to translate to Bulgarian.'
    };

    const message = announcements[this.currentDirection] || announcements[DEFAULT_DIRECTION];
    this.announceToScreenReader(message);
    this.showToastNotification(message);
  }

  getDirection() {
    return this.currentDirection;
  }

  isGermanBase() {
    return this.currentDirection === DIRECTION.DE_TO_BG;
  }

  isBulgarianBase() {
    return this.currentDirection === DIRECTION.BG_TO_DE;
  }

  getSourceLanguage() {
    return this.isGermanBase() ? 'de' : 'bg';
  }

  getTargetLanguage() {
    return this.isGermanBase() ? 'bg' : 'de';
  }

  getLanguageLabels() {
    if (this.isGermanBase()) {
      return {
        source: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        target: { code: 'bg', name: 'Български', flag: '🇧🇬' },
        sourceField: 'translation',
        targetField: 'word'
      };
    }

    return {
      source: { code: 'bg', name: 'Български', flag: '🇧🇬' },
      target: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      sourceField: 'word',
      targetField: 'translation'
    };
  }

  getUITexts() {
    const texts = {
      [DIRECTION.DE_TO_BG]: {
        loading: 'Lade Vokabeln...',
        error: 'Fehler beim Laden der Vokabeln',
        retry: 'Erneut versuchen',
        noCards: 'Keine Vokabelkarten gefunden',
        categories: 'Kategorien',
        levels: 'Niveaus',
        shuffle: 'Mischen',
        flip: 'Umdrehen',
        grade: 'Bewerten Sie Ihr Wissen',
        gradeHelp: 'Bewerten Sie, wie gut Sie dieses Wort kannten',
        grades: {
          0: { label: 'Keine Ahnung', desc: 'Völlig unbekannt' },
          1: { label: 'Falsch', desc: 'Falsch aber bekannt' },
          2: { label: 'Nah dran', desc: 'Falsch aber nah' },
          3: { label: 'Schwer', desc: 'Richtig mit Mühe' },
          4: { label: 'Gut', desc: 'Richtig nach Nachdenken' },
          5: { label: 'Einfach', desc: 'Perfekte Erinnerung' }
        },
        sessionComplete: 'Sitzung abgeschlossen!',
        newSession: 'Neue Sitzung',
        backToVocab: 'Zurück zu Vokabeln'
      },
      [DIRECTION.BG_TO_DE]: {
        loading: 'Зареждане на думи...',
        error: 'Грешка при зареждане на думите',
        retry: 'Опитай отново',
        noCards: 'Няма намерени карти с думи',
        categories: 'Категории',
        levels: 'Нива',
        shuffle: 'Разбъркай',
        flip: 'Обърни',
        grade: 'Оценете знанието си',
        gradeHelp: 'Оценете колко добре знаехте тази дума',
        grades: {
          0: { label: 'Без идея', desc: 'Напълно непознато' },
          1: { label: 'Грешно', desc: 'Грешно но познато' },
          2: { label: 'Близо', desc: 'Грешно но близо' },
          3: { label: 'Трудно', desc: 'Правилно с усилие' },
          4: { label: 'Добре', desc: 'Правилно след размисъл' },
          5: { label: 'Лесно', desc: 'Перфектна памет' }
        },
        sessionComplete: 'Сесията завърши!',
        newSession: 'Нова сесия',
        backToVocab: 'Обратно към думи'
      }
    };

    return texts[this.currentDirection] || texts[DEFAULT_DIRECTION];
  }

  loadDirection() {
    try {
      const migrated = this.migrateLegacyDirection();
      if (migrated) {
        return migrated;
      }

      const stored = localStorage.getItem(this.storageKey);
      return this.normalizeDirection(stored) || DEFAULT_DIRECTION;
    } catch (error) {
      console.warn('Failed to load language direction:', error);
      return DEFAULT_DIRECTION;
    }
  }

  migrateLegacyDirection(explicitValue) {
    try {
      const legacyValue =
        explicitValue !== undefined ? explicitValue : localStorage.getItem(this.legacyStorageKey);

      if (!legacyValue) {
        return null;
      }

      const normalized = this.normalizeDirection(legacyValue);
      if (normalized) {
        localStorage.setItem(this.storageKey, normalized);
      }

      localStorage.removeItem(this.legacyStorageKey);
      return normalized;
    } catch (error) {
      console.warn('Failed to migrate legacy language direction:', error);
      return null;
    }
  }

  normalizeDirection(value) {
    if (!value) return null;

    const normalized = value.toString().toLowerCase();

    if (normalized === 'bg-de' || normalized === 'bg_to_de') {
      return DIRECTION.BG_TO_DE;
    }

    if (normalized === 'de-bg' || normalized === 'de_to_bg') {
      return DIRECTION.DE_TO_BG;
    }

    return VALID_DIRECTIONS.has(normalized) ? normalized : null;
  }

  saveDirection() {
    try {
      localStorage.setItem(this.storageKey, this.currentDirection);
    } catch (error) {
      console.warn('Failed to save language direction:', error);
    }
  }

  announceToScreenReader(message) {
    // Use global announcement region if available
    const globalAnnouncer = document.getElementById('sr-announcements');
    if (globalAnnouncer) {
      globalAnnouncer.textContent = message;
      setTimeout(() => {
        globalAnnouncer.textContent = '';
      }, 3000);
    } else {
      // Fallback: create temporary element
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }
  
  showToastNotification(message) {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('aria-live', 'polite');
      toastContainer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.setAttribute('role', 'alert');
    
    const directionInfo = this.currentDirection === DIRECTION.DE_TO_BG 
      ? '🇩🇪 → 🇧🇬' 
      : '🇧🇬 → 🇩🇪';
    
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">✓</span>
      <span class="toast-message">
        <strong>${directionInfo}</strong><br>
        ${message}
      </span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }
}

let languageToggle;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  languageToggle = window.languageToggle instanceof LanguageToggle
    ? window.languageToggle
    : new LanguageToggle();

  window.languageToggle = languageToggle;
  window.LanguageToggle = LanguageToggle;
} else {
  const noop = () => {};
  languageToggle = {
    currentDirection: DEFAULT_DIRECTION,
    getDirection: () => DEFAULT_DIRECTION,
    isGermanBase: () => DEFAULT_DIRECTION === DIRECTION.DE_TO_BG,
    isBulgarianBase: () => DEFAULT_DIRECTION === DIRECTION.BG_TO_DE,
    getSourceLanguage: () => (DEFAULT_DIRECTION === DIRECTION.DE_TO_BG ? 'de' : 'bg'),
    getTargetLanguage: () => (DEFAULT_DIRECTION === DIRECTION.DE_TO_BG ? 'bg' : 'de'),
    getLanguageLabels: () => ({
      source: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      target: { code: 'bg', name: 'Български', flag: '🇧🇬' },
      sourceField: 'translation',
      targetField: 'word'
    }),
    getUITexts: () => ({
      loading: 'Loading...',
      error: 'Unable to load data',
      retry: 'Retry'
    }),
    toggleDirection: noop,
    setDirection: noop,
    applyDirection: noop,
    updateToggleButton: noop,
    announceToScreenReader: noop
  };
}

// Export for compatibility with modules that import this file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { languageToggle, LanguageToggle, DIRECTION };
  module.exports.default = languageToggle;
}
