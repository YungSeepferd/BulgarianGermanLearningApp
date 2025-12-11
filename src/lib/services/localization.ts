/**
 * Localization Service for bilingual support
 *
 * This service provides translation functionality for the application,
 * supporting both German and Bulgarian languages.
 */

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
}

// Current language state
let _currentLanguage: 'de' | 'bg' = 'de';
let translations: Translations = {} as Translations;

// Event system for language changes
type LanguageChangeListener = (language: 'de' | 'bg') => void;
const languageChangeListeners: LanguageChangeListener[] = [];

/**
 * LocalizationService class for handling translations and language changes
 */
export class LocalizationService {
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
        try {
            const lang = _currentLanguage;
            const response = await fetch(`/translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to German if loading fails
            _currentLanguage = 'de';
            try {
                const response = await fetch('/translations/de.json');
                if (response.ok) {
                    translations = await response.json();
                }
            } catch (fallbackError) {
                console.error('Failed to load fallback translations:', fallbackError);
            }
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

// Export a reactive version of the current language
// Export a reactive version of the current language
export function getCurrentLanguage(): 'de' | 'bg' {
    return LocalizationService.getCurrentLanguage();
}