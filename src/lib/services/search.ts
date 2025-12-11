/**
 * Search Service - Enhanced Vocabulary Search Functionality
 *
 * Provides advanced search capabilities for vocabulary items including:
 * - Fuzzy search with relevance scoring
 * - Comprehensive filtering by metadata
 * - Pagination support
 * - Weighted relevance ranking
 *
 * Uses Fuse.js for fuzzy matching and implements custom filtering logic.
 */

import { type VocabularySearchParams } from '$lib/schemas/vocabulary';
import type { UnifiedVocabularyItem, VocabularyCategory, VocabularyMetadata } from '$lib/schemas/unified-vocabulary';
import { UnifiedVocabularyItemSchema } from '$lib/schemas/unified-vocabulary';
import { loadVocabulary } from '$lib/data/loader';
import { z } from 'zod';
import Fuse from 'fuse.js';

// Cache for vocabulary data to avoid repeated loading
let vocabularyCache: UnifiedVocabularyItem[] | null = null;

/**
 * Load vocabulary data with caching
 */
async function getVocabularyData(): Promise<UnifiedVocabularyItem[]> {
  if (vocabularyCache) {
    return vocabularyCache;
  }

  try {
    const collection = await loadVocabulary();
    // Ensure all items have required properties
    vocabularyCache = collection.items.map(item => {
      const metadata = item.metadata || {};
      return {
        ...item,
        metadata: {
          ...metadata,
          isCommon: (metadata as VocabularyMetadata).isCommon ?? false,
          isVerified: (metadata as VocabularyMetadata).isVerified ?? false,
          learningPhase: (metadata as VocabularyMetadata).learningPhase ?? 0
        }
      };
    });
    return vocabularyCache;
  } catch (_error) {
    // Failed to load vocabulary data
    return [];
  }
}

/**
 * Search vocabulary with advanced filtering and fuzzy matching
 *
 * @param params Search parameters including query, filters, and pagination
 * @returns Search results with pagination metadata
 */
export async function searchVocabulary(params: VocabularySearchParams): Promise<{
  items: UnifiedVocabularyItem[];
  total: number;
  hasMore: boolean;
}> {
  // Load vocabulary data
  const vocabularyItems = await getVocabularyData();

  const safeOffset = Number.isFinite(params.offset) ? Number(params.offset) : 0;
  const safeLimit = Number.isFinite(params.limit) && params.limit && params.limit > 0
    ? Number(params.limit)
    : 20;

  // Apply filters first to reduce the dataset for fuzzy search
  let filteredItems: z.infer<typeof UnifiedVocabularyItemSchema>[] = applyFilters(vocabularyItems, params);

  // Apply fuzzy search if query is provided
  if (params.query) {
    filteredItems = applyFuzzySearch(filteredItems, params.query) as z.infer<typeof UnifiedVocabularyItemSchema>[];
  }

  // Apply sorting
  filteredItems = applySorting(filteredItems, params);

  // Get total count before pagination
  const total = filteredItems.length;

  // Apply pagination
  const paginatedItems = applyPagination(filteredItems, safeOffset, safeLimit) as z.infer<typeof UnifiedVocabularyItemSchema>[];

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

    // Filter by learning phase
    const learningPhaseMatch = params.learningPhase !== undefined
      ? (item.metadata?.learningPhase ?? 0) === params.learningPhase
      : true;

    return partOfSpeechMatch && difficultyMatch && categoryMatch && learningPhaseMatch;
  });
}

/**
 * Apply fuzzy search using Fuse.js for relevance scoring
 */
function applyFuzzySearch(items: UnifiedVocabularyItem[], query: string): UnifiedVocabularyItem[] {
  // Configure Fuse.js for optimal search results
  const fuse = new Fuse(items, {
    keys: [
      { name: 'german', weight: 0.4 },
      { name: 'bulgarian', weight: 0.4 },
      { name: 'transliteration', weight: 0.3 },
      { name: 'categories', weight: 0.2 },
      { name: 'metadata.examples.german', weight: 0.1 },
      { name: 'metadata.examples.bulgarian', weight: 0.1 },
      { name: 'metadata.notes', weight: 0.1 },
      { name: 'metadata.mnemonic', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4, // Adjust for more/less fuzzy matching
    minMatchCharLength: 2,
    shouldSort: true,
    ignoreLocation: true
  });

  // Perform the search
  const results = fuse.search(query);

  // Return items sorted by relevance score
  return results.map(result => result.item);
}

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
  vocabularyCache = null;
}

/**
 * Get search suggestions for autocomplete functionality
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query) return [];

  const vocabularyItems = await getVocabularyData();

  // Simple prefix matching for suggestions
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  vocabularyItems.forEach(item => {
    if (item.german.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(item.german);
    }
    if (item.bulgarian.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(item.bulgarian);
    }
    if (item.transliteration && typeof item.transliteration === 'string') {
      if (item.transliteration.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(item.transliteration);
      }
    } else if (item.transliteration && typeof item.transliteration === 'object' && item.transliteration !== null) {
      const translit = item.transliteration as { german?: string; bulgarian?: string };
      if (translit.german && typeof translit.german === 'string' && translit.german.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(translit.german);
      }
      if (translit.bulgarian && typeof translit.bulgarian === 'string' && translit.bulgarian.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(translit.bulgarian);
      }
    }
  });

  // Convert to array and limit results
  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get vocabulary statistics for search filters
 */
export async function getVocabularyStats(): Promise<{
  partOfSpeech: Record<string, number>;
  difficulty: Record<string, number>;
  categories: Record<string, number>;
  learningPhase: Record<string, number>;
  isCommon: Record<string, number>;
  isVerified: Record<string, number>;
}> {
  const vocabularyItems = await getVocabularyData();

  const partOfSpeech: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const learningPhase: Record<string, number> = {};
  const isCommon: Record<string, number> = {};
  const isVerified: Record<string, number> = {};

  vocabularyItems.forEach(item => {
    // Count by part of speech
    partOfSpeech[item.partOfSpeech] = (partOfSpeech[item.partOfSpeech] || 0) + 1;

    // Count by difficulty
    difficulty[item.difficulty] = (difficulty[item.difficulty] || 0) + 1;

    // Count by category
    item.categories.forEach(category => {
      categories[category] = (categories[category] || 0) + 1;
    });

    // Count by learning phase
    const phase = item.metadata?.learningPhase ?? 0;
    learningPhase[phase] = (learningPhase[phase] || 0) + 1;

    // Count by common status
    const commonStatus = String(item.metadata?.isCommon ?? false);
    isCommon[commonStatus] = (isCommon[commonStatus] || 0) + 1;

    // Count by verified status
    const verifiedStatus = String(item.metadata?.isVerified ?? false);
    isVerified[verifiedStatus] = (isVerified[verifiedStatus] || 0) + 1;
  });

  return {
    partOfSpeech,
    difficulty,
    categories,
    learningPhase,
    isCommon,
    isVerified
  };
}