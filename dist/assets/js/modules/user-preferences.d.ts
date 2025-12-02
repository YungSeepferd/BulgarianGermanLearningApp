/**
 * Interface for user preference settings
 * @interface UserPreferencesData
 */
export interface UserPreferencesData {
    nativeLanguage: 'bg' | 'de';
    learningDirection: 'bg-de' | 'de-bg';
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    animationsEnabled: boolean;
    soundEnabled: boolean;
    sessionLength: number;
    difficultyLevel: 'easy' | 'medium' | 'hard' | 'adaptive';
    showCulturalContext: boolean;
    showEtymology: boolean;
    showExamples: boolean;
    easyMultiplier: number;
    hardMultiplier: number;
    intervalCap: number;
    practiceMode: 'flashcards' | 'typing' | 'multiple-choice' | 'mixed';
    showHints: boolean;
    autoPlayAudio: boolean;
    preferredCategories: string[];
    preferredLevels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[];
    analyticsEnabled: boolean;
    syncEnabled: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
    debugMode: boolean;
    betaFeatures: boolean;
}
/**
 * Interface for preference event data
 * @interface PreferenceEventData
 * @property {string | Record<string, any>} key - Preference key or object for bulk updates
 * @property {any} value - Preference value (only used for single key updates)
 */
export interface PreferenceEventData {
    key?: string | Record<string, any>;
    value?: any;
}
/**
 * Interface for preference event callback
 * @callback PreferenceEventListener
 * @param {string} event - Event name ('save', 'change', 'reset', 'import')
 * @param {PreferenceEventData} data - Event data
 * @returns {void}
 */
export type PreferenceEventListener = (event: string, data: PreferenceEventData) => void;
/**
 * Interface for exported preferences
 * @interface ExportedPreferences
 * @property {UserPreferencesData} preferences - The preference data
 * @property {string} version - Export format version
 * @property {string} exportedAt - ISO timestamp of export
 */
export interface ExportedPreferences {
    preferences: UserPreferencesData;
    version: string;
    exportedAt: string;
}
/**
 * Interface for spaced repetition settings
 * @interface SpacedRepetitionSettings
 * @property {number} [easyMultiplier] - Multiplier for easy reviews (1.1-3.0)
 * @property {number} [hardMultiplier] - Multiplier for hard reviews (0.3-0.9)
 * @property {number} [intervalCap] - Maximum days between reviews (30-1000)
 */
export interface SpacedRepetitionSettings {
    easyMultiplier?: number;
    hardMultiplier?: number;
    intervalCap?: number;
}
/**
 * Interface for debug information
 * @interface DebugInfo
 * @property {UserPreferencesData} preferences - Current preferences
 * @property {UserPreferencesData} defaults - Default preference values
 * @property {string} storageKey - localStorage key used
 * @property {number} listenerCount - Number of active event listeners
 * @property {number} storageSize - Size of stored data in bytes
 */
export interface DebugInfo {
    preferences: UserPreferencesData;
    defaults: UserPreferencesData;
    storageKey: string;
    listenerCount: number;
    storageSize: number;
}
/**
 * Interface for feature mapping
 * @typedef {('culturalContext'|'etymology'|'examples'|'hints'|'audio'|'animations')} FeatureType
 * Available feature types that can be toggled in preferences
 */
export type FeatureType = 'culturalContext' | 'etymology' | 'examples' | 'hints' | 'audio' | 'animations';
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
declare class UserPreferences {
    private storageKey;
    private defaults;
    private preferences;
    private listeners;
    constructor();
    /**
     * Core preference management
     */
    /**
     * Load preferences from localStorage
     * @private
     * @returns {UserPreferencesData} Merged preferences with defaults
     * @description Loads user preferences from localStorage and merges with defaults
     */
    private load;
    /**
     * Save preferences to localStorage
     * @returns True if successful, false otherwise
     */
    save(): boolean;
    /**
     * Get preference value(s)
     * @param key - Preference key to get, or undefined to get all preferences
     * @returns Preference value(s)
     */
    get<K extends keyof UserPreferencesData>(key?: K): K extends undefined ? UserPreferencesData : UserPreferencesData[K];
    /**
     * Set preference value(s)
     * @param key - Preference key or object for bulk update
     * @param value - Preference value (only used for single key updates)
     */
    set(key: keyof UserPreferencesData | Partial<UserPreferencesData>, value?: UserPreferencesData[keyof UserPreferencesData]): void;
    /**
     * Reset preferences to defaults
     * @param keys - Specific keys to reset, or null to reset all
     */
    reset(keys?: keyof UserPreferencesData | (keyof UserPreferencesData)[]): void;
    /**
     * Language and direction management
     */
    /**
     * Set native language
     * @param language - Native language ('bg' or 'de')
     */
    setNativeLanguage(language: 'bg' | 'de'): void;
    /**
     * Set learning direction
     * @param direction - Learning direction ('bg-de' or 'de-bg')
     */
    setLearningDirection(direction: 'bg-de' | 'de-bg'): void;
    /**
     * Toggle learning direction
     * @returns New learning direction
     */
    toggleLearningDirection(): 'bg-de' | 'de-bg';
    /**
     * Get source language from learning direction
     * @returns Source language code
     */
    getSourceLanguage(): string;
    /**
     * Get target language from learning direction
     * @returns Target language code
     */
    getTargetLanguage(): string;
    /**
     * UI preferences
     */
    /**
     * Set theme
     * @param theme - Theme ('light', 'dark', or 'auto')
     */
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    /**
     * Set font size
     * @param size - Font size ('small', 'medium', or 'large')
     */
    setFontSize(size: 'small' | 'medium' | 'large'): void;
    /**
     * Learning preferences
     */
    /**
     * Set session length
     * @param length - Session length (5-100 items)
     */
    setSessionLength(length: number): void;
    /**
     * Set difficulty level
     * @param level - Difficulty level ('easy', 'medium', 'hard', or 'adaptive')
     */
    setDifficultyLevel(level: 'easy' | 'medium' | 'hard' | 'adaptive'): void;
    /**
     * Category and level preferences
     */
    /**
     * Add preferred category
     * @param category - Category to add
     */
    addPreferredCategory(category: string): void;
    /**
     * Remove preferred category
     * @param category - Category to remove
     */
    removePreferredCategory(category: string): void;
    /**
     * Set preferred levels
     * @param levels - Array of levels to set
     */
    setPreferredLevels(levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[]): void;
    /**
     * Spaced repetition customization
     */
    /**
     * Set spaced repetition settings
     * @param settings - Settings object with optional properties
     */
    setSpacedRepetitionSettings(settings: SpacedRepetitionSettings): void;
    /**
     * Apply preferences to DOM and environment
     */
    /**
     * Apply all preferences to DOM
     */
    private applyPreferences;
    /**
     * Apply theme to DOM
     */
    private applyTheme;
    /**
     * Apply font size to DOM
     */
    private applyFontSize;
    /**
     * Apply accessibility settings to DOM
     */
    private applyAccessibility;
    /**
     * Apply animation settings to DOM
     */
    private applyAnimations;
    /**
     * Event system
     */
    /**
     * Add event listener
     * @param callback - Event callback function
     * @returns Function to remove the listener
     */
    addListener(callback: PreferenceEventListener): () => void;
    /**
     * Remove event listener
     * @param callback - Event callback function to remove
     */
    removeListener(callback: PreferenceEventListener): void;
    /**
     * Notify all listeners of an event
     * @param event - Event name
     * @param data - Event data
     */
    private notifyListeners;
    /**
     * Import/Export
     */
    /**
     * Export preferences
     * @returns Exported preferences object
     */
    export(): ExportedPreferences;
    /**
     * Import preferences
     * @param data - Exported preferences data
     * @returns True if successful, false otherwise
     */
    import(data: ExportedPreferences): boolean;
    /**
     * Utility methods
     */
    /**
     * Check if dark mode is active
     * @returns True if dark mode is active
     */
    isDarkMode(): boolean;
    /**
     * Get effective difficulty level
     * @returns Effective difficulty level
     */
    getEffectiveDifficulty(): 'easy' | 'medium' | 'hard';
    /**
     * Check if a feature should be shown
     * @param feature - Feature to check
     * @returns True if feature should be shown
     */
    shouldShowFeature(feature: FeatureType): boolean;
    /**
     * Debug and development
     */
    /**
     * Get debug information
     * @returns Debug information object
     */
    getDebugInfo(): DebugInfo;
}
declare const userPreferences: UserPreferences;
export default userPreferences;
//# sourceMappingURL=user-preferences.d.ts.map