/**
 * Language Toggle System
 * Switches between German→Bulgarian and Bulgarian→German learning directions
 * Provides bidirectional vocabulary and grammar explanations
 */

export class LanguageToggle {
  constructor() {
    this.currentDirection = this.loadDirection();
    this.storageKey = 'bgde:language-direction';
    
    this.init();
  }
  
  init() {
    this.createToggleButton();
    this.applyDirection();
    this.bindEvents();
  }
  
  createToggleButton() {
    // Find existing theme toggle or create new container
    let container = document.querySelector('.theme-toggle-container');
    
    if (!container) {
      container = document.createElement('div');
      container.className = 'language-controls';
      
      // Try to add to header or create floating control
      const header = document.querySelector('header') || document.querySelector('.header');
      if (header) {
        header.appendChild(container);
      } else {
        container.className += ' floating-controls';
        document.body.appendChild(container);
      }
    }
    
    // Create language toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'language-toggle-btn';
    toggleButton.setAttribute('aria-label', 'Switch learning direction');
    toggleButton.setAttribute('title', 'Switch between German→Bulgarian and Bulgarian→German');
    
    this.updateToggleButton(toggleButton);
    
    container.appendChild(toggleButton);
    this.toggleButton = toggleButton;
  }
  
  updateToggleButton(button) {
    const directions = {
      'de-bg': {
        icon: '🇩🇪→🇧🇬',
        text: 'DE→BG',
        title: 'Learning Bulgarian (from German perspective)'
      },
      'bg-de': {
        icon: '🇧🇬→🇩🇪', 
        text: 'BG→DE',
        title: 'Learning German (from Bulgarian perspective)'
      }
    };
    
    const current = directions[this.currentDirection];
    button.innerHTML = `
      <span class="toggle-icon">${current.icon}</span>
      <span class="toggle-text">${current.text}</span>
    `;
    button.setAttribute('title', current.title);
  }
  
  bindEvents() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleDirection());
    }
    
    // Listen for custom events from other components
    document.addEventListener('language-direction-changed', (e) => {
      this.handleDirectionChange(e.detail);
    });
  }
  
  toggleDirection() {
    this.currentDirection = this.currentDirection === 'de-bg' ? 'bg-de' : 'de-bg';
    this.saveDirection();
    this.applyDirection();
    this.updateToggleButton(this.toggleButton);
    
    // Notify other components
    this.broadcastDirectionChange();
    
    // Announce to screen readers
    this.announceDirectionChange();
  }
  
  applyDirection() {
    // Add direction class to body for CSS styling
    document.body.classList.remove('lang-de-bg', 'lang-bg-de');
    document.body.classList.add(`lang-${this.currentDirection}`);
    
    // Set language attributes for better accessibility
    const isGermanBase = this.currentDirection === 'de-bg';
    document.documentElement.setAttribute('lang', isGermanBase ? 'de' : 'bg');
    
    // Update meta description based on direction
    this.updateMetaDescription();
  }
  
  updateMetaDescription() {
    const descriptions = {
      'de-bg': 'Bulgarisch lernen für Deutsche - Interaktive Vokabeln und Grammatik mit Spaced Repetition',
      'bg-de': 'Учене на немски за българи - Интерактивни думи и граматика със система за повторение'
    };
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    
    metaDesc.setAttribute('content', descriptions[this.currentDirection]);
  }
  
  broadcastDirectionChange() {
    const event = new CustomEvent('language-direction-changed', {
      detail: {
        direction: this.currentDirection,
        isGermanBase: this.currentDirection === 'de-bg',
        isBulgarianBase: this.currentDirection === 'bg-de'
      }
    });
    
    document.dispatchEvent(event);
  }
  
  handleDirectionChange(detail) {
    // Handle direction changes from other components
    if (detail.direction !== this.currentDirection) {
      this.currentDirection = detail.direction;
      this.saveDirection();
      this.applyDirection();
      this.updateToggleButton(this.toggleButton);
    }
  }
  
  announceDirectionChange() {
    const announcements = {
      'de-bg': 'Switched to German to Bulgarian learning mode',
      'bg-de': 'Switched to Bulgarian to German learning mode'
    };
    
    this.announceToScreenReader(announcements[this.currentDirection]);
  }
  
  getDirection() {
    return this.currentDirection;
  }
  
  isGermanBase() {
    return this.currentDirection === 'de-bg';
  }
  
  isBulgarianBase() {
    return this.currentDirection === 'bg-de';
  }
  
  getSourceLanguage() {
    return this.currentDirection === 'de-bg' ? 'de' : 'bg';
  }
  
  getTargetLanguage() {
    return this.currentDirection === 'de-bg' ? 'bg' : 'de';
  }
  
  getLanguageLabels() {
    if (this.currentDirection === 'de-bg') {
      return {
        source: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        target: { code: 'bg', name: 'Български', flag: '🇧🇬' },
        sourceField: 'translation', // German is in translation field
        targetField: 'word'         // Bulgarian is in word field
      };
    } else {
      return {
        source: { code: 'bg', name: 'Български', flag: '🇧🇬' },
        target: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        sourceField: 'word',        // Bulgarian is in word field  
        targetField: 'translation'  // German is in translation field
      };
    }
  }
  
  getUITexts() {
    const texts = {
      'de-bg': {
        // German UI for learning Bulgarian
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
      'bg-de': {
        // Bulgarian UI for learning German
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
    
    return texts[this.currentDirection];
  }
  
  loadDirection() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved && ['de-bg', 'bg-de'].includes(saved) ? saved : 'de-bg';
    } catch (error) {
      console.warn('Failed to load language direction:', error);
      return 'de-bg';
    }
  }
  
  saveDirection() {
    try {
      localStorage.setItem(this.storageKey, this.currentDirection);
    } catch (error) {
      console.warn('Failed to save language direction:', error);
    }
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
}

// Create singleton instance
export const languageToggle = new LanguageToggle();

// Export class for testing
export default LanguageToggle;
