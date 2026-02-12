/**
 * Search Service - Enhanced Vocabulary Search Functionality
 *
 * Provides advanced search capabilities for vocabulary items including:
 * - Fuzzy search with relevance scoring using pre-computed index
 * - Comprehensive filtering by metadata
 * - Pagination support
 * - Weighted relevance ranking
 * - Search result caching for performance
 *
 * Uses Fuse.js for fuzzy matching and implements custom filtering logic.
 */

import { type VocabularySearchParams } from '$lib/schemas/vocabulary';
import type { UnifiedVocabularyItem, VocabularyCategory } from '$lib/schemas/unified-vocabulary';
import { vocabularyRepository } from '$lib/data/vocabulary-repository.svelte';

// Search cache with TTL (5 minutes)
interface CacheEntry {
  results: UnifiedVocabularyItem[];
  timestamp: number;
  query: string;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from search params
 */
function getCacheKey(params: VocabularySearchParams): string {
  return JSON.stringify({
    q: params.query?.toLowerCase().trim(),
    pos: params.partOfSpeech,
    diff: params.difficulty,
    cats: params.categories?.sort(),
    phase: params.learningPhase
  });
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Clear expired cache entries
 */
function cleanCache(): void {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}

/**
 * Search vocabulary with advanced filtering and fuzzy matching
 * Uses pre-computed search index for fast results without loading all vocabulary
 *
 * @param params Search parameters including query, filters, and pagination
 * @returns Search results with pagination metadata
 */
export async function searchVocabulary(params: VocabularySearchParams): Promise<{
  items: UnifiedVocabularyItem[];
  total: number;
  hasMore: boolean;
}> {
  const safeOffset = Number.isFinite(params.offset) ? Number(params.offset) : 0;
  const safeLimit = Number.isFinite(params.limit) && params.limit && params.limit > 0
    ? Number(params.limit)
    : 20;

  // Check cache first
  const cacheKey = getCacheKey(params);
  const cached = searchCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    // Return cached results with pagination
    const total = cached.results.length;
    const paginatedItems = applyPagination(cached.results, safeOffset, safeLimit);
    return {
      items: paginatedItems,
      total,
      hasMore: safeOffset + safeLimit < total
    };
  }

  // Ensure repository is initialized (loads only index + A1)
  if (!vocabularyRepository.loaded) {
    await vocabularyRepository.initialize();
  }

  let filteredItems: UnifiedVocabularyItem[];

  // Use pre-computed index for search if query provided
  if (params.query?.trim()) {
    // Search using repository (uses pre-computed index)
    const searchResults = await vocabularyRepository.search(params.query, {
      limit: 1000, // Get more for filtering
      loadFullItems: true
    });
    filteredItems = searchResults
      .map(r => r.item)
      .filter((item): item is UnifiedVocabularyItem => item !== undefined);
  } else {
    // No query - use all loaded items (A1 initially, more if loaded)
    filteredItems = vocabularyRepository.getAll();
  }

  // Apply filters
  filteredItems = applyFilters(filteredItems, params);

  // Apply sorting
  filteredItems = applySorting(filteredItems, params);

  // Cache the filtered results
  searchCache.set(cacheKey, {
    results: filteredItems,
    timestamp: Date.now(),
    query: params.query || ''
  });

  // Clean old cache entries periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanCache();
  }

  // Get total count before pagination
  const total = filteredItems.length;

  // Apply pagination
  const paginatedItems = applyPagination(filteredItems, safeOffset, safeLimit);

  return {
    items: paginatedItems,
    total,
    hasMore: safeOffset + safeLimit < total
  };
}

/**
 * Apply filters to vocabulary items based on search parameters
 */
function applyFilters(items: UnifiedVocabularyItem[], params: VocabularySearchParams): UnifiedVocabularyItem[] {
  return items.filter(item => {
    // Filter by part of speech
    const partOfSpeechMatch = params.partOfSpeech
      ? item.partOfSpeech === params.partOfSpeech
      : true;

    // Filter by difficulty
    const difficultyMatch = params.difficulty
      ? item.difficulty === params.difficulty
      : true;

    // Filter by categories
    const categoryMatch = params.categories && params.categories.length > 0
      ? item.categories.some((category: VocabularyCategory) => params.categories?.includes(category))
      : true;

    // Filter by learning phase (from metadata if available)
    const learningPhaseMatch = params.learningPhase !== undefined
      ? (item.metadata?.learningPhase ?? 0) === params.learningPhase
      : true;

    return partOfSpeechMatch && difficultyMatch && categoryMatch && learningPhaseMatch;
  });
}

/**
 * Quick search using pre-computed index (no loading required)
 * Returns results from already loaded data
 * This is the most efficient search for autocomplete/quick lookups
 */
export async function quickSearch(
  query: string,
  options: { limit?: number; loadFullItems?: boolean } = {}
): Promise<{ items: UnifiedVocabularyItem[]; total: number }> {
  const limit = options.limit ?? 20;

  // Ensure repository is initialized
  if (!vocabularyRepository.loaded) {
    await vocabularyRepository.initialize();
  }

  // Use repository's search which uses pre-computed index
  const results = await vocabularyRepository.search(query, {
    limit,
    loadFullItems: options.loadFullItems ?? true
  });

  return {
    items: results.map(r => r.item!).filter(Boolean),
    total: results.length
  };
}

// Note: applyFuzzySearch has been removed as search now uses the pre-computed
// index directly in searchVocabulary(). The repository's search() method handles
// fuzzy matching using the Fuse.js index without loading all vocabulary.

/**
 * Apply sorting to the filtered items
 */
function applySorting(items: UnifiedVocabularyItem[], params: VocabularySearchParams): UnifiedVocabularyItem[] {
  return [...items].sort((a, b) => {
    // Handle different sort fields
    switch (params.sortBy) {
      case 'german':
        return params.sortOrder === 'asc'
          ? a.german.localeCompare(b.german)
          : b.german.localeCompare(a.german);
      case 'bulgarian':
        return params.sortOrder === 'asc'
          ? a.bulgarian.localeCompare(b.bulgarian)
          : b.bulgarian.localeCompare(a.bulgarian);
      case 'difficulty':
        return params.sortOrder === 'asc'
          ? a.difficulty - b.difficulty
          : b.difficulty - a.difficulty;
      case 'createdAt':
        return params.sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0; // No sorting
    }
  });
}

/**
 * Apply pagination to the filtered and sorted items
 */
function applyPagination(items: UnifiedVocabularyItem[], offset: number, limit: number): UnifiedVocabularyItem[] {
  const startIndex = offset;
  const endIndex = offset + limit;
  return items.slice(startIndex, endIndex);
}

/**
 * Clear the vocabulary cache (useful when data is updated)
 */
export function clearVocabularyCache(): void {
  vocabularyRepository.invalidate();
}

/**
 * Get search suggestions for autocomplete functionality
 * Uses pre-computed index for fast prefix matching
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmedQuery = query.trim().toLowerCase();

  // Ensure repository is initialized
  if (!vocabularyRepository.loaded) {
    await vocabularyRepository.initialize();
  }

  // Use quick search with small limit to get matching items
  const { items } = await quickSearch(trimmedQuery, { limit: limit * 2 });

  const suggestions = new Set<string>();

  items.forEach(item => {
    // Add exact matches or prefix matches
    if (item.german.toLowerCase().startsWith(trimmedQuery)) {
      suggestions.add(item.german);
    }
    if (item.bulgarian.toLowerCase().startsWith(trimmedQuery)) {
      suggestions.add(item.bulgarian);
    }
    // Add transliteration if available
    if (item.transliteration?.bulgarian?.toLowerCase().startsWith(trimmedQuery)) {
      suggestions.add(item.transliteration.bulgarian);
    }
    if (item.transliteration?.german?.toLowerCase().startsWith(trimmedQuery)) {
      suggestions.add(item.transliteration.german);
    }
  });

  // Convert to array and limit results
  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get vocabulary statistics for search filters
 * Uses lightweight index data instead of loading full vocabulary
 */
export async function getVocabularyStats(): Promise<{
  partOfSpeech: Record<string, number>;
  difficulty: Record<string, number>;
  categories: Record<string, number>;
  totalCount: number;
}> {
  // Ensure repository is initialized (only loads index)
  if (!vocabularyRepository.loaded) {
    await vocabularyRepository.initialize();
  }

  // Use index items for stats (lightweight - only metadata)
  const indexItems = vocabularyRepository.getAllIndexItems();

  const partOfSpeech: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const categories: Record<string, number> = {};

  indexItems.forEach(item => {
    // Count by part of speech
    partOfSpeech[item.partOfSpeech] = (partOfSpeech[item.partOfSpeech] || 0) + 1;

    // Count by difficulty
    difficulty[item.difficulty] = (difficulty[item.difficulty] || 0) + 1;

    // Count by category
    item.categories.forEach(category => {
      categories[category] = (categories[category] || 0) + 1;
    });
  });

  return {
    partOfSpeech,
    difficulty,
    categories,
    totalCount: indexItems.length
  };
}