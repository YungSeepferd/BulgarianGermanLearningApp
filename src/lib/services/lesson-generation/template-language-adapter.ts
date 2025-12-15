/**
 * Template Language Adapter
 *
 * This utility provides language-specific rendering for lesson templates,
 * allowing content to adapt based on the current language direction.
 */

import { appState } from '../../state/app-state';

/**
 * Get the source language text based on current direction
 * @param item The vocabulary item
 * @returns The text in the source language
 */
export function getSourceText(item: { german: string; bulgarian: string }): string {
    return appState.languageMode === 'DE_BG' ? item.german : item.bulgarian;
}

/**
 * Get the target language text based on current direction
 * @param item The vocabulary item
 * @returns The text in the target language
 */
export function getTargetText(item: { german: string; bulgarian: string }): string {
    return appState.languageMode === 'DE_BG' ? item.bulgarian : item.german;
}

/**
 * Get the source language code based on current direction
 * @returns The source language code ('de' or 'bg')
 */
export function getSourceLanguage(): string {
    return appState.languageMode === 'DE_BG' ? 'de' : 'bg';
}

/**
 * Get the target language code based on current direction
 * @returns The target language code ('de' or 'bg')
 */
export function getTargetLanguage(): string {
    return appState.languageMode === 'DE_BG' ? 'bg' : 'de';
}

/**
 * Get the source language name based on current direction
 * @returns The source language name ('German' or 'Bulgarian')
 */
export function getSourceLanguageName(): string {
    return appState.languageMode === 'DE_BG' ? 'German' : 'Bulgarian';
}

/**
 * Get the target language name based on current direction
 * @returns The target language name ('German' or 'Bulgarian')
 */
export function getTargetLanguageName(): string {
    return appState.languageMode === 'DE_BG' ? 'Bulgarian' : 'German';
}

/**
 * Get the direction arrow based on current direction
 * @returns The direction arrow ('→' or '←')
 */
export function getDirectionArrow(): string {
    return appState.languageMode === 'DE_BG' ? '→' : '←';
}

/**
 * Get the direction text based on current direction
 * @returns The direction text ('DE→BG' or 'BG→DE')
 */
export function getDirectionText(): string {
    return appState.languageMode === 'DE_BG' ? 'DE→BG' : 'BG→DE';
}

/**
 * Get the opposite direction text
 * @returns The opposite direction text ('DE→BG' or 'BG→DE')
 */
export function getOppositeDirectionText(): string {
    return appState.languageMode === 'DE_BG' ? 'BG→DE' : 'DE→BG';
}

/**
 * Get the language-specific property from an object
 * @param obj The object with language properties
 * @param property The base property name
 * @returns The value for the current source language
 */
export function getLanguageProperty(obj: any, property: string): string {
    if (!obj) return '';

    const sourceLang = getSourceLanguage();

    // Try direct property first (e.g., description.de)
    if (obj[`${property}.${sourceLang}`]) {
        return obj[`${property}.${sourceLang}`];
    }

    // Try nested property (e.g., description.german)
    if (obj[property] && obj[property][sourceLang]) {
        return obj[property][sourceLang];
    }

    // Try simple property (e.g., description)
    if (obj[property]) {
        return obj[property];
    }

    return '';
}

/**
 * Get the opposite language property from an object
 * @param obj The object with language properties
 * @param property The base property name
 * @returns The value for the current target language
 */
export function getOppositeLanguageProperty(obj: any, property: string): string {
    if (!obj) return '';

    const targetLang = getTargetLanguage();

    // Try direct property first (e.g., description.bg)
    if (obj[`${property}.${targetLang}`]) {
        return obj[`${property}.${targetLang}`];
    }

    // Try nested property (e.g., description.bulgarian)
    if (obj[property] && obj[property][targetLang]) {
        return obj[property][targetLang];
    }

    return '';
}

/**
 * Format a bilingual example
 * @param example The example object with german and bulgarian text
 * @returns Formatted example string
 */
export function formatBilingualExample(example: { german: string; bulgarian: string }): string {
    if (!example) return '';

    const sourceText = getSourceText(example);
    const targetText = getTargetText(example);

    return `- ${sourceText}\n- ${targetText}`;
}

/**
 * Get the appropriate template for the current language direction
 * @param templateDE The German template
 * @param templateBG The Bulgarian template
 * @returns The appropriate template based on current direction
 */
export function getDirectionalTemplate(templateDE: string, templateBG: string): string {
    return appState.languageMode === 'DE_BG' ? templateDE : templateBG;
}