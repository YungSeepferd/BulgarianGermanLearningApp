/**
 * Vocabulary test helpers
 *
 * Reusable utilities for vocabulary-related testing
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Sample vocabulary items for testing
 * These match the app's vocabulary structure
 */
export const SAMPLE_VOCABULARY = {
  german: {
    simple: 'Hallo',
    withArticle: 'der Apfel',
    withUmlaut: 'grün',
    withEsset: 'Straße',
    long: 'Wissenschaftlichkeit'
  },
  bulgarian: {
    simple: 'здравей',
    withArticle: 'ябълката',
    cyrillicOnly: 'училище'
  },
  ceftLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,
  partsOfSpeech: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'] as const,
  categories: [
    'food', 'family', 'travel', 'work', 'education', 'health',
    'nature', 'technology', 'sports', 'culture', 'common_phrases',
    'time', 'numbers', 'colors', 'body', 'house', 'grammar'
  ] as const
};

/**
 * Valid CEFR levels
 */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/**
 * Valid parts of speech
 */
export const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 'pronoun',
  'preposition', 'conjunction', 'interjection', 'phrase', 'numeral'
] as const;

/**
 * Valid vocabulary categories
 */
export const VOCABULARY_CATEGORIES = [
  'food', 'family', 'travel', 'work', 'education', 'health',
  'nature', 'technology', 'sports', 'culture', 'common_phrases',
  'time', 'numbers', 'colors', 'body', 'house', 'grammar',
  'verbs', 'adjectives', 'clothing', 'weather', 'emotions',
  'transportation', 'animals', 'music', 'art', 'politics',
  'economics', 'science', 'geography', 'history', 'religion',
  'relationships', 'holidays', 'food_and_drink', 'materials'
] as const;

/**
 * German special characters that should be handled correctly
 */
export const GERMAN_SPECIAL_CHARS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

/**
 * Bulgarian Cyrillic characters (subset for validation)
 */
export const BULGARIAN_CHARS = 'абвгдежзийклмнопрстуфхцчшщъьюя';

/**
 * Russian-specific characters that should NOT appear in Bulgarian text
 */
export const RUSSIAN_ONLY_CHARS = ['ы', 'э', 'ё', 'Ё'];

/**
 * Search for vocabulary in the browser
 */
export async function searchVocabulary(page: Page, searchTerm: string): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"]');
  await searchInput.fill(searchTerm);
  // Wait for results to update
  await page.waitForTimeout(300);
}

/**
 * Clear the search input
 */
export async function clearSearch(page: Page): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"]');
  await searchInput.clear();
  await page.waitForTimeout(300);
}

/**
 * Select a CEFR level filter
 */
export async function selectCefrFilter(page: Page, level: string): Promise<void> {
  // Click the difficulty/level filter
  const filterButton = page.locator('button:has-text("Schwierigkeit"), button:has-text("Ниво")').first();
  await filterButton.click();

  // Select the level
  const levelOption = page.locator(`button:has-text("${level}"), label:has-text("${level}")`).first();
  await levelOption.click();
}

/**
 * Select a category filter
 */
export async function selectCategoryFilter(page: Page, category: string): Promise<void> {
  const filterButton = page.locator('button:has-text("Kategorie"), button:has-text("Категория")').first();
  await filterButton.click();

  const categoryOption = page.locator(`button:has-text("${category}"), label:has-text("${category}")`).first();
  await categoryOption.click();
}

/**
 * Get the count of visible vocabulary items
 */
export async function getVocabularyCount(page: Page): Promise<number> {
  const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
  return await items.count();
}

/**
 * Click on a vocabulary item to view details
 */
export async function clickVocabularyItem(page: Page, index: number = 0): Promise<void> {
  const items = page.locator('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]');
  await items.nth(index).click();
}

/**
 * Verify a vocabulary item has required fields displayed
 */
export async function verifyVocabularyItemDetails(page: Page): Promise<void> {
  // Check that German word is visible
  await expect(page.locator('.german-word, [data-german]')).toBeVisible();

  // Check that Bulgarian translation is visible
  await expect(page.locator('.bulgarian-word, [data-bulgarian]')).toBeVisible();
}

/**
 * Check if text contains only valid German characters
 */
export function isValidGermanText(text: string): boolean {
  // German text can contain: a-z, A-Z, ä, ö, ü, ß, Ä, Ö, Ü, spaces, hyphens
  const germanPattern = /^[a-zA-ZäöüßÄÖÜ\s\-.,!?'"()0-9]+$/;
  return germanPattern.test(text);
}

/**
 * Check if text contains only valid Bulgarian Cyrillic characters
 */
export function isValidBulgarianText(text: string): boolean {
  // Bulgarian Cyrillic: абвгдежзийклмнопрстуфхцчшщъьюя
  // Plus common punctuation and spaces
  const bulgarianPattern = /^[абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s\-.,!?'"()0-9]+$/;
  return bulgarianPattern.test(text);
}

/**
 * Check for Russian-specific characters that shouldn't be in Bulgarian
 */
export function containsRussianOnlyChars(text: string): boolean {
  return RUSSIAN_ONLY_CHARS.some(char => text.includes(char));
}

/**
 * Generate a random vocabulary search term
 */
export function getRandomSearchTerm(): string {
  const terms = [
    'Haus', 'Wasser', 'Kind', 'gut', 'essen',
    'училище', 'къща', 'вода', 'добър', 'ден'
  ];
  return terms[Math.floor(Math.random() * terms.length)];
}

/**
 * Wait for vocabulary list to load
 */
export async function waitForVocabularyLoad(page: Page): Promise<void> {
  // Wait for loading indicator to disappear
  const loadingIndicator = page.locator('.loading, [data-loading="true"]');
  const isLoading = await loadingIndicator.count() > 0;

  if (isLoading) {
    await loadingIndicator.waitFor({ state: 'detached', timeout: 10000 });
  }

  // Wait for at least one item to appear
  await page.waitForSelector('.vocabulary-item, .vocabulary-card, [data-testid="vocabulary-item"]', {
    timeout: 10000,
    state: 'visible'
  }).catch(() => {
    // It's okay if no items are found - empty state
  });
}

/**
 * Type Bulgarian text using Cyrillic input
 */
export async function typeBulgarianText(page: Page, locator: Locator, text: string): Promise<void> {
  await locator.click();
  await locator.fill(text);
}