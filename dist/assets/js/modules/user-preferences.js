// User Preferences Service
// Manages user settings, language direction, and learning preferences
/**
 * User Preferences Service class
 * Manages user settings, language direction, and learning preferences
 * @class UserPreferences
 * @example
 * ```typescript
 * const prefs = new UserPreferences();
 * prefs.set('nativeLanguage', 'bg');
 * const lang = prefs.get('nativeLanguage');
 * ```
 */
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
    /**
     * Core preference management
     */
    /**
     * Load preferences from localStorage
     * @private
     * @returns {UserPreferencesData} Merged preferences with defaults
     * @description Loads user preferences from localStorage and merges with defaults
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.defaults, ...parsed };
            }
        }
        catch (error) {
            console.warn('[UserPreferences] Failed to load preferences:', error);
        }
        return { ...this.defaults };
    }
    /**
     * Save preferences to localStorage
     * @returns True if successful, false otherwise
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
            this.notifyListeners('save', { key: 'save', value: this.preferences });
            return true;
        }
        catch (error) {
            console.error('[UserPreferences] Failed to save preferences:', error);
            return false;
        }
    }
    /**
     * Get preference value(s)
     * @param key - Preference key to get, or undefined to get all preferences
     * @returns Preference value(s)
     */
    get(key) {
        return key ? this.preferences[key] : { ...this.preferences };
    }
    /**
     * Set preference value(s)
     * @param key - Preference key or object for bulk update
     * @param value - Preference value (only used for single key updates)
     */
    set(key, value) {
        if (typeof key === 'object') {
            // Bulk update
            Object.assign(this.preferences, key);
        }
        else {
            // Single key update
            this.preferences[key] = value;
        }
        this.save();
        this.applyPreferences();
        this.notifyListeners('change', { key, value });
    }
    /**
     * Reset preferences to defaults
     * @param keys - Specific keys to reset, or null to reset all
     */
    reset(keys) {
        if (keys) {
            // Reset specific keys
            const keysArray = Array.isArray(keys) ? keys : [keys];
            for (const key of keysArray) {
                if (key in this.defaults) {
                    this.preferences[key] = this.defaults[key];
                }
            }
        }
        else {
            // Reset all preferences
            this.preferences = { ...this.defaults };
        }
        this.save();
        this.applyPreferences();
        this.notifyListeners('reset', { key: keys });
    }
    /**
     * Language and direction management
     */
    /**
     * Set native language
     * @param language - Native language ('bg' or 'de')
     */
    setNativeLanguage(language) {
        if (!['bg', 'de'].includes(language)) {
            throw new Error('Invalid native language. Must be "bg" or "de"');
        }
        this.set('nativeLanguage', language);
        // Auto-adjust learning direction based on native language
        const newDirection = language === 'bg' ? 'bg-de' : 'de-bg';
        this.set('learningDirection', newDirection);
    }
    /**
     * Set learning direction
     * @param direction - Learning direction ('bg-de' or 'de-bg')
     */
    setLearningDirection(direction) {
        if (!['bg-de', 'de-bg'].includes(direction)) {
            throw new Error('Invalid learning direction. Must be "bg-de" or "de-bg"');
        }
        this.set('learningDirection', direction);
    }
    /**
     * Toggle learning direction
     * @returns New learning direction
     */
    toggleLearningDirection() {
        const current = this.get('learningDirection');
        const newDirection = current === 'bg-de' ? 'de-bg' : 'bg-de';
        this.setLearningDirection(newDirection);
        return newDirection;
    }
    /**
     * Get source language from learning direction
     * @returns Source language code
     */
    getSourceLanguage() {
        return this.get('learningDirection')?.split('-')[0] || '';
    }
    /**
     * Get target language from learning direction
     * @returns Target language code
     */
    getTargetLanguage() {
        return this.get('learningDirection')?.split('-')[1] || '';
    }
    /**
     * UI preferences
     */
    /**
     * Set theme
     * @param theme - Theme ('light', 'dark', or 'auto')
     */
    setTheme(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            throw new Error('Invalid theme. Must be "light", "dark", or "auto"');
        }
        this.set('theme', theme);
    }
    /**
     * Set font size
     * @param size - Font size ('small', 'medium', or 'large')
     */
    setFontSize(size) {
        if (!['small', 'medium', 'large'].includes(size)) {
            throw new Error('Invalid font size. Must be "small", "medium", or "large"');
        }
        this.set('fontSize', size);
    }
    /**
     * Learning preferences
     */
    /**
     * Set session length
     * @param length - Session length (5-100 items)
     */
    setSessionLength(length) {
        const numLength = Number.parseInt(length.toString());
        if (isNaN(numLength) || numLength < 5 || numLength > 100) {
            throw new Error('Session length must be between 5 and 100');
        }
        this.set('sessionLength', numLength);
    }
    /**
     * Set difficulty level
     * @param level - Difficulty level ('easy', 'medium', 'hard', or 'adaptive')
     */
    setDifficultyLevel(level) {
        if (!['easy', 'medium', 'hard', 'adaptive'].includes(level)) {
            throw new Error('Invalid difficulty level');
        }
        this.set('difficultyLevel', level);
    }
    /**
     * Category and level preferences
     */
    /**
     * Add preferred category
     * @param category - Category to add
     */
    addPreferredCategory(category) {
        const categories = this.get('preferredCategories');
        if (!categories.includes(category)) {
            categories.push(category);
            this.set('preferredCategories', categories);
        }
    }
    /**
     * Remove preferred category
     * @param category - Category to remove
     */
    removePreferredCategory(category) {
        const categories = this.get('preferredCategories');
        const index = categories.indexOf(category);
        if (index > -1) {
            categories.splice(index, 1);
            this.set('preferredCategories', categories);
        }
    }
    /**
     * Set preferred levels
     * @param levels - Array of levels to set
     */
    setPreferredLevels(levels) {
        const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
        const filteredLevels = levels.filter(level => validLevels.has(level));
        this.set('preferredLevels', filteredLevels);
    }
    /**
     * Spaced repetition customization
     */
    /**
     * Set spaced repetition settings
     * @param settings - Settings object with optional properties
     */
    setSpacedRepetitionSettings(settings) {
        const { easyMultiplier, hardMultiplier, intervalCap } = settings;
        const updates = {};
        if (easyMultiplier !== undefined) {
            if (easyMultiplier < 1.1 || easyMultiplier > 3) {
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
    /**
     * Apply preferences to DOM and environment
     */
    /**
     * Apply all preferences to DOM
     */
    applyPreferences() {
        this.applyTheme();
        this.applyFontSize();
        this.applyAccessibility();
        this.applyAnimations();
    }
    /**
     * Apply theme to DOM
     */
    applyTheme() {
        const theme = this.get('theme');
        const root = document.documentElement;
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.dataset.theme = prefersDark ? 'dark' : 'light';
        }
        else {
            root.dataset.theme = theme;
        }
    }
    /**
     * Apply font size to DOM
     */
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
    /**
     * Apply accessibility settings to DOM
     */
    applyAccessibility() {
        const root = document.documentElement;
        if (this.get('highContrast')) {
            root.classList.add('high-contrast');
        }
        else {
            root.classList.remove('high-contrast');
        }
        if (this.get('reducedMotion')) {
            root.classList.add('reduced-motion');
        }
        else {
            root.classList.remove('reduced-motion');
        }
        if (this.get('screenReaderOptimized')) {
            root.classList.add('screen-reader-optimized');
        }
        else {
            root.classList.remove('screen-reader-optimized');
        }
    }
    /**
     * Apply animation settings to DOM
     */
    applyAnimations() {
        const animationsEnabled = this.get('animationsEnabled');
        const root = document.documentElement;
        if (animationsEnabled) {
            root.classList.remove('no-animations');
        }
        else {
            root.classList.add('no-animations');
        }
    }
    /**
     * Event system
     */
    /**
     * Add event listener
     * @param callback - Event callback function
     * @returns Function to remove the listener
     */
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    /**
     * Remove event listener
     * @param callback - Event callback function to remove
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }
    /**
     * Notify all listeners of an event
     * @param event - Event name
     * @param data - Event data
     */
    notifyListeners(event, data) {
        for (const callback of this.listeners) {
            try {
                callback(event, data);
            }
            catch (error) {
                console.error('[UserPreferences] Listener error:', error);
            }
        }
    }
    /**
     * Import/Export
     */
    /**
     * Export preferences
     * @returns Exported preferences object
     */
    export() {
        return {
            preferences: this.preferences,
            version: '1.0.0',
            exportedAt: new Date().toISOString()
        };
    }
    /**
     * Import preferences
     * @param data - Exported preferences data
     * @returns True if successful, false otherwise
     */
    import(data) {
        try {
            if (data.version && data.preferences) {
                // Validate imported preferences
                const validPrefs = {};
                for (const key of Object.keys(this.defaults)) {
                    if (key in data.preferences) {
                        validPrefs[key] = data.preferences[key];
                    }
                }
                this.preferences = { ...this.defaults, ...validPrefs };
                this.save();
                this.applyPreferences();
                this.notifyListeners('import', { key: 'import', value: validPrefs });
                return true;
            }
        }
        catch (error) {
            console.error('[UserPreferences] Import failed:', error);
        }
        return false;
    }
    /**
     * Utility methods
     */
    /**
     * Check if dark mode is active
     * @returns True if dark mode is active
     */
    isDarkMode() {
        const theme = this.get('theme');
        if (theme === 'dark') {
            return true;
        }
        if (theme === 'light') {
            return false;
        }
        // Auto mode - check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    /**
     * Get effective difficulty level
     * @returns Effective difficulty level
     */
    getEffectiveDifficulty() {
        const level = this.get('difficultyLevel');
        if (level === 'adaptive') {
            // Could implement adaptive logic based on user performance
            return 'medium';
        }
        return level;
    }
    /**
     * Check if a feature should be shown
     * @param feature - Feature to check
     * @returns True if feature should be shown
     */
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
        return prefKey ? Boolean(this.get(prefKey)) : true;
    }
    /**
     * Debug and development
     */
    /**
     * Get debug information
     * @returns Debug information object
     */
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
//# sourceMappingURL=user-preferences.js.map