/**
 * @file language-toggle.ts
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

interface LanguageToggleConfirmation {
  new(): LanguageToggleConfirmation;
  show(currentDirection: Direction, nextDirection: Direction, callback: (confirmedDirection: Direction) => void): void;
}

const DIRECTION = {
  BG_TO_DE: 'bg-de',
  DE_TO_BG: 'de-bg'
} as const;

const DEFAULT_DIRECTION = DIRECTION.DE_TO_BG;
const VALID_DIRECTIONS = new Set([DIRECTION.BG_TO_DE, DIRECTION.DE_TO_BG]);

type Direction = typeof DIRECTION[keyof typeof DIRECTION];

interface DirectionConfig {
  text: string;
  subtitle: string;
  title: string;
  ariaLabel: string;
  leftFlag: string;
  rightFlag: string;
}

interface LanguageLabels {
  source: { code: string; name: string; flag: string };
  target: { code: string; name: string; flag: string };
  sourceField: string;
  targetField: string;
}

interface GradeInfo {
  label: string;
  desc: string;
}

interface UITexts {
  loading: string;
  error: string;
  retry: string;
  noCards: string;
  categories: string;
  levels: string;
  shuffle: string;
  flip: string;
  grade: string;
  gradeHelp: string;
  grades: Record<number, GradeInfo>;
  sessionComplete: string;
  newSession: string;
  backToVocab: string;
}

interface SetDirectionOptions {
  silent?: boolean;
  announce?: boolean;
}

class LanguageToggle {
  private storageKey = 'bgde:language-direction';
  private legacyStorageKey = 'bgde:learning_direction';
  private currentDirection: Direction;
  private toggleButton: HTMLButtonElement | null = null;

  constructor() {
    this.currentDirection = this.loadDirection();
    this.init();
  }

  init(): void {
    this.createToggleButton();
    this.applyDirection();
    this.bindEvents();
  }

  private createToggleButton(): void {
    let container = document.querySelector('[data-language-toggle]') as HTMLElement;

    if (container) {
      container.classList.add('language-controls');
      container.innerHTML = '';
    } else {
      container = document.querySelector('.theme-toggle-container') as HTMLElement;

      if (!container) {
        container = document.createElement('div');
        container.className = 'language-controls';

        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
          header.append(container);
        } else {
          container.classList.add('floating-controls');
          document.body.append(container);
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

    container.append(toggleButton);
    container.append(description);
    this.toggleButton = toggleButton;
  }

  private updateToggleButton(button: HTMLButtonElement | null): void {
    if (!button) {
      return;
    }

    const directions: Record<Direction, DirectionConfig> = {
      [DIRECTION.DE_TO_BG]: {
        text: 'DE → BG',
        subtitle: 'Deutsch zu Bulgarisch',
        title: 'Learning Bulgarian (from German perspective)',
        ariaLabel: 'Switch learning direction. Currently German to Bulgarian. Click to change to Bulgarian to German.',
        leftFlag: 'de',
        rightFlag: 'bg'
      },
      [DIRECTION.BG_TO_DE]: {
        text: 'BG → DE',
        subtitle: 'Български към Немски',
        title: 'Learning German (from Bulgarian perspective)',
        ariaLabel: 'Switch learning direction. Currently Bulgarian to German. Click to change to German to Bulgarian.',
        leftFlag: 'bg',
        rightFlag: 'de'
      }
    };

    const current = directions[this.currentDirection] || directions[DEFAULT_DIRECTION];
    const partnerDirection = this.currentDirection === DIRECTION.DE_TO_BG
      ? directions[DIRECTION.BG_TO_DE]
      : directions[DIRECTION.DE_TO_BG];

    button.innerHTML = `
      <span class="toggle-flag flag-${current.leftFlag}" aria-hidden="true"></span>
      <span class="toggle-arrow" aria-hidden="true">
        <span class="arrow-icon"></span>
      </span>
      <span class="toggle-flag flag-${current.rightFlag}" aria-hidden="true"></span>
      <span class="toggle-text" aria-hidden="true">
        <span class="toggle-direction">${current.text}</span>
        <span class="toggle-subtitle">${current.subtitle}</span>
      </span>
      <span class="sr-only">${current.ariaLabel}</span>
    `;

    button.setAttribute('title', current.title);
    button.setAttribute('aria-label', current.ariaLabel);
    button.dataset.direction = this.currentDirection;
    if (partnerDirection) {
      button.dataset.nextDirection = partnerDirection.leftFlag + '-' + partnerDirection.rightFlag;
    }
  }

  private bindEvents(): void {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleDirection());
      this.toggleButton.addEventListener('animationend', () => {
        this.toggleButton?.classList.remove('is-animating');
      });
    }

    const handleExternalChange = (event: CustomEvent) => {
      const detail = event?.detail;
      if (!detail || detail.source === 'language-toggle') {
        return;
      }

      this.setDirection(detail.direction, { silent: true });
    };

    document.addEventListener('language-direction-changed', handleExternalChange as EventListener);
    document.addEventListener('languageDirectionChanged', handleExternalChange as EventListener);
    window.addEventListener('learning-direction-changed', handleExternalChange as EventListener);

    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.storageKey) {
        this.setDirection(event.newValue as Direction, { silent: true });
      } else if (event.key === this.legacyStorageKey) {
        const migrated = this.migrateLegacyDirection(event.newValue || undefined);
        if (migrated) {
          this.setDirection(migrated, { silent: true });
        }
      }
    });
  }

  toggleDirection(): void {
    const nextDirection: Direction =
      this.currentDirection === DIRECTION.DE_TO_BG ? DIRECTION.BG_TO_DE : DIRECTION.DE_TO_BG;

    // Show confirmation modal if available
    const LanguageToggleConfirmation = (window as { LanguageToggleConfirmation?: LanguageToggleConfirmation }).LanguageToggleConfirmation;
    if (LanguageToggleConfirmation === undefined) {
      // Fallback: direct change without confirmation
      this.setDirection(nextDirection, { announce: true });
    } else {
      const confirmation = new LanguageToggleConfirmation();
      confirmation.show(
        this.currentDirection,
        nextDirection,
        (confirmedDirection: Direction) => {
          // User confirmed, proceed with change
          this.setDirection(confirmedDirection, { announce: true });
        }
      );
    }
  }

  setDirection(direction: Direction, { silent = false, announce = false }: SetDirectionOptions = {}): void {
    const normalized = this.normalizeDirection(direction) || DEFAULT_DIRECTION;
    const previousDirection = this.currentDirection;
    const changed = normalized !== this.currentDirection;

    this.currentDirection = normalized;
    this.saveDirection();
    this.applyDirection();
    this.updateToggleButton(this.toggleButton);
    if (this.toggleButton) {
      this.toggleButton.dataset.prevDirection = previousDirection || '';
      if (changed) {
        // Trigger morph animation
        void this.toggleButton.offsetWidth;
        this.toggleButton.classList.add('is-animating');
      }
    }

    if (changed && !silent) {
      this.broadcastDirectionChange();
      if (announce) {
        this.announceDirectionChange();
      }
    }
  }

  private applyDirection(): void {
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

  private updateMetaDescription(): void {
    const descriptions: Record<Direction, string> = {
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
      document.head.append(metaDesc);
    }

    metaDesc.setAttribute('content', content);
  }

  private broadcastDirectionChange(): void {
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

  private announceDirectionChange(): void {
    const announcements: Record<Direction, string> = {
      [DIRECTION.DE_TO_BG]: 'Switched to German to Bulgarian learning mode. You will now see Bulgarian words to translate to German.',
      [DIRECTION.BG_TO_DE]: 'Switched to Bulgarian to German learning mode. You will now see German words to translate to Bulgarian.'
    };

    const message = announcements[this.currentDirection] || announcements[DEFAULT_DIRECTION];
    this.announceToScreenReader(message);
    this.showToastNotification(message);
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  isGermanBase(): boolean {
    return this.currentDirection === DIRECTION.DE_TO_BG;
  }

  isBulgarianBase(): boolean {
    return this.currentDirection === DIRECTION.BG_TO_DE;
  }

  getSourceLanguage(): string {
    return this.isGermanBase() ? 'de' : 'bg';
  }

  getTargetLanguage(): string {
    return this.isGermanBase() ? 'bg' : 'de';
  }

  getLanguageLabels(): LanguageLabels {
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

  getUITexts(): UITexts {
    const texts: Record<Direction, UITexts> = {
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

  private loadDirection(): Direction {
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

  private migrateLegacyDirection(explicitValue?: string): Direction | null {
    try {
      const legacyValue =
        explicitValue === undefined ? localStorage.getItem(this.legacyStorageKey) : explicitValue;

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

  private normalizeDirection(value: string | null): Direction | null {
    if (!value) {
      return null;
    }

    const normalized = value.toString().toLowerCase();

    if (normalized === 'bg-de' || normalized === 'bg_to_de') {
      return DIRECTION.BG_TO_DE;
    }

    if (normalized === 'de-bg' || normalized === 'de_to_bg') {
      return DIRECTION.DE_TO_BG;
    }

    return VALID_DIRECTIONS.has(normalized as Direction) ? normalized as Direction : null;
  }

  private saveDirection(): void {
    try {
      localStorage.setItem(this.storageKey, this.currentDirection);
    } catch (error) {
      console.warn('Failed to save language direction:', error);
    }
  }

  private announceToScreenReader(message: string): void {
    // Use global announcement region if available
    const globalAnnouncer = document.querySelector('#sr-announcements');
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

      document.body.append(announcement);

      setTimeout(() => {
        announcement.remove();
      }, 1000);
    }
  }
  
  private showToastNotification(message: string): void {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('#toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('aria-live', 'polite');
      toastContainer.setAttribute('aria-atomic', 'true');
      document.body.append(toastContainer);
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
    
    toastContainer.append(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toast.remove();
        }
      }, 300);
    }, 4000);
  }
}

let languageToggle: LanguageToggle | { 
  currentDirection: Direction;
  getDirection: () => Direction;
  isGermanBase: () => boolean;
  isBulgarianBase: () => boolean;
  getSourceLanguage: () => string;
  getTargetLanguage: () => string;
  getLanguageLabels: () => LanguageLabels;
  getUITexts: () => UITexts;
  toggleDirection: () => void;
  setDirection: (direction: Direction, options?: SetDirectionOptions) => void;
  applyDirection: () => void;
  updateToggleButton: (button: HTMLButtonElement | null) => void;
  announceToScreenReader: (message: string) => void;
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const existingLanguageToggle = (window as unknown as { languageToggle?: LanguageToggle }).languageToggle;
  languageToggle = existingLanguageToggle instanceof LanguageToggle
    ? existingLanguageToggle
    : new LanguageToggle();

  (window as unknown as { languageToggle?: LanguageToggle }).languageToggle = languageToggle;
  (window as unknown as { LanguageToggle?: typeof LanguageToggle }).LanguageToggle = LanguageToggle;
} else {
  const noop = () => {};
  languageToggle = {
    currentDirection: DEFAULT_DIRECTION,
    getDirection: () => DEFAULT_DIRECTION,
    isGermanBase: () => DEFAULT_DIRECTION === 'de-bg',
    isBulgarianBase: () => false,
    getSourceLanguage: () => (DEFAULT_DIRECTION === 'de-bg' ? 'de' : 'bg'),
    getTargetLanguage: () => (DEFAULT_DIRECTION === 'de-bg' ? 'bg' : 'de'),
    getLanguageLabels: () => ({
      source: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      target: { code: 'bg', name: 'Български', flag: '🇧🇬' },
      sourceField: 'translation',
      targetField: 'word'
    }),
    getUITexts: () => ({
      loading: 'Loading...',
      error: 'Unable to load data',
      retry: 'Retry',
      noCards: 'No cards found',
      categories: 'Categories',
      levels: 'Levels',
      shuffle: 'Shuffle',
      flip: 'Flip',
      grade: 'Grade your knowledge',
      gradeHelp: 'Rate how well you knew this word',
      grades: {
        0: { label: 'No idea', desc: 'Completely unknown' },
        1: { label: 'Wrong', desc: 'Wrong but known' },
        2: { label: 'Close', desc: 'Wrong but close' },
        3: { label: 'Hard', desc: 'Correct with effort' },
        4: { label: 'Good', desc: 'Correct after thinking' },
        5: { label: 'Easy', desc: 'Perfect memory' }
      },
      sessionComplete: 'Session complete!',
      newSession: 'New session',
      backToVocab: 'Back to vocabulary'
    }),
    toggleDirection: noop,
    setDirection: noop,
    applyDirection: noop,
    updateToggleButton: noop,
    announceToScreenReader: noop
  };
}

export { languageToggle, LanguageToggle, DIRECTION };
export default languageToggle;