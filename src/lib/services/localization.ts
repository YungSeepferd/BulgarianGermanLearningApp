/**
 * Localization Service for bilingual support
 *
 * This service provides translation functionality for the application,
 * supporting both German and Bulgarian languages.
 */

import { base } from '$app/paths';
import { appState } from '../state/app-state';
import { browser } from '$app/environment';

// Define the structure of our translation files
type _TranslationKey = string;
type TranslationValue = string | { [key: string]: TranslationValue };

interface _TranslationDictionary {
    [key: string]: TranslationValue;
}

// Define the structure for our translations
interface Translations {
    navigation: {
      dashboard: string;
      vocabulary: string;
      grammar: string;
      practice: string;
      learn: string;
      home: string;
      app_name: string;
      user_settings: string;
    };
    common: {
        check_answer: string;
        next_word: string;
        show_examples: string;
        hide_examples: string;
        retry: string;
        cancel: string;
        generate_lesson: string;
        correct: string;
        streak: string;
        accuracy: string;
        avg_time: string;
        favorite: string;
        favorited: string;
        practice_this: string;
        search: string;
        loading: string;
        error_loading: string;
        try_again: string;
        reload_page: string;
    };
    feedback: {
        correct: string;
        incorrect: string;
        your_answer: string;
    };
    sections: {
        learning_objectives: string;
        vocabulary: string;
        practice_exercises: string;
        recommended_for_practice: string;
    };
    directions: {
        de_to_bg: string;
        bg_to_de: string;
    };
    search: {
        no_results: string;
        no_results_hint: string;
        found_words: string;
        found_word: string;
        search_placeholder: string;
        search_vocabulary: string;
    };
    practice: {
        tandem_learning: string;
        practice_mode: string;
        search_mode: string;
        quick_practice: string;
        type_answer: string;
        response_time: string;
    };
    lesson: {
        example: string;
        examples: string;
    };
    dashboard: {
        title: string;
        total_vocabulary: string;
        favorited: string;
        recent_searches: string;
    };
    languages: {
        german: string;
        bulgarian: string;
    }
}

// Current language state
let _currentLanguage: 'de' | 'bg' = 'de';
let translations: Translations = {} as Translations;
let _isLoading = true;

// Create a reactive store for translation changes
const translationChangeListeners: (() => void)[] = [];

// Event system for language changes
type LanguageChangeListener = (language: 'de' | 'bg') => void;
const languageChangeListeners: LanguageChangeListener[] = [];

/**
 * LocalizationService class for handling translations and language changes
 */
export class LocalizationService {
    /**
     * Check if translations are currently loading
     */
    static isLoading(): boolean {
        return _isLoading;
    }

    /**
     * Notify all listeners that translations have changed
     */
    private static notifyTranslationChange(): void {
        for (const listener of translationChangeListeners) {
            try {
                listener();
            } catch (error) {
                console.error('Error in translation change listener:', error);
            }
        }
    }
    /**
     * Initialize the localization service
     */
    static async init(): Promise<void> {
        if (browser) {
            // Determine the current language based on app state
            this.updateCurrentLanguage();
            this.loadTranslations();

            // Set up language change listener
            this.onLanguageChange(() => {
                this.updateCurrentLanguage();
                this.loadTranslations();
            });
        }
    }

    /**
     * Update the current language based on app state
     */
    private static updateCurrentLanguage(): void {
        // Default to German
        _currentLanguage = 'de';

        // If language mode is BG_DE, use Bulgarian
        if (appState.languageMode === 'BG_DE') {
            _currentLanguage = 'bg';
        }
    }

    /**
     * Load translations for the current language
     */
    private static async loadTranslations(): Promise<void> {
        _isLoading = true;
        try {
            const lang = _currentLanguage;
            const response = await fetch(`${base}/translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            const loadedTranslations = await response.json();
            console.log('Loaded translations:', JSON.stringify(loadedTranslations, null, 2));
            translations = loadedTranslations;
            this.notifyTranslationChange(); // Notify that translations have changed
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to German if loading fails
            _currentLanguage = 'de';
            try {
                const response = await fetch(`${base}/translations/de.json`);
                if (response.ok) {
                    translations = await response.json();
                    this.notifyTranslationChange(); // Notify that translations have changed
                }
            } catch (fallbackError) {
                console.error('Failed to load fallback translations:', fallbackError);
            }
        } finally {
            _isLoading = false;
            this.notifyTranslationChange(); // Notify that loading state has changed
        }
    }

    /**
     * Get the current language
     */
    static getCurrentLanguage(): 'de' | 'bg' {
        return _currentLanguage;
    }

    /**
     * Get a translation for a specific key
     * @param key The translation key in dot notation (e.g., 'common.check_answer')
     * @param params Optional parameters for dynamic values
     */
    static t(key: string, params?: Record<string, string>): string {
        try {
            // If translations are still loading, return the key with loading indicator
            if (_isLoading) {
                return ''; // Return empty string during loading
            }

            // If no translations are loaded, return the key as fallback
            if (!translations || Object.keys(translations).length === 0) {
                console.warn(`Translation key '${key}' not available - no translations loaded`);
                return key;
            }

            // Split the key by dots to navigate the nested structure
            const keys = key.split('.');
            let value: TranslationValue = translations;

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    console.warn(`Translation key '${key}' not found`);
                    return key; // Return the key itself as fallback
                }
            }

            if (typeof value === 'string') {
                // Handle parameter substitution
                if (params) {
                    let result = value;
                    for (const [paramKey, paramValue] of Object.entries(params)) {
                        result = result.replace(`{${paramKey}}`, paramValue);
                    }
                    return result;
                }
                return value;
            }

            console.warn(`Translation key '${key}' is not a string`);
            return key; // Return the key itself as fallback
        } catch (error) {
            console.error(`Error getting translation for key '${key}':`, error);
            return key; // Return the key itself as fallback
        }
    }

    /**
     * Get the current direction text based on language mode
     */
    static getDirectionText(): string {
        return appState.languageMode === 'DE_BG'
            ? this.t('directions.de_to_bg')
            : this.t('directions.bg_to_de');
    }

    /**
     * Get the opposite direction text
     */
    static getOppositeDirectionText(): string {
        return appState.languageMode === 'DE_BG'
            ? this.t('directions.bg_to_de')
            : this.t('directions.de_to_bg');
    }

    /**
     * Register a listener for language changes
     * @param listener The function to call when language changes
     */
    static onLanguageChange(listener: LanguageChangeListener): void {
        languageChangeListeners.push(listener);
    }

    /**
     * Remove a language change listener
     * @param listener The function to remove
     */
    static offLanguageChange(listener: LanguageChangeListener): void {
        const index = languageChangeListeners.indexOf(listener);
        if (index !== -1) {
            languageChangeListeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners that the language has changed
     */
    static notifyLanguageChange(): void {
        for (const listener of languageChangeListeners) {
            try {
                listener(_currentLanguage);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        }
        this.notifyTranslationChange(); // Also notify about translation changes
    }

    /**
     * Get the current language code for HTML lang attribute
     */
    static getHtmlLang(): string {
        return _currentLanguage;
    }
}

// Initialize the service when the module is loaded
if (browser) {
    LocalizationService.init();
}

// Export a reactive version of the translation function
export function t(key: string, params?: Record<string, string>): string {
    return LocalizationService.t(key, params);
}

// Export a function to check loading state
export function isTranslationsLoading(): boolean {
    return _isLoading;
}

/**
 * Register a listener for translation changes
 * @param listener The function to call when translations change
 */
export function onTranslationsChange(listener: () => void): void {
    translationChangeListeners.push(listener);
}

/**
 * Remove a translation change listener
 * @param listener The function to remove
 */
export function offTranslationsChange(listener: () => void): void {
    const index = translationChangeListeners.indexOf(listener);
    if (index !== -1) {
        translationChangeListeners.splice(index, 1);
    }
}

// Export a reactive version of the current language
// Export a reactive version of the current language
export function getCurrentLanguage(): 'de' | 'bg' {
    return LocalizationService.getCurrentLanguage();
}