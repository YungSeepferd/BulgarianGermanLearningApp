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

import { type VocabularySearchParams, type VocabularyItem } from '$lib/schemas/vocabulary';
import { loadVocabulary } from '$lib/data/loader';
import Fuse from 'fuse.js';

// Cache for vocabulary data to avoid repeated loading
let vocabularyCache: VocabularyItem[] | null = null;

/**
 * Load vocabulary data with caching
 */
async function getVocabularyData(): Promise<VocabularyItem[]> {
  if (vocabularyCache) {
    return vocabularyCache;
  }

  try {
    const collection = await loadVocabulary();
    vocabularyCache = collection.items;
    return vocabularyCache;
  } catch (error) {
    console.error('Failed to load vocabulary data:', error);
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
  items: VocabularyItem[];
  total: number;
  hasMore: boolean;
}> {
  // Load vocabulary data
  const vocabularyItems = await getVocabularyData();

  // Apply filters first to reduce the dataset for fuzzy search
  let filteredItems = applyFilters(vocabularyItems, params);

  // Apply fuzzy search if query is provided
  if (params.query) {
    filteredItems = applyFuzzySearch(filteredItems, params.query);
  }

  // Apply sorting
  filteredItems = applySorting(filteredItems, params);

  // Get total count before pagination
  const total = filteredItems.length;

  // Apply pagination
  const paginatedItems = applyPagination(filteredItems, params);

  return {
    items: paginatedItems,
    total,
    hasMore: params.offset + params.limit < total
  };
}

/**
 * Apply filters to vocabulary items based on search parameters
 */
function applyFilters(items: VocabularyItem[], params: VocabularySearchParams): VocabularyItem[] {
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
      ? item.categories.some(category => params.categories?.includes(category))
      : true;

    // Filter by learning phase
    const learningPhaseMatch = params.learningPhase !== undefined
      ? item.learningPhase === params.learningPhase
      : true;

    return partOfSpeechMatch && difficultyMatch && categoryMatch && learningPhaseMatch;
  });
}

/**
 * Apply fuzzy search using Fuse.js for relevance scoring
 */
function applyFuzzySearch(items: VocabularyItem[], query: string): VocabularyItem[] {
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
function applySorting(items: VocabularyItem[], params: VocabularySearchParams): VocabularyItem[] {
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
function applyPagination(items: VocabularyItem[], params: VocabularySearchParams): VocabularyItem[] {
  const startIndex = params.offset;
  const endIndex = params.offset + params.limit;
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
    if (item.transliteration && item.transliteration.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(item.transliteration);
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
}> {
  const vocabularyItems = await getVocabularyData();

  const partOfSpeech: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const learningPhase: Record<string, number> = {};

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
    learningPhase[item.learningPhase] = (learningPhase[item.learningPhase] || 0) + 1;
  });

  return {
    partOfSpeech,
    difficulty,
    categories,
    learningPhase
  };
}