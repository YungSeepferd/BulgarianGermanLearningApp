/**
 * Vocabulary Data Loader - Simplified Version
 *
 * Single strategy: Fetch from static endpoint with localStorage cache
 * Optimized for static site deployment (GitHub Pages)
 */

import { base } from '$app/paths';
import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { DataError, ErrorHandler } from '$lib/services/errors';
import { z } from 'zod';

import {
  ResilientUnifiedVocabularyItemSchema,
  UnifiedVocabularyCollectionSchema,
  ResilientUnifiedVocabularyCollectionSchema,
  VocabularyCategorySchema
} from '../schemas/unified-vocabulary';

// ======================
// Configuration
// ======================

const CACHE_KEY = 'vocabulary-cache';
const CACHE_EXPIRY_HOURS = 24;
const DATA_URL = '/data/unified-vocabulary.linguistic-corrected.json';

// ======================
// Types
// ======================

export interface VocabularySearchParams {
  query?: string;
  partOfSpeech?: string;
  difficulty?: number;
  categories?: string[];
  limit?: number;
  offset?: number;
}

// ======================
// Main Loading Function
// ======================

/**
 * Load vocabulary data - single strategy with cache
 */
export async function loadVocabulary(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  // Try cache first (fastest)
  if (browser) {
    try {
      const cached = loadFromCache();
      if (cached) {
        Debug.log('loader', 'Loaded vocabulary from cache');
        return cached;
      }
    } catch (e) {
      Debug.log('loader', 'Cache miss or expired', { error: e });
    }
  }

  // Fetch from static endpoint
  const data = await loadFromNetwork();
  
  // Cache for next time
  if (browser) {
    saveToCache(data);
  }

  return data;
}

/**
 * Load vocabulary from network
 */
async function loadFromNetwork(): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    const response = await fetch(`${base}${DATA_URL}`);

    if (!response.ok) {
      throw new DataError(`HTTP error: ${response.status}`, { status: response.status });
    }

    const jsonData = await response.json();
    
    // Handle both array and object formats
    let items: unknown[] = [];
    if (Array.isArray(jsonData)) {
      items = jsonData;
    } else if (jsonData.items && Array.isArray(jsonData.items)) {
      items = jsonData.items;
    } else {
      throw new DataError('Invalid vocabulary data format');
    }

    // Parse and validate items using resilient schema
    const validatedItems = items
      .filter((item): item is Record<string, unknown> => 
        item !== null && typeof item === 'object' && 
        typeof (item as Record<string, unknown>)['german'] === 'string' && 
        typeof (item as Record<string, unknown>)['bulgarian'] === 'string'
      )
      .map((item) => {
        const record = item as Record<string, unknown>;
        return ResilientUnifiedVocabularyItemSchema.parse({
          id: (record['id'] as string) || `wv_${Math.random().toString(36).substr(2, 9)}`,
          german: String(record['german'] || ''),
          bulgarian: String(record['bulgarian'] || ''),
          partOfSpeech: (record['partOfSpeech'] as string) || 'noun',
          difficulty: Math.min(5, Math.max(1, parseInt(String(record['difficulty'])) || 1)),
          categories: Array.isArray(record['categories']) ? record['categories'] as string[] : [],
          examples: Array.isArray(record['examples']) ? record['examples'] as string[] : [],
          cefrLevel: (record['cefrLevel'] as string) || 'A1',
          createdAt: record['createdAt'] ? new Date(record['createdAt'] as string) : new Date(),
          updatedAt: record['updatedAt'] ? new Date(record['updatedAt'] as string) : new Date(),
          version: (record['version'] as number) || 1
        });
      });

    // Build collection
    const collection: z.infer<typeof UnifiedVocabularyCollectionSchema> = {
      id: crypto.randomUUID(),
      name: 'German-Bulgarian Vocabulary',
      description: `Vocabulary collection with ${validatedItems.length} items`,
      languagePair: 'de-bg',
      difficultyRange: [1, 5] as [number, number],
      categories: [...new Set(validatedItems.flatMap(item => item.categories || []))],
      itemCount: validatedItems.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      items: validatedItems
    };

    Debug.log('loader', 'Vocabulary loaded from network', { 
      items: validatedItems.length 
    });

    return collection;
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary');
    throw new DataError('Failed to load vocabulary', { error: typedError });
  }
}

// ======================
// Cache Functions
// ======================

interface CacheEntry {
  data: z.infer<typeof UnifiedVocabularyCollectionSchema>;
  timestamp: string;
}

/**
 * Load vocabulary from localStorage cache
 */
function loadFromCache(): z.infer<typeof UnifiedVocabularyCollectionSchema> | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);

    if (age > CACHE_EXPIRY_HOURS) {
      Debug.log('loader', 'Cache expired', { age: `${age.toFixed(1)}h` });
      return null;
    }

    return ResilientUnifiedVocabularyCollectionSchema.parse(entry.data);
  } catch {
    return null;
  }
}

/**
 * Save vocabulary to localStorage cache
 */
function saveToCache(data: z.infer<typeof UnifiedVocabularyCollectionSchema>): void {
  if (typeof localStorage === 'undefined') return;

  try {
    const entry: CacheEntry = {
      data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (e) {
    Debug.log('loader', 'Failed to save cache', { error: e });
  }
}

/**
 * Clear vocabulary cache
 */
export function clearVocabularyCache(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
    Debug.log('loader', 'Cache cleared');
  }
}

// ======================
// Search & Filter Functions
// ======================

/**
 * Load vocabulary by search parameters
 */
export async function loadVocabularyBySearch(
  params: VocabularySearchParams
): Promise<{ items: z.infer<typeof ResilientUnifiedVocabularyItemSchema>[]; total: number; hasMore: boolean }> {
  const collection = await loadVocabulary();
  let items = [...collection.items];

  // Apply filters
  if (params.query) {
    const query = params.query.toLowerCase();
    items = items.filter(item =>
      item.german.toLowerCase().includes(query) ||
      item.bulgarian.toLowerCase().includes(query)
    );
  }

  if (params.partOfSpeech) {
    items = items.filter(item => item.partOfSpeech === params.partOfSpeech);
  }

  if (params.difficulty) {
    items = items.filter(item => item.difficulty === params.difficulty);
  }

  if (params.categories && params.categories.length > 0) {
    items = items.filter(item =>
      item.categories.some(category => params.categories?.includes(category))
    );
  }

  const total = items.length;
  const limit = params.limit || 20;
  const offset = params.offset || 0;

  items = items.slice(offset, offset + limit);

  return { items, total, hasMore: offset + limit < total };
}

/**
 * Load vocabulary by ID
 */
export async function loadVocabularyById(
  id: string
): Promise<z.infer<typeof ResilientUnifiedVocabularyItemSchema> | null> {
  const collection = await loadVocabulary();
  return collection.items.find(item => item.id === id) || null;
}

/**
 * Load vocabulary by category
 */
export async function loadVocabularyByCategory(
  category: z.infer<typeof VocabularyCategorySchema>,
  options: { limit?: number; difficulty?: number } = {}
): Promise<z.infer<typeof ResilientUnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = collection.items.filter(item =>
    item.categories.includes(category)
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
): Promise<z.infer<typeof ResilientUnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = collection.items.filter(item =>
    item.difficulty === difficulty
  );

  if (options.category) {
    items = items.filter(item => item.categories.includes(options.category as never));
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
): Promise<z.infer<typeof ResilientUnifiedVocabularyItemSchema>[]> {
  const collection = await loadVocabulary();

  let items = [...collection.items];

  if (options.difficulty) {
    items = items.filter(item => item.difficulty === options.difficulty);
  }

  if (options.category) {
    items = items.filter(item => item.categories.includes(options.category as never));
  }

  // Shuffle and select random items
  const shuffled = items.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Update practice statistics for a vocabulary item
 */
export async function updateStats(
  itemId: string, 
  correct: boolean, 
  responseTime?: number
): Promise<void> {
  Debug.log('loader', 'Updating stats', { itemId, correct, responseTime });
  // For static site, stats are session-only (no backend)
  // Could extend to store in localStorage if needed
}

/**
 * Initialize vocabulary data (preload and cache)
 */
export async function initializeVocabulary(): Promise<void> {
  const vocabulary = await loadVocabulary();
  Debug.log('loader', 'Initialized', { items: vocabulary.itemCount });
}