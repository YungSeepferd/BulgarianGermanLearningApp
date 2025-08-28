// User Preferences Service
// Manages user settings, language direction, and learning preferences

class UserPreferences {
  constructor() {
    this.storageKey = 'bgde:user-preferences';
    this.defaults = {
      // Language and direction settings
      nativeLanguage: 'de', // 'bg' or 'de'
      learningDirection: 'bg-de', // 'bg-de' or 'de-bg'
      
      // UI preferences
      theme: 'auto', // 'light', 'dark', 'auto'
      fontSize: 'medium', // 'small', 'medium', 'large'
      animationsEnabled: true,
      soundEnabled: true,
      
      // Learning preferences
      sessionLength: 20, // number of items per session
      difficultyLevel: 'adaptive', // 'easy', 'medium', 'hard', 'adaptive'
      showCulturalContext: true,
      showEtymology: true,
      showExamples: true,
      
      // Spaced repetition settings
      easyMultiplier: 1.3,
      hardMultiplier: 0.8,
      intervalCap: 365, // max days between reviews
      
      // Practice settings
      practiceMode: 'mixed', // 'flashcards', 'typing', 'multiple-choice', 'mixed'
      showHints: true,
      autoPlayAudio: false,
      
      // Categories and levels
      preferredCategories: [],
      preferredLevels: ['A1', 'A2'],
      
      // Privacy and data
      analyticsEnabled: true,
      syncEnabled: false,
      
      // Accessibility
      highContrast: false,
      reducedMotion: false,
      screenReaderOptimized: false,
      
      // Advanced settings
      debugMode: false,
      betaFeatures: false
    };
    
    this.preferences = this.load();
    this.listeners = new Set();
    
    // Apply preferences on initialization
    this.applyPreferences();
  }

  // Core preference management
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaults, ...parsed };
      }
    } catch (error) {
      console.warn('[UserPreferences] Failed to load preferences:', error);
    }
    
    return { ...this.defaults };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      this.notifyListeners('save', this.preferences);
      return true;
    } catch (error) {
      console.error('[UserPreferences] Failed to save preferences:', error);
      return false;
    }
  }

  get(key) {
    return key ? this.preferences[key] : { ...this.preferences };
  }

  set(key, value) {
    if (typeof key === 'object') {
      // Bulk update
      Object.assign(this.preferences, key);
    } else {
      // Single key update
      this.preferences[key] = value;
    }
    
    this.save();
    this.applyPreferences();
    this.notifyListeners('change', { key, value });
  }

  reset(keys = null) {
    if (keys) {
      // Reset specific keys
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach(key => {
        if (key in this.defaults) {
          this.preferences[key] = this.defaults[key];
        }
      });
    } else {
      // Reset all preferences
      this.preferences = { ...this.defaults };
    }
    
    this.save();
    this.applyPreferences();
    this.notifyListeners('reset', keys);
  }

  // Language and direction management
  setNativeLanguage(language) {
    if (!['bg', 'de'].includes(language)) {
      throw new Error('Invalid native language. Must be "bg" or "de"');
    }
    
    this.set('nativeLanguage', language);
    
    // Auto-adjust learning direction based on native language
    const newDirection = language === 'bg' ? 'bg-de' : 'de-bg';
    this.set('learningDirection', newDirection);
  }

  setLearningDirection(direction) {
    if (!['bg-de', 'de-bg'].includes(direction)) {
      throw new Error('Invalid learning direction. Must be "bg-de" or "de-bg"');
    }
    
    this.set('learningDirection', direction);
  }

  toggleLearningDirection() {
    const current = this.get('learningDirection');
    const newDirection = current === 'bg-de' ? 'de-bg' : 'bg-de';
    this.setLearningDirection(newDirection);
    return newDirection;
  }

  getSourceLanguage() {
    return this.get('learningDirection').split('-')[0];
  }

  getTargetLanguage() {
    return this.get('learningDirection').split('-')[1];
  }

  // UI preferences
  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      throw new Error('Invalid theme. Must be "light", "dark", or "auto"');
    }
    
    this.set('theme', theme);
  }

  setFontSize(size) {
    if (!['small', 'medium', 'large'].includes(size)) {
      throw new Error('Invalid font size. Must be "small", "medium", or "large"');
    }
    
    this.set('fontSize', size);
  }

  // Learning preferences
  setSessionLength(length) {
    const numLength = parseInt(length);
    if (isNaN(numLength) || numLength < 5 || numLength > 100) {
      throw new Error('Session length must be between 5 and 100');
    }
    
    this.set('sessionLength', numLength);
  }

  setDifficultyLevel(level) {
    if (!['easy', 'medium', 'hard', 'adaptive'].includes(level)) {
      throw new Error('Invalid difficulty level');
    }
    
    this.set('difficultyLevel', level);
  }

  // Category and level preferences
  addPreferredCategory(category) {
    const categories = this.get('preferredCategories');
    if (!categories.includes(category)) {
      categories.push(category);
      this.set('preferredCategories', categories);
    }
  }

  removePreferredCategory(category) {
    const categories = this.get('preferredCategories');
    const index = categories.indexOf(category);
    if (index > -1) {
      categories.splice(index, 1);
      this.set('preferredCategories', categories);
    }
  }

  setPreferredLevels(levels) {
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const filteredLevels = levels.filter(level => validLevels.includes(level));
    this.set('preferredLevels', filteredLevels);
  }

  // Spaced repetition customization
  setSpacedRepetitionSettings(settings) {
    const { easyMultiplier, hardMultiplier, intervalCap } = settings;
    
    const updates = {};
    
    if (easyMultiplier !== undefined) {
      if (easyMultiplier < 1.1 || easyMultiplier > 3.0) {
        throw new Error('Easy multiplier must be between 1.1 and 3.0');
      }
      updates.easyMultiplier = easyMultiplier;
    }
    
    if (hardMultiplier !== undefined) {
      if (hardMultiplier < 0.3 || hardMultiplier > 0.9) {
        throw new Error('Hard multiplier must be between 0.3 and 0.9');
      }
      updates.hardMultiplier = hardMultiplier;
    }
    
    if (intervalCap !== undefined) {
      if (intervalCap < 30 || intervalCap > 1000) {
        throw new Error('Interval cap must be between 30 and 1000 days');
      }
      updates.intervalCap = intervalCap;
    }
    
    this.set(updates);
  }

  // Apply preferences to DOM and environment
  applyPreferences() {
    this.applyTheme();
    this.applyFontSize();
    this.applyAccessibility();
    this.applyAnimations();
  }

  applyTheme() {
    const theme = this.get('theme');
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  applyFontSize() {
    const fontSize = this.get('fontSize');
    const root = document.documentElement;
    
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    
    root.style.setProperty('--base-font-size', sizeMap[fontSize]);
  }

  applyAccessibility() {
    const root = document.documentElement;
    
    if (this.get('highContrast')) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (this.get('reducedMotion')) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (this.get('screenReaderOptimized')) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }

  applyAnimations() {
    const animationsEnabled = this.get('animationsEnabled');
    const root = document.documentElement;
    
    if (!animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }

  // Event system
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('[UserPreferences] Listener error:', error);
      }
    });
  }

  // Import/Export
  export() {
    return {
      preferences: this.preferences,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
  }

  import(data) {
    try {
      if (data.version && data.preferences) {
        // Validate imported preferences
        const validPrefs = {};
        Object.keys(this.defaults).forEach(key => {
          if (key in data.preferences) {
            validPrefs[key] = data.preferences[key];
          }
        });
        
        this.preferences = { ...this.defaults, ...validPrefs };
        this.save();
        this.applyPreferences();
        this.notifyListeners('import', validPrefs);
        
        return true;
      }
    } catch (error) {
      console.error('[UserPreferences] Import failed:', error);
    }
    
    return false;
  }

  // Utility methods
  isDarkMode() {
    const theme = this.get('theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // Auto mode - check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  getEffectiveDifficulty() {
    const level = this.get('difficultyLevel');
    if (level === 'adaptive') {
      // Could implement adaptive logic based on user performance
      return 'medium';
    }
    return level;
  }

  shouldShowFeature(feature) {
    const featureMap = {
      culturalContext: 'showCulturalContext',
      etymology: 'showEtymology',
      examples: 'showExamples',
      hints: 'showHints',
      audio: 'soundEnabled',
      animations: 'animationsEnabled'
    };
    
    const prefKey = featureMap[feature];
    return prefKey ? this.get(prefKey) : true;
  }

  // Debug and development
  getDebugInfo() {
    return {
      preferences: this.preferences,
      defaults: this.defaults,
      storageKey: this.storageKey,
      listenerCount: this.listeners.size,
      storageSize: JSON.stringify(this.preferences).length
    };
  }
}

// Create and export singleton instance
const userPreferences = new UserPreferences();

export default userPreferences;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.userPreferences = userPreferences;
}
