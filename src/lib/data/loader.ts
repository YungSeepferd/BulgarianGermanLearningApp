/**
 * Vocabulary Data Loader
 *
 * Handles loading, caching, and validation of vocabulary data
 * Supports both server-side and client-side loading patterns
 */

import { DataLoader } from './DataLoader.svelte';

import { UnifiedVocabularyItemSchema, UnifiedVocabularyCollectionSchema } from '../schemas/unified-vocabulary';
import { z } from 'zod';

// Cache configuration
const CACHE_KEY = 'vocabulary-cache';
const CACHE_EXPIRY_HOURS = 24;

/**
 * Load vocabulary data from various sources with fallback mechanism
 */
export async function loadVocabulary(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    // Try to load from static endpoint first (fastest)
    return await loadFromStaticEndpoint();
  } catch (error) {
    console.warn('Failed to load from static endpoint, trying cache:', error instanceof Error ? error.message : String(error));
    try {
      // Fallback to cache
      return await loadFromCache();
    } catch (cacheError) {
      console.warn('Failed to load from cache, trying bundled data:', cacheError instanceof Error ? cacheError.message : String(cacheError));
      try {
        // Final fallback to bundled data
        return await loadBundledData();
      } catch (bundledError) {
        console.error('All loading methods failed:', bundledError instanceof Error ? bundledError.message : String(bundledError));
        throw new Error('Failed to load vocabulary data from all sources');
      }
    }
  }
}

/**
 * Load vocabulary from static endpoint
 */
async function loadFromStaticEndpoint(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  // In Node.js environment (tests, scripts), load directly from the source file
  // In browser environment, fetch from static endpoint
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node.js environment - read file directly
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = path.join(__dirname, 'unified-vocabulary.json');

    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    return UnifiedVocabularyCollectionSchema.parse(jsonData);
  } else {
    // Browser environment - fetch from static endpoint
    const response = await fetch('/data/vocabulary-unified.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return UnifiedVocabularyCollectionSchema.parse(data);
  }
}

/**
 * Load vocabulary from localStorage cache
 */
async function loadFromCache(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  // In Node.js environment, skip cache
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    throw new Error('Cache not available in Node.js environment');
  }

  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage not available');
  }

  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData) {
    throw new Error('No cached vocabulary data found');
  }

  const { data, timestamp } = JSON.parse(cachedData);

  // Check if cache is expired
  const now = new Date();
  const cacheDate = new Date(timestamp);
  const hoursDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > CACHE_EXPIRY_HOURS) {
    throw new Error('Cache expired');
  }

  return UnifiedVocabularyCollectionSchema.parse(data);
}

/**
 * Load bundled vocabulary data (fallback)
 * Handles both browser and Node.js environments
 */
async function loadBundledData(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  // In Node.js environment, load directly from the source file
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = path.join(__dirname, 'unified-vocabulary.json');

    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    return UnifiedVocabularyCollectionSchema.parse(jsonData);
  }

  // Browser environment - use fetch API
  let data: any = [];
  try {
    const response = await fetch('/data/vocabulary-unified.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data = await response.json();
  } catch (fetchError) {
    console.error('Failed to fetch vocabulary data:', fetchError);
    // Final fallback to empty array
    data = [];
  }

  // Create a collection from the bundled items
  const collection = {
    id: crypto.randomUUID(),
    name: 'German-Bulgarian Vocabulary Collection (Bundled)',
    description: 'Fallback vocabulary collection from bundled data',
    items: z.array(UnifiedVocabularyItemSchema).parse(data),
    languagePair: 'de-bg' as const,
    difficultyRange: [1, 5] as [number, number],
    categories: Array.from(new Set(data.flatMap((item: any) => item.categories || []))),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return UnifiedVocabularyCollectionSchema.parse(collection);
}

/**
 * Cache vocabulary data in localStorage
 */
export function cacheVocabulary(data: z.infer<typeof UnifiedVocabularyCollectionSchema>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const cacheData = {
    data,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}


/**
 * Load vocabulary by ID
 */
export async function loadVocabularyById(id: string): Promise<z.infer<typeof UnifiedVocabularyItemSchema> | null> {
  const collection = await loadVocabulary();
  return collection.items.find(item => item.id === id) || null;
}

/**
 * Load vocabulary by category
 */
export async function loadVocabularyByCategory(
  category: string,
  options: { limit?: number; difficulty?: number } = {}
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = collection.items.filter(item =>
    item.categories.includes(category as any)
  );

  if (options.difficulty) {
    items = items.filter(item => item.difficulty === options.difficulty);
  }

  if (options.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

/**
 * Load vocabulary by difficulty level
 */
export async function loadVocabularyByDifficulty(
  difficulty: number,
  options: { limit?: number; category?: string } = {}
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = collection.items.filter(item =>
    item.difficulty === difficulty
  );

  if (options.category) {
    items = items.filter(item => item.categories.includes(options.category as any));
  }

  if (options.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

/**
 * Get random vocabulary items
 */
export async function getRandomVocabulary(
  count: number = 5,
  options: { difficulty?: number; category?: string } = {}
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = [...collection.items];

  if (options.difficulty) {
    items = items.filter((item: z.infer<typeof VocabularyItemSchema>) => item.difficulty === options.difficulty);
  }

  if (options.category) {
    items = items.filter((item: z.infer<typeof VocabularyItemSchema>) => item.categories.includes(options.category as any));
  }

  // Shuffle and select random items
  const shuffled = items.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Initialize vocabulary data (should be called during app startup)
 */
export async function initializeVocabulary(): Promise<void> {
  try {
    // Load and cache vocabulary data
    const vocabulary = await loadVocabulary();
    cacheVocabulary(vocabulary);
    console.log('Vocabulary data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize vocabulary data:', error);
    throw error;
  }
}